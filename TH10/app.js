const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Store connected users
const users = new Map(); // userId -> { username, socketId }
const messageHistory = []; // Store message history

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // User joins with username
  socket.on('join', (username) => {
    users.set(socket.id, { username, socketId: socket.id });
    console.log(`${username} joined the chat`);

    // Send updated user list to all clients
    io.emit('userList', Array.from(users.values()).map(u => ({
      id: u.socketId,
      username: u.username
    })));

    // Send message history to new user
    socket.emit('messageHistory', messageHistory);

    // Notify others
    io.emit('notification', {
      message: `${username} has joined the chat`,
      type: 'join',
      timestamp: new Date()
    });
  });

  // Send private message
  socket.on('sendMessage', (data) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    const messageData = {
      sender: sender.username,
      senderId: socket.id,
      receiver: data.receiver,
      receiverId: data.receiverId,
      message: data.message,
      timestamp: new Date()
    };

    // Save to history
    messageHistory.push(messageData);

    // Send to receiver
    io.to(data.receiverId).emit('newMessage', messageData);
    
    // Echo back to sender
    socket.emit('messageSent', messageData);
  });

  // Broadcast typing indicator
  socket.on('typing', (data) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    io.to(data.receiverId).emit('userTyping', {
      username: sender.username,
      senderId: socket.id
    });
  });

  // Stop typing indicator
  socket.on('stopTyping', (data) => {
    io.to(data.receiverId).emit('userStopTyping', {
      senderId: socket.id
    });
  });

  // Handle user disconnect
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`${user.username} disconnected`);
      users.delete(socket.id);

      // Notify all clients of updated user list
      io.emit('userList', Array.from(users.values()).map(u => ({
        id: u.socketId,
        username: u.username
      })));

      // Notify others of user leaving
      io.emit('notification', {
        message: `${user.username} has left the chat`,
        type: 'leave',
        timestamp: new Date()
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Chat server running on http://localhost:${PORT}`);
});
