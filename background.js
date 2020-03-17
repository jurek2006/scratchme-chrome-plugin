chrome.runtime.onMessage.addListener((req, sender) => {
  if (req.isClickedButton) {
    chrome.browserAction.setBadgeText({ text: 'New' });

    chrome.windows.create({
      url: chrome.extension.getURL('popup-form.html'),
      type: 'popup',
      top: 10,
      left: 10,
      width: 435,
      height: 700
    });

    setTimeout(() => {
      chrome.browserAction.setBadgeText({ text: '' });
    }, 5000);

    const { name, company, position, url } = req;

    chrome.storage.sync.set(
      {
        postData: {
          name,
          company,
          position,
          url
        }
      },
      () => {
        console.log('Data was saved to local.sync');
      }
    );
  }
});
