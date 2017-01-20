define ( function ( require, exports, module ) {
    
    var math = require ( '../math/*'),
        rgba = math.color.rgba,
        Vec3D = math.Vec3D,
        Rotation = math.Rotation,
        bezierPoint = math.bezierPoint,
        quadraticPoint = math.quadraticPoint,
        serialize = require ( '../oop/oop' ).serialize;
    
    /**
     * Interactive 3D planar shapes require 3 different representations
     * of their data:
     *  1.  a 2D path because that's how they are defined ( shape2D.segments )
     *  2.  a 3D spline which carries a 2D projection of the shape
     *      for clipping so we can interact by where the shape exists
     *      on the screen
     *  3.  a 3D path because that's what we transform to generate the
     *      3D spline representation, which is nothing more than a flat
     *      array with and extra z = 0 for each point in the 2D path
     */
    var Shape3D = function ( shape2D, position, rotation ) {
        
        this.shape2D = shape2D;
        this.position = position;
        this.rotation = rotation;
        this.localEuler = new Vec3D ( 0, 0, 0 );
        this.globalEuler = new Vec3D ( 0, 0, 0 );
        this.shape = [];
        this.clip = [];
        
        this.localRotationChanged = this.globalRotationChanged = false;
        
        this.update ();
    };
    
    ( function ( proto ) {
        
        var p = new Vec3D (), v = new Vec3D (), q = new Rotation (), r = new Rotation ();
        
        proto.render = function render ( ctx ) {
            var segments = this.segments, shape = this.shape,
                seg, i, l = segments.length, t = 2, s,
                shape2D = this.shape2D, stroke = false, fill = false;
            
            ctx.save ();
                
                if ( shape2D.strokeweight && shape2D.stroke ) {
                    ctx.strokeStyle = rgba ( shape2D.stroke );
                    ctx.lineWidth = shape2D.strokeweight;
                    stroke = true;
                }
                
                if ( shape2D.fill ) {
                    ctx.fillStyle = rgba ( shape2D.fill );
                }
                
                ctx.beginPath ();
                ctx.moveTo ( segments [ 0 ] [ 0 ], segments [ 0 ] [ 1 ] );
                for ( i = 1; i < l; i = i + 1 ) {
                    seg = segments [ i ];
                    s = seg.length;
                    
                    if ( s === 2 ) {
                        ctx.lineTo ( shape [ t + 0 ], shape [ t + 1 ] );
                    } else if ( s === 4 ) {
                        ctx.quadraticCurveTo(
                            shape [ t + 0 ], shape [ t + 1 ],
                            shape [ t + 2 ], shape [ t + 3 ]
                        );
                    } else {
                        ctx.bezierCurveTo (
                            shape [ t + 0 ], shape [ t + 1 ],
                            shape [ t + 2 ], shape [ t + 3 ],
                            shape [ t + 4 ], shape [ t + 5 ]
                        );
                    }
                    
                    t = t + s;
                }
                
                if ( fill ) {
                    ctx.fill ();
                }
                
                if ( stroke ) {
                    ctx.stroke ();
                }
                
            ctx.restore ();
        };
        
        proto.rotateLocalEuler = function rotateLocalEuler ( x, y, z ) {
            this.localEuler.add.apply ( null, arguments );
            this.localRotationChanged = true;
        };
        
        proto.rotateGlobalEuler = function rotateGlobalEuler ( x, y, z ) {
            this.globalEuler.add.apply ( null, arguments );
            this.globalRotationChanged = true;
        };
        
        proto.toString = function toString () {
            serialize ( this );
        };
        
        proto.update = function update ( camera ) {
            
            var scale = this.shape2D.scale, rotation = this.rotation,
                local = this.localEuler, global = this.globalEuler,
                segments = this.segments, clip = this.clip,
                shape = this.shape, position = this.position,
                l = segments.length, i, j, t, seg,
                sx = scale.x, sy = scale.y, // scale.z is never used since shapes are planar
                ax, ay, bx, by, cx, cy, dx, dy, px, py, lx, ly;
            
            shape.length = 0;
            clip.length = 0;
            
            p.set ( position );
            camera.rotate ( p, v );
            lx = v.x; ly = v.y;
            
            var newRotation = false;
            if ( this.localRotationChanged ) {
                q.putEuler( local.x, local.y, local.z, false );
                newRotation = true;
                this.localRotationChanged = false;
            } else {
                q.put ( this.localRotation );
            }
            if ( this.globalRotationChanged ) {
                r.putEuler ( global.x, global.y, global.z, false );
                newRotation = true;
                this.globalRotationChanged = false;
            } else {
                r.put ( this.globalRotation );
            }
            if ( newRotation ) {
                // q * r * camera -> r
                camera.setMult ( r.putMult ( q, r ), r );
            } else {
                // rotation * camera -> r
                camera.setMult ( rotation, r );
            }
            
            for ( i = 0; i < l; i = i + 1 ) {
                
                seg = segments [ i ];
                
                if ( seg.length === 2 ) {
                    ax = px = seg [ 0 ]; ay = py = seg [ 1 ];
                    p.set ( px, py, 0 );
                    r.rotate ( p, v );
                    shape.push ( ax = sx * v.x + lx, ay = sy * v.y + ly );
                    clip.push ( ax, ay );
                } else if ( seg.length === 4 ) {
                    ax = px;        ay = py;
                    bx = seg [ 0 ]; by = seg [ 1 ];
                    cx = seg [ 2 ]; cy = seg [ 3 ];
                    px = cx;        py = cy;
                    
                    p.set ( ax, ay, 0 );
                    r.rotate ( p, v );
                    shape.push ( ax = sx * v.x + ly, ay = sy * v.y + ly );
                    
                    p.set ( bx, by, 0 );
                    r.rotate ( p, v );
                    shape.push ( bx = sx * v.x + lx, by = sy * v.y + ly );
                    
                    p.set ( cx, cy, 0 );
                    r.rotate ( p, v );
                    shape.push ( cx = sx * v.x + lx, cy = sy * v.y + ly );
                    
                    for ( j = 0; j <= 16; j = j + 1 ) {
                        t = j / 16;
                        clip.push (
                            quadraticPoint ( ax, bx, cx, dx, t ),
                            quadraticPoint ( ay, by, cy, dy, t )
                        );
                    }
                    
                } else {
                    ax = px;        ay = py;
                    bx = seg [ 0 ]; by = seg [ 1 ];
                    cx = seg [ 2 ]; cy = seg [ 3 ];
                    dx = seg [ 4 ]; dy = seg [ 5 ];
                    px = dx;        py = dy;
                    
                    p.set ( ax, ay, 0 );
                    r.rotate ( p, v );
                    shape.push ( ax = sx * v.x + ly, ay = sy * v.y + ly );
                    
                    p.set ( bx, by, 0 );
                    r.rotate ( p, v );
                    shape.push ( bx = sx * v.x + lx, by = sy * v.y + ly );
                    
                    p.set ( cx, cy, 0 );
                    r.rotate ( p, v );
                    shape.push ( cx = sx * v.x + lx, cy = sy * v.y + ly );
                    
                    p.set ( dx, dy, 0 );
                    r.rotate ( p, v );
                    shape.push ( dx = sx * v.x + lx, dy = sy * v.y + ly );
                    
                    for ( j = 0; j <= 16; j = j + 1 ) {
                        t = j / 16;
                        clip.push (
                            bezierPoint ( ax, bx, cx, dx, t ),
                            bezierPoint ( ay, by, cy, dy, t )
                        );
                    }
                }
            }
        };
        
    } ) ( Shape3D.prototype );
    
} );