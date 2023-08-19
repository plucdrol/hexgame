import Events from './u/Events.js'
import Hex from './u/Hex.js'
import HexRender from './HexRender.js'
import RenderStyle from './ViewRender.js'
import updateTooltip from './Tooltip.js'

export default function HUDRender(world, world_input, render) {

  var unit_input = world_input.getUnitInput();
  var hex_render = new HexRender(render, world.getLayout() );
  var action_path = [];
  var action_targets = [];
  var hover_timeout;

  Events.on('hex_hovered_changed', (e) => updateHover(e.detail) );







  /////////////////////////////////////////////////////
  //          Functions about map overlay information
  /////////////////////////////////////////////////////
  this.drawHUD = function() {

    var hex_hovered = world_input.getHexHovered();
    var hex_selected = unit_input.getHexSelected();

    if (hex_hovered) 
      drawHoveredHex(hex_hovered);

    if (!hex_selected) 
      return

    let actor = unit_input.getActorSelected();
    if (!actor) 
      return

    let action = unit_input.getActionSelected();
    if (!action) 
      return;

    if (action.sky_action && hex_selected && hex_hovered)
      drawStraightLine(hex_selected, hex_hovered);

    if (action_path && action_path.length > 0) 
      drawActionPath(hex_hovered);

    if ((action.sky_action || action_path) && action_targets && action_targets.length > 0)
      drawActionTargets(hex_hovered);


}











  // UPDATE FUNCTIONS


  function updateHover(hex_hovered) {

    action_targets = [];

    //use a timeout to only trigger when the mouse stops moving
    if (hover_timeout)
      clearTimeout(hover_timeout);
    hover_timeout = setTimeout(function(){ updateActionTargets(hex_hovered);
                                               updateActionPath(hex_hovered); 
                                               //updateTooltip(world, hex_hovered) 
                                             }, 100);

  }

  function updateActionPath (hex_hovered) {
    
    let actor = unit_input.getActorSelected();
    let action = unit_input.getActionSelected();
    let hex_selected = unit_input.getHexSelected();

    if (action && actor && hex_selected) {
      action_path = action.getPath(world, hex_selected, hex_hovered, action.max_distance);
    } else {
      action_path = [];
    }
  }

  function updateActionTargets (hex_hovered) {
    
    let actor = unit_input.getActorSelected();
    let action = unit_input.getActionSelected();

    action_targets = [];

    if (action && actor && action.hover_action) {
      if (!action.targetFilterFunction(world, actor, hex_hovered))
        return;

      let hover_action = action.hover_action;
      action_targets = hover_action.getTargets(world, actor, hex_hovered );
    } 
  }









  //DRAW FUNCTIONS

  function drawActionPath (hex_hovered) {

    let actor = unit_input.getActorSelected();
    let action = unit_input.getActionSelected();

    //draw a line from actor to target
    let color = '#C50';
    if ( action.targetFilterFunction(world, actor, hex_hovered) )
      color = '#5C0';

    drawPath(action_path, color);
  }

  function drawActionTargets (hex_hovered) {

    let actor = unit_input.getActorSelected();
    let action = unit_input.getActionSelected();
    
    //Style for Action targets
    var hover_style = new RenderStyle();
    hover_style.fill_color = "rgba(50,200,50,0)";
    hover_style.line_width = 6;
    hover_style.line_color = "rgba(50,200,50,1)";

    for (let target of action_targets) {
      if (!world.getTile(target).hidden)
        hex_render.drawHex( target, hover_style );
    }
  }


  function drawPath(hexarray, color) {
    if (!hexarray)
      return;

    for (let i = 0; i < hexarray.length-1; i++) {
      if (!world.areRoadConnected(hexarray[i], hexarray[i+1]))  //don't draw path through roads
        hex_render.drawCenterLine(hexarray[i], hexarray[i+1], 6, color );
    }
  }

  function drawStraightLine(hex1, hex2) {
    let actor = unit_input.getActorSelected();
    let action = unit_input.getActionSelected();



    let color = '#C50'; //red
    if ( action.targetFilterFunction(world, actor, hex2) )
      color = '#5C0'; //green
    if (Hex.distance(hex1,hex2) > action.max_distance)
      color = '#C50'; //red
    hex_render.drawCenterLine(hex1, hex2, 6, color );
  }

  function drawHoveredHex(hex_hovered) {
    //draw hovered hex
    var hover_style = new RenderStyle();
    hover_style.fill_color = "rgba(200,200,200,0.4)";
    hover_style.line_width = 0;

    hex_render.drawHex( hex_hovered, hover_style );
  }

  function drawSelectionHex(hex_selected) {
    //draw selection hex
    var select_style = new RenderStyle();

    select_style.fill_color = "rgba(200,200,0,"+ocillate(500)+")";
    select_style.line_width = 2;
    //hex_render.drawHex(hex_selected, select_style);
    hex_render.drawCenterLine(
          hex_selected,
          hex_selected.add(new Hex(20,-40)),
          16*unit_input.getActorSelected().size, 
          "rgba(0,200,200,"+(0.3+0.7*ocillate(1000))+")" );
  }

  //return a varying opacity depending on the time it is called
  function ocillate(length) {
    let time = new Date().getTime()%length;
    let opacity = Math.abs(time/length-0.5);
    return opacity;
  }


}
