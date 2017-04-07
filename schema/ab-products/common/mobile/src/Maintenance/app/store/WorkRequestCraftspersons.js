Ext.define('Maintenance.store.WorkRequestCraftspersons', {
    extend: 'Common.store.sync.SyncStore',
    requires: 'Maintenance.model.WorkRequestCraftsperson',

    serverTableName: 'wrcf_sync',
    serverFieldNames: [
        'cf_id',
        'wr_id',
        'date_assigned',
        'time_assigned',
        'date_start',
        'time_start',
        'date_end',
        'time_end',
        'hours_straight',
        'hours_over',
        'hours_double',
        'hours_est',
        'work_type',
        'status',
        'comments',
        'mob_is_changed',
        'mob_locked_by',
        'mob_wr_id'
    ],

    inventoryKeyNames: [
        'wr_id',
        'cf_id',
        'date_assigned',
        'time_assigned'
    ],

    config: {
        model: 'Maintenance.model.WorkRequestCraftsperson',
        storeId: 'workRequestCraftspersonsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        autoSync: true,
        tableDisplayName: LocaleManager.getLocalizedString('Craftspersons', 'Maintenance.store.WorkRequestCraftspersons'),
        proxy: {
            type: 'Sqlite'
        }
    },

    /**
     * Override to allow us to set the mob_wr_id value with the
     * wr_id value
     *
     * @override
     * @param {Object[]} records
     * @return {Promise}
     */

    /*
    convertRecordsFromServer: function (records) {
        var me = this;

        return me.callParent([records])
            .then(function(records) {
                return me.setMobileWorkRequest(records);
            });

    },
    */

    importRecords: function(lastModifiedTimestamp) {
        var me = this;

        return me.callParent([lastModifiedTimestamp])
            .then(function() {
                return me.setMobileWorkRequest();
            });

    },

    /*
    setMobileWorkRequest: function (records) {
        var workRequestStore = Ext.getStore('workRequestsStore'),
            workRequestIdMap = workRequestStore.workRequestIdMap;

        Ext.each(records, function (record) {
            record.mob_wr_id = workRequestIdMap.get(record.wr_id);
        });
    }
    */

    setMobileWorkRequest: function(records) {
        var me = this,
            table = me.getProxy().getTable();
        return new Promise(function(resolve, reject) {
            var db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                sql = 'UPDATE ' + table + ' SET mob_wr_id = (SELECT mob_wr_id FROM WorkRequest WHERE WorkRequest.wr_id = ' + table + '.wr_id)';

            db.transaction(function(tx){
                tx.executeSql(sql, null, function() {
                    // records are passed through
                    resolve(records);
                }, function(tx, error) {
                    reject(error.message);
                });
            });
        });

    }
});