Ext.define('Solutions.view.ShowBuildingMap', {
    extend: 'Ext.Container',
    requires: [
        'Common.control.prompt.Building',
        'Map.component.SimpleMarker'
    ],
    xtype: 'showbuildingmap',
    config: {
        items: [
            {
                xtype: 'buildingPrompt',
                left: 60,
                top: 20,
                style: 'width:50%;-webkit-border-radius:10px'
            },
            {
                xtype: 'esrimap',
                style: 'height:100%;width:100%'
            }
        ]
    },

    initialize: function () {
        var me = this,
            buildingPrompt = me.down('buildingPrompt');

        buildingPrompt.on('itemselected', 'onBuildingSelected', me);

        // configure the markers
        me.configureMarkers();
    },


    configureMarkers: function () {
        var me = this,
            abMap = me.down('esrimap');

        var dataSource = 'solutionsBuildings',
            keyFields = ['bl_id'],
            geometryFields = ['lon', 'lat'],
            titleField = 'name',
            contentFields = ['address1', 'city_id', 'state_id', 'ctry_id'];

        var markerOptions = {
            // optional
            renderer: 'simple',
            radius: 8,
            fillColor: '#e41a1c',
            fillOpacity: 0.90,
            stroke: true,
            strokeColor: '#fff',
            strokeWeight: 1.0
        };

        abMap.createMarkers(
            dataSource,
            keyFields,
            geometryFields,
            titleField,
            contentFields,
            markerOptions
        );

    },

    onBuildingSelected: function (record) {
        var me = this,
            abMap = me.down('esrimap'),
            blId,
            filter;

        blId = record.get('bl_id');
        // Example of a single filter.
        filter = {property: 'bl_id', value: blId};

        // Example of multiple filters.
        // var filter1 = Ext.create('Common.util.Filter', {property: 'bl_id', value: 'HQ', conjunction: 'OR'});
        // var filter2 = Ext.create('Common.util.Filter', {property: 'bl_id', value: 'DALLASHQ', conjunction: 'OR'});
        // var filters = [ filter1, filter2 ];
        // Example of an empty filter.
        // var filters = [];
        abMap.showMarkers('solutionsBuildings', [filter]);

    }

});