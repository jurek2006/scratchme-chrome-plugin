// get data from local storage for given storageKey
// returns promise
const get = storageKey => {
  return new Promise(resolve => {
    chrome.storage.sync.get(storageKey, storage => {
      resolve(storage[storageKey[0]]);
    });
  });
};

export default { get };
