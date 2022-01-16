/* A class representing the complete environment. It holds all the games currently being played. */
const Environment = function() {
	this.games = []
}

/* Function to remove a game from the environment */
Environment.prototype.removeGame = function(game) {
	this.games = this.games.filter(g => g != game)
}

module.exports = Environment
