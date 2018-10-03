const express = require('express');
const SocketServer = require('ws').Server;
const uuidv4 = require('uuid/v4');
const WebSocket = require('ws');


// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
    // Make the express server serve static assets (html, javascript, css) from the /public folder
    .use(express.static('public'))
    .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Broadcast to all.
wss.broadcast = (data) => {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
    console.log('Client connected');

    let onlineUsers = {
      type:"onlineUsers",
      content: wss.clients.size
    }
    wss.broadcast(JSON.stringify(onlineUsers))

    ws.on('message', (msg) => {
        const parsedMsg = JSON.parse(msg);
        parsedMsg.id = uuidv4();

        if (parsedMsg.type === "postMessage") {
            parsedMsg.type = "incomingMessage"
            wss.broadcast(JSON.stringify(parsedMsg));
        } else if (parsedMsg.type === "postNotification") {
            parsedMsg.type = "incomingNotification"
            wss.broadcast(JSON.stringify(parsedMsg));

        }

    });

    // Set up a callback for when a client closes the socket. This usually means they closed their browser.
    ws.on('close', (ws) =>{
      console.log('Client disconnected');
      onlineUsers = {
      type:"onlineUsers",
      content: wss.clients.size
    }

     wss.broadcast(JSON.stringify(onlineUsers))
   })
});