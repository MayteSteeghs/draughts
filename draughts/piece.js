const Color = require("./color")

/* A class representing a piece on a draughts board. It has a position within the board, a color, an
 * ID which corresponds to its ID in the HTML DOM, and whether or not its a kinged piece.
 */
const Piece = function(x, y, id, color) {
	this.position = {
		x: x,
		y: y
	}
	this.id = id
	this.color = color
	this.isKing = false
}

/* Return all of the potential non-capturing moves that the piece can make */
Piece.prototype.nonCapturingMoves = function() {
	return this.color == Color.BLUE
			? [[this.position.x + 1, this.position.y + 1],
			   [this.position.x - 1, this.position.y + 1]]
			: [[this.position.x + 1, this.position.y - 1],
			   [this.position.x - 1, this.position.y - 1]]
}

Piece.prototype.capturingMoves = function() {
	return [
		{ skipped: { x: this.position.x + 1, y: this.position.y + 1 },
		  landed:  { x: this.position.x + 2, y: this.position.y + 2 } },
		{ skipped: { x: this.position.x - 1, y: this.position.y + 1 },
		  landed:  { x: this.position.x - 2, y: this.position.y + 2 } },
		{ skipped: { x: this.position.x + 1, y: this.position.y - 1 },
		  landed:  { x: this.position.x + 2, y: this.position.y - 2 } },
		{ skipped: { x: this.position.x - 1, y: this.position.y - 1 },
		  landed:  { x: this.position.x - 2, y: this.position.y - 2 } }
	]
}

Piece.prototype.sameTeam = function(other) {
	return this.color == other.color
}

module.exports = Piece
