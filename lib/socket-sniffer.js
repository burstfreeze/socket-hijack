function printUTF(arr) {
	console.log(String.fromCharCode.apply(null, arr))
}

function handleReceived(event) {
	console.log("\nReceived:", event.data);
	if(event.data instanceof (new ArrayBuffer()).constructor.prototype.__proto__.constructor) {
		var eventArray = new Uint8Array(event.data)
		printUTF(eventArray)
	}
}

function handleSent(data) {
	console.log("\nSent:", data);
	printUTF(data)
}

(function() {
  var OrigWebSocket = window.WebSocket;
  var callWebSocket = OrigWebSocket.apply.bind(OrigWebSocket);
  var wsAddListener = OrigWebSocket.prototype.addEventListener;
  wsAddListener = wsAddListener.call.bind(wsAddListener);
  window.WebSocket = function WebSocket(url, protocols) {
    var ws;
    if (!(this instanceof WebSocket)) {
      // Called without 'new' (browsers will throw an error).
      ws = callWebSocket(this, arguments);
    } else if (arguments.length === 1) {
      ws = new OrigWebSocket(url);
    } else if (arguments.length >= 2) {
      ws = new OrigWebSocket(url, protocols);
    } else { // No arguments (browsers will throw an error)
      ws = new OrigWebSocket();
    }

    wsAddListener(ws, 'message', function(event) {
      handleReceived(event)
    });
    return ws;
  }.bind();
  window.WebSocket.prototype = OrigWebSocket.prototype;
  window.WebSocket.prototype.constructor = window.WebSocket;

  var wsSend = OrigWebSocket.prototype.send;
  wsSend = wsSend.apply.bind(wsSend);
  OrigWebSocket.prototype.send = function(data) {
    handleSent(data)
    return wsSend(this, arguments);
  };
})();