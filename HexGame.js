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

//-------------Game-specific elements------------
//Contains a world map, units, and resources
var world = new World(35);// <-- model
//Has functions for drawing hexes to the screen
var hex_renderer = new HexRenderer(renderer, world.getLayout() ); 

//Receives input for the game
var game_input = new GameInput(world, view);     //<--controller
//draws mouse interactions
var hud_renderer = new HUDRenderer(world, game_input, hex_renderer);
hud_renderer.clearButtons();



//setup temp world rendering-------------------------------------------------

function create_layer_renderer(canvas_name, layer_number ) {

  var temp_canvas = document.getElementById(canvas_name);
  temp_canvas.width = 1.7*2*35*35;
  temp_canvas.height = 1.7*2*35*35;

  var full_view = new View(canvas_name);
  full_view.setInput(-1.7*35*35, -1.7*35*35, 1.7*2*35*35, 1.7*2*35*35); //world coordinates
  full_view.setOutput(0, 0, temp_canvas.width, temp_canvas.height);  //canvas coordinates

  var layer_renderer = new Renderer(canvas_name, full_view);
  var layer_hex_renderer = new HexRenderer(layer_renderer, world.getLayout() );
  var world_renderer = new WorldRenderer(world, layer_hex_renderer, layer_number);    //<---view 

  return world_renderer; 
}

 var earth_canvas = document.getElementById('earth_canvas');
 var road_canvas = document.getElementById('road_canvas');
 var unit_canvas = document.getElementById('unit_canvas');
 var resource_canvas = document.getElementById('resource_canvas');
 var thing_canvas = document.getElementById('thing_canvas');

let     tile_renderer = create_layer_renderer('earth_canvas', 0);
let    river_renderer = create_layer_renderer('earth_canvas', 1);

/*
let     road_renderer = create_layer_renderer('road_canvas', 2);
let     unit_renderer = create_layer_renderer('unit_canvas', 3);
let resource_renderer = create_layer_renderer('resource_canvas', 4);*/

let     road_renderer = create_layer_renderer('thing_canvas', 2);
let     unit_renderer = create_layer_renderer('thing_canvas', 3);
let resource_renderer = create_layer_renderer('thing_canvas', 4);

//-------------------------------------------------



//world.clearClouds();
canv_input.windowResize();

tile_renderer.drawWorld();
river_renderer.drawWorld();
road_renderer.drawWorldByPortions();
unit_renderer.drawWorldByPortions();
resource_renderer.drawWorldByPortions();

var screen_context = canvas.getContext('2d');

////////////////////////// DRAWING TO THE CANVAS //////////////////


function step(timestamp) {
  drawScreen();
  window.requestAnimationFrame(step);
}
window.requestAnimationFrame(step);



function updateWorldRender() {

  tile_renderer.drawWorldByPortions();
river_renderer.drawWorldByPortions();
  road_renderer.drawWorldByPortions();
  unit_renderer.drawWorldByPortions();
  resource_renderer.drawWorldByPortions();


}

function drawScreen() {

  //clear the real canvas
  hex_renderer.clear();

  //copy the temporary canvas to the real canvas
  blit_layer(earth_canvas, screen_context);
  blit_layer(thing_canvas, screen_context);

  //draw the HUD on top
  hud_renderer.drawHUD();

}


  function blit_layer(canvas_layer, context) {
    let input_size = view.getInputRect().size;
    let output_size = view.getOutputRect().size;
    let center = view.getCenter();


    let x = canvas_layer.width/2  + center.x - view.screenToWorld1D(output_size.x/2);
    let y = canvas_layer.height/2 + center.y - view.screenToWorld1D(output_size.y/2);
    let w = input_size.x;
    let h = input_size.y;

    context.drawImage(canvas_layer, x, y, w, h, 0, 0, canvas.width, canvas.height );
  }




