define ( function ( require, exports, module ) {
    
    function quadraticPoint ( a, b, c, t ) {
        var x = b - a;
        
        return ( c - x - b ) * t * t + ( x + x ) * t + a;
    }
    
    module.exports = quadraticPoint;
    
} );