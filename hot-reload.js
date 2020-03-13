const filesInDirectory = dir =>
  new Promise(resolve =>
    dir.createReader().readEntries(entries =>
      Promise.all(
        entries
          .filter(e => e.name[0] !== '.')
          .map(e =>
            e.isDirectory
              ? filesInDirectory(e)
              : new Promise(resolve => e.file(resolve))
          )
      )
        .then(files => [].concat(...files))
        .then(resolve)
    )
  );

const timestampForFilesInDirectory = dir =>
  filesInDirectory(dir).then(files =>
    files.map(f => f.name + f.lastModifiedDate).join()
  );

// reloads all chrome tabs with facebook host
// if current window is popup - closes it and then reloads tabs
const reload = () => {
  console.log('reload');
  chrome.tabs.query({ url: '*://*.linkedin.com/*' }, tabs => {
    chrome.windows.getCurrent(currentWindow => {
      if (currentWindow.type === 'popup') {
        // if current window is popup - close it
        chrome.windows.remove(currentWindow.id, function() {
          reload(); // invoke reloading again when popup closed
        });
      } else {
        tabs.forEach(tab => {
          console.log('reload linkedin tab', tab.url);
          chrome.tabs.reload(tab.id);
        });
        chrome.runtime.reload();
      }
    });
  });
};

const watchChanges = (dir, lastTimestamp) => {
  timestampForFilesInDirectory(dir).then(timestamp => {
    if (!lastTimestamp || lastTimestamp === timestamp) {
      setTimeout(() => watchChanges(dir, timestamp), 1000); // retry after 1s
    } else {
      reload();
    }
  });
};

chrome.management.getSelf(self => {
  if (self.installType === 'development') {
    chrome.runtime.getPackageDirectoryEntry(dir => watchChanges(dir));
  }
});
