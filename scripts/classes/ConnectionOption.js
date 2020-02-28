import { Fieldset } from './Fieldset.js';

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

export class ConnectionOption extends Fieldset {
  constructor(configProps) {
    super(configProps);
    const { id } = configProps;
    this._id = id;
  }

  get id() {
    return this._id;
  }
  // TEMP - old
  // constructor(fields) {
  //   Object.assign(this, fields);
  //   this._addAllButtonsEventListeners();
  //   this._registerTestBtn();
  //   this._registerSaveBtn();
  //   this._registerSendBtn();
  //   this._addFieldsValidation();
  // }

  updateStatus({ outputDataToSave }) {
    this._outputDataToSave = outputDataToSave;
    this._fieldsChangesHandler(); // invoke this._fieldsChangesHandler() to invoke this._actionOnInputwith passing buttons, elements etc.
  }

  _registerFormActions() {
    // assign action for test-connection
    this.buttons.testConnectionBtn.addEventListener('click', e => {
      this.testConnection({ button: this.buttons.testConnectionBtn });
    });
  }

  _testingConnectionFunction() {
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

    this._sendingDataFunction({
      outputDataToSave: this._outputDataToSave
    })
      .then(() => {
        this.scratchMe.closeWindowOnSuccess();
      })
      .catch(error => {
        showItemMessage(messageElem, error, 'error');
        disableInput(button, true);
      });
  }

  // saveConnection({ button }) {
  //   console.log('save connection', button, this);
  //   const messageElem = getMessageElement(this.id, button);

  //   // get activeFieldset of options
  //   const activeFieldset = this.fieldset;

  //   // save inputs names & values in localStorage with fieldset id as a key
  //   const isSavedSuccessfully = saveInLocalStorage(
  //     activeFieldset.id,
  //     getInputs(activeFieldset)
  //   );

  //   if (isSavedSuccessfully) {
  //     showItemMessage(messageElem, 'Connection options saved', 'success');
  //     disableInput(testConnectionBtn, true);
  //     disableInput(saveConnectionBtn, true);
  //   } else {
  //     showItemMessage(messageElem, 'Failed saving connection options', 'error');
  //     disableInput(testConnectionBtn, false);
  //   }
  // }

  testConnection({ button }) {
    // get(create if doesn't exist) element with id based on id of current option
    const messageElem = getMessageElement(this.id, button);

    // need to have here 'test-connection' button to disable/enable
    const saveConnectionBtn = this.buttons.saveConnectionBtn;

    this._testingConnectionFunction()
      .then(response => {
        // connected successfully
        showItemMessage(messageElem, response, 'success');
        this.enableInput(saveConnectionBtn, true);
      })
      .catch(error => {
        // connection error occured
        showItemMessage(messageElem, `Connection failed: ${error}`, 'error');
        this.enableInput(saveConnectionBtn, false);
      });
  }

  // _registerTestBtn() {
  //   const button = this.buttons.testConnectionBtn.element;
  //   button.addEventListener(
  //     'click',
  //     this.testConnection.bind(this, { button }),
  //     false
  //   );
  // }
  // _registerSaveBtn() {
  //   const button = this.buttons.saveConnectionBtn.element;
  //   button.addEventListener(
  //     'click',
  //     this.saveConnection.bind(this, { button }),
  //     false
  //   );
  // }
  // _registerSendBtn() {
  //   const button = this.buttons.sendFormBtn.element;
  //   button.addEventListener(
  //     'click',
  //     this.sendData.bind(this, { button }),
  //     false
  //   );
  // }

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

  // get sendFormBtn() {
  //   return this.buttons.sendFormBtn.element;
  // }

  _restoreFromLocalStorage() {
    // const areAllInputsEmpty =
    //   Object.values(this.formElements).filter(el => el.value).length === 0;
    // if (areAllInputsEmpty) {
    //   // console.log('All empty, possible load');
    //   const connectionData = readFromLocalStorage(this.id);
    //   if (!connectionData) return;
    //   // set fields with retrieved connection data
    //   Object.entries(connectionData).forEach(([key, value]) => {
    //     // const inputElement = currentOptionFieldset.querySelector(
    //     //   `input[name="${key}"]`
    //     // );
    //     // if (inputElement) {
    //     //   inputElement.value = value;
    //     // }
    //     const inputElement = this.formElements;
    //     // console.log('Set to element', inputElement, key, value);
    //   });
    // } else {
    //   console.log('Not all empty');
    // }
  }

  setVisible() {
    this.isActive = true;
    this._fieldset.classList.remove('disabled');
    this._restoreFromLocalStorage();
    return this; // return active connection option
  }

  setHidden() {
    this.isActive = false;
    this._fieldset.classList.add('disabled');
    console.log(`Hide connection option ${this.id}`, this._fieldset);
  }
}
