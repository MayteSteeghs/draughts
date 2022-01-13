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
				king: king
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
		legalMoves = data.body
		break
	case Messages.MOVED:
		movePiece(data.body)
		break
	}
})

/* Add an event listener to the resign button which will inform the server about when we have
 * resigned the game
 */
document
	.getElementById("resign")
	.addEventListener("click", () => ws.send(JSON.stringify({ head: Messages.RESIGN })))
