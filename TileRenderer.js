////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
                                                                
//   TILE RENDERER

/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////

function TileRenderer (hex_renderer, layout) {
  this.hex_renderer = hex_renderer;
  this.tilesize = layout.size.x;
  this.actuallyDrawHexes = this.areHexesBigEnough(hex_renderer.renderer.getScale(), this.tilesize);


}

TileRenderer.prototype.mapColors = function(i) {
  return greenscale_colors(i);  
} 


TileRenderer.prototype.areHexesBigEnough = function(zoomScale, hex_size) {

  if (zoomScale > hex_size/11150) {
    return true;
  } else {
    return false;
  }

}

TileRenderer.prototype.drawTile = function(hex,tile) {
  
  var style = new RenderStyle();  

  //analyze tile
  var height = Math.floor(tile.elevation);
  style.fill_color = this.mapColors(height);

  //draw ground
  //if (this.actuallyDrawHexes) {
    this.hex_renderer.drawHex(hex, style);
  //} else {
   // var point = this.hex_renderer.hexToPoint(hex);
    //this.hex_renderer.renderer.drawDot(point, this.tilesize*1.73, style);
  //}
  //var position = this.hex_renderer.hexToPoint(hex);
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

  var oldgreenscale = ['#005','#00D','#AA3', //ocean coast sand 0 1 2
                    '#080','#062', //grass 3 4
                    '#052','#042','#032','#020', //forest 5 6 7 8
                    '#310','#310','#320', //hills 9 10 11 12 13
                    '#310','#310',
                    '#777', '#777','#777', //mountains 14 15 16
                    '#888','#888','#888', //mountains 17 18 19
                    '#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF','#FFF',]; //ice

  var greenscale = [224,190,61, //ocean coast sand 0 1 2
                    90,100, //grass 3 4
                    100,105,110,120, //forest 5 6 7 8
                    34,35,36,37,38];  //hills 9 10 11 12 13
                    
 return oldgreenscale[i];

  //ice
  if (i >= 20)
    return "hsl(0, 0%, 90%)"; 
  //mountains
  if (i >= 14)
    return "hsl(0, 0%, 50%)"; 
  //land
  return "hsl("+greenscale[i]+", 30%, 50%)"; 

}

