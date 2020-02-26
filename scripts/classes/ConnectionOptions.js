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

  get active() {
    return this._active;
  }
}
