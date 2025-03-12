const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";


const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

   
    const hashedPassword = await bcrypt.hash(password, 10);

  
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({ message: "User created successfully", userId: user.userid });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};


const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

   
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

   
    const token = jwt.sign({ userId: user.userid }, JWT_SECRET, { expiresIn: "1h" });

    await user.update({ is_online: true });
    res.json({ message: "Login successful", token, userId: user.userid, username: user.name});
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

const signout = async (req, res) => {
  try {
    const { userId } = req.user; 

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ is_online: false });

    res.json({ message: "Signout successful" });
  } catch (error) {
    res.status(500).json({ message: "Error signing out", error: error.message });
  }
};

const getOnlinePlayers = async (req, res) => {
  try {
    const onlineUsers = await User.findAll({
      where: { is_online: true },
      attributes: ["userid", "name", "email"],
    });

    return res.json({ players: onlineUsers });
  } catch (error) {
    console.error("Error fetching online players:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { signup, signin, signout, getOnlinePlayers };
