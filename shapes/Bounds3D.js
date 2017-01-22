define ( function ( require, exports, module ) {
    
    var Vec3D = require ( '../math/Vec3D' );
    
    module.exports = Bounds3D;
    
    function Bounds3D ( top, right, bottom, left ) {
        this.top = top || new Vec3D ();
        this.right = right || new Vec3D ();
        this.bottom = bottom || new Vec3D ();
        this.left = left || new Vec3D ();
    }
    
} );