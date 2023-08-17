//-------1---------2---------3---------4---------5---------6---------7--------8

import PriorityQueue from './PriorityQueue.js'
import Hex from './Hex.js'

//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
//it take maps as arguments as returns maps as 'visited'
export default function PathFinder(stepCostFunction, getNeighborFunction, stopFunction) {

  //stepCostFunction must be          function(map, coordinate1, coordinate2)
  //getNeighborFunction must be       function(map, coordinate)
  //stopFunction is optional, must be function(map, coordinate1, coordinate2, (maybe origin))

  var visited = new Map();
  var origins = [];

  //setup 3 functions
  if (!stopFunction)
    var stopFunction = function(map, coordinate1, coordinate2, origin) {return false;};

  //Return a function which can be used many times
  this.getCost = function(map, origin, target, max_cost = 10) {
    initVisited(origin);
    rangeFind(map, max_cost, target);
    return currentCell(target).path_cost;
  };

  //Return a function which can be reused to find the path
  this.getPath = function(map, origin, target, max_cost = 10) {
    initVisited(origin);
    rangeFind(map, max_cost, target);
    return targetPathfind(map, origin, target);
  };

  //Returns a function which can be used many times to find range 
  this.getRange = function(map, origin, max_cost) {
    initVisited(origin);
    rangeFind(map, max_cost);
    return getRangeArray(max_cost);
  };

    //Returns a function which can be used many times to find range 
  this.getTree = function(map, origin, max_cost) {
    initVisited(origin);
    rangeFind(map, max_cost);
    return getRangeTree(max_cost);
  };




  


  function PathFinderCell(coord, previous_coord, path_cost) {
    this.coord = coord;
    this.previous_coord = previous_coord;
    this.path_cost = path_cost;
  };




  //Creates a new map of the visited cells
  function initVisited(origin) {
    visited = new Map();
    origins = [];

    if (Array.isArray(origin)) {

      for (let position of origin) {
        setCell( position, makeOriginCell(position) );
        origins.push(position);
      }
    } else {
      setCell( origin, makeOriginCell(origin) );
      origins.push(origin);
    }
  };

  function getOriginArray() {
    return origins;
  }
 
  function makeOriginCell(coord) {
    return new PathFinderCell(coord, undefined, 0);
  };

  //Modifies the pathfinder array result to be returned
  function currentCell(coord) {
    return visited.get(JSON.stringify(coord));
  } ;

  function setCell(coord, value) {
   visited.set(JSON.stringify(coord), value); 
  };
 

  function hasCell(coord) {
    return visited.has(JSON.stringify(coord)); 
  };

  function calculateCost(map, cost_so_far, coord, previous_coord) {
    
    let step_cost = stepCostFunction(map, previous_coord, coord, getOriginArray());
    return cost_so_far + step_cost;
  };

  function makeNeighborCell(map, previous_cell) {

    return function(coord) {
      let previous_coord = previous_cell.coord;
      let cost = calculateCost(map, previous_cell.path_cost, coord, previous_coord);
      return new PathFinderCell(coord, previous_coord, cost);
    };
  };


  //Requires a pathfinded 'visited' array, returns an array of cells
  //recursive
  function calculatePath(origin, target) {
    
    if (origin.equals(target)) {
      return [ makeOriginCell(origin) ];
    }

    //find path to the hex before target using function
    let current_cell = currentCell(target);
    let previous_coord = current_cell.previous_coord;

    let partial_path = calculatePath(origin, previous_coord);
    let full_path = partial_path.push(current_cell);

    return full_path;
  };



  //Return the cells worth revisiting for pathfinding
  function getCellsToRevisit(cells) {

    return cells.filter(function(cell) {
        return considerNewCell(cell); 
      });
  };

  //higher order function
  function cellIsWithinCost(max_cost) {

    return function(cell) {
      return !(movementCostExceeded(cell.path_cost, max_cost));
    }
  };


  function cellIsPassable(map) {

    return function(cell) {
      let coord = cell.coord;
      return ( stepCostFunction(map, cell.previous_coord, coord, getOriginArray() ) != undefined );
    };
  };


  
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
  };


  
  //Returns true if the new cell should be added in
  function considerNewCell(new_cell) {

    //new cells are always added
    if (!hasBeenVisited(new_cell)) {
      return true;
    }   
    //revisited cells are added if better than before
    let current_cell = currentCell(new_cell.coord);

    return newCellIsBetter(current_cell, new_cell);
  };


  function hasBeenVisited(cell) {
    return hasCell( cell.coord );
  };

  //While pathfinding, returns true if new cell is better
  function newCellIsBetter(cell, new_cell) {
    return (new_cell.path_cost < cell.path_cost);

  };

  function getGoodNeighbors(map, coord, max_cost) {

    var current_cell = currentCell( coord );
    var neighbor_coords = getNeighborFunction( map, current_cell.coord );
    var neighbor_cells = neighbor_coords.map( makeNeighborCell(map, current_cell) );
    var passable_cells = neighbor_cells.filter( cellIsPassable(map) );
    var cells_in_range = passable_cells.filter( cellIsWithinCost(max_cost));
    var new_cells_to_add = getCellsToRevisit(cells_in_range); 
    return new_cells_to_add;
  };





     //recursive step of exploring the map
  function rangeFind(map, max_cost, target = null) {

    let new_cells_to_add = [];

    let all_coords_to_visit;
    if (target)
      all_coords_to_visit = new PriorityQueue(   (coord1, coord2) => (currentCell(coord1).path_cost+Hex.distance(coord1,target) < currentCell(coord2).path_cost+Hex.distance(coord2,target)) );  
    else
      all_coords_to_visit = new PriorityQueue(   (coord1, coord2) => (currentCell(coord1).path_cost < currentCell(coord2).path_cost) );  


    for (let origin of origins)
      all_coords_to_visit.push(origin);
      
    do {

      //coord = all_coords_to_visit.shift();
      let coord = all_coords_to_visit.pop();

      //do not look further if stop function triggers (except at origin)
      let previous_coord = currentCell(coord).previous_coord;
      if ( !previous_coord || (previous_coord && !stopFunction(map, previous_coord, coord, origins))  )
        new_cells_to_add = getGoodNeighbors(map, coord, max_cost);
      else
        continue;
    
      for (let cell of new_cells_to_add) {
        //mutability of data in these steps!
        setCell(cell.coord, cell); 
      }

      let new_coords = new_cells_to_add.map( cell => cell.coord );

      for (let new_coord of new_coords) {
        all_coords_to_visit.push(new_coord);
      }
      
      //Stop if target is reached
      if (target && target.equals(coord))
          break;
      
    } while (!all_coords_to_visit.isEmpty()) 

  };











  //Returns an array of coordinates of each cell that was visited 
  function getRangeArray(max_cost) {
    var coord_array = [];
    for (let cell of visited.values()) {
      if (cell.path_cost <= max_cost) {
        coord_array.push( cell.coord ); 
      }
    }
    return coord_array;
  };


  //Returns an array of coordinates of each cell that was visited, and the cell that leads to them 
  function getRangeTree(max_cost) {

    return visited;
  };
 
  //returns a map containing only the coordinates on the path
  //to the target
  function targetPathfind(map, origin, target) {
     
    //doesnt work
    let path_array = [];

    if (!hasCell(target)) 
      return false;
    
    //trace path back from target to origin
    let coord = target;
    while (currentCell(coord).previous_coord) {
      path_array.push(coord);
      coord = currentCell(coord).previous_coord;
    }

    path_array.push(coord);
    return path_array;
  };

  
}

