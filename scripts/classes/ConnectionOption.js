import { Fieldset } from './Fieldset.js';

// TEMP - delete not needed
import { showItemMessage, getMessageElement } from '../helpers/formHelpers.js';
import localStor from '../modules/localStorage.js';

export class ConnectionOption extends Fieldset {
  constructor(configProps) {
    super(configProps);
    const { id } = configProps;
    this._id = id;
  }

  get id() {
    return this._id;
  }

  updateStatus({ outputDataToSave }) {
    this._outputDataToSave = outputDataToSave;
    this._fieldsChangesHandler(); // invoke this._fieldsChangesHandler() to invoke this._actionOnInputwith passing buttons, elements etc.
  }

  _registerFormActions() {
    if (!this.buttons) return;

    // assign action for test-connection
    this.buttons.testConnectionBtn &&
      this.buttons.testConnectionBtn.addEventListener('click', e => {
        this.testConnection({ button: this.buttons.testConnectionBtn });
      });

    // assign action for save-connection
    this.buttons.saveConnectionBtn &&
      this.buttons.saveConnectionBtn.addEventListener('click', e => {
        this.saveConnection({ button: this.buttons.saveConnectionBtn });
      });
    // assign action for send data
    this.buttons.sendFormBtn &&
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
    const isSavedSuccessfully = localStor.save(id, this.formOutput);

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
  _restoreConnectionDetailsFromLocalStorage() {
    if (this.isEmpty()) {
      const connectionData = localStor.read(this.id);
      if (!connectionData) return;
      console.log(`Restoring connection data for ${this.id}`);
      this.setFieldsValues(connectionData);
    }
  }

  _storeLastConnectionOption() {
    if (!this.id) return;
    localStor.save('last-connection-option', this.id);
  }

  setVisible() {
    this.isActive = true;
    this._fieldset.classList.remove('disabled');
    this._storeLastConnectionOption();
    this._restoreConnectionDetailsFromLocalStorage();
    return this; // return active connection option
  }

  setHidden() {
    this.isActive = false;
    this._fieldset.classList.add('disabled');
  }
}
