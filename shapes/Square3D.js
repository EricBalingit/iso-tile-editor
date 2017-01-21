define ( function ( require, exports, module ) {
    
    var oop = require ( '../oop/opp' ),
        extend = oop.extend,
        frozenJaggedCopy = oop.frozenJaggedCopy,
        Shape2D = require ( 'Shape2D' ),
        Shape3D = require ( 'Shape3D' );
    
    extend ( Square3D, Shape3D );
    
    function Square3D ( stroke, fill, strokeweight, position, localEuler, globalEuler, scale ) {
        
        // this shape is immutable
        this.segments = frozenJaggedCopy ( Square3D.prototype.segments );
        
        // Shape3D.prototype.update() ( called from Shape3D constructor )
        // requires this.segments
        Square3D.prototype._super_.constructor.call (
            this,
            new Shape2D ( stroke, fill, strokeweight, scale,  this.segments ),
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
            [-0.5, -0.5],
            [0.5, -0.5],
            [0.5, 0.5],
            [-0.5, 0.5],
            [-0.5, -0.5]
        ] );
        
    } ) ( Square3D.prototype );
    
    module.exports = Square3D;
    
} );