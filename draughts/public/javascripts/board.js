var board = new Array(10).fill(null).map(()=>new Array(10).fill(null));


var start = function(){
    // set up blue pieces
    let blueCount = 1;
    for (var i = 0; i < 4; i++){
        if (i % 2 == 0){
            for (var j = 0; j < board[i].length; j += 2){
                board[i][j] = new Piece(blueCount, i, j, blue);
                blueCount++;
            }
        } else {
            for (var j = 1; j < board[i].length; j += 2) {
                board[i][j] = new Piece(blueCount, i, j, blue);
                blueCount++;
            }
        }
    }
    
    // set up red pieces
    let redCount = 1;
    for (var i = 6; i < 10; i++){
        if (i % 2 == 0){
            for (var j = 0; j < board[i].length; j += 2){
                board[i][j] = new Piece(redCount, i, j, red);
                redCount++;
            }
        } else {
            for (var j = 1; j < board[i].length; j += 2) {
                board[i][j] = new Piece(redCount, i, j, red);
                redCount++;
            }
        }
    }
    
    return board;
}

function Piece(id, column, row, color){
    this.id = id;
    this.position = {column, row};
    this.color = color;
    this.king = false;
    this.selected = false;
}

Piece.prototype.getColor = function(){
    return this.color;
}

Piece.prototype.getPosition = function(){
    return this.position;
}

Piece.prototype.isKing = function(){
    return this.king;
}

Piece.prototype.setKing = function(){
    this.king = true;
}

Piece.prototype.movePiece = function(direction){
    let x = direction[0];
    let y = direction[1];
    if (x + 1 <= 9 && x - 1 >= 0 && y + 1 <= 9 && y - 1 >= 0){
        this.position = direction;
    }
}

// check if all adjacent tiles are on the board
function directions(x, y){
    return forwardDirections(x, y).concat(backwardDirections(x, y));
}

function forwardDirections(x, y){
    let directions = [];
    if (x + 1 <= 9){
        if (y + 1 <= 9) directions.push(x + 1, y + 1)
        if (y - 1 >= 0) directions.push(x + 1, y - 1)
    }
    return directions;
}

function backwardDirections(x, y){
    let directions = [];
    if (x - 1 >= 0){
        if (y + 1 <= 9) directions.push(x - 1, y + 1);
        if (y - 1 >= 0) directions.push(x - 1, y - 1);
    }

    return directions;
}

Piece.prototype.getPossibleMoves = function(){
    let possibleMoves = [];
    let directions = directions(this.positions[0], this.positions[1]);
    for (let i = 0; i < directions.length; i++){
        let direction = directions[i];
        let hit = checkHit(direction, piece);
        let shift = checkShift(direction, piece); 
        if (hit != null){
            possibleMoves.push(hit);
        }
        if (shift != null){
            possibleMoves.pish(shift);
        }
    }


    return possibleMoves;
}

function checkShift(direction, piece){
    const delta_y = piece.getPosition[1] - direction[1];

    // check if it is a forward move
    if (delta_y > 0){
        // check if square is empty
        if (board[direction[0], direction[1]] == null){
            return new Move(piece, direction, null);
        }
        
    } else {
        if (piece.isKing){
            if (board[direction[0], direction[1]] == null){
                return new Move(piece, direction, null);
            }
        }
    }
}

function checkHit(direction, piece){
    let hits = [];
    let opponent = board[direction[0], direction[1]];

    // check whether the square in this direction is empty and if its an enemy piece
    if (opponent != null && opponent.getColor != piece.getColor){
        // Check whether there is a square to move to
        let delta_x = direction[0] - piece.getPosition[0];
        let delta_y = direction[1] - piece.getPosition[1];

        if (board[direction[0]+ delta_x][direction[0] + delta_y] == null){
            hits.push(opponent);

            return new Move(piece, direction[0]+ delta_x, direction[0] + delta_y, hits)
            // TODO implement functionality for multiple hits
        }
    }
}


function Move(piece, newPosition, hits){
    this.piece = piece;
    this.newPosition = newPosition
    this.hits = hits;
}

Move.prototype.getNoHits = function(){
    return hits.length;
}