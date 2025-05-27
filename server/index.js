const WebSocket = require('ws');
const PORT = 3001;

const wss = new WebSocket.Server({ port: PORT });
console.log(`WebSocket server listening on ws://localhost:${PORT}`);

wss.on('connection', function connection(ws) {
  console.log('New client connected');

  ws.on('message', function incoming(data) {
    console.log('Received:', data.toString());

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
