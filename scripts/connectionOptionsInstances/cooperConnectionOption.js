import cooperModule from '../modules/cooperModule.js';
import { ConnectionOption } from '../classes/ConnectionOption.js';

export const cooperConnectionOption = new ConnectionOption({
  id: 'cooper',
  fieldsetElementInDom: document.getElementById('cooper')
});

cooperConnectionOption.registerNamedFormElements({
  accessToken: '#cooper-access-token',
  applicationName: '#cooper-application-name',
  applicationEmail: '#cooper-user-application-email'
});

cooperConnectionOption.registerNamedFormButtons({
  sendFormBtn: '#send-to-cooper',
  testConnectionBtn: '#test-connection-cooper',
  saveConnectionBtn: '#save-connection-cooper'
});

cooperConnectionOption.registerActionOnInput(function({
  buttons,
  elements,
  isFieldsetValid,
  outputDataToSave
}) {
  const { sendFormBtn, testConnectionBtn } = buttons;
  this.enableInput(sendFormBtn, outputDataToSave && isFieldsetValid);
  this.enableInput(testConnectionBtn, isFieldsetValid);
});

cooperConnectionOption._testingConnectionFunction = function({
  connectionOptionDetails
}) {
  return cooperModule.testConnection(connectionOptionDetails);
};

cooperConnectionOption._sendingDataFunction = function({
  outputDataToSave,
  connectionOptionDetails
}) {
  return cooperModule.sendDataToSave(outputDataToSave, connectionOptionDetails);
};
