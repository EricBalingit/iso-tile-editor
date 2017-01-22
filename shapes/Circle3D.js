define ( function ( require, exports, module ) {
    
    var extend = require ( '../oop/opp' ).extend,
        arrays = require ( '..oop/arrays' ),
        frozenJaggedCopy = arrays.frozenJaggedCopy,
        Shape3D = require ( 'Shape3D' ),
        K = require ( '../math/bezier' ).K * 0.5;
    
    
    module.exports = Circle3D;
    
    extend ( Circle3D, Shape3D );
    
    function Circle3D ( stroke, fill, strokeweight, scale, position, localEuler, globalEuler, radius ) {
        
        // not required but safe
        this.radius = Array.prototype.pop.call ( arguments );
        
        Array.prototype.push.call ( arguments, frozenJaggedCopy ( this.segments ) );
        
        Circle3D.prototype._super_.constructor.call ( this, arguments );
    }
    
    ( function ( proto ) {
        
        // zero radius but with quadratic segments in place
        // read-only, non-extensible, this data explicitly represents
        // shape information for this class of polygon should not be modified
        proto.segments = frozenJaggedCopy ( [
            [0.5, 0],
            [0.5, K, K, 0.5, 0, 0.5],
            [-K, 0.5, -0.5, K, -0.5, 0],
            [-0.5, -K, -K, -0.5, 0, -0.5],
            [K, -0.5, 0.5, -K, 0.5, 0]
        ] );
        
    } ) ( Circle3D.prototype );
    
} );