/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE GAME //////////////////////////////

//---------------HTML5 Canvas elements-----------
//define the screen which can be drawn on
var canvas = document.getElementById('mycanvas');
//Interface for rendering on the Canvas
var canv_draw = new CanvasDraw(canvas);
//Interface for receiving input from the page
var canv_input = new CanvasInput(canvas);

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View();
//Has functions for drawing to the screen
var renderer = new Renderer(canv_draw, view);

//-------------Game-specific elements------------
//Contains a world map, units, and resources
var world = new World(35);// <-- model
//Has functions for drawing hexes to the screen
var hex_renderer = new HexRenderer(renderer, world.getLayout() );
var world_renderer = new WorldRenderer(world, hex_renderer);  	//<---view  
//Receives input for the game
var world_input = new WorldInput(world, view);     //<--controller
//draws mouse interactions
var hud_renderer = new HUDRenderer(world_input, hex_renderer);



canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////

var current_time = Date.now();

function drawScreen() {
  requestAnimationFrame(drawScreenTimed);
}

function drawScreenTimed() {

  world_renderer.clear();

  //draw the world and HUD
  world_renderer.drawWorld();  
  hud_renderer.drawHUD();
}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
