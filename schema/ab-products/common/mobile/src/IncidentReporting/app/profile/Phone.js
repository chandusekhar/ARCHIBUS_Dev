Ext.define('IncidentReporting.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {

        views: [
            'IncidentReporting.view.phone.PhotoPanel'
        ]
    },

    isActive: function () {
        return Ext.os.is.Phone;
    }
});