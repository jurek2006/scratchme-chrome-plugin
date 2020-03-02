import googleSheetsModule from './../modules/googleSheetsModule.js';
import { ConnectionOption } from './../classes/ConnectionOption.js';

export const googleSheetsConnectionOption = new ConnectionOption({
  id: 'google-sheets',
  fieldsetElementInDom: document.getElementById('google-sheets')
});

googleSheetsConnectionOption.registerNamedFormElements({
  sheetId: '#google-spreadsheet-id',
  sheetTabName: '#google-spreadsheet-tab-name'
});

googleSheetsConnectionOption.registerNamedFormButtons({
  sendFormBtn: '#send-to-google-sheets',
  testConnectionBtn: '#test-connection-google-sheets',
  saveConnectionBtn: '#save-connection-google-sheets'
});

googleSheetsConnectionOption.registerActionOnInput(function({
  buttons,
  elements,
  isFieldsetValid,
  outputDataToSave
}) {
  const { sendFormBtn, testConnectionBtn } = buttons;
  this.enableInput(sendFormBtn, outputDataToSave && isFieldsetValid);
  this.enableInput(testConnectionBtn, isFieldsetValid);
});

googleSheetsConnectionOption._testingConnectionFunction = function({
  connectionOptionDetails
}) {
  return googleSheetsModule.testConnection(connectionOptionDetails);
};

googleSheetsConnectionOption._sendingDataFunction = function({
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
