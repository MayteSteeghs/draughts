/**
 * The gameStatus object tracks our statics to be displayed on our splash screen.
 */

var gameStatus = {
	minimumMoves: Infinity, /* The minimum amount of moves a game was completed*/
	averageMoves: Infinity, /* The average amount of moves of all games completed*/
	ongoingGames: 0, /*How many games are ongoing*/
	totalGames: 0 /* How many games were initialized (used for calculations) */
}
  
module.exports = gameStatus;
