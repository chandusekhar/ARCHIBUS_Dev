Ext.define('Maintenance.store.Parts', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Maintenance.model.Part'],

    serverTableName: 'pt',
    serverFieldNames: ['part_id', 'description', 'cost_unit_avg'],
    inventoryKeyNames: ['part_id'],

    config: {
        model: 'Maintenance.model.Part',
        sorters: [
            {
                property: 'part_id',
                direction: 'ASC'
            }
        ],
        storeId: 'partsStore',
        enableAutoLoad: true,
        proxy: {
            type: 'Sqlite'
        }

    }
});