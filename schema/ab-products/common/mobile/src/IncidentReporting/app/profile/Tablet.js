Ext.define('IncidentReporting.profile.Tablet', {
    extend: 'Ext.app.Profile',

    config: {

        views: [
            'IncidentReporting.view.tablet.PhotoPanel'
        ]
    },

    isActive: function () {
        return Ext.os.is.Tablet || Ext.os.is.Desktop;
    }
});