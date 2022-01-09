const websocket = requre("ws");

const game = function(gameID){
    this.playerRed;
    this.playerBlue;
    this.id = gameID;
    this.gameState = "0 JOINT";
}

game.prototype.transitionStates = { 
    "0 JOINT": 0, 
    "1 JOINT": 1, 
    "2 JOINT": 2,
    "Red": 3,  //Red won
    "Blue": 4, //Blue won
    "ABORTED": 5
  };

  