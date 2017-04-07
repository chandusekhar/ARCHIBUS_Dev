Ext.define('AppLauncher.profile.Tablet', {
    extend: 'Ext.app.Profile',

    config: {
        controllers: ['Preferences'],
        views: ['Preferences']
    },

    isActive: function() {
        return Ext.os.is.Tablet || Ext.os.is.Desktop;
    }
});
