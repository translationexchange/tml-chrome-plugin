;(function(doc) {
    chrome.runtime.sendMessage({method: "trex_activate", hostname: window.location.hostname}, function(response) {
      if (response.enabled) {
        var boot_url = response.host + "/proxy/echo.js?script=" + encodeURIComponent(response.script);
        //console.log("Inserting script: " + boot_url);
        var script = doc.createElement('script');
        script.setAttribute('type', 'application/javascript');
        script.setAttribute('src', boot_url);
        script.setAttribute('charset', 'UTF-8');
        doc.getElementsByTagName('head')[0].appendChild(script);
      }
    });
}(document));




