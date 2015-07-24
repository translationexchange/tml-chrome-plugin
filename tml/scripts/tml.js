;(function(doc) {
    chrome.runtime.sendMessage({method: "ping"}, function(response) {
      if (response.enabled) {

        // console.log(response);

        var boot_url = '//' + response.host + '/tools/proxy/boot.js';

        if (response.custom) {
          boot_url = boot_url + "?data=" + encodeURIComponent(response.custom);
        }

        console.log("Inserting script: " + boot_url);

        var script = doc.createElement('script');
        script.setAttribute('type', 'application/javascript');
        script.setAttribute('src', boot_url);
        script.setAttribute('charset', 'UTF-8');
        doc.getElementsByTagName('head')[0].appendChild(script);

      }
    });
}(document));




