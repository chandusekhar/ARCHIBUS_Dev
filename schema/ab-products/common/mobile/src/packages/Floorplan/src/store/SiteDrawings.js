Ext.define('Floorplan.store.SiteDrawings', {
    extend: 'Common.store.sync.SqliteStore',

    requires: 'Floorplan.model.SiteDrawing',

    config: {
        model: 'Floorplan.model.SiteDrawing',
        storeId: 'siteDrawings',
        enableAutoLoad: true,
        disablePaging: true,
        tableDisplayName: LocaleManager.getLocalizedString('Site Maps', 'Floorplan.store.SiteDrawings'),
        proxy: {
            type: 'Sqlite'
        }
    }
});