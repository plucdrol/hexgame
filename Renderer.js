



///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/////                        BASIC RENDERING FUNCTIONS
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

//this is a style for renderer
function RenderStyle() {
  this.line_color = 'black';
  this.line_width = 0;
  this.fill_color = 'transparent';
  this.text_color = 'black';
  this.text_size = '12';
}

//this is a basic Renderer, it doesn't know about hexes! only points

function Renderer(canvas_draw,view) {
    this.canvas_draw = canvas_draw;
    this.view = view;

    this.ready_to_render = true;
    this.render_timer = {};
}


//PURE functions, use the CANVAS INTERFACE directly to draw on the screen

Renderer.prototype.drawDot = function (point,size,style) {

    //this function draws directly, so modifies the coordinates
    var coord = this.view.worldToScreen(point);
    newsize = this.view.worldToScreen1D(size);

    this.canvas_draw.drawDot(coord, newsize, style.fill_color);
};

Renderer.prototype.drawLine = function(point1,point2,style) {

    //this function draws directly, so modifies the coordinates
    var p1 = this.view.worldToScreen(point1);
    var p2 = this.view.worldToScreen(point2);
    var newwidth = this.view.worldToScreen1D(style.line_width);

    this.canvas_draw.drawLine(p1,p2,newwidth,style.line_color)
};

Renderer.prototype.drawPolygon = function(points,style) {
  //this function draws directly, so modifies the coordinates
  var coords = []; //creates an array or an object (vim test)
  
  //otherwise actually draw a polygon
  for (let point of points) {
      coords.push(this.view.worldToScreen(point));
  }

  this.canvas_draw.drawPolygon(coords,style.line_width,
		  style.fill_color,style.line_color);

};

Renderer.prototype.drawText = function(text,position,style) {
  //this function draws directly, so modifies the coordinates
  var coord = this.view.worldToScreen(position);
  var newfontsize = this.view.worldToScreen1D(style.text_size);

  this.canvas_draw.drawText(text,coord,style.text_color,newfontsize);
};

//INDIRECT functions, use the previous functions to draw complicated things
Renderer.prototype.drawLines = function(points,style) {
  for (var i=0;i<points.length-1;i++) {
      this.drawLine(points[i], points[i+1], width);
  }
};

Renderer.prototype.doneRendering = function(max_render_time) {
  this.ready_to_render = false;
  this.render_timer = window.setTimeout(this.readyToRender, max_render_time);
};

Renderer.prototype.readyToRender = function() {
 this.ready_to_render = true;
};

Renderer.prototype.startRendering = function() {
 this.canvas_draw.clear();
};













//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
                                                                                       
                   //WORLD RENDERER

//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////


var greenscale_colors = function(i) {
  var greenscale = ['#005','#00D','#AA3','#080','#062',
  		    '#052','#042','#032','#020','#010',
		    '#110','#210','#410','#420','#777',
		    '#777','#777','#888','#888','#888',
		    '#FFF','#FFF','#FFF','#FFF','#FFF',
		    '#FFF','#FFF','#FFF','#FFF','#FFF',
		    '#FFF','#FFF'];

  var fadedscale = ['#335','#66D','#AA7','#686','#575',
                   '#464','#353','#242','#232','#232',
		   '#110','#321','#421','#432','#777',
		   '#777','#777','#888','#888','#888',
		   '#FFF','#FFF','#FFF','#FFF','#FFF',
		   '#FFF','#FFF','#FFF','#FFF','#FFF',
		   '#FFF','#FFF'];
  return greenscale[i];
    
}


function WorldRenderer (canvas_draw,view,world) {
  Renderer.call(this,canvas_draw,view); 
  this.world = world;

  this.corners = [];

  this.drawn_at_least_one_hex = false;
  this.ready_to_render = true;
}

WorldRenderer.prototype = Object.create(Renderer.prototype);

WorldRenderer.prototype.hexToPoint = function(hex) {
  return this.world.hexToPoint(hex);
}
WorldRenderer.prototype.hexesToPoints = function(hexes) {
  var points = [];
  for (let hex of hexes) {                            
      points.push(this.hexToPoint(hex));
  }
  return points;
}
WorldRenderer.prototype.pointToHex = function(point) {
  return this.world.pointToHex(point);
}

WorldRenderer.prototype.mapColors = function(i) {
  return greenscale_colors(i);  
} 

WorldRenderer.prototype.drawHex = function(hex, style) {

  //if zoomed out enough, just draw a dot
  if (this.view.getScale() < 1) {

      var point = this.hexToPoint(hex);
      this.drawDot(point, 60, style);
  } else {
      //otherwise, draw the actual hex
      var corners = this.hexesToPoints(Hex.corners(hex));
      this.drawPolygon(corners,style);
  }
  this.drawn_at_least_one_hex = true;
};

WorldRenderer.prototype.fastDrawHex = function(hex,style) {

      //calculate shifted position between previous hex and next hex
      var world_position = this.hexToPoint(hex);
      var screen_position = this.view.worldToScreen(world_position);

      //draw a polygon
      this.canvas_draw.reDrawPolygon(screen_position/*,fill_color*/);
}

WorldRenderer.prototype.drawHexElevated = function(hex,height,style) {
  var low_corners = this.hexesToPoints(Hex.corners(hex));
  var high_corners = [];
  for (var i=0;i<low_corners.length;i++) {
      high_corners[i] = new Point(low_corners[i].x,low_corners[i].y - height);
  }
  
  var column_corners = [low_corners[0],high_corners[1],high_corners[2],
                        high_corners[3],low_corners[4],low_corners[5]];

  this.drawPolygon(column_corners,style);
  this.drawHex(high_corners,style);

};

WorldRenderer.prototype.drawHexes = function(hexes,style) {
    for (var i=0;i<hexes.length;i++) {
        this.drawHex(hexes[i], style)
    }
};

WorldRenderer.prototype.drawOutline = function(edge_arrays,style) {
    for (var outline = 0; outline < edge_arrays.length; outline++) {
        var corners = [];
        var edges = edge_arrays[outline];    
        for (var i=0;i<edges.length;i++){
            corners.push( this.hexToPoint(edges[i].getPoint1() ));
        }
        this.drawPolygon(corners,style);
    }
};

WorldRenderer.prototype.drawRectangleSection = function(rectmap) {
    
    var currentr = 0;
    var r = 0;
    var q = 0;
    var hex = new Hex(0,0);
    var value = 0;
    var tile_renderer = new TileRenderer2D(this);
    //for columns
    for (r = rectmap.rmin; r <= rectmap.rmax; r++) {


        //shift even lines
        currentr = r;
        if (r%2!=0) currentr += 1;

        this.drawRectangleSectionLine(r,currentr,rectmap);
    }
}

WorldRenderer.prototype.drawRectangleSectionLine = function(r,currentr,rectmap) {
   
    var q=0;

    //for rows ( each shifted to become rectangular)
    for (q = Math.floor(rectmap.qmin+(rectmap.rmax-currentr)/2); q<rectmap.qmax+(rectmap.rmax-currentr)/2; q++) {
        hex = new Hex(q,r);
        if (this.world.map.containsHex(hex)) {

            this.drawTile2D(hex);
        }
    }
}


WorldRenderer.prototype.getHexRectangleBoundaries = function() {
   

    //find the screen position and width
    var x = this.view.getInputRect().position.x;
    var y = this.view.getInputRect().position.y;
    var height = this.view.getInputRect().size.x;
    var width = this.view.getInputRect().size.y;

    //find the boundaries
    var left = x; 
    var right = x+width;
    var top = y;
    var bottom = y+height;

    //find the corner points
    var topleft = new Point(left,top);
    var topright = new Point(right,top);
    var bottomleft = new Point(left,bottom);
    var bottomright = new Point(right,bottom);

    //find the corner hexes
    var toplefthex = Hex.round(this.pointToHex(topleft));
    var toprighthex = Hex.round(this.pointToHex(topright));
    var bottomlefthex = Hex.round(this.pointToHex(bottomleft));
    var bottomrighthex = Hex.round(this.pointToHex(bottomright));

    //define the limits of the iteration
    var qmin = Math.min(toplefthex.getQ(),bottomrighthex.getQ(),
		        toprighthex.getQ(),bottomlefthex.getQ());
    var qmax = Math.max(toplefthex.getQ(),bottomrighthex.getQ(),
		        bottomlefthex.getQ(),toprighthex.getQ());
    var rmin = Math.min(toplefthex.getR(),bottomrighthex.getR(),
		        toprighthex.getR(),bottomlefthex.getR());
    var rmax = Math.max(toplefthex.getR(),bottomrighthex.getR(),
		        toprighthex.getR(),bottomlefthex.getR());

    var hex_rect = {
      qmin:qmin,
      qmax:qmax,
      rmin:rmin, 
      rmax:rmax
    };
    
    return hex_rect;
}

WorldRenderer.prototype.drawRedRenderingRectangle = function(rectmap) {
    var corners = [];
    corners.push(this.hexToPoint(new Hex(qmin,rmin)));
    corners.push(this.hexToPoint(new Hex(qmin,rmax)));
    corners.push(this.hexToPoint(new Hex(qmax,rmax)));
    corners.push(this.hexToPoint(new Hex(qmax,rmin)));

    var rect_style = new RenderStyle();
    rect_style.fill_color = 'transparent';
    rect_style.line_color = 'red';
    rect_style.line_width = 20;


    this.drawPolygon(corners,rect_style);
}    

WorldRenderer.prototype.drawWorld = function() {

    if (this.ready_to_render) {
        this.startRendering(); //in milliseconds
        this.drawn_at_least_one_hex = false;
        var rectMap = this.getHexRectangleBoundaries();
        this.drawRectangleSection(rectMap);
        this.drawn_at_least_one_hex = false;
        //this.doneRendering(10);
    }
}








WorldRenderer.prototype.getTile = function(hex) {
    return this.world.map.getValue(hex);
}


WorldRenderer.prototype.drawTile2D = function(hex) {
    var style = new RenderStyle();  
    var tile = this.getTile(hex);

    //analyze tile
    var height = Math.floor(tile.components.elevation);
    style.fill_color = this.mapColors(height);

    //draw ground
    this.drawHex(hex, style);
    var position = this.hexToPoint(hex);

    //wind arrows
    var charcode = this.getWindArrowCharacter( tile.getComponent('wind') );
    var arrow_style = new RenderStyle();
    arrow_style.font_size = 30;
    arrow_style.text_color = 'white';
    this.drawText(String.fromCharCode(charcode), position, arrow_style);

    //draw units
    var this_unit = this.world.units.getValue(hex);
    if (typeof this_unit == 'object') {

        this.drawUnit(this_unit,hex,0);



    }
}

WorldRenderer.prototype.getWindArrowCharacter = function(direction) {

    switch (direction) {
        case 0: return 8594; break;
        case 1: return 8599; break;
        case 2: return 8598; break;
        case 3: return 8592; break;
        case 4: return 8601; break;
        case 5: return 8600; break;
        default: return 8635;
    }
}

/*
WorldRenderer.prototype.drawTile3D = function(hex) {
    
    //analyze tile
    var color = Math.floor(this.getTile(hex).components.elevation);
    color = this.mapColors(color);
    var height = this.getTile(hex).components.elevation*6;

    //draw ground
    if (this.getTile(hex).components.elevation > 1) {
        this.drawHexElevated(hex,height,0,'#310',color);
    } else {
        this.drawHex(hex,0,color);
    }

    //draw unit
    //var this_unit = this.world.unitAtPosition(hex);
    //if (typeof this_unit == 'object') {

        //this.drawUnit(this_unit,hex,height);

    //}
}

WorldRenderer.prototype.drawTileSemi3D = function(hex) {
    
    //this code only works in POINTY_TOP style


    //analyze tile
    var height = this.getTile(hex).components.elevation;
    var color = Math.floor(height);
    color = this.mapColors(color);
    this.drawHex(hex,0,color);
    //draw ground
    //
    var shade  = Math.floor(255-255*height/20);
    color =  "rgba("+shade+","+shade+","+shade+", 0.5)";
    //this.drawHex(hex,0,color);

    //draw walls
    var wall_color = '#310';
    var wall_height = 6;
    
    //analyze neighbors
    var n_left = Hex.neighbor(hex,3);
    var n_upleft = Hex.neighbor(hex,2);
    var n_upright = Hex.neighbor(hex,1);

    //get height of neighbors
    var n_left_height = this.world.map.getValue(n_left);
    var n_upleft_height = this.world.map.getValue(n_upleft);
    var n_upright_height = this.world.map.getValue(n_upright);

    var corners = Hex.corners(hex);
    //draw wall of the left if the heights are different
    if (n_left_height != height) {
       // wall_height = wall_height/2;
       // this.drawLine(corners[3],corners[4],wall_height,wall_color);
    }
    //draw wall on the top-left if that tile is higher
    if (n_upleft_height > height) {
        wall_height = 1.5*(n_upleft_height-height);
        this.drawLine(corners[2].offset(0,wall_height/2),corners[3].offset(0,wall_height/2),wall_height,wall_color);
    }
    //draw wall on the top-right if that tile is higher
    if (n_upright_height > height) {
        wall_height = 1.5*(n_upright_height-height);
        this.drawLine(corners[1].offset(0,wall_height/2),corners[2].offset(0,wall_height/2),wall_height,wall_color);
    }

    //draw unit
    var this_unit = this.world.unitAtPosition(hex);
    if (typeof this_unit == 'object') {

        this.drawUnit(this_unit,hex,0);

    }
}
*/

WorldRenderer.prototype.drawUnit = function(unit,hex,height) {

    var position = this.hexToPoint(hex);
    position = position.offset(0,-height);
   
    var unit_style = new RenderStyle();
    unit_style.line_color = unit.components.color;

    this.drawDot(position,10*unit.components.size,unit_style);
    if (unit.components.population != undefined) {
      var text_style = new RenderStyle();
      text_style.font_size = 25;
            
      this.drawText(unit.components.population,position,text_style);
    }
};

WorldRenderer.prototype.drawRange = function(range) {
    
    var outline = Hex.outline(range.getArray());

    var range_style = new RenderStyle();
    range_style.fill_color = "rgba(255,255,150, 0.2)";
    range_style.line_width = 3;
    range_style.line_color = "rgba(255,255,100,1)";

    //draw the outline of the range
    this.drawOutline( outline,range_style);
}

WorldRenderer.prototype.drawPath = function(range,destination) {
    
    var pathfinder = new PathFinder(this.world.map);

    //draw the path
    if (range.containsHex(destination)) {
	var hex_style = new RenderStyle();
	hex_style.fill_color = "rgba(200, 255, 200, 0.5)";
	hex_style.width = 2;

	this.drawHex(destination,hex_style);
        
        //calculate points of the hexes
        var hexes = pathfinder.destinationPathfind(range,destination);
        var points = [];
        for (var i = 0; i<hexes.length;i++) {
            points.push(this.hexToPoint(hexes[i]));
        }

        //draw on screen
        this.drawLines(points,3);
        
    }
}



















/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
//////                                                                                              
//////                          TILE RENDERER
//////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

function TileRenderer () {
    Renderer.call(this); 
}
TileRenderer.prototype = Object.create(Renderer.prototype);
TileRenderer.prototype.drawTile = function(hex,value) {
}
TileRenderer.prototype.mapColors = function(i) {
    return greenscale_colors(i);  
} 



function TileRenderer2D() {
    TileRenderer.call(this); 
}
TileRenderer2D.prototype = Object.create(TileRenderer.prototype);
TileRenderer2D.prototype.drawTile = function(hex,value) {
        //analyze tile
        var height = value;
        color = this.mapColors(height);

        //draw ground
        this.drawHex(hex,0,color);
    }

/*


function TileRenderer3D() {
    this.drawTile = function(hex,value) {
        //analyze tile
        var color = value;
        color = this.mapColors(color);
        var height = color*6;

        //draw ground
        if (height > 1) {
            this.drawHexElevated(hex,height,0,'#310',color);
        } else {
            this.drawHex(hex,0,color);
        }
    }
}
TileRenderer3D.prototype = Object.create(TileRenderer.prototype);

function TileRendererSemi3D() {
    this.drawTile = function(hex,value) {

        //this code only works in POINTY_TOP


        //analyze tile
        var height = value;
        var color = Math.floor(height);
        color = this.mapColors(color);
        this.drawHex(hex,0,color);
        //draw ground
        //
        var shade  = Math.floor(255-255*height/20);
        color =  "rgba("+shade+","+shade+","+shade+", 0.5)";
        //this.drawHex(hex,0,color);

        //draw walls
        var wall_color = '#310';
        var wall_height = 6;
        
        //analyze neighbors
        var n_left = Hex.neighbor(hex,3);
        var n_upleft = Hex.neighbor(hex,2);
        var n_upright = Hex.neighbor(hex,1);

        //get height of neighbors
        var n_left_height = this.world.map.getValue(n_left);
        var n_upleft_height = this.world.map.getValue(n_upleft);
        var n_upright_height = this.world.map.getValue(n_upright);

        var corners = Hex.corners(hex);
        //draw wall of the left if the heights are different
        if (n_left_height != height) {
           // wall_height = wall_height/2;
           // this.drawLine(corners[3],corners[4],wall_height,wall_color);
        }
        //draw wall on the top-left if that tile is higher
        if (n_upleft_height > height) {
            wall_height = 1.5*(n_upleft_height-height);
            this.drawLine(corners[2].offset(0,wall_height/2),corners[3].offset(0,wall_height/2),wall_height,wall_color);
        }
        //draw wall on the top-right if that tile is higher
        if (n_upright_height > height) {
            wall_height = 1.5*(n_upright_height-height);
            this.drawLine(corners[1].offset(0,wall_height/2),corners[2].offset(0,wall_height/2),wall_height,wall_color);
        }
    }
}
TileRendererSemi3D.prototype = Object.create(TileRenderer.prototype);

*/
