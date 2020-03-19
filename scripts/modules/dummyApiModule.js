const sendDataToSave = (dataToSave, dummyApiConfig) => {
  const {
    personName,
    personCompany,
    personPosition,
    personProfileUrl
  } = dataToSave;

  const dataForRequest = {
    userId: dummyApiConfig.userId,
    userName: dummyApiConfig.userName,
    personName,
    personCompany,
    personPosition,
    personProfileUrl
  };

  console.log('Sending with request to dummy api', dataForRequest);

  return fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify(dataForRequest),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
    .then(response => response.json())
    .then(responseJson => {
      console.log('Got response from dummy api', responseJson);
      if (
        responseJson.userId === dummyApiConfig.userId &&
        responseJson.userName === dummyApiConfig.userName &&
        responseJson.personName === personName &&
        responseJson.personCompany === personCompany &&
        responseJson.personPosition === personPosition &&
        responseJson.personProfileUrl === personProfileUrl
      ) {
        return Promise.resolve('Data sent and received successfully');
      }
      return Promise.reject('Parameters sent not match');
    });
};

const testConnection = dummyApiConfig => {
  return fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify({
      userId: dummyApiConfig.userId,
      userName: dummyApiConfig.userName
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
    .then(response => response.json())
    .then(responseJson => {
      if (
        responseJson.userId === dummyApiConfig.userId &&
        responseJson.userName === dummyApiConfig.userName
      ) {
        return Promise.resolve('Connected successfully');
      }
      return Promise.reject('Parameters not match');
    })
    .catch(error => Promise.reject(error));
};

export default { sendDataToSave, testConnection };
