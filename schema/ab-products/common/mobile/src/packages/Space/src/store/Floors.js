Ext.define('Space.store.Floors', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: 'Space.model.SpaceFloor',

    serverTableName: 'fl',
    serverFieldNames: [
        'bl_id',
        'fl_id',
        'name',
        'area_gross_ext',
        'area_gross_int',
        'area_rentable',
        'area_usable'
    ],

    inventoryKeyNames: [
        'bl_id',
        'fl_id'
    ],

    config: {
        model: 'Space.model.SpaceFloor',
        sorters: [
            {
                property: 'fl_id',
                direction: 'ASC'
            }
        ],
        tableDisplayName: LocaleManager.getLocalizedString('Floors', 'Space.store.Floors'),
        storeId: 'spaceBookFloors',
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});