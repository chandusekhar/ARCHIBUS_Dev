Ext.define('Solutions.view.MarkerClickEventMap', {
    extend: 'Ext.Container',

    requires: [
        'Map.component.EsriMap'
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
        var me = this;

        // configure the markers
        me.configureMarkers();

        // configure event listeners
        me.configureEventListeners(); 

    },
    
    configureEventListeners: function () {
        var me = this,
            abMap = me.down('esrimap');

        abMap.on('mapLoaded', me.onMapLoaded, me);
        abMap.on('markerClick', me.onMarkerClick, me);    
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
            usePopup: false            
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

    onMapLoaded: function () {
        var me = this;
        me.showMarkers();
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

    onMarkerClick: function(assetId, feature) {
        Ext.Msg.alert('', 'Marker clicked for asset id: ' + assetId);
    }

});