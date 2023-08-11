/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE GAME //////////////////////////////



import CanvasDraw from './modules/u/CanvasDraw.js';
import CanvasInput from './modules/u/CanvasInput.js';
import Events from './modules/u/Events.js'
import Hex from './modules/u/Hex.js'
import Renderer from './modules/u/Renderer.js';
import View from './modules/u/View.js';



import GameInput from './modules/GameInput.js';
import HUDRenderer from './modules/HUDRenderer.js';
import World from './modules/World.js';
import Unit from './modules/Unit.js'




//---------------HTML5 Canvas elements-----------
//define the screen which can be drawn on
var earth_canvas = document.getElementById('earth_canvas');
var thing_canvas = document.getElementById('thing_canvas');

var canvas       = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//Interface for rendering on the Canvas
var canv_draw = new CanvasDraw(canvas);

//Interface for receiving input from the page
var canv_input = new CanvasInput('canvas');

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View('canvas');
//Has functions for drawing to the screen
var renderer = new Renderer('canvas', view);


//-------------Game-specific elements------------
//Contains a world map, units, and resources
let world_radius = 35;
var world = new World( world_radius );// <-- model

//Has functions for drawing hexes to the screen

//Receives input for the game
var game_input = new GameInput(world, view);     //<--controller

//draws mouse interactions
var hud_renderer = new HUDRenderer(world, game_input, renderer);




//INITIALIZE THE GAME MAP

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

let inverted_point = { x: -world.getPoint( start_hex.add(new Hex(2,0.5)) ).x, 
                       y: -world.getPoint( start_hex.add(new Hex(2,0.5)) ).y }
view.setCenter(inverted_point);

//clear some clouds
world.clearClouds(start_hex, 2);
//world.clearClouds();

//add starting area resources
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




////////////////////////// ANIMATION STEP//////////////////

let then = 0;
function step(timestamp) {

  let now = new Date().getTime();

  drawScreen();
  updateWorldRender();

  if (then)
    while (now-then < 30) {
      now = new Date().getTime();
    }


  then = now;
  window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);


















//---------------SETUP WORLD RENDERING IN LAYERS------------------------------------------
//these functions should go into the layer renderer

import LayerRenderer from './modules/LayerRenderer.js'

let     earth_layer = new LayerRenderer('earth_canvas', world);
let     thing_layer = new LayerRenderer('thing_canvas', world);


canv_input.windowResize();


//-----------------LAYER RENDERING FUNCTIONS--------------

//these functions should go into the layer renderer



Events.on('click', rebuildWorldRender);
function rebuildWorldRender() {

  earth_layer.clear()
  thing_layer.clear()

  updateWorldRender();
}

Events.on('canvas_resize', updateWorldRender);
function updateWorldRender() {

  earth_layer.drawEarth();
  thing_layer.drawThings();

}


function drawScreen() {

  //clear the real canvas

  //copy the temporary canvas to the real canvas
  renderer.blitCanvas(earth_canvas);
  renderer.blitCanvas(thing_canvas);

  //draw the HUD on top
  hud_renderer.drawHUD();

}













