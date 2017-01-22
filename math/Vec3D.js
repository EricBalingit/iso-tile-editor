define ( function ( require, exports, module ) {
    
    var serialize = require ( '../oop/oop').serialize;
    
    module.exports = Vec3D;
    
    function Vec3D ( x, y, z ) {
        if ( arguments.length === 1 ) {
            this.x = x.x || 0;
            this.y = x.y || 0;
            this.z = x.z || 0;
        } else {
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }
    }
    
    Vec3D.add =         function add ( v1, v2 ) {
        v1 = v1.get ();
        v1.add ( v2 );
        return v1;
    };
    
    Vec3D.cross =       function cross ( v1, v2 ) {
        v1 = v1.get ();
        v1.cross ( v2 );
        return v1;
    };
    
    Vec3D.dist =        function dist ( v1, v2 ) {
        var x = v2.x - v1.x, y = v2.y - v1.y, z = v2.z - v1.z;
        return Math.sqrt ( x * x + y * y + z * z );
    };
    
    Vec3D.div =         function div ( v1, n ) {
        n = 1 / n;
        v1 = v1.get ();
        v1.mult ( n );
        return v1;
    };
    
    Vec3D.dot =         function dot ( v1, v2 ) {
        return v1.dot ( v2 );
    };
    
    Vec3D.limit =       function limit ( v, n ) {
        var m = v.mag ();
        n = ( m === 0 ? 0 : Math.min ( n, m ) / m );
        v = v.get ();
        v.mult ( n );
        return v;
    };
    
    Vec3D.mult =         function mult ( v1, n ) {
        v1 = v1.get ();
        v1.mult ( n );
        return v1;
    };
    
    Vec3D.normalize =   function normalize ( v ) {
        v = v.get ();
        v.normalize ();
        return v;
    };
    
    Vec3D.rotateZ =     function rotateZ ( v, a ) {
        v = v.get ();
        v.rotateZ ( a );
        return v;
    };
    
    Vec3D.rotateY =     function rotateY ( v, a ) {
        v = v.get ();
        v.rotateY ();
        return v;
    };
    
    Vec3D.rotateX =     function rotateX ( v, a ) {
        v = v.get ();
        v.rotateX ( a );
        return v;
    };
    
    Vec3D.setMag =      function setMag ( v, n ) {
        var m = v.mag ();
        n = ( m === 0 ? 0 : n / m );
        v = v.get ();
        v.mult ( n );
        return v;
    };
    
    Vec3D.sub =         function sub ( v1, v2 ) {
        v1 = v1.get ();
        v1.sub ( v2 );
        return v1;
    };
    
    ( function ( proto ) {
        
        proto.add =         function add ( x, y, z ) {
            var l = arguments.length;
            
            if ( l === 1 ) {
                this.x = this.x + x.x;
                this.y = this.y + x.y;
                this.z = this.z + x.z;
            } else {
                this.x = this.x + x;
                this.y = this.y + y;
                this.z = this.z + z;
            }
        };
        
        proto.cross =       function cross ( vx, vy, vz ) {
            var ux = this.x, uy = this.y, uz = this.z;
            
            if ( arguments.length === 1 ) {
                vz = vx.z;
                vy = vx.y;
                vx = vx.x;
            }
            
            this.x = uy * vz - uz * vy;
            this.y = uz * vx - ux * vz;
            this.z = ux * vy - uy * vx;
        };
        
        proto.dist =        function dist ( v ) {
            var x = v.x - this.x, y = v.y - this.y, z = v.z - this.z;
            return Math.sqrt ( x * x + y * y + z * z );
        };
        
        proto.div =         function div ( n ) {
            n = 1 / ( n || 0 );
            this.x = this.x * n;
            this.y = this.y * n;
            this.z = this.z * n;
        };
        
        proto.dot =         function dot ( x, y, z ) {
            if ( arguments.length === 1 ) {
                return this.x * x.x + this.y * x.y + this.z * x.z;
            }
            
            return this.x * x + this.y * y + this.z * z;
        };
        
        proto.get =         function get () {
            return new Vec3D ( this );
        };
        
        proto.limit =       function limit ( n ) {
            var m = this.mag ();
            n = ( m === 0 ? 0 : Math.min ( n, m ) / m );
            this.mult ( n );
        };
        
        proto.mag =         function mag () {
            var x = this.x, y = this.y, z = this.z;
            return Math.sqrt ( x * x + y * y + z * z );
        };
        
        proto.magSq =       function magSq () {
            var x = this.x, y = this.y, z = this.z;
            return x * x + y * y + z * z;
        };
        
        proto.mult =         function mult ( n ) {
            n = n || 0;
            this.x = this.x * n;
            this.y = this.y * n;
            this.z = this.z * n;
        };
        
        proto.normalize =   function normalize () {
            var x = this.x, y = this.y, z = this.z, m;
            m = 1 / Math.sqrt ( x * x + y * y + z * z );
            this.x = x * m;
            this.y = y * m;
            this.z = z * m;
        };
        
        proto.rotateZ =     function rotateZ ( a ) {
            var c = Math.cos ( a ), s = Math.sin ( a ),
                x = this.x, y = this.y;
            this.x = x * c - y * s;
            this.y = x * s + y * c;
        };
        
        proto.rotateY =     function rotateY ( a ) {
            var c = Math.cos ( a ), s = Math.sin ( a ),
                x = this.x, z = this.z;
            this.z = z * c - x * s;
            this.x = z * s + x * c;
        };
        
        proto.rotateX =     function rotateX ( a ) {
            var c = Math.cos ( a ), s = Math.sin ( a ),
                y = this.x, z = this.z;
            this.y = y * c - z * s;
            this.z = y * s + z * c;
        };
        
        proto.set =         function set ( x, y, z ) {
            if ( arguments.length === 1 ) {
                this.x = x.x || 0;
                this.y = x.y || 0;
                this.z = x.z || 0;
            } else {
                this.x = x || 0;
                this.y = y || 0;
                this.z = z || 0;
            }
        };
        
        proto.setMag =      function setMag ( n ) {
            var m = this.mag ();
            n = ( m === 0 ? 0 : n / m );
            this.mult ( n );
        };
        
        proto.sub =         function sub ( x, y, z ) {
            var l = arguments.length;
            
            if ( l === 1 ) {
                this.x = this.x - x.x;
                this.y = this.y - x.y;
                this.z = this.z - x.z;
            } else {
                this.x = this.x - x;
                this.y = this.y - y;
                this.z = this.z - z;
            }
        };
        
        proto.toString =    function toString () {
            return serialize ( this );
        };
        
    } ) ( Vec3D.prototype );
    
} );