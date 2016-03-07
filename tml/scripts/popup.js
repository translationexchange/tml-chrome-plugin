/**
 * Copyright (c) 2016 Translation Exchange, Inc.
 *
 *  _______                  _       _   _             ______          _
 * |__   __|                | |     | | (_)           |  ____|        | |
 *    | |_ __ __ _ _ __  ___| | __ _| |_ _  ___  _ __ | |__  __  _____| |__   __ _ _ __   __ _  ___
 *    | | '__/ _` | '_ \/ __| |/ _` | __| |/ _ \| '_ \|  __| \ \/ / __| '_ \ / _` | '_ \ / _` |/ _ \
 *    | | | | (_| | | | \__ \ | (_| | |_| | (_) | | | | |____ >  < (__| | | | (_| | | | | (_| |  __/
 *    |_|_|  \__,_|_| |_|___/_|\__,_|\__|_|\___/|_| |_|______/_/\_\___|_| |_|\__,_|_| |_|\__, |\___|
 *                                                                                        __/ |
 *                                                                                       |___/
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var PopupController = function () {
  // main page
  this.toggle_button_             = $('#trex_toggle');
  this.customize_button_          = $('#trex_customize');
  this.note_                      = $('#trex_note');

  // customization page
  this.script_                    = $('#trex_script');
  this.domain_                    = $('#trex_domain');
  this.env_                       = $('#trex_env');
  this.create_script_button_      = $('#trex_create_script');
  this.update_script_button_      = $('#trex_update_script');

  this.initialize();
};

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

  script_: null,
  domain_: null,
  env_: null,
  create_script_button_: null,
  update_script_button_: null,

  hosts_: {
    development:  "http://localhost:3008",
    sandbox:      "https://sandbox-gateway.translationexchange.com",
    staging:      "https://staging-gateway.translationexchange.com",
    production:   "https://gateway.translationexchange.com"
  },

  /**
   * Initializes the scripts based on the site domain
   */
  initialize: function() {
    var domain = this.getBackgroundPage().current_tab_domain;
    this.domain_.val(domain);
    //this.log("Initializing for " + domain);
    var self = this;

    self.addListeners();
    self.showView('main');

    chrome.storage.local.get(domain, function(data) {
      self.log("Initializing popup for " + domain);
      //self.log(data);

      var config = data || {};
      config = config[domain] || {};
      var env = config.env || 'development';
      config = config[env] || {};

      //self.log(config);

      if (config.enabled) {
        self.note_.show();
        self.toggle_button_.text("Deactivate");
      } else {
        self.note_.hide();
        self.toggle_button_.text("Activate");
      }

      self.env_.val(env);
      self.script_.val(config.script || '');
    });
  },

  /**
   * Adds event listeners to the button in order to capture a user's click, and
   * perform some action in response.
   *
   * @private
   */
  addListeners: function() {
    this.toggle_button_.on('click', this.togglePlugin_.bind(this));
    this.customize_button_.on('click', this.customize_.bind(this));

    this.env_.on('change', this.changeEnv_.bind(this));
    this.update_script_button_.on('click', this.updateScript_.bind(this));
    this.create_script_button_.on('click', this.createScript_.bind(this));
  },

  /**
   * Returns backgound page
   *
   * @returns {*}
   */
  getBackgroundPage: function() {
    return chrome.extension.getBackgroundPage();
  },

  /**
   * Logs in the background page
   *
   * @param msg
   */
  log: function(msg) {
    this.getBackgroundPage().console.log(msg);
  },

  /**
   * Activates or deactivates the domain
   *
   * @private
   */
  togglePlugin_: function() {
    //this.getBackgroundPage().trex_enabled = !this.getBackgroundPage().trex_enabled;

    var self = this;
    var domain = this.domain_.val();
    var env = this.env_.val();
    var script = this.script_.val();
    var host = this.getHost(env);

    //self.log("Saving script and env for " + domain);

    chrome.storage.local.get(domain, function(data) {
      var config = data || {};
      if (!config[domain])
        config[domain] = {};
      if (!config[domain][env])
        config[domain][env] = {};

      config[domain][env].enabled = !config[domain][env].enabled;
      config[domain][env].host = host;
      config[domain].env = env;

      chrome.storage.local.set(config, function() {
        self.reloadWindow();
        window.close();
      });
    });

  },

  /**
   * Opens customization UI
   *
   * @private
   */
  customize_: function() {
    this.showView('custom_script_view');
  },

  /**
   * Registers the app under the domain
   *
   * @private
   */
  createScript_: function() {
    var self = this;
    var domain = this.domain_.val();
    var env = this.env_.val();
    var host = this.getHost(env);
    var url = host + "/proxy/activate?domain=" + domain;

    this.log("Creating script at url: " + url);

    $.get(url, function( response ) {
      if (response.status == 'ok') {

        chrome.storage.local.get(domain, function(data) {
          var config = data || {};
          if (!config[domain])
            config[domain] = {};
          if (!config[domain][env])
            config[domain][env] = {};

          config[domain][env] = {
            enabled: true,
            host: host,
            script: response.script
          };
          config[domain].env = env;

          chrome.storage.local.set(config, function() {
            self.script_.val(response.script);
          });
        });

      } else {
        self.log(response.message);
      }
    }).fail(function(response) {
        if (response.status === 403) {
          var login_url = host + "/login";
          self.log("Opening login window: " + login_url);
          window.open(login_url);
        } else {
          self.log('Failed to register project');
          self.log(response);
        }
    });
  },

  /**
   * Updates the script
   *
   * @private
   */
  updateScript_: function() {
    var self = this;
    var domain = this.domain_.val();
    var env = this.env_.val();
    var script = this.script_.val();

    self.log("Saving script and env for " + domain);

    chrome.storage.local.get(domain, function(data) {
      var config = data || {};
      if (!config[domain])
        config[domain] = {};
      if (!config[domain][env])
        config[domain][env] = {};

      config[domain][env].script = script;
      config[domain].env = env;

      chrome.storage.local.set(config, function() {
        self.reloadWindow();
        window.close();
      });
    });
  },

  /**
   * Switches environments
   *
   * @private
   */
  changeEnv_: function() {
    var domain = this.domain_.val();
    var env = this.env_.val();
    var self = this;

    self.log("Changed environment for domain " + domain);

    chrome.storage.local.get(domain, function(data) {
      self.log(data);

      var config = data || {};
      if (!config[domain])
        config[domain] = {};
      if (!config[domain][env])
        config[domain][env] = {};

      self.script_.val(config[domain][env].script || '');
    });
  },

  /**
   * Gets the environment host
   *
   * @param env
   * @returns {*}
   */
  getHost: function(env) {
    return this.hosts_[env];
  },

  /**
   * Reloads active tab
   */
  reloadWindow: function () {
    chrome.tabs.getSelected(null, function(tab) {
      var code = 'window.location.reload();';
      chrome.tabs.executeScript(tab.id, {code: code});
    });
  },

  /**
   * Shows a specific view
   *
   * @param name
   */
  showView: function(name){
    if (name.currentTarget) {
      name = $(name.currentTarget).data('show-view')
    }
    $('.flash-error').remove();
    $('body').attr('class', name);
  }

};

$(function () {
  window.PC = new PopupController();
});








