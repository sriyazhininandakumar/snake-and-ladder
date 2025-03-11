// routes/invite.routes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { sendInvite } = require('../controllers/invite.controller');

router.post('/', authenticateToken, sendInvite);

module.exports = router;


const sendInvite = async (req, res) => {
  const { playerId } = req.body;
  const userId = req.user.id;  

  
  res.status(200).json({ message: "Invite sent", playerId });
};

module.exports = { sendInvite };
