Ext.define('Maintenance.store.manager.SupervisorEmployee', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'supervisorEmployeeStore',
        fields: [
            {
                name: 'em_id',
                type: 'string'
            },
            {
                name: 'name_first',
                type: 'string'
            },
            {
                name: 'name_last',
                type: 'string'
            },
            {
                name: 'email',
                type: 'string'
            }
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        usesTransactionTable: true,

        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT  DISTINCT em_id,name_first, name_last, email FROM Employee em'
            + ' WHERE  EXISTS (SELECT cf_id FROM Craftsperson cf WHERE cf.email = em.email AND cf.is_supervisor = 1)',

            viewName: 'supervisorEmployeePrompt',

            baseTables: ['Employee', 'Craftsperson']
        },
        sorters: [
            {property: 'em_id', direction: 'ASC'}
        ]
    }
});