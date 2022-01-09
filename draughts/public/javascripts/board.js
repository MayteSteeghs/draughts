// Check if all adjacent tiles are on the board
function directions(x, y) {
	return forwardDirections(x, y).concat(backwardDirections(x, y));
}

function forwardDirections(x, y) {
	let directions = [];
	if (x + 1 <= 9) {
		if (y + 1 <= 9)
			directions.push(x + 1, y + 1)
		if (y - 1 >= 0)
			directions.push(x + 1, y - 1)
	}
	return directions;
}

function backwardDirections(x, y) {
	let directions = [];
	if (x - 1 >= 0) {
		if (y + 1 <= 9)
			directions.push(x - 1, y + 1);
		if (y - 1 >= 0)
			directions.push(x - 1, y - 1);
	}
	return directions;
}

Piece.prototype.getPossibleMoves = () => {
	let possibleMoves = [];
	let directions = directions(this.positions[0], this.positions[1]);
	for (let i = 0; i < directions.length; i++) {
		let direction = directions[i];
		let hit = checkHit(direction, piece);
		let shift = checkShift(direction, piece); 

		if (hit !== null)
			possibleMoves.push(hit);
		if (shift !== null)
			possibleMoves.pish(shift);
	}


	return possibleMoves;
};

function checkShift(direction, piece) {
	const delta_y = piece.getPosition[1] - direction[1];

	// check if it is a forward move
	if (delta_y > 0) {
		// check if square is empty
		if (board[direction[0], direction[1]] === null)
			return new Move(piece, direction, null);
	} else if (piece.isKing && board[direction[0], direction[1]] == null)
		return new Move(piece, direction, null);
}

function checkHit(direction, piece) {
	let hits = [];
	let opponent = board[direction[0], direction[1]];

	// check whether the square in this direction is empty and if its an enemy piece
	if (opponent !== null && opponent.getColor !== piece.getColor) {
		// Check whether there is a square to move to
		let delta_x = direction[0] - piece.getPosition[0];
		let delta_y = direction[1] - piece.getPosition[1];

		if (board[direction[0]+ delta_x][direction[0] + delta_y] == null) {
			hits.push(opponent);

			return new Move(piece, direction[0]+ delta_x, direction[0] + delta_y, hits)
			// TODO implement functionality for multiple hits
		}
	}
}


function Move(piece, newPosition, hits) {
	this.piece = piece;
	this.newPosition = newPosition
	this.hits = hits;
}

Move.prototype.getNoHits = () => return hits.length;
