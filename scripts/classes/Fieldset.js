import { isTheFormIncorrect } from '../modules/helpers.js';

export class Fieldset {
  constructor(fieldsetElementInDom) {
    this._fieldset = fieldsetElementInDom;
    this._setFieldsChangesWatcher();
    //   TEMP
    this.setNamedFormElements();
  }

  get isValid() {
    return this._isValid;
  }

  setActionOnInput(actionFunction) {
    this._actionOnInput = actionFunction;
  }

  setNamedFormElements(namedFormElementsObj) {
    for (const formElementName in namedFormElementsObj) {
      if (!this._formElements) this._formElements = {};

      const foundDomElement =
        this._fieldset &&
        this._fieldset.querySelector(namedFormElementsObj[formElementName]);
      // assign Dom Element (if exists) to named element in _formElements
      // create property in _formElements for given name if found DOM
      if (foundDomElement) {
        this._formElements[formElementName] = foundDomElement;
      } else {
        console.log(
          `There is no element for ${namedFormElementsObj[formElementName]} in fieldset`
        );
      }
    }

    this._fieldsChangesHandler && this._fieldsChangesHandler();
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

    this._fieldsChangesHandler && this._fieldsChangesHandler();
  }

  _setFieldsChangesWatcher() {
    this._fieldset &&
      this._fieldset.addEventListener(
        'input',
        e => {
          this._fieldsChangesHandler && this._fieldsChangesHandler();
        },
        true
      );
  }

  // is invoked each time fieldset's inputs are changed
  _fieldsChangesHandler() {
    //   check if all fieldset is valid
    this._isValid = !isTheFormIncorrect(this._fieldset);
    // generate _formOutpur
    this._generateFormOutput();
    //   fire custom action
    this._actionOnInput && this._actionOnInput();
  }

  _generateFormOutput() {
    // if fieldset is invalid or there are no formElements defined sets null
    if (!this._isValid || !this._formElements) {
      this._formOutput = null;
      return;
    }

    if (!this._formOutput) this._formOutput = {};

    for (const formElement in this._formElements) {
      this._formOutput[formElement] = this._formElements[formElement].value;
    }
  }

  get formOutput() {
    return this._formOutput;
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
