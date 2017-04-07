/**
 * Override Ext.util.Point to resolve issues caused by Sencha Drag classes when using the
 * Redline views.
 * @override
 * @since 22.1
 */
Ext.define('Common.overrides.util.Point', {
    override: 'Ext.util.Point',

    // KB 3049390 Check if point is null
    /* jshint -W116 */
    getDistanceTo: function (point) {
        if (typeof point != 'object' || point === null) {
            point = {x: 0, y: 0};
        }

        var deltaX = this.x - point.x,
            deltaY = this.y - point.y;

        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
});