Ext.define('Maintenance.store.WorkRequestCosts', {
    extend: 'Common.store.sync.SyncStore',
    requires: ['Maintenance.model.WorkRequestCost'],

    serverTableName: 'wr_other_sync',
    serverFieldNames: ['wr_id', 'date_used', 'other_rs_type', 'cost_estimated', 'cost_total', 'description',
        'qty_used', 'units_used', 'mob_is_changed', 'mob_locked_by', 'mob_wr_id'],

    inventoryKeyNames: ['wr_id', 'date_used', 'other_rs_type'],

    config: {
        model: 'Maintenance.model.WorkRequestCost',
        storeId: 'workRequestCostsStore',
        tableDisplayName: LocaleManager.getLocalizedString('Costs', 'Maintenance.store.WorkRequestCosts'),
        remoteFilter: true,
        enableAutoLoad: true,
        autoSync: true,
        proxy: {
            type: 'Sqlite'
        }
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
                sql = 'UPDATE ' + table + ' SET mob_wr_id = (SELECT mob_wr_id FROM WorkRequest WHERE WorkRequest.wr_id = ' + table + '.wr_id)';

            db.transaction(function(tx){
                tx.executeSql(sql, null, resolve, function(tx, error) {
                    reject(error.message);
                });
            });
        });

    }
});