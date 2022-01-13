(function (exports) {
	exports.COMMENCE   = 0 // S --> C :: Inform the client that they may commence their turn
	exports.RESIGN     = 1 // S <-> C :: Inform the server/opponent that the client resigned
	exports.DISCONNECT = 2 // S --> C :: Inform the client that the opponent disconnected
	exports.MOVED      = 3 // S <-> C :: Inform the server/opponent that the client has moved a piece
	exports.WELCOME    = 4 // S --> C :: Inform the client of their color when they join the game
	exports.START      = 5 // s --> C :: Inform the blue player that they can make the first move
})(typeof(exports) == "undefined" ? (this.Messages = {}) : exports)
