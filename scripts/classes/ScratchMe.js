import { ConnectionOptions } from './ConnectionOptions.js';
import { Fieldset } from './Fieldset.js';
import { setDateTimeValue } from '../helpers/helpers.js';
import chromeStorage from './../modules/chromeStorage.js';

export class ScratchMe {
  constructor() {
    this.outputDataToSave = null;
    this.connectionOptions = new ConnectionOptions(this);
    this._initScratchedDataFieldset();
  }

  _initScratchedDataFieldset() {
    this.scratchedDataFieldset = new Fieldset({
      fieldsetElementInDom: document.getElementById('from-facebook')
    });

    this.scratchedDataFieldset.registerActionOnInput(() => {
      this.outputDataToSave = this.scratchedDataFieldset.formOutput;
      this.connectionOptions.active &&
        this.connectionOptions.active.updateStatus({
          outputDataToSave: this.outputDataToSave
        });
    });

    this.scratchedDataFieldset.registerNamedFormElements({
      personName: '#person-name',
      personCompany: '#person-company',
      personPosition: '#person-position',
      personProfileUrl: '#person-profile-url'
    });

    chromeStorage
      .get(['postData'])
      .then(({ name, company, position, url }) => {
        this.scratchedDataFieldset.setFieldsValues({
          personName: name,
          personCompany: company,
          personPosition: position,
          personProfileUrl: url
        });
      })
      .catch(error => {
        console.log('Failed to read data from chrome storage', error);
      });
  }

  closeWindowOnSuccess() {
    document.querySelector('.popup').classList.add('success');
    chrome.windows.getCurrent(win =>
      setTimeout(() => chrome.windows.remove(win.id), 3000)
    );
  }
}
