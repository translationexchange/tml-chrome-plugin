var PopupController = function () {
  this.toggle_button_ = $('#toggle_button');
  this.note_          = $('#note');
  this.host_          = $('#host');
  this.host_form_     = $('#host_form');
  this.host_field_    = $('#host_field');
  this.host_button_   = $('#host_button');
  this.auth_forms     = $('.auth-form form');

  this.updateLabels();
  this.addListeners_();

  this.showView('login');
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
    this.auth_forms.on(     'submit',   this.submitForm.bind(this)).validate();
    this.toggle_button_.on( 'click',    this.toggleTr8n_.bind(this));
    this.host_.on(          'dblclick', this.showHostForm_.bind(this));
    this.host_button_.on(   'click',    this.setHost_.bind(this));
    
    $('[data-show-view]').on('click',   this.showView.bind(this));
  },

  updateLabels: function() {
    var bgPage = chrome.extension.getBackgroundPage();
    this.host_.html(bgPage.tr8n_host);
    if (bgPage.tr8n_enabled) {
      this.note_.show()
      this.toggle_button_.text("Deactivate");
    } else {
      this.note_.hide()
      this.toggle_button_.text("Activate");
    }
  },

  toggleTr8n_: function() {
    chrome.extension.getBackgroundPage().tr8n_enabled = !chrome.extension.getBackgroundPage().tr8n_enabled;
    this.updateLabels();
    this.reloadWindow();
  },

  showHostForm_: function() {
    var bgPage = chrome.extension.getBackgroundPage();
    this.host_field_.val(bgPage.tr8n_host);
    this.host_.hide()
    this.host_form_.show()
  },

  setHost_: function () {
    var bgPage = chrome.extension.getBackgroundPage();
    bgPage.tr8n_host = this.host_field_.val();

    this.host_.show();
    this.host_form_.hide();
    this.updateLabels();
    this.reloadWindow();
  },

  reloadWindow: function () {
    chrome.tabs.getSelected(null, function(tab) {
      var code = 'window.location.reload();';
      chrome.tabs.executeScript(tab.id, {code: code});
    });
  },

  submitForm: function(e) {
    var frm = $(e.currentTarget);
    e.preventDefault();
    if(!frm.valid()) return;
    $.ajax({
      type    : "post",
      url     : frm.attr('action'),
      data    : frm.serialize(),
      success : this[$.camelCase("handle-"+frm.attr('class'))],
      error   : this[$.camelCase("handle-"+frm.attr('class')+"-error")]
    });
  },


  handleLoginForm: function(data) {
    showView('main');
  },

  handleLoginFormError: function(xhr) {
    var error = $('<div>').addClass('flash-error').text("Something went wrong!")
    $('#login').find('.flash-error').remove().end().prepend(error);
  },

  handleSignupForm: function(data) {
    showView('confirm')
  },

  handleSignupFormError: function(xhr) {
  },

  handleConfirmForm: function(data) {
    showView('registration')
  },
  
  handleConfirmFormError: function(xhr) {
  },

  handleRegistrationForm: function(data) {
    showView('main')
  },

  handleRegistrationFormError: function(data) {
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








