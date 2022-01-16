/* An object that holds all sorts of statistics regarding games that have completed and such. These
 * stats get displayed on the splash screen.
 */
var gameStatus = {
	minimumMoves: Infinity,
	averageMoves: Infinity,
	ongoingGames: 0,
	totalGames: 0
}
  
module.exports = gameStatus;
