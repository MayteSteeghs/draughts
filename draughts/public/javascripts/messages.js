/* A basic enumeration of different messages that can be sent via websockets between the client(s)
 * and the server. Each message has a comment explaining what it represents.
 *
 *     S --> C :: The server sends the message to the client
 *     C <-- S :: The client sends the message to the server
 *     S <-> C :: The server sends the message to the client and vise versa
 */
(function (exports) {
	exports.COMMENCE   = 0 // S --> C :: Inform the client that they may commence their turn
	exports.RESIGN     = 1 // S <-> C :: Inform the server/opponent that the client resigned
	exports.DISCONNECT = 2 // S --> C :: Inform the client that the opponent disconnected
	exports.MOVED      = 3 // S <-> C :: Inform the server/opponent that the client has moved a piece
	exports.WELCOME    = 4 // S --> C :: Inform the client of their color when they join the game
	exports.START      = 5 // S --> C :: Inform the blue player that they can make the first move
	exports.GAMEOVER   = 6 // S --> C :: Inform the clients that the game is over
})(typeof(exports) == "undefined" ? (this.Messages = {}) : exports)
