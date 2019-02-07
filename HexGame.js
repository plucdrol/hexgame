/* MAIN GAME FILE */
//-------1----------2---------3---------4---------5---------6---------7--------8

// Here is where all the javascript modules should be combined
// Avoid all cross-dependencies!
// Allow modules to be interconnected at this level
//////////////////////////// CREATING THE WORLD //////////////////////////////
//define the screen which can be drawn on
var canvas = document.getElementById('mycanvas');

//Interface for rendering on the Canvas
var canv_draw = new CanvasDraw(canvas);
//Interface for receiving input from the page
var canv_input = new CanvasInput(canvas);




var view = create_view();
var renderer = new Renderer(canv_draw, view);

//The Game object holds together the Model, View and Controller
function Game(radius) {
  this.world = new World(radius);// <-- model
  this.world_renderer = new WorldRenderer(this.world, renderer);  	//<---view  
}
var game = new Game(30); 
var game_input = new GameInput(game.world, view);

//create units in the world
game.world.units.set(new Hex(0,0), new Unit('land-player', game.world));

let land_tile = new Unit('terrain');
land_tile.elevation = 2;
game.world.setHex(new Hex(0,0), land_tile);

canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////

var current_time = Date.now();

function drawScreen() {
  requestAnimationFrame(drawScreenTimed);
}

function drawScreenTimed() {

  game.world_renderer.clear();

  //draw the world
  game.world_renderer.drawWorld();  

  //draw mouse interactions
  var hud_renderer = new HUDRenderer();
  hud_renderer.renderHUD(game, game_input);
}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
