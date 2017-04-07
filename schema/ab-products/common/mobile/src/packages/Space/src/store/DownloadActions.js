Ext.define('Space.store.DownloadActions', {
    extend: 'Ext.data.Store',
    requires: ['Space.model.DownloadAction'],

    config: {
        model: 'Space.model.DownloadAction',
        storeId: 'downloadActionsStore',
        autoSync: true,
        disablePaging: true,
        data: [
            {
                action: 'start',
                text: LocaleManager.getLocalizedString('Download Floor Plans', 'Space.store.DownloadActions')
            }
        ]
    }
});