Ext.define('Maintenance.controller.Redline', {
    extend: 'Floorplan.controller.Redline',

    config: {
        refs: {
            mainView: 'mainview'
        },
        control: {
            documentItem: {
                displayredline: 'displayRedlinePhoto'
            }
        },

        redlineStoreId: 'workRequestsStore',

        documentField: 'doc4',

        redlinePlanType: '10 - MAINTENANCE'
    }
});