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
    
    /**
     * Prototypes are daisy chained, so we can walk straight up the
     * prototype._super_._super_ etc. For example AnyClass.prototype._super_
     * points to the prototype of the super class, whereas normally
     * AnyClass.prototype._super_ is itself the super class constructor.
     * Since all prototypes, by requirement, already contain a reference to
     * their constructor, this makes code clearer and more readable.  For
     * example constructor chains look like:
     * 
     * extend ( AnyClass, OtherClass );
     * function AnyClass ( args ) {
     *     AnyClass.prototype._super_.constructor.call ( this, args );
     * }
     * 
     * 
     * Or method overrides look like:
     * 
     * AnyClass.prototype.method = function method ( args ) {
     *     
     *     // do other stuff or run a check, then
     *     
     *     AnyClass.prototype._super_.method.call ( this, args );
     * };
     * 
     * 
     * Or if the need arises, for example when method override skips
     * a generation but the grandparent method is still useful to the
     * grandchild, one can walk further up the prototype chain in a
     * straightforward way, i.e. obtaining the superclass of the
     * superclass, etc.:
     * 
     * AnyClass.prototype.method = function method ( args ) {
     *     
     *     // do other stuff or run a check, then
     *     
     *     AnyClass.prototype._super_._super_.method.call ( this, args );
     * }
     * 
     */
    function extend ( child, parent ) {
        child.prototype = Object.create( parent.prototype );
        
        Object.defineProperties ( child.prototype, {
            constructor: {
                value: child
            },
            _super_: {
                value: parent.prototype,
            }
        });
        
        for ( var name in parent ) {
            if ( parent.hasOwnProperty ( name ) ) {
                child [ name ] = parent [ name ];
            }
        }
    }
    
    function implement ( obj, methods ) {
        
        var target;
        
        if ( typeof obj === 'function' ) {
            target = obj.prototype;
        } else if ( '_super_' in obj ) {
            target = obj;
        } else {
            target = Object.create ( obj );
        }
        
        return Object.assign ( target, methods );
    }
    
    exports.assign = Object.assign;
    exports.extend = extend;
    exports.implement = implement;
    
} );
