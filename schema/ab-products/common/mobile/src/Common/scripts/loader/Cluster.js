Ext.define('Common.scripts.loader.Cluster', {
    singleton: true,
    requires: 'Common.scripts.loader.Drawing',
    mixins: ['Common.scripts.loader.Loader'],

    desktopScripts: [
        '../../../../../ab-core/libraries/svg/zoomcluster.js',
        '../../../../../ab-core/controls/drawing/cluster-control.js'
    ],
    deviceScripts: [
        'cluster.min.js'
    ],

    constructor: function () {
        var me = this,
            scriptArray = Environment.getNativeMode() ? me.deviceScripts : me.desktopScripts;

        me.loadAllScripts(scriptArray);
    }
});