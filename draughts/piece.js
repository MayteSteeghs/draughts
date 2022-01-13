const Color = require("./public/javascripts/color")

/* Return all of the potential non-capturing moves that the piece can make */
const nonCapturingMovesStandard =
	  p => p.color == Color.BLUE
	  ? [[p.position.x + 1, p.position.y + 1],
		 [p.position.x - 1, p.position.y + 1]]
	  : [[p.position.x + 1, p.position.y - 1],
		 [p.position.x - 1, p.position.y - 1]]

const nonCapturingMovesKing =
	  p => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [[n, n], [n, -n], [-n, n], [-n, -n]])
									  .flat()
									  .map(([x, y]) => [p.position.x + x, p.position.y + y])

const capturingMovesStandard = p => [
	{ skipped: { x: p.position.x + 1, y: p.position.y + 1 },
	  landed:  { x: p.position.x + 2, y: p.position.y + 2 } },
	{ skipped: { x: p.position.x - 1, y: p.position.y + 1 },
	  landed:  { x: p.position.x - 2, y: p.position.y + 2 } },
	{ skipped: { x: p.position.x + 1, y: p.position.y - 1 },
	  landed:  { x: p.position.x + 2, y: p.position.y - 2 } },
	{ skipped: { x: p.position.x - 1, y: p.position.y - 1 },
	  landed:  { x: p.position.x - 2, y: p.position.y - 2 } }
]

const capturingMovesKing =
	  p => [1, 2, 3, 4, 5, 6, 7, 8].map(
		  n => [{ skipped: { x: p.position.x + n,     y: p.position.y + n     },
				  landed:  { x: p.position.x + n + 1, y: p.position.y + n + 1 } },
				{ skipped: { x: p.position.x + n,     y: p.position.y - n     },
				  landed:  { x: p.position.x + n + 1, y: p.position.y - n - 1 } },
				{ skipped: { x: p.position.x - n,     y: p.position.y + n     },
				  landed:  { x: p.position.x - n - 1, y: p.position.y + n + 1 } },
				{ skipped: { x: p.position.x - n,     y: p.position.y - n     },
				  landed:  { x: p.position.x - n - 1, y: p.position.y - n - 1 } }
			   ]).flat()

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

Piece.prototype.nonCapturingMoves = function() {
	return this.isKing ? nonCapturingMovesKing(this) : nonCapturingMovesStandard(this)
}

Piece.prototype.capturingMoves = function() {
	return this.isKing ? capturingMovesKing(this) : capturingMovesStandard(this)
}

Piece.prototype.sameTeam = function(other) {
	return this.color == other.color
}

module.exports = Piece
