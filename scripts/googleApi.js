const API_KEY = 'AIzaSyB6kM6tDl569Wo8J_Ie_vn-iIHuGg64hpc';
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4'
];

function onGAPILoad() {
  gapi.client
    .init({
      apiKey: API_KEY,
      discoveryDocs: DISCOVERY_DOCS
    })
    .then(
      function() {
        console.log('gapi initialized');
      },
      function(error) {
        console.log('gapi initialization error', error);
      }
    );
}
