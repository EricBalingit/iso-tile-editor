define ( function ( require, exports, module ) {
    
    function bezierPoint ( a, b, c, d, t ) {
        var x = b - a, y = b - c, z = t * t, w = x + x, v = y + y;
        
        return ( x + v + d - c ) * z * t + ( d - b - w - v - y ) * z + ( w + x ) * t + a;
    }
    
    module.exports = bezierPoint;
    
} );