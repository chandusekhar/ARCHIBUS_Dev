Ext.define('MaterialInventory.store.space.MaterialSites', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.space.MaterialSite'],

    serverTableName: 'site',

    serverFieldNames: [
        'site_id',
        'name',
        'city_id',
        'state_id',
        'ctry_id',
        'area_gross_ext',
        'area_gross_int',
        'area_rentable',
        'area_usable',
        'site_photo',
        'detail_dwg'
    ],

    inventoryKeyNames: ['site_id'],

    config: {
        model: 'MaterialInventory.model.space.MaterialSite',
        storeId: 'materialSites',
        tableDisplayName: LocaleManager.getLocalizedString('Sites', 'MaterialInventory.store.MaterialSites'),
        remoteSort: true,
        remoteFilter: true,
        sorters: [
            {
                property: 'name',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        },
        timestampDownload: false
    }
});