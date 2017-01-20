define ( function ( require, exports, module ) {

    if ( typeof Object.assign !== 'function' ) {
        Object.assign = function ( target ) {
            'use strict';
            if (target === null) {
                throw new TypeError ( 'Cannot convert undefined or null to object' );
            }
            
            target = Object ( target );
            for ( var index = 1; index < arguments.length; index++ ) {
                var source = arguments [ index ];
                if ( source !== null ) {
                    for ( var key in source ) {
                        if ( Object.prototype.hasOwnProperty.call ( source, key ) ) {
                            target [ key ] = source [ key ];
                        }
                    }
                }
            }
            return target;
        };
    }
    
    function extend ( child, parent ) {
        child.prototype = Object.create( parent.prototype );
        
        Object.defineProperties ( child.prototype, {
            constructor: {
                value: child
            },
            _super: {
                value: parent,
            }
        });
        
        for ( var name in parent ) {
            if ( parent.hasOwnProperty ( name ) ) {
                child [ name ] = parent [ name ];
            }
        }
    }
    
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
        
        var i, l, name = obj.constructor.name, props = [], prop;
        
        if ( 'Object' === name ) {
            for ( name in obj ) {
                prop = obj [ name ];
                if ( obj.hasOwnProperty( name ) ) {
                    switch ( typeof prop ) {
                        case 'string' : props.push ( name + ':"' + prop + '"' ); break;
                        case 'number' : props.push ( name + ':' + prop ); break;
                        case 'object' : props.push ( name + serialize ( prop ) ); break;
                        case 'function' :
                        default : props.push ( undefined ); break;
                    }
                }
            }
            
            return '{' + props + '}';
        } else if ( 'Array' === name ) {
            for ( i = 0, l = obj.length; i < l; i = i + 1 ) {
                prop = obj [ i ];
                switch ( typeof prop ) {
                    case 'string' : props.push ( '"' + prop + '"' ); break;
                    case 'number' : props.push ( prop ); break;
                    case 'object' : props.push ( serialize ( prop ) ); break;
                    case 'function' :
                    default : props.push ( undefined ); break;
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
        
        for ( name in info.__args__ ) {
            
            if ( obj.hasOwnProperty ( name ) ) {
                
                prop = obj [ name ];
                
                if ( 'object' === typeof prop ) {
                    output.push ( name + ':' + serialize ( prop ) );
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
    
    exports.assign = Object.assign;
    exports.extend = extend;
    exports.serialize = serialize;
} );
