const Connection = require("../models/Connection");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const ActionLog = require("../models/ActionLog");




exports.sendRequest = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const requesterId = req.user._id;

    const connection = new Connection({
      requester: requesterId,
      recipient: recipientId,
    });
    await connection.save();

    const recipient = await User.findById(recipientId);
    await sendEmail(
      recipient.email,
      "Connection Request",
      `You have a new connection request.`
    );

    res.send("Connection request sent");
  } catch (err) {
    res.status(400).send(err.message);
  }
  
};

exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const connection = await Connection.findById(requestId);

    if (!connection) {
      return res.status(404).send("Connection request not found");
    }

    connection.status = "accepted";
    await connection.save();

    res.send("Connection request accepted");
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.getSuggestedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const suggested = await User.find({
      "location.state": user.location.state,
      _id: { $ne: req.user._id },
    });
    res.json(suggested);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requester", "name location profilePicUrl");
    res.json(requests);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

exports.getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
      status: "accepted",
    })
      .populate("requester", "name location profilePicUrl")
      .populate("recipient", "name location profilePicUrl");
    res.json(connections);
  } catch (err) {
    res.status(400).send(err.message);
  }
};


exports.sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user._id;

    const existingConnection = await Connection.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existingConnection) {
      return res.status(400).json({ message: "Connection already exists." });
    }

    const connection = new Connection({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    await connection.save();

    // Log the connection request action
    await logMessageAction(
      "connection_request_sent",
      { senderId, receiverId },
      senderId
    );

    res.status(201).json({ message: "Connection request sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { senderId } = req.params;
    const receiverId = req.user._id;

    const connection = await Connection.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found." });
    }

    connection.status = "accepted";
    connection.updatedAt = Date.now();
    await connection.save();

    // Log the connection acceptance action
    await logMessageAction(
      "connection_request_accepted",
      { senderId, receiverId },
      receiverId
    );

    res.status(200).json({ message: "Connection request accepted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


