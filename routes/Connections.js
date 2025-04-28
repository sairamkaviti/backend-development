const express = require("express");
const router = express.Router();
const cors = require("cors");
const multer = require("multer");
const User = require("../models/User"); 
const dotenv = require("dotenv");

dotenv.config();

router.use(cors());

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Store in uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Filename with timestamp
  },
});

const upload = multer({ storage: storage });

// Serve static files from 'uploads' directory
router.use("/uploads", express.static("uploads"));



router.use("/uploads", express.static("uploads"));
router.use(express.json()); 
router.use(express.urlencoded({ extended: true }));

router.get("/connections/suggested", async(req, res)=> {
     try {
       const myUser = await User.findById(myUserId);
       if (!myUser) {
         return res.status(404).json({ message: "User not found" });
       }

       const { state, city } = myUser.location;
       console.log(`My location: ${state}, ${city}`); // Check if this prints correct values

       const suggestedUsers = await User.find({
         "location.state": state,
         "location.city": city,
         _id: { $ne: myUserId },
       }).select("_id name profilePicUrl location");

       console.log(suggestedUsers); // Log the result to check if the query returns correct users

       return res.status(200).json(suggestedUsers);
     } catch (err) {
       console.error(err);
       return res
         .status(500)
         .json({ message: "Failed to fetch suggested users" });
     }

}
    
);
module.exports = router;
