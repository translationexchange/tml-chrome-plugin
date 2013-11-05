;(function(doc) {
    chrome.runtime.sendMessage({method: "ping"}, function(response) {
      if (response.enabled) {
        var script = doc.createElement('script');
        script.setAttribute('id', 'tr8n_root');
        script.setAttribute('type', 'application/javascript');
        script.setAttribute('src', '//' + response.host + '/tr8n/api/proxy/boot.js?text=true&immediate=true');
        script.setAttribute('charset', 'UTF-8');
        doc.getElementsByTagName('head')[0].appendChild(script);
      }
    });
}(document));
