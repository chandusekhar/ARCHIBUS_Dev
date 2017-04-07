Ext.define('Solutions.view.Location', {
    extend: 'Ext.Container',


    requires: 'Common.device.Location',

    config: {
        scrollable: {
            direction: 'vertical',
            scrollLock: true
        },
        items: [
            {
                xtype: 'container',
                padding: '20px',
                items: [
                    {
                        xtype: 'container',
                        html: 'Tap the <strong>Location</strong> button to retreive your current position',
                        styleHtmlContent: true
                    },
                    {
                        xtype: 'button',
                        text: 'Location',
                        itemId: 'locationButton'
                    }
                ]
            },
            {
                xtype: 'container',
                padding: '20px',
                itemId: 'watchContainer',
                items: [
                    {
                        xtype: 'container',
                        html: 'Tap the <strong>Watch Location</strong> button to start tracking your position. The position will update when a change is detected.',
                        styleHtmlContent: true
                    },
                    {
                        xtype: 'button',
                        text: 'Watch Location',
                        itemId: 'watchButton'
                    }
                ]
            },
            {
                xtype: 'container',
                padding: '20px',
                hidden: true,
                itemId: 'clearWatchContainer',
                items: [
                    {
                        xtype: 'container',
                        html: 'Tap the <strong>Clear Watch</strong> button to stop tracking your position.',
                        styleHtmlContent: true
                    },
                    {
                        xtype: 'button',
                        text: 'Clear Watch',
                        itemId: 'clearWatchButton'
                    }
                ]
            },
            {
                xtype: 'container',
                padding: '20px',
                items: [
                    {
                        xtype: 'container',
                        itemId: 'positionOutput',
                        styleHtmlContent: true
                    }
                ]
            }
        ]
    },


    initialize: function () {
        var me = this,
            locationButton = me.down('#locationButton'),
            watchButton = me.down('#watchButton'),
            clearWatchButton = me.down('#clearWatchButton');

        locationButton.on('tap', 'getCurrentPosition', me);
        watchButton.on('tap', 'startWatch', me);
        clearWatchButton.on('tap', 'clearWatch', me);
    },

    getCurrentPosition: function () {
        var me = this;

        Mask.displayLoadingMask();
        Common.device.Location.getCurrentPosition().then(function (position) {
            me.displayPosition(position);
            Mask.hideLoadingMask();
        }, function (error) {
            Ext.Msg.alert('', error);
            Mask.hideLoadingMask();
        });
    },

    displayPosition: function (position) {
        var me = this,
            outputContainer = me.down('#positionOutput'),
            output,
            heading = position.coords.heading,
            speed = position.coords.speed,
            altitudeAccuracy = position.coords.altitudeAccuracy,
            altitude = position.coords.altitude,
            NOT_AVAILABLE = 'Not Available',
            timestamp = position.timestamp,
            timestampDate;

        if (isNaN(heading) || heading === null) {
            heading = NOT_AVAILABLE;
        }

        if (isNaN(speed) || speed === null) {
            speed = NOT_AVAILABLE;
        }

        if (altitudeAccuracy === null) {
            altitudeAccuracy = NOT_AVAILABLE;
        }

        if (altitude === null) {
            altitude = NOT_AVAILABLE;
        }


        if (Ext.isNumber(timestamp)) {
            timestampDate = new Date(0);
            timestampDate.setUTCMilliseconds(timestamp);
        } else {
            timestampDate = timestamp;
        }

        output = ['<h3>Current Position</h3><div><div>Latitude: {0}</div><div>Longitude: {1}</div><div>Altitude: {2}</div>',
            '<div>Accuracy: {3}</div><div>Altitude Accuracy: {4}</div><div>Heading: {5}</div>',
            '<div>Speed: {6}</div><div>Timestamp: {7}</div>'].join('');

        output = Ext.String.format(output,
            position.coords.latitude,
            position.coords.longitude,
            altitude,
            position.coords.accuracy,
            altitudeAccuracy,
            heading,
            speed,
            timestampDate
        );

        outputContainer.setHtml(output);
    },

    clearWatch: function () {
        this.setContainerVisibility(false);
        Common.device.Location.clearWatch();
    },

    startWatch: function () {
        var me = this;

        Common.device.Location.watchPosition();
        me.setContainerVisibility(true);

        Common.device.Location.on('positionchange', function (position) {
            me.displayPosition(position);
        });
    },

    setContainerVisibility: function (startWatching) {
        var me = this,
            clearWatchContainer = me.down('#clearWatchContainer'),
            watchContainer = me.down('#watchContainer');

        clearWatchContainer.setHidden(!startWatching);
        watchContainer.setHidden(startWatching);
    }

});