Ext.define('SpaceOccupancy.store.Rooms', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['SpaceOccupancy.model.Room'],

    serverTableName: 'rm',

    serverFieldNames: ['bl_id', 'fl_id', 'rm_id', 'name', 'rm_type', 'rm_use', 'rm_cat', 'rm_std', 'area', 'dv_id',
        'dp_id', 'survey_photo', 'survey_redline_rm'],
    inventoryKeyNames: ['bl_id', 'fl_id', 'rm_id'],

    config: {
        model: 'SpaceOccupancy.model.Room',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Rooms', 'SpaceOccupancy.store.Rooms'),
        sorters: [
            {
                property: 'bl_id',
                direction: 'ASC'
            },
            {
                property: 'fl_id',
                direction: 'ASC'
            },
            {
                property: 'rm_id',
                direction: 'ASC'
            }
        ],
        storeId: 'roomsStore',
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }

    }
});