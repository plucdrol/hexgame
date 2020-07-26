function HUDRenderer(world, game_input, hex_renderer) {

  this.game_input = game_input;
  this.world = world;
  this.unit_input = game_input.unit_input;
  this.action_menu = this.unit_input.button_menu;
  this.hex_renderer = hex_renderer;
  this.action_path = [];
  this.action_targets = [];

  listenForEvent('hex_hovered_changed', this.updateHover.bind(this) );
}


HUDRenderer.prototype.updateHover = function(hex_hovered) {

  this.action_targets = [];
  let self = this;
  if (this.hoverTimeout)
    clearTimeout(this.hoverTimeout);
  this.hoverTimeout = setTimeout(function(){ self.updateActionTargets(hex_hovered.detail);
                                             self.updateActionPath(hex_hovered.detail); }, 100);

}


/////////////////////////////////////////////////////
//          Functions about map overlay information
/////////////////////////////////////////////////////
HUDRenderer.prototype.drawHUD = function() {


  var hex_hovered = this.game_input.hex_hovered;
  var hex_selected = this.unit_input.hex_selected;

  if (hex_selected) {
    let actor = this.unit_input.getActorSelected();

    //this.drawSelectionHex(hex_selected);

    if (hex_hovered) {
      this.drawHoveredHex(hex_hovered);
    }

    if (actor) {
      let action = this.action_menu.getActionSelected(actor);
      if (action /*&& action.name != 'city-by-air'*/) {
        //this.drawActorRange();


        if (this.action_path.length > 0) {
          this.drawActionPath(hex_hovered);
          
          if (this.action_targets.length > 0) {
           this.drawActionTargets(hex_hovered);
          }
        }


      }
    } 

  } else {
    if (hex_hovered ) {
      this.drawHoveredHex(hex_hovered);
    }
  }
}





HUDRenderer.prototype.updateActionPath = function (hex_hovered) {
  
  let actor = this.unit_input.getActorSelected();
  let action = this.action_menu.getActionSelected(actor);
  let hex_selected = this.unit_input.hex_selected;

  if (action && actor && hex_selected) {
    this.action_path = action.getActionPath(this.world, actor, hex_selected, hex_hovered, action.max_distance);
  } else {
    this.action_path = [];
  }
}

HUDRenderer.prototype.drawActionPath = function (hex_hovered) {

  let actor = this.unit_input.getActorSelected();
  let action = this.action_menu.getActionSelected(actor);

  //draw a line from actor to target
  let color = '#C50';
  if ( action.targetFilterFunction(this.world, actor, hex_hovered) )
    color = '#5C0';

  this.drawPath(this.action_path, color);
}



HUDRenderer.prototype.updateActionTargets = function (hex_hovered) {
  
  let actor = this.unit_input.getActorSelected();
  let action = this.action_menu.getActionSelected(actor);

  this.action_targets = [];

  if (action && actor && action.hover_action) {
    if (!action.targetFilterFunction(this.world, actor, hex_hovered))
      return;

    let hover_action = action.hover_action;
    this.action_targets = hover_action.getActionTargets(this.world, actor, hex_hovered );
  } 
}

HUDRenderer.prototype.drawActionTargets = function (hex_hovered) {

  let actor = this.unit_input.getActorSelected();
  let action = this.action_menu.getActionSelected(actor);
  
  let hex_selected = this.unit_input.hex_selected;
  
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(50,200,50,0)";
  hover_style.line_width = 6;
  hover_style.line_color = "rgba(50,200,50,1)";

  for (target of this.action_targets) {
    if (!this.world.getTile(target).hidden)
      this.hex_renderer.drawHex( target, hover_style );

  }
  
}


HUDRenderer.prototype.drawPath = function(hexarray, color) {
  /*var previous = hexarray[0];
  if (hexarray.length > 0)
    for (hex of hexarray) {
      this.hex_renderer.drawCenterLine(hex, previous, 6, color );
      previous = hex;
    }*/

  //var previous = hexarray[0];
  for (let i = 0; i < hexarray.length-1; i++) {
    if (!this.world.areRoadConnected(hexarray[i], hexarray[i+1]))  
      this.hex_renderer.drawCenterLine(hexarray[i], hexarray[i+1], 6, color );
  }
}

HUDRenderer.prototype.actorHasRenderableRange = function(actor) {
  return (actor && actor.selectable && actor.range.length > 0)
}



HUDRenderer.prototype.drawActorRange = function() {
  //draw range of selected actor
  var actor = this.unit_input.getActorSelected();
  
  //range style
  var range_style = new RenderStyle();
  range_style.fill_color = "rgba(255,255,150, "+this.ocillate(900)+")";
  range_style.line_color = "rgba(255,255,100,"+(0.5+0.5*this.ocillate(900))+")";

  if (this.actorHasRenderableRange(actor)) {
    this.hex_renderer.drawHexes(actor.range, range_style);

  }
}

HUDRenderer.prototype.drawHoveredHex = function(hex_hovered) {
  //draw hovered hex
  var hover_style = new RenderStyle();
  hover_style.fill_color = "rgba(200,200,200,0.4)";
  hover_style.line_width = 0;
  this.hex_renderer.drawHex( hex_hovered, hover_style );
}

HUDRenderer.prototype.drawSelectionHex = function(hex_selected) {
    //draw selection hex
    var select_style = new RenderStyle();

    select_style.fill_color = "rgba(200,200,0,"+this.ocillate(500)+")";
    select_style.line_width = 2;
    //this.hex_renderer.drawHex(hex_selected, select_style);
    this.hex_renderer.drawCenterLine(
          hex_selected,
          Hex.add(hex_selected,new Hex(20,-40)),
          16*this.unit_input.getActorSelected().size, 
          "rgba(0,200,200,"+(0.3+0.7*this.ocillate(1000))+")" );
}

HUDRenderer.prototype.ocillate = function(length) {
  let time = new Date().getTime()%length;
  let opacity = Math.abs(time/length-0.5);
  return opacity;
}