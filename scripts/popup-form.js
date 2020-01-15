'use strict';

const API_KEY = 'AIzaSyB6kM6tDl569Wo8J_Ie_vn-iIHuGg64hpc';
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4'
];

function onGAPILoad() {
  gapi.client
    .init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS
    })
    .then(
      function() {
        console.log('gapi initialized');
      },
      function(error) {
        console.log('error', error);
      }
    );
}

// saves given data to sheet defined in spreadsheetConfig (authenticates to google if needed)
// returns promise which resolves/rejects to operation status message
function saveToGoogleSheets(rowToSave, spreadsheetConfig) {
  /*
  - rowToSave - one dimension array to store in GS as a row
  - spreadsheetConfig - object pointint to sheet where to store:
    {
      sheetId,
      sheetTabName
    }
  */
  const isGoogleConfigPassed =
    spreadsheetConfig &&
    spreadsheetConfig.sheetId &&
    spreadsheetConfig.sheetId.length > 0 &&
    spreadsheetConfig.sheetTabName &&
    spreadsheetConfig.sheetTabName.length > 0;

  if (!isGoogleConfigPassed) {
    return Promise.reject('Spreadsheet ID and/or Tab not defined');
  }

  if (!rowToSave || !Array.isArray(rowToSave) || rowToSave.length === 0) {
    return Promise.reject('Not passed data to store in Google Sheets');
  }

  return new Promise((resolve, reject) => {
    // get the token
    chrome.identity.getAuthToken(
      {
        interactive: true
      },
      function(token) {
        // Set GAPI auth token
        gapi.auth.setToken({
          access_token: token
        });

        const body = {
          values: [rowToSave]
        };

        // Append values to the spreadsheet and resolve or reject
        gapi.client.sheets.spreadsheets.values
          .append({
            spreadsheetId: spreadsheetConfig.sheetId,
            range: spreadsheetConfig.sheetTabName,
            valueInputOption: 'USER_ENTERED',
            resource: body
          })
          .then(response => {
            resolve(`${response.result.updates.updatedCells} cells appended.`);
          })
          .catch(error => {
            reject(
              `Error when writing to GoogleSheet - ${error.result.error.status} - ${error.result.error.message}`
            );
          });
      }
    );
  });
}

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
  const googleSpreadSheetFieldset = document.getElementById('google-sheets');
  const googleSpreadSheetId = document.getElementById('google-spreadsheet-id');
  const googleSpreadSheetTabName = document.getElementById(
    'google-spreadsheet-tab-name'
  );

  // System CRM data
  const cooperFieldset = document.getElementById('cooper');
  const sysAccessTokenInput = document.getElementById('access-token');
  const sysAppNameInput = document.getElementById('application-name');
  const sysUserAppEmailInput = document.getElementById(
    'user-application-email'
  );

  // Buttons
  let sendFormBtn; // flexible button for sending form - is changed according to selected storing option
  let sendingOptionsFieldset; // flexible container - changed when selected sending(storing) option (for validating fields only for chosen option)

  const sysSaveConnectionBtn = document.getElementById('save-connection');
  const sysTestConnectionBtn = document.getElementById('test-connection');
  const sendGoogleSheetsBtn = document.getElementById('send-to-google-sheets');
  const sendCooperBtn = document.getElementById('send-to-cooper');
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

  const getMessageElement = (id, targetElem) => {
    let messageElem = targetElem.form.querySelector(
      '.result-message#message-for-' + id
    );

    if (!messageElem) {
      messageElem = document.createElement('div');
      messageElem.className = 'result-message';
      messageElem.id = 'message-for-' + id;

      // Otherwise, insert it after the field
      let label;
      if (!label) {
        targetElem.parentNode.insertBefore(messageElem, targetElem.parent);
      }
    }

    return messageElem;
  };

  const showItemMessage = (
    messageElem,
    text,
    itemClassName,
    disabledElem,
    isDisable
  ) => {
    messageElem.classList.add(itemClassName);
    messageElem.innerHTML = text;
    disabledElem.disabled = isDisable;

    // Show error message
    messageElem.style.display = 'block';
    messageElem.style.visibility = 'visible';

    setTimeout(() => {
      messageElem.innerHTML = '';
      messageElem.style.display = 'none';
      messageElem.style.visibility = 'hidden';
    }, 5000);
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

  const hasError = field => {
    // Don't validate submits, buttons, file and reset inputs, and disabled fields
    if (
      field.disabled ||
      field.type === 'file' ||
      field.type === 'reset' ||
      field.type === 'submit' ||
      field.type === 'button'
    )
      return;

    sysTestConnectionBtn.disabled = true;

    const validity = field.validity;

    if (validity.valid) return;

    // If field is required and empty
    if (validity.valueMissing) return 'Please fill out this field.';

    // If not the right type
    if (validity.typeMismatch) {
      if (field.type === 'email') return 'Please enter an email address.';
      if (field.type === 'url') return 'Please enter a URL.';
    }

    // If too short
    if (validity.tooShort)
      return (
        'Please lengthen this text to ' +
        field.getAttribute('minLength') +
        ' characters or more. You are currently using ' +
        field.value.length +
        ' characters.'
      );

    // If too long
    if (validity.tooLong)
      return (
        'Please shorten this text to no more than ' +
        field.getAttribute('maxLength') +
        ' characters. You are currently using ' +
        field.value.length +
        ' characters.'
      );

    // If number input isn't a number
    if (validity.badInput) return 'Please enter a number.';

    // If pattern doesn't match
    if (validity.patternMismatch) {
      // If pattern info is included, return custom error
      if (field.hasAttribute('title')) return field.getAttribute('title');

      // Otherwise, generic error
      return 'Please match the requested format.';
    }

    // If all else fails, return a generic catchall error
    return 'The value you entered for this field is invalid.';
  };

  // Show an error message
  const showError = (field, error) => {
    // Add error class to field
    field.classList.add('error');

    // Get field id or name
    const id = field.id || field.name;
    if (!id) return;
    // Check if error message field already exists
    // If not, create one
    let message = field.form.querySelector('.error-message#error-for-' + id);
    if (!message) {
      message = document.createElement('div');
      message.className = 'error-message';
      message.id = 'error-for-' + id;

      // Otherwise, insert it after the field
      let label;

      if (!label) {
        field.parentNode.insertBefore(message, field.nextSibling);
      }
    }

    // Add ARIA role to the field
    field.setAttribute('aria-describedby', 'error-for-' + id);

    // Update error message
    message.innerHTML = error;

    // Show error message
    message.style.display = 'block';
    message.style.visibility = 'visible';
  };

  // Remove the error message
  const removeError = field => {
    if (
      sysAccessTokenInput.value &&
      sysAppNameInput.value &&
      sysUserAppEmailInput.value
    ) {
      sysTestConnectionBtn.disabled = false;
    }

    // Remove error class to field
    field.classList.remove('error');

    // Remove ARIA role from the field
    field.removeAttribute('aria-describedby');

    // Get field id or name
    const id = field.id || field.name;
    if (!id) return;

    // Check if an error message is in the DOM
    let message = field.form.querySelector(
      '.error-message#error-for-' + id + ''
    );
    if (!message) return;

    // If so, hide it
    message.innerHTML = '';
    message.style.display = 'none';
    message.style.visibility = 'hidden';
  };

  // Validates and checks that form fields in formItem are correct. Return the first field with an arror.
  const isTheFormIncorrect = formItem => {
    // formItem can be form or fieldset element

    // Validate each field
    // Store the first field with an error to a variable so we can bring it into focus later

    const fields = formItem.elements;
    let error, hasErrors;

    for (let i = 0; i < fields.length; i++) {
      error = hasError(fields[i]);
      if (error) {
        showError(fields[i], error);
        if (!hasErrors) {
          hasErrors = fields[i];
        }
      }
    }

    return hasErrors;
  };

  // grabs fields values and sends to GoogleSheets
  // (passes promise)
  const saveFieldsToGoogleSheets = () =>
    saveToGoogleSheets(
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
    );

  // grabs fields values and sends to CooperCRM
  // returns promise
  const saveFieldsToCooper = () => {
    return Promise.reject('Handling CooperCRM not implemented');
  };

  // Listen to all input event
  const handleInputEvent = e => {
    // Validate the field
    let error = hasError(e.target);

    // Button disabled when the form is incorrect
    // Checking fieldset with fields from facebook and fieldset for chosen sending option (e.g. GoogleSheets or Cooper)
    if (sendFormBtn) {
      sendFormBtn.disabled =
        Boolean(isTheFormIncorrect(fieldsetFromFacebook)) ||
        Boolean(isTheFormIncorrect(sendingOptionsFieldset));
    }

    // If there's an error, show it
    if (error) {
      showError(e.target, error);
      return;
    }

    // Otherwise, remove any existing error message
    removeError(e.target);
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

    if (selectedContent) selectedContent.classList.remove('disabled');

    if (targetValue === 'google-sheets') {
      // set active button for sending and fieldset for validating option configuration fields
      sendFormBtn = sendGoogleSheetsBtn;
      sendingOptionsFieldset = googleSpreadSheetFieldset;
    } else if (targetValue === 'cooper') {
      // set active button for sending and fieldset for validating option configuration fields
      sendFormBtn = sendCooperBtn;
      sendingOptionsFieldset = cooperFieldset;

      sysAccessTokenInput.required = true;
      sysAppNameInput.required = true;
      sysUserAppEmailInput.required = true;
      sysUserAppEmailInput.pattern = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';

      const retrievedObject = localStorage.getItem('systemConnectionData');
      const connectionData = JSON.parse(retrievedObject);

      if (connectionData) {
        sysAccessTokenInput.value = connectionData['X-PW-AccessToken'];
        sysAppNameInput.value = connectionData['X-PW-Application'];
        sysUserAppEmailInput.value = connectionData['X-PW-UserEmail'];
      }
    } else if (targetValue.slice(0, 4) === 'code') {
      generateCode(targetValue.slice(5));
    } else {
      sysAccessTokenInput.required = false;
      sysAppNameInput.required = false;
      sysUserAppEmailInput.required = false;
      sysUserAppEmailInput.removeAttribute('pattern');
    }
  };

  const handleClickTestConnection = e => {
    e.preventDefault();
    let messageElem = getMessageElement('test-connection', e.target);

    const url = 'https://example.com';
    // const data = { username: 'example' };

    fetch(url, {
      method: 'GET'
      // body: JSON.stringify(data),
      // headers: {
      //     'Content-Type': 'application/json',
      //     'X-PW-AccessToken': sysAccessTokenInput.value,
      //     'X-PW-Application': sysAppNameInput.value,
      //     'X-PW-UserEmail': sysUserAppEmailInput.value
      // }
    })
      .then(res => res.json())
      .then(response => {
        console.log('Success:', JSON.stringify(response));
        showItemMessage(
          messageElem,
          'Connection success',
          'success-message',
          sysSaveConnectionBtn,
          false
        );
      })
      .catch(error => {
        console.error('Error:', error);
        if (sendFormBtn) {
          sendFormBtn.disabled = false;
        }
        showItemMessage(
          messageElem,
          'Connection failed',
          'error-message',
          sysSaveConnectionBtn,
          true
        );
      });
  };

  const handleClickSaveConnection = e => {
    e.preventDefault();

    const systemConnectionData = {
      'X-PW-AccessToken': sysAccessTokenInput.value,
      'X-PW-Application': sysAppNameInput.value,
      'X-PW-UserEmail': sysUserAppEmailInput.value
    };

    try {
      localStorage.setItem(
        'systemConnectionData',
        JSON.stringify(systemConnectionData)
      );
    } catch (error) {
      console.log('Error: ' + error);
    }
  };

  const handleClickSendForm = (sendFunction, e) => {
    e.preventDefault();

    // send id of clicked button to get or created message element in current option
    let messageElem = getMessageElement(e.target.id, e.target);

    // additional form checking - if form is invalid sending button should be anyway disabled and shouldn't get here
    const hasErrors =
      isTheFormIncorrect(fieldsetFromFacebook) ||
      isTheFormIncorrect(sendingOptionsFieldset); //checking fields scratched from fb and fields from selected sending option (function returns first field with an error from both)

    // If there are errors, don't submit form and focus on first element with error
    if (hasErrors) {
      hasErrors.focus();
      showItemMessage(
        messageElem,
        'Please, complete the form',
        'error-message',
        sysSaveConnectionBtn,
        true
      );
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
          showItemMessage(
            messageElem,
            error,
            'error-message',
            sysSaveConnectionBtn,
            true
          );
        });
    }
  };

  // Listen to all input events
  scratchMeForm.addEventListener('input', handleInputEvent, true);
  // Choose a format
  selectDataFormat.addEventListener('change', handleChangeSelectFormat, false);

  sysTestConnectionBtn.addEventListener(
    'click',
    handleClickTestConnection,
    false
  );

  sysSaveConnectionBtn.addEventListener(
    'click',
    handleClickSaveConnection,
    false
  );

  sendGoogleSheetsBtn.addEventListener(
    'click',
    handleClickSendForm.bind(null, saveFieldsToGoogleSheets),
    false
  );

  sendCooperBtn.addEventListener(
    'click',
    handleClickSendForm.bind(null, saveFieldsToCooper),
    false
  );

  clearDataBtn.addEventListener('click', clearExtractedData, false);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', showFormScratchMe);
} else {
  showFormScratchMe();
}
