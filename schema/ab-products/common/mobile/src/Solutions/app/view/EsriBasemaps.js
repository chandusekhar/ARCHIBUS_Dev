Ext.define('Solutions.view.EsriBasemaps', {
    extend: 'Ext.Container',

    requires: [
        'Map.component.EsriMap',
        'Map.component.BasemapWidget'
    ],

    config: {
        items: [
            {
                xtype: 'esrimap',
                style: 'height:100%;width:100%'
            }
        ]
    },

    initialize: function () {
        var me = this,
            esriMap = me.down('esrimap');

        var basemapWidget = Ext.create('Map.component.BasemapWidget', {
            abMap: esriMap,
            top: 20,
            right: 20
        });

        me.add(basemapWidget);
    }
});