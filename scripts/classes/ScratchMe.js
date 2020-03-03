import { ConnectionOptions } from './ConnectionOptions.js';
import { Fieldset } from './Fieldset.js';
import { setDateTimeValue } from '../modules/helpers.js';
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
      postAuthor: '#post-author',
      postDatetime: '#post-datetime',
      postTitle: '#post-title',
      postContent: '#post-content',
      postUrl: '#post-url',
      postId: '#post-id'
    });

    chromeStorage
      .get(['postData'])
      .then(({ postId, author, url, content, uTime }) => {
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
