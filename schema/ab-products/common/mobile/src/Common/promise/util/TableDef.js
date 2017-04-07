Ext.define('Common.promise.util.TableDef', {
    singleton: true,


    /***
     * Converts the tableDef object to a string and writes it to the client database
     * @param {Object} tableDef
     * @returns {Promise}
     */
    saveTableDef: function (tableDef) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var tableDefRecord,
                tableDefStore = Ext.getStore('tableDefsStore');

            if (Ext.isEmpty(tableDef)) {
                reject('Cannot save the TableDef object');
            }

            // KB 3053640. Use exact match when searching the store for records.
            tableDefRecord = tableDefStore.findRecord('tableName', tableDef.name, 0, false, false, true);

            if (tableDefRecord === null) {
                tableDefRecord = new Common.model.TableDef();
            }

            tableDefRecord.set('tableDef', me.tableDefToString(tableDef));
            tableDefRecord.set('tableName', tableDef.name);
            // Check if the tableDef is in the store

            tableDefStore.add(tableDefRecord);

            tableDefStore.sync(function () {
                resolve();
            }, me);
        });
    },

    /**
     * De-serializes TableDef from the string.
     *
     * @private
     * @param {String} tableDefAsString serialized TableDef.
     * @return {TableDef} de-serialized object.
     */
    tableDefFromString: function (tableDefAsString) {
        return JSON.parse(tableDefAsString);
    },

    /**
     * Serializes TableDef to string.
     *
     * @private
     * @param {TableDef} tableDef to be serialized.
     * @return {String} serialized tableDef.
     */
    tableDefToString: function (tableDef) {
        return JSON.stringify(tableDef);
    },

    /**
     * Returns the Table Def object for the provided table.
     *
     * @param {String} tableName The table name of the Table Def. This is the name of the server side table.
     * @return {Object} The Table Def object
     */
    getTableDefObject: function (tableName) {
        var me = this,
            tableDefRecord = Ext.getStore('tableDefsStore').findRecord('tableName', tableName),
            tableDefString,
            tableDefObject;

        if (tableDefRecord === null) {
            tableDefObject = null;
        } else {
            tableDefString = tableDefRecord.get('tableDef');
            tableDefObject = me.tableDefFromString(tableDefString);
        }

        return tableDefObject;
    },

    getTableDefFromServer: function (serverTableName) {
       return MobileSyncServiceAdapter.getTableDef(serverTableName);
    },

    /**
     * Returns the primary key fields for the server side table defined in the TableDef
     * @param {Object} tableDef The TableDef object
     * @returns {*|Array}
     */
    getPrimaryKeyFieldsFromTableDef: function (tableDef) {
        var primaryKeys = [],
            sortedKeyFields;

        Ext.each(tableDef.fieldDefs, function (field) {
            if (field.primaryKey) {
                primaryKeys.push({fieldName: field.name, primaryKeyIndex: field.primaryKeyIndex});
            }
        });

        sortedKeyFields = primaryKeys.sort(function (a, b) {
            return(a.primaryKeyIndex - b.primaryKeyIndex);
        });

        return Ext.Array.pluck(sortedKeyFields, 'fieldName');
    }

});