import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { Server } from 'socket.io';

dotenv.config({ path: './config.env' });
const DBAuth = process.env.DB.replace('<password>', process.env.DBpassword);

await mongoose.connect(DBAuth, {
  useUnifiedTopology: true
});
console.log("DB connection successful");

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log("Unhandled rejection");
});

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`SERVER RUNNING IN PORTNO:${port}`);
});

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000'],
  }
});

io.on('connection', (socket) => {
  socket.on("setup", (userData) => {
    console.log("a user connected");
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log(`User Joined Room: ${room}`);
  });

  socket.on("typing", (room) => {
    socket.to(room).emit("typing", room);
  });

  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing", room);
  });

  socket.on("removechatbar-send", (chatId) => {
    console.log(`remove chat bar for this id ${chatId}`);
    socket.to(chatId).emit("removechatbar-recieve", chatId);
  });

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit('message recieved', newMessageRecieved);
    });
  });
});
