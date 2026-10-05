import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const server = createServer();
const io = new SocketIOServer(server, { cors: { origin: '*' } }); // cors only for development testing!

export function setupSocket(io) {
  // Handle client connections
  io.on('connection', (socket) => {
    console.log('Client connected', socket.id)

    socket.on('create-room', (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} created room: ${roomId}`);
    });

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Client ${socket.id} joined room: ${roomId}`);

      socket.timeout(roomId).emit('message', 'System: A new player joined.');
      callback({ success: true, roomId });
    });

    // Handle messages from the client
    socket.on('message', (message) => {
      console.log('Message received:', message);

      // Send message to all clients, including the one who sent the message
      io.emit('message', message);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};
