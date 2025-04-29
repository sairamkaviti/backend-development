const Connection = require("../models/Connection");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail"); // Assume you already have this for Nodemailer

// Suggest users from same city/state
exports.suggestUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const suggestedUsers = await User.find({
      _id: { $ne: user._id },
      location: user.location,
    }).select("-password"); // exclude password

    res.json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a connection request
exports.sendRequest = async (req, res) => {
  try {
    const { recipientId } = req.body;

    // Check if already exists
    const existing = await Connection.findOne({
      requester: req.user.id,
      recipient: recipientId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Connection request already sent" });
    }

    const connection = new Connection({
      requester: req.user.id,
      recipient: recipientId,
    });

    await connection.save();

    const recipientUser = await User.findById(recipientId);

    // Send email to recipient
    await sendEmail({
      to: recipientUser.email,
      subject: "New Connection Request",
      text: `You have a new connection request from ${req.user.name}.`,
    });

    res.json({ message: "Connection request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View requested connections (sent by current user)
exports.viewRequested = async (req, res) => {
  try {
    const requests = await Connection.find({ requester: req.user.id }).populate(
      "recipient",
      "name location profilePic"
    );

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View pending incoming requests
exports.viewPendingRequests = async (req, res) => {
  try {
    const requests = await Connection.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("requester", "name location profilePic");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept a connection request
exports.acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId);

    if (!connection || connection.recipient.toString() !== req.user.id) {
      return res.status(404).json({ message: "Connection not found" });
    }

    connection.status = "accepted";
    await connection.save();

    res.json({ message: "Connection accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View all accepted connections
exports.viewMyConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
      status: "accepted",
    }).populate("requester recipient", "name location profilePic");

    const result = connections.map((conn) => {
      const isRequester = conn.requester._id.toString() === req.user.id;
      const friend = isRequester ? conn.recipient : conn.requester;
      return {
        _id: friend._id,
        name: friend.name,
        location: friend.location,
        profilePic: friend.profilePic,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
