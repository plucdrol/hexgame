


/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
                                                                
//   TILE RENDERER

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

/*This is actually an interface and thsu can be inherited*/
function TileRenderer (renderer, layout) {
  this.hex_renderer = new HexRenderer(renderer, layout);


}
TileRenderer.prototype.drawTile = function(hex,value) {
}
TileRenderer.prototype.mapColors = function(i) {
  return greenscale_colors(i);  
} 





function TileRenderer2D(renderer, layout) {
  TileRenderer.call(this, renderer, layout); 
  this.tilesize = layout.size.x;
  this.actuallyDrawHexes = this.areHexesBigEnough(renderer.getScale(), this.tilesize);
}
TileRenderer2D.prototype = Object.create(TileRenderer.prototype);

TileRenderer2D.prototype.areHexesBigEnough = function(zoomScale, hex_size) {

  if (zoomScale > hex_size/350) {
    return true;
  } else {
    return false;
  }

}
TileRenderer2D.prototype.drawTile = function(hex,tile) {
  
  var style = new RenderStyle();  

  //analyze tile
  var height = Math.floor(tile.elevation);
  style.fill_color = this.mapColors(height);

  //draw ground
  if (this.actuallyDrawHexes) {
    this.hex_renderer.drawHex(hex, style);
  } else {
    var point = this.hex_renderer.hexToPoint(hex);
    this.hex_renderer.renderer.drawDot(point, this.tilesize*1.73, style);
  }
  var position = this.hex_renderer.hexToPoint(hex);

  //wind arrows
  var wind_direction = tile.wind;
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
var greenscale_colors = function (i) {

  let color_scheme = 'deprecated';

  if (color_scheme == 'space') {
    var spacescale = ['#000','#000','#ccc','#222','#222', '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000', '#000','#000','#000','#000','#000',
                      '#000','#000','#000','#000','#000', '#000','#000','#000','#000','#000',
                      '#000','#000',];
     return spacescale[i];
   }

  if (color_scheme == 'galaxy') {
    var galaxyscale = ['#000','#000','#dd0','#222','#222', '#000','#000','#000','#000','#000',
                       '#000','#000','#000','#000','#000', '#000','#000','#000','#000','#000',
                       '#000','#000','#000','#000','#000', '#000','#000','#000','#000','#000',
                       '#000','#000',];
     return galaxyscale[i];
   }

  if (color_scheme == 'earth') {
      var greenscale = ['#005','#00D','#AA3','#080','#062', '#052','#042','#032','#020','#010',
                        '#110','#210','#410','#420','#777', '#777','#777','#888','#888','#888',
                        '#FFF','#FFF','#FFF','#FFF','#FFF', '#FFF','#FFF','#FFF','#FFF','#FFF',
                        '#FFF','#FFF'];
     return greenscale[i];
   }

  var greenscale = ['#005','#00D','#AA3','#080','#062', '#052','#042','#032','#020','#010',
                    '#110','#210','#410','#420','#777', '#777','#777','#888','#888','#888',
                    '#FFF','#FFF','#FFF','#FFF','#FFF', '#FFF','#FFF','#FFF','#FFF','#FFF',
                    '#FFF','#FFF'];

  return greenscale[i];  
}

