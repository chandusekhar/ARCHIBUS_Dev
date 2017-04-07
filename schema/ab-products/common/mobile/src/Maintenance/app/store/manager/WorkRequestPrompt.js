Ext.define('Maintenance.store.manager.WorkRequestPrompt', {
    extend: 'Common.store.sync.SqliteStore',

    requires: ['Common.store.proxy.SqliteView'],

    config: {
        storeId: 'workRequestPromptStore',
        fields: [
            {
                name: 'wr_id',
                type: 'IntegerClass'
            },
            {
                name: 'description',
                type: 'string'
            },
            {
                name: 'status_initial',
                type: 'string'
            },
            {
                name: 'date_requested',
                type: 'DateClass'
            },
            {
                name: 'time_requested',
                type: 'TimeClass'
            }
        ],
        autoLoad: false,
        enableAutoLoad: true,
        remoteFilter: true,
        usesTransactionTable: true,

        /**
         * template for the proxy view definition
         */
        viewDefinitionTpl: 'SELECT wr_id, description, status_initial, date_requested, time_requested FROM WorkRequest'
        + ' WHERE wr_id IS NOT NULL' // exclude My Requests
        + ' {0}', // add list type filter (e.g. status_initial = 'AA' for Approved requests)

        proxy: {
            type: 'SqliteView',

            viewDefinition: 'SELECT wr_id, description, status_initial, date_requested, time_requested FROM WorkRequest' +
            ' WHERE wr_id IS NOT NULL',

            viewName: 'WorkRequestPrompt',

            baseTables: ['WorkRequest']
        },
        sorters: [
            {property: 'wr_id', direction: 'ASC'}
        ]
    }
});