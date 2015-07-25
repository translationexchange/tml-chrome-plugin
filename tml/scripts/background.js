var trex_enabled = false;
var trex_custom_script_enabled = false;
var trex_custom_script = null;
var trex_host = "translation-center.translationexchange.com";
var trex_custom_url_regex = ".*";

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.method == "ping") {
      var msg = {
        enabled: trex_enabled,
        host: trex_host,
        regex: trex_custom_url_regex
      };

      if (trex_custom_script_enabled) {
        msg.custom = btoa(trex_custom_script);
      }

      sendResponse(msg);
    }
});