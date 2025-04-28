const express = require("express");
const router = express.Router();
const {
  sendRequest,
  acceptRequest,
  getSuggestedUsers,
  getRequests,
  getConnections,
} = require("../controllers/connectionController");

router.post("/send-request/:recipientId", sendRequest);
router.post("/accept-request/:requestId", acceptRequest);
router.get("/suggested", getSuggestedUsers);
router.get("/requests", getRequests);
router.get("/my-connections", getConnections);

module.exports = router;
