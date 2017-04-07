Ext.define('Common.store.EmployeeStandards', {
    extend : 'Common.store.sync.ValidatingTableStore',
    requires : [ 'Common.model.EmployeeStandard' ],

    serverTableName : 'emstd',

    serverFieldNames : [ 'em_std', 'description' ],
    inventoryKeyNames : [ 'em_std' ],

    config : {
        model : 'Common.model.EmployeeStandard',
        storeId : 'employeeStandardsStore',
        remoteSort : true,
        remoteFilter : true,
        sorters : [ {
            property : 'em_std',
            direction : 'ASC'
        } ],
        enableAutoLoad : true,
        proxy : {
            type : 'Sqlite'
        },
        tableDisplayName: LocaleManager.getLocalizedString('Employee Standards', 'Common.store.EmployeeStandards')
    }
});