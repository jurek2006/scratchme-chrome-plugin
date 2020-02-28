import { isTheFormIncorrect } from '../modules/helpers.js';

export class Fieldset {
  constructor({ fieldsetElementInDom }) {
    this._fieldset = fieldsetElementInDom;
    this._setFieldsChangesWatcher();
  }

  get formOutput() {
    return this._formOutput;
  }

  get isValid() {
    return this._isValid;
  }

  // defining custom action function in instance
  registerActionOnInput(actionFunction) {
    this._actionOnInput = actionFunction;
  }

  registerNamedFormElements(formElementsObj) {
    this._registerElements({
      formElementsObj,
      propertyToStoreElementsIn: '_formElements'
    });
  }

  registerNamedFormButtons(formElementsObj) {
    this._registerElements({
      formElementsObj,
      propertyToStoreElementsIn: '_formButtons'
    });
  }

  _registerElements({ formElementsObj, propertyToStoreElementsIn }) {
    // propertyToStoreElementsIn is i.e. this._formElements, this._formButtons
    // if the property doesn't exist is created

    if (!this[propertyToStoreElementsIn]) this[propertyToStoreElementsIn] = {};

    for (const formElementName in formElementsObj) {
      // if (!propertyToStoreElementsIn) propertyToStoreElementsIn = {};

      const foundDomElement =
        this._fieldset &&
        this._fieldset.querySelector(formElementsObj[formElementName]);
      // assign Dom Element (if exists) to as element in property
      // create element's property in propertyToStoreElementsIn for given name if found DOM
      // i.e. if passed propertyToStoreElementsIn === '._formElements' and formElementsObj
      // is { postAuthor: '#post-author'} stores in this._formElements.postAuthor reference
      // to #post - author element (found in current fieldset (this._fieldset))
      if (foundDomElement) {
        this[propertyToStoreElementsIn][formElementName] = foundDomElement;
      } else {
        console.log(
          `There is no element for ${formElementsObj[formElementName]} in fieldset`
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

  // default custom action on input (every change in input value)
  // can be overwritten with registerActionOnInput in instance
  // if deleted (commented) === no default action
  // _actionOnInput() {
  //   // ... placeholder
  //   console.log('Not defined actionOnInput function for:', this);
  // }
}
