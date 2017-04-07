/**
 * The ServiceDeskRequest store
 *
 * @author Cristina Reghina
 * @since 21.2
 */

Ext.define('WorkplacePortal.store.ServiceDeskRequests', {

    extend: 'Common.store.sync.SyncStore',
    requires: ['WorkplacePortal.model.ServiceDeskRequest'],

    serverTableName: 'activity_log_sync',
    serverFieldNames: [
        'activity_log_id',
        'activity_type',
        'date_requested',
        'status',
        'description',
        'site_id',
        'bl_id',
        'fl_id',
        'rm_id',
        'requestor',
        'phone_requestor',
        'prob_type',
        'doc1',
        'doc2',
        'doc3',
        'doc4'
    ],

    inventoryKeyNames: ['activity_log_id'],

    config: {
        model: 'WorkplacePortal.model.ServiceDeskRequest',
        storeId: 'serviceDeskRequestsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        remoteSort: true,
        autoSync: true,

        tableDisplayName: LocaleManager.getLocalizedString('Service Desk Requests', 'WorkplacePortal.store.ServiceDeskRequests'),

        documentTable: 'activity_log',
        documentTablePrimaryKeyFields: ['activity_log_id'],

        proxy: {
            type: 'Sqlite'
        },

        serviceDeskTypesRestriction: {
            clauses: [
                {
                    tableName: 'activity_log_sync',
                    fieldName: 'activity_type',
                    operation: 'EQUALS',
                    value: 'SERVICE DESK - COPY SERVICE',
                    relativeOperation: 'AND_BRACKET'
                },
                {
                    tableName: 'activity_log_sync',
                    fieldName: 'activity_type',
                    operation: 'EQUALS',
                    value: 'SERVICE DESK - DEPARTMENT SPACE',
                    relativeOperation: 'OR'
                },
                {
                    tableName: 'activity_log_sync',
                    fieldName: 'activity_type',
                    operation: 'EQUALS',
                    value: 'SERVICE DESK - FURNITURE',
                    relativeOperation: 'OR'
                },
                {
                    tableName: 'activity_log_sync',
                    fieldName: 'activity_type',
                    operation: 'EQUALS',
                    value: 'SERVICE DESK - INDIVIDUAL MOVE',
                    relativeOperation: 'OR'
                },
                {
                    tableName: 'activity_log_sync',
                    fieldName: 'activity_type',
                    operation: 'EQUALS',
                    value: 'SERVICE DESK - MAINTENANCE',
                    relativeOperation: 'OR'
                }
            ]
        },

        grouper: {
            groupFn: function (record) {
                return record.get('activity_type');
            },
            sortProperty: 'activity_type'
        },

        sorters: [
            {
                property: 'date_requested',
                direction: 'DESC'
            }
        ],

        sortByDateRequested: [
            {
                property: 'date_requested',
                direction: 'DESC'
            }
        ],

        sortByActivityType: [
            {
                property: 'activity_type',
                direction: 'ASC'
            },
            {
                property: 'date_requested',
                direction: 'DESC'
            }
        ]
    },

    /**
     * Override to allow us to add the services desk types restriction
     *
     * @override
     * @param restriction
     * @return {Promise}
     */
    checkOutRecords: function (restriction) {
        var clauses = this.getServiceDeskTypesRestriction().clauses;

        if (restriction.clauses) {
            restriction.clauses = restriction.clauses.concat(clauses);
        } else {
            restriction.clauses = clauses;
        }

        return this.callParent([restriction]);
    }

});