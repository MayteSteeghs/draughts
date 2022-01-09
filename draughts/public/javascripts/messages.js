(function (exports) {
	exports.START = 0      // Server -> Client :: The game has started
	exports.RESIGN = 1     // Server -> Client :: The opponent resigned
	exports.DISCONNECT = 2 // Server -> Client :: The opponent disconnected
})(typeof(exports) == "undefined" ? (this.Messages = {}) : exports)
