const express = require("express");
const router = express.Router();
const cors = require("cors");
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
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

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: String,
    companyName: String,
    location: {
      state: String,
      city: String,
    },
    email: String,
    mobile: Number,
    password: String,
    userType: {
      type: String,
      enum: ["Individual", "Company"],
      default: "Individual",
    },
    profilePic: String,
    otp: String,
    otpExpiration: Date,
  },
  { timestamps: true }
);

let NewUserModel = new mongoose.model("newUserModel", userSchema);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Replace with your email
    pass: process.env.EMAIL_PASS, // Replace with your email password
  },
  tls: {
    rejectUnauthorized: false, // This disables the strict certificate verification
  },
});


router.post("/newUseRegister", upload.none(), async (req, res) => {
    console.log(req.body)
  const { name, state, city, email, mobile, password } = req.body;

  // Check if the email already exists in the database
  const existingUser = await NewUserModel.findOne({ email });
  if (existingUser) {
    return res
      .status(400)
      .json({ status: "failed", msg: "Email already exists!" });
  }

  try {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Generate a random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP expiration time (e.g., 10 minutes)
    const otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    let newUser = new NewUserModel({
      name,
      location: { state, city },
      email,
      mobile,
      password: hashedPassword, // Store the hashed password
      otp, // Store the OTP
      otpExpiration, // Store OTP expiration time
    });

    await newUser.save();
console.log("user created")
    // Send OTP email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Registration",
      text: `Your OTP for registration is: ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      status: "success",
      msg: "Registration successful! Please verify your OTP.",
    });
      console.log("Registration successful! Please verify your OTP");
  } catch (err) {
    console.error("Unable to add new User to DB", err);
    res
      .status(500)
      .json({ status: "failed", msg: "Unable to add new User to DB" });
  }
  console.log("unable to create user")
});


router.post("/verifyOTP", async (req, res) => {
  const { email, otp } = req.body;

  const user = await NewUserModel.findOne({ email });
  

  if (!user) {
    return res.status(400).json({ status: "failed", msg: "User not found" });
  }

  if (user.otp.toString() !== otp.toString().trim()) {
    return res.status(400).json({ status: "failed", msg: "Invalid OTP" });
  }

  if (new Date() > user.otpExpiration) {
    return res.status(400).json({ status: "failed", msg: "OTP has expired" });
  }

  user.otp = null;
  user.otpExpiration = null;
  await user.save();

  res.json({ status: "success", msg: "OTP verified successfully!" });
});




// POST endpoint for login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await NewUserModel.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json({ status: "failed", msg: "Invalid email or password" });
  }

  // Compare password with the hashed password stored in the database
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ status: "failed", msg: "Invalid email or password" });
  }

  // Generate a JWT token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  // Respond with success and send the token
  res.json({
    status: "success",
      msg: "Login successful",
    data:user,
    token, // Send the JWT token to the frontend
  });
});

// PUT endpoint for updating user profile
router.put("/updatingProfile", upload.single("dp"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);

  try {
    if (req.file && req.file.path) {
      await NewUserModel.updateOne(
        { _id: req.body._id },
        {
          name: req.body.name,
          mobile: req.body.mobile,
         city: req.body.city,
          state: req.body.state,
          profilePic: req.file.path,
        }
      );
    } else {
     await NewUserModel.updateOne(
       { _id: req.body._id },
       {
         name: req.body.name,
         mobile: req.body.mobile,
         city: req.body.city,
         state: req.body.state,
         profilePic: req.file ? req.file.path : undefined,
       }
     );
    }

    res.json({ status: "Success", msg: "User Details Updated Successfully" });
    console.log("User Details Updated Successfully");
  } catch (err) {
    res.json(err);
    console.log("updating Error" + err);
  }
});






// POST endpoint to request password reset
router.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await NewUserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ status: "failed", msg: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    // Save token and expiry into user model (you can create new fields dynamically)
    user.otp = resetToken;
    user.otpExpiration = tokenExpiry;
    await user.save();

    // Create reset link (frontend URL should handle this token)
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset</h1>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p><b>Note:</b> This link will expire in 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ status: "success", msg: "Reset password email sent!" });
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", msg: "Error sending reset email" });
  }
});
// POST endpoint to reset password
router.post("/resetPassword", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = await NewUserModel.findOne({
      otp: token,
      otpExpiration: { $gt: Date.now() }, // Token not expired
    });

    if (!user) {
      return res.status(400).json({ status: "failed", msg: "Invalid or expired token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear token
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiration = null;
    await user.save();

    res.json({ status: "success", msg: "Password reset successfully!" });
    console.log("Password reset successful");
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", msg: "Error resetting password" });
  }
});


const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(403).send("Access denied");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
};

// Endpoint to fetch users based on state
router.get("/users", verifyToken, async (req, res) => {
  const { state } = req.query;

  if (!state) {
    return res.status(400).json({ status: "failed", msg: "State is required" });
  }

  try {
    // Fetch users from the same state
    const users = await NewUserModel.find({ "location.state": state }).select(
      "-password"
    ); // Exclude password field
    res.json(users);
  } catch (error) {
    res.status(500).json({ status: "failed", msg: "Failed to fetch users" });
  }
});

module.exports = router;
