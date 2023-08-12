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
var canv_draw = new CanvasDraw(canvas);
var real_canv_draw = new CanvasDraw(real_canvas);
//Interface for receiving input from the page
var canv_input = new CanvasInput(real_canvas);

//-----------Game Engine elements-------------
//A moveable point of view into the game world
var view = new View(canvas);
//Has functions for drawing to the screen
var renderer = new Renderer(canv_draw, view);
var real_renderer = new Renderer(real_canv_draw, view);

//-------------Game-specific elements------------
//Contains a world map, units, and resources

var world = new World(35, 'earth');// <-- model
//Has functions for drawing hexes to the screen
var hex_renderer = new HexRenderer(renderer, world.getLayout() );
var real_hex_renderer = new HexRenderer(real_renderer, world.getLayout() );
var world_renderer = new WorldRenderer(world, hex_renderer);    //<---view  
view.setCenter(world.origin);

var space = new World(35, 'system');// <-- model
var space_hex_renderer = new HexRenderer(renderer, space.getLayout() );
var real_space_hex_renderer = new HexRenderer(real_renderer, space.getLayout() );
var space_renderer = new WorldRenderer(space, space_hex_renderer);    //<---view  

//Receives input for the game
var space_game_input = new GameInput(space, view);     //<--controller
var game_input = new GameInput(world, view);     //<--controller


//draws mouse interactions
var hud_renderer = new HUDRenderer(world, game_input, real_hex_renderer);
var space_hud_renderer = new HUDRenderer(space, space_game_input, real_space_hex_renderer);

world.clearClouds(new Hex(0,0), 19);

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

  canv_draw.clear();
  space_renderer.drawWorld(); 
  world_renderer.drawWorld(); 
  
  render_x = 0;
  render_y = 0;
}

function drawScreen() {

  //clear the real canvas
  real_canv_draw.clear();

  //copy the temporary canvas to the real canvas
  var screen_context = real_canvas.getContext('2d');
  screen_context.drawImage(canvas, 0, 0);

  //draw the HUD on top
  if (view.getZoom() <= 0.08)
    space_hud_renderer.drawHUD();
  else
    hud_renderer.drawHUD();


}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
