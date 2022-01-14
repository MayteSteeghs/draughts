const Color = {
	BLUE: "b",
	RED:  "r"
}

/* Initialize a new web socket to connect to the server */
const ws = new WebSocket("ws://localhost:3000")

/* Define some variables */
let legalMoves,    // Array of moves :: Moves that each piece can legally make
	ourTurn,       // Boolean        :: Is it currently our turn?
	selectedPiece, // Piece          :: The current HTML piece we have selected
	colorPrefix    // Color          :: Either Color.BLUE or Color.RED depending on the clients side

const opponentPrefix = () => colorPrefix == Color.BLUE ? Color.RED : Color.BLUE

/* Remove all the position markers from the board */
const removeMarkers = () => Array
							.from(document.getElementsByClassName("position")) // Obtain the markers
							.forEach(pos => pos.remove())                      // Remove them all

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

const removeCaptures = (captures, color) => {
	captures.forEach(p => document.getElementById(color + p.id).remove())
	let node = document.getElementById(color == Color.BLUE ? "delta-red" : "delta-blue")
	node.innerHTML = `+${Number(node.innerHTML) + captures.length}`
}

const movePiece = ({ id, position, captures, king }) => {
	let node = document.getElementById(opponentPrefix() + id);
	node.style.transform = `translate(${position.x * 100}%, ${position.y * 100}%)`

	if (king)
		node.src = node.src.replace("piece.svg", "piece-king.svg")
	
	removeCaptures(captures, colorPrefix)
}

const setupPieceEventListeners = () => {
	Array
		.from(document.getElementsByClassName("piece"))   // Get an array of pieces on the HTML board
		.filter(p => p.id[0] == colorPrefix)              // Get only the pieces of our own color
		.forEach(p => p.addEventListener("click", () => { // Add an event listener to each piece
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
		setupPieceEventListeners()
		if ((colorPrefix = data.body) == Color.BLUE)
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
		break
	}
})

/* Add an event listener to the resign button which will inform the server about when we have
 * resigned the game
 */
document
	.getElementById("resign")
	.addEventListener("click", () => ws.send(JSON.stringify({ head: Messages.RESIGN })))
