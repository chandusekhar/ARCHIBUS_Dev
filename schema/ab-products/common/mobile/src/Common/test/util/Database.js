Ext.define('Common.test.util.Database', {

    require: [ 'Common.store.proxy.SqliteConnectionManager' ],

    singleton: true,

    getTableFields: function (tableName, callback, scope) {

        var db = Common.store.proxy.SqliteConnectionManager.getConnection();
        var me = this;
        var dbFields;

        db.transaction(function (tx) {
            tx.executeSql('SELECT sql FROM sqlite_master WHERE name=?', [ tableName ], function (tx, result) {
                dbFields = me.getDatabaseFieldsAndTypes(result.rows.item(0).sql);
                if (typeof callback === 'function') {
                    callback.call(scope || this, dbFields);
                }
            }, function (tx, error) {
                alert('Error ' + error);
            });
        });
    },

    getDatabaseFieldsAndTypes: function (createTableSql) {
        // get the location of the open and close parens
        var openParenIndex = createTableSql.indexOf('('), closeParenIndex = createTableSql.indexOf(')'), fieldDefinitions = createTableSql
                        .substring(openParenIndex + 1, closeParenIndex),
        // Make dbFields a mixed collection to make it easier to retrieve fields
                dbFields = new Ext.util.MixedCollection(), field;

        // split on the commas
        var fields = fieldDefinitions.split(',');

        for (var i = 0; i < fields.length; i++) {
            var f = Ext.String.trim(fields[i]);
            var items = f.split(' ');
            field = {
                fieldName: items[0],
                type: items[1]
            };
            dbFields.add(items[0], field);
        }

        return dbFields;
    },

    deleteWorkRequestSyncTestRecords: function(onCompleted, scope) {
        var me = this,
            db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            sql = 'DELETE FROM WorkRequest WHERE DESCRIPTION LIKE ?',
            description = '%TEST WORK REQUEST SYNC%';

        db.transaction(function (tx) {
            tx.executeSql(sql, [description], function () {
                if (typeof onCompleted === 'function') {
                    onCompleted.call(scope || me);
                }
            });
        });

    }
});