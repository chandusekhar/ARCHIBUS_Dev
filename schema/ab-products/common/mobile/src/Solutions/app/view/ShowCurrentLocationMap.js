Ext.define('Solutions.view.ShowCurrentLocationMap', {
    extend: 'Ext.Container',
    requires: 'Common.device.Location',

    xtype: 'showcurrentlocationmap',
    config: {
        items: [
            {
                xtype: 'button',
                top: 20,
                right: 20,
                text: 'Show Location'
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

        if (button.getText() === 'Show Location') {
            me.showLocation();
            button.setText('Clear Location');
        } else {
            me.clearLocation();
            button.setText('Show Location');
        }
    },

    showLocation: function () {
        var me = this,
            abMap = me.down('esrimap');

        //Get the current location from the device or browser
        Common.device.Location.getCurrentPosition()
            .then(function (location) {
                var lat,
                    lon;

                // Get the lat and lon values from the location object
                lat = location.coords.latitude;
                lon = location.coords.longitude;

                // Check if we have a location
                if (Ext.isEmpty(lat) || Ext.isEmpty(lon)) {
                    Ext.Msg.alert('', 'Could not get current location from device.');
                } else {
                    abMap.addLocationMarker(lat, lon);
                    abMap.setView([lat, lon], 16);
                    //Ext.Msg.alert('','Current location is: ' + lat + ', ' + lon);
                }
            });
    },

    clearLocation: function () {
        var me = this,
            abMap = me.down('esrimap');

        abMap.clearLocationMarker();
    }


});