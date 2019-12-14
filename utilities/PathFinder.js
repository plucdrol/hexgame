//-------1---------2---------3---------4---------5---------6---------7--------8
//PathFinder cell used for mapping paths
//Tracks the previous cell and total path cost
//on 5e path.from the origin to cell
//it take maps as arguments as returns maps as 'visited'
function PathFinder(stepCostFunction, getNeighborFunction, stopFunction) {

  //stepCostFunction must be (map, coordinate1, coordinate2)
  //getNeighborFunction must be (map, coordinate)
  //stopFunction is optional, must be (map, coordinate1, coordinate2)

  this.visited = new Map();
  this.cells_to_visit = [];

  this.stepCostFunction = stepCostFunction;
  this.getNeighborFunction = getNeighborFunction;
  
  if (stopFunction)
    this.stopFunction = stopFunction;
  else
    this.stopFunction = function(map, coordinate1, coordinate2) {return false;};

  PathFinderCell = function(coord, previous_coord, path_cost) {
      this.coord = coord;
      this.previous_coord = previous_coord;
      this.path_cost = path_cost;
  };

  this.getCoord = function(cell) {
    return cell.coord;
  };

  //Creates a new map of the visited cells
  this.initVisited = function(origin) {
    this.visited = new Map();

    if (Array.isArray(origin))
      for (position of origin)
        this.setCell( position, this.originCell(position) );
    else
      this.setCell( origin, this.originCell(origin) );
  };
 
  this.originCell = function(coord) {
    return new PathFinderCell(coord, undefined, 0);
  };

  //Modifies the pathfinder array result to be returned
  this.currentCell = function(coord) {
    return this.visited.get(JSON.stringify(coord));
  } ;

  this.setCell = function(coord, value) {
   this.visited.set(JSON.stringify(coord), value); 
  };
 

  this.hasCell = function(coord) {
    return this.visited.has(JSON.stringify(coord)); 
  };

  this.calculateCost = function(map, cost_so_far, coord, previous_coord) {
    
    let step_cost = this.stepCostFunction(map, previous_coord, coord);
    
    return cost_so_far + step_cost;
  };

  this.makeNeighborCell = function(map, previous_cell) {
    var self = this;
    return function(coord) {
      let previous_coord = self.getCoord(previous_cell);
      let cost = self.calculateCost(map, previous_cell.path_cost, coord, previous_coord);
      return new PathFinderCell(coord, previous_coord, cost);
    };
  };


  //Requires a pathfinded 'visited' array, returns an array of cells
  //recursive
  this.calculatePath = function(origin, target) {
    
    if (origin.equals(target)) {
      return [ getOriginCell(origin) ];
    }

    //find path to the hex before target using function
    let current_cell = this.currentCell(target);
    let previous_coord = current_cell.previous_coord;

    let partial_path = this.calculatePath(origin, previous_coord);
    let full_path = partial_path.push(current_cell);

    return full_path;
  };



  //Creates a cell at the start of a queue
  this.getOriginCell = function(origin) {
    return new PathfinderCell(origin,0,undefined);
  };

  //Return the cells worth revisiting for pathfinding
  this.getCellsToRevisit = function(cells) {

    var self = this;
    return cells.filter(function(cell) {
        return self.considerNewCell(cell); 
      });
  };

  //higher order function
  this.cellIsWithinCost = function(max_cost) {
    var self = this;
    return function(cell) {
      return !(self.movementCostExceeded(cell.path_cost, max_cost));
    }
  };


  this.cellIsPassable = function(map) {
    var self = this;
    return function(cell) {
      let coord = self.getCoord(cell);
      return ( self.stepCostFunction(map, cell.previous_coord, coord ) != undefined );
    };
  };


  
  //Returns true if there is the movement is not exceeded
  this.movementCostExceeded = function(cost, max_cost) {
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
  this.considerNewCell = function(new_cell) {

    //new cells are always added
    if (!this.hasBeenVisited(new_cell)) {
      return true;
    }   
    //revisited cells are added if better than before
    let current_cell = this.currentCell(this.getCoord(new_cell));
    if (this.newCellIsBetter(current_cell, new_cell)) {
     return true;
    } 
    return false;
  };


  this.hasBeenVisited = function(cell) {
    return this.hasCell(this.getCoord(cell) );
  };

  //While pathfinding, returns true if new cell is better
  this.newCellIsBetter = function(cell, new_cell) {
    return (new_cell.path_cost < cell.path_cost);

  };

  this.getGoodNeighbors = function(map, coord, max_cost) {

    var current_cell = this.currentCell( coord );
    var neighbor_coords = this.getNeighborFunction( map, this.getCoord(current_cell) );
    var neighbor_cells = neighbor_coords.map( this.makeNeighborCell(map, current_cell) );
    var passable_cells = neighbor_cells.filter( this.cellIsPassable(map) );
    var cells_in_range = passable_cells.filter( this.cellIsWithinCost(max_cost));
    var new_cells_to_add = this.getCellsToRevisit(cells_in_range); 
    return new_cells_to_add;
  };


    //recursive step of exploring the map
  this.rangeFindBreadthFirst = function(map, origin, max_cost) {

    let new_cells_to_add = [];

    let pathfinder = this;
    let all_coords_to_visit = [origin];

    let coord;
    
    do {

      coord = all_coords_to_visit.shift();

      //do not look further if stop function triggers (except at origin)
      let previous_coord = this.currentCell(coord).previous_coord;
      if (Hex.equals(origin,coord) || Hex.equals(origin,previous_coord) || (previous_coord && !this.stopFunction(map,previous_coord, coord))  ) 
        new_cells_to_add = this.getGoodNeighbors(map, coord, max_cost);
      else
        continue;
    
      for (cell of new_cells_to_add) {
        //mutability of data in these steps!
        this.setCell(this.getCoord(cell), cell); 
      }

      let new_coords = new_cells_to_add.map(cell => pathfinder.getCoord(cell));

      all_coords_to_visit = all_coords_to_visit.concat(new_coords);
      
    } while (all_coords_to_visit.length > 0) 

  };




    //recursive step of exploring the map
  this.rangeFindPriority = function(map, origin, target, max_cost) {

    let new_cells_to_add = [];

    let pathfinder = this;
    let all_coords_to_visit = new PriorityQueue(   (coord1, coord2) => (pathfinder.currentCell(coord1).path_cost+Hex.distance(coord1,target) < pathfinder.currentCell(coord2).path_cost+Hex.distance(coord2,target)) );
    //let all_coords_to_visit = [];
    all_coords_to_visit.push(origin);
  

    let coord;
    
    do {

      //coord = all_coords_to_visit.shift();
      coord = all_coords_to_visit.pop();

      //do not look further if stop function triggers (except at origin)
      let previous_coord = this.currentCell(coord).previous_coord;
      if (Hex.equals(origin,coord) || Hex.equals(origin,previous_coord) || (previous_coord && !this.stopFunction(map,previous_coord, coord))  ) 
        new_cells_to_add = this.getGoodNeighbors(map, coord, max_cost);
      else
        continue;
    
      for (cell of new_cells_to_add) {
        //mutability of data in these steps!
        this.setCell(this.getCoord(cell), cell); 
      }

      let new_coords = new_cells_to_add.map(cell => pathfinder.getCoord(cell));

      for (new_coord of new_coords) {
        all_coords_to_visit.push(new_coord);
      }
      //all_coords_to_visit = all_coords_to_visit.concat(new_coords);
      if (Hex.equals(coord,target))
          break;
      
    //} while (all_coords_to_visit.length > 0) 
    } while (!all_coords_to_visit.isEmpty()) 

  };








  //Returns an array of coordinates of each cell that was visited 
  this.getRangeArray = function(min_cost, max_cost) {
    var coord_array = [];
    for (cell of this.visited.values()) {
      if (cell.path_cost >= min_cost && cell.path_cost <= max_cost) {
        coord_array.push(this.getCoord(cell)); 
      }
    }
    return coord_array;
  };
 
  //returns a map containing only the coordinates on the path
  //to the target
  this.targetPathfind = function(map, origin, target){
     
    //doesnt work
    let path_array = [];

    if (!this.hasCell(target)) 
      return false;
    
    //trace path back from target to origin
    let coord = target;
    while (this.currentCell(coord).previous_coord) {
      path_array.push(coord);
      coord = this.currentCell(coord).previous_coord;
    }

    path_array.push(coord);
    return path_array;
  };










  this.exploreArea = function(map, origin, max_cost) {
      
    this.initVisited(origin);
        
    //return a map of origin only, if movement is 0
    if (max_cost > 0) {
      if (Array.isArray(origin))
        for (position of origin)
          this.rangeFindBreadthFirst(map, origin, max_cost);
      else
        this.rangeFindBreadthFirst(map, origin, max_cost);
    }
  };

  this.exploreAreaTargetted = function(map, origin, target, max_cost) {
      
    this.initVisited(origin);
        
    //return a map of origin only, if movement is 0
    if (max_cost > 0) {
      if (Array.isArray(origin))
        for (position of origin)
          this.rangeFindPriority(map, origin, target, max_cost);
      else
        this.rangeFindPriority(map, origin, target, max_cost);
    }
  };






  //Return a function which can be used many times
  this.getCost = function(map, origin, target, max_cost) {
    if (max_cost === undefined) 
      max_cost = 10;
    this.exploreArea(map, origin, max_cost);
    return this.currentCell(target).path_cost;
  };

  //Return a function which can be reused to find the path
  this.getPath = function(map, origin, target, max_cost) {
    if (max_cost === undefined) 
      max_cost = 5;
    this.exploreAreaTargetted(map, origin, target, max_cost);
    return this.targetPathfind(map, origin, target);
  };

  //Returns a function which can be used many times to find range 
  this.getRange = function(map, origin, max_cost, min_cost) {
    this.exploreArea(map, origin, max_cost);
    return this.getRangeArray(min_cost, max_cost);
  };
}

