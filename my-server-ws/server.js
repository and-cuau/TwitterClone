const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

const clients = new Set();


class Convo{
  constructor(user1, user2){
    this.user1 = user1;
    this.user2 = user2;
  }
}


convo = {user: "andre", user2: "andre2"};

server.on('connection', (ws) => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Broadcast to all clients
    for (let client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Broadcast: ${message}`);
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});
