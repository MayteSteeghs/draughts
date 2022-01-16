const Http = require("http")
const WebSocket = require("ws")
const Express = require("express")

const Game = require("./game")
const Color = require("./public/javascripts/color")
const Messages = require("./public/javascripts/messages")
const Environment = require("./environment")
const indexRouter = require("./routes/index")
const stats = require("./statTracker");
const { stat } = require("fs")

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
		game.messageOpponent({ head: Messages.START }, ws)
		stats.totalGames++
		stats.ongoingGames++
		game.nextTurn()
	}

	/* When a client disconnects, check if the game they were part of was ongoing (the game could
	 * have been waiting for a second client to join). If it was, message the opponent that they
	 * have won. Regardless of the state of the game, make sure to remove the game from the games
	 * array.
	 */
	ws.on("close", () => {
		if (game.ongoing)
			game.messageOpponent({ head: Messages.DISCONNECT }, ws)
		stats.ongoingGames--
		stats.totalGames--
		env.removeGame(game)
	})

	ws.on("message", msg => {
		msg = JSON.parse(msg)
		switch (msg.head) {
		case Messages.RESIGN:
			if (game.ongoing)
				game.messageOpponent(msg, ws)
			stats.ongoingGames--
			stats.totalGames--
			env.removeGame(game)
			break
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
			
			if (!game.nextTurn())
				var totalMoves = game.history.length
				/* Update minimum amount of moves in stat tracker */
				if (totalMoves < stats.minimumMoves){
					stats.minimumMoves = totalMoves
				}
				/* Update average amount of moves in stat tracker */
				if (stats.averageMoves != Infinity){
					stats.averageMoves = (stats.averageMoves * (stats.totalGames - 1) + totalMoves) / stats.totalGames
				} else {
					stats.averageMoves = totalMoves
				}
				/* Remove ongoing game */
				stats.ongoingGames--
				env.removeGame(game)
			break
		}
	})
})

server.listen(port)
