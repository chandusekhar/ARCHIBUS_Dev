/**
 * Read only store containing fields used by the Employee Last Name prompt control.
 */
Ext.define('WorkplacePortal.store.EmployeeLastNames', {
    extend: 'Common.store.sync.SqliteStore',

    requires: [ 'Common.store.proxy.SqliteView' ],

    config: {
        storeId: 'employeeLastNamesStore',
        fields: [
            {name: 'name_last', type: 'string'},
            {name: 'name_first', type: 'string'}
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT DISTINCT name_last, name_first FROM Employee WHERE name_last IS NOT NULL',

            viewName: 'employeeLastNames',

            baseTables: [ 'Employee' ]
        },
        sorters: [
            { property: 'name_last', direction: 'ASC'},
            { property: 'name_first', direction: 'ASC'}
        ]
    }
});
