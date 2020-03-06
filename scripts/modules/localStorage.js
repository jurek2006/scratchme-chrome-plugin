// stores data object in local storage - returns true if successfully
export const save = (keyInLocalStorage, dataToSaveObject) => {
  try {
    localStorage.setItem(keyInLocalStorage, JSON.stringify(dataToSaveObject));
    return true;
  } catch (error) {
    console.log(`Failed to save data in localStorage`, error);
    return false;
  }
};

// restores data object from local storage (for given keyInLocalStorage)
export const read = keyInLocalStorage => {
  try {
    const retrievedObject = localStorage.getItem(keyInLocalStorage);
    return JSON.parse(retrievedObject);
  } catch (error) {
    console.log(`Failed to read data from localStorage`, error);
    return false;
  }
};

export default { save, read };
