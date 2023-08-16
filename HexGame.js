//-------1----------2---------3---------4---------5---------6---------7--------8

import CanvasDraw from './modules/u/CanvasDraw.js';
import CanvasInput from './modules/u/CanvasInput.js';
import Events from './modules/u/Events.js'
import Hex from './modules/u/Hex.js'
import Renderer from './modules/u/Renderer.js';
import View from './modules/u/View.js';
import {Point} from './modules/u/Hex.js'


import GameRenderer from './modules/GameRenderer.js'
import WorldInput from './modules/WorldInput.js';
import World from './modules/World.js';
import Unit from './modules/Unit.js'
import ViewInput from './modules/ViewInput.js';


//---------------HTML5 Canvas elements-----------

var canvas       = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


//Starts listening for events from the canvas
var canv_input = new CanvasInput('canvas');


//-------------Game-specific elements------------
//Contains a world map, units, and resources

let earth_radius = 35;
let earth_location = new Point(3*35*10*80, 0);
var earth = new World( earth_radius, 'dust', earth_location, );

let mars_radius = 60;
let mars_location = new Point(35*8*72+127, 0);
var mars = new World( mars_radius,'earth', mars_location )

let system_radius = 35;
var system = new World(system_radius, 'system');
 

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View('canvas');


//Receives input for the game
//var space_game_input = new GameInput(system, view);
var earth_input = new WorldInput(earth, view);
//var mars_input = new WorldInput(mars, view);
var view_input = new ViewInput(view); 

//Has functions for drawing to the screen
//renders the worlds in the order they are listed
let worlds = [system, earth, mars];
var game_renderer = new GameRenderer(worlds, earth_input, view);



//-----------Initialize the game map----------


//Put the first city in a random position on the "equator" ring
var start_hex = new Hex(0,0);
for (var hex of Hex.ring(new Hex(0,0), earth_radius/2 )) 
  if (earth.onLand(hex) && !earth.onRiver(hex)) 
    if (earth.countLand(hex, 1,3))
      start_hex = hex;

let first_city =  new Unit('city');
earth.units.set(start_hex, first_city);
earth.destroyResource(start_hex);
first_city.pop = 5;

//for some reason I need to invert the starting hex 
let start_point = earth.getPoint( start_hex.multiply(-1) );
view.setCenter( start_point );

//clear some clouds
earth.clearClouds(start_hex, 3);
mars.clearClouds(new Hex(0,0), 100)





//-----------Start animation loop----------


game_renderer.startDrawing();







