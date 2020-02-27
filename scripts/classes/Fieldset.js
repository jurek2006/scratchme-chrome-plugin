import { isTheFormIncorrect } from '../modules/helpers.js';

export class Fieldset {
  constructor(fieldsetElementInDom) {
    this._fieldset = fieldsetElementInDom;
    this._setFieldsChangesWatcher();
    //   TEMP
    this._setNamedFormElements();
  }

  get isValid() {
    return this._isValid;
  }

  setActionOnInput(actionFunction) {
    this._actionOnInput = actionFunction;
  }

  // TEMP - make more generic
  _setNamedFormElements() {
    console.log(this._fieldset);
    this._formElements = {
      postAuthorInput: this._fieldset.querySelector('#post-author'),
      postDatetimeInput: this._fieldset.querySelector('#post-datetime'),
      postTitleInput: this._fieldset.querySelector('#post-title'),
      postContentTextarea: this._fieldset.querySelector('#post-content'),
      postUrlInput: this._fieldset.querySelector('#post-url'),
      postIdInput: this._fieldset.querySelector('#post-id')
    };
  }

  setFieldsValues(propertiesValuesObj) {
    for (const formElementName in propertiesValuesObj) {
      const formElement =
        this._formElements && this._formElements[formElementName];

      if (formElement) {
        formElement.value = propertiesValuesObj[formElementName];
      } else {
        console.log(
          `There is no element ${formElementName} in fieldset named elements`
        );
      }
    }
  }

  _setFieldsChangesWatcher() {
    this._fieldset &&
      this._fieldset.addEventListener(
        'input',
        e => {
          //   check if all fieldset is valid
          this._isValid = !isTheFormIncorrect(this._fieldset);
          //   fire custom action
          this._actionOnInput && this._actionOnInput();
        },
        true
      );
  }

  // default action on input
  // can be overwritten with setActionOnInput in instance
  // if deleted (commented) === no default action
  _actionOnInput() {
    // ... placeholder
    //   TEMP
    console.dir(this);
  }
}
