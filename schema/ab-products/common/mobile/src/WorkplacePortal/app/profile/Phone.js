Ext.define('WorkplacePortal.profile.Phone', {
    extend: 'Ext.app.Profile',

    config: {
        controllers: [],

        views: []
    },

    isActive: function () {
        return Ext.os.is.Phone;
    }
});