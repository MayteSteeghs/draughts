(function (exports) {

    /*
   * Client to server: game is complete, the winner is ...
   */
  exports.T_GAME_WON_BY = "GAME-WON-BY";
  exports.O_GAME_WON_BY = {
    type: exports.T_GAME_WON_BY,
    data: null,
  };

    /*
   * Server to client: set as player red
   */
  exports.T_PLAYER_TYPE = "PLAYER-TYPE";
  exports.O_PLAYER_RED = {
    type: exports.T_PLAYER_TYPE,
    data: "RED",
  };
  exports.S_PLAYER_RED = JSON.stringify(exports.O_PLAYER_RED);

  /*
   * Server to client: set as player blue
   */
  exports.O_PLAYER_BLUE = {
    type: exports.T_PLAYER_TYPE,
    data: "BLUE",
  };
  exports.S_PLAYER_BLUE = JSON.stringify(exports.O_PLAYER_BLUE);

  /*
   * Server to Player Red & Blue: game over with result won/loss
   */
  exports.T_GAME_OVER = "GAME-OVER";
  exports.O_GAME_OVER = {
    type: exports.T_GAME_OVER,
    data: null,
  };

    /*
   * Server to client: abort game (e.g. if second player exited the game)
   */
    exports.O_GAME_ABORTED = {
        type: "GAME-ABORTED",
      };
      exports.S_GAME_ABORTED = JSON.stringify(exports.O_GAME_ABORTED);
    
    
})(typeof exports === "undefined" ? (this.Messages = {}) : exports);
//if exports is undefined, we are on the client; else the server
