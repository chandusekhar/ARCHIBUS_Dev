Ext.define('Maintenance.store.Buildings', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.MaintenanceBuilding'],

    serverTableName: 'bl',

    serverFieldNames: ['bl_id', 'site_id', 'pr_id', 'name', 'address1', 'address2','lon','lat'],
    inventoryKeyNames: ['bl_id'],

    config: {
        model: 'Maintenance.model.MaintenanceBuilding',
        storeId: 'maintenanceBuildingsStore',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Buildings', 'Maintenance.store.Buildings'),
        sorters: [
            {
                property: 'bl_id',
                direction: 'ASC'
            }
        ],
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }
    }
});