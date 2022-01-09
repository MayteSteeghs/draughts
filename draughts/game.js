const WebSocket = require("ws")

const Color = require("./color")
const Piece = require("./piece")

/* Initialize and return new 10x10 draughts board */
const boardInit = () => [
	/* Initialize the blue pieces */
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(i, 0, i >> 1, Color.BLUE)),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(i, 1, (i >> 1) + 5, Color.BLUE) : null),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(i, 2, (i >> 1) + 10, Color.BLUE)),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(i, 3, (i >> 1) + 15, Color.BLUE) : null),

	/* Initialize the empty middle rows */
	Array.from({ length: 10 }, () => null),
	Array.from({ length: 10 }, () => null),

	/* Initialize the red pieces */
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(1, 6, i >> 1, Color.RED)),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(1, 7, (i >> 1) + 5, Color.RED) : null),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(1, 8, (i >> 1) + 10, Color.RED)),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(1, 9, (i >> 1) + 15, Color.RED) : null),
]

/* A class representing a game. It contains the current game state as well as the complete move
 * history and the websockets of both players.
 */
const Game = function(gameID) {
    this.id = gameID
    this.board = boardInit()
    this.ongoing = false
	this.bluePlayer = null
	this.redPlayer = null
    this.history = [] /* [ { blue: "42x31", red: "19-24" }, ... ] */
}

/* Send the message `msg' to both players */
Game.prototype.messageAll = msg => [this.bluePlayer, this.redPlayer].forEach(p => p.send(msg))

module.exports = Game
