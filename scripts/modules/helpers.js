// disables/enables inputElement if is defined
export const disableInput = (inputElement, isDisabled) => {
  if (inputElement) {
    inputElement.disabled = isDisabled;
  }
};

// shows and hides passed messageElement after defined time
// toggles messageElement success and error classes due to passed successOrError
export const showItemMessage = (
  messageElem,
  text,
  successOrError = null,
  itemCustomClassName = null
) => {
  // improved toggling between success and error
  if (successOrError === 'success') {
    messageElem.classList.add('success-message');
    messageElem.classList.remove('error-message');
  } else if (successOrError === 'error') {
    messageElem.classList.remove('success-message');
    messageElem.classList.add('error-message');
  }

  // optional adding custom class to the element
  if (itemCustomClassName) {
    messageElem.classList.add(itemCustomClassName);
  }
  messageElem.innerHTML = text;

  // Show message
  messageElem.style.display = 'block';
  messageElem.style.visibility = 'visible';

  setTimeout(() => {
    messageElem.innerHTML = '';
    messageElem.style.display = 'none';
    messageElem.style.visibility = 'hidden';
  }, 5000);
};

export const hasError = field => {
  // Don't validate submits, buttons, file and reset inputs, and disabled fields
  if (
    field.disabled ||
    field.type === 'file' ||
    field.type === 'reset' ||
    field.type === 'submit' ||
    field.type === 'button'
  )
    return;

  const validity = field.validity;

  if (validity.valid) return;

  // If field is required and empty
  if (validity.valueMissing) return 'Please fill out this field.';

  // If not the right type
  if (validity.typeMismatch) {
    if (field.type === 'email') return 'Please enter an email address.';
    if (field.type === 'url') return 'Please enter a URL.';
  }

  // If too short
  if (validity.tooShort)
    return (
      'Please lengthen this text to ' +
      field.getAttribute('minLength') +
      ' characters or more. You are currently using ' +
      field.value.length +
      ' characters.'
    );

  // If too long
  if (validity.tooLong)
    return (
      'Please shorten this text to no more than ' +
      field.getAttribute('maxLength') +
      ' characters. You are currently using ' +
      field.value.length +
      ' characters.'
    );

  // If number input isn't a number
  if (validity.badInput) return 'Please enter a number.';

  // If pattern doesn't match
  if (validity.patternMismatch) {
    // If pattern info is included, return custom error
    if (field.hasAttribute('title')) return field.getAttribute('title');

    // Otherwise, generic error
    return 'Please match the requested format.';
  }

  // If all else fails, return a generic catchall error
  return 'The value you entered for this field is invalid.';
};

// Validates and checks that form fields in formItem are correct. Return the first field with an error.
// marks fields with error
export const isTheFormIncorrect = formItem => {
  // formItem can be form or fieldset element

  // Validate each field
  // Store the first field with an error to a variable so we can bring it into focus later

  const fields = formItem.elements;
  let error, hasErrors;

  for (let i = 0; i < fields.length; i++) {
    error = hasError(fields[i]);
    if (error) {
      showError(fields[i], error);
      if (!hasErrors) {
        hasErrors = fields[i];
      }
    } else {
      removeError(fields[i]);
    }
  }

  return hasErrors;
};

export const getMessageElement = (id, targetElem, isErrorMessage = false) => {
  let messageElem = targetElem.form.querySelector(
    (isErrorMessage
      ? '.error-message#error-for-'
      : '.result-message#message-for-') + id
  );

  if (!messageElem) {
    messageElem = document.createElement('div');
    messageElem.className = isErrorMessage ? 'error-message' : 'result-message';
    messageElem.id = (isErrorMessage ? 'error-for-' : 'message-for-') + id;

    targetElem.parentNode.insertBefore(messageElem, targetElem.parent);
  }

  return messageElem;
};

// Show an error message
export const showError = (field, error) => {
  // Add error class to field
  field.classList.add('error');

  // Get field id or name
  const id = field.id || field.name;
  if (!id) return;

  // Check if error message field already exists
  // If not, create one
  // 3. parameter true means it is error message instead of regular result message
  const messageElem = getMessageElement(id, field, true);

  // Add ARIA role to the field
  field.setAttribute('aria-describedby', 'error-for-' + id);

  // Update error message
  messageElem.innerHTML = error;

  // Show error message
  messageElem.style.display = 'block';
  messageElem.style.visibility = 'visible';
};

// Remove the error message
export const removeError = field => {
  // Remove error class to field
  field.classList.remove('error');

  // Remove ARIA role from the field
  field.removeAttribute('aria-describedby');

  // Get field id or name
  const id = field.id || field.name;
  if (!id) return;

  // Check if an error message is in the DOM
  let message = field.form.querySelector('.error-message#error-for-' + id + '');
  if (!message) return;

  // If so, hide it
  message.innerHTML = '';
  message.style.display = 'none';
  message.style.visibility = 'hidden';
};

// for all inputs in form grab input's name and value and put it in associative array
export const getInputs = form => {
  const inputsArray = form.querySelectorAll('input');

  const inputsObj = {};
  inputsArray.forEach(input => {
    Object.assign(inputsObj, { [input.name]: input.value });
  });

  return inputsObj;
};

// stores data object in local storage - returns true if successfully
export const saveInLocalStorage = (keyInLocalStorage, dataToSaveObject) => {
  try {
    localStorage.setItem(keyInLocalStorage, JSON.stringify(dataToSaveObject));
    return true;
  } catch (error) {
    console.error(`Failed to save data in localStorage`, error);
    return false;
  }
};

// restores data object from local storage (for given keyInLocalStorage)
export const readFromLocalStorage = keyInLocalStorage => {
  try {
    const retrievedObject = localStorage.getItem(keyInLocalStorage);
    return JSON.parse(retrievedObject);
  } catch (error) {
    console.error(`Failed to read data from localStorage`, error);
    return false;
  }
};

// loads selected connection settings from local storage
// and sets values in connecion options fieldset
export const loadConnection = currentOptionFieldset => {
  const connectionData = readFromLocalStorage(currentOptionFieldset.id);

  if (!connectionData) return;

  // set fields with retrieved connection data
  Object.entries(connectionData).forEach(([key, value]) => {
    const inputElement = currentOptionFieldset.querySelector(
      `input[name="${key}"]`
    );
    if (inputElement) {
      inputElement.value = value;
    }
  });
};

// Validates the form
// receives object with elements required for validation
// shows visual indicators on fields with error in isTheFormIncorrect()
// disables/enables buttons
export const validateForm = formElementsObj => {
  const {
    sendFormBtn,
    testConnectionBtn,
    fromFacebookFieldset,
    connectionOptionsFieldset
  } = formElementsObj;

  let isfromFacebookFieldsetIncorrect;
  let isConnectionOptionsFieldsetIncorrect;

  if (!fromFacebookFieldset) {
    // fromFacebookFieldset should be always checked (thus given here)
    // if not, something went wrong and validation won't work
    throw new Error(
      'not passed fromFacebookFieldset to validateForm, neccessary for proper form validation'
    );
  }
  isfromFacebookFieldsetIncorrect = Boolean(
    isTheFormIncorrect(fromFacebookFieldset)
  );

  // connectionOptionsFieldset is given (to be validated) only if user selected any option
  if (connectionOptionsFieldset) {
    isConnectionOptionsFieldsetIncorrect = Boolean(
      isTheFormIncorrect(connectionOptionsFieldset)
    );
  }

  // DISABLING / ENABLING BUTTONS
  disableInput(
    sendFormBtn,
    isfromFacebookFieldsetIncorrect || isConnectionOptionsFieldsetIncorrect
  );

  disableInput(testConnectionBtn, isConnectionOptionsFieldsetIncorrect);
};
