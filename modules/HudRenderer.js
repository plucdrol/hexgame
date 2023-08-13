

import Events from './u/Events.js'
import Hex from './u/Hex.js'
import HexRenderer from './HexRenderer.js';
import RenderStyle from './u/Renderer.js'

export default function HUDRenderer(world, world_input, renderer) {



  var unit_input = world_input.getUnitInput();
  var action_menu = unit_input.button_menu;
  var hex_renderer = new HexRenderer(renderer, world.getLayout() );
  var action_path = [];
  var action_targets = [];

  Events.on('hex_hovered_changed', updateHover );



  function updateHover(hex_hovered) {

    var action_targets = [];
    let self = this;
    if (this.hoverTimeout)
      clearTimeout(this.hoverTimeout);
    this.hoverTimeout = setTimeout(function(){ updateActionTargets(hex_hovered.detail);
                                               updateActionPath(hex_hovered.detail); }, 100);

  }



  /////////////////////////////////////////////////////
  //          Functions about map overlay information
  /////////////////////////////////////////////////////
  this.drawHUD = function() {


    var hex_hovered = world_input.getHexHovered();
    var hex_selected = unit_input.getHexSelected();

    if (hex_selected) {
      let actor = unit_input.getActorSelected();

      //drawSelectionHex(hex_selected);

      if (hex_hovered) {
        drawHoveredHex(hex_hovered);
      }

      if (actor) {
        let action = action_menu.getActionSelected(actor);
        if (action /*&& action.name != 'city-by-air'*/) {
          //drawActorRange();


          if (action_path.length > 0) {
            drawActionPath(hex_hovered);
            
            if (action_targets.length > 0) {
             drawActionTargets(hex_hovered);
            }
          }


        }
      } 

    } else {
      if (hex_hovered ) {
        drawHoveredHex(hex_hovered);
      }
    }
  }





  function updateActionPath (hex_hovered) {
    
    let actor = unit_input.getActorSelected();
    let action = action_menu.getActionSelected(actor);
    let hex_selected = unit_input.hex_selected;

    if (action && actor && hex_selected) {
      action_path = action.getActionPath(world, actor, hex_selected, hex_hovered, action.max_distance);
    } else {
      action_path = [];
    }
  }

  function drawActionPath (hex_hovered) {

    let actor = unit_input.getActorSelected();
    let action = action_menu.getActionSelected(actor);

    //draw a line from actor to target
    let color = '#C50';
    if ( action.targetFilterFunction(world, actor, hex_hovered) )
      color = '#5C0';

    drawPath(action_path, color);
  }



  function updateActionTargets (hex_hovered) {
    
    let actor = unit_input.getActorSelected();
    let action = action_menu.getActionSelected(actor);

    action_targets = [];

    if (action && actor && action.hover_action) {
      if (!action.targetFilterFunction(world, actor, hex_hovered))
        return;

      let hover_action = action.hover_action;
      action_targets = hover_action.getActionTargets(world, actor, hex_hovered );
    } 
  }

  function drawActionTargets (hex_hovered) {

    let actor = unit_input.getActorSelected();
    let action = action_menu.getActionSelected(actor);
    
    let hex_selected = unit_input.hex_selected;
    
    var hover_style = new RenderStyle();
    hover_style.fill_color = "rgba(50,200,50,0)";
    hover_style.line_width = 6;
    hover_style.line_color = "rgba(50,200,50,1)";

    for (let target of action_targets) {
      if (!world.getTile(target).hidden)
        hex_renderer.drawHex( target, hover_style );

    }
    
  }


  function drawPath(hexarray, color) {
    /*var previous = hexarray[0];
    if (hexarray.length > 0)
      for (hex of hexarray) {
        hex_renderer.drawCenterLine(hex, previous, 6, color );
        previous = hex;
      }*/

    //var previous = hexarray[0];
    for (let i = 0; i < hexarray.length-1; i++) {
      if (!world.areRoadConnected(hexarray[i], hexarray[i+1]))  
        hex_renderer.drawCenterLine(hexarray[i], hexarray[i+1], 6, color );
    }
  }

  function actorHasRenderableRange(actor) {
    return (actor && actor.selectable && actor.range.length > 0)
  }



  function drawActorRange() {
    //draw range of selected actor
    var actor = unit_input.getActorSelected();
    
    //range style
    var range_style = new RenderStyle();
    range_style.fill_color = "rgba(255,255,150, "+ocillate(900)+")";
    range_style.line_color = "rgba(255,255,100,"+(0.5+0.5*ocillate(900))+")";

    if (actorHasRenderableRange(actor)) {
      hex_renderer.drawHexes(actor.range, range_style);
    }
  }

  function drawHoveredHex(hex_hovered) {
    //draw hovered hex
    var hover_style = new RenderStyle();
    hover_style.fill_color = "rgba(200,200,200,0.4)";
    hover_style.line_width = 0;
    hex_renderer.drawHex( hex_hovered, hover_style );
  }

  function drawSelectionHex(hex_selected) {
      //draw selection hex
      var select_style = new RenderStyle();

      select_style.fill_color = "rgba(200,200,0,"+ocillate(500)+")";
      select_style.line_width = 2;
      //hex_renderer.drawHex(hex_selected, select_style);
      hex_renderer.drawCenterLine(
            hex_selected,
            Hex.add(hex_selected,new Hex(20,-40)),
            16*unit_input.getActorSelected().size, 
            "rgba(0,200,200,"+(0.3+0.7*ocillate(1000))+")" );
  }

  function ocillate(length) {
    let time = new Date().getTime()%length;
    let opacity = Math.abs(time/length-0.5);
    return opacity;

  }


}