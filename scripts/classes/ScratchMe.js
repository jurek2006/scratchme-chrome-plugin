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
  }

  _setFromFacebook() {
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

  _getPostData() {
    return new Promise(resolve => {
      chrome.storage.sync.get(['postData'], storage => {
        resolve(storage.postData);
      });
    });
  }
}
