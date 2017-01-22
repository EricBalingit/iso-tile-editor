define ( function ( require, exports, module ) {
    
    exports.cubicPoint = cubicPoint;
    exports.quadraticPoint = quadraticPoint;
    
    // circular arc parameter
    exports.K = 0.551915024494;
    
    function cubicPoint ( a, b, c, d, t ) {
        var x = b - a, y = b - c, z = t * t, w = x + x, v = y + y;
        
        return ( x + v + d - c ) * z * t + ( d - b - w - v - y ) * z + ( w + x ) * t + a;
    }
    
    function quadraticPoint ( a, b, c, t ) {
        var x = b - a;
        
        return ( c - x - b ) * t * t + ( x + x ) * t + a;
    }
    
} );