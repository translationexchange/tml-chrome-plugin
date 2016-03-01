;(function(doc) {
    chrome.runtime.sendMessage({method: "ping"}, function(response) {
      if (response.enabled) {

        if (response.regex) {
          if (!window.location.href.match(response.regex)) {
            console.log("Tml Chrome: Not matching expression, skipping url.");
            return;
          }
        }

        var boot_url = "//" + response.host + "/proxy/echo.js?script=" + encodeURIComponent(response.custom);

        console.log("Inserting script: " + boot_url);

        var script = doc.createElement('script');
        script.setAttribute('type', 'application/javascript');
        script.setAttribute('src', boot_url);
        script.setAttribute('charset', 'UTF-8');
        doc.getElementsByTagName('head')[0].appendChild(script);

      }
    });
}(document));




