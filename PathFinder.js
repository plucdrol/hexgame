//-------1---------2---------3---------4---------5---------6---------7--------8
//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to this cell

function PathFinderCell(path_cost,came_from) {
  this.path_cost = 0;
  this.came_from = {};
  
  this.set = function (path_cost,came_from) {
    this.path_cost = path_cost;
    this.came_from = came_from;
  };

  this.set(path_cost,came_from);
}

//PathFinder takes maps and generates ranges and paths
function PathFinder(map, tile_cost_function) {
  this.map = map;
  
  //Cells visited during pathfinding
  this.visited = new HexMap();

  //Cells at the edge of the pathfinding
  this.frontier = new Queue();

  //Returns the elevation of the terrain at position hex
  this.getTileCost = function(hex) {
    var tile = this.map.getValue(hex);
    var tile_cost = this.tile_cost_function(tile);
    return tile_cost;
  }

  //Deletes previous path to start a new path search
  this.reset = function() {
    this.visited = new HexMap();
    this.frontier = new Queue();
  }

  //Initialize a pathfinding algorithm on the origin cell
  this.init = function(origin) {
    this.reset();
    this.frontier.put(origin);
    
    var first_cell = new PathFinderCell(0, undefined);
    this.setCell(origin, first_cell);
  }
  //Modifies the pathfinder array result to be returned
  this.getCell = function(hex) {
    return this.visited.getValue(hex);
  } 
  this.setCell = function(hex, cell) {
    this.visited.set(hex,cell);
  }
  this.hasCell = function(hex) {
    return this.visited.containsHex(hex);
  }
  this.addCell = function(hex, cell) {
    this.setCell(hex, cell);
    this.frontier.put(hex);
  }

  //Returns if there are hexes remaining in within range
  this.frontierHasHexes = function() {
    return (!this.frontier.isEmpty()); 
  }

  //get a hex on the frontier of the explored range
  this.getFrontierHex = function() {
    return this.frontier.pop();
  }

  //gives you the result of a path-finding
  this.getRange = function(origin, max_cost) {
    this.rangePathfind(origin, max_cost)
    return this.visited;
  }

  //Find movement cost to all cells within range of origin
  this.rangePathfind = function(origin, max_cost) {
    
    this.init(origin);
    
    while ( this.frontierHasHexes() ) {
      var hex = this.getFrontierHex();
      this.examineFrontierHex(hex, max_cost);          
    }
  };
 
  //returns a hexmap containing only the hexes on the path
  //to the target
  this.targetPathfind = function(origin, target, max_cost){
      
    //calculate all paths within the range
    this.rangePathfind(origin, max_cost);

    //return false if the target is out of range 
    if (!this.visited.containsHex(target)) {
      return false;
    }
    
    return this.makePath(origin, target);

  };

  this.makePath = function(origin, target) {
    //add the path hexes on the return hex list
    var hexes_on_path = [];
    var previous_hex = target;
    do {

      //add the visited hex to the path
      var visited_cell = this.getCell(previous_hex);
      hexes_on_path.unshift(visited_cell);

      //prepare to look at the hex before it
      previous_hex = visited_cell.came_from;


    } while (previous_hex != origin);

    return hexes_on_path;
  }

  //Analyse a hex from the frontier, then processing its
  //neighbors if the max cost is not yet overcome
  this.examineFrontierHex = function(hex, max_cost) {
    
    var current_cell = this.getCell(hex);
    var cost = current_cell.path_cost;
    
    if (!this.movementCostExceeded(cost, max_cost)) {
      this.processNeighbors(hex);
    }
  }

  //Returns true if there is the movement is not exceeded
  this.movementCostExceeded = function(cost, max_cost) {
    if (max_cost < 0 ) {
      return false;
    }
    if (cost < max_cost) {
      return false;
    }
    return true;
  }

  //Add neighbors to the processing list if needed
  this.processNeighbors = function(previous_hex) {
    for (let hex of previous_hex.getNeighbors()) {
      if (this.hexIsOnTheMap(hex, previous_hex)) {
	this.processHex(hex, previous_hex);
      }
    }
  }

  //Process a cell while pathfinding
  this.processHex = function(hex, previous_hex) {

    var new_cell = this.makeNeighborCell(hex,previous_hex);
   
    if (this.pathShouldContinue(hex, previous_hex) ) {
      this.addCell(hex, new_cell);
    }
  }

  //Returns true if hex is a path worth exploring
  this.pathShouldContinue = function(hex, previous_hex) {
    
    var already_visited = this.hasCell(hex);
    var current_cell = this.getCell(hex);
    var new_cell = this.makeNeighborCell(hex,previous_hex);
    
    if (already_visited) {
      if (this.newCellIsBetter(current_cell, new_cell)) {
	return true;
      }
    } else {
      if (this.hexIsPassable(hex)) {
	return true;
      }
    }
    return false;
  }

  //Returns true if hex and previous hex are explorable
  this.hexIsOnTheMap = function(hex, previous_hex) {

    if (!this.map.containsHex(hex)) {
      return false;
    }
    if (!this.hasCell(previous_hex)) {
      return false;
    }
    return true;
  }

  //Creates a PathFinder cell going from one hex to another
  this.makeNeighborCell = function(hex,previous_hex) {

    let cost = this.calculatePathCost(hex, previous_hex);
    var new_cell = new PathFinderCell(cost, previous_hex);

    return new_cell;
  }

  //Calculate current minimum cost to a cell
  this.calculatePathCost = function(hex, previous_hex) {
    let cost_so_far = this.getCell(previous_hex).path_cost;
    let step_cost = this.moveCostNeighbor(previous_hex,hex);
    let path_cost = cost_so_far + step_cost;
    return path_cost;
  }

  //While pathfinding, returns true if new cell is better
  this.newCellIsBetter = function(cell, new_cell) {
    
    best_cell = this.getBestCell(cell, new_cell );
    if (best_cell === new_cell) {
      return true;
    }

    return false;
  };

  //Returns if the hex can be walked on
  this.hexIsPassable = function(hex) {
    let elevation = this.getElevation(hex);
    if (elevation > 1 && elevation < 14) {
      return true;
    } else {
      return false;
    }
  };
  
  //Returns which cell is the best path step
  this.getBestCell = function(cell_a, cell_b) {
    var cost_a = cell_a.path_cost;
    var cost_b = cell_b.path_cost;

    if (cost_b < cost_a) {
      return cell_b;
    } 

    return cell_a;    
  
  };  


  //Returns the absolute movement cost value of the tile 
  this.moveCostAbsolute = function(other_tile) {
    return this.get_tile_cost(other_tile);
  };


 //Returns the movement cost from first tile to second.
  //Moving downhill is a smaller value than uphill.
  this.moveCostNeighbor = function(this_tile, other_tile) {
    
    //returns a positive number for uphill movement
    // negative number for downhill movement
    var cost_this  = this.get_tile_cost(this_tile);
    var cost_other = this.get_tile_cost(other_tile);
    var difference = cost_other - cost_this; 

    //Returns values based on difference in elevation only
    if (difference >= 4) {
      return 100;
    }
    if (difference > 0)  {
      return 6;
    }
    if (difference === 0) {
      return 4;
    }
    if (difference < 0) {
      return 3;
    }
    if (difference < -4) {
      return 100;
    }
  };

  //return the cost to move from origin to target
  this.moveCostRelative = function(origin, target, range) {
    var path = this.targetPathfind(origin,target,range);
    return path[path.length-1].path_cost;
  }
}
