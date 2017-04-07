Ext.define('Solutions.view.LocateAssetMap', {
    extend: 'Ext.Container',

    xtype: 'locateassetmap',
    config: {
        items: [
            {
                xtype: 'button',
                top: 20,
                right: 20,
                text: 'Start Locate Asset'
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

        //map.on('mapready', 'doLocate', me);
        button.on('tap', 'onButtonTap', me);
    },

    onButtonTap: function () {
        var me = this,
            button = me.down('button');

        if (button.getText() === 'Start Locate Asset') {
            me.startLocateAsset();
            button.setText('Finish Locate Asset');
        } else {
            me.finishLocateAsset();
            button.setText('Start Locate Asset');
        }
    },

    startLocateAsset: function () {
        var me = this,
            abMap = me.down('esrimap');

        // Uncomment the following block to show current location
        // Get the current location from the device or browser
        // Common.device.Location.getCurrentPosition()
        //     .then(function(location) {
        //         var lat,
        //             lon;

        //         // Get the lat and lon values from the location object
        //         lat = location.coords.latitude;
        //         lon = location.coords.longitude;

        //         // Check if we have a location
        //         if(Ext.isEmpty(lat) || Ext.isEmpty(lon)) {
        //             Ext.Msg.alert('','Could not get current location from device.');
        //         } else {
        //             abMap.addLocationMarker(lat, lon);
        //             abMap.setView([lat, lon], 16);
        //             //Ext.Msg.alert('','Current location is: ' + lat + ', ' + lon);
        //         }
        //     });

        // to locate a new asset, call abMap#startLocateAsset with no arguments
        // the map will use the center of the display as the starting point
        //abMap.startLocateAsset();

        // to relocate an existing asset, call abMap#startLocateAsset with lat-lon values
        // the map will use the existing location as the starting point
        abMap.startLocateAsset(42.354336, -71.065506);
    },

    finishLocateAsset: function () {
        var me = this,
            abMap = me.down('esrimap'),
            location = abMap.finishLocateAsset();

        Ext.Msg.alert('', 'Asset location: ' + location[0].toFixed(7) + ', ' + location[1].toFixed(7));
    }

});