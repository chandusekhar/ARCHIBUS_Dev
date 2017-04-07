Ext.define('WorkplacePortal.controller.Redline', {
    extend: 'Floorplan.controller.Redline',

    config: {
        refs: {
            mainView: 'mainview'
        },

        redlineStoreId: 'serviceDeskRequestsStore'
    }
});
