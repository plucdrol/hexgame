/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE GAME //////////////////////////////

//---------------HTML5 Canvas elements-----------
//define the screen which can be drawn on
var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;




//Interface for receiving input from the page
var canv_input = new CanvasInput('canvas');

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View('canvas');

//Has functions for drawing to the screen
var renderer = new Renderer('canvas', view);

//This will be used to render a full-size world on a large, hidden canvas
var full_renderer = new Renderer('canvas', view);

//-------------Game-specific elements------------
//Contains a world map, units, and resources
var world = new World(35);// <-- model
//Has functions for drawing hexes to the screen
var hex_renderer = new HexRenderer(renderer, world.getLayout() );

var world_renderer = new WorldRenderer(world, hex_renderer);  	//<---view  
//Receives input for the game
var game_input = new GameInput(world, view);     //<--controller
//draws mouse interactions
var hud_renderer = new HUDRenderer(world, game_input, hex_renderer);
hud_renderer.clearButtons();


canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////


function step(timestamp) {
  drawScreen();
  window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);

var render_x = 0;
var render_y = 0;

function updateWorldRender() {

  //canv_draw.clear();
  world_renderer.drawWorld(); 
  render_x = 0;
  render_y = 0;
}

function drawScreen() {

  //clear the real canvas
  hex_renderer.clear();

  world_renderer.drawWorld();

  //copy the temporary canvas to the real canvas
  //var screen_context = canvas.getContext('2d');
  //screen_context.drawImage(temp_canvas, 0, 0);

  //draw the HUD on top
  hud_renderer.drawHUD();

}


