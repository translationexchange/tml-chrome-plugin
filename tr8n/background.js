var tr8n_enabled;
var tr8n_host = "translate-sandbox.geni.com";

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     if (changeInfo.status == 'complete') {
//     }
// });

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // console.log(sender.tab ?
    //             "from a content script:" + sender.tab.url :
    //             "from the extension");
    if (request.method == "ping")
        sendResponse({enabled: tr8n_enabled, host:tr8n_host});
});