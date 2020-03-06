import { ScratchMe } from './classes/ScratchMe.js';
import { googleSheetsConnectionOption } from './connectionOptionsInstances/googleSheetsConnectionOption.js';
import { dummyApiConnectionOption } from './connectionOptionsInstances/dummyApiConnectionOption.js';
import { cooperConnectionOption } from './connectionOptionsInstances/cooperConnectionOption.js';
import { jsonOptionConnectionOption } from './connectionOptionsInstances/jsonConnectionOption.js';

const scratchMe = new ScratchMe();
scratchMe.connectionOptions.registerNew(googleSheetsConnectionOption);
scratchMe.connectionOptions.registerNew(dummyApiConnectionOption);
scratchMe.connectionOptions.registerNew(cooperConnectionOption);
scratchMe.connectionOptions.registerNew(jsonOptionConnectionOption);
scratchMe.connectionOptions.registerSelectSwitcher({
  selectElement: document.getElementById('select-data-format')
});
