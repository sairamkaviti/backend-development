// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const socketIo = require("socket.io");
// const http = require("http");

// dotenv.config();
// let app = express();
// app.use(cors());

// const server = http.createServer(app);

// const io = socketIo(server, {
//   cors: {
//     origin: "*", // Allowing all origins for simplicity, consider securing this in production
//   },
// });

// let connectionMDB = require("./ConnectToDB");
// let userRouter = require("./routes/UserRouter");
// const connectionRoutes = require("./routes/connectionRoutes");

// app.use("/api/connections", connectionRoutes);

// app.use("/", userRouter);


// // Socket.IO
// let activeSockets = {}; // Store the socket IDs for active users

// // Set up socket events
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   // Listen for when a user joins with their userId
//   socket.on("join", async (userId) => {
//     activeSockets[userId] = socket.id; // Map userId to socket ID
//     console.log(`User ${userId} joined with socket ID: ${socket.id}`);

//     // Join the user to their unique room
//     socket.join(userId);

//     // Fetch the user’s connections and join each connection to their own room
//     const connections = await ConnectionRequestModel.find({
//       $or: [{ senderId: userId }, { receiverId: userId }],
//       status: "Accepted",
//     }).populate(["senderId", "receiverId"]);

//     // Add each connected user to a room
//     connections.forEach((conn) => {
//       const connectedUser =
//         conn.senderId._id.toString() === userId
//           ? conn.receiverId
//           : conn.senderId;
//       socket
//         .to(connectedUser._id.toString())
//         .emit("connected", { userId: userId });
//     });
//   });

//   // Handle incoming messages
//   // socket.on("send_message", (data) => {
//   //   const { senderId, receiverId, message } = data;

//   //   // Check if the receiver is in the activeSockets
//   //   if (activeSockets[receiverId]) {
//   //     io.to(activeSockets[receiverId]).emit("receive_message", {
//   //       senderId: senderId,
//   //       message: message,
//   //     });
//   //     console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
//   //   } else {
//   //     console.log(`Receiver ${receiverId} is not connected`);
//   //   }
//   // });
// socket.on("send_message", (data) => {
//   const { senderId, receiverId, message } = data;

//   if (activeSockets[receiverId]) {
//     io.to(activeSockets[receiverId]).emit("receive_message", {
//       senderId,
//       receiverId,
//       message,
//     });
//     console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
//   } else {
//     console.log(`Receiver ${receiverId} is not connected`);
//   }
// });

//   // Handle user disconnect
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);

//     // Optionally, remove from activeSockets
//     Object.keys(activeSockets).forEach((userId) => {
//       if (activeSockets[userId] === socket.id) {
//         delete activeSockets[userId];
//       }
//     });
//   });
// });



// const connectMDB = server.listen(process.env.PORT, () => {
//   console.log(`listening to port ${process.env.PORT}`);
// });
// connectMDB;
// connectionMDB();



// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const { Server } = require("socket.io"); // ✅ CORRECT SERVER-SIDE SOCKET.IO
// const http = require("http");

// dotenv.config();
// let app = express();
// app.use(cors());

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*", // Secure in production
//   },
// });

// let connectionMDB = require("./ConnectToDB");
// let userRouter = require("./routes/UserRouter");
// const connectionRoutes = require("./routes/connectionRoutes");
// const ConnectionRequestModel = require("./models/ConnectionRequestModel"); // ✅ Required

// app.use("/api/connections", connectionRoutes);
// app.use("/", userRouter);

// // Socket.IO
// let activeSockets = {}; // Store the socket IDs for active users

// // Set up socket events
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join", async (userId) => {
//     activeSockets[userId] = socket.id;
//     console.log(`User ${userId} joined with socket ID: ${socket.id}`);
//     socket.join(userId);

//     const connections = await ConnectionRequestModel.find({
//       $or: [{ senderId: userId }, { receiverId: userId }],
//       status: "Accepted",
//     }).populate(["senderId", "receiverId"]);

//     connections.forEach((conn) => {
//       const connectedUser =
//         conn.senderId._id.toString() === userId
//           ? conn.receiverId
//           : conn.senderId;

//       socket.to(connectedUser._id.toString()).emit("connected", { userId });
//     });
//   });

//   socket.on("send_message", (data) => {
//     const { senderId, receiverId, message } = data;

//     if (activeSockets[receiverId]) {
//       io.to(activeSockets[receiverId]).emit("receive_message", {
//         senderId,
//         receiverId,
//         message,
//       });
//       console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
//     } else {
//       console.log(`Receiver ${receiverId} is not connected`);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//     Object.keys(activeSockets).forEach((userId) => {
//       if (activeSockets[userId] === socket.id) {
//         delete activeSockets[userId];
//       }
//     });
//   });
// });

// const connectMDB = app.listen(process.env.PORT, () => {
//   console.log(`listening to port ${process.env.PORT}`);
// });
// connectMDB;
// connectionMDB();




// const express = require("express");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const socketIo = require("socket.io");
// const http = require("http");

// dotenv.config();
// let app = express();
// app.use(cors());

// const server = http.createServer(app);
// let connectionMDB = require("./ConnectToDB");
// const io = socketIo(server, {
//   cors: {
//     origin: "*", // Allowing all origins for simplicity, consider securing this in production
//   },
// });

// // Simulating a "ConnectionRequestModel" with an in-memory data store
// // This would be replaced with a real Mongoose model connected to MongoDB in a production environment
// const connectionRequests = [
//   {
//     senderId: "user1",
//     receiverId: "user2",
//     status: "Accepted",
//   },
//   {
//     senderId: "user2",
//     receiverId: "user3",
//     status: "Accepted",
//   },
//   {
//     senderId: "user3",
//     receiverId: "user4",
//     status: "Pending",
//   },
// ];

// // Mocking the `find` method of a Mongoose model
// const ConnectionRequestModel = {
//   find: async (query) => {
//     return connectionRequests.filter((connection) => {
//       return (
//         (query.$or[0].senderId === connection.senderId ||
//           query.$or[0].receiverId === connection.receiverId) &&
//         connection.status === query.status
//       );
//     });
//   },
// };

// // Routes (Mocked)
// let userRouter = require("./routes/UserRouter");
// const connectionRoutes = require("./routes/connectionRoutes");

// app.use("/api/connections", connectionRoutes);
// app.use("/", userRouter);

// // Socket.IO logic
// let activeSockets = {}; // Store the socket IDs for active users

// // Set up socket events
// io.on("connection", (socket) => {
//   console.log("User connected:", socket.id);

//   socket.on("join", async (userId) => {
//     activeSockets[userId] = socket.id;
//     console.log(`User ${userId} joined with socket ID: ${socket.id}`);
//     socket.join(userId);

//     const connections = await ConnectionRequestModel.find({
//       $or: [{ senderId: userId }, { receiverId: userId }],
//       status: "Accepted",
//     });

//     connections.forEach((conn) => {
//       const connectedUser =
//         conn.senderId === userId ? conn.receiverId : conn.senderId;
//       socket.to(connectedUser).emit("connected", { userId: userId });
//     });
//   });

//   socket.on("send_message", ({ senderId, receiverId, message }) => {
//     if (activeSockets[receiverId]) {
//       io.to(activeSockets[receiverId]).emit("receive_message", {
//         senderId,
//         receiverId,
//         message,
//       });
//       console.log(`Message from ${senderId} to ${receiverId}: ${message}`);
//     } else {
//       console.log(`Receiver ${receiverId} is not connected`);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//     Object.keys(activeSockets).forEach((userId) => {
//       if (activeSockets[userId] === socket.id) {
//         delete activeSockets[userId];
//       }
//     });
//   });
// });

// // Start the server
// app.listen(process.env.PORT, () => {
//   console.log(`Server listening on port ${process.env.PORT}`);
// });

// connectionMDB();


const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const socketIo = require("socket.io");
const http = require("http");

dotenv.config();
let app = express();
app.use(cors());

const server = http.createServer(app);
let connectionMDB = require("./ConnectToDB");

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend URL
    methods: ["GET", "POST"],
  },
});

// Simulating a "ConnectionRequestModel" with an in-memory data store
const connectionRequests = [
  { senderId: "user1", receiverId: "user2", status: "Accepted" },
  { senderId: "user2", receiverId: "user3", status: "Accepted" },
  { senderId: "user3", receiverId: "user4", status: "Pending" },
];

// Mocking the `find` method of a Mongoose model
const ConnectionRequestModel = {
  find: async (query) => {
    return connectionRequests.filter((connection) => {
      return (
        (query.$or[0].senderId === connection.senderId ||
          query.$or[0].receiverId === connection.receiverId) &&
        connection.status === query.status
      );
    });
  },
};

// Routes (Mocked)
let userRouter = require("./routes/UserRouter");
const connectionRoutes = require("./routes/connectionRoutes");

app.use("/api/connections", connectionRoutes);
app.use("/", userRouter);

// Socket.IO logic
let activeSockets = {}; // Store the socket IDs for active users

// Set up socket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", async (userId) => {
    activeSockets[userId] = socket.id;
    console.log(`User ${userId} joined with socket ID: ${socket.id}`);
    socket.join(userId);

    const connections = await ConnectionRequestModel.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: "Accepted",
    });

    // Ensure each connection user receives the "connected" event
    connections.forEach((conn) => {
      const connectedUser =
        conn.senderId === userId ? conn.receiverId : conn.senderId;

      // Emit the connected event to the connected user, ensure userId is the sender
      if (activeSockets[connectedUser]) {
        socket.to(connectedUser).emit("connected", { userId });
        console.log(`User ${userId} is connected to ${connectedUser}`);
      }
    });
  });

  // Handle incoming messages
socket.on("send_message", ({ senderId, receiverId, message }) => {
  const receiverSocketId = activeSockets[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("receive_message", {
      senderId,
      receiverId,
      message,
    });
    console.log(`Message sent from ${senderId} to ${receiverId}`);
  } else {
    console.log(`Receiver ${receiverId} not connected`);
  }
});



  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Clean up the activeSockets when a user disconnects
    Object.keys(activeSockets).forEach((userId) => {
      if (activeSockets[userId] === socket.id) {
        delete activeSockets[userId];
      }
    });
  });
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
  
});

connectionMDB();
