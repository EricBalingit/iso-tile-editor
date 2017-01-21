define ( function ( require, exports, module ) {
    
    var oop = require ( '../oop/opp' ),
        extend = oop.extend,
        sealedJaggedCopy = oop.sealedJaggedCopy,
        frozenJaggedCopy = oop.frozenJaggedCopy,
        Shape2D = require ( 'Shape2D' ),
        Shape3D = require ( 'Shape3D' ),
        Vec3D = require ( '../math/Vec3D' ),
        K = require ( '../math/bezier' ).K * 0.5;
    
    extend ( Circle3D, Shape3D );
    
    function Circle3D ( stroke, fill, strokeweight, diameter, position, localEuler, globalEuler ) {
        
        // this shape is immutable
        this.segments = frozenJaggedCopy ( Circle3D.prototype.segments );
        
        // Shape3D.prototype.update() ( called from Shape3D constructor )
        // requires this.segments
        Circle3D.prototype._super_.constructor.call (
            this,
            new Shape2D ( stroke, fill, strokeweight, new Vec3D ( diameter, diameter, 0 ),  this.segments ),
            position,
            localEuler,
            globalEuler
        );
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
    
    module.exports = Circle3D;
    
} );