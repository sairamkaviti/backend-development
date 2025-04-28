const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const socketIo = require("socket.io-client");
const http = require("http");
const connectionRoute = require('./routes/connectionRoute');
const chatRoutes = require("./routes/chatRoutes");
dotenv.config();
let app = express();
app.use(cors());

const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: '*',
  },
});

let connectionMDB = require("./ConnectToDB");
let userRouter = require("./routes/UserRouter");
// let myConnectionsRouter = require("./routes/Connections");

app.use("/", userRouter);
// app.use("/",myConnectionsRouter)

// app.use('/api/chats', chatRoutes);
// app.use("/api/connections", connectionRoute);

// const connectionsRoutes = require("./connectionsRoutes"); 

// app.use("/connections", connectionsRoutes);


// Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('send_message', (data) => {
    io.to(data.receiverId).emit('receive_message', data);
  });

  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});



const connectMDB = app.listen(process.env.PORT, () => {
  console.log(`listening to port ${process.env.PORT}`);
});
connectMDB;
connectionMDB();
