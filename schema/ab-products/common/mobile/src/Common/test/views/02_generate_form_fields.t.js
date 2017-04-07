/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/*jshint newcap: false */
StartTest(function (t) {

    t.requireOk('Common.util.Ui', 'Common.store.AppPreferences', 'Common.store.TableDefs',
        'Common.log.Logger', 'Common.config.GlobalParameters', function () {

        var appPreferences = Ext.create('Common.store.AppPreferences');
        var tableDefStore = Ext.create('Common.store.TableDefs');
        var async = t.beginAsync();

        tableDefStore.load(function() {
            var eqAuditRecord,
                eqAuditTableDef,
                eqAuditTableDefString;

            // Check for the existence of the eq_audit table def
            // Load it if it does not exist
            eqAuditRecord = tableDefStore.findRecord('tableName', 'eq_audit');
            if(eqAuditRecord === null) {
                eqAuditTableDef = TableDef.getTableDefFromServer('eq_audit');
                eqAuditTableDefString = TableDef.tableDefToString(eqAuditTableDef);
                tableDefStore.add({tableName: 'eq_audit', tableDef: eqAuditTableDefString });
            }

            appPreferences.load( function () {
                Common.util.Ui.generateFormFields('eq_audit');
                t.endAsync(async);
                t.done();
            });
        }, this);

    });
});