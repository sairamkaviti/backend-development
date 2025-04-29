const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connectionController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware); // all routes protected

router.get("/suggested", connectionController.suggestUsers);
router.post("/send-request", connectionController.sendRequest);
router.get("/requested", connectionController.viewRequested);
router.get("/pending-requests", connectionController.viewPendingRequests);
router.post("/accept-request", connectionController.acceptRequest);
router.get("/my-connections", connectionController.viewMyConnections);

module.exports = router;
