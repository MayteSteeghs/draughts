const express = require("express");
const router = express.Router();

var gameStatus = require("../statTracker");

// Get game screen
router.get("/play", function(req, res) {
	res.sendFile("game.html", { root: "./public" });
  });

/* GET home page */
router.get("/", function(req, res) {
	res.render("splash.ejs", {
		minimumMoves: gameStatus.minimumMoves,
		averageMoves: gameStatus.averageMoves, 
		totalGames: gameStatus.totalGames
	});
});

module.exports = router
