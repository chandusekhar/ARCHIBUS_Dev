/**
 * Resource standard store for room resource.
 * @author heqiang
 */
Ext.define('WorkplacePortal.store.RoomResource', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: [ 'WorkplacePortal.model.RoomResource' ],

    serverTableName: 'resource_std',
    serverFieldNames: ['resource_std',
        'resource_name'
    ],
    inventoryKeyNames: ['resource_std'],

    config: {
        model: 'WorkplacePortal.model.RoomResource',
        storeId: 'roomResourceStore',
        enableAutoLoad: true,
        remoteSort: true,
        autoSync: true,
        autoLoad: true,
        tableDisplayName: LocaleManager.getLocalizedString('Room Resources', 'WorkplacePortal.store.RoomResource'),

        proxy: {
            type: 'Sqlite'
        }
    }
});