define ( function ( require, exports, module ) {
    
    var extend = require ( '../oop/opp' ).extend,
        arrays = require ( '../oop/arrays' ),
        frozenJaggedCopy = arrays.frozenJaggedCopy,
        sealedJaggedCopy = arrays.sealedJaggedCopy,
        Shape3D = require ( 'Shape3D' );
    
    extend ( Rectangle3D, Shape3D );
    
    function Rectangle3D ( stroke, fill, strokeweight, scale, position, localEuler, globalEuler, radius ) {
        
        // required by @overrides Shape3D.prototype.update called from Shape3D constructor
        this.radius = radius;
        
        arguments [ arguments.length - 1 ] = sealedJaggedCopy ( this.segments );
        
        Rectangle3D.prototype._super_.constructor.apply ( this, arguments );
    }
    
    ( function ( proto ) {
        
        // zero radius but with quadratic segments in place
        // read-only, non-extensible, this data explicitly represents
        // shape information for this class of polygon should not be modified
        proto.segments = frozenJaggedCopy ( [
            [-0.5, -0.5],               // top left end of arc
            [0.5, -0.5],                // top right before arc
            [0.5, -0.5, 0.5, -0.5],     // top right arc
            [0.5, 0.5],                 // bottom right before arc
            [0.5, 0.5, 0.5, 0.5],       // bottom right arc
            [-0.5, 0.5],                // bottom left before arc
            [-0.5, 0.5, -0.5, 0.5],     // bottom left arc
            [-0.5, -0.5],               // top left before arc
            [-0.5, -0.5, -0.5, -0.5],   // top left arc
        ] );
        
        proto.setRadius = function setRadius ( tl, tr, br, bl ) {
            var r = this.radius, l = arguments.length;
            
            if ( l === 1 ) {
                tr = br = bl = tl;
            } else if ( l === 2 ) {
                br = tl;
                bl = tr;
            }
            
            r.top = tl;
            r.right = tr;
            r.bottom = br;
            r.left = bl;
        };
        
        // @overrides Shape3D.prototype.update
        proto.update = function () {
            var r = this.radius, s = this.shape2D.scale, segs = this.segments,
                sx = Math.abs ( s.x ), sy = Math.abs ( s.y ),
                max = 0.5 * Math.min ( sx, sy ),
                rx, ry,
                tl = Math.min ( Math.max ( 0, r.top ), max ),
                tr = Math.min ( Math.max ( 0, r.right ), max ),
                br = Math.min ( Math.max ( 0, r.bottom ), max ),
                bl = Math.min ( Math.max ( 0, r.left ), max );
            
            if ( max === 0 ) {
                tl = tr = br = bl = r.top = r.right = r.bottom = r.left = rx = ry = 0;
            } else {
                r.top = tl;
                r.right = tr;
                r.bottom = br;
                r.left = bl;
                
                if ( sx < sy ) {
                    rx = 0.5;
                    ry = 0.5 * rx / ry;
                } else {
                    ry = 0.5;
                    rx = 0.5 * ry / ry;
                }
                tl = tl / max;
                tr = tr / max;
                br = br / max;
                bl = bl / max;
            }
            
            /**
             * Radii come in the range [ 0, 1 ] based on
             * 0.5 * the minimum dimension, from there
             * we must convert them to half the normal range
             * [ 0, 0.5 ] and set their sign depending on
             * whether they are on a positive or negative
             * axis. We do this because the dimensions
             * are in width and height of the rectangle,
             * which multiplied into [ -0.5, 0.5 ] gives
             * us the correct width and height of the
             * rectangle.  Thus the computation
             * +/- 0.5 * ( 1 - radius ) computes the
             * offest in the normalized range [ -0.5, 0.5 ].
             * 
             *    *  0--------1  *
             * 
             *    7              2
             *    |              |
             *    6              3
             * 
             *    *  5--------4  *
             */
            segs [ 0 ] [ 0 ] = rx * tl - 0.5;   // -x
            segs [ 1 ] [ 0 ] = 0.5 - rx * tr;   // +x
            segs [ 2 ] [ 3 ] = ry * tr - 0.5;   // -y
            segs [ 3 ] [ 1 ] = 0.5 - ry * br;   // +y
            segs [ 4 ] [ 2 ] = 0.5 - rx * br;   // +x
            segs [ 5 ] [ 0 ] = rx * bl - 0.5;   // -x
            segs [ 6 ] [ 3 ] = 0.5 - ry * bl;   // +y
            segs [ 7 ] [ 1 ] = ry * bl - 0.5;   // -y
            
            Shape3D.prototype.update.call ( this );
        };
        
    } ) ( Rectangle3D.prototype );
    
    module.exports = Rectangle3D;
    
} );