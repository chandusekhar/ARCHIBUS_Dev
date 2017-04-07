Ext.define('Maintenance.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {
        views: [
            'Maintenance.view.phone.Main',
            'Maintenance.view.phone.WorkRequestEdit',
            'Maintenance.view.phone.QuickComplete'
        ]
    },

    launch: function () {
        Ext.Viewport.add(Ext.create('Maintenance.view.phone.Main'));
    },

    isActive: function () {
        return Ext.os.is.Phone; // || Ext.os.is.Desktop;
    }
});