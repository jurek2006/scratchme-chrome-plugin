import { ConnectionOptions } from './ConnectionOptions.js';
import { Fieldset } from './Fieldset.js';
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
    this.scratchedDataFieldset = new Fieldset(
      document.getElementById('from-facebook')
    );

    this._getPostData().then(({ postId, author, url, content, uTime }) => {
      this.scratchedDataFieldset.setFieldsValues({
        postAuthorInput: author,
        postDatetimeInput: setDateTimeValue(uTime),
        postTitleInput: `${postId ? postId + ' - ' : ''}${content.slice(
          0,
          20
        )}... - ${author}`,
        postContentTextarea: content,
        postUrlInput: url,
        postIdInput: postId || '0'
      });
    });

    // this.fromFacebook = {
    //   fieldset: document.getElementById('from-facebook'),
    //   formElements: {
    //     postAuthorInput: document.getElementById('post-author'),
    //     postDatetimeInput: document.getElementById('post-datetime'),
    //     postTitleInput: document.getElementById('post-title'),
    //     postContentTextarea: document.getElementById('post-content'),
    //     postUrlInput: document.getElementById('post-url'),
    //     postIdInput: document.getElementById('post-id')
    //   }
    // };
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

  _getPostData() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['postData'], storage => {
        resolve(storage.postData);
      });
    });
  }
}
