function addTr8nCSS(doc, src) {
  var css = doc.createElement('link');
  css.setAttribute('type', 'application/javascript');
  css.setAttribute('href', src);
  css.setAttribute('type', 'text/css');
  css.setAttribute('rel', 'stylesheet');
  css.setAttribute('media', 'screen');
  doc.getElementsByTagName('head')[0].appendChild(css);
};

function addTr8nScript(doc, id, src, onload) {
    var script = doc.createElement('script');
    script.setAttribute('id', id);
    script.setAttribute('type', 'application/javascript');
    script.setAttribute('src', src);
    script.setAttribute('charset', 'UTF-8');
    if (onload) script.onload = onload;
    doc.getElementsByTagName('head')[0].appendChild(script);
}

;(function(doc) {
  if (doc.getElementById('tr8n-jssdk')) 
    return;

  addTr8nCSS(doc, 'http://tr8nhub.com/assets/tr8n/tr8n.css?ext=true');


  addTr8nScript(doc, 'tr8n-jssdk', 'http://tr8nhub.com/assets/tr8n/tr8n-compiled.js?ext=true', function() {
    setTimeout(function() {
      addTr8nScript(doc, 'tr8n-proxy', 'http://tr8nhub.com/tr8n/api/v1/proxy/init.js?ext=true', function() {
        addTr8nScript(doc, 'tr8n-execute', 'http://tr8nhub.com/run.js', function() {
        });
      });
    }, 100);
  });  
}(document));
