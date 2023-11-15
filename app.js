const express = require('express');
const app = express();
const server = require('node:http').Server(app);
const io = require('socket.io')(server);

let users = [];

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
   res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
   socket.on('login', (data) => {
      const found = users.find((nickname) => nickname === data);
      if (!found) {
         users.push(data);
         socket.nickname = data;
         socket.emit('login', { status: 'OK' });
         io.sockets.emit('users', { users });
      } else {
         socket.emit('login', { status: 'FAILED' });
      }
   });

   socket.on('message', (data) => {
      io.sockets.emit('new message', {
         message: data,
         time: new Date(),
         nickname: socket.nickname,
      });
   });

   socket.on('disconnect', (data) => {
      for (let index = 0; index < users.length; index++) {
         if (users[index] === socket.nickname) {
            users.splice(index, 1);
         }
      }

      io.sockets.emit('users', { users });
   });
});

server.listen(3000, () => {
   console.log('Server is work on 3000');
});
