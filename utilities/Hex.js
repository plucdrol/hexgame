
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						HEX AND FUNCTIONS

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

//This library defines the Hex grid and a map for containing multiple hexes
//it also defines multiple functions for dealing with Hexes, structuring them, and relating them to a cartesian grid

// HEX OBJECT

function Hex(q,r) { //stores a hex unit
	this.q = q;
	this.r = r;
}

Hex.prototype = {
	constructor: Hex,
};

Hex.prototype.getQ = function() {
	return this.q;
}

Hex.prototype.getR = function() {
	return this.r;
}

Hex.prototype.getS = function() {
	return -(this.q)-(this.r);
}


// BASIC HEX FUNCTIONS

function hex_equals(hex_a,hex_b) {
	return hex_a.getQ()==hex_b.getQ() && hex_a.getR()==hex_b.getR();
}
function hex_add(hex_a, hex_b)  {
	return new Hex( hex_a.getQ()+hex_b.getQ(), hex_a.getR()+hex_b.getR() );
}
function hex_substract(hex_a, hex_b)  {
	return new Hex( hex_a.getQ()-hex_b.getQ(), hex_a.getR()-hex_b.getR() );
}
function hex_multiply(hex, k)  {
	return new Hex( hex.getQ()*k, hex.getR()*k );
}
function hex_length(hex) { //returns distance from origin
	return (Math.abs(hex.getQ()) + Math.abs(hex.getR()) + Math.abs(hex.getS())) / 2;
}
function hex_distance(hex_a,hex_b) {
	return hex_length(hex_substract(hex_a,hex_b));
}

//gives the 6 hex neighbor direction in layout-independent hex coordinates
var hex_direction = [new Hex(1,0),new Hex(1,-1),new Hex(0,-1),
      new Hex(-1,0),new Hex(-1,1),new Hex(0,1)] ;

//gives the 6 corner directions in layout-independent hex coordinates
var hex_corner = [new Hex(1.0/3.0, 1.0/3.0),new Hex(2.0/3.0, -1.0/3.0),new Hex(1.0/3.0, -2.0/3.0),
    new Hex(-1.0/3.0,-1.0/3.0),new Hex(-2.0/3.0,1.0/3.0),new Hex(-1.0/3.0,2.0/3.0)] ;


function hex_corners(hex) {
	var corners = [];
	//individually add each corner to the hex position
	for (var i=0;i<6;i++) {
		corners[i] = hex_add(hex,hex_corner[i]);
	}
	return corners;
}				      

function hex_neighbor(hex,direction_number) {
	//takes a hex and a direction (from 0 to 6), and returns a neighboring hex
	return hex_add(hex, hex_direction[direction_number%6] );
}

//takes a hex and returns all 6 neighbors
function hex_neighbors(hex) {
	var neighbors = [];


	//continue
}

// FRACTIONAL FUNCTIONS

function hex_round(fractional_hex) {
	q = Math.round(fractional_hex.getQ());
	r = Math.round(fractional_hex.getR());
	s = Math.round(fractional_hex.getS());

	qdiff = Math.abs(q-fractional_hex.getQ());
	rdiff = Math.abs(r-fractional_hex.getR());
	sdiff = Math.abs(s-fractional_hex.getS());

    if (qdiff > rdiff && qdiff > sdiff) {
        q = -r - s;
    } else if (rdiff > sdiff) {
        r = -q - s;
    }/* else {
        s = -q - r;
    }*/

    return new Hex(q,r);

}

function hex_linear_interpolate(hex_a,hex_b,t) {
	return new Hex( hex_a.getQ() + (hex_b.getQ() - hex_a.getQ()) * t,
					hex_a.getR() + (hex_b.getR() - hex_a.getR()) * t,
					hex_a.getS() + (hex_b.getS() - hex_a.getS()) * t);

}

// HEX SELECT FUNCTIONS

function hex_line(hex_a,hex_b) {
	var distance = hex_distance(hex_a,hex_b);
	var results = [];
	var step = 1.0 / Math.max(distance,1);
	for (var i=0;i<=distance;i++) {
		results.push(hex_round(hex_linear_interpolate(hex_a,hex_b,step*i)));

	}
	return results;
}












/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//					 VERTEX

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function Vertex(hex,direction_number) {
	this.hex = hex;
	this.direction_number = direction_number;
}
	Vertex.prototype.equals = function(other_vertex) {
		if (listContainsHex(this.getInnerHex(),other_vertex.getHexes()) &&
			listContainsHex(this.getOuterHex(),other_vertex.getHexes()) &&
			listContainsHex(this.getClockwiseHex(),other_vertex.getHexes()) ) {
			return true;
		}
	}


	//getHexes returns the 3 hexes that neighbor a Vertex
	Vertex.prototype.getHexes = function() {
		return [this.getInnerHex(), this.getOuterHex(), this.getClockwiseHex()];
	}
	//getInnerHex
	Vertex.prototype.getInnerHex = function() {
		return this.hex;
	}
	Vertex.prototype.getOuterHex = function() {
		return hex_neighbor(this.hex, this.direction_number);
	};
	Vertex.prototype.getClockwiseHex = function() {
		//returns the hex which is clockwise from the outer hex
		return hex_neighbor(this.hex, (this.direction_number+5)%6 );
	};

	//returns the vertex coordinate in fractional hexes 
	Vertex.prototype.getPoint = function() {

		//from the hex's center, move in fractional hex to the corner given by direction_number
		return hex_add(this.hex, hex_corner[this.direction_number] );
	};

















/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						EDGES

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function Edge(hex,direction_number) {
	this.hex = hex;
	this.direction_number = direction_number;
}
	Edge.prototype.equals = function(other_edge) {
		//same hex, same direction
		if (hex_equals(this.getInnerHex(),other_edge.getInnerHex()) && this.direction_number == other_edge.direction_number) {
			return true;
		}
		//opposite hex, opposite direction
		if (hex_equals(this.getInnerHex(),other_edge.getOuterHex()) && this.direction_number == (other_edge.direction_number+3)%6) {
			return true;
		}

		return false;
	}

	//Returns the Hex on one side of the edge
	Edge.prototype.getInnerHex = function() {
		return this.hex;
	};

	//Returns the Hex on the other side of the edge
	Edge.prototype.getOuterHex = function() {
		return hex_neighbor(this.hex, this.direction_number);
	};

	//As seen from the InnerHex's perspective, Point2 is counterclockwise from Point1
	Edge.prototype.getPoint1 = function() {
		return this.getVertex1().getPoint();
	};
	Edge.prototype.getVertex1 = function() {
		return new Vertex(this.hex, this.direction_number);
	};
	Edge.prototype.getPoint2 = function() {
		//return the coordinates of the second one
		return this.getVertex2().getPoint();
	};
	Edge.prototype.getVertex2 = function() {
		return new Vertex(this.hex, (this.direction_number+1)%6)
	}


/////////////////////////////////////////////////////////////////////







/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						OUTLINE OF HEXES

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////






//returns the outside edges only of a group of hexes 
function hex_outline(hexes) {

	//HEXES: array of hexes
	//var UNSORTED_EDGES: array of edges (order the coordinates counter-clockwise so it is possible to follow them around the shape)
	var unsorted_edges = []; //array of edges for all hexes

	//for each hex in HEXES
	for (var i = 0; i<hexes.length; i++) {


		var edges = []; //array of edges for 1 hex
		
		//for each edge of that hex
		for (var d = 0; d < 6; d++) {
			//get the edge
			var edge = new Edge( hexes[i], d);

			//get the neighbor across that edge
			var neighbor = hex_neighbor( hexes[i], d );

			if ( !( hex_equals(edge.getOuterHex(), neighbor) )) {
				console.log ('hex_equal doesnt work');
			}

			//if the hex across it is part of HEXES
			if (listContainsHex(neighbor, hexes)) {
				//dot not add this hex to the edges
				continue;

			} else {
				//add that edge to the HEXEDGES array
				edges.push(edge);
			}
		}

		//for each accepted edge in this hex
		for (var e = 0; e<edges.length; e++) {
			//add the edges into the UNSORTED_EDGES array
			unsorted_edges.push( edges[e] );
		}
	}
	//sort the edges

	var sorted_edges = sort_edges(unsorted_edges);
	
	return sorted_edges;
}

//sorts an array of edges into many arrays of connected edges
function sort_edges(unsorted_edges) {
	
	//create a new ARRAY OF EDGE ARRAYS
	var edge_arrays = [];

	//while UNSORTED_EDGES is not empty
	while (unsorted_edges.length > 0) {
		
		//create a new SORTED EDGES array
		var sorted_edges = [];
		
		//pop and push the first UNSSORTE_edge to this SORTED_EDGES array
		//var CURRENT EDGE = that edge
		var current_edge = unsorted_edges.pop();
		sorted_edges.push( current_edge );
		
		//while the edges in sorted_edges do not make a loop
		var attempts = 30;
		while ( !(current_edge.getVertex2().equals(sorted_edges[0].getVertex1() ))) {


			attempts -= 1;
			//for each edge in UNSORTED_EDGES as MAYBE_EDGE
			for (var i=0; i<unsorted_edges.length; i++) {
				var maybe_edge = unsorted_edges[i];
				//if the 1st point of MAYBE_EDGE is equal to the CURRENT_EDGE's 2nd point

				if ( maybe_edge.getVertex1().equals( current_edge.getVertex2() ) ) {

					//push MAYBE_EDGE to the SORTED EDGES array
					sorted_edges.push ( maybe_edge );
					attempts = 30;

					//make CURRENT_EDGE now be MAYBE_EDGE
					current_edge = maybe_edge;
					//remove MAYBE_EDGE from th UNSORTED_EDGES array
					unsorted_edges.splice(i,1);
					//start over at the top of the unsorted list
					break;
				} else {
					//continue down the list
					continue;
				}
			}

			if (attempts <= 0) {
				console.log('too many attempts in sorted_edge function');
				break;
			}
		}
		//if you are here, it means the loop found a circle of connecting edges
		//verify that the last edge in SORTED_EDGES matche the first edge in SORTED EDGES
		if (!(sorted_edges[0].getVertex1().equals( sorted_edges[sorted_edges.length-1].getVertex2() ) ) ) {
			console.log('hex boundaries do not match');

		}
		
		//popp that SORTED_EDGES array in ARRAY OF EDGE ARRAYS
		edge_arrays.push(sorted_edges);
		
		
	}
	
	//return the ARRAY OF EDGE ARRAYS
	return edge_arrays;


}











/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						HEXMAP DATA STRUCTURE

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

/*
	a HexMap is an array of hex positions (keys), with content defined for each position (value)
	if no value is defined, the hex is not part of the map
	the areas of a HexMap are not necessarily contiguous
*/

//value can be anything, even an array. use as needed
function HexMap() {

	this.values = [];
}

	HexMap.prototype.set = function(hex,value) {
			this.values[this.hexHash(hex)] = value;
	}
	HexMap.prototype.remove = function(hex) {
		if (this.containsHex(hex)) {
			this.set(hex,undefined);
		}
	}
	HexMap.prototype.getValue = function(hex) {
		var key = this.hexHash(hex);
		return this.values[key];
	}
	HexMap.prototype.getHex = function(key) {

		if (key === 0) {
			return new Hex(0,0);
		}
		//else, reverse Szudzik's function
		var z = key;
		var f = Math.floor(Math.sqrt(key));
		var f2 = Math.pow(f,2);
		var Q = ((z-f2)<f)?(z-f2):(f);
		var R = ((z-f2)<f)?(f):(z-f2-f);

		var q = is_even(Q)?(Q/2):((Q+1)/-2);
		var r = is_even(R)?(R/2):((R+1)/-2);

		return new Hex(q,r);
	};
	HexMap.prototype.size = function() {
		return this.values.length;
	}

	//HexMap getArray returns a simple array of each hex(q,r) contained in this map
	HexMap.prototype.getArray = function() {
		var hexarray = [];
		//look at each item in this map
		for (var i=0;i<this.values.length; i++) {
			var thehex = this.getHex(i);
			//add the hex to the result if it is defined
			if (this.getValue(thehex) !== undefined ) {
				hexarray.push(thehex);
			}
		}
		return hexarray;
	}
	//HexMap getValues returns a simple array of each defined value
	HexMap.prototype.getValues = function() {
		var value_array = [];
		//look at each item in this map
		for (var i=0;i<this.values.length; i++) {
			var thehex = this.getHex(i);
			//add the hex to the result if it is defined
			if (this.getValue(thehex) !== undefined ) {
				value_array.push(this.getValue(thehex));
			}
		}
		return value_array;
	}

	//HexMap contains: finds if the hex is part of the map by checking if its value is defined
	HexMap.prototype.containsHex = function(hex) {
		if (this.getValue(hex) !== undefined) {
			return true;
		} else {
			return false;
		}
	}

	//HexMap containsKey: finds if the key is defined by checking for the key directly 
	HexMap.prototype.containsKey = function(key) {
		//if (this.getValueByKey(key) !== undefined) {
		if (key in this.values) {
			return true;
		} else {
			return false;
		}
	}

	//HexMap flip: if the value of hex is in the 'values' array, changes it to the next value in the array
	HexMap.prototype.flip = function(hex,values) {
		if (this.containsHex(hex)) {
			for (var i=0; i < values.length; i++) {
				if (this.getValue(hex) == values[i]) {
					this.set(hex,values[(i+1)%values.length]);
					return true;
				}
			}
		}
		return false;
	}

	//Hexmap hexHash: turns the coordinates of a hex into a unique number, starting from (0,0) => 0
	//uses Szudzik's function turns 2 numbers into a unique number, increasing away from the origin
	HexMap.prototype.hexHash = function(hex) {
		var q = hex.getQ();
		var r = hex.getR();

		var A = (q >= 0 ? 2 * q : -2 * q - 1);
	    var B = (r >= 0 ? 2 * r : -2 * r - 1);
	    var C = ((A >= B ? A * A + A + B : A + B * B) / 2);
	    return Math.floor(2*C);
	    return Math.floor(q < 0 && r < 0 || q >= 0 && r >= 0 ? C : -C - 1);
	}
	















/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
								
			//						HEX LAYOUT

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

// POINT
// The Point class is a simple cartesian coordinate with some helper functions

function Point (x,y) {
	this.x = x;
	this.y = y;

	this.offset = function(xi,yi) {
		return new Point(this.x+xi,this.y+yi);
	}
	this.invert = function() {
		return new Point(-this.x,-this.y);
	}
	this.scale = function(k) {
		return new Point(this.x*k,this.y*k);
	}

}


//  ORIENTATION
//the F numbers are the forward matrix xy = f*qr
//the b numbers are the backwards matrix qr = b*xy
//the start_angle defines where the first corner of the hexagon is

function Orientation(_f0,_f1,_f2,_f3,_b0,_b1,_b2,_b3,_start_angle) {
	this.f0=_f0; 
	this.f1=_f1;
	this.f2=_f2;
	this.f3=_f3;
	this.b0=_b0;
	this.b1=_b1;
	this.b2=_b2;
	this.b3=_b3;
	this.start_angle=_start_angle;
}

//Pointy orientation has hexes with neighbors directly to the left and right
const orientation_pointy = new Orientation(Math.sqrt(3.0),Math.sqrt(3.0)/2.0, 0.0, 3.0/2.0, 
					Math.sqrt(3.0)/3.0, -1.0/3.0, 0.0, 2.0/3.0,
					0.5 );

//Flat orientation has hexes with neighbors directly above and below
const orientation_flat = new Orientation(  3.0/2.0, 0.0, Math.sqrt(3.0)/2.0, Math.sqrt(3.0),
					2.0/3.0, 0.0, -1.0/3.0, Math.sqrt(3.0)/3.0,
					0.0 );



//The HexLayout class relates hex coordinates to world coordinates
//It positions the virtual grid points in space


function HexLayout (orientation, size, origin) {
	this.orientation = orientation; //orientation object, defined below
	this.size = size;     //point object
	this.origin = origin; //point object
}


	//   HEX AND PIXEL RELATIONS
	HexLayout.prototype.hex_to_point = function(hex) {
		var ori = this.orientation;
		var x = (ori.f0 * hex.getQ() + ori.f1 * hex.getR()) * this.size.x;
		var y = (ori.f2 * hex.getQ() + ori.f3 * hex.getR()) * this.size.y;
		return new Point(x + this.origin.x, y + this.origin.y );
	}

	HexLayout.prototype.hexes_to_points = function(hexes) {
		var points = [];
		var i=0;
		for (let hex of hexes) {							
			points[i] = this.hex_to_point(hex);
			i++;
		}
		return points;
	}

	HexLayout.prototype.point_to_hex = function(point) {
		var ori = this.orientation;
		var pt = new Point((point.x - this.origin.x)/this.size.x,
						(point.y - this.origin.y)/this.size.y);
		var q = ori.b0 * pt.x + ori.b1 * pt.y;
		var r = ori.b2 * pt.x + ori.b3 * pt.y;
		return new Hex(q,r);
	}

	HexLayout.prototype.points_to_hexes = function(points) {
		var hexes = [];
		var i=0;
		for ( let point of points) {
			hexes[i] = this.point_to_hex(point);
			i++;
		}
		return hexes;
	}



