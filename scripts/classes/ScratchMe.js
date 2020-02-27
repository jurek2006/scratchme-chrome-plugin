import { ConnectionOptions } from './ConnectionOptions.js';
import {
  setDateTimeValue,
  isTheFormIncorrect,
  readFromLocalStorage
} from '../modules/helpers.js';

export class ScratchMe {
  constructor() {
    this.dataToSave = null;
    this.connectionOptions = new ConnectionOptions(this);
    this._setFromFacebook();
    this.form = document.getElementById('scratch-me-form');
    this.closeWindowOnSuccess = function() {
      document.querySelector('.popup').classList.add('success');
      chrome.windows.getCurrent(win =>
        setTimeout(() => chrome.windows.remove(win.id), 3000)
      );
    };
    // this._setFieldsValue();
    this._setConnectionOptionChanger();
    // this._setInputsValidator();
    console.log(this.connectionOptions);
  }

  init() {
    this._restoreSelectedConnection();
  }

  _restoreSelectedConnection() {
    const restoredConnectionOptionId = readFromLocalStorage(
      'lastSelectedOption'
    );
    console.log('restore connection option', restoredConnectionOptionId);
    this._changeCurrentConnectionOption(restoredConnectionOptionId);

    // TEMP
    const selectDataFormat = document.getElementById('select-data-format');
    selectDataFormat.value = restoredConnectionOptionId; // set connection in select

    // if (restoredConnectionId) {
    //   selectDataFormat.value = restoredConnectionId; // set connection in select
    //   changeConnectionOption(restoredConnectionId); // change connection for read one
    // }
  }

  _setInputsValidator() {
    this.form.addEventListener(
      'input',
      e =>
        console.log(
          `Input dla ${e.target.value}. Validity ${e.target.validity.valid}`
        ),
      true
    );
  }

  _setFromFacebook() {
    this.fromFacebook = {
      fieldset: document.getElementById('from-facebook'),
      formElements: {
        postAuthorInput: document.getElementById('post-author'),
        postDatetimeInput: document.getElementById('post-datetime'),
        postTitleInput: document.getElementById('post-title'),
        postContentTextarea: document.getElementById('post-content'),
        postUrlInput: document.getElementById('post-url'),
        postIdInput: document.getElementById('post-id')
      }
    };

    this.fromFacebook.fieldset.addEventListener(
      'input',
      e => {
        isTheFormIncorrect(this.fromFacebook.fieldset);
        this.connectionOptions.active &&
          this.connectionOptions.active.rerender();
      },
      true
    );

    this._setFieldsValue()
      .then(() => {
        isTheFormIncorrect(this.fromFacebook.fieldset);
      })
      .catch(error => console.log('error', error));
  }

  _setConnectionOptionChanger() {
    // const scratchMeForm = document.getElementById('scratch-me-form');

    // TEMP
    const selectDataFormat = document.getElementById('select-data-format');

    selectDataFormat.addEventListener(
      'change',
      e => {
        this.connectionOptions.setActive(e.target.value);
      },
      false
    );
  }

  _setFieldsValue() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['postData'], storage => {
        // return storage.postData;
        // setFieldsValue(storage.postData);
        // restoreSelectedConnection(); // has to be after setting fields values

        // TEMP - improve
        const postData = storage.postData;

        console.log('get data', postData);
        if (!postData) resolve();
        // TEMP
        const { postId, author, url, content, uTime } = postData;

        this.fromFacebook.formElements.postAuthorInput.value = author;
        this.fromFacebook.formElements.postDatetimeInput.value = setDateTimeValue(
          uTime
        );
        this.fromFacebook.formElements.postTitleInput.value = `${
          postId ? postId + ' - ' : ''
        }${content.slice(0, 20)}... - ${author}`;
        this.fromFacebook.formElements.postContentTextarea.value = content;
        this.fromFacebook.formElements.postUrlInput.value = url;
        this.fromFacebook.formElements.postIdInput.value = postId || '0';
        resolve();
      });
    });
  }
}
