/* An object that holds all sorts of statistics regarding games that have completed and such. These
 * stats get displayed on the splash screen.
 */
var gameStatus = {
	minimumMoves: Infinity, // The minimum amount of moves a game was completed in
	averageMoves: Infinity, // The average amount of moves games are completed in
	ongoingGames: 0,        // The number of ongoing games
	totalGames: 0           // The number of total games started (used for calculations)
}
  
module.exports = gameStatus;
