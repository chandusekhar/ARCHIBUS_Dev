Ext.define('Common.store.PlanTypeGroups', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Common.model.PlanTypeGroup'],

    serverTableName: 'plantype_groups',
    serverFieldNames: ['plan_type', 'mob_activity_id', 'active', 'display_order', 'plantype_group'],

    inventoryKeyNames: ['plan_type', 'mob_activity_id'],

    config: {
        model: 'Common.model.PlanTypeGroup',
        storeId: 'planTypeGroups',
        enableAutoLoad: true,
        remoteFilter: true,
        disablePaging: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Plan Type Groups', 'Common.store.PlanTypeGroups'),
        restriction: [
            {
                tableName: 'plantype_groups',
                fieldName: 'mob_activity_id',
                operation: 'IS_NOT_NULL',
                value: null
            }
        ]
    }
});