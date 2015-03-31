var PopupController = function () {
  this.toggle_button_ = $('#toggle_button');
  this.note_          = $('#note');
  this.host_          = $('#host');
  this.host_form_     = $('#host_form');
  this.host_field_    = $('#host_field');
  this.host_button_   = $('#host_button');
  this.auth_forms     = $('.auth-form form');

  this.language_button_ = $('#change_language');
  this.translator_button_ = $('#toggle_inline_translations');

  this.updateLabels();
  this.addListeners_();

//  this.showView('registration');

  if (this.getBackgroundPage().trex_signup_email) {
    $("#confirm_email").val(this.getBackgroundPage().trex_signup_email);
    this.showView('confirm');
  } else
    this.showView('main');
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

  language_button_: null,
  translator_button_: null,

  /**
   * Adds event listeners to the button in order to capture a user's click, and
   * perform some action in response.
   *
   * @private
   */
  addListeners_: function() {
    this.auth_forms.on(     'submit',   this.submitForm.bind(this)).validate();
    this.toggle_button_.on( 'click',    this.toggletrex_.bind(this));
    this.host_.on(          'dblclick', this.showHostForm_.bind(this));
    this.host_button_.on(   'click',    this.setHost_.bind(this));

    var providers = ["facebook", "twitter", "google_oauth2", "github", "linkedin", "vkontakte"];
    var self = this;
    $.each(providers, function( index, provider ) {
      $('#login-' + provider).on(   'click',    self.oauth_.bind(self) );
      $('#signup-' + provider).on(   'click',    self.oauth_.bind(self) );
    });

    $("#return_to_signup").on(   'click',    this.returnToSignup.bind(this));

    this.language_button_.on(   'click',    this.changeLanguage_.bind(this));
    this.translator_button_.on(   'click',    this.inlineTranslator_.bind(this));

    $('[data-show-view]').on('click',   this.showView.bind(this));
  },

  url: function(path) {
    var host = this.getBackgroundPage().trex_host;
    var url = host + path;
    if (host.indexOf("localhost") != -1 || host.indexOf("lvh.me") != -1)
      url = "http://" + url;
    else
      url = "https://" + url;

    return url;
  },

  checkStatus: function(callback) {
    var url = this.url("/trex/api/proxy/status");
    this.log("Checking status: " + url);

    $.ajax({
      type    : "get",
      url     : url,
      success : function(response) {
        if (callback) callback(response);
      },
      error   : function(response) {
        this.log("Failed to check status.");
      }
    });

  },

  changeLanguage_: function() {
    var self = this;

    chrome.tabs.getSelected(null, function(tab) {
      self.log("Current tab url: " + tab.url);
      var url = self.url("/v1/proxy/languages?referer=" + encodeURIComponent(tab.url));
      self.log("Loading languages: " + url);
      $.ajax({
        type    : "post",
        url     : url,
        success : function(response) {
          $('#language_list').html("");

          self.log("Loaded languages: " + response.languages);

          $.each(response.languages, function( index, lang ) {
            var lang_div = document.createElement("div");
            lang_div.className = "language_item";
            lang_div.setAttribute("data-locale", lang.locale);
            $(lang_div).html("<img src='" + lang.flag_url + "' style='vertical-align:middle;padding-right:10px;'>" + lang.name);
            lang_div.onclick = function(e) {
              var locale = e.currentTarget.getAttribute("data-locale");
              self.log(locale + " clicked");
              self.selectLocale(locale);
            };
             $('#language_list').append(lang_div);
          });
        },
        error   : function(response) {
          self.log("Failed to load languages.");
        }
      });
    });

    self.showView('language_selector');
  },

  selectLocale: function(locale) {
    var self = this;

    chrome.tabs.getSelected(null, function(tab) {
      self.log("Current tab url: " + tab.url);
      var url = self.url("/v1/proxy/switch_locale?locale=" + locale + "&referer=" + encodeURIComponent(tab.url));
      self.log("Selecting locale: " + url);

      $.ajax({
        type    : "post",
        url     : url,
        success : function(response) {
          self.log("Switched language");
          self.reloadWindow();
          self.showView('main');
        },
        error   : function(response) {
          self.log("Failed to switch language");
        }
      });

    });

  },

  inlineTranslator_: function() {
    var self = this;
    this.checkStatus(function(status) {
      self.log("Status: " + status);
      if (status == "logged_in") {

        chrome.tabs.getSelected(null, function(tab) {
          self.log("Current tab url: " + tab.url);
          var url = self.url("/v1/proxy/toggle_inline_translations?referer=" + encodeURIComponent(tab.url));
          self.log("Toggling inline translator: " + url);

          $.ajax({
            type    : "post",
            url     : url,
            success : function(response) {
              self.log("Updated inline translator");
              self.reloadWindow();
            },
            error   : function(response) {
              self.log("Failed to enable inline translations.");
            }
          });

        });

      } else {
        self.showView("login");
      }
    });
  },

  getBackgroundPage: function() {
    return chrome.extension.getBackgroundPage();
  },

  log: function(msg) {
    this.getBackgroundPage().console.log('TranslationExchange: ' + msg);
  },

  oauth_: function(e) {
    var provider = e.currentTarget.id.split("-")[1];
    this.log("Auth provider: " + provider);
    var w = 800, h = 600;
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    var host = this.getBackgroundPage().trex_host;

    var url = host + "/login/auth?provider=" + provider + "&display=window";
    if (host.indexOf("localhost") != -1 || host.indexOf("lvh.me") != -1)
      url = "http://" + url;
    else
      url = "https://" + url;

    var win = window.open(url, "oauth", 'toolbar=1, location=1, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
    return false;
  },

  updateLabels: function() {
    var bgPage = this.getBackgroundPage();
    this.host_.html(bgPage.trex_host);
    if (bgPage.trex_enabled) {
      this.note_.show()
      this.toggle_button_.text("Deactivate");
    } else {
      this.note_.hide()
      this.toggle_button_.text("Activate");
    }
  },

  toggletrex_: function() {
    chrome.extension.getBackgroundPage().trex_enabled = !chrome.extension.getBackgroundPage().trex_enabled;
    this.updateLabels();
    this.reloadWindow();
  },

  showHostForm_: function() {
    var bgPage = chrome.extension.getBackgroundPage();
    this.host_field_.val(bgPage.trex_host);
    this.host_.hide()
    this.host_form_.show()
  },

  setHost_: function () {
    var bgPage = chrome.extension.getBackgroundPage();
    bgPage.trex_host = this.host_field_.val();

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

    var self = this;

    chrome.tabs.getSelected(null, function(tab) {
      var url = self.url(frm.attr('action') + "?referer=" + encodeURIComponent(tab.url));
      self.log("Submitting form: " + url);

      $.ajax({
        type    : "post",
        url     : url,
        data    : frm.serialize(),
        success : self[$.camelCase("handle-"+frm.attr('class'))].bind(self),
        error   : self[$.camelCase("handle-"+frm.attr('class')+"-error")].bind(self)
      });

    });
  },

  handleLoginForm: function(data) {
    this.log("Login success");
    this.showView('main');
    this.reloadWindow();
  },

  handleLoginFormError: function(xhr) {
    this.log("Failed to login");
    var data = JSON.parse(xhr.responseText);
    var error = $('<div>').addClass('flash-error').text(data.error);
    $('#login').find('.flash-error').remove().end().prepend(error);
  },

  handleSignupForm: function(data) {
    this.getBackgroundPage().trex_signup_email = $("#signup_email").val();
    this.showView('confirm')
  },

  handleSignupFormError: function(xhr) {
    // get error message from error json

    this.log("Failed to signup");
    var error = $('<div>').addClass('flash-error').text("Something went wrong!");
    $('#signup').find('.flash-error').remove().end().prepend(error);
  },

  handleConfirmForm: function(data) {
    this.getBackgroundPage().trex_signup_email = null;
    this.showView('registration')
  },

  returnToSignup: function() {
    this.getBackgroundPage().trex_signup_email = null;
    this.showView("signup");
  },
  
  handleConfirmFormError: function(xhr) {
    this.log("Failed to confirm");
    var error = $('<div>').addClass('flash-error').text("Incorrect password");
    $('#confirm').find('.flash-error').remove().end().prepend(error);
  },

  handleRegistrationForm: function(data) {
    this.showView('main');
    this.reloadWindow();
  },

  handleRegistrationFormError: function(data) {
    this.log("Failed to register");
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








