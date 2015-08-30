
var device = module.exports = { 
  decode: function(array) {
    // discard useless data
    var result = array.filter( function (element, index) {
      return !(index % 2) && index < 20
    }).map(function(element, index){
      // take the lower bits from the byte + 1 to get the number
      var value = parseInt(parseInt(element + 1, 16).toString(2).slice(-4),2);
      return value;
    }).join('');
    return result;
  },
  
  capture: function(buffer, point) {
    point.counter++;
    // capture the 3rd byte
    point.fullBuffer.push(buffer[2]);
    if (point.counter == 22) {
      point.counter = 0
      var result = device.decode(point.fullBuffer);
      point.fullBuffer = []
      console.log('res:' + result);
      return result;
    }
  }
}



