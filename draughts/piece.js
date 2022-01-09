/* A class representing a piece on a draughts board. It has a position within the board, a color, an
 * ID which corresponds to its ID in the HTML DOM, and whether or not its a kinged piece.
 */
const Piece = function(x, y, color, id) {
	this.position = {
		x: x,
		y: y
	}
	this.color = color
	this.id = id
	this.isKing = false
}

/* Move the given piece to the coordinates specified by `direction' */
Piece.prototype.movePiece = direction => {
	let x = direction[0]
	let y = direction[1]

	if (x <= 9 && x >= 0 && y <= 9 && y >= 0)
		this.position = direction
}

module.exports = Piece
