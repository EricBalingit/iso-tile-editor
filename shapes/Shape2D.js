define ( function ( require, exports, module ) {
    
    var serialize = require ( '../oop/opp' ).serialize;
    
    function Shape2D ( stroke, fill, strokeweight, scale, segments ) {
        this.stroke = stroke;
        this.fill = fill,
        this.strokeweight = strokeweight;
        this.scale = scale;
        this.segments = segments;
    }
    
    Shape2D.prototype.toString = function toString () {
        return serialize ( this );
    };
    
    module.exports = Shape2D;
    
} );