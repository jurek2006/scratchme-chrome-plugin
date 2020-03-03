import localStor from '../modules/localStorage.js';

export class ConnectionOptions {
  constructor(scratchMeReference) {
    this._options = {};
    this._scratchMeReference = scratchMeReference;
  }

  registerNew(connectionOption) {
    Object.assign(this._options, {
      [connectionOption.id]: connectionOption
    });
    // set reference to whole scratchMe object in every connectionOption
    this._options[connectionOption.id].scratchMe = this._scratchMeReference;
  }

  setActive(selectedOptionId) {
    this._active && this._active.setHidden && this._active.setHidden();
    this._active =
      this._options[selectedOptionId] &&
      this._options[selectedOptionId].setVisible();
  }

  registerSelectSwitcher({ selectElement }) {
    this._selectOptionsSwitcher = selectElement;

    this._selectOptionsSwitcher.addEventListener(
      'change',
      e => {
        this.setActive(e.target.value);
        this.active &&
          this.active.updateStatus({
            outputDataToSave: this._scratchMeReference.outputDataToSave
          });
      },
      false
    );

    this._restoreLastConnectionOption();
  }
  _restoreLastConnectionOption() {
    const lastConnectionOption = localStor.read('last-connection-option');
    if (this._selectOptionsSwitcher && lastConnectionOption) {
      this._selectOptionsSwitcher.value = lastConnectionOption;
      // fire select change event
      this._selectOptionsSwitcher.dispatchEvent(new Event('change'));
    }
  }

  get active() {
    return this._active;
  }
}
