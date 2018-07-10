//-------1---------2---------3---------4---------5---------6---------7--------8
//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
//it take maps as arguments as returns maps as 'visited'
var PathFinder = (function() {

  var module = {};

  function PathFinderCell(coord, previous_coord, path_cost) {
    let cell = {
      coord:coord,
      previous_coord:previous_coord,
      path_cost:path_cost
    };
    return cell;
  }

  function getCoord(cell) {
    return cell.coord;
  }

  //Creates a new map of the visited cells
  function initVisited(origin) {
    return setCell( new Map(), origin, originCell(origin) );
  }

  function originCell(coord) {
    return PathFinderCell(coord, undefined, 0);
  }

  //Modifies the pathfinder array result to be returned
  function currentCell(visited, coord) {
    return visited.get(JSON.stringify(coord));
  } 

  function setCell(visited, coord, value) {
    return new Map(visited).set(JSON.stringify(coord), value); 
  }

  function hasCell(visited, coord) {
    return visited.has(JSON.stringify(coord)); 
  }
  
  function getTile(map, coord) {
    return map.getValue(coord);
  } 

  function calculateCost(cost_so_far, tile, previous_tile, costFunction) {
    return cost_so_far + costFunction(tile, previous_tile);
  }

  function makeNeighborCell(map, previous_cell, costFunction) {
    return function(coord) {
      let tile = getTile(map, coord);
      let previous_tile = getTile(map, getCoord(previous_cell));

      let cost = calculateCost(previous_cell.path_cost, tile,
	                           previous_tile, costFunction);

      return PathFinderCell(coord, getCoord(previous_cell), cost);
    };
  }


  //Requires a pathfinded 'visited' array, returns an array of cells
  //recursive
  function calculatePath(visited, origin, target) {
    
    if (origin.equals(target)) {
      return [ getOriginCell(origin) ];
    }

    //find path to the hex before target using function
    let current_cell = currentCell(visited, target);
    let previous_coord = current_cell.previous_coord;

    let partial_path = calculatePath(visited, origin, previous_coord);
    let full_path = partial_path.push(current_cell);

    return full_path;
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

  function cellIsPassable(map, cost_function) {
    return function(cell) {
      let coord = getCoord(cell);
      let tile = getTile(map, coord);
      let previous_tile = getTile(map, cell.previous_coord);
      return ( cost_function( previous_tile, tile ) != undefined );
    }
  }
  
  //Returns true if there is the movement is not exceeded
  function movementCostExceeded(cost, max_cost) {
    if (cost === undefined ) {
      return true;
    }
    if (cost == 'NaN') {
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
    let current_cell = currentCell(visited, getCoord(new_cell));
    if (newCellIsBetter(current_cell, new_cell)) {
     return true;
    } 
    return false;
  }

  function hasBeenVisited(visited, cell) {
    return hasCell(visited, getCoord(cell) );
  }

  //While pathfinding, returns true if new cell is better
  function newCellIsBetter(cell, new_cell) {
    return (new_cell.path_cost < cell.path_cost);

  }
 
  function getGoodNeighbors(map, visited, coord, max_cost,
                            neighborFunction, costFunction) {
    
    let current_cell = currentCell(visited, coord);
    let neighbor_coords = neighborFunction(map, getCoord(current_cell));
    let neighbor_cells = neighbor_coords.map( 
                           makeNeighborCell(map, current_cell, costFunction) 
                         );
    
    let passable_cells = neighbor_cells.filter(
                           cellIsPassable(map, costFunction)
                         );
			  
    let cells_in_range = passable_cells.filter(cellIsWithinCost(max_cost));
    let new_cells_to_add = getCellsToRevisit(visited, cells_in_range); 


    return new_cells_to_add;
  }

  //recursive step of exploring the map
  function rangeFindRecursive(map, visited, coord, max_cost,
                         costFunction, neighborFunction) {
    let new_cells_to_add = getGoodNeighbors(map, visited, coord, max_cost,
                           neighborFunction, costFunction);
  
    for (cell of new_cells_to_add) {
      //mutability of data in these steps!
      visited = setCell(visited, getCoord(cell), cell); 
    }

    for (cell of new_cells_to_add) {
      visited = rangeFindRecursive(map,visited,getCoord(cell),max_cost,
	            costFunction,neighborFunction);
    }

    return visited;

  }

  //Returns an array of coordinates of each cell that was visited 
  function getRangeCoordinates(visited) {
    var coord_array = [];
    for (cell of visited.values()) {
      coord_array.push(getCoord(cell)); 
    }
    return coord_array;
  }
 
  //returns a map containing only the coordinates on the path
  //to the target
  function targetPathfind(map, origin, target, pathfinder){
     
    let max_cost = 200;
    console.log(rangeFinder);
    let visited = pathfinder(map, origin, max_cost);

    console.log(visited);
    if (!hasCell(visited,target)) {
      console.log('target is out of range');
      return false;
    } else {
      return visited;
    }
    
  };

  function getVisitedFinder(costFunction, neighborFunction) {
    return function(map, origin, max_cost) {
      let visited = initVisited(origin);
      
      //return a map of origin only if movement is 0
      if (max_cost <= 0)
	     return visited;
      
      visited = rangeFindRecursive(map, visited, origin, max_cost,
	                      costFunction, neighborFunction);
      return visited;
    }
  }


  //
  //
  //  public functions
  //
  //





  //Returns a function which can be used many times to find range 
  function getRangeFinder(costFunction, neighborFunction) {
    let pathfinder = getVisitedFinder(costFunction, neighborFunction);
    return function(map, origin, max_cost) {
      let visited = pathfinder(map, origin, max_cost);
      return getRangeCoordinates(visited);
    };
  }

  //Return a function which can be used many times
  function getCostFinder(costFunction, neighborFunction) {
    let pathfinder = getVisitedFinder(costFunction, neighborFunction);
    return function(map, origin, target, max_cost) {
      if (max_cost === undefined) max_cost = 100;
      let visited = pathfinder(map, origin, max_cost);
      return currentCell(visited, target).path_cost;
    }
  }


  //Return a function which can be reused to find the path
  function getPathFinder(costFunction, neighborFunction) {
    let pathFinder = getVisitedFinder(costFunction, neighborFunction);
    return function(map, origin, target, max_cost) {
      if (max_cost === undefined) max_cost = 100;
      let visited = pathfinder(map, origin, max_cost);
      return targetPathfind(map, origin, target, visited);
    } 
  }

  module.getCostFinder = getCostFinder;
  module.getRangeFinder = getRangeFinder;
  module.getPathFinder = getPathFinder;
  
  return module;
})();
