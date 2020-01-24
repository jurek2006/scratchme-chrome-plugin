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
