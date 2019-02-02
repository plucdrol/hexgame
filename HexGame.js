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


var layer_manager = new LayerManager();
var world_layer = layer_manager.createWorldLayer(30, new Hex(0,0), 'earth'); 
var space_layer = layer_manager.createWorldLayer(20, new Hex(-3,-3), 'space', world_layer);
var galaxy_layer = layer_manager.createWorldLayer(20, new Hex(5,5), 'galaxy', space_layer);
var hyperspace_layer = layer_manager.createWorldLayer(20, new Hex(0,0), 'earth', galaxy_layer);





//create units in the world
world_layer.world.units.create(new Hex(0,0),'water-player');

//level below is always at 0,0 even if the map is shifted to the side
space_layer.world.units.create(new Hex(0,0),'planet');
space_layer.world.units.create(new Hex(3,3),'sun');

//Level below is always at 0,0  even if the map is shifted to the side
galaxy_layer.world.units.create(new Hex(0,0),'sun');
galaxy_layer.world.units.create(new Hex(-5,-5),'galactic-center');



canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////

var current_time = Date.now();

function drawScreen() {
  requestAnimationFrame(drawScreenTimed);
}

function drawScreenTimed() {

  world_layer.world_renderer.clear();
  var layer_to_control = hyperspace_layer;

  //draw the universe
  //hyperspace_layer.world_renderer.drawWorld();

  //draw the galaxy
  if (layer_manager.view.getZoom() > 0.06/64/64) {
    galaxy_layer.world_renderer.drawWorld();
    layer_to_control = galaxy_layer;
  }
  //draw the space
  if (layer_manager.view.getZoom() > 0.06/64) {
    space_layer.world_renderer.drawWorld(); 
    layer_to_control = space_layer;
  }
  //draw the world
  if (layer_manager.view.getZoom() > 0.06) {
    world_layer.world_renderer.drawWorld();    
    layer_to_control = world_layer;
    
  }

  //draw mouse interactions
  var hud_renderer = new HUDRenderer();
  hud_renderer.renderHUD(layer_to_control);
}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
