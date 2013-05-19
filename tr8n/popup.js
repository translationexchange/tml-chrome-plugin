var PopupController = function () {
  this.toggle_button_ = document.getElementById('toggle_button');
  this.note_ = document.getElementById('note');

  this.host_ = document.getElementById('host');
  this.host_form_ = document.getElementById('host_form');
  this.host_field_ = document.getElementById('host_field');
  this.host_button_ = document.getElementById('host_button');

  this.updateLabels();
  this.addListeners_();
};

PopupController.prototype = {
  /**
   * A cached reference to the button element.
   *
   * @type {Element}
   * @private
   */
  toggle_button_: null,
  note_: null,
  host_: null,
  host_form_: null,
  host_field_: null,
  host_button_: null,

  /**
   * Adds event listeners to the button in order to capture a user's click, and
   * perform some action in response.
   *
   * @private
   */
  addListeners_: function() {
    this.toggle_button_.addEventListener('click', this.toggleTr8n_.bind(this));
    this.host_.addEventListener('dblclick', this.showHostForm_.bind(this));
    this.host_button_.addEventListener('click', this.setHost_.bind(this));
  },

  updateLabels: function() {
    var bgPage = chrome.extension.getBackgroundPage();
    this.host_.innerHTML = bgPage.tr8n_host;
    if (bgPage.tr8n_enabled) {
      this.note_.style.display = "block";
      this.toggle_button_.innerHTML = "Disable";
    } else {
      this.note_.style.display = "none";
      this.toggle_button_.innerHTML = "Enable";
    }
  },

  toggleTr8n_: function() {
    chrome.extension.getBackgroundPage().tr8n_enabled = !chrome.extension.getBackgroundPage().tr8n_enabled;
    this.updateLabels();
    this.reloadWindow();
  },

  showHostForm_: function() {
    var bgPage = chrome.extension.getBackgroundPage();
    this.host_field_.value = bgPage.tr8n_host;
    this.host_.style.display = "none";
    this.host_form_.style.display = "block";
  },

  setHost_: function () {
    var bgPage = chrome.extension.getBackgroundPage();
    bgPage.tr8n_host = this.host_field_.value;

    this.host_.style.display = "block";
    this.host_form_.style.display = "none";
    this.updateLabels();
    this.reloadWindow();
  },

  reloadWindow: function () {
    chrome.tabs.getSelected(null, function(tab) {
      var code = 'window.location.reload();';
      chrome.tabs.executeScript(tab.id, {code: code});
    });
  }

};

document.addEventListener('DOMContentLoaded', function () {
  window.PC = new PopupController();
});