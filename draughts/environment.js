/* A class representing the complete environment. It holds all the games as well as some statistics
 * to be displayed on the splash screen.
 */
const Environment = function() {
	this.minimumMoves = Infinity,
	this.averageMoves = Infinity,
	this.totalGames = 0,
	this.games = []
}

/* Function to remove a game from the environment */
Environment.prototype.removeGame = function(game) {
	this.games = this.games.filter(g => g != game)
}

module.exports = Environment
