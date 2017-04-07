/**
 * @override
 * @since 22.1
 */

/* jshint -W116 */
/* jshint -W071 */
Ext.define('Common.overrides.event.recognizer.Drag', {
    override: 'Ext.event.recognizer.Drag',

    resetInfo: function(axis, e, touch) {
        // this.startPoint can be null when working with Redline views.
        if(this.startPoint == null) {
            return;
        }

        var value = this.lastPoint[axis],
            startValue = this.startPoint[axis],
            delta = value - startValue,
            capAxis = axis.toUpperCase(),
            info = this.info;

        info.touch = touch;

        info.delta[axis] = delta;
        info.absDelta[axis] = Math.abs(delta);

        info.previousTime[axis] = this.startTime;
        info.previous[axis] = startValue;
        info[axis] = value;
        info.direction[axis] = 0;

        info['start' + capAxis] = this.startPoint[axis];
        info['previous' + capAxis] = info.previous[axis];
        info['page' + capAxis] = info[axis];
        info['delta' + capAxis] = info.delta[axis];
        info['absDelta' + capAxis] = info.absDelta[axis];
        info['previousDelta' + capAxis] = 0;
        info.startTime = this.startTime;
    },


    updateInfo: function(axis, e, touch, updatePrevious) {
        // this.startPoint can be null when working with Redline views.
        if(this.startPoint == null) {
            return;
        }
        var time = e.time,
            value = this.lastPoint[axis],
            previousValue = this.previousPoint[axis],
            startValue = this.startPoint[axis],
            delta = value - startValue,
            info = this.info,
            direction = info.direction,
            capAxis = axis.toUpperCase(),
            previousFlick = info.previous[axis],
            previousDelta;

        info.touch = touch;

        previousDelta = info.delta[axis];
        info.delta[axis] = delta;
        info.absDelta[axis] = Math.abs(delta);

        if (updatePrevious && value !== previousFlick && value !== info[axis] && time - info.previousTime[axis] >= 50) {
            info.previous[axis] = info[axis];
            info.previousTime[axis] = info.time;
        }

        info[axis] = value;

        if (value > previousValue) {
            direction[axis] = 1;
        }
        else if (value < previousValue) {
            direction[axis] = -1;
        }

        info['start' + capAxis] = this.startPoint[axis];
        info['previous' + capAxis] = info.previous[axis];
        info['page' + capAxis] = info[axis];
        info['delta' + capAxis] = info.delta[axis];
        info['absDelta' + capAxis] = info.absDelta[axis];
        info['previousDelta' + capAxis] = previousDelta;
        info.startTime = this.startTime;
    }
});