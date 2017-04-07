/**
 * Provides persistence and synchronization for WorkRequest domain object.
 *
 * Uses SQLite database for persistence.
 *
 * Uses DWR services for synchronization with the server.
 *
 * Specifies information required for mapping to the server-side table: serverTableName, inventoryKeyNames.
 *
 * The Store class encapsulates a cache of domain objects.
 *
 *
 * @author Valery Tydykov
 * @since 21.1
 *
 * 12.11.12 Set enableAutoLoad to true. JM
 */

Ext.define('Maintenance.store.WorkRequests', {
    extend: 'Common.store.sync.SyncStore',
    requires: [
        'Maintenance.model.WorkRequest',
        'Common.util.Ui'
    ],

    serverTableName: 'wr_sync',
    serverFieldNames: ['wr_id', 'bl_id', 'fl_id', 'rm_id', 'site_id', 'cf_notes', 'date_requested', 'description',
        'eq_id', 'location', 'priority', 'prob_type', 'requestor', 'tr_id', 'status', 'mob_locked_by',
        'mob_pending_action', 'mob_is_changed', 'mob_wr_id', 'pmp_id', 'date_assigned', 'date_est_completion',
        'cause_type', 'repair_type', 'doc1', 'doc2', 'doc3', 'doc4', 'request_type', 'date_escalation_completion',
        // 21.3
        'mob_stat_step_chg', 'mob_step_action', 'mob_step_comments',
        'escalated_response', 'escalated_completion',
        'step', 'step_log_id', 'step_type', 'step_status', 'step_user_name', 'step_em_id', 'step_role_name',
        'is_req_supervisor', 'is_req_craftsperson', 'is_wt_self_assign',
        'cost_est_labor', 'cost_est_parts', 'cost_est_other', 'cost_est_total',
        'cost_labor', 'cost_parts', 'cost_other', 'cost_total',
        'time_requested',
        'dv_id', 'dp_id', 'supervisor', 'parent_wr_id',
        //21.4
        'estimation_comp', 'scheduling_comp', 'work_team_id',
        // 23.1
        'doc1_isnew', 'doc2_isnew', 'doc3_isnew', 'doc4_isnew'
    ],

    inventoryKeyNames: ['wr_id', 'mob_locked_by'],

    workRequestIdMap: null,

    config: {
        model: 'Maintenance.model.WorkRequest',
        storeId: 'workRequestsStore',
        remoteFilter: true,
        remoteSort: true,
        autoSync: true,
        tableDisplayName: LocaleManager.getLocalizedString('Work Request', 'Maintenance.store.WorkRequests'),
        grouper: {
            groupFn: function (record) {
                var statusCode = record.get('status_initial');

                if (statusCode === 'I' || statusCode === 'A' || statusCode === 'AA' || statusCode === 'R') {
                    return Common.util.Ui.getEnumeratedDisplayValue('wr_sync', 'status', statusCode);
                } else if (statusCode.charAt(0) === 'H') {
                    return LocaleManager.getLocalizedString('On Hold', 'Maintenance.store.WorkRequests');
                } else if (statusCode === 'Com') {
                    return Common.util.Ui.getEnumeratedDisplayValue('wr_sync', 'status', statusCode);
                } else {
                    return LocaleManager.getLocalizedString('Other', 'Maintenance.store.WorkRequests');
                }
            }
        },

        documentTable: 'wr',
        documentTablePrimaryKeyFields: ['wr_id'],

        sorters: [
            {
                property: 'CASE'
                + ' WHEN status_initial = \'I\' THEN 1'
                + ' WHEN status_initial LIKE \'H%\' THEN 2'
                + ' WHEN status_initial = \'Com\' THEN 3'
                + ' ELSE 4'
                + ' END',
                direction: 'ASC'
            },
            {
                property: 'CASE'
                + ' WHEN date(date_escalation_completion) < date() THEN 1'
                + ' WHEN date(date_escalation_completion) = date() THEN 2'
                + ' ELSE 3'
                + ' END',
                direction: 'ASC'
            },
            {property: 'date_escalation_completion', direction: 'ASC'},
            {property: 'wr_id', direction: 'ASC'}
        ],

        autoLoaded: false,
        enableAutoLoad: false,
        proxy: {
            type: 'Sqlite'
        },

        /**
         * @cfg syncRemovedRecords {Boolean}
         * Do not sync records that are marked to be destroyed. Work request records are not destroyed
         * using the store.
         */
        syncRemovedRecords: false,

        /**
         * selected work requests for multiple selection
         */
        selectedWorkRequests: []
    },

    /**
     * the common sort by escalation array that is used by all Sort By cases
     */
    escalationSort: [
        {
            property: 'CASE'
            + ' WHEN date(date_escalation_completion) < date() THEN 1'
            + ' WHEN date(date_escalation_completion) = date() THEN 2'
            + ' ELSE 3'
            + ' END',
            direction: 'ASC'
        },
        {property: 'date_escalation_completion', direction: 'ASC'},
        {property: 'wr_id', direction: 'ASC'}
    ],

    /**
     * the group by status function
     */
    groupByStatus: function (record) {
        var statusCode = record.get('status_initial');

        if (statusCode === 'I' || statusCode === 'A' || statusCode === 'AA' || statusCode === 'R') {
            return Common.util.Ui.getEnumeratedDisplayValue('wr_sync', 'status', statusCode);
        } else if (statusCode.charAt(0) === 'H') {
            return LocaleManager.getLocalizedString('On Hold', 'Maintenance.store.WorkRequests');
        } else if (statusCode === 'Com') {
            return Common.util.Ui.getEnumeratedDisplayValue('wr_sync', 'status', statusCode);
        } else {
            return LocaleManager.getLocalizedString('Other', 'Maintenance.store.WorkRequests');
        }
    },

    /**
     * return the sort by status array
     */
    getSortByStatus: function () {
        return [
            {
                property: 'CASE'
                + ' WHEN status_initial = \'I\' THEN 1'
                + ' WHEN status_initial LIKE \'H%\' THEN 2'
                + ' WHEN status_initial = \'Com\' THEN 3'
                + ' ELSE 4'
                + ' END',
                direction: 'ASC'
            }
        ]
            .concat(this.escalationSort);

    },

    /**
     * the group by escalation function
     */
    groupByEscalation: function (record) {
        var dateEscalationCompletion = record.get('date_escalation_completion'),
            currentDate = new Date(),
            formattedCurrentDate = Ext.DateExtras.format(currentDate, 'yyyy-mm-dd'),
            formattedDateEscCompl;

        if (Ext.isDate(dateEscalationCompletion)) {
            formattedDateEscCompl = Ext.DateExtras.format(dateEscalationCompletion, 'yyyy-mm-dd');
            if (formattedDateEscCompl < formattedCurrentDate) {
                return LocaleManager.getLocalizedString('Overdue', 'Maintenance.store.WorkRequests');
            } else if (formattedDateEscCompl === formattedCurrentDate) {
                return LocaleManager.getLocalizedString('Due Today', 'Maintenance.store.WorkRequests');
            }
        }

        return LocaleManager.getLocalizedString('Pending', 'Maintenance.store.WorkRequests');
    },

    /**
     * return the sort by escalation array
     */
    getSortByEscalation: function () {
        return this.escalationSort;
    },

    /**
     * the group by location function
     */
    groupByLocation: function (record) {
        var blId = record.get('bl_id') || '',
            flId = record.get('fl_id') || '',
            rmId = record.get('rm_id') || '';

        return blId
            + (!Ext.isEmpty(flId) ? ' - ' : '') + flId
            + (!Ext.isEmpty(rmId) ? ' - ' : '') + rmId;
    },

    /**
     * return the sort by location array
     */
    getSortByLocation: function () {
        return [
            {property: 'bl_id', direction: 'ASC'},
            {property: 'fl_id', direction: 'ASC'},
            {property: 'rm_id', direction: 'ASC'}
        ].concat(this.escalationSort);
    },

    /**
     * the group by problem type function
     */
    groupByProblemType: function (record) {
        return record.get('prob_type');
    },

    /**
     * return the sort by problem type array
     */
    getSortByProblemType: function () {
        return [
            {property: 'prob_type', direction: 'ASC'}
        ].concat(this.escalationSort);
    },

    /**
     * Override to allow us to set the mob_wr_id field to the id field for all records that have been changed on the
     * mobile device
     *
     * @override
     * @param callback
     * @param scope
     */
    getChangedOnMobileRecords: function () {
        var me = this,
            paging = me.getDisablePaging();

        return new Promise(function (resolve) {
            // filter records with Changed on Mobile? = Yes
            // Setting the remote filter so that the store retrieves all of the
            // records from the mobile database
            // This will handle the case where there are modified records that are
            // not in the current page.

            me.clearFilter();
            me.filter('mob_is_changed', 1);
            // get filtered records from records loaded into the store

            // Disable paging so we can be sure that we retrieve all of the records
            me.setDisablePaging(true);

            me.load(function (records) {
                me.setMobileWrIdValues(records);
                me.clearFilter();
                // Reset the store page size
                me.setDisablePaging(paging);
                resolve(records);
            }, me);
        });


    },

    /**
     * Sets the mob_wr_id value to match the record id. Used during checkInRecords.
     *
     * @param records
     */
    setMobileWrIdValues: function (records) {
        Ext.each(records, function (record) {
            record.set('mob_wr_id', record.getId());
        });
    },

    /**
     * Override to allow us to set the mob_wr_id value with the wr_id value
     *
     * @override
     * @param {Object[]}
     * @return {Promise}
     */
    convertRecordsFromServer: function (records) {
        var me = this;

        return me.callParent([records])
            .then(function(records) {
                me.setRequestType(records);
                return Promise.resolve(records);
            });
    },

    setRequestType: function (records) {
        var me = this;

        Ext.each(records, function (record) {
            var requestType = record.request_type;
            record.request_type = requestType === null ? 0 : requestType;
            record.status_initial = record.status;
        }, me);
    },

    importRecords: function(lastModifiedTimestamp) {
        var me = this;

        return me.callParent([lastModifiedTimestamp])
            .then(function() {
                return me.setMobileWorkRequest();
            });
    },

    setMobileWorkRequest: function() {
        var me = this,
            table = me.getProxy().getTable();
        return new Promise(function(resolve, reject) {
            var db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                sql = 'UPDATE ' + table + ' SET mob_wr_id = id';

            db.transaction(function(tx){
                tx.executeSql(sql, null, resolve, function(tx, error) {
                    reject(error.message);
                });
            });
        });
    }
});