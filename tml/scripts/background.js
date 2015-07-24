var trex_enabled = false;
var trex_custom_script_enabled = false;
var trex_custom_script = null;
var trex_host = "translation-center.translationexchange.com";

// var trex_host = "localhost:3002";
var trex_signup_email = null;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.method == "ping") {
      var msg = {
        enabled: trex_enabled,
        host: trex_host
      };

      if (trex_custom_script_enabled)
        msg.custom = btoa(trex_custom_script);

      sendResponse(msg);
    }
});