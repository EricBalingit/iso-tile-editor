define ( function ( require, exports, module ) {
    
    var Vec3D = require ( "Vec3D" );
    
    /**
     * @syntax  new Rotation ( w, x, y, z ) - creates a new quaternion rotation
     *          from w, x, y, and z components
     * @syntax  new Rotation ( x, y, z ) - creates a new quaternion rotation from
     *          a Euler rotation in X->Y->Z order, if the order should different
     *          then x, y and z parameters must be transformed accordingly
     * @syntax  new Rotation ( v, a ) - create a quaternion rotation from an axis
     *          {Vec3D} v and an angle a in radians.  Note that v will be
     *          normalized in place, if this is not the behavior you want then pass
     *          a copy of the axis vector
     * @syntax  new Rotation ( r ) - creates a new quaternion rotation from an
     *          existing rotation
     * 
     * Difference between Set and Put operations
     * =========================================
     * A set operation, such as e.g. r.setMult ( q ), performs the operation
     * then computes the rotation matrix of the resulting rotation - this
     * prepares the computed rotation for efficently performing rotations.
     * 
     * A put operation, on the other hand, does not compute the resulting
     * rotation matrix of the computed rotation.  Any attempted rotations
     * after a put operation should be deemed invalid.  Thus put operations
     * are used for temporary, intermediate computations that are not needed
     * directly for performing rotations, but rather are required to compute
     * a subsequent rotation that will be used for performing rotations.
     * This allows computations involving rotations to be performed
     * efficiently while saving the more expensive step of computing the
     * final rotation matrix for the end of a series of operations.
     */
    function Rotation ( w, x, y, z ) {
        var l = arguments.length;
        if ( l === 1 ) {
            this.mx = w.mx.get ();
            this.my = w.my.get ();
            this.mz = w.mz.get ();
            this.put ( w );
        } else {
            this.mx = new Vec3D ();
            this.my = new Vec3D ();
            this.mz = new Vec3D ();
            if ( l === 4 ) {
                this.set ( w, x, y, z );
            } else if ( l === 3 ) {
                this.setEuler ( w, x, y );
            } else if ( l === 2 ) {
                this.setAxisAngle ( w, x );
            } else {
                this.set ( 1.0, 0.0, 0.0, 0.0 );
            }
        }
    }
    
    /**
     * 
     */
    Rotation.prototype.computeMatrix = function () {
        var w = this.w, x = this.x, y = this.y, z = this.z,
            ww = w * w, wx = w * x, wy = w * y, wz = w * z,
            xx = x * x, xy = x * y, xz = x * z,
            yy = y * y, yz = y * z,
            zz = z * z;
        
        wx = wx + wx;   wy = wy + wy;   wz = wz + wz;
        xy = xy + xy;   xz = xz + xz;   yz = yz + yz;
        
        this.mx.set ( ww+xx-yy-zz,  xy - wz,        wy + xz     );
        this.my.set ( xy + wz,      ww-xx+yy-zz,    yz - wx     );
        this.mz.set ( xz - wy,      wx + yz,        ww-xx-yy+zz );
    };
    
    /**
     * 
     */
    Rotation.prototype.get = function () {
        return new Rotation ( this );
    };
    
    /**
     * 
     */
    Rotation.prototype.normalize = function () {
        var w = this.w, x = this.x, y = this.y, z = this.z,
            il = 1.0 / Math.sqrt ( w * w + x * x + y * y + z * z );
        
        this.set ( w * il, x * il, y * il, z * il );
    };
    
    /**
     * 
     */
    Rotation.prototype.put = function ( w, x, y, z ) {
        if ( arguments.length === 1 ) {
            z = w.z || w [ 3 ] || 0;
            y = w.y || w [ 2 ] || 0;
            x = w.x || w [ 1 ] || 0;
            w = w.w || w [ 0 ] || 0;
        }
        
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
    };
    
    /**
     * 
     */
    Rotation.prototype.putAxisAngle = function ( v, a ) {
        v.normalize();
        var ha = 0.5 * a,
            hc = Math.cos ( ha ),
            hs = Math.sin ( ha );
        
        this.put ( hc, v.x * hs, v.y * hs, v.z * hs );
    };
    
    /**
     * 
     */
    Rotation.prototype.putConjugate = function ( q ) {
        var t = q || this;
        t.put ( this.w, -this.x, -this.y, -this.z );
    };
    
    /**
     * 
     */
    Rotation.prototype.putEuler = function ( x, y, z, reversed ) {
        
        x = x * 0.5;
        y = y * 0.5;
        z = z * 0.5;
        
        var cx = Math.cos ( x ), sx = Math.sin ( x ),
            cy = Math.cos ( y ), sy = Math.sin ( y ),
            cz = Math.cos ( z ), sz = Math.sin ( z );
        
        if ( reversed ) {
            this.put (
                cx * cy * cz + sx * sy * sz,
                sx * cy * cz - cx * sy * sz,
                cx * sy * cz + sx * cy * sz,
                cx * cy * sz - sx * sy * cz
            );
        } else {
        
            this.put (
                cx * cy * cz - sx * sy * sz,
                sx * cy * cz + cx * sy * sz,
                cx * sy * cz - sx * cy * sz,
                cx * cy * sz + sx * sy * cz
            );
        }
        
        return this;
    };
    
    /**
     * 
     */
    Rotation.prototype.putInverse = function ( q ) {
        var t = q || this,
            w = this.w, x = this.x, y = this.y, z = this.z,
            i2 = 1.0 / ( w * w + x * x + y * y + z * z );
        
        t.put ( w * i2, -x * i2, -y * i2, -z * i2 );
    };
    
    /**
     * 
     */
    Rotation.prototype.putMult = function ( q, q2 ) {
        
        var t = q2 || this,
            w = this.w, x = this.x, y = this.y, z = this.z,
            qw = q.w, qx = q.x, qy = q.y, qz = q.z;
        
        t.put ( 
            qw * w -(qx * x + qy * y + qz * z),
            qw * x + qx * w - qy * z + qz * y,
            qw * y + qx * z + qy * w - qz * x,
            qw * z - qx * y + qy * x + qz * w
        );
    };
    
    /**
     * 
     */
    Rotation.prototype.rotate = ( function () {
        var p = new Vec3D ();
        return function ( x, y, z ) {
            var l = arguments.length;
            
            if ( l === 3 ) {
                p.set ( x, y, z );
            } else {
                p.set ( x );
            }
            
            p.set ( p.dot ( this.mx ), p.dot ( this.my ), p.dot ( this.mz ) );
            
            if ( l === 2 ) {
                y.set ( p );
            } else {
                return new Vec3D ( p.x, p.y, p.z );
            }
        };
    } ) ();
    
    /**
     * 
     */
    Rotation.prototype.set = function ( w, x, y, z ) {
        if ( arguments.length === 1 ) {
            z = w.z || w [ 3 ] || 0;
            y = w.y || w [ 2 ] || 0;
            x = w.x || w [ 1 ] || 0;
            w = w.w || w [ 0 ] || 0;
        }
        
        this.w = w;
        this.x = x;
        this.y = y;
        this.z = z;
        
        this.computeMatrix ();
    };
    
    /**
     * 
     */
    Rotation.prototype.setAxisAngle = function ( v, a ) {
        v.normalize();
        var ha = 0.5 * a,
            hc = Math.cos ( ha ),
            hs = Math.sin ( ha );
        
        this.set ( hc, v.x * hs, v.y * hs, v.z * hs );
    };
    
    /**
     * 
     */
    Rotation.prototype.setConjugate = function ( q ) {
        var t = q || this;
        t.set ( this.w, -this.x, -this.y, -this.z );
    };
    
    /** rotation order taken from cannon.js:
     * http://schteppe.github.io/cannon.js/docs/files/src_math_Quaternion.js.html
     */
    Rotation.prototype.setEuler = function ( x, y, z, reversed ) {
        
        x = x * 0.5;
        y = y * 0.5;
        z = z * 0.5;
        
        var cx = Math.cos ( x ), sx = Math.sin ( x ),
            cy = Math.cos ( y ), sy = Math.sin ( y ),
            cz = Math.cos ( z ), sz = Math.sin ( z );
        
        //   Important! -> Z-Y-X ORDER
        // w = c1 * c2 * c3 + s1 * s2 * s3;
        // x = s1 * c2 * c3 - c1 * s2 * s3;
        // y = c1 * s2 * c3 + s1 * c2 * s3;
        // z = c1 * c2 * s3 - s1 * s2 * c3;
        // 
        
        if ( reversed ) {
            this.set (
                cx * cy * cz + sx * sy * sz,
                sx * cy * cz - cx * sy * sz,
                cx * sy * cz + sx * cy * sz,
                cx * cy * sz - sx * sy * cz
            );
        } else {
        
        //  Important! -> X-Y-Z ORDER
        // w = c1 * c2 * c3 - s1 * s2 * s3;
        // x = s1 * c2 * c3 + c1 * s2 * s3;
        // y = c1 * s2 * c3 - s1 * c2 * s3;
        // z = c1 * c2 * s3 + s1 * s2 * c3;
        // 
            this.set (
                cx * cy * cz - sx * sy * sz,
                sx * cy * cz + cx * sy * sz,
                cx * sy * cz - sx * cy * sz,
                cx * cy * sz + sx * sy * cz
            );
        }
        
        return this;
    };
    
    /**
     * 
     */
    Rotation.prototype.setInverse = function ( q ) {
        var t = q || this,
            w = this.w, x = this.x, y = this.y, z = this.z,
            i2 = 1.0 / ( w * w + x * x + y * y + z * z );
        
        t.set ( w * i2, -x * i2, -y * i2, -z * i2 );
    };
    
    /**
     * 
     */
    Rotation.prototype.setMult = function ( q, q2 ) {
        
        var t = q2 || this,
            w = this.w, x = this.x, y = this.y, z = this.z,
            qw = q.w, qx = q.x, qy = q.y, qz = q.z;
        
        t.set ( 
            qw * w -(qx * x + qy * y + qz * z),
            qw * x + qx * w - qy * z + qz * y,
            qw * y + qx * z + qy * w - qz * x,
            qw * z - qx * y + qy * x + qz * w
        );
    };
    
    /**
     * 
     */
    Rotation.prototype.toArray = function () {
        return [ this.w, this.x, this.y, this.z ];
    };
    
    /**
     * 
     */
    Rotation.prototype.toString = function () {
        return "[" + this.toArray () + "]";
    };
    
    module.exports = Rotation;

} );