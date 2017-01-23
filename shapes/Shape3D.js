define ( function ( require, exports, module ) {
    
    var math = require ( '../math/math'),
        rgba = math.color.rgba,
        Vec3D = math.Vec3D,
        Rotation = math.Rotation,
        cubicPoint = math.bezier.cubicPoint,
        quadraticPoint = math.bezier.quadraticPoint,
        Bounds2D = require ( 'Bounds2D' ),
        Bounds3D = require ( 'Bounds3D' ),
        Shape2D = require ( 'Shape2D' );
    
    
    module.exports = Shape3D;
    
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
        
        if ( !this.controls ) {
            this.controls = [];
        }
        
        this.screenBounds = new Bounds2D ();
        
        this.controlBounds = new Bounds3D ();
        
        this.update ();
    };
    
    ( function ( proto ) {
        
        var p = new Vec3D (), v = new Vec3D (), r = new Rotation ();
        
        // @override
        proto.segments = [];
        
        proto.controlIndices = [];
        
        proto.getBounds = function getBounds () {
            var s = this.shape;
            
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
        
        proto.update = ( function () {
            
            var shape2D, scale, segments, position, rotation, clip, shape,
                l, i, j, t,
                seg, sl, sx, sy,
                ax, ay, bx, by, cx, cy, dx, dy, px, py, lx, ly,
                top, right, bottom, left, ctop, cright, cbottom, cleft,
                x, y, ox, oy, oz,
                bounds, control, controls,
                cmap, clen, cindx, pindx,
                setPoint = function ( px, py ) {
                    p.set ( px * sx, py * sy, 0 );
                    r.rotate ( p, v );
                    shape.push ( x = v.x + lx, y = v.y + ly );
                    
                    // update bounds
                    if ( y < top ) { top = x; }
                    if ( y > bottom ) { bottom = y; }
                    if ( x < left ) { left = x; }
                    if ( x > right ) { right = x; }
                    
                    // update control points
                    if ( cindx < clen && cmap [ cindx ] === pindx ) {
                        rotation.rotate ( p, p );
                        controls [ cindx ].set ( p.x + ox, p.y + oy, p.z + oz );
                        cindx = cindx + 1;
                    }
                    pindx = pindx + 1;
                };
            
            return function update ( camera ) {
                
                shape2D = this.shape2D; scale = shape2D.scale; segments = shape2D.segments;
                rotation = this.rotation; clip = this.clip;
                shape = this.shape; position = this.position;
                l = segments.length;
                sx = scale.x; sy = scale.y; // scale.z is never used since shapes are planar
                top = Infinity; right = -Infinity; bottom = -Infinity; left = Infinity;
                bounds = this.screenBounds; control = this.controlBounds;
                controls = this.controls; cmap = this.controlIndices; clen = controls.length;
                cindx = 0; pindx = 0;
                ctop = control.top;
                cright = control.right;
                cbottom = control.bottom;
                cleft = control.left;
                
                shape.length = 0;
                clip.length = 0;
                
                ox = position.x;
                oy = position.y;
                oz = position.z;
                
                p.set ( position );
                camera.rotate ( p, v );
                lx = v.x; ly = v.y;
                
                // apply the camera rotation to the current rotation
                
                // rotation * camera -> r
                camera.setMult ( rotation, r );
                
                for ( i = 0; i < l; i = i + 1 ) {
                    
                    seg = segments [ i ];
                    sl = seg.length;
                    
                    if ( sl === 2 ) {
                        
                        ax = seg [ 0 ]; ay = seg [ 1 ];
                        setPoint ( ax, ay );
                        clip.push ( x, y );
                        px = x; py = y;
                        
                    } else if ( sl === 4 ) {
                        
                        ax = px;        ay = py;
                        bx = seg [ 0 ]; by = seg [ 1 ];
                        cx = seg [ 2 ]; cy = seg [ 3 ];
                        
                        setPoint ( bx, by );
                        bx = x; by = y;
                        
                        setPoint ( cx, cy );
                        px = cx = x; py = cy = y;
                        
                        for ( j = 1; j < 16; j = j + 1 ) {
                            t = j / 16;
                            clip.push (
                                quadraticPoint ( ax, bx, cx, t ),
                                quadraticPoint ( ay, by, cy, t )
                            );
                        }
                        
                        clip.push ( cx, cy );
                        
                    } else if ( sl === 6 ){
                        
                        ax = px;        ay = py;
                        bx = seg [ 0 ]; by = seg [ 1 ];
                        cx = seg [ 2 ]; cy = seg [ 3 ];
                        dx = seg [ 4 ]; dy = seg [ 5 ];
                        
                        setPoint ( bx, by );
                        bx = x; by = y;
                        
                        setPoint ( cx, cy );
                        cx = x; cy = y;
                        
                        setPoint ( dx, dy );
                        px = dx = x; py = dy = y;
                        
                        for ( j = 1; j < 16; j = j + 1 ) {
                            t = j / 16;
                            clip.push (
                                cubicPoint ( ax, bx, cx, dx, t ),
                                cubicPoint ( ay, by, cy, dx, t )
                            );
                        }
                        
                        clip.push ( dx, dy );
                    } else {
                        throw new TypeError ( 'cannot convert segment with length ' + ( sl >> 1 ) );
                    }
                }
                
                // update the screen bounds
                bounds.top = top;
                bounds.right = right;
                bounds.bottom = bottom;
                bounds.left = left;
                
                
                // the 3D bounds of the shape are computed
                // by scaling the orthogonal vectors of the
                // rotation matrix, this is a bit cheaper
                // than rotating each one, 12 mults vs 36
                sx = 0.5 * sx;
                sy = 0.5 * sy;
                ctop.set     ( rotation.ny );
                cright.set   ( rotation.nx );
                cbottom.set  ( rotation.ny );
                cleft.set    ( rotation.nx );
                ctop.mult ( sy );
                cright.mult ( sx );
                cbottom.mult ( -sy );
                cleft.mult ( -sx );
                
            };
        } ) ();
        
        // @mustoverride
        proto.onselect = function onselect ( editor ) {};
        
    } ) ( Shape3D.prototype );
    
} );