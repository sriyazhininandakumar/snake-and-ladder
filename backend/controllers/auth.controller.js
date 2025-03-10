const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Signup Controller
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully", userId: user.userid });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

// Signin Controller
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // Generate JWT
    const token = jwt.sign({ userId: user.userid }, JWT_SECRET, { expiresIn: "1h" });

    // ✅ Return userId along with the token
    res.json({ message: "Login successful", token, userId: user.userid });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};


module.exports = { signup, signin };
