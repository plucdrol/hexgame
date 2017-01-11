//-------1---------2---------3---------4---------5---------6---------7---------8



///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//   BASIC RENDERING FUNCTIONS
//////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

//Dependencies:
//  CanvasDraw.js
//  View.js

//this is a style for renderer
function RenderStyle() {
  this.line_color = 'black';
  this.line_width = 0;
  this.fill_color = 'transparent';
  this.text_color = 'black';
  this.text_size = '12';
}

//this is a basic Renderer, it doesn't know about hexes!

function Renderer(canvas_draw,view) {
    this.canvas_draw = canvas_draw;
    this.view = view;

    this.ready_to_render = true;
    this.render_timer = {};
    
    this.worldToScreen;
}

//Coordinate transformation
Renderer.prototype.setWorldToScreen = function(callback) {
  this.worldToScreen = callback;
}
Renderer.prototype.worldToScreen = function(point) {
  return this.view.worldToScreen(point);
}
Renderer.prototype.worldToScreen1D = function(scalar) {
  return this.view.worldToScreen1D(scalar);
}


//PURE functions, directly draw on the screen
Renderer.prototype.drawDot = function (point,size,style) {

    var coord = this.worldToScreen(point);
    newsize = this.worldToScreen1D(size);
    var color = style.fill_color;

    this.canvas_draw.drawDot(coord, newsize, color);
};

//Transform coordinates and draw a line using CanvasDraw
Renderer.prototype.drawLine=function(point1,point2,style) {

  var p1 = this.worldToScreen(point1);
  var p2 = this.worldToScreen(point2);
  var newwidth = this.worldToScreen1D(style.line_width);
  var color = style.line_color;

  this.canvas_draw.drawLine(p1, p2, newwidth, color);
};

//Transform coordinates and draw a polyon using CanvasDraw
Renderer.prototype.drawPolygon = function(points,style) {
  var coords = []; //creates an array 
  
  //otherwise actually draw a polygon
  for (let point of points) {
    let coord = this.worldToScreen(point);
    coords.push(coord);
  }

  this.canvas_draw.drawPolygon(coords,style.line_width,
    style.fill_color,style.line_color);

};

//Transform coordinatess and draw text using CanvasDraw
Renderer.prototype.drawText=function(text,position,style) {
  var coord = this.worldToScreen(position);
  var newfontsize = this.worldToScreen1D(style.text_size);
  var color = style.text_color;

  this.canvas_draw.drawText(text,coord,color,newfontsize);
};

//Draw multiple lines using the drawLine function
Renderer.prototype.drawLines = function(points,style) {
  for (var i=0;i<points.length-1;i++) {
      this.drawLine(points[i], points[i+1], width);
  }
};




/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
//                HEXMAP RENDERER
/////////////////////////////////////////
/////////////////////////////////////////
/////////////////////////////////////////
function HexMapRenderer(canvas_draw, view, hexmap) {
  Renderer.call(this,canvas_draw,view); 

}

WorldRenderer.prototype = Object.create(Renderer.prototype);




///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
                                                                    
                     //WORLD RENDERER

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////
//Dependencies
//  CanvasDraw.js
//  View.js
//  World.js
//  Renderer.js
//  Hex.js

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

  this.ready_to_render = true;
}

WorldRenderer.prototype = Object.create(Renderer.prototype);
WorldRenderer.p = WorldRenderer.prototype;

WorldRenderer.p.hexToPoint = function(hex) {
  return this.world.hexToPoint(hex);
}
WorldRenderer.p.hexesToPoints = function(hexes) {
  var points = [];
  for (let hex of hexes) {                            
      points.push(this.hexToPoint(hex));
  }
  return points;
}
WorldRenderer.p.pointToHex = function(point) {
  return this.world.pointToHex(point);
}

WorldRenderer.p.mapColors = function(i) {
  return greenscale_colors(i);  
} 

WorldRenderer.p.drawHex = function(hex, style) {

  //if zoomed out enough, just draw a dot
  if (this.view.getScale() < 1) {

      var point = this.hexToPoint(hex);
      this.drawDot(point, 60, style);
  } else {
      //otherwise, draw the actual hex
      var corners = this.hexesToPoints(Hex.corners(hex));
      this.drawPolygon(corners,style);
  }
};

WorldRenderer.p.drawHexElevated = function(hex,height,style) {
  var low_corners = this.hexesToPoints(Hex.corners(hex));
  var high_corners = [];
  for (let i=0;i<low_corners.length;i++) {
    let shifted_x = low_corners[i].x;
    let shifted_y = low_Corners[i].y-height;
    high_corners[i] = new Point(shifted_x, shifted_y);
  }
  
  var column_corners = [low_corners[0],  high_corners[1],
                        high_corners[2], high_corners[3],
                        low_corners[4],  low_corners[5]];

  this.drawPolygon(column_corners,style);
  this.drawHex(high_corners,style);

};

WorldRenderer.p.drawHexes = function(hexes,style) {
    for (var i=0;i<hexes.length;i++) {
        this.drawHex(hexes[i], style)
    }
};

WorldRenderer.p.drawOutline = function(edge_arrays,style) {
    
  var number_of_loops = edge_arrays.length;
  for (let outline = 0; outline<number_of_loops; outline++){
    var corners = [];
    var edges = edge_arrays[outline];    
    for (var i=0;i<edges.length;i++){
      corners.push( this.hexToPoint(edges[i].getPoint1() ));
    }
    this.drawPolygon(corners,style);
  }
};

WorldRenderer.p.drawRectangleSection = function(rectmap) {
    
  var tile_renderer = new TileRenderer2D(this);
  
  //for columns
  for (let r = rectmap.rmin; r <= rectmap.rmax; r++) {

    //shift even lines
    let currentr = r;
    if (r%2!=0) currentr += 1;
    
    //measure line start and end
    qstart = this.getLineStart(currentr,rectmap)
    qend = this.getLineEnd(currentr,rectmap)

    //draw line
    this.drawLineSection(r,qstart, qend);
  }
}

WorldRenderer.p.getLineStart = function(currentr, rectmap) {

  let step_shift = (rectmap.rmax - currentr)/2;
  let qstart = Math.floor( rectmap.qmin + step_shift ); 
  return qstart;
}
WorldRenderer.p.getLineEnd = function(currentr, rectmap) {

  let step_shift = (rectmap.rmax - currentr)/2;
  let qend = Math.floor( rectmap.qmax + step_shift );
  return qend;
}
WorldRenderer.p.drawLineSection = function(r,qstart,qend) {

    for (let q = qstart; q < qend; q++) {
        let hex = new Hex(q,r);
        if (this.world.map.containsHex(hex)) {

            this.drawTile2D(hex);
        }
    }
}


WorldRenderer.p.getHexRectangleBoundaries = function() {
   

    //find the screen position and width
    var x = this.view.getInputRect().position.x;
    var y = this.view.getInputRect().position.y;
    var height = this.view.getInputRect().size.y;
    var width = this.view.getInputRect().size.x;

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

WorldRenderer.p.drawRedRenderingRectangle = function(rectmap) {
    var corners = [];
    corners.push(this.hexToPoint(new Hex(rectmap.qmin,rectmap.rmin)));
    corners.push(this.hexToPoint(new Hex(rectmap.qmin,rectmap.rmax)));
    corners.push(this.hexToPoint(new Hex(rectmap.qmax,rectmap.rmax)));
    corners.push(this.hexToPoint(new Hex(rectmap.qmax,rectmap.rmin)));

    var rect_style = new RenderStyle();
    rect_style.fill_color = 'transparent';
    rect_style.line_color = 'red';
    rect_style.line_width = 20;


    this.drawPolygon(corners,rect_style);
}    

WorldRenderer.p.drawWorld = function() {

    if (this.ready_to_render) {
        this.canvas_draw.clear();
        var rectMap = this.getHexRectangleBoundaries();
        this.drawRectangleSection(rectMap);
    }
}








WorldRenderer.p.getTile = function(hex) {
    return this.world.map.getValue(hex);
}


WorldRenderer.p.drawTile2D = function(hex) {
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

WorldRenderer.p.getWindArrowCharacter = function(direction) {

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

WorldRenderer.p.drawUnit = function(unit,hex,height) {

    var position = this.hexToPoint(hex);
    position = position.offset(0,-height);
   
    var unit_style = new RenderStyle();
    unit_style.fill_color = unit.components.color;
    this.drawDot(position,10*unit.components.size,unit_style);
    if (unit.components.population != undefined) {
      var text_style = new RenderStyle();
      text_style.font_size = 25;
            
      this.drawText(unit.components.population,position,text_style);
    }
};

WorldRenderer.p.drawRange = function(range) {
    
    var outline = Hex.outline(range.getArray());

    var range_style = new RenderStyle();
    range_style.fill_color = "rgba(255,255,150, 0.2)";
    range_style.line_width = 3;
    range_style.line_color = "rgba(255,255,100,1)";

    //draw the outline of the range
    this.drawOutline( outline,range_style);
}

WorldRenderer.p.drawPath = function(range,destination) {
    
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



















/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
                                                                
//   TILE RENDERER

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

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
        var n_left = hex.getNeighbor(3);
        var n_upleft = hex.getNeighbor(2);
        var n_upright = hex.getNeighbor(1);

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
