chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
      // chrome.tabs.executeScript(null, {code:"window.setTimeout('Tr8n.SDK.Proxy.initText();', 5000);"});
    }
});