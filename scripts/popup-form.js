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
  jsonContent: '#code-area-content',
  copyToClipboardContent: '#copy-to-clipboard-content',
  copyToClipMessage: 'span.copy-clip-message'
});
jsonOption.registerNamedFormButtons({
  copyToClipboardBtn: '#copy-to-clip-btn'
});
jsonOption.registerActionOnInput(function({ elements, outputDataToSave }) {
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
jsonOption.invokeFunction(function({ elements, buttons, formOutput }) {
  const { copyToClipboardBtn } = buttons;
  const { jsonContent, copyToClipboardContent, copyToClipMessage } = elements;
  copyToClipboardBtn.addEventListener(
    'click',
    () => {
      copyToClipboardContent.value = jsonContent.textContent;
      copyToClipboardContent.select();
      document.execCommand('copy');
      copyToClipboardContent.blur();

      copyToClipMessage.classList.add('active');
      setTimeout(() => {
        copyToClipMessage.classList.remove('active');
      }, 4000);
    },
    false
  );
});

const scratchMe = new ScratchMe();
scratchMe.connectionOptions.registerNew(googleSheetsMMM);
scratchMe.connectionOptions.registerNew(dummyApiMMM);
scratchMe.connectionOptions.registerNew(jsonOption);
scratchMe.connectionOptions.registerSelectSwitcher({
  selectElement: document.getElementById('select-data-format')
});
