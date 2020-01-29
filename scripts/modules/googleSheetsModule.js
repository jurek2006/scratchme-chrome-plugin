// gets auth token from chrome.identity and sets as GAPI token
// resolves when done
const setToken = () => {
  return new Promise(resolve => {
    chrome.identity.getAuthToken(
      {
        interactive: true
      },
      function(token) {
        // Set GAPI auth token
        gapi.auth.setToken({
          access_token: token
        });

        resolve('ok');
      }
    );
  });
};

// if error returned from gapi unpacks it and translates message
const translateGapiErrors = error => {
  if (error && error.result && error.result.error) {
    // rephrase some gapi errors as clearer messages for user
    switch (error.result.error.status) {
      case 'NOT_FOUND':
        return 'Not found document with given id';
      case 'PERMISSION_DENIED':
        return 'No permission for the document';
      default:
        // different gapi error
        return error.result.error.message;
    }
  }
  return error; // not gapi error
};

// checks if there's sheet (sheetTabName) in google document with given id
// (also if there is document with sheetId and user has permissions to it)
// resolves if sheet in sheetId accessible for user
// otherwise rejects with error message
const verifyGoogleSheetsDocument = ({ sheetId, sheetTabName }) => {
  return gapi.client.sheets.spreadsheets
    .get({
      spreadsheetId: sheetId
    })
    .then(response => {
      // check if there is in the document the sheet with passed name
      const sheetsNames = response.result.sheets.map(
        sheet => sheet.properties.title
      );
      const isSheetWithName = Boolean(
        sheetsNames.find(name => name === sheetTabName.trim())
      );

      if (!isSheetWithName) {
        return Promise.reject(
          `Not found sheet ${sheetTabName} in the document`
        );
      }

      return Promise.resolve(`Sheet ${sheetTabName} found in the document`);
    })
    .catch(error => Promise.reject(translateGapiErrors(error)));
};

// test connection to google spreadsheet document
// (trying to store and then clean some testing data)
const testConnection = spreadsheetConfig => {
  /*
  - spreadsheetConfig - object passing data of sheet where to store:
    {
      sheetId,
      sheetTabName
    }
  */

  return setToken() // sets GAPI auth token
    .then(() => verifyGoogleSheetsDocument(spreadsheetConfig))
    .then(() => {
      // save testing data (row) in the sheet
      return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetConfig.sheetId,
        range: spreadsheetConfig.sheetTabName,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [['connection testing data', new Date()]]
        }
      });
    })
    .then(response => {
      // clear testing row from the sheet
      return gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: spreadsheetConfig.sheetId,
        range: response.result.updates.updatedRange
      });
    })
    .then(() => {
      return Promise.resolve('Connected successfully');
    })
    .catch(error => {
      return Promise.reject(translateGapiErrors(error));
    });
};

// saves given data to document/sheet defined in spreadsheetConfig (authenticates to google if needed)
// returns promise which resolves/rejects to operation status message
const sendDataToSave = (rowToSave, spreadsheetConfig) => {
  /*
  - rowToSave - one dimension array to store in GS as a row
  - spreadsheetConfig - object passing data of sheet where to store:
    {
      sheetId,
      sheetTabName
    }
  */

  // reject if no data to store passed
  if (!rowToSave || !Array.isArray(rowToSave) || rowToSave.length === 0) {
    return Promise.reject('Not passed data to store in Google Sheets');
  }

  return setToken()
    .then(() => verifyGoogleSheetsDocument(spreadsheetConfig))
    .then(() => {
      // Append values to the spreadsheet and resolve or reject
      return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetConfig.sheetId,
        range: spreadsheetConfig.sheetTabName,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowToSave]
        }
      });
    })
    .catch(error => Promise.reject(translateGapiErrors(error)));
};

export default { sendDataToSave, testConnection };
