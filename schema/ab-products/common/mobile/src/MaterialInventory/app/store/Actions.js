Ext.define('MaterialInventory.store.Actions', {
    extend: 'Ext.data.Store',
    requires: ['MaterialInventory.model.Action'],

    config: {
        model: 'MaterialInventory.model.Action',
        storeId: 'actionsStore',
        autoSync: true,
        disablePaging: true,
        data: [
            {
                action: 'download',
                text: LocaleManager.getLocalizedString('Download Documents', 'MaterialInventory.store.Actions')
            }
        ]
    }
});