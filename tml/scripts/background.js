var trex_enabled;
var trex_host = "translation-center.translationexchange.com";
// var trex_host = "localhost:3002";
var trex_signup_email = null;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    if (request.method == "ping")
        sendResponse({enabled: trex_enabled, host: trex_host});
});