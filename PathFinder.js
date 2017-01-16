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


  //Creates a new array of visited cells
  function init_visited(origin) {
    let visited = new HexMap();
    let first_cell = new PathFinderCell(0, undefined);
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
    return new PathfinderCell(0,undefined);
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
      neighbors_to_add = processNeighbors(visited, map, hex, 
	                                  max_cost, costFunction);          

      for (neighbor of neighbors_to_add) {
	visited.set(neighbor.hex, neighbor.cell);
	frontier.put(neighbor.hex);
      }
    }
    
    return visited;
  };

  //experimental function to turn rangePathfind into a recursive and
  //stateless function
  function recursivePathfind(visited, map, hex, max_cost, costFunction) {
    let neighbors_to_add = processNeighbors(visited, map, hex, 
                                        max_cost, costFunction);
    for (neighbor of neighbors_to_add) {
      visited.set(neighbor.hex, neighbor.cell);
      frontier = recursivePathfind(visited,map,neighbor.hex,max_cost,costFunction);
    }
    
    return visited;
  }

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
    if (max_cost < 0 ) {
      return false;
    }
    if (cost < max_cost) {
      return false;
    }
    return true;
  }

  //Add neighbors to the processing list if needed
  function processNeighbors(visited, map, previous_hex, max_cost, costFunction) {
    let new_cells_array = [];

    let previous_tile = map.getValue(previous_hex);
    let cell = getCell(visited, previous_hex); 
    let cost_so_far = cell.path_cost;
    
    for (let hex of previous_hex.getNeighbors()) {
      //full map needed to know if hex is on the map
      if (!hexIsOnTheMap(map, hex)) {
	continue;
      }
      
      //full map needed to get the value 
      let tile = map.getValue(hex);

      //visited needed for cost_so_far
      let step_cost = stepCost(tile, previous_tile, costFunction);
      let cost = cost_so_far + step_cost;

      var new_cell = new PathFinderCell(previous_hex, cost);
      
      //visited needed for if hex has been visited 
      if (considerNewCell(visited, hex, new_cell, max_cost)) {
	new_cells_array.push({hex:hex,cell:new_cell});
      }
    }
    return new_cells_array;
  }

  //Returns true if the new cell should be added in
  function considerNewCell(visited, hex, new_cell, max_cost) {

    //undefined path costs are discarded
    if (new_cell.path_cost === undefined) {
      return false;
    }
    //cells outside the range are discarded
    if (movementCostExceeded(new_cell.path_cost, max_cost)) { 
      return false;
    }
    //new cells are always added
    if (!hexHasBeenVisited(visited, hex)) {
      return true;
    }   
    //revisited cells are added if better than before
    let current_cell = getCell(visited, hex);
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
      return undefined;
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
    let path = targetPathfind(map,origin,target,costFunction);
    return path[path.length-1].path_cost;
  }

  module.getRange = rangePathfind;
  module.getPath = targetPathfind;
  module.getPathCost = getPathCost;
  return module;
})();
