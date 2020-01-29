import googleSheetsModule from './modules/googleSheetsModule.js';
import cooperModule from './modules/cooperModule.js';
import {
  disableInput,
  showItemMessage,
  isTheFormIncorrect,
  getMessageElement,
  getInputs,
  loadConnection,
  validateForm
} from './modules/helpers.js';

const showFormScratchMe = () => {
  const popup = document.querySelector('.popup');

  // Form
  const scratchMeForm = document.getElementById('scratch-me-form');

  // Form fieldset with fields to be filled from facebook
  const fieldsetFromFacebook = document.getElementById('from-facebook');

  // Facebook data
  const postAuthorInput = document.getElementById('post-author');
  const postDatetimeInput = document.getElementById('post-datetime');
  const postTitleInput = document.getElementById('post-title');
  const postContentTextarea = document.getElementById('post-content');
  const postUrlInput = document.getElementById('post-url');
  const postIdInput = document.getElementById('post-id');

  // Select and display format e.g JSON/Cooper/cURL
  const selectDataFormat = document.getElementById('select-data-format');
  const codeAreaContent = document.getElementById('code-area-content');

  // Google Sheets data
  const googleSpreadSheetId = document.getElementById('google-spreadsheet-id');
  const googleSpreadSheetTabName = document.getElementById(
    'google-spreadsheet-tab-name'
  );

  // System CRM data
  const sysAccessTokenInput = document.getElementById('access-token');
  const sysAppNameInput = document.getElementById('application-name');
  const sysUserAppEmailInput = document.getElementById(
    'user-application-email'
  );

  let connectionOptionsFieldset; // flexible container - assigned when selected sending(storing) option (for validating fields only for chosen option)

  // Buttons
  let sendFormBtn; // flexible button for sending form - is assigned according to selected storing option
  let testConnectionBtn; // flexible button for testing selected connection - assigned when option selected
  let saveConnectionBtn; // flexible button for saving selected connection - assigned when option selected

  // get all saveConnetion buttons (all do the same)
  const saveConnectionButtonsArray = document.querySelectorAll(
    'button.js-save-connection-btn'
  );

  // Google Sheets buttons
  const sendGoogleSheetsBtn = document.getElementById('send-to-google-sheets');
  const testConnectionGoogleSheetsBtn = document.getElementById(
    'test-connection-google-sheets'
  );

  // Cooper buttons
  const sendCooperBtn = document.getElementById('send-to-cooper');
  const testConnectionCooperBtn = document.getElementById(
    'test-connection-cooper'
  );

  // Other buttons
  const copyToClipBtn = document.getElementById('copy-to-clip-btn');
  const clearDataBtn = document.getElementById('clear-data-btn');

  chrome.storage.sync.get(['postData'], storage => {
    setFieldsValue(storage.postData);
  });

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
        postAuthorInput.value = '';
        postContentTextarea.value = '';
        postDatetimeInput.value = '';
        postIdInput.value = '';
        postUrlInput.value = '';
        postTitleInput.value = '';
        codeAreaContent.innerHTML = '';
      });
    } catch (error) {
      console.log('Error: ' + error);
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

    postAuthorInput.value = author;
    postDatetimeInput.value = setDateTimeValue(uTime);
    postTitleInput.value = `${postId ? postId + ' - ' : ''}${content.slice(
      0,
      20
    )}... - ${author}`;
    postContentTextarea.value = content;
    postUrlInput.value = url;
    postIdInput.value = postId || '0';
  };

  const generateCode = codeName => {
    const data = {
      postId: postIdInput.value,
      postTitle: postTitleInput.value,
      author: postAuthorInput.value,
      content: postContentTextarea.value,
      datetime: postDatetimeInput.value,
      postUrl: postUrlInput.value
    };

    // Copy to clipboard
    copyToClipBtn.addEventListener('click', copyToClipboard, false);

    switch (codeName) {
      case 'json':
        codeAreaContent.innerHTML = `<code class="json-language"><span class="code-line">{</span>
<span class="code-line">  <span class="key">"id":</span> <span class="number">${postIdInput.value}</span>,</span>
<span class="code-line">  <span class="key">"title":</span> <span class="string">"${postTitleInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"author":</span> <span class="string">"${postAuthorInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"content":</span> <span class="string">"${postContentTextarea.value}"</span>,</span>
<span class="code-line">  <span class="key">"date":</span> <span class="string">"${postDatetimeInput.value}"</span>,</span>
<span class="code-line">  <span class="key">"post_url":</span> <span class="string">"${postUrlInput.value}"</span></span>
<span class="code-line">}</span></code>`;

        break;

      case 'curl':
        codeAreaContent.innerHTML = `<code class="curl-language"><span class="code-line">curl --location --request <span class="method">GET</span><span class="value">"https://api.prosperworks.com/developer_api/v1/account"</span><span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-AccessToken: ${sysAccessTokenInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-Application: ${sysAppNameInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"X-PW-UserEmail: ${sysUserAppEmailInput.value}"</span> <span class="se"> \\</span></span>
<span class="code-line">--header <span class="value">"Content-Type: application/json"</span></span></code>`;
        break;
    }
  };

  const handleChangeSelectFormat = e => {
    const targetValue = e.target.value;
    const contentOfSelectedOption = document.querySelectorAll(
      '.content-of-selected-option'
    );

    for (const content of contentOfSelectedOption)
      content.classList.add('disabled');

    const selectedContent = document.getElementById(
      `${targetValue.slice(0, 4) === 'code' ? 'code-area' : targetValue}`
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
        fieldsetFromFacebook,
        connectionOptionsFieldset
      });

      // disable save-connection btn both
      // - when options loaded(no need to save - data already saved)
      // - when loading failed (options in formset are empty)
      disableInput(saveConnectionBtn, true);
    }

    // if selected option with code - generate code
    if (targetValue.slice(0, 4) === 'code') {
      generateCode(targetValue.slice(5));
    }
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
        console.log('Error in testing connection', error);

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

    // get fieldset inputs names & values
    const connectionOptions = getInputs(activeFieldset);

    // store options
    try {
      localStorage.setItem(
        activeFieldset.id,
        JSON.stringify(connectionOptions)
      );
      showItemMessage(messageElem, 'Connection options saved', 'success');
      disableInput(testConnectionBtn, true);
      disableInput(saveConnectionBtn, true);
    } catch (error) {
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
      isTheFormIncorrect(fieldsetFromFacebook) ||
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
      fieldsetFromFacebook,
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

  sendGoogleSheetsBtn.addEventListener(
    'click',
    handleClickSendForm.bind(null, () =>
      // pass function to handle sending data to google spreadsheets
      googleSheetsModule.sendDataToSave(
        [
          postIdInput.value,
          postAuthorInput.value,
          postContentTextarea.value,
          postDatetimeInput.value,
          postUrlInput.value
        ],
        {
          sheetId: googleSpreadSheetId.value,
          sheetTabName: googleSpreadSheetTabName.value
        }
      )
    ),
    false
  );

  // TEMP - pass real function for testing connection
  testConnectionGoogleSheetsBtn.addEventListener(
    'click',
    handleClickTestConnection.bind(null, () =>
      Promise.resolve('Connected to fake GSheets')
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
    handleClickTestConnection.bind(null, () =>
      Promise.resolve('Connected successfully')
    ),
    false
  );

  clearDataBtn.addEventListener('click', clearExtractedData, false);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showFormScratchMe);
} else {
  showFormScratchMe();
}
