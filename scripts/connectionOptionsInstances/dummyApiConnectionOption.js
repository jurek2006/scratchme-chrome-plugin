import dummyApiModule from '../modules/dummyApiModule.js';
import { ConnectionOption } from '../classes/ConnectionOption.js';

export const dummyApiConnectionOption = new ConnectionOption({
  id: 'dummy-api',
  fieldsetElementInDom: document.getElementById('dummy-api')
});

dummyApiConnectionOption.registerNamedFormElements({
  userId: '#dummy-api-user-id',
  userName: '#dummy-api-user-name'
});

dummyApiConnectionOption.registerNamedFormButtons({
  sendFormBtn: '#send-to-dummy-api',
  testConnectionBtn: '#test-connection-dummy-api',
  saveConnectionBtn: '#save-connection-dummy-api'
});

dummyApiConnectionOption.registerActionOnInput(function({
  buttons,
  elements,
  isFieldsetValid,
  outputDataToSave
}) {
  const { sendFormBtn, testConnectionBtn } = buttons;
  this.enableInput(sendFormBtn, outputDataToSave && isFieldsetValid);
  this.enableInput(testConnectionBtn, isFieldsetValid);
});

dummyApiConnectionOption._testingConnectionFunction = function({
  connectionOptionDetails
}) {
  return dummyApiModule.testConnection(connectionOptionDetails);
};

dummyApiConnectionOption._sendingDataFunction = function({
  outputDataToSave,
  connectionOptionDetails
}) {
  return dummyApiModule.sendDataToSave(
    outputDataToSave,
    connectionOptionDetails
  );
};
