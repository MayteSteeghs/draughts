(function (exports) {
	exports.START = 0      // Server  -> Client :: Inform the client that the game has started
	exports.RESIGN = 1     // Server <-> Client :: Inform the server/opponent that the client resigned
	exports.DISCONNECT = 2 // Server  -> Client :: Inform the client that the opponent disconnected
})(typeof(exports) == "undefined" ? (this.Messages = {}) : exports)
