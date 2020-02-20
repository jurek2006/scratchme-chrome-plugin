import googleSheetsModule from './modules/googleSheetsModule.js';
import cooperModule from './modules/cooperModule.js';
import dummyApiModule from './modules/dummyApiModule.js';
import {
  disableInput,
  showItemMessage,
  isTheFormIncorrect,
  getMessageElement,
  getInputs,
  saveInLocalStorage,
  readFromLocalStorage,
  loadConnection,
  validateForm
} from './modules/helpers.js';

const showFormScratchMe = () => {
  // FLEXIBLE ELEMENTS
  let connectionOptionsFieldset; // flexible container - assigned when selected sending(storing) option (for validating fields only for chosen option)

  // Buttons
  let sendFormBtn; // flexible button for sending form - is assigned according to selected storing option
  let testConnectionBtn; // flexible button for testing selected connection - assigned when option selected
  let saveConnectionBtn; // flexible button for saving selected connection - assigned when option selected

  // DEFINED ELEMENTS
  const popup = document.querySelector('.popup');

  // Form
  const scratchMeForm = document.getElementById('scratch-me-form');

  // TEMP
  const fromFacebook = {
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

  console.log('fromFacebook', fromFacebook);

  // TEMP OLD - to delete
  // Form fieldset with fields to be filled from facebook
  //   const fromFacebookFieldset = document.getElementById('from-facebook');

  // Facebook data
  //   const postAuthorInput = document.getElementById('post-author');
  //   const postDatetimeInput = document.getElementById('post-datetime');
  //   const postTitleInput = document.getElementById('post-title');
  //   const postContentTextarea = document.getElementById('post-content');
  //   const postUrlInput = document.getElementById('post-url');
  //   const postIdInput = document.getElementById('post-id');

  // Select and display format e.g JSON/Cooper/cURL
  const selectDataFormat = document.getElementById('select-data-format');
  const codeAreaContent = document.getElementById('code-area-content');

  //   TEMP
  const googleSheets = {
    formElements: {
      googleSpreadSheetIdInput: document.getElementById(
        'google-spreadsheet-id'
      ),
      googleSpreadSheetTabNameInput: document.getElementById(
        'google-spreadsheet-tab-name'
      )
    },
    buttons: {
      sendGoogleSheetsBtn: document.getElementById('send-to-google-sheets'),
      testConnectionGoogleSheetsBtn: document.getElementById(
        'test-connection-google-sheets'
      )
    }
  };

  // Google Sheets data - TEMP - old
  //   const googleSpreadSheetIdInput = document.getElementById(
  //     'google-spreadsheet-id'
  //   );
  //   const googleSpreadSheetTabNameInput = document.getElementById(
  //     'google-spreadsheet-tab-name'
  //   );
  //   // Google Sheets buttons
  //   const sendGoogleSheetsBtn = document.getElementById('send-to-google-sheets');
  //   const testConnectionGoogleSheetsBtn = document.getElementById(
  //     'test-connection-google-sheets'
  //   );

  // Dummy API connection data
  const dummyApiUserId = document.getElementById('dummy-api-user-id');
  const dummyApiUserName = document.getElementById('dummy-api-user-name');
  // Dummy API buttons
  const sendDummyApiBtn = document.getElementById('send-to-dummy-api');
  const testConnectionDummyApiBtn = document.getElementById(
    'test-connection-dummy-api'
  );

  // Cooper CRM data
  const cooperAccessTokenInput = document.getElementById('cooper-access-token');
  const cooperAppNameInput = document.getElementById('cooper-application-name');
  const cooperUserAppEmailInput = document.getElementById(
    'cooper-user-application-email'
  );
  // Cooper CRM buttons
  const sendCooperBtn = document.getElementById('send-to-cooper');
  const testConnectionCooperBtn = document.getElementById(
    'test-connection-cooper'
  );

  // get all saveConnetion buttons (on every option they do the same)
  const saveConnectionButtonsArray = document.querySelectorAll(
    'button.js-save-connection-btn'
  );

  // Other buttons
  const copyToClipBtn = document.getElementById('copy-to-clip-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');

  // get post data stored by background.js (data scratched from facebook)
  chrome.storage.sync.get(['postData'], storage => {
    setFieldsValue(storage.postData);
    restoreSelectedConnection(); // has to be after setting fields values
  });

  // saves last selected connection option
  const rememberSelectedConnection = optionValue => {
    saveInLocalStorage('lastSelectedOption', optionValue);
  };

  // restores last selected connection option
  const restoreSelectedConnection = () => {
    const restoredConnectionId = readFromLocalStorage('lastSelectedOption');

    if (restoredConnectionId) {
      selectDataFormat.value = restoredConnectionId; // set connection in select
      changeConnectionOption(restoredConnectionId); // change connection for read one
    }
  };

  const copyToClipboard = e => {
    e.preventDefault();

    const copyToClipContent = document.getElementById(
      'copy-to-clipboard-content'
    );
    const copyToClipMessage = document.querySelector('span.copy-clip-message');
    copyToClipContent.value = codeAreaContent.textContent;

    copyToClipContent.select();
    document.execCommand('copy');
    copyToClipContent.blur();

    copyToClipMessage.classList.add('active');
    setTimeout(() => {
      copyToClipMessage.classList.remove('active');
    }, 4000);
  };

  const clearExtractedData = e => {
    if (e) e.preventDefault();

    try {
      chrome.storage.sync.remove(['postData'], items => {
        fromFacebook.formElements.postAuthorInput.value = '';
        fromFacebook.formElements.postContentTextarea.value = '';
        fromFacebook.formElements.postDatetimeInput.value = '';
        fromFacebook.formElements.postIdInput.value = '';
        fromFacebook.formElements.postUrlInput.value = '';
        fromFacebook.formElements.postTitleInput.value = '';
        codeAreaContent.innerHTML = '';
      });
    } catch (error) {
      console.error('Error: ' + error);
    }
  };

  const setDateTimeValue = unixTime => {
    const date = unixTime ? new Date(unixTime * 1000) : new Date(Date.now());

    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const dayMonth = ('0' + date.getDate()).slice(-2);
    const hours = (date.getHours() < 10 ? '0' : '') + date.getHours();
    const minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();

    return `${date.getFullYear()}-${month}-${dayMonth}T${hours}:${minutes}`;
  };

  const setFieldsValue = postData => {
    if (!postData) return;

    const { postId, author, url, content, uTime } = postData;

    fromFacebook.formElements.postAuthorInput.value = author;
    fromFacebook.formElements.postDatetimeInput.value = setDateTimeValue(uTime);
    fromFacebook.formElements.postTitleInput.value = `${
      postId ? postId + ' - ' : ''
    }${content.slice(0, 20)}... - ${author}`;
    fromFacebook.formElements.postContentTextarea.value = content;
    fromFacebook.formElements.postUrlInput.value = url;
    fromFacebook.formElements.postIdInput.value = postId || '0';
  };

  const generateCode = codeName => {
    const data = {
      postId: fromFacebook.formElements.postIdInput.value,
      postTitle: fromFacebook.formElements.postTitleInput.value,
      author: fromFacebook.formElements.postAuthorInput.value,
      content: fromFacebook.formElements.postContentTextarea.value,
      datetime: fromFacebook.formElements.postDatetimeInput.value,
      postUrl: fromFacebook.formElements.postUrlInput.value
    };

    // Copy to clipboard
    copyToClipBtn.addEventListener('click', copyToClipboard, false);

    switch (codeName) {
      case 'json':
        codeAreaContent.innerHTML = `<code class="json-language"><span class="code-line">{</span>
<span class="code-line">  <span class="key">"id":</span> <span class="number">${fromFacebook.formElements.postIdInput.value}</span>,</span>
<span class="code-line">  <span class="key">"title":</span> <span class="string">"${fromFacebook.formElements.postTitleInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"author":</span> <span class="string">"${fromFacebook.formElements.postAuthorInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"content":</span> <span class="string">"${fromFacebook.formElements.postContentTextarea.value}"</span>,</span>
<span class="code-line">  <span class="key">"date":</span> <span class="string">"${fromFacebook.formElements.postDatetimeInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"post_url":</span> <span class="string">"${fromFacebook.formElements.postUrlInput.value}"</span></span>
<span class="code-line">}</span></code>`;

        break;

      case 'curl':
        codeAreaContent.innerHTML = `<code class="curl-language"><span class="code-line">curl --location --request <span class="method">GET</span><span class="value">"https://api.prosperworks.com/developer_api/v1/account"</span><span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-AccessToken: ${cooperAccessTokenInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-Application: ${cooperAppNameInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-UserEmail: ${cooperUserAppEmailInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"Content-Type: application/json"</span></span></code>`;
        break;
    }
  };

  // changes connection option for given selectedValue which should be equal with option's fieldset id
  const changeConnectionOption = selectedValue => {
    rememberSelectedConnection(selectedValue);

    const contentOfSelectedOption = document.querySelectorAll(
      '.content-of-selected-option'
    );

    for (const content of contentOfSelectedOption)
      content.classList.add('disabled');

    const selectedContent = document.getElementById(
      `${selectedValue.slice(0, 4) === 'code' ? 'code-area' : selectedValue}`
    );

    if (selectedContent) {
      // enable fieldset for selected option
      selectedContent.classList.remove('disabled');

      // set current fieldset (for selected 'connection' option)
      connectionOptionsFieldset = selectedContent;

      // set current buttons from selected option
      testConnectionBtn = connectionOptionsFieldset.querySelector(
        'button.js-test-connection-btn'
      );
      saveConnectionBtn = connectionOptionsFieldset.querySelector(
        'button.js-save-connection-btn'
      );
      sendFormBtn = connectionOptionsFieldset.querySelector(
        'button.js-send-data-btn'
      );

      // LOADING CONNECTION OPTIONS
      if (saveConnectionBtn) {
        // if there's a save-connection btn for the option
        // it means there can be stored connection options
        loadConnection(connectionOptionsFieldset);
      }

      validateForm({
        sendFormBtn,
        testConnectionBtn,
        fromFacebookFieldset: fromFacebook.fieldset,
        connectionOptionsFieldset
      });

      // disable save-connection btn both
      // - when options loaded(no need to save - data already saved)
      // - when loading failed (options in formset are empty)
      disableInput(saveConnectionBtn, true);
    }

    // if selected option with code - generate code
    if (selectedValue.slice(0, 4) === 'code') {
      generateCode(selectedValue.slice(5));
    }
  };

  const handleChangeSelectFormat = e => {
    changeConnectionOption(e.target.value);
  };

  // invokes passed function for testing connection
  // shows relevant message about success or error returned from the function
  // enables saveConnectionButton if connection succeeded (disabled when failed)
  const handleClickTestConnection = (testConnectionFunction, e) => {
    e.preventDefault();
    // get(create if doesn't exist) element with id basen on id of clicked button
    let messageElem = getMessageElement(e.target.id, e.target);

    testConnectionFunction()
      .then(response => {
        // connected successfully
        showItemMessage(messageElem, response, 'success');
        disableInput(saveConnectionBtn, false);
      })
      .catch(error => {
        // connection error occured
        console.error('Error in testing connection', error);

        showItemMessage(messageElem, `Connection failed: ${error}`, 'error');
        disableInput(saveConnectionBtn, true);
      });
  };

  const handleClickSaveConnection = e => {
    e.preventDefault();

    const messageElem = getMessageElement(e.target.id, e.target);

    // get activeFieldset of options (based on which button was clicked - get button's ancestor)
    const activeFieldset = e.target.closest(
      'fieldset.content-of-selected-option'
    );
    // save inputs names & values in localStorage with fieldset id as a key
    const isSavedSuccessfully = saveInLocalStorage(
      activeFieldset.id,
      getInputs(activeFieldset)
    );

    if (isSavedSuccessfully) {
      showItemMessage(messageElem, 'Connection options saved', 'success');
      disableInput(testConnectionBtn, true);
      disableInput(saveConnectionBtn, true);
    } else {
      showItemMessage(messageElem, 'Failed saving connection options', 'error');
      disableInput(testConnectionBtn, false);
    }
  };

  const handleClickSendForm = (sendFunction, e) => {
    e.preventDefault();

    // send id of clicked button to get or created message element in current option
    let messageElem = getMessageElement(e.target.id, e.target);

    // additional form checking - if form is invalid sending button should be anyway disabled and shouldn't get here
    const hasErrors =
      isTheFormIncorrect(fromFacebook.fieldset) ||
      isTheFormIncorrect(connectionOptionsFieldset); //checking fields scratched from fb and fields from selected sending option (function returns first field with an error from both)

    // If there are errors, don't submit form and focus on first element with error
    if (hasErrors) {
      hasErrors.focus();
      showItemMessage(messageElem, 'Please, complete the form', 'error');
      disableInput(sendFormBtn, true);
    } else {
      // if there's no error call given sendFunction (must return promise)
      sendFunction()
        .then(() => {
          // show succes and hide popup after defined time
          popup.classList.add('success');
          clearExtractedData(false);
          chrome.windows.getCurrent(win =>
            setTimeout(() => chrome.windows.remove(win.id), 4000)
          );
        })
        .catch(error => {
          showItemMessage(messageElem, error, 'error');
          disableInput(sendFormBtn, true);
        });
    }
  };

  const handleInputEvent = e => {
    validateForm({
      sendFormBtn,
      testConnectionBtn,
      fromFacebookFieldset: fromFacebook.fieldset,
      connectionOptionsFieldset
    });

    // disable save-connection button only if changed input is from fieldset with connection options
    disableInput(
      saveConnectionBtn,
      Boolean(e.target.closest('fieldset.content-of-selected-option'))
    );
  };

  // ADD EVENT LISTENERS

  scratchMeForm.addEventListener('input', handleInputEvent, true);

  // Choose a format
  selectDataFormat.addEventListener('change', handleChangeSelectFormat, false);

  // set handler for ALL SAVE CONNECTION BUTTONS
  // for each connection option (they share the same handler)
  saveConnectionButtonsArray.forEach(saveBtn => {
    saveBtn.addEventListener('click', handleClickSaveConnection);
  });

  // set handlers for GOOGLE SHEETS BUTTONS

  googleSheets.buttons.sendGoogleSheetsBtn.addEventListener(
    'click',
    handleClickSendForm.bind(null, () =>
      googleSheetsModule.sendDataToSave(
        //   TEMP
        [
          fromFacebook.formElements.postIdInput.value,
          fromFacebook.formElements.postAuthorInput.value,
          fromFacebook.formElements.postContentTextarea.value,
          fromFacebook.formElements.postDatetimeInput.value,
          fromFacebook.formElements.postUrlInput.value
        ],
        {
          sheetId: googleSheets.formElements.googleSpreadSheetIdInput.value,
          sheetTabName:
            googleSheets.formElements.googleSpreadSheetTabNameInput.value
        }
      )
    ),
    false
  );

  googleSheets.buttons.testConnectionGoogleSheetsBtn.addEventListener(
    'click',
    handleClickTestConnection.bind(null, () =>
      googleSheetsModule.testConnection({
        sheetId: googleSheets.formElements.googleSpreadSheetIdInput.value,
        sheetTabName:
          googleSheets.formElements.googleSpreadSheetTabNameInput.value
      })
    ),
    false
  );

  // set handlers for DUMMY API BUTTONS

  sendDummyApiBtn.addEventListener(
    'click',
    handleClickSendForm.bind(null, () =>
      // TEMP
      dummyApiModule.sendDataToSave(
        {
          postId: fromFacebook.formElements.postIdInput.value,
          postAuthor: fromFacebook.formElements.postAuthorInput.value,
          postContent: fromFacebook.formElements.postContentTextarea.value,
          postDatetime: fromFacebook.formElements.postDatetimeInput.value,
          postUrl: fromFacebook.formElements.postUrlInput.value
        },
        {
          userId: dummyApiUserId.value,
          userName: dummyApiUserName.value
        }
      )
    ),
    false
  );

  testConnectionDummyApiBtn.addEventListener(
    'click',
    handleClickTestConnection.bind(null, () =>
      dummyApiModule.testConnection({
        userId: dummyApiUserId.value,
        userName: dummyApiUserName.value
      })
    ),
    false
  );

  // set handlers for COOPER BUTTONS

  sendCooperBtn.addEventListener(
    'click',
    handleClickSendForm.bind(null, cooperModule.sendDataToSave),
    false
  );

  testConnectionCooperBtn.addEventListener(
    'click',
    handleClickTestConnection.bind(null, cooperModule.testConnection),
    false
  );

  clearDataBtn.addEventListener('click', clearExtractedData, false);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showFormScratchMe);
} else {
  showFormScratchMe();
}
