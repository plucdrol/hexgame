//-------1---------2---------3---------4---------5---------6---------7--------8
//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
var PathFinder = (function() {

  var module = {};

  function PathFinderCell(hex,path_cost,came_from) {
    this.hex = hex;
    this.path_cost = path_cost;
    this.came_from = came_from;
    return this; 
  }


  //Creates a new array of visited cells
  function init_visited(origin) {
    let visited = new HexMap();
    let first_cell = new PathFinderCell(origin, 0, undefined);
    visited.set(origin, first_cell);
    return visited;
  }

  //Creates a list of cells on the frontier
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
    return new PathfinderCell(new Hex(0,0),0,undefined);
  }
  function getPreviousHex(tile) {
    return tile.came_from;
  }
  //Modifies the pathfinder array result to be returned
  function getCell(visited, hex) {
    return visited.getValue(hex);
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
      let neighbors_to_add = processNeighbors(visited, map, hex, 
	                                  max_cost, costFunction);          

      for (cell of neighbors_to_add) {
	visited.set(cell.hex, cell);
	frontier.put(cell.hex);
      }
    }
    
    return visited;
  };


  //returns a hexmap containing only the hexes on the path
  //to the target
  function targetPathfind(map, origin, target, costFunction){
     
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
  

  //Returns true if there is the movement is not exceeded
  function movementCostExceeded(cost, max_cost) {
    if (cost === undefined) {
      return true;
    }
    if (max_cost < 0 ) {
      return false;
    }
    if (cost <= max_cost) {
      return false;
    }
    return true;
  }


  //Add neighbors to the processing list if needed
  function processNeighbors(visited, map, previous_hex,
                            max_cost, costFunction) {
    let new_cells_array = [];
    let neighbor_hexes = getNeighborArray(map, previous_hex);
    

    let previous_cell = getCell(visited, previous_hex);
    let cell_array = makeCells(map, neighbor_hexes, previous_cell, costFunction);
	
    let cells_in_range = getCellsWithinCost(cell_array, max_cost);
    for (new_cell of cells_in_range) {
      if (considerNewCell(visited, new_cell)) {
	new_cells_array.push(new_cell);
      }
    }

    return new_cells_array;
  }

  function makeCells(map, hex_array, previous_cell, costFunction) {
    let cell_array = [];
    let previous_tile = map.getValue(previous_cell.hex);
    let cost_so_far = previous_cell.path_cost;

    for (let hex of hex_array) {
      let tile = map.getValue(hex);
      let step_cost = stepCost(tile, previous_tile, costFunction);
      let cost = cost_so_far + step_cost;

      let new_cell = new PathFinderCell(hex, cost, previous_cell.hex);

      cell_array.push(new_cell);
    }
    return cell_array;
  }

  function getCellsWithinCost(cell_array, max_cost) {
    let cells_within_cost = [];
    for (let cell of cell_array) {
      if (!movementCostExceeded(cell.path_cost, max_cost)) {
        cells_within_cost.push(cell);
      }
    }
    return cells_within_cost;
  }

  function getNeighborArray(map, previous_hex) {

    let neighbor_array = [];
    for (neighbor of previous_hex.getNeighbors()) {
      if (hexIsOnTheMap(map,neighbor)) {
        neighbor_array.push(neighbor);
      }
    }
    return neighbor_array;
  }

  //Returns true if the new cell should be added in
  function considerNewCell(visited, new_cell) {

    //new cells are always added
    if (!hexHasBeenVisited(visited, new_cell.hex)) {
      return true;
    }   
    //revisited cells are added if better than before
    let current_cell = getCell(visited, new_cell.hex);
    if (newCellIsBetter(current_cell, new_cell)) {
     return true;
    } 
    return false;
  }


  //Returns true if hex and previous hex are explorable
  function hexIsOnTheMap(map, hex) {
    return map.containsHex(hex);

  }
  function hexHasBeenVisited(visited, hex) {
    return visited.containsHex(hex);
  }

  //Calculate current minimum cost to a cell
  function calculatePathCost(cost_so_far, tile, previous_tile, costFunction) {
    
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
  function stepCost(tile, previous_tile, costFunction) {
    
    //returns a positive number for uphill movement
    // negative number for downhill movement
    var cost_this = costFunction(tile);
    var cost_previous = costFunction(previous_tile);

    if (cost_this === undefined) {
      return undefined;
    }

    if (cost_previous === undefined) {
      cost_previous = 0;
    }
    var difference = cost_this - cost_previous;

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
    
    return undefined;
  };

  //return the cost to move from origin to target
  function getPathCost(map, origin, target,  costFunction) {
    //A default value: should be high enough to cover all costs,
    //but eventually be unnecessary using a different method
    let max_cost = 200;

    //calculate all paths within the range
    let visited = rangePathfind(map, origin, max_cost, costFunction);

    //return false if the target is out of range 
    if (!visited.containsHex(target)) {
      return false;
    }

    return getCell(visited,target).path_cost;

  }

  module.getRange = rangePathfind;
  module.getPath = targetPathfind;
  module.getPathCost = getPathCost;
  return module;
})();
