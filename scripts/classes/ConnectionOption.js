// TEMP - delete not needed
import {
  disableInput,
  showItemMessage,
  isTheFormIncorrect,
  getMessageElement,
  getInputs,
  saveInLocalStorage,
  readFromLocalStorage,
  loadConnection,
  validateForm,
  getMessageElementNew
} from '../modules/helpers.js';

export class ConnectionOption {
  constructor(fields) {
    Object.assign(this, fields);
    this._addAllButtonsEventListeners();
    this._registerTestBtn();
    this._registerSaveBtn();
    this._registerSendBtn();
    this._addFieldsValidation();
  }

  rerender() {
    console.log('rerendering', this);
    disableInput(this.buttons.testConnectionBtn.element, !this.isValid);
    disableInput(
      this.buttons.sendFormBtn.element,
      !(this.isValid && this.scratchMe.fromFacebook.isValid)
    );
  }

  _addFieldsValidation() {
    this.isValid = !isTheFormIncorrect(this.fieldset);
    this.fieldset.addEventListener(
      'input',
      e => {
        this.isValid = !isTheFormIncorrect(this.fieldset);
        this.rerender();
      },
      true
    );
  }

  _testingConnectionFunction() {
    // console.log('testConnectionFunction in class', this);
    return Promise.reject(
      'No _testingConnectionFunction() defined for instance '
    );
  }
  _sendingDataFunction() {
    return Promise.reject('No _sendingDataFunction() defined for instance ');
  }

  sendData({ button }) {
    console.log('send data', button, this);
    const messageElem = getMessageElement(this.id, button);

    // add additional form checking

    this._sendingDataFunction()
      .then(() => {
        // show succes and hide popup after defined time
        // popup.classList.add('success');
        // clearExtractedData(false);
        // chrome.windows.getCurrent(win =>
        //   setTimeout(() => chrome.windows.remove(win.id), 4000)
        // );
        closeWindow();
      })
      .catch(error => {
        showItemMessage(messageElem, error, 'error');
        disableInput(button, true);
      });
  }

  saveConnection({ button }) {
    console.log('save connection', button, this);
    const messageElem = getMessageElement(this.id, button);

    // get activeFieldset of options
    const activeFieldset = this.fieldset;

    // save inputs names & values in localStorage with fieldset id as a key
    const isSavedSuccessfully = saveInLocalStorage(
      activeFieldset.id,
      getInputs(activeFieldset)
    );

    if (isSavedSuccessfully) {
      showItemMessage(messageElem, 'Connection options saved', 'success');
      disableInput(testConnectionBtn, true);
      disableInput(saveConnectionBtn, true);
    } else {
      showItemMessage(messageElem, 'Failed saving connection options', 'error');
      disableInput(testConnectionBtn, false);
    }
  }

  testConnection({ button }) {
    // console.log('testConnection in class', this);
    // this._testingConnectionFunction();

    // get(create if doesn't exist) element with id based on id of current option
    // let messageElem = getMessageElementNew(this.id, this.fieldset);
    const messageElem = getMessageElement(this.id, button);
    // console.log(messageElem, button);
    // showItemMessage(messageElem, 'is working?', 'success');

    // need to have here 'test-connection' button to disable/enable
    const saveConnectionBtn = this.buttons.saveConnectionBtn.element;
    console.log('saveConnectionBtn', saveConnectionBtn);

    this._testingConnectionFunction()
      .then(response => {
        // connected successfully
        showItemMessage(messageElem, response, 'success');
        disableInput(saveConnectionBtn, false);
      })
      .catch(error => {
        // connection error occured
        // console.error('Error in testing connection', error);

        showItemMessage(messageElem, `Connection failed: ${error}`, 'error');
        disableInput(saveConnectionBtn, true);
      });
  }

  _registerTestBtn() {
    const button = this.buttons.testConnectionBtn.element;
    button.addEventListener(
      'click',
      this.testConnection.bind(this, { button }),
      false
    );
  }
  _registerSaveBtn() {
    const button = this.buttons.saveConnectionBtn.element;
    button.addEventListener(
      'click',
      this.saveConnection.bind(this, { button }),
      false
    );
  }
  _registerSendBtn() {
    const button = this.buttons.sendFormBtn.element;
    button.addEventListener(
      'click',
      this.sendData.bind(this, { button }),
      false
    );
  }

  _addAllButtonsEventListeners() {
    if (this.buttons) {
      for (const currentButton in this.buttons) {
        this._addEventListener(this.buttons[currentButton]);
      }
    }
  }

  _addEventListener(button) {
    if (button.element && button.actions && button.actions.length > 0) {
      button.actions.forEach(action => {
        if (!action.event || !action.actionFunction) return;
        console.log(`adding handler to ${action.event}`);
        button.element.addEventListener(
          action.event,
          action.actionFunction.bind(this), // sets whole option as this
          false
        );
      });
    }
  }

  get sendFormBtn() {
    return this.buttons.sendFormBtn.element;
  }

  setVisible() {
    this.isActive = true;
    this.fieldset.classList.remove('disabled');
    return this; // return active connection option
    console.log(`Enable connection option ${this.id}`, this.fieldset);
  }

  setHidden() {
    this.isActive = false;
    this.fieldset.classList.add('disabled');
    console.log(`Hide connection option ${this.id}`, this.fieldset);
  }
}
