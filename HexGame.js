//-------1----------2---------3---------4---------5---------6---------7--------8

import CanvasDraw from './modules/u/CanvasDraw.js';
import CanvasInput from './modules/u/CanvasInput.js';
import Events from './modules/u/Events.js'
import Hex from './modules/u/Hex.js'
import Renderer from './modules/u/Renderer.js';
import View from './modules/u/View.js';


import GameRenderer from './modules/GameRenderer.js'
import GameInput from './modules/GameInput.js';
import World from './modules/World.js';
import Unit from './modules/Unit.js'


//---------------HTML5 Canvas elements-----------

var earth_canvas = document.getElementById('earth_canvas');
var thing_canvas = document.getElementById('thing_canvas');
var canvas       = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


//Starts listening for events from the canvas
var canv_input = new CanvasInput('canvas');


//-------------Game-specific elements------------
//Contains a world map, units, and resources

let world_radius = 35;
var world = new World( world_radius );// <-- model
//let system_radius = 35;
//var system = new World(system_radius, 'system');// <-- model
 

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View('canvas');
//view.setCenter(world.origin);


//Receives input for the game
//var space_game_input = new GameInput(system, view);     //<--controller
var game_input = new GameInput(world, view);     //<--controller

//Has functions for drawing to the screen
var renderer = new Renderer('canvas', view);
var game_renderer = new GameRenderer(world, game_input, renderer);
//THE GAME USED TO CREATE A WORLD AND HUD RENDERER FOR EACH
//LIKE THIS var space_renderer = new WorldRenderer(space, space_hex_renderer);    //<---view 
//LIKE THIS var space_hud_renderer = new HUDRenderer(space, space_game_input, real_space_hex_renderer);





//-----------Initialize the game map----------


//Put the first city in a random position on the "equator" ring
var start_hex = new Hex(0,0);
for (var hex of Hex.ring(new Hex(0,0), world_radius/2 )) 
  if (world.countLand(hex, 1,3) && world.onLand(hex) && !world.onRiver(hex)) 
    start_hex = hex;


let first_city =  new Unit('city');
world.units.set(start_hex, first_city);
first_city.pop = 20;


let start_point = world.getPoint( start_hex )
view.setCenter(start_point);

//clear some clouds
world.clearClouds(start_hex, 8);
world.destroyResource(start_hex);




//-----------Start animation loop----------


game_renderer.startDrawing();


/* This used to decide which HUD to render 
  //draw the HUD on top
  if (view.getZoom() <= 0.08)
    space_hud_renderer.drawHUD();
  else
    hud_renderer.drawHUD();
*/




