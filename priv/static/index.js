var ws = new WebSocket("ws://" + location.host + "/ws");
ws.onmessage = x => console.log(x.data);

var state = {};


