Ext.define('Common.store.TableDownloads', {
    extend : 'Common.store.sync.SqliteStore',

    requires : 'Common.model.TableDownload',

    config : {
        model : 'Common.model.TableDownload',
        storeId : 'tableDownloadStore',
        enableAutoLoad : false,  // Enabled after initial load in Common.Application
        disablePaging : true,
        proxy : {
            type : 'Sqlite'
        }
    }
});
