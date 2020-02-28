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
    this.buttons.saveConnectionBtn.addEventListener('click', e => {
      this.saveConnection({ button: this.buttons.saveConnectionBtn });
    });
    this.buttons.sendFormBtn.addEventListener('click', e => {
      this.sendData({ button: this.buttons.sendFormBtn });
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

    this._sendingDataFunction({
      outputDataToSave: this._outputDataToSave,
      connectionOptionDetails: this.formOutput
    })
      .then(() => {
        this.scratchMe.closeWindowOnSuccess();
      })
      .catch(error => {
        showItemMessage(messageElem, error, 'error');
        this.enableInput(button, false);
      });
  }

  saveConnection({ button }) {
    const messageElem = getMessageElement(this.id, button);

    const optionFieldset = this._fieldset;
    const id = this.id;

    // save inputs names & values in localStorage with fieldset id as a key
    const isSavedSuccessfully = saveInLocalStorage(id, this.formOutput);

    if (isSavedSuccessfully) {
      showItemMessage(messageElem, 'Connection options saved', 'success');
      this.enableInput(this.buttons.testConnectionBtn, false);
      this.enableInput(button, false);
    } else {
      showItemMessage(messageElem, 'Failed saving connection options', 'error');
      this.enableInput(this.buttons.testConnectionBtn, true);
    }
  }

  testConnection({ button }) {
    // get(create if doesn't exist) element with id based on id of current option
    const messageElem = getMessageElement(this.id, button);

    // need to have here 'test-connection' button to disable/enable
    const saveConnectionBtn = this.buttons.saveConnectionBtn;

    this._testingConnectionFunction({
      connectionOptionDetails: this.formOutput
    })
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

  // STILL NEEDED ?
  // _addAllButtonsEventListeners() {
  //   if (this.buttons) {
  //     for (const currentButton in this.buttons) {
  //       this._addEventListener(this.buttons[currentButton]);
  //     }
  //   }
  // }

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

  // check if connection options fields are empty, if so populate them with values from localStorage
  _restoreFromLocalStorage() {
    if (this.isEmpty()) {
      const connectionData = readFromLocalStorage(this.id);
      if (!connectionData) return;
      console.log(`Restoring connection data for ${this.id}`);
      this.setFieldsValues(connectionData);
    }
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
