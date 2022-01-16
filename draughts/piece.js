const Color = require("./public/javascripts/color")

/*
 * Signature:
 *     (Piece) => Number[2][]
 *
 * Description:
 *     Return all of the possible non-capturing moves that the piece `p' could theoretically make
 *     assuming that it is not a king piece. The moves are represented as arrays of 2 numbers, an `x'
 *     and a `y' position.
 */
const nonCapturingMovesStandard =
	  p => p.color == Color.BLUE
	  ? [[p.position.x + 1, p.position.y + 1],
		 [p.position.x - 1, p.position.y + 1]]
	  : [[p.position.x + 1, p.position.y - 1],
		 [p.position.x - 1, p.position.y - 1]]

/*
 * Signature:
 *     (Piece) => Number[2][]
 *
 * Description:
 *     The same as above except we assume that `p' is a king piece.
 */
const nonCapturingMovesKing =
	  p => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => [[n, n], [n, -n], [-n, n], [-n, -n]])
									  .flat()
									  .map(([x, y]) => [p.position.x + x, p.position.y + y])

/*
 * Signature:
 *     (Piece) => { skipped: { x: Number, y: Number }, landed: { x: Number, y: Number } }[]
 *
 * Description:
 *     Return all of the possible capturing moves that the piece `p' could theoretically make
 *     assuming that it is not a king piece. The moves are represented as objects with a `skipped'
 *     and a `landed' attribute. The `skipped' attribute represents the location on the board that
 *     the piece skipped over in the capture, and the `landed' attribute is where the piece actually
 *     landed.
 */
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

/*
 * Signature:
 *     (Piece) => { skipped: { x: Number, y: Number }, landed: { x: Number, y: Number } }[]
 *
 * Description:
 *     The same as above except we assume that `p' is a king piece.
 */
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

/*
 * Signature:
 *     this.position :: { x: Number, y: Number }
 *     this.id       :: Number
 *     this.color    :: Color
 *     this.isKing   :: Boolean
 *
 * Description:
 *     A class representing a draughts piece. It has a position within the board as well as an ID
 *     that corresponds to its ID in the HTML DOM, a color, and a boolean that determines if it's a
 *     king or not.
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

/*
 * Signature:
 *     () => Number[2][]
 *
 * Description:
 *     Return an array of coordinates (each coordinate is an array with an `x' and `y' value) for all
 *     of the possible moves that the piece `this' could theoretically make in any given scenario
 *     which do *not* capture any pieces.
 */
Piece.prototype.nonCapturingMoves = function() {
	return this.isKing ? nonCapturingMovesKing(this) : nonCapturingMovesStandard(this)
}

/*
 * Signature:
 *     () => { skipped: { x: Number, y: Number }, landed: { x: Number, y: Number } }[]
 *
 * Description:
 *     This is the same as the above function but returns the moves which *do* capture pieces. The
 *     output is just an array of moves in the format described by the `capturingMovesKing()' and
 *     `capturingMovesStandard()' functions.
 */
Piece.prototype.capturingMoves = function() {
	return this.isKing ? capturingMovesKing(this) : capturingMovesStandard(this)
}

/*
 * Signature:
 *     (Piece) => Boolean
 *
 * Description:
 *     Return `true' or `false' depending on if `this' and `other' are on the same team or not.
 */
Piece.prototype.sameTeam = function(other) {
	return this.color == other.color
}

module.exports = Piece
