/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE GAME //////////////////////////////

//---------------HTML5 Canvas elements-----------
//define the screen which can be drawn on
var real_canvas = document.getElementById('mycanvas');

var canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


//Interface for rendering on the Canvas
import CanvasDraw from './utilities/CanvasDraw.js';
var canv_draw = new CanvasDraw(canvas);
var real_canv_draw = new CanvasDraw(real_canvas);

//Interface for receiving input from the page
import CanvasInput from './utilities/CanvasInput.js';
var canv_input = new CanvasInput(real_canvas);

//-----------Game Engine elements-------------
//A moveable point of view into the game world
import View from './utilities/View.js';
var view = new View(canvas, 0.3);
//Has functions for drawing to the screen
import Renderer from './utilities/Renderer.js';
var renderer = new Renderer(canv_draw, view);
var real_renderer = new Renderer(real_canv_draw, view);

//-------------Game-specific elements------------
//Contains a world map, units, and resources

let world_radius = 35;
import World from './World.js';
var world = new World( world_radius );// <-- model

//Has functions for drawing hexes to the screen
import HexRenderer from './HexRenderer.js';
var hex_renderer = new HexRenderer(renderer, world.getLayout() );
var real_hex_renderer = new HexRenderer(real_renderer, world.getLayout() );

import WorldRenderer from './WorldRenderer.js';
var world_renderer = new WorldRenderer(world, hex_renderer);  	//<---view  

//Receives input for the game
import GameInput from './GameInput.js';
var game_input = new GameInput(world, view);     //<--controller

//draws mouse interactions
import HUDRenderer from './HUDRenderer.js';
var hud_renderer = new HUDRenderer(world, game_input, real_hex_renderer);
//hud_renderer.clearButtons();
//hud_renderer.update_function();

//world.clearClouds();














import Unit from './Unit.js'
import {Point} from './utilities/Hex.js'
import Hex from './utilities/Hex.js'

//Put the first city in a random position on the "equator"
var start_hex;
for (var hex of Hex.ring(new Hex(0,0), world_radius/2 )) {
  if (world.countLand(hex, 1,3) && world.onLand(hex) && !world.onRiver(hex) && !(world.getTile(hex).elevation==2)) {
    start_hex = hex;
  }
}
if (!start_hex)
  start_hex = new Hex(0,0);

let first_city =  new Unit('city');
world.units.set(start_hex, first_city);

first_city.pop = 20;

let inverted_point = new Point( -world.getPoint( start_hex.add(new Hex(2,0.5)) ).x, 
                                -world.getPoint( start_hex.add(new Hex(2,0.5)) ).y   );
view.setCenter(inverted_point);




//clear some clouds
world.clearClouds(start_hex, 2);
//world.clearClouds();

//add resources
let count = 5;
while (count > 0) {
  let circle = Hex.ring(start_hex, 3);
  world.addLocalResource(circle[Math.floor(Math.random()*circle.length)]);
  count--;
}

count = 3;
while (count > 0) {
  let circle = Hex.ring(start_hex, 2);
  world.addLocalResource(circle[Math.floor(Math.random()*circle.length)]);
  count--;
}

count = 3;
while (count > 0) {
  let circle = Hex.ring(start_hex, 1);
  world.addLocalResource(circle[Math.floor(Math.random()*circle.length)]);
  count--;
}

world.destroyResource(start_hex);



////////////////////////// DRAWING TO THE CANVAS //////////////////
canv_input.windowResize();

let then = 0;
function step(timestamp) {

  let now = new Date().getTime();

  drawScreen();

  if (then)
    while (now-then < 30) {
      world_renderer.drawWorld();
      now = new Date().getTime();
    }


  then = now;
  window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);



function updateWorldRender() {

  //canv_draw.clear();
  world_renderer.drawWorld(); 

}

function drawScreen() {

  //clear the real canvas
  real_canv_draw.clear();

  //copy the temporary canvas to the real canvas
  var screen_context = real_canvas.getContext('2d');
  screen_context.drawImage(canvas, 0, 0);

  //draw the HUD on top
  hud_renderer.drawHUD();

}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
