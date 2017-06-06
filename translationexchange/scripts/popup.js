

var PopupController = function () {
  // main page

  this.body               = $('body');
  this.configPanel        = $('#trex_config');
  this.mainPanel          = $('#trex_main');
  this.showConfigButton   = $('#trex_show_config_btn');
  this.hideConfigButton   = $('#trex_hide_config_btn');
  this.activeMessage      = $('#trex_active');
  this.inactiveMessage    = $('#trex_inactive');
  this.toggleActiveButton = $('.trex_toggle');
  this.updateConfigButton = $('#trex_update_script');

  this.scriptInput        = $('#trex_script');
  this.domainInput        = $('#trex_domain');
  this.envInput           = $('#trex_env');

  this.initialize();
};

PopupController.prototype = {

  hosts: {
    development:  "http://localhost:3008",
    sandbox:      "https://sandbox-gateway.translationexchange.com",
    staging:      "https://staging-gateway.translationexchange.com",
    production:   "https://gateway.translationexchange.com"
  },

  initialize: function() {
    var self    = this;
    var domain  = this.getBackgroundPage().current_tab_domain;
    
    this.domainInput.val(domain);
    this.addListeners();

    chrome.storage.local.get(domain, function(data) {
      var config  = data || {};
      var env     = config.env || 'production';
      
      config = config[domain] || {};
      config = config[env] || {};

      self.envInput.val(env);
      self.scriptInput.val(config.script || '');

      (config.enabled) ? self.setActive() : self.setInactive();
      
    });
  },

  setActive: function(){
    this.activeMessage.show();
    this.inactiveMessage.hide();
  },

  setInactive: function(){
    this.activeMessage.hide();
    this.inactiveMessage.show();
  },

  addListeners: function() {
    var self = this;

    this.toggleActiveButton.on('click', function() { self.toggleActivation() });
    this.updateConfigButton.on('click', function() { self.updateScript(); });
    this.hideConfigButton.on('click'  , function() { self.hideConfig(); });

    this.showConfigButton.on('click'  , function(e) { 
      if(e.shiftKey && e.altKey) { self.showConfig(); }
      
    });
  },

  getBackgroundPage: function() {
    return chrome.extension.getBackgroundPage();
  },

  log: function(msg) {
    this.getBackgroundPage().console.log(msg);
  },
  
  toggleActivation: function(active){
    var self    = this;
    var domain  = this.domainInput.val();
    var env     = this.envInput.val();
    var script  = this.scriptInput.val();
    var host    = this.hosts[env]

    chrome.storage.local.get(domain, function(data) {

      var config = data || {};
      
      if(!config[domain] || !config[domain][env]) {
        self.registerProject();
        return;
      }
      
      if (!config[domain])      { config[domain] = {}; }
      if (!config[domain][env]) { config[domain][env] = {}; }
      if (active == undefined)  { active = !config[domain][env].enabled; }

      config[domain][env].enabled = active;
      config[domain][env].host = host;
      config[domain].env = env;

      chrome.storage.local.set(config, function() {
        self.reloadWindow();
        window.close();
      });
    });
  },


  registerProject: function(){
    var self    = this;
    var domain  = this.domainInput.val();
    var env     = this.envInput.val();
    var host    = this.hosts[env];
    var url     = host + "/proxy/activate?domain=" + domain;

    $.get(url)
      .done(function(res) {
        if (res.status != 'ok') { return self.log(res.message); }

        chrome.storage.local.get(domain, function(data) {
          var config = data || {};
          if (!config[domain])      { config[domain] = {}; }
          if (!config[domain][env]) { config[domain][env] = {}; }

          config[domain][env] = { enabled: true, host: host, script: res.script };
          config[domain].env = env;

          chrome.storage.local.set(config, function() {
            self.scriptInput.val(res.script);
            self.toggleActivation(true);
          });
        });        
      })
      .fail(function(res) {
        if (res.status === 403) {
          var login_url = host + "/login";
          self.log("Opening login window: " + login_url);
          window.open(login_url);
        } else {
          self.log('Failed to register project');
          self.log(res);
        }        
      });
  },


  showConfig: function(){
    this.configPanel.show();
    this.mainPanel.hide();
    this.body.addClass('config-mode')
  },
  
  hideConfig: function(){
    this.configPanel.hide();
    this.mainPanel.show();
    this.body.removeClass('config-mode')
  },

  updateScript: function() {
    var self    = this;
    var domain  = this.domainInput.val();
    var env     = this.envInput.val();
    var script  = this.scriptInput.val();

    chrome.storage.local.get(domain, function(data) {
      var config = data || {};
      if (!config[domain])      { config[domain] = {}; }
      if (!config[domain][env]) { config[domain][env] = {}; }

      config[domain][env].script = script;
      config[domain].env = env;

      chrome.storage.local.set(config, function() {
        self.reloadWindow();
        window.close();
      });
    });
  },
   
  reloadWindow: function () {
    chrome.tabs.getSelected(null, function(tab) {
      chrome.tabs.executeScript(tab.id, {
        code: 'window.location.reload();'
      });
    });
  }
};

$(function () {
  window.PC = new PopupController();
});








