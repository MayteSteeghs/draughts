/*
 * Description:
 *     This file contains all of the client-side code of the game. It's not as pretty as the server
 *     code, but it gets the job done. The code in this file is responsible for all of the graphical
 *     updates on the game screen as well as handling click events and whatnot.
 */

/* This is basically the enumeration we have in the `public/javascripts/color.js' file, except I
 * cannot for the life of me get it to import properly, so I suppose we are doing it this way for
 * now.
 */
const Color = {
	BLUE: "b",
	RED:  "r"
}

/* Initialize a new web socket to connect to the server */
const ws = new WebSocket("ws://localhost:3000")

/* Define some global variables */
let legalMoves,    // Array of moves  :: Moves that each piece can legally make
	ourTurn,       // Boolean         :: Is it currently our turn?
	selectedPiece, // Piece           :: The current HTML piece we have selected
	colorPrefix,   // Color           :: Either Color.BLUE or Color.RED depending on the clients side
	gameHistory    // List of objects :: The complete history of the game so far

/*
 * Signature:
 *     (x: Number, y: Number) => Number
 *
 * Description:
 *     See the comments in this very function in the root directories `game.js'.
 */
const coordToSquare = (x, y) => 51 - Math.ceil((x + 1) / 2 + 5 * y)

/*
 * Signature:
 *     (o: { x: Number, y: Number }, n: { x: Number, y: Number }, c: Piece[]) => String
 *
 * Description:
 *     See the comments in this very function in the root directories `game.js'.
 */
const moveToHistory = (o, n, c) =>
	`${coordToSquare(o.x, o.y)}${c.length == 0 ? "-" : "x"}${coordToSquare(n.x, n.y)}`

/*
 * Signature:
 *     () => Color
 *
 * Description:
 *     Get the color of the opponent. The reason the function is named the way it is has to do with
 *     the fact that we generally do this to get an ID prefix such as "b" or "r".
 */
const opponentPrefix = () => colorPrefix == Color.BLUE ? Color.RED : Color.BLUE

/*
 * Signature:
 *     () => Nothing
 *
 * Description:
 *     Remove all of the position markers from the board.
 */
const removeMarkers = () => Array
							.from(document.getElementsByClassName("position"))
							.forEach(pos => pos.remove())

/* Add a position marker to the position specified by the given coordinates */
const addMarker = ({ x, y, captures, king }) => {
	/* Create and add the marker */
	let img = document.createElement("img")                     // Create a new image element
	img.className = "piece position"                            // Add it to the correct classes
	img.style.transform = `translate(${x * 100}%, ${y * 100}%)` // Move it to the correct position
	img.setAttribute("src", "images/position.svg")              // Assign the actual image to it
	document.querySelector("#board-container").append(img)      // Add it to the board container

	/* Add an event listener to move the selected piece when the marker is clicked */
	img.addEventListener("click", () => {
		/* Grab the old positions of the piece */
		let [ox, oy] = selectedPiece
						.style             // Get the style attributes
						.transform         // Get the transformation style attribute
						.match(/[0-9]+/g)  // Get the percentage offsets in the translation
						.map(n => n / 100) // Divide them by 100 to get board indicies

		/* Get the ID of the selected piece so we can include it in the message to the server */
		let id = selectedPiece.id.slice(1)

		let [o, n] = [{ x: ox, y: oy }, { x: x, y: y }]
		if (gameHistory.length == 0 || gameHistory[gameHistory.length - 1].red)
			gameHistory.push({ blue: moveToHistory(o, n, captures) })
		else
			gameHistory[gameHistory.length - 1].red = moveToHistory(o, n, captures)
		drawHistory()
		removeCaptures(captures, opponentPrefix())
		
		/* Move the selected piece, unselect it, remove the markers, and end our turn */
		if (king)
			selectedPiece.src = selectedPiece.src.replace("piece.svg", "piece-king.svg")
		selectedPiece.style.transform = img.style.transform
		selectedPiece = null
		ourTurn = false
		removeMarkers();

		/* Inform the server that we have moved a piece, and tell it where the piece used to be and
		 * where it has moved to
		 */
		ws.send(JSON.stringify({
			head: Messages.MOVED,
			body: {
				id: id,
				old: { x: ox, y: oy },
				new: { x: x, y: y },
				captures: captures,
				king: king,
				history: gameHistory
			}
		}))
	})
}

/*
 * Signature:
 *     (Piece[], Color) => Nothing
 *
 * Description:
 *     Remove all of the captured pieces which are specified by the array `captures' of color `color'
 *     from the board and then update the capture deltas on the side of the screen to reflect the new
 *     counts.
 */
const removeCaptures = (captures, color) => {
	captures.forEach(p => document.getElementById(p.color + p.id).remove())
	let node = document.getElementById(color == Color.BLUE ? "delta-red" : "delta-blue")
	node.innerHTML = `+${Number(node.innerHTML) + captures.length}`
}

/*
 * Signature:
 *     ({ id: Number, position: { x: Number, y: Number }, captures: Piece[],
 *                                                        king: Boolean) => Nothing
 *
 * Description:
 *     Move the opponents piece with the ID `id' to the position specified by `position'. Then if the
 *     `king' flag is set, meaning that the piece became a king, we crown it. Finally we remove all
 *     of the pieces specified by the `captures' array.
 */
const movePiece = ({ id, position, captures, king }) => {
	let node = document.getElementById(opponentPrefix() + id);
	node.style.transform = `translate(${position.x * 100}%, ${position.y * 100}%)`

	/* NOTE: It's important that you *dont* do `.replace(".svg", "king.svg")' because a piece may get
	 *       flagged for crowning multiple times
	 */
	if (king)
		node.src = node.src.replace("piece.svg", "piece-king.svg")
	
	removeCaptures(captures, colorPrefix)
}

/*
 * Signature:
 *     () => Nothing
 *
 * Description:
 *     Setup the event listeners for all of the pieces on the board. Each event listener will listen
 *     for a click event which signals the user selecting a piece. Piece selection should trigger the
 *     position markers indicating all the valid spots a piece can move to, to appear.
 */
const setupPieceEventListeners = () => {
	/* Get all the pieces from the board and filter them so that we only get the current clients
	 * pieces. Then for each of the pieces we add an event listener.
	 */
	Array
		.from(document.getElementsByClassName("piece"))
		.filter(p => p.id.startsWith(colorPrefix))
		.forEach(p => p.addEventListener("click", () => {
			/* If it's not our turn, do nothing */
			if (!ourTurn)
				return

			/* Remove any existing position markers from the board */
			removeMarkers()

			/* If we clicked on a piece that was not previously selected, we add the position markers to
			 * indicate where that piece can legally move to. If it was the piece that was already
			 * selected however, then do nothing, simply unselect the piece.
			 */
			if (selectedPiece != p) {
				legalMoves[p.id.slice(1)].forEach(addMarker)
				selectedPiece = p
			} else
				selectedPiece = null
		}))
}

/*
 * Signature:
 *     () => Nothing
 *
 * Description:
 *     Draw the game history to the history table on the right. This is done in a bit of a hacky way
 *     where we effectively generate the HTML on the spot. The history information is read from the
 *     `gameHistory' global variable.
 */
const drawHistory = () => {
	/* Get a short list of the history array, which only contains the last 8 turns that were played */
	const shortList = gameHistory.slice(-8).map(h => ({
		blue: h.blue,
		red: (typeof(h.red) == "undefined" ? "" : h.red)
	}))

	let html = ""
	for (let i = 7; i >= shortList.length; i--)
		html += `<tr><td class="turn-no">${i + 1}</td><td></td><td></td></tr>`
	for (let i = shortList.length - 1; i >= 0; i--)
		html += `<tr><td class="turn-no">${i + 1 + gameHistory.length - shortList.length}</td><td>
				${shortList[i].blue}</td><td>${shortList[i].red}</td></tr>`
	document.getElementById("history-body").innerHTML = html
}

/* Listen for a message from the client, and perform a different action based on the message.
 * The `public/javascripts/game.js' file explains what each of the message headers mean.
 */
ws.addEventListener("message", ({ data }) => {
	data = JSON.parse(data)
	switch (data.head) {
	case Messages.WELCOME:
		colorPrefix = data.body
		setupPieceEventListeners()
		if (colorPrefix == Color.BLUE)
			alert("You are the blue player! Currently waiting for the opponent to join...")
		else
			alert("You are the red player!")
		break
	case Messages.RESIGN:
		alert("The opponent has resigned, you win!")
		break
	case Messages.DISCONNECT:
		alert("The opponent has disconnected, you win!")
		break
	case Messages.COMMENCE:
		ourTurn = true
		legalMoves = data.body.moves
		gameHistory = data.body.history
		break
	case Messages.MOVED:
		movePiece(data.body)
		gameHistory = data.body.history
		drawHistory()
		break
	case Messages.START:
		alert("The opponent has joined, you can make your first move.")
		break
	case Messages.GAMEOVER:
		alert(data.body == colorPrefix ? "Congratulations, you have won!"
									   : "Unfortunately, you have lost...")
		break
	}
})

/* Add an event listener to the resign button which will inform the server about when we have
 * resigned the game
 */
document
	.getElementById("resign")
	.addEventListener("click", () => ws.send(JSON.stringify({ head: Messages.RESIGN })))
