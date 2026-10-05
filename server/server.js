import express from 'express';
import http from 'http';
import cors from "cors";
import { Server } from 'socket.io';
import { setupSocket } from './src/socket/socketHandler.js';

const app = express();
const server = http.createServer(app);
app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
setupSocket(io);

server.listen(3000, function () {
  console.log("listening on *:3000");
});