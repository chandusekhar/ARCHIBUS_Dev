Ext.define('Maintenance.store.WorkRequestParts', {
    extend: 'Common.store.sync.SyncStore',
    requires: [ 'Maintenance.model.WorkRequestPart' ],

    serverTableName: 'wrpt_sync',
    serverFieldNames: [ 'wr_id', 'part_id', 'date_assigned', 'time_assigned', 'qty_actual', 'qty_estimated',
        'comments', 'mob_is_changed', 'mob_locked_by','pt_store_loc_id', 'mob_wr_id' ],

    inventoryKeyNames: [ 'wr_id', 'part_id', 'date_assigned', 'time_assigned' ],

    config: {
        model: 'Maintenance.model.WorkRequestPart',
        storeId: 'workRequestPartsStore',
        enableAutoLoad: true,
        remoteFilter: true,
        autoSync: true,
        tableDisplayName: LocaleManager.getLocalizedString('Parts', 'Maintenance.store.WorkRequestParts'),
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