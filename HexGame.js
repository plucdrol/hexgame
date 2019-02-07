/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE GAME //////////////////////////////

//-----------Game engine elements----------
//define the screen which can be drawn on
var canvas = document.getElementById('mycanvas');
//Interface for rendering on the Canvas
var canv_draw = new CanvasDraw(canvas);
//Interface for receiving input from the page
var canv_input = new CanvasInput(canvas);
//A moveable point of view into the game world
var view = new View();
//Has functions for drawing to the screen
var renderer = new Renderer(canv_draw, view);


//-----------------Game elements------------
//Contains a world map, units, and resources
var world = new World(60);// <-- model
//Can render the world elements
var world_renderer = new WorldRenderer(world, renderer);  	//<---view  
//Receives input for the game
var world_input = new WorldInput(world, view);     //<--controller





canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////

var current_time = Date.now();

function drawScreen() {
  requestAnimationFrame(drawScreenTimed);
}

function drawScreenTimed() {

  world_renderer.clear();

  //draw the world
  world_renderer.drawWorld();  

  //draw mouse interactions
  var hud_renderer = new HUDRenderer();
  hud_renderer.renderHUD(world_input);
}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
