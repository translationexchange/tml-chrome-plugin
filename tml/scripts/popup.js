var PopupController = function () {
  this.toggle_button_             = $('#toggle_button');
  this.note_                      = $('#note');

  // Script customization
  this.customize_button_          = $('#customize_button');
  this.custom_script_checkbox_    = $('#custom_script_checkbox');
  this.custom_script_textarea_    = $('#custom_script_textarea');
  this.custom_url_regex_          = $('#custom_url_regex');
  this.custom_script_button_      = $('#custom_script_button');
  this.host_field_                = $('#host_field');

  this.updateLabels();
  this.addListeners_();

  this.showView('main');
};

var trex_default_host = "translation-center.translationexchange.com";

PopupController.prototype = {
  /**
   * A cached reference to the button element.
   *
   * @type {Element}
   * @private
   */
  toggle_button_: null,
  customize_button_: null,
  note_: null,
  host_field_: null,
  reset_cache_button_: null,
  custom_url_regex_: null,

  /**
   * Adds event listeners to the button in order to capture a user's click, and
   * perform some action in response.
   *
   * @private
   */
  addListeners_: function() {
    this.toggle_button_.on('click', this.toggletrex_.bind(this));
    this.customize_button_.on('click', this.togglecustomscript_.bind(this));
    this.custom_script_button_.on('click', this.updatecustomscript_.bind(this));

    $('[data-show-view]').on('click',   this.showView.bind(this));
  },

  resetCache_: function() {
    chrome.tabs.getSelected(null, function(tab){
      chrome.tabs.executeScript(tab.id, {code: "window.tml.clearCache();"}, function(response) {
      });
    });
  },

  getBackgroundPage: function() {
    return chrome.extension.getBackgroundPage();
  },

  log: function(msg) {
    this.getBackgroundPage().console.log(msg);
  },

  updateLabels: function() {
    var bgPage = this.getBackgroundPage();
    if (bgPage.trex_enabled) {
      this.note_.show()
      this.toggle_button_.text("Deactivate");
    } else {
      this.note_.hide()
      this.toggle_button_.text("Activate");
    }
  },

  setValues: function (data, callback) {
    var self = this;
    chrome.storage.local.set(data, function() {
      callback();
    });
  },

  getValues: function (keys, callback) {
    var self = this;
    return chrome.storage.local.get(keys, function(values) {
      callback(values);
    });
  },

  toggletrex_: function() {
    this.getBackgroundPage().trex_enabled = !this.getBackgroundPage().trex_enabled;
    this.updateLabels();
    this.reloadWindow();
  },

  togglecustomscript_: function() {
    var self = this;

    this.getValues(['trex_host', 'trex_custom_script_enabled', 'trex_custom_script', 'trex_custom_url_regex'], function(data) {
      self.custom_script_checkbox_.attr("checked", data.trex_custom_script_enabled);
      if (data.trex_custom_script)
        self.custom_script_textarea_.val(data.trex_custom_script);
      if (data.trex_host)
        self.host_field_.val(data.trex_host);
      if (data.trex_custom_url_regex)
        self.custom_url_regex_.val(data.trex_custom_url_regex);
      self.showView('custom_script_view');
    });
  },

  updatecustomscript_: function() {
    var self = this;

    var data = {
      trex_host: self.host_field_.val(),
      trex_custom_script_enabled: self.custom_script_checkbox_.is(':checked'),
      trex_custom_script: self.custom_script_textarea_.val(),
      trex_custom_url_regex: self.custom_url_regex_.val()
    };

    this.setValues(data, function() {
      self.showView('main');
      self.reloadWindow();
    });
  },

  reloadWindow: function () {
    var self = this;

    this.getValues(['trex_host', 'trex_custom_script_enabled', 'trex_custom_script', 'trex_custom_url_regex'], function(data) {
      self.getBackgroundPage().trex_host = data.trex_host || trex_default_host;
      self.getBackgroundPage().trex_custom_script_enabled = data.trex_custom_script_enabled;
      self.getBackgroundPage().trex_custom_script = data.trex_custom_script;
      self.getBackgroundPage().trex_custom_url_regex = data.trex_custom_url_regex;

      chrome.tabs.getSelected(null, function(tab) {
        var code = 'window.location.reload();';
        chrome.tabs.executeScript(tab.id, {code: code});
      });
    });

  },

  showView: function(name){
    if (name.currentTarget) {
      name = $(name.currentTarget).data('show-view')
    }
    $('.flash-error').remove();
    $('body').attr('class',name);
  }

};

$(function () {
  window.PC = new PopupController();
});








