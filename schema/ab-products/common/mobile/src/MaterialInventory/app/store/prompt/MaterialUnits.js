Ext.define('MaterialInventory.store.prompt.MaterialUnits', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['MaterialInventory.model.prompt.MaterialUnit'],

    serverTableName: 'bill_unit',

    serverFieldNames: ['bill_unit_id', 'description', 'bill_type_id', 'is_dflt'],
    inventoryKeyNames: ['bill_unit_id'],

    config: {
        model: 'MaterialInventory.model.prompt.MaterialUnit',
        remoteSort: true,
        remoteFilter: true,
        tableDisplayName: LocaleManager.getLocalizedString('Material Units', 'MaterialInventory.store.prompt.MaterialUnits'),
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
        storeId: 'materialUnits',
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
                value: 'MSDS - MASS',
                relativeOperation: 'OR_BRACKET'
            },
            {
                tableName: 'bill_unit',
                fieldName: 'bill_type_id',
                operation: 'EQUALS',
                value: 'MSDS - VOLUME',
                relativeOperation: 'OR_BRACKET'
            }
        ]
    }
});