const sendDataToSave = (dataToSave, dummyApiConfig) => {
  const { postId, postAuthor, postContent, postDatetime, postUrl } = dataToSave;

  return fetch('https://jsonplaceholder.typicode.com/posts', {
    method: 'POST',
    body: JSON.stringify({
      userId: dummyApiConfig.userId,
      userName: dummyApiConfig.userName,
      postId,
      postAuthor,
      postContent,
      postDatetime,
      postUrl
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8'
    }
  })
    .then(response => response.json())
    .then(responseJson => {
      if (
        responseJson.userId === dummyApiConfig.userId &&
        responseJson.userName === dummyApiConfig.userName &&
        responseJson.postId === postId &&
        responseJson.postAuthor === postAuthor &&
        responseJson.postContent === postContent &&
        responseJson.postDatetime === postDatetime &&
        responseJson.postUrl === postUrl
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
