const Http = require("http")
const WebSocket = require("ws")
const Express = require("express")
const { stat } = require("fs")

const Game = require("./game")
const Color = require("./public/javascripts/color")
const Messages = require("./public/javascripts/messages")
const Environment = require("./environment")
const indexRouter = require("./routes/index")
const stats = require("./statTracker")

/* Get the server port, if the user doesn't provide one then print an error to STDERR and exit */
const port = process.argv[2]
if (!port) {
	process.stderr.write("Usage: npm start port")
	process.exit(1)
}

/* Initialize the routes */
const app = Express()
app.set("view engine", "ejs")
app.use(Express.static(__dirname + "/public"))
app.get("/", indexRouter)
app.get("/play", indexRouter)

/* Initialize the server and websocket server */
const server = Http.createServer(app)
const wss = new WebSocket.Server({ server })

/* Initialize the environment */
let env = new Environment()

wss.on("connection", ws => {
	/* When a new client connects, get the first game whos status is pending and add the client to
	 * that game. If there is no such game, then create a new one which will wait for a second client
	 * to join.
	 */
	let game = env.games.filter(g => !g.ongoing)[0]
	if (!game) {
		game = new Game()
		env.games.push(game)
		game.bluePlayer = ws
		game.messageClient({ head: Messages.WELCOME, body: Color.BLUE }, ws)
	} else {
		game.redPlayer = ws
		game.ongoing = true
		game.messageClient({ head: Messages.WELCOME, body: Color.RED }, ws)

		/* Once the red player joins the game, we can officially start this game and inform the blue
		 * player that he can make his opening move.
		 */
		game.messageOpponent({ head: Messages.START }, ws)
		stats.ongoingGames++
		stats.totalGames++
		game.nextTurn()
	}

	/* When a client disconnects, check if the game they were part of was ongoing (the game could
	 * have been waiting for a second client to join). If it was, message the opponent that they
	 * have won. Regardless of the state of the game, make sure to remove the game from the games
	 * array.
	 */
	ws.on("close", () => {
		if (game.ongoing && env.games.includes(game)) {
			game.messageOpponent({ head: Messages.DISCONNECT }, ws)
			stats.ongoingGames--
			stats.totalGames--
		}
		env.removeGame(game)
	})

	ws.on("message", msg => {
		msg = JSON.parse(msg)
		switch (msg.head) {
		/* When a player resigns we check to see if the game is still ongoing and if it is we
		 * decrement the `ongoingGames' and `totalGames' counters.
		 */
		case Messages.RESIGN:
			if (game.ongoing && env.games.includes(game)) {
				game.messageOpponent(msg, ws)
				stats.ongoingGames--
				stats.totalGames--
			}
			env.removeGame(game)
			break

		/* When the client makes a move, we tell the opponent about the move that was made so that
		 * they can display the moved pieces on their end. We also tell the game object about the
		 * move so that it can calculate legal moves for the next turn.
		 */
		case Messages.MOVED:
			game.messageOpponent({
				head: Messages.MOVED,
				body: {
					id: msg.body.id,
					position: msg.body.new,
					captures: msg.body.captures,
					king: msg.body.king,
					history: msg.body.history
				}
			}, ws)
			game.move(msg.body)

			/* If this returns false, it means that one of the players won the game. In this case we
			 * need to update statistics regarding the amount of moves it takes to win a game and
			 * such. We also need to remove the game.
			 */
			if (!game.nextTurn()) {
				const totalMoves = game.history.length

				/* Update minimum amount of moves in stat tracker */
				stats.minimumMoves = Math.min(totalMoves, stats.minimumMoves)

				/* Update average amount of moves in stat tracker */
				stats.averageMoves = stats.averageMoves == Infinity
					? totalMoves
					: (stats.averageMoves * (stats.totalGames - 1) + totalMoves) / stats.totalGames

				/* Remove ongoing game */
				stats.ongoingGames--
				env.removeGame(game)
			}
			break
		}
	})
})

server.listen(port)
