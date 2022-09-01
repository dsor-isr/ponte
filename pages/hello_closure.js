goog.require('goog.dom');
goog.require('goog.net.XhrIo');
goog.require('goog.net.XhrIoPool');
function sayHi() {
  var newHeader = goog.dom.createDom('h1', {'style': 'background-color:#EEE'},
    'Hello world!');
  goog.dom.appendChild(document.body, newHeader);
  //getData('http://jsonplaceholder.typicode.com/posts/1');
  //getData('http://www.sapo.pt');
  getData('http://localhost:7080/VAR%20State');
  //getData('http://localhost:7080/VAR%20Altitude');
}
  var xhr = new goog.net.XhrIo();
  var xhr_pool = new goog.net.XhrIoPool(null, 3, 10);
  xhr.setTimeoutInterval(10);
  
  goog.events.listen(xhr, goog.net.EventType.COMPLETE, function(e) {
    obj = this.getResponseXml();
    log('Received XML data object "' +  
        obj.toString() + '"');
  });
  
  goog.events.listen(xhr, goog.net.EventType.TIMEOUT, function(e) {
    log('Timeout'); 
  });
    
  function getData(dataUrl) {
    log('Sending simple request for ['+ dataUrl + ']');
    xhr.send(dataUrl);
  }


function log(msg) {
  document.getElementById('log').appendChild(document.createTextNode(msg));
  document.getElementById('log').appendChild(document.createElement('br'));
}