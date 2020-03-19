// placeholder function for future saving data in Cooper CRM
// has to return promise
const sendDataToSave = outputDataToSave => {
  console.log('Data passed to save in Cooper', outputDataToSave);
  return Promise.reject('Sending data to CooperCRM not implemented');
};

const testConnection = () => {
  return Promise.reject('CooperCRM not implemented');
};

export default { sendDataToSave, testConnection };
