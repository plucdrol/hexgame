
import View from './u/View.js'
import Renderer from './u/Renderer.js';
import WorldRenderer from './WorldRenderer.js';
import HUDRenderer from './HUDRenderer.js';
import Events from './u/Events.js';



export default function GameRenderer(world, system, game_input, view) {

  let renderer = new Renderer('canvas', view);

  let space_layer = new LayerRenderer('space_canvas', system);
  let earth_layer = new LayerRenderer('earth_canvas', world);
  let thing_layer = new LayerRenderer('thing_canvas', world);
  let hud_renderer = new HUDRenderer(world, game_input, renderer);

  function clear() {
    space_layer.clear();
    earth_layer.clear();
    thing_layer.clear();
  }

  function updateLayers() {

    space_layer.drawThings();
    earth_layer.drawEarth();
    thing_layer.drawThings();
  }

  function draw() {

    //clear the real canvas
    renderer.clear();

    //copy the temporary canvas to the real canvas

    //replace this with 
    renderer.blitCanvas(space_canvas);
    renderer.blitCanvas(earth_canvas);
    renderer.blitCanvas(thing_canvas);

    //draw the HUD on top
    hud_renderer.drawHUD();
    /* This used to decide which HUD to render 
    //draw the HUD on top
    if (view.getZoom() <= 0.08)
      space_hud_renderer.drawHUD();
    else
      hud_renderer.drawHUD();
     */

  }

  function loop(callback, time) {
    let then = new Date().getTime();

    function step() {

      let now = new Date().getTime();

      //if the required time hasnt elapsed yet, wait till next frame
      if (now-then < time) { 
       window.requestAnimationFrame(step);
       return;
      }

      callback();

      now = then = new Date().getTime();
      window.requestAnimationFrame(step);
    }
    step();
  }

  this.startDrawing = function() {
    loop(draw, 30);
    loop(updateLayers, 300);
  }


  Events.on('click', updateLayers);
  Events.on('canvas_resize', updateLayers);
  updateLayers();
}



















function LayerRenderer(canvas_name, world) {

  let tilesize = world.layout.size.x;
  let worldwidth = 4*tilesize*world.radius;

  //a canvas is created large enough to draw the whole world
  var temp_canvas = document.getElementById(canvas_name);
  temp_canvas.width = worldwidth;
  temp_canvas.height = worldwidth;

  var full_view = new View(canvas_name);
  full_view.setInput(-worldwidth/2, -worldwidth/2, worldwidth, worldwidth); //world coordinates
  full_view.setOutput(0, 0, worldwidth, worldwidth);  //canvas coordinates

  var renderer = new Renderer(canvas_name, full_view);
  //this temp world renderer draws the entire layer into a full-sized canvas
  //later on, it must blit a section of this canvas to the final canvas
  this.world_renderer = new WorldRenderer(world, renderer); 
}

//draw onto the temp canvas
LayerRenderer.prototype.drawEarth = function() {
  this.world_renderer.drawTiles();
  this.world_renderer.drawRivers();
}

//draw onto the temp canvas
LayerRenderer.prototype.drawThings = function() {
  this.world_renderer.drawRoads();
  this.world_renderer.drawUnits();
  this.world_renderer.drawResources();
}

//draw a portion of the temp canvas onto the screen
LayerRenderer.prototype.blit = function(source_canvas, target_canvas, view) {



  //generate a two-step view which goes from temp_coordinates to world_coordinates

  //insert that view into a renderer which goes from temp_canvas to screen
  var renderer = new Renderer(target_canvas, temp_to_world_VIEW);
  renderer.blitCanvas(temp_canvas);
  
  /*
  let input_size = view.getInputRect().size;
  let output_size = view.getOutputRect().size;
  let center = view.getCenter();
  */

}

LayerRenderer.prototype.clear = function () {
  this.world_renderer.clear();
}

