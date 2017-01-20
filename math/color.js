define ( function ( require, exports, module ) {
    
    function rgba ( r, g, b, a ) {
        var l = arguments.length;
        
        if ( l === 4 ) {
            return 'rgba(' + [ r, g, b, a ] + ')';
        } else if ( l === 3 ) {
            return 'rgb(' + [ r, g, b ] + ')';
        } else {
            a = r >>> 24 & 255;
            b = r >>> 16 & 255;
            g = r >>> 8  & 255;
            r = r >>> 0  & 255;
            
            if ( a === 255 ) {
                return 'rgb(' + [ r, g, b ] + ')';
            } else {
                return 'rgba(' + [ r, g, b, a ] + ')';
            }
        }
    }
    
    function hsla ( h, s, l, a ) {
       if ( a === 1 ) {
            return 'hsl(' + h + ',' + s + '%,' + l + '%)';
        } else {
            return 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
        }
    }
    
    module.exports.color = rgba;
    module.exports.hsla = hsla;
    
} );