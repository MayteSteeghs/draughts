const WebSocket = require("ws")

const Piece = require("./piece")
const Color = require("./public/javascripts/color")
const Messages = require("./public/javascripts/messages")

/*
 * Signature:
 *     () => int[10][10]
 *
 * Description:
 *     Initialize and return new 10x10 draughts board
 */
const boardInit = () => [
	/* Initialize the blue pieces */
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(i, 0, i >> 1, Color.BLUE) : null),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(i, 1, (i >> 1) + 5, Color.BLUE)),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(i, 2, (i >> 1) + 10, Color.BLUE) : null),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(i, 3, (i >> 1) + 15, Color.BLUE)),

	/* Initialize the empty middle rows */
	Array.from({ length: 10 }, () => null),
	Array.from({ length: 10 }, () => null),

	/* Initialize the red pieces */
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(i, 6, i >> 1, Color.RED) : null),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(i, 7, (i >> 1) + 5, Color.RED)),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? new Piece(i, 8, (i >> 1) + 10, Color.RED) : null),
	Array.from({ length: 10 }, (_, i) => (i & 1) ? null : new Piece(i, 9, (i >> 1) + 15, Color.RED)),
]

/*
 * Signature:
 *     (Any[][]) => Any[][]
 *
 * Description:
 *     Create and return a deep copy of the given 2D array. This is used to create deep copies of the
 *     draughts board so that other functions such as `capturingMoves()' don't modify the original by
 *     accident.
 */
const deepCopy = m => m.map(r => r.slice())

/*
 * Signature:
 *     (Number, Number) => Boolean
 *
 * Description:
 *     Check if the given pair of coordinates are within the bounds of a draughts board. In other
 *     words this function returns `true' if the given coordinates fit in a 10x10 grid and `false'
 *     otherwise.
 */
const inBounds = (x, y) => x >= 0 && x <= 9 && y >= 0 && y <= 9

/*
 * Signature:
 *     ({ x: Number, y: Number }, { x: Number, y: Number }, Piece[][], Optional Boolean) => Boolean
 *
 * Description:
 *     Check if all the board squares between the starting position `s' and the ending position `e'
 *     are empty on the board `board'. This is used to validate moves, as you cannot simply jump over
 *     another piece. The function takes an optional parameter `ignoreLast' which if set to `true'
 *     will ignore the last piece in the chain. This let's the function be used for calculating legal
 *     captures where the last square will obviously be a piece.
 */
const allEmpty = (s, e, board, ignoreLast) => {
	let dx = e.x > s.x ? 1 : -1
	let dy = e.y > s.y ? 1 : -1

	let pieces = []
	let [x, y] = [s.x, s.y]

	while (x != e.x && y != e.y) {
		x += dx
		y += dy
		pieces.push(board[y][x])
	}
	if (ignoreLast)
		pieces.pop()

	return pieces.every(p => p == null)
}

/*
 * Signature:
 *     (Piece, Piece[][]) => { x: Number, y: Number, captures: [], king: Boolean }[]
 *
 * Description:
 *     Find and return all of the valid moves that the piece `p' can make on the board `board' which
 *     do not capture any pieces. The moves are returned as an array of objects where each object has
 *     an `x', `y', and `captures' field. The `x' and `y' fields specify the new location of the
 *     piece `p' on the board if the user chooses to make the move. The `captures' field is unused in
 *     this function so an empty array is assigned to it. The `king' field specifies if the piece
 *     became a king as a result of the move.
 */
const nonCapturingMoves =
	  /* Get all the possible moves we can make by calling the `Piece.nonCapturingMoves()' method.
	   * This will return an array of coordinates that the piece `p' can move to. Then filter the
	   * returned moves so that only valid ones remain.
	   *
	   * A move is considered valid if it satisfies the following conditions:
	   *  - The end position of the piece `p' is in bounds
	   *  - The square where our piece ends up in is not occupied
	   *
	   * After performing the filter, a map is performed to turn the arrays into objects of the
	   * correct format so that they can be processed by the calling function.
	   */
	  (p, board) => p.nonCapturingMoves()
					 .filter(([x, y]) => inBounds(x, y) && allEmpty(p.position, { x: x, y: y }, board))
					 .map(([x, y]) => { return { x: x, y: y, captures: [],
												 king: p.isKing
												 || (p.color == Color.BLUE ? y == 9 : y == 0) } })

/*
 * Signature:
 *     (Piece, Piece[], Piece[][]) => { x: Number, y: Number, captures: Piece[], king: Boolean }[]
 *
 * Description:
 *     Recursively find and return all of the valid moves that the piece `p' can make on the board
 *     `board' which captures atleast one piece. The moves are returned in the same format as they
 *     are in the `nonCapturingMoves()' function except this time the `captures' field is actually
 *     used. The `captures' field is an array of Piece objects which will be captured in the case
 *     that the user chooses to make the move. The `king' field specifies if the piece `p' became a
 *     king piece as a result of the capture sequence.
 */
const capturingMoves = (p, captures, board) => {
	/* Get all the possible moves we can make. This is done by calling `p.capturingMoves()' to get
	 * all the moves that the piece `p' could make if it were to capture another piece, and then
	 * filter the result to keep only moves that are legal.
	 *
	 * The filter checks the following properties:
	 *  - The end position of the piece `p' is in bounds
	 *  - The square we skip over actually had a piece to capture
	 *  - The piece we captured is of the opposing player
	 *  - The square where our piece ends up in is not occupied
	 *  - All the squares between the current position and the captured piece are empty
	 */
	const moves = p.capturingMoves()
				   .filter(({ landed, skipped }) => inBounds(landed.x, landed.y)
													&& board[skipped.y][skipped.x]
													&& !board[skipped.y][skipped.x].sameTeam(p)
													&& !board[landed.y][landed.x]
													&& allEmpty({ x: p.position.x, y: p.position.y },
																skipped, board, true))

	/* Check to see if any valid moves were found. If no moves were found then we have reached the
	 * end of our chain of captures, or in other words, we have reached the algorithms base case. In
	 * this case we can simply return the move with the current positions of the piece `p' and the
	 * captures in `captures'. There is one special case we need to handle though, and that is when
	 * the captures array is empty. This can only occur if no valid moves have been found and we have
	 * not yet made any recursive calls. In this scenario we return an empty array (so nothing). If
	 * we don't handle this case properly then the user will be able to move a piece to the square it
	 * is already on.
	 */
	if (moves.length == 0)
		return captures.length > 0
			? [{ x: p.position.x, y: p.position.y, captures: captures, king: p.isKing }]
			: []

	/* Now we get to the fun part. For each of the moves in `moves' we first concatenate the piece
	 * that the move would have captured with the `captures' array and store the result in a new
	 * array called `c'. We then set the newly captured piece in the board to `null' so that future
	 * recursive calls don't try to capture the piece after it has already been captured. We then
	 * update the position of the piece `p' to it's new position after performing the capture.
	 * Finally we recursively call the function with `p', `c', and `board' which will return to us an
	 * array of possible moves. These arrays are then all accumulated in an accumulator and returned.
	 *
	 * We also need to perform a check to see if we are on the promotion line (the back row). In this
	 * case we must remember to promote the piece to a king.
	 */
	return moves.reduce((acc, { landed, skipped }) => {
		const c = captures.concat(board[skipped.y][skipped.x])
		board[skipped.y][skipped.x] = null
		p.position = landed

		if (p.color == Color.BLUE ? p.position.y == 9 : p.position.y == 0)
			p.isKing = true

		return acc.concat(capturingMoves(p, c, board))
	}, [])
}

/*
 * Signature:
 *     (Piece, Piece[][]) => { x: Number, y: Number, captures: Piece[], king: Boolean }[]
 *
 * Description:
 *     A wrapper function around `nonCapturingMoves()' and `capturingMoves()' which simply calls the
 *     two and concatinates the results together into a single array. The `capturingMoves()' function
 *     is given a brand new instance of `Piece' instead of just taking `p' as an argument as we want
 *     to avoid making any changes to `p'.
 */
const calculateMoves = (p, board) => {
	let npiece = new Piece(p.position.x, p.position.y, p.id, p.color)
	npiece.isKing = p.isKing
	return nonCapturingMoves(p, board).concat(capturingMoves(npiece, [], deepCopy(board)))
}

/*
 * Signature:
 *     this.board       :: Piece[][]
 *     this.ongoing     :: Boolean
 *     this.bluePlayer  :: WebSocket
 *     this.redPlayer   :: WebSocket
 *     this.currentTurn :: Color
 *     this.history     :: { blue: String, red: String }[]
 *
 * Description:
 *     A class representing a game. It contains the current game state as well as the complete move
 *     history and the websockets of both players.
 */
const Game = function() {
	this.board = boardInit()
	this.ongoing = false
	this.bluePlayer = null
	this.redPlayer = null
	this.currentTurn = null
	this.history = []
}

/*
 * Signature:
 *     ({ head: Message, body: Any }) => Nothing
 *
 * Description:
 *     Send the message `msg' to both of the players. `msg' is an object where the first attribute
 *     (the head) is a `Message' and the second attribute (the body) can be anything you want to
 *     send.
 */
Game.prototype.messageAll = function(msg) {
	[this.bluePlayer, this.redPlayer].forEach(p => p.send(JSON.stringify(msg)))
}

/*
 * Signature:
 *     ({ head: Message, body: Any }, WebSocket) => Nothing
 *
 * Description:
 *     Send the message `msg' to the opponent of the player specified by the websocket `ws'.
 */
Game.prototype.messageOpponent = function(msg, ws) {
	(ws == this.bluePlayer ? this.redPlayer : this.bluePlayer).send(JSON.stringify(msg))
}

/*
 * Signature:
 *     ({ head: Message, body: Any }, WebSocket) => Nothing
 *
 * Description:
 *     Send the message `msg' to the player specified by the websocket `ws'.
 */
Game.prototype.messageClient = function(msg, ws) {
	ws.send(JSON.stringify(msg))
}

/*
 * Signature:
 *     () => { x: Number, y: Number, captures: Piece[], king: Boolean }[]
 *
 * Description:
 *     Return all of the moves that can legally be made on the current turn of the game. The format
 *     for the output object is the same as previously described for the `nonCapturingMoves()' and
 *     `capturingMoves()' functions.
 */
Game.prototype.legalMoves = function() {
	/* Initialize an array of length 20 containing a bunch of empty arrays as elements. Each slot of
	 * the array corresponds to one of a players 20 pieces. When indexed as `moves[N]', the returned
	 * array will contain all of the moves that can legally be made by the piece with the ID `N'.
	 */
	let moves = Array.from({ length: 20 }, () => [])

	/* Calculate all of the possible moves for each piece and store them in the `moves' array. This
	 * is done by first flattening the game board from a 2D array of `Piece' objects to a 1D array.
	 * We then filter the array so that we only get the pieces that correspond to the player who's
	 * turn it is. Once we have filtered out everything we don't need, we calculate the moves for
	 * each of our pieces and store the result in the `moves' array.
	 */
	this.board
		.flat()
		.filter(p => p && p.color == this.currentTurn)
		.forEach(p => moves[p.id] = calculateMoves(p, this.board))

	/* Calculate the maximum number of captures that can be made in a single move. Like we did above,
	 * we first flatten the board so that it is 1D. Then we use a reduction to iterate over all of
	 * the moves and store the maximum number of captures in the accumulator `acc'.
	 */
	const maxCaptures = moves.flat().reduce((acc, o) => Math.max(acc, o.captures.length), 0)

	/* Accumulate an array of coordinates of valid moves. This is done by performing a reduction on
	 * the `moves' array where we iterate over each pieces array of valid moves. Then for each array
	 * of valid moves we filter out all the moves that do not make the maximum number of captures and
	 * concatenate the result to the accumuator array `acc'.
	 */
	return moves.reduce(
		(acc, arr, i) => acc.concat([arr.filter(m => m.captures.length == maxCaptures)]), [])
}

/*
 * Signature:
 *     () => Boolean
 *
 * Description:
 *     Initiate the next turn of the game. This is done by swapping the player that the `currentTurn'
 *     attribute is assigned to and sending the `Messages.COMMENCE' message to the player who's turn
 *     has just begun. In the body of the message we include all the legal moves that the player can
 *     perform. Before we do anything though, we first need to check to see if there are still any
 *     blue or any red pieces on the board. If there aren't any than we know that one player has won
 *     the game, and we can stop the game.
 *
 *     If the game is over, then this function will return `false'. In all other cases it will return
 *     `true'.
 */
Game.prototype.nextTurn = function() {
	const b = this.board.flat().filter(p => p && p.color == Color.BLUE).length
	const r = this.board.flat().filter(p => p && p.color == Color.RED).length

	if (!(b && r)) {
		this.messageAll({ head: Messages.GAMEOVER, body: b == 0 ? Color.RED : Color.BLUE })
		return false
	}

	/* When the game starts for the first time, `this.currentTurn' will be null, so we let blue make
	 * the first move.
	 */
	if (this.currentTurn == null)
		this.currentTurn = Color.BLUE
	else
		this.currentTurn = this.currentTurn == Color.BLUE ? Color.RED : Color.BLUE

	this.messageClient({ head: Messages.COMMENCE,
						 body: { moves: this.legalMoves(), history: this.history } },
					   this.currentTurn == Color.BLUE ? this.bluePlayer : this.redPlayer)
	return true
}

/*
 * Signature:
 *     ({ old: { x: Number, y: Number }, new: { x: Number, y: Number }, captures: Piece[],
 *                                                                      king: Boolean }) => Nothing
 *
 * Description:
 *     Update the games board with the move that was just sent from the client in the message `msg'.
 *     The message only has 4 fields that matter to us, the `old', `new', `captures', and `king'
 *     fields. The `old' and `new' fields contain the old and new positions of the piece that was
 *     moved. The `captures' field holds an array of `Piece' objects that were captures and need to
 *     be removed from the game. The `king' field tells us if the piece got promoted to a king.
 *
 *     This function also updates the game history according to the official syntax.
 */
Game.prototype.move = function(msg) {
	this.board[msg.new.y][msg.new.x] = this.board[msg.old.y][msg.old.x]
	this.board[msg.new.y][msg.new.x].position = msg.new
	this.board[msg.new.y][msg.new.x].isKing = msg.king
	this.board[msg.old.y][msg.old.x] = null
	msg.captures.forEach(c => this.board[c.position.y][c.position.x] = null)

	if (this.history.length == 0 || this.history[this.history.length - 1].red)
		this.history.push({ blue: moveToHistory(msg.old, msg.new, msg.captures) })
	else
		this.history[this.history.length - 1].red = moveToHistory(msg.old, msg.new, msg.captures)
}

/*
 * Signature:
 *     (x: Number, y: Number) => Number
 *
 * Description:
 *     Take a set of coordinates and translate them to the corresponding square number. Draughts
 *     rules state that the upper-left square is square "1", and each square from left to right,
 *     up to down, increments by one. The bottom right square is therefor square "50".
 */
const coordToSquare = (x, y) => 51 - Math.ceil((x + 1) / 2 + 5 * y)

/*
 * Signature:
 *     ({ x: Number, y: Number }, { x: Number, y: Number }, Piece[]) => String
 *
 * Description:
 *     Take an old position specified by `o', a new position specified by `p', and a list of captures
 *     specified by `captures' and return a string representation of the move that was played. In
 *     draughts a move is shown by the notation "F-T" where 'F' is the square the piece moved from
 *     and 'T' is the square the piece moved to. If a capture was made during the move the notation
 *     changes to "FxT".
 */
const moveToHistory = (o, n, c) =>
	`${coordToSquare(o.x, o.y)}${c.length == 0 ? "-" : "x"}${coordToSquare(n.x, n.y)}`

module.exports = Game
