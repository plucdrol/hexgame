//-------1---------2---------3---------4---------5---------6---------7--------8
//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
var PathFinder = (function() {

  var module = {};

  function PathFinderCell(path_cost,came_from) {
    this.path_cost = path_cost;
    this.came_from = came_from;
    return this; 
  }


  //Initialize a pathfinding algorithm on the origin cell
  function init_visited(origin) {
    let visited = new HexMap();
    let first_cell = new PathFinderCell(0, undefined);
    visited.set(origin, first_cell);
    return visited;
  }

  function init_frontier(origin) {
    let frontier = new Queue();
    frontier.put(origin);
    return frontier;
  }


  //Returns the elevation of the terrain at position hex
  function getTileCost(map, hex, tileCostFunction) {
    let tile = map.getValue(hex);
    let tile_cost = tileCostFunction(tile);
    return tile_cost;
  }
  function getOriginCell() {
    return new PathfinderCell(0,undefined);
  }
  function getPreviousHex(tile) {
    return tile.came_from;
  }
  //Modifies the pathfinder array result to be returned
  function getCell(visited, hex) {
    return visited.getValue(hex);
  } 
  function setCell(visited, hex, cell) {
    visited.set(hex,cell);
    return visited;
  }
  function costSoFar(visited, hex) {
    let cost = getCell(visited, hex).path_cost;
    return cost;
    
  }

  //Find movement cost to all cells within range of origin
  function rangePathfind(map, origin, max_cost, costFunction) {
    
    let visited = init_visited(origin);
    let frontier = init_frontier(origin);

    if (max_cost <= 0) 
      return;

    while ( !frontier.isEmpty() ) {
      let hex = frontier.pop();
      examineFrontierHex(visited, frontier, hex, map, max_cost, costFunction);          
    }
    
    return visited;
  };
 
  //returns a hexmap containing only the hexes on the path
  //to the target
  function targetPathfind(map,origin, target,costFunction){
     
    //A default value: should be high enough to cover all costs,
    //but eventually be unnecessary using a different method
    let max_cost = 200;

    //calculate all paths within the range
    let visited = rangePathfind(map, origin, max_cost, costFunction);

    //return false if the target is out of range 
    if (!visited.containsHex(target)) {
      return false;
    }
    
    return calculatePath(visited, origin, target);

  };

  //Requires a pathfinded 'visited' array, returns an array of cells
  function calculatePath(visited,origin,target) {
    
    if (origin.equals(target)) {
      return [ getOriginCell() ];
    }

    //find path to the hex before target using function
    let current_hex = target;
    let current_tile = getCell(visited,target);
    let previous_hex = getPreviousHex(current_tile);

    let path = getPath(visited, origin, previous_hex);
    path.push(current_tile);

    return path;
  }

  //Analyse a hex from the frontier, then processing its
  //neighbors if the max cost is not yet overcome
  function examineFrontierHex(visited, frontier, hex, map, max_cost, costFunction) {
    
    var current_cell = getCell(visited, hex);
    var cost = current_cell.path_cost; 
    if (!movementCostExceeded(cost, max_cost)) {
      
      processNeighbors(visited, frontier, map, hex, costFunction);
    }
  }

  //Returns true if there is the movement is not exceeded
  function movementCostExceeded(cost, max_cost) {
    if (max_cost < 0 ) {
      return false;
    }
    if (cost < max_cost) {
      return false;
    }
    return true;
  }

  //Add neighbors to the processing list if needed
  function processNeighbors(visited, frontier, map, previous_hex, costFunction) {
    for (let hex of previous_hex.getNeighbors()) {
      if (hexHasBeenVisited(visited, previous_hex) 
          && hexIsOnTheMap(map, hex)) {
        
	    considerHex(map, visited, frontier, hex, previous_hex, costFunction);
      }
    }
  }

  //Process a cell while pathfinding
  function considerHex(map, visited, frontier, hex, previous_hex, costFunction) {

    var cost_so_far = costSoFar(visited, previous_hex);
    var new_cell = makeNeighborCell(map, cost_so_far, hex, previous_hex, costFunction);
    if (!(new_cell.path_cost === undefined)) { 
      if (pathShouldContinue(map, visited, hex, previous_hex, costFunction) ) {
        setCell(visited, hex, new_cell);
        frontier.put(hex);
      }
    }
  }

 
  //Returns true if hex is a path worth exploring
  function pathShouldContinue(map, visited, hex, previous_hex, costFunction) {
   
    var already_visited = hexHasBeenVisited(visited, hex);

    var cost_so_far = costSoFar(visited, previous_hex);
    var current_cell = getCell(visited, hex);
    var new_cell = makeNeighborCell(map, cost_so_far, hex, previous_hex, 
                                    costFunction);
    if (new_cell.path_cost === undefined) {
      return false;
    }
    if (!already_visited) {
      return true;
    }
    if (newCellIsBetter(current_cell, new_cell)) {
      return true;
    }
    return false;
  }

  //Returns true if hex and previous hex are explorable
  function hexIsOnTheMap(map, hex) {
    return map.containsHex(hex);
      return false;
  }
  function hexHasBeenVisited(visited, hex) {
    return visited.containsHex(hex);
  }

  //Creates a PathFinder cell going from one hex to another
  function makeNeighborCell(map, cost_so_far,hex,previous_hex, costFunction) {
    let cost = calculatePathCost(map, cost_so_far, hex, previous_hex, costFunction);
    var new_cell = new PathFinderCell(cost, previous_hex);
    
    return new_cell;
  }

  //Calculate current minimum cost to a cell
  function calculatePathCost(map, cost_so_far, hex, previous_hex, costFunction) {
    let step_cost = stepCost(map, previous_hex,hex, costFunction);
    if (step_cost === undefined) {
      return undefined;
    }
    //At this position, sstill working!
    let path_cost = cost_so_far + step_cost;
    
    return path_cost;
  }

  //While pathfinding, returns true if new cell is better
  function newCellIsBetter(cell, new_cell) {
    
    best_cell = getBestCell(cell, new_cell );
    if (best_cell === new_cell) {
      return true;
    }

    return false;
  };

  //Returns which cell is the best path step
  function getBestCell(cell_a, cell_b) {
    var cost_a = cell_a.path_cost;
    var cost_b = cell_b.path_cost;

    if (cost_b < cost_a) {
      return cell_b;
    } 

    return cell_a;    
  
  };  

 //Returns the movement cost from first tile to second.
  //Moving downhill is a smaller value than uphill.
  function stepCost(map, this_hex, other_hex, costFunction) {
    
    //returns a positive number for uphill movement
    // negative number for downhill movement
    var cost_this = getTileCost(map, this_hex, costFunction);
    var cost_other = getTileCost(map, other_hex, costFunction);

    if (cost_this === undefined) {
      return undefined;
    }

    if (cost_other === undefined) {
      return undefined;
    }
    var difference = cost_other - cost_this;

    //Returns values based on difference in elevation only
    if (difference >= 4) {
      return undefined;
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
      return undefined;
    }
  };

  //return the cost to move from origin to target
  function getPathCost(map, origin, target,  costFunction) {
    let path = targetPathfind(map,origin,target,costFunction);
    return path[path.length-1].path_cost;
  }

  module.getRange = rangePathfind;
  module.getPath = targetPathfind;
  module.getPathCost = getPathCost;
  return module;
})();
