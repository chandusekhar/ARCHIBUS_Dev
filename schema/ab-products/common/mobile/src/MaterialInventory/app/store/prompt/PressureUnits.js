Ext.define('MaterialInventory.store.prompt.PressureUnits', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.prompt.PressureUnit'],

    serverTableName: 'bill_unit',

    serverFieldNames: ['bill_unit_id', 'description', 'bill_type_id', 'is_dflt'],
    inventoryKeyNames: ['bill_unit_id'],

    config: {
        model: 'MaterialInventory.model.prompt.PressureUnit',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Pressure Units', 'MaterialInventory.store.prompt.PressureUnits'),
        sorters: [
            {
                property: 'bill_type_id',
                direction: 'ASC'
            },
            {
                property: 'is_dflt',
                direction: 'DESC'
            }
        ],
        storeId: 'pressureUnits',
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        },
        restriction: [
            {
                tableName: 'bill_unit',
                fieldName: 'bill_type_id',
                operation: 'EQUALS',
                value: 'MSDS - PRESSURE'
            }
        ]
    }
});