Ext.define('Solutions.view.MarkerActionMap', {
    extend: 'Ext.Container',

    requires: [
        'Map.component.EsriMap'
    ],

    config: {
        items: [
            {
                xtype: 'button',
                top: 20,
                right: 20,
                text: 'Show Buildings'
            },
            {
                xtype: 'esrimap',
                style: 'height:100%;width:100%'
            }
        ]
    },

    initialize: function () {
        var me = this,
            button = me.down('button');

        // configure the markers
        me.configureMarkers();

        button.on('tap', 'onButtonTap', me);
    },

    onButtonTap: function () {
        var me = this,
            button = me.down('button');
        if (button.getText() === 'Show Buildings') {
            me.showMarkers();
            button.setText('Clear Buildings');
        } else {
            me.clearMarkers();
            button.setText('Show Buildings');
        }
    },

    configureMarkers: function () {
        var me = this,
            abMap = me.down('esrimap');

        // configure the store
        var store = 'solutionsBuildings',
            keyFields = ['bl_id'],
            geometryFields = ['lon', 'lat'],
            titleField = 'name',
            contentFields = [];

        // configure the marker options
        var markerOptions = {
            // optional
            renderer: 'simple',
            radius: 8,
            fillColor: '#e41a1c',
            fillOpacity: 0.90,
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 1.0,
            markerActionTitle: 'Marker Action',
            markerActionCallback: me.doMarkerAction             
        };

        // cteate the markers
        abMap.createMarkers(
            store,
            keyFields,
            geometryFields,
            titleField,
            contentFields,
            markerOptions
        );
    },

    showMarkers: function () {
        var me = this,
            abMap = me.down('esrimap'),
            filters = [];

        // show the markers
        abMap.showMarkers('solutionsBuildings', filters);
    },

    clearMarkers: function () {
        var me = this,
            abMap = me.down('esrimap');

        abMap.clearMarkers();
    },

    doMarkerAction: function (key) {
        Ext.Msg.alert('','Marker action fired for asset id: ' + key);
    }

});