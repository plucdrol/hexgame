
import View from './u/View.js'
import Renderer from './u/Renderer.js';
import WorldRenderer from './WorldRenderer.js';
import HUDRenderer from './HudRenderer.js';
import Events from './u/Events.js';



export default function GameRenderer(worlds, world_input, view) {

  let renderer = new Renderer('canvas', view);
  let layers = [];

  for (let world of worlds) {
    layers.push(new LayerRenderer(world))
  }

  let hud_renderer = new HUDRenderer(worlds[1], world_input, renderer);
  //let mars_hud_renderer = new HUDRenderer(worlds[2], mars_input, renderer);


  function clear() {
    for (let layer of layers)
      layer.clear();
  }

  function updateLayers() {
    for (let layer of layers) {

      layer.drawGround();
      layer.drawThings();
    }
  }


  function draw() {

    //clear the real canvas
    renderer.clear();


    //blit the temporary canvases to the final canvas
    for (let layer of layers) {
      layer.blit('canvas', view)
    }


    //draw the HUD on top

    hud_renderer.drawHUD();
    //mars_hud_renderer.drawHUD();
    //console.trace();


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
    loop(updateLayers, 30); //this makes a bit of lag every 300. This process should be done in little bits instead
  }


  Events.on('click', updateLayers);
  Events.on('canvas_resize', updateLayers);
  updateLayers();
}

















var layer_ids = 1;

function LayerRenderer(world) {

  let canvas_name = 'canvas_'+layer_ids;
  layer_ids++;

  this.temp_canvas = this.createCanvas(canvas_name);

  let tilesize = world.layout.size.x;
  let worldwidth = 4*tilesize*world.radius;
  let canvaswidth = 4*35*world.radius;

  //a canvas is created large enough to draw the whole world
  this.temp_canvas.width = canvaswidth;
  this.temp_canvas.height = canvaswidth;

  //a view is created to fit the world into that canvas
  this.full_view = new View(canvas_name);
  this.full_view.setInput(
    world.layout.origin.x-worldwidth/2, 
    world.layout.origin.y-worldwidth/2, 
    worldwidth, 
    worldwidth
    ); //world coordinates
  this.full_view.setOutput(0, 0, canvaswidth, canvaswidth);  //canvas coordinates

  //this temp world renderer draws the entire layer into a full-sized canvas
  //later on, it must blit a section of this canvas to the final canvas
  var renderer = new Renderer(canvas_name, this.full_view);
  this.world_renderer = new WorldRenderer(world, renderer); 
}

LayerRenderer.prototype.createCanvas = function(canvas_name) {
  let canvas = document.createElement('canvas');
  canvas.id = canvas_name;
  canvas.style.display = 'none';
  document.body.appendChild(canvas)
  return canvas;
}

LayerRenderer.prototype.RendererFromTempCanvasToScreen = function(canvas_name, view) {
  let blitview = new View(canvas_name);

  blitview.setInput(
    this.full_view.worldToScreen( view.getPosition() ).x,
    this.full_view.worldToScreen( view.getPosition() ).y,
    this.full_view.worldToScreen1D( view.getInputSize().x ),
    this.full_view.worldToScreen1D( view.getInputSize().y ),
  );

  return new Renderer(canvas_name, blitview);
}

LayerRenderer.prototype.blit = function(canvas_name, view) {
  let renderer = this.RendererFromTempCanvasToScreen(canvas_name, view);
  renderer.blitCanvas(this.temp_canvas);
}

//draw onto the temp canvas
LayerRenderer.prototype.drawGround = function() {
  //console.time('drawSomeLands')
  this.world_renderer.drawSomeLands(500);
  //console.timeEnd('drawSomeLands')
  this.world_renderer.drawRivers();
}

//draw onto the temp canvas
LayerRenderer.prototype.drawThings = function() {
  this.world_renderer.drawRoads();
  this.world_renderer.drawUnits();
  this.world_renderer.drawResources();
}


LayerRenderer.prototype.clear = function () {
  this.world_renderer.clear();
}

