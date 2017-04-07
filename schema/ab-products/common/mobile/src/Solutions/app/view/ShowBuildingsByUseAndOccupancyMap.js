Ext.define('Solutions.view.ShowBuildingsByUseAndOccupancyMap', {
    extend: 'Ext.Container',

    requires: [
        'Map.component.EsriMap',
        'Map.component.ThematicMarker'
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
                basemapLayer: 'World Dark Gray Canvas',
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
            contentFields = ['bl_id', 'use1', 'count_occup'];

        // add extra colors to colorbrewer
       colorbrewer.Paired[13] = ["#1f78b4","#33a02c","#e31a1c","#ff7f00","#6a3d9a","#b15928","#a6cee3","#b2df8a","#fb9a99","#fdbf6f","#cab2d6","#ffff99",
            "#a6cee3"];

        // configure the marker options
        var markerOptions = {
            //optional
            radius: 5,
            fillColor: '#ff7f00',
            fillOpacity: 0.90,
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 1.0,
            // required for thematic markers
            renderer: 'thematic-graduated-unique-values',
            thematicField: 'use1',
            // pass an empty array and the control will get all the distinct values for the field
            uniqueValues: [],
            // or pass an array with desired values
            //uniqueValues: ['DATA CENTER', 'MANUFACTURING', 'MEDICAL OFFICE', 'MIXED USE', 'OFFICE', 'SALES OFFICE', 'UNKNOWN', 'WAREHOUSE'],
            colorBrewerClass: 'Paired2',
            // required for graduated markers
            graduatedField: 'count_occup',
            graduatedClassBreaks: [100, 500, 1000],
            radiusIncrement: 5
        };

        // create the markers
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
    }

});