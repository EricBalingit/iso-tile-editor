define ( function ( require, exports, module ) {
    
    var shapes = require ( 'shapes' );
    
    // Inspects and object.  If it is a plain object, a string representing that is returned.
    // If it is an array, a string representing the array is returned.
    // If it is any other kind of object, an object is returned with the properties
    // __class__ the name of the constructor
    // __args__ and object whose properties match the parameters to the constructor
    //          and whose values are null
    function inspect ( obj ) {
        if ( 'object' !== typeof obj ) {
            throw new TypeError ( 'cannot classify object unless it is of type "object"' );
        }
        
        var i, l, name = obj.constructor.name, props = [], prop, isUndef = ':undefined';
        
        if ( 'Object' === name ) {
            for ( name in obj ) {
                prop = obj [ name ];
                if ( obj.hasOwnProperty( name ) ) {
                    switch ( typeof prop ) {
                        case 'string' : props.push ( name + ':"' + prop + '"' ); break;
                        case 'number' : props.push ( name + ':' + prop ); break;
                        case 'object' : props.push ( name + serialize ( prop ) ); break;
                        case 'function' : // we're not concerned with functions, only class signatures
                        default : props.push ( name + isUndef ); break;
                    }
                }
            }
            
            return '{' + props + '}';
        } else if ( 'Array' === name ) {
            for ( i = 0, l = obj.length; i < l; i = i + 1 ) {
                prop = obj [ i ];
                switch ( typeof prop ) {
                    case 'number' : props.push ( prop ); break;
                    case 'string' : props.push ( '"' + prop + '"' ); break;
                    case 'object' : props.push ( serialize ( prop ) ); break;
                    case 'function' :
                    default : props.push ( name + isUndef ); break;
                }
            }
            
            return '[' + props + ']';
        } else {
            return {
                __class__: obj.constructor.name,
                __args__: ( '' + obj.constructor )
                    .split ( /(\(.*?\))/ ) [ 1 ]
                    .split ( ',' )
                    .map ( String.prototype.trim )
                    .reduce ( function ( a, b ) { a [ b ] = null; }, {} )
            };
        }
    }
    
    function serialize ( obj ) {
        var i, info = inspect ( obj ), l, output = [], prop, name;
        
        if ( 'string' === typeof info ) {
            return info;
        }
        
        /**
         * We are linking constructor arguments to their current values
         * everything else is ignored because that should all be generated
         * when the object is constructed.
         * 
         * Note this only works with the constructor pattern:
         * 
         * function MyClass ( a, b, c, ... ) {
         *     this.a = a;
         *     this.b = b;
         *     this.c = c;
         *     ... etc.
         * }
         * 
         * If arguments are passed to the constructor and used, but not
         * assigned to the instance, it breaks this pattern.
         */
        
        for ( name in info.__args__ ) {
            
            if ( obj.hasOwnProperty ( name ) ) {
                
                prop = obj [ name ];
                
                if ( 'object' === typeof prop ) {
                    output.push ( name + ':' + serialize ( prop ) );
                
                // ignore functions
                } else if ( 'function' !== typeof prop ) {
                    if ( Array.isArray ( prop ) ) {
                        var ary = [];
                        for ( i = 0, l = prop.length; i < l; i = i + 1 ) {
                            switch ( typeof prop [ i ] ) {
                                case 'string' : ary.push ( '"' + prop [ i ] + '"' ); break;
                                case 'number' : ary.push ( prop [ i ] ); break;
                                case 'object' : ary.push ( serialize ( prop [ i ] ) ); break;
                                case 'function' :
                                default : ary.push ( undefined ); break;
                            }
                        }
                        output.push ( name + ':[' + ary + ']' );
                    } else {
                        output.push ( name + ':' + prop );
                    }
                }
            }
        }
        
        return '{__class__:"' + info.__class__ + '",__args__:{' + output + '}}';
    }
    
    function deserialize ( obj ) {
        if ( ( '__class__' in obj ) && ( obj.__class__ in shapes ) ) {
            var args = [], ctor, argsObj;
            ctor = shapes [ obj.__class__ ];
            argsObj = obj.__args__;
            for ( var name in argsObj ) {
                args.push ( deserialize ( argsObj [ name ] ) );
            }
            
            // thisarg not needed when calling with new
            args.unshift ( null );
            
            return new Function.prototype.bind.apply ( ctor, args );
        } else {
            return obj;
        }
    }
    
    exports.Shape = {
        serialize: serialize,
        deserialize: deserialize
    };
    
} );