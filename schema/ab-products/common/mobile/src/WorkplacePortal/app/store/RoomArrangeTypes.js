Ext.define('WorkplacePortal.store.RoomArrangeTypes', {

    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.RoomArrangeType' ],

    serverTableName: 'rm_arrange_type',
    serverFieldNames: ['rm_arrange_type_id', 'arrange_name'
    ],

    inventoryKeyNames: [ 'rm_arrange_type_id' ],

    config: {
        model: 'WorkplacePortal.model.RoomArrangeType',
        storeId: 'roomArrangeTypesStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        tableDisplayName: LocaleManager.getLocalizedString('Room Arrange Types', 'WorkplacePortal.store.RoomArrangeTypes'),
        sorters: [
            {
                property: 'rm_arrange_type_id',
                direction: 'ASC'
            }
        ],

        proxy: {
            type: 'Sqlite'
        }
    }
});