define ( function ( require, exports, module ) {
    
    var oop = require ( '../oop/opp' ),
        extend = oop.extend,
        arrays = require ( '..oop/arrays' ),
        frozenJaggedCopy = arrays.frozenJaggedCopy,
        Shape3D = require ( 'Shape3D' );
    
    
    module.exports = Square3D;
    
    extend ( Square3D, Shape3D );
    
    function Square3D ( stroke, fill, strokeweight, scale, position, localEuler, globalEuler ) {
        
        Array.prototype.push.call ( arguments, frozenJaggedCopy ( this.segments ) );
        
        Square3D.prototype._super_.constructor.call ( this, arguments );
    }
    
    ( function ( proto ) {
        
        // zero radius but with quadratic segments in place
        // read-only, non-extensible, this data explicitly represents
        // shape information for this class of polygon should not be modified
        proto.segments = frozenJaggedCopy ( [
            [-0.5, -0.5],
            [0.5, -0.5],
            [0.5, 0.5],
            [-0.5, 0.5],
            [-0.5, -0.5]
        ] );
        
    } ) ( Square3D.prototype );
    
} );