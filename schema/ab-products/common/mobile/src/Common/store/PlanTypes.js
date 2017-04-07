Ext.define('Common.store.PlanTypes', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.PlanType' ],

    serverTableName : 'active_plantypes',
    serverFieldNames : [ 'plan_type', 'active', 'view_file', 'hs_ds',
        'label_ds', 'label_ht', 'view_file2', 'hs_ds2', 'label_ds2',
        'label_ht2', 'title' ],

    inventoryKeyNames : [ 'plan_type' ],

    config : {
        model : 'Common.model.PlanType',
        storeId : 'planTypes',
        enableAutoLoad : true,
        remoteFilter : true,
        disablePaging : true,
        proxy : {
            type : 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Plan Types', 'Common.store.PlanTypes')
    }
});