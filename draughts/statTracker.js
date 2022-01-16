var gameStatus = {
	since: Date.now() /* since we keep it simple and in-memory, keep track of when this object was created */,
	minimumMoves: Infinity,
	averageMoves: Infinity,
	totalGames: 0,
	ongoingGames: 0
}
  
module.exports = gameStatus;
