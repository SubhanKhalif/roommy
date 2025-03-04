import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { Server } from 'socket.io';

dotenv.config();  // Loads from .env by default

const DBAuth = process.env.DB.replace('<password>', process.env.DB_PASSWORD);

const connectDB = async () => {
  try {
    await mongoose.connect(DBAuth, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connection successful");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};

connectDB();

process.on('unhandledRejection', (err) => {
  console.log("Unhandled Rejection:", err.name, err.message);
});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
  console.log(`SERVER RUNNING ON PORT: ${port}`);
});

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://roommies.vercel.app'],
  },
});

io.on('connection', (socket) => {
  socket.on("setup", (userData) => {
    console.log("A user connected");
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
    console.log(`Remove chat bar for this ID: ${chatId}`);
    socket.to(chatId).emit("removechatbar-receive", chatId);
  });

  socket.on("new message", (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) return console.log("Users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit('message received', newMessageRecieved);
    });
  });
});
