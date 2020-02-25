import { setDateTimeValue, isTheFormIncorrect } from '../modules/helpers.js';

export class ScratchMe {
  constructor() {
    this._options = {};
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
    this._setFieldsValue()
      .then(() => {
        this.fromFacebook.isValid = !isTheFormIncorrect(
          this.fromFacebook.fieldset
        );
      })
      .catch(error => console.log('error', error));
    this.fromFacebook.fieldset.addEventListener(
      'input',
      e => {
        this.fromFacebook.isValid = !isTheFormIncorrect(
          this.fromFacebook.fieldset
        );
        this.activeConnectionOption && this.activeConnectionOption.rerender();
      },
      true
    );
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
    this.activeConnectionOption = this._options[selectedOptionId].setVisible();
    console.log('active connection option', this.activeConnectionOption);
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
