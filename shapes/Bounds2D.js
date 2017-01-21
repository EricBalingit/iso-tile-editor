define ( function ( require, exports, module ) {
    
    /**
     * Bounds2D represents a rectangular region of the viewing
     * plane.  In screen coordinates, top is the top of the boundary,
     * bottom is the bottom boundary, left is the left boundary and
     * right is the right boundary.
     * 
     * Keep in mind that the y axis of the screen is inverted, so
     * the top of a non-degenerate region can be exected to hold a
     * smaller value than the bottom.  This is not the case for
     * left and right since they are in increasing order.
     */
    function Bounds2D ( top, right, bottom, left ) {
        this.top = top;
        this.right = right;
        this.bottom = bottom;
        this.left = left;
    }
    
    Bounds2D.prototype.containsPoint = function containsPoint ( x, y ) {
        if ( arguments.length === 1 ) {
            y = x.y;
            x = x.x;
        }
        
        return y >= this.top && y < this.bottom && x >= this.left && x < this.right;
    };
    
    // determines if the bounds are overlapping, but not if they
    // are adjacent
    Bounds2D.prototype.intersects = function intersects ( bounds ) {
        return ! ( this.top >= bounds.bottom || this.right <= bounds.left || this.bottom <= bounds.top || this.left >= bounds.right );
    };
    
    // determines the bounds of the intersection of two bounds,
    // their Boolean conjunction, if the two bounds are not
    // intersecting the method returns false
    Bounds2D.prototype.intersection = function intersection ( bounds ) {
        if ( this.intersects ( bounds ) ) {
            return new Bounds2D (
                Math.max ( this.top, bounds.top ),
                Math.min ( this.right, bounds.right ),
                Math.min ( this.bottom, bounds.bottom ),
                Math.max ( this.left, bounds.left )
            );
        } else {
            return false;
        }
    };
    
    // determines the union of two bounds, their Boolean
    // disjunction, a new bounds representing the union
    // is always returned even if one or both of the bounds
    // are degenerate
    Bounds2D.prototype.union = function union ( bounds ) {
        return new Bounds2D (
            Math.min ( this.top, bounds.top ),
            Math.max ( this.right, bounds.right ),
            Math.max ( this.bottom, bounds.bottom ),
            Math.min ( this.left, bounds.left )
        );
    }
    
    module.exports = Bounds2D;
} );