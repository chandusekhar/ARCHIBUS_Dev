Ext.define('IncidentReporting.view.phone.PhotoPanel', {
    extend: 'IncidentReporting.view.PhotoPanel',

    xtype: 'phoneIncidentPhotoPanel',

    config: {
        scrollable: {
            direction: 'vertical',
            directionLock: true
        }
    }

});
