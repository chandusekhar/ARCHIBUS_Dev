Ext.define('Common.store.Rooms', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'Common.model.Room' ],

    serverTableName: 'rm',

    serverFieldNames: [ 'bl_id', 'fl_id', 'rm_id', 'name', 'rm_type', 'rm_use', 'rm_cat', 'rm_std', 'area', 'dv_id',
        'dp_id', 'phone', 'survey_photo' ],
    inventoryKeyNames: [ 'bl_id', 'fl_id', 'rm_id' ],

    config: {
        model: 'Common.model.Room',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Rooms', 'Common.store.Rooms'),
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