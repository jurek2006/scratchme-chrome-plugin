// saves given data to sheet defined in spreadsheetConfig (authenticates to google if needed)
// returns promise which resolves/rejects to operation status message
const sendDataToSave = (rowToSave, spreadsheetConfig) => {
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
};

export default { sendDataToSave };
