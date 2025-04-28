const WebSocket = require('ws');
const server = new WebSocket.Server({ port: 8080 });

//const clients = new Set();
const clients = new Map();
const unaddrclients = [];
//let clients = [];



function checkType(value) {
  if (typeof value === 'number') {
    return true;
  } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return false;
  } else {
    return false;
  }
}


 server.on('connection', (ws) => {

 unaddrclients.push(ws);


  console.log('New client connected');

  ws.on('message', (message) => {
    console.log(`connection msg test: ${message}`);
    const parsed = JSON.parse(message);

    

    if (checkType(parsed)){
      let poppedItem = unaddrclients.pop();
      let kvPair = { key: parsed, value: poppedItem };
      clients[kvPair.key] = kvPair.value;

      console.log(`Received: ${parsed}`);
    }
    else{
      const to = parsed.to;
      const from = parsed.from;
      const msg = parsed.msg;
  
      // Broadcast to all clients

      console.log(`Received else: ${to}`);
      console.log(`Received else: ${from}`);
      console.log(`Received else: ${msg}`);

        const toReceiver = {from: from, msg: msg};
        const toSender = {to: to, msg: msg};
      
        if (clients[to].readyState === WebSocket.OPEN) {
          console.log(`1st if passed`);
           clients[to].send(JSON.stringify(toReceiver));
       }

       if (clients[from].readyState === WebSocket.OPEN) {
        console.log(`2nd if passed`);
           clients[from].send(JSON.stringify(toSender));
       }
  

      // console.log(`Received: ${parsed.message}`);

    }


   
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});
