import googleSheetsModule from './modules/googleSheetsModule.js';
import cooperModule from './modules/cooperModule.js';
import dummyApiModule from './modules/dummyApiModule.js';
import { ConnectionOption } from './classes/ConnectionOption.js';
import { ScratchMe } from './classes/ScratchMe.js';

const googleSheetsMMM = new ConnectionOption({
  id: 'google-sheets',
  fieldsetElementInDom: document.getElementById('google-sheets')
});
googleSheetsMMM.registerNamedFormElements({
  sheetId: '#google-spreadsheet-id',
  sheetTabName: '#google-spreadsheet-tab-name'
});
googleSheetsMMM.registerNamedFormButtons({
  sendFormBtn: '#send-to-google-sheets',
  testConnectionBtn: '#test-connection-google-sheets',
  saveConnectionBtn: '#save-connection-google-sheets'
});
googleSheetsMMM.registerActionOnInput(function({
  buttons,
  elements,
  isFieldsetValid,
  outputDataToSave
}) {
  const { sendFormBtn, testConnectionBtn } = buttons;
  this.enableInput(sendFormBtn, outputDataToSave && isFieldsetValid);
  this.enableInput(testConnectionBtn, isFieldsetValid);
});
googleSheetsMMM._testingConnectionFunction = function({
  connectionOptionDetails
}) {
  return googleSheetsModule.testConnection(connectionOptionDetails);
};
googleSheetsMMM._sendingDataFunction = function({
  outputDataToSave,
  connectionOptionDetails
}) {
  function convertToOrderedDataArray(data, keysInOrder) {
    if (!data || !keysInOrder) return;
    return keysInOrder.map(key => data[key]);
  }

  const postDataToSave = convertToOrderedDataArray(outputDataToSave, [
    'postId',
    'postAuthor',
    'postContent',
    'postDatetime',
    'postUrl'
  ]);

  return googleSheetsModule.sendDataToSave(
    postDataToSave,
    connectionOptionDetails
  );
};

const dummyApiMMM = new ConnectionOption({
  id: 'dummy-api',
  fieldsetElementInDom: document.getElementById('dummy-api')
});
dummyApiMMM.registerNamedFormElements({
  userId: '#dummy-api-user-id',
  userName: '#dummy-api-user-name'
});
dummyApiMMM.registerNamedFormButtons({
  sendFormBtn: '#send-to-dummy-api',
  testConnectionBtn: '#test-connection-dummy-api',
  saveConnectionBtn: '#save-connection-dummy-api'
});
dummyApiMMM.registerActionOnInput(function({
  buttons,
  elements,
  isFieldsetValid,
  outputDataToSave
}) {
  const { sendFormBtn, testConnectionBtn } = buttons;
  this.enableInput(sendFormBtn, outputDataToSave && isFieldsetValid);
  this.enableInput(testConnectionBtn, isFieldsetValid);
});
dummyApiMMM._testingConnectionFunction = function({ connectionOptionDetails }) {
  return dummyApiModule.testConnection(connectionOptionDetails);
};
dummyApiMMM._sendingDataFunction = function({
  outputDataToSave,
  connectionOptionDetails
}) {
  return dummyApiModule.sendDataToSave(
    outputDataToSave,
    connectionOptionDetails
  );
};

const jsonOption = new ConnectionOption({
  id: 'code-json',
  fieldsetElementInDom: document.getElementById('code-json')
});
jsonOption.registerNamedFormElements({
  jsonContent: '#code-area-content'
});
jsonOption.registerActionOnInput(function({ elements, outputDataToSave }) {
  console.log('action', elements, outputDataToSave);

  const { jsonContent } = elements;
  if (outputDataToSave) {
    const {
      postId,
      postTitle,
      postAuthor,
      postContent,
      postDatetime,
      postUrl
    } = outputDataToSave;
    jsonContent.innerHTML = `<code class="json-language"><span class="code-line">{</span>
  <span class="code-line">  <span class="key">"id":</span> <span class="number">${postId}</span>,</span>
  <span class="code-line">  <span class="key">"title":</span> <span class="string">"${postTitle}"</span>,</span>
  <span class="code-line">  <span class="key">"author":</span> <span class="string">"${postAuthor}"</span>,</span>
  <span class="code-line">  <span class="key">"content":</span> <span class="string">"${postContent}"</span>,</span>
  <span class="code-line">  <span class="key">"date":</span> <span class="string">"${postDatetime}"</span>,</span>
  <span class="code-line">  <span class="key">"post_url":</span> <span class="string">"${postUrl}"</span></span> 
  <span class="code-line">}</span></code>`;
  } else {
    jsonContent.innerHTML = 'Not valid post data form';
  }
});

const scratchMe = new ScratchMe();
scratchMe.connectionOptions.registerNew(googleSheetsMMM);
scratchMe.connectionOptions.registerNew(dummyApiMMM);
scratchMe.connectionOptions.registerNew(jsonOption);
scratchMe.connectionOptions.registerSelectSwitcher({
  selectElement: document.getElementById('select-data-format')
});

// const showFormScratchMe = () => {
//   // Select and display format e.g JSON/Cooper/cURL
//   const selectDataFormat = document.getElementById('select-data-format');
//   const codeAreaContent = document.getElementById('code-area-content');

//   // Other buttons
//   const copyToClipBtn = document.getElementById('copy-to-clip-btn');
//   const clearDataBtn = document.getElementById('clear-data-btn');

//   const copyToClipboard = e => {
//     e.preventDefault();

//     const copyToClipContent = document.getElementById(
//       'copy-to-clipboard-content'
//     );
//     const copyToClipMessage = document.querySelector('span.copy-clip-message');
//     copyToClipContent.value = codeAreaContent.textContent;

//     copyToClipContent.select();
//     document.execCommand('copy');
//     copyToClipContent.blur();

//     copyToClipMessage.classList.add('active');
//     setTimeout(() => {
//       copyToClipMessage.classList.remove('active');
//     }, 4000);
//   };

//   const clearExtractedData = e => {
//     if (e) e.preventDefault();

//     try {
//       chrome.storage.sync.remove(['postData'], items => {
//         fromFacebook.formElements.postAuthorInput.value = '';
//         fromFacebook.formElements.postContentTextarea.value = '';
//         fromFacebook.formElements.postDatetimeInput.value = '';
//         fromFacebook.formElements.postIdInput.value = '';
//         fromFacebook.formElements.postUrlInput.value = '';
//         fromFacebook.formElements.postTitleInput.value = '';
//         codeAreaContent.innerHTML = '';
//       });
//     } catch (error) {
//       console.error('Error: ' + error);
//     }
//   };

//   const generateCode = codeName => {
//     const data = {
//       postId: fromFacebook.formElements.postIdInput.value,
//       postTitle: fromFacebook.formElements.postTitleInput.value,
//       author: fromFacebook.formElements.postAuthorInput.value,
//       content: fromFacebook.formElements.postContentTextarea.value,
//       datetime: fromFacebook.formElements.postDatetimeInput.value,
//       postUrl: fromFacebook.formElements.postUrlInput.value
//     };

//     // Copy to clipboard
//     copyToClipBtn.addEventListener('click', copyToClipboard, false);

//     switch (codeName) {
//       case 'json':
//         codeAreaContent.innerHTML = `<code class="json-language"><span class="code-line">{</span>
// <span class="code-line">  <span class="key">"id":</span> <span class="number">${fromFacebook.formElements.postIdInput.value}</span>,</span>
// <span class="code-line">  <span class="key">"title":</span> <span class="string">"${fromFacebook.formElements.postTitleInput.value}"</span>,</span>
// <span class="code-line">  <span class="key">"author":</span> <span class="string">"${fromFacebook.formElements.postAuthorInput.value}"</span>,</span>
// <span class="code-line">  <span class="key">"content":</span> <span class="string">"${fromFacebook.formElements.postContentTextarea.value}"</span>,</span>
// <span class="code-line">  <span class="key">"date":</span> <span class="string">"${fromFacebook.formElements.postDatetimeInput.value}"</span>,</span>
// <span class="code-line">  <span class="key">"post_url":</span> <span class="string">"${fromFacebook.formElements.postUrlInput.value}"</span></span>
// <span class="code-line">}</span></code>`;

//         break;

//       case 'curl':
//         codeAreaContent.innerHTML = `<code class="curl-language"><span class="code-line">curl --location --request <span class="method">GET</span><span class="value">"https://api.prosperworks.com/developer_api/v1/account"</span><span class="se"> \\</span></span>
// <span class="code-line">--header <span class="value">"X-PW-AccessToken: ${cooperAccessTokenInput.value}"</span> <span class="se"> \\</span></span>
// <span class="code-line">--header <span class="value">"X-PW-Application: ${cooperAppNameInput.value}"</span> <span class="se"> \\</span></span>
// <span class="code-line">--header <span class="value">"X-PW-UserEmail: ${cooperUserAppEmailInput.value}"</span> <span class="se"> \\</span></span>
// <span class="code-line">--header <span class="value">"Content-Type: application/json"</span></span></code>`;
//         break;
//     }
//   };
// };
