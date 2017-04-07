Ext.define('AppLauncher.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {
        controllers: ['Preferences'],
        views: ['Preferences']
    },

    isActive: function() {
        return Ext.os.is.Phone; // || Ext.os.is.Desktop;
    }
});