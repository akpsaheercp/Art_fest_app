const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const http = require('http');
const { Server } = require("socket.io");
const db = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = 3001;

app.use(cors());
app.use(bodyParser.json());
app.use('/api', routes);

io.on('connection', (socket) => {
  console.log('a user connected');
  db.collection('data').onSnapshot(snapshot => {
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });
    socket.emit('data-update', data);
  }, err => {
    console.log(`Encountered error: ${err}`);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
