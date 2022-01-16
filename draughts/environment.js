/*
 * Signature:
 *     this.games :: Game[]
 *
 * Description:
 *     An admittedly useless class that mostly exists as a result of code evolution and rewriting. It
 *     holds an array containing all of the games that are currently ongoing.
 */
const Environment = function() {
	this.games = []
}

/*
 * Signature:
 *     (Game) => Nothing
 *
 * Description:
 *     Removes the game `game' from the array `this.games'
 */
Environment.prototype.removeGame = function(game) {
	this.games = this.games.filter(g => g != game)
}

module.exports = Environment
