define ( function ( require, exports, module ) {
    
    function sealedJaggedCopy ( array ) {
        var copy = [];
        for ( var i = 0, l = array.length; i < l; i = i + 1 ) {
            copy.push ( Object.seal ( array [ i ].slice () ) );
        }
        
        return Object.seal ( copy );
    }
    
    function frozenJaggedCopy ( array ) {
        var copy = [];
        for ( var i = 0, l = array.length; i < l; i = i + 1 ) {
            copy.push ( Object.freeze ( array [ i ].slice () ) );
        }
        
        return Object.freeze ( copy );
    }
    
    exports.frozenJaggedCopy = frozenJaggedCopy;
    exports.sealedJaggedCopy = sealedJaggedCopy;
    
} );