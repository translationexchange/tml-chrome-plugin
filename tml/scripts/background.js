var current_tab_domain = null;

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.method === "trex_activate") {

      current_tab_domain = request.hostname;

      // normalize domain
      current_tab_domain = current_tab_domain.replace('www.', '');

      console.log("Activating " + current_tab_domain);

      // Fetch data from local storage
      chrome.storage.local.get(current_tab_domain, function(data) {
        var msg = {enabled: false};
        var config = data || {};
        config = config[current_tab_domain] || {};

        if (config && config.env) {
          if (config[config.env]) {
            msg = {
              enabled: config[config.env].enabled,
              host: config[config.env].host,
              script: btoa(config[config.env].script)
            }
          }
        }

        console.log(msg);
        sendResponse(msg);
      });

      return true;
    }

    return false;
});
