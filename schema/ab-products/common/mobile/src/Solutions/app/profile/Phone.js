Ext.define('Solutions.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {
        controllers: ['Main'],
        views: ['Main']
    },

    isActive: function() {
        return Ext.os.is.Phone; // || Ext.os.is.Desktop;
    },

    launch: function() {
        Ext.create('Solutions.view.phone.Main');

        this.callParent();
    }
});