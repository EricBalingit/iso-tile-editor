define ( function ( require, exports, module ) {
    
    var math = require ( '../math/math'),
        rgba = math.color.rgba,
        Vec3D = math.Vec3D,
        Rotation = math.Rotation,
        cubicPoint = math.bezier.cubicPoint,
        quadraticPoint = math.bezier.quadraticPoint,
        sealedJaggedCopy = require ( '../oop/arrays' ).sealedJaggedCopy,
        Bounds2D = require ( 'Bounds2D' ),
        Shape2D = require ( 'Shape2D' );
    
    var Shape3D = function ( stroke, fill, strokeweight, scale, position, localEuler, globalEuler, segments ) {
        
        if ( this.constructor === Shape3D ) {
            throw new TypeError ( 'Shape3D is abstract and must be extended by an implementing class' );
        }
        
        this.shape2D = new Shape2D ( stroke, fill, strokeweight, scale, segments );
        this.position = position;
        this.localEuler = localEuler;
        this.globalEuler = globalEuler;
        this.localRotation = new Rotation ( localEuler.x, localEuler.y, localEuler.z );
        this.globalRotation = new Rotation ( globalEuler.x, globalEuler.y, globalEuler.z );
        
        // copy the global rotation
        this.rotation = new Rotation ( this.globalRotation );
        // multiply by the local rotation and compute the rotation matrix
        this.rotation.setMult ( this.localRotation );
        this.shape = [];
        this.clip = [];
        this.localRotationChanged = this.globalRotationChanged = false;
        
        this.update ();
        
        this.bounds = this.getBounds ();
    };
    
    ( function ( proto ) {
        
        var p = new Vec3D (), v = new Vec3D (), r = new Rotation ();
        
        // @override
        proto.segments = [];
        
        proto.getBounds = function getBounds () {
            var s = this.shape ();
            
            var top = Infinity, right = -Infinity, bottom = -Infinity, left = Infinity,
                x, y;
            
            for ( var i = 0, l = s.length; i < l; i = i + 2 ) {
                x = s [ i + 0 ];
                y = s [ i + 1 ];
                if ( y < top ) {
                    top = x;
                }
                if ( y > bottom ) {
                    bottom = y;
                }
                if ( x < left ) {
                    left = x;
                }
                if ( x > right ) {
                    right = x;
                }
            }
            
            return new Bounds2D ( top, right, bottom, left );
        };
        
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
                    fill = true;
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
            var euler = this.localEuler, local = this.localRotation;
            euler.add.apply ( null, arguments );
            local.setEuler ( euler.x, euler.y, euler.z );
            this.globalRotation.setMult ( local, this.rotation );
        };
        
        proto.rotateGlobalEuler = function rotateGlobalEuler ( x, y, z ) {
            var euler = this.globaEuler, global = this.globalRotation;
            euler.add.apply ( null, arguments );
            global.setEuler ( euler.x, euler.y, euler.z );
            global.setMult ( this.localRotation, this.rotation );
        };
        
        proto.update = function update ( camera ) {
            
            var shape2D = this.shape2D, scale = shape2D.scale, segments = shape2D.segments,
                rotation = this.rotation, clip = this.clip,
                shape = this.shape, position = this.position,
                l = segments.length, i, j, t, seg,
                sx = scale.x, sy = scale.y, // scale.z is never used since shapes are planar
                ax, ay, bx, by, cx, cy, dx, dy, px, py, lx, ly,
                top = Infinity, right = -Infinity, bottom = -Infinity, left = Infinity,
                x, y, bounds = this.bounds;
            
            shape.length = 0;
            clip.length = 0;
            
            p.set ( position );
            camera.rotate ( p, v );
            lx = v.x; ly = v.y;
            
            // apply the camera rotation to the current rotation
            
            // rotation * camera -> r
            camera.setMult ( rotation, r );
            
            for ( i = 0; i < l; i = i + 1 ) {
                
                seg = segments [ i ];
                
                if ( seg.length === 2 ) {
                    
                    ax = px = seg [ 0 ]; ay = py = seg [ 1 ];
                    p.set ( px, py, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = sx * v.x + lx, y = sy * v.y + ly );
                    clip.push ( x, y );
                    
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                } else if ( seg.length === 4 ) {
                    
                    ax = px;        ay = py;
                    bx = seg [ 0 ]; by = seg [ 1 ];
                    cx = seg [ 2 ]; cy = seg [ 3 ];
                    px = cx;        py = cy;
                    
                    p.set ( ax, ay, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = sx * v.x + ly, y = sy * v.y + ly );
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                    p.set ( bx, by, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = sx * v.x + lx, y = sy * v.y + ly );
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                    p.set ( cx, cy, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = sx * v.x + lx, y = sy * v.y + ly );
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
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
                    shape.push ( x = sx * v.x + ly, y = sy * v.y + ly );
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                    p.set ( bx, by, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = sx * v.x + lx, y = sy * v.y + ly );
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                    p.set ( cx, cy, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = sx * v.x + lx, y = sy * v.y + ly );
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                    p.set ( dx, dy, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = sx * v.x + lx, y = sy * v.y + ly );
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                    for ( j = 0; j <= 16; j = j + 1 ) {
                        t = j / 16;
                        clip.push (
                            cubicPoint ( ax, bx, cx, dx, t ),
                            cubicPoint ( ay, by, cy, dy, t )
                        );
                    }
                }
            }
            
            bounds.top = top;
            bounds.right = right;
            bounds.bottom = bottom;
            bounds.left = left;
        };
        
        // @mustoverride
        proto.onselect = function onselect ( editor ) {};
        
    } ) ( Shape3D.prototype );
    
} );