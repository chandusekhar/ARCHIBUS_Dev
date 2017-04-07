Ext.define('Maintenance.profile.Tablet', {
    extend: 'Ext.app.Profile',

    config: {
        views: ['Maintenance.view.tablet.Main',
            'Maintenance.view.tablet.WorkRequestEdit',
            'Maintenance.view.tablet.QuickComplete'
        ]
    },

    launch: function () {
        Ext.Viewport.add(Ext.create('Maintenance.view.tablet.Main'));
    },

    isActive: function () {
        return !Ext.os.is.Phone;
    }
});