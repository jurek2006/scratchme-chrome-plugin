import { ConnectionOptions } from './ConnectionOptions.js';
import { Fieldset } from './Fieldset.js';
import {
  setDateTimeValue,
  isTheFormIncorrect,
  readFromLocalStorage
} from '../modules/helpers.js';

export class ScratchMe {
  constructor() {
    this.outputDataToSave = null;
    this.connectionOptions = new ConnectionOptions(this);
    this._setFromFacebook();
    this.form = document.getElementById('scratch-me-form');
    this.closeWindowOnSuccess = function() {
      document.querySelector('.popup').classList.add('success');
      chrome.windows.getCurrent(win =>
        setTimeout(() => chrome.windows.remove(win.id), 3000)
      );
    };
    this._setConnectionOptionChanger();
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

  _setFromFacebook() {
    this.scratchedDataFieldset = new Fieldset(
      document.getElementById('from-facebook')
    );

    this.scratchedDataFieldset.setActionOnInput(() => {
      this.outputDataToSave = this.scratchedDataFieldset.formOutput;
      // this.connectionOptions.active && this.connectionOptions.active.rerender();
      this.connectionOptions.active &&
        this.connectionOptions.active.updateStatus({
          outputDataToSave: this.outputDataToSave
        });
    });

    this.scratchedDataFieldset.setNamedFormElements({
      postAuthor: '#post-author',
      postDatetime: '#post-datetime',
      postTitle: '#post-title',
      postContent: '#post-content',
      postUrl: '#post-url',
      postId: '#post-id'
    });

    this._getPostData().then(({ postId, author, url, content, uTime }) => {
      this.scratchedDataFieldset.setFieldsValues({
        postAuthor: author,
        postDatetime: setDateTimeValue(uTime),
        postTitle: `${postId ? postId + ' - ' : ''}${content.slice(
          0,
          20
        )}... - ${author}`,
        postContent: content,
        postUrl: url,
        postId: postId || '0'
      });
    });
  }

  _setConnectionOptionChanger() {
    // const scratchMeForm = document.getElementById('scratch-me-form');

    // TEMP
    const selectDataFormat = document.getElementById('select-data-format');

    selectDataFormat.addEventListener(
      'change',
      e => {
        this.connectionOptions.setActive(e.target.value);
        // NOT NECCESSARY
        // this.outputDataToSave =
        //   this.scratchedDataFieldset && this.scratchedDataFieldset.formOutput;
        this.connectionOptions.active &&
          this.connectionOptions.active.updateStatus({
            outputDataToSave: this.outputDataToSave
          });
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
