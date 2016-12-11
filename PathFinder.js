
// RANGE FINDING

//pathfinding values:
	//map of (hex,movement_cost) pairs

//pathfinding algorithms:
	//find_range(hex_origin,range) returns an array of hexes reachable from hex_origin in n steps
	//find_path(hex_origin,hex_destination) returns shortest path
	//path_distance(hex_origin,hex_destination) returns distance between two hexes




function PathFinder(map) {
	this.map = map;

	this.updateMap = function(map) {
		this.map = map;
	}

	this.sight = function(origin,range,starting_height) {
		var frontier = new Queue();
		frontier.put(origin);
		var visited = new HexMap();
		var distance = 0;
		var direction_from;
		visited.set(origin,distance);

		//while the frontier still has nodes to explore
		while ( !frontier.isEmpty() ) {
			
			//get a hex on the frontier
			var current = frontier.get();
			distance = visited.getValue(current)+1;
			//stop looking once distance goes over the desired range
			if (distance > range) {
				continue;
			}
			//look at all its neighbors
			for (var i=0;i<6;i++) {
				var neighbor = hex_neighbor(current,i);
				if (!visited.containsHex(neighbor)) {
					frontier.put(neighbor);
					visited.set(neighbor,distance);
				}

			}
		}

		return visited;
	}

	this.path_with_terrain = function(origin,range) {
		console.log('in paht terrain function');
		
		var frontier = new Queue();
		frontier.put(origin);
		var visited = new HexMap(); //this one takes two things as values: a momvement_cost and the cell it came from
		var cost_so_far = 0;
		var came_from = undefined;
		visited.set(origin,[cost_so_far,came_from,this.map.getValue(origin)]);

		//while the frontier still has nodes to explore
		while ( !frontier.isEmpty() ) {
			
			//get a hex on the frontier
			var current = frontier.pop();
			cost_so_far = visited.getValue(current)[0];
			
			//stop looking once distance goes over the desired range
			if (cost_so_far >= range) {
				continue;
			}
			//look at all its neighbors
			for (var i=0;i<6;i++) {

				//get the neighboring cell
				var neighbor = hex_neighbor(current,i);

				//make sure it exists
				if (!this.map.containsHex(neighbor)) {
					continue;
				}
				
				//calculate the distance from origin to this neighbor
				//var cost_to_neighbor = this.move_cost_absolute( neighbor );
				var cost_to_neighbor = this.move_cost_relative( current, neighbor );
				var path_cost = cost_so_far + cost_to_neighbor;

				//add the cell if it hasnt been visited
				if ( !visited.containsHex(neighbor) ) {

					if (this.move_cost_absolute(neighbor) > 1 && this.move_cost_absolute(neighbor) < 14) { //not mountain
						frontier.put(neighbor);
						visited.set(neighbor,[path_cost,current,this.map.getValue(neighbor)]);
					} 

				} else {
					//add the cell if it HAS been visited, but a shorter path is found
					var previous_best_cost = visited.getValue(neighbor)[0];
					if (path_cost < previous_best_cost) {

						if (this.move_cost_absolute(neighbor) > 1 && this.move_cost_absolute(neighbor) < 14) { //not mountain
							frontier.put(neighbor);
							visited.set(neighbor,[path_cost,current,this.map.getValue(neighbor)]);
						} 

					}
				}
			}
		}

		//console.log(visited);
		return visited;
	}

	this.path = function(range,destination) {
		var hexes = [];
		hexes.push(destination);
		var next = range.getValue(destination)[1]; //take the came from
		while (next !== undefined) {
			hexes.push(next);
			next = range.getValue(next)[1];
		}
		return hexes;
	}

	this.move_cost_absolute = function(other_tile) {
		return this.map.getValue(other_tile);
	}

	this.move_cost_relative = function(this_tile, other_tile) {
		
		//returns a positive number for uphill movement, negative number for downhill movement
		var difference = this.map.getValue(other_tile) - this.map.getValue(this_tile);

		if (difference >= 4) {
			return 100;
		}
		if (difference > 0)  {
			return 6;
		}
		if (difference == 0) {
			return 4;
		}
		if (difference < 0) {
			return 3;
		}
		if (difference < -4) {
			return 100;
		}
	}
}