/**
 * Read only store containing fields used by the Employee First Name prompt control.
 */
Ext.define('WorkplacePortal.store.EmployeeFirstNames', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [ 'Common.store.proxy.SqliteView' ],

    config: {
        storeId: 'employeeFirstNamesStore',
        fields: [
            {name: 'name_first', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT DISTINCT name_first FROM Employee WHERE name_first IS NOT NULL',

            viewName: 'employeeFirstNames',

            baseTables: [ 'Employee' ]
        },
        sorters: [
            { property: 'name_first', direction: 'ASC'}
        ]
    }
});
