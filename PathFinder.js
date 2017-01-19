//-------1---------2---------3---------4---------5---------6---------7--------8
//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
var PathFinder = (function() {

  var module = {};

  function PathFinderCell(coord, previous_coord, path_cost) {
    var cell = {
      coord:coord,
      path_cost:path_cost,
      previous_coord:previous_coord
    };
    return cell; 
  }

  //Creates a new array of visited cells
  function init_visited(origin) {
    let visited = new Map();
    let first_cell = PathFinderCell(origin, undefined, 0);
    setCell(visited, origin, first_cell);
    return visited;
  }

  //Modifies the pathfinder array result to be returned
  function currentCell(visited, coord) {
    return visited.get(JSON.stringify(coord));
  } 
  function setCell(visited, coord, value) {
    visited.set(JSON.stringify(coord), value); //MUTABILITY OF DATA HERE
  }
  function hasCell(visited, coord) {
    return visited.has(JSON.stringify(coord)); 
  }
  

  //Make all cells within 1 step of cell
  function makeNeighbors(map, cell, costFunction) {
    let coords = map.getNeighbors(cell.coord);
    return coords.map( makeNeighborCell(map, cell, costFunction) );
  }
  
  function makeNeighborCell(map, cell, costFunction) {
    return function(coord) {
      let tile = map.getValue(coord);
      let previous_tile = map.getValue(cell.coord);

      let cost_so_far = cell.path_cost;
      let step_cost = stepCost(tile, previous_tile, costFunction);
      let cost = cost_so_far + step_cost;

      let new_cell = PathFinderCell(coord, cell.coord, cost);
      return new_cell;
    };
  }


  //Requires a pathfinded 'visited' array, returns an array of cells
  function calculatePath(visited, origin, target) {
    
    if (origin.equals(target)) {
      return [ getOriginCell(origin) ];
    }

    //find path to the hex before target using function
    let current_cell = currentCell(visited, target);
    let previous_coord = current_cell.previous_coord;

    let path = getPath(visited, origin, previous_coord);
    path.push(current_cell);

    return path;
  }

  //Creates a cell at the start of a queue
  function getOriginCell(origin) {
    return PathfinderCell(origin,0,undefined);
  }

  //Return the cells worth revisiting for pathfinding
  function getCellsToRevisit(visited, cells) {

    return cells.filter(function(cell) {
        return considerNewCell(cell, visited); 
      });
  }

  //higher order function
  function cellIsWithinCost(max_cost) {
    return function(cell) {
      return !(movementCostExceeded(cell.path_cost, max_cost));
    }
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
  
  //Returns true if the new cell should be added in
  function considerNewCell(new_cell, visited) {

    //new cells are always added
    if (!hasBeenVisited(visited, new_cell)) {
      return true;
    }   
    //revisited cells are added if better than before
    let current_cell = currentCell(visited, new_cell.coord);
    if (newCellIsBetter(current_cell, new_cell)) {
     return true;
    } 
    return false;
  }

  function hasBeenVisited(visited, cell) {
    return hasCell(visited,cell.coord);
  }

  //While pathfinding, returns true if new cell is better
  function newCellIsBetter(cell, new_cell) {
    return (new_cell.path_cost < cell.path_cost);

  }
    
  //Returns the movement cost from first tile to second.
  //Moving downhill is a smaller value than uphill.
  function stepCost(tile, previous_tile, costFunction) {
    return costFunction(previous_tile, tile);
  };

  //Find movement cost to all cells within range of origin
  function rangeFind(map, origin, max_cost, costFunction) {
    
    let visited = init_visited(origin);

    if (max_cost <= 0) 
      return;

    visited = rangeFindStep(map,visited,origin,max_cost,costFunction);
    console.log(visited);
    //testVisited(visited);
    return visited;
  };

  function getHex(cell) {
    return cell.coord;
  }

  function testVisited(visited) {
    for (let hex of visited.map( getHex )) {
      console.log(hex);
      let comparison_array = [];
      for (let other_hex of visited.map( getHex ) ) {
	if (Hex.equals(other_hex, hex)) {
	  comparison_array.push(hex);
	}
      } 
      if (comparison_array.length > 1) {
	console.log('duplicate cells in visited array!');
      }
    }
  }

  function rangeFindStep(map,visited,coord,max_cost,costFunction) {
   
    let current_cell = currentCell(visited, coord);
    let neighbor_cells = makeNeighbors(map, current_cell, costFunction);
    let cells_in_range = neighbor_cells.filter(cellIsWithinCost(max_cost));
    let new_cells_to_add = getCellsToRevisit(visited, cells_in_range); 
  
    for (cell of new_cells_to_add) {
      visited.delete(cell.coord);
      setCell(visited, cell.coord, cell); 
      rangeFindStep(map,visited,cell.coord,max_cost,costFunction);
    }

    return visited;

  }

  //returns a map containing only the coordinates on the path
  //to the target
  function targetPathfind(map, origin, target, costFunction){
     
    let max_cost = 200;
    let visited = rangeFind(map, origin, max_cost, costFunction);

    if (!hasCell(visited,target)) {
      console.log('target is out of range');
      return false;
    } else {
      return visited;
    }
    
  };
  
  function getPath(map,origin,target,costFunction) {
    let visited = targetPathfind(map,origin,target,costFunction);
    return calculatePath(visited,origin,target);
  }
  
  //return the cost to move from origin to target
  function getPathCost(map, origin, target,  costFunction) {
    let visited = targetPathfind(map,origin,target,costFunction);
    return currentCell(visited, target).path_cost;
  }

  function getRangeHexes(map, origin, max_cost, costFunction) {
    visited = rangeFind(map, origin, max_cost, costFunction);
    var hex_array = [];
    for (cell of visited.values()) {
      hex_array.push(getHex(cell)); 
    }
    console.log(hex_array);
    return hex_array;
  }

  module.getRange = getRangeHexes;
  module.getPath = getPath;
  module.getPathCost = getPathCost;
  return module;
})();
