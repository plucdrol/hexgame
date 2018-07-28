


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
                                                                
//   TILE RENDERER

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

/*This is actually an interface and thsu can be inherited*/
function TileRenderer (canvas_draw, view, layout, color_scheme) {
  this.hex_renderer = new HexRenderer(canvas_draw, view, layout);
  this.color_scheme = color_scheme;
}
TileRenderer.prototype.drawTile = function(hex,value) {
}
TileRenderer.prototype.mapColors = function(i) {
  return greenscale_colors(i, this.color_scheme);  
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
  this.hex_renderer.drawHex(hex, style);
  var position = this.hex_renderer.hexToPoint(hex);

  //wind arrows
  var wind_direction = tile.getComponent('wind');
  var charcode = getWindArrowCharacter( wind_direction );
  var arrow_style = new RenderStyle();
  arrow_style.font_size = 30;
  arrow_style.text_color = 'white';
  var wind_text = String.fromCharCode(charcode);
  //this.drawText(wind_text, position, arrow_style);

}




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



//colors of different tiles depending on height
var greenscale_colors = function (i, color_scheme) {


  if (color_scheme == 'space') {
    var spacescale = ['#000','#000','#ccc','#222','#222',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000',];
     return spacescale[i];
   }

  if (color_scheme == 'galaxy') {
    var galaxyscale = ['#000','#000','#dd0','#222','#222',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000',
                      '#000','#000',];
     return galaxyscale[i];
   }

     if (color_scheme == 'earth') {
      var greenscale = ['#005','#00D','#AA3','#080','#062',
                    '#052','#042','#032','#020','#010',
                    '#110','#210','#410','#420','#777',
                    '#777','#777','#888','#888','#888',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF'];
     return greenscale[i];
   }

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

