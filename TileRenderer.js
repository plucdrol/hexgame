


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
                                                                
//   TILE RENDERER

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function TileRenderer (canvas_draw, view, layout, color_scheme) {
  HexRenderer.call(this,canvas_draw, view, layout, color_scheme); 
}
TileRenderer.prototype = Object.create(HexRenderer.prototype);
TileRenderer.prototype.drawTile = function(hex,value) {
}


function TileRenderer2D(canvas_draw, view, layout, color_scheme) {
  TileRenderer.call(this, canvas_draw, view, layout, color_scheme); 
}
TileRenderer2D.prototype = Object.create(TileRenderer.prototype);

TileRenderer2D.prototype.drawTile = function(hex,tile) {
  
  var style = new RenderStyle();  

  //analyze tile
  var height = Math.floor(tile.getComponent('elevation'));
  style.fill_color = this.mapColors(height);

  //draw ground
  this.drawHex(hex, style);
  var position = this.hexToPoint(hex);

  //wind arrows
  var wind_direction = tile.getComponent('wind');
  var charcode = getWindArrowCharacter( wind_direction );
  var arrow_style = new RenderStyle();
  arrow_style.font_size = 30;
  arrow_style.text_color = 'white';
  var wind_text = String.fromCharCode(charcode);
  //this.drawText(wind_text, position, arrow_style);

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




getWindArrowCharacter = function(direction) {

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
