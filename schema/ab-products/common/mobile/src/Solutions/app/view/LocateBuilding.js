Ext.define('Solutions.view.LocateBuilding', {
    extend: 'Ext.Container',
    requires: 'Common.control.prompt.Building',
    xtype: 'locatebuilding',
    config: {
        items: [
            {
                xtype: 'container',
                margin: '10px',
                items: [
                    {
                        xtype: 'buildingPrompt'
                    },
                    {
                        xtype: 'esrimap',
                        height: '400px',
                        style: 'margin-top:10px;border:1px solid black'
                    }
                ]
            }
        ]
    },

    initialize: function() {
        var me = this,
            buildingPrompt = me.down('buildingPrompt');

        buildingPrompt.on('itemselected', 'onBuildingSelected', me);
    },

    onBuildingSelected: function(record) {
        var me = this,
            map = me.down('esrimap'),
            lat,
            lon;

        // Get the lat and lon values from the selected building record
        lat = record.get('lat');
        lon = record.get('lon');

        // Check if the building location is geocoded
        if(Ext.isEmpty(lat) || Ext.isEmpty(lon)) {
            Ext.Msg.alert('','The selected building location is not configured in the ARCHIBUS database.');
        } else {
            map.panToLocation(lat, lon);
            map.addMarker(lat, lon);
        }

    }

});