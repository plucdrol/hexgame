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
var layer = layer_manager.createWorldLayer(30, new Hex(0,0)); 

//create units in the world
//layer.world.units.set(new Hex(-1,-1), new Unit('water-player', layer.world));
layer.world.units.set(new Hex(0,0), new Unit('land-player', layer.world));

let land_tile = new Unit('terrain');
land_tile.elevation = 2;
layer.world.setHex(new Hex(0,0), land_tile);

canv_input.windowResize();

////////////////////////// DRAWING TO THE CANVAS //////////////////

var current_time = Date.now();

function drawScreen() {
  requestAnimationFrame(drawScreenTimed);
}

function drawScreenTimed() {

  layer.world_renderer.clear();

  //draw the world
  if (layer_manager.view.getZoom() > 0.06) {
    layer.world_renderer.drawWorld();  
  }

  //draw mouse interactions
  var hud_renderer = new HUDRenderer();
  hud_renderer.renderHUD(layer);
}

////////////////////////////////////////////////////// EVENT LISTENERS ////////////////////////////////////////
canv_input.registerEvents();
