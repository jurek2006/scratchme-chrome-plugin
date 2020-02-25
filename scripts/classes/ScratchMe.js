import { setDateTimeValue } from '../modules/helpers.js';

export class ScratchMe {
  constructor() {
    this._options = {};
    this._setFromFacebook();
    this.popup = document.querySelector('.popup');
    this._setFieldsValue();
    this._setConnectionOptionChanger();
  }

  // _getData() {
  //   chrome.storage.sync.get(['postData'], storage => {
  //     return storage.postData;
  //     // setFieldsValue(storage.postData);
  //     // restoreSelectedConnection(); // has to be after setting fields values
  //   });
  // }

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
  }

  // TEMP - add hide all outside
  _hideAllConnectionOptions() {
    // hide all connection options
    for (const [optionId, option] of Object.entries(this._options)) {
      option.setHidden();
    }
  }

  _changeCurrentConnectionOption(selectedOptionId) {
    this._hideAllConnectionOptions();
    this._options[selectedOptionId].setVisible();
  }

  _setConnectionOptionChanger() {
    // const scratchMeForm = document.getElementById('scratch-me-form');

    const selectDataFormat = document.getElementById('select-data-format');

    selectDataFormat.addEventListener(
      'change',
      e => {
        this._changeCurrentConnectionOption(e.target.value);
      },
      false
    );
  }

  _setFieldsValue() {
    chrome.storage.sync.get(['postData'], storage => {
      // return storage.postData;
      // setFieldsValue(storage.postData);
      // restoreSelectedConnection(); // has to be after setting fields values
      const postData = storage.postData;

      console.log('get data', postData);
      if (!postData) return;
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
    });
  }

  registerNew(connectionOption) {
    //   TEMP change for association table & change method name
    Object.assign(this._options, {
      [connectionOption.id]: connectionOption
    });
    // TEMP - set reference to whole scratchMe object in every connectionOption
    this._options[connectionOption.id].scratchMe = this;
  }

  all() {
    console.log('all connection options', this._options);
  }
}
