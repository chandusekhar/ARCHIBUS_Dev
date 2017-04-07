Ext.define('Common.util.Queue', {

    config: {
        queue: []
    },

    add: function(o) {
        this.getQueue().push(o);
    },

    dequeue: function() {
        if(this._queue.length > 0) {
            return this._queue.shift();
        } else {
            return null;
        }
    },

    isEmpty: function() {
        return this._queue.length === 0;
    },

    clear: function() {
        this.setQueue([]);
    },

    constructor: function() {
        this.initConfig();
        return this;
    }
});
