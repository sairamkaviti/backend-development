const Chat = require("../models/Chat");
const io = require("socket.io");
const ActionLog = require("../models/ActionLog");


let activeUsers = {}; // Store active users and their socket IDs

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    const chat = new Chat({ sender: senderId, receiver: receiverId, message });
    await chat.save();

    // Emit the message to the receiver in real-time using Socket.IO
    if (activeUsers[receiverId]) {
      io.to(activeUsers[receiverId]).emit("receive_message", {
        senderId,
        receiverId,
        message,
      });
    }

    res.status(201).send("Message sent");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    const messages = await Chat.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Handle user connections and manage active users
exports.handleSocketConnection = (socket) => {
  socket.on("join", (userId) => {
    activeUsers[userId] = socket.id;
    console.log(`${userId} connected with socket ID: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (let userId in activeUsers) {
      if (activeUsers[userId] === socket.id) {
        delete activeUsers[userId];
        console.log(`${userId} disconnected`);
        break;
      }
    }
  });

  socket.on("send_message", (data) => {
    const { senderId, receiverId, message } = data;

    // Emit message to the receiver
    if (activeUsers[receiverId]) {
      io.to(activeUsers[receiverId]).emit("receive_message", {
        senderId,
        receiverId,
        message,
      });
    }
  });

  socket.on("typing", (data) => {
    const { userId, toUserId } = data;
    if (activeUsers[toUserId]) {
      io.to(activeUsers[toUserId]).emit("user_typing", { userId });
    }
  });
};


// Function for logging action after sending a message
const logMessageAction = async (actionType, actionData, createdBy) => {
  const log = new ActionLog({
    actionType,
    actionData,
    createdBy,
  });
  await log.save();
};
