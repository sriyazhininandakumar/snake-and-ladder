const express = require("express");
const { signup, signin, signout, getOnlinePlayers } = require("../controllers/auth.controller");
const authenticateToken = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.post("/signout", authenticateToken,signout);
router.get("/online-players", getOnlinePlayers); 
module.exports = router;
