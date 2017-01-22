define ( function ( require, exports, module ) {
    
    var Vec3D = require ( 'Vec3D' ),
        serialize = require ( '../oop/oop' ).serialize;
    
    module.exports = Rotation;
    
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
            this.nx = w.nx.get ();
            this.ny = w.ny.get ();
            this.nz = w.nz.get ();
            this.put ( w );
        } else {
            this.mx = new Vec3D ();
            this.my = new Vec3D ();
            this.mz = new Vec3D ();
            this.nx = new Vec3D ();
            this.ny = new Vec3D ();
            this.nz = new Vec3D ();
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
    
    ( function ( proto ) {
        
        var p = new Vec3D ();
        
        /**
         * 
         */
        proto.computeMatrix = function () {
            var mx = this.mx, my = this.my, mz = this.mz,
                w = this.w, x = this.x, y = this.y, z = this.z,
                ww = w * w, wx = w * x, wy = w * y, wz = w * z,
                xx = x * x, xy = x * y, xz = x * z,
                yy = y * y, yz = y * z,
                zz = z * z;
            
            wx = wx + wx;   wy = wy + wy;   wz = wz + wz;
            xy = xy + xy;   xz = xz + xz;   yz = yz + yz;
            
            mx.set ( ww+xx-yy-zz,  xy - wz,        wy + xz     );
            my.set ( xy + wz,      ww-xx+yy-zz,    yz - wx     );
            mz.set ( xz - wy,      wx + yz,        ww-xx-yy+zz );
            
            // the orthogonal vectors are already built into the
            // rotation matrix, this way we can simply borrow them
            // if we need them
            this.nx.set ( mx.x, my.x, mz.x );
            this.ny.set ( mx.y, my.y, mz.y );
            this.nz.set ( mx.z, my.z, mz.z );
            
        };
        
        /**
         * 
         */
        proto.get = function () {
            return new Rotation ( this );
        };
        
        /**
         * 
         */
        proto.normalize = function () {
            var w = this.w, x = this.x, y = this.y, z = this.z,
                il = 1.0 / Math.sqrt ( w * w + x * x + y * y + z * z );
            
            this.set ( w * il, x * il, y * il, z * il );
        };
        
        /**
         * 
         */
        proto.put = function ( w, x, y, z ) {
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
        proto.putAxisAngle = function ( v, a ) {
            v.normalize();
            var ha = 0.5 * a,
                hc = Math.cos ( ha ),
                hs = Math.sin ( ha );
            
            this.put ( hc, v.x * hs, v.y * hs, v.z * hs );
        };
        
        /**
         * 
         */
        proto.putConjugate = function ( q ) {
            var t = q || this;
            t.put ( this.w, -this.x, -this.y, -this.z );
        };
        
        /**
         * 
         */
        proto.putEuler = function ( x, y, z, reversed ) {
            
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
        proto.putInverse = function ( q ) {
            var t = q || this,
                w = this.w, x = this.x, y = this.y, z = this.z,
                i2 = 1.0 / ( w * w + x * x + y * y + z * z );
            
            t.put ( w * i2, -x * i2, -y * i2, -z * i2 );
        };
        
        /**
         * 
         */
        proto.putMult = function ( q, q2 ) {
            
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
        
        proto.putMultEuler = function ( x, y, z, reversed, q2 ) {
            
            x = x * 0.5;
            y = y * 0.5;
            z = z * 0.5;
            
            var cx = Math.cos ( x ), sx = Math.sin ( x ),
                cy = Math.cos ( y ), sy = Math.sin ( y ),
                cz = Math.cos ( z ), sz = Math.sin ( z ),
                t = q2 || this,
                w,
                qw, qx, qy, qz;
            
            if ( reversed ) {
                qw = cx * cy * cz + sx * sy * sz;
                qx = sx * cy * cz - cx * sy * sz;
                qy = cx * sy * cz + sx * cy * sz;
                qz = cx * cy * sz - sx * sy * cz;
            } else {
                qw = cx * cy * cz - sx * sy * sz;
                qx = sx * cy * cz + cx * sy * sz;
                qy = cx * sy * cz - sx * cy * sz;
                qz = cx * cy * sz + sx * sy * cz;
            }
            
            w = this.w;
            x = this.x;
            y = this.y;
            z = this.z;
            
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
        proto.rotate = function ( x, y, z ) {
            var l = arguments.length, q, r;
            
            if ( l === 3 ) {
                p.set ( x, y, z );
                q = p;
                r = p.get ();
            } else if ( l === 2 ) {
                q = x;
                r = y;
            } else {
                q = x;
                r = p.get ();
            }
            
            r.set ( q.dot ( this.mx ), q.dot ( this.my ), q.dot ( this.mz ) );
            
            return r;
        };

        /**
         * 
         */
        proto.set = function ( w, x, y, z ) {
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
        proto.setAxisAngle = function ( v, a ) {
            v.normalize();
            var ha = 0.5 * a,
                hc = Math.cos ( ha ),
                hs = Math.sin ( ha );
            
            this.set ( hc, v.x * hs, v.y * hs, v.z * hs );
        };
        
        /**
         * 
         */
        proto.setConjugate = function ( q ) {
            var t = q || this;
            t.set ( this.w, -this.x, -this.y, -this.z );
        };
        
        /** rotation order taken from cannon.js:
         * http://schteppe.github.io/cannon.js/docs/files/src_math_Quaternion.js.html
         */
        proto.setEuler = function ( x, y, z, reversed ) {
            
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
        proto.setInverse = function ( q ) {
            var t = q || this,
                w = this.w, x = this.x, y = this.y, z = this.z,
                i2 = 1.0 / ( w * w + x * x + y * y + z * z );
            
            t.set ( w * i2, -x * i2, -y * i2, -z * i2 );
        };
        
        /**
         * 
         */
        proto.setMult = function ( q, q2 ) {
            
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
        
        proto.setMultEuler = function ( x, y, z, reversed, q2 ) {
            
            x = x * 0.5;
            y = y * 0.5;
            z = z * 0.5;
            
            var cx = Math.cos ( x ), sx = Math.sin ( x ),
                cy = Math.cos ( y ), sy = Math.sin ( y ),
                cz = Math.cos ( z ), sz = Math.sin ( z ),
                t = q2 || this,
                w,
                qw, qx, qy, qz;
            
            if ( reversed ) {
                qw = cx * cy * cz + sx * sy * sz;
                qx = sx * cy * cz - cx * sy * sz;
                qy = cx * sy * cz + sx * cy * sz;
                qz = cx * cy * sz - sx * sy * cz;
            } else {
                qw = cx * cy * cz - sx * sy * sz;
                qx = sx * cy * cz + cx * sy * sz;
                qy = cx * sy * cz - sx * cy * sz;
                qz = cx * cy * sz + sx * sy * cz;
            }
            
            w = this.w;
            x = this.x;
            y = this.y;
            z = this.z;
            
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
        proto.toArray = function () {
            return [ this.w, this.x, this.y, this.z ];
        };
        
        /**
         * 
         */
        proto.toString = function () {
            return serialize ( this );
        };
    
    } ) ( Rotation.prototype );

} );