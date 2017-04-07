/**
 * Utility class to manage operations on TableDef objects
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.util.TableDef', {
    alternateClassName: [ 'TableDef' ],
    requires: 'Common.Session',

    singleton: true,

    /**
     * Extract the enumerated list information from the the TableDef Field Def
     *
     * @param {String} tableName  Name of the table that the TableDef represents
     * @param {String} fieldName  Name of the field to retrieve the enumerated list information.
     * @return {Object/String} Enumerated list object.
     */
    getEnumeratedList: function (tableName, fieldName) {
        var tableDefStore = Ext.getStore('tableDefsStore'),
            tableDefRecord = tableDefStore.findRecord('tableName', tableName),
            tableDefObject,
            enumFieldIndex,
            enumField;

        if (tableDefRecord) {
            tableDefObject = JSON.parse(tableDefRecord.get('tableDef'));
            enumFieldIndex = Ext.each(tableDefObject.fieldDefs, function (fieldDef) {
                if (fieldDef.name === fieldName) {
                    return false;
                }
            });

            enumField = tableDefObject.fieldDefs[enumFieldIndex];
            if (enumField) {
                return enumField.enumObjectToDisplay;
            } else {
                return '';
            }
        } else {
            return '';
        }
    },

    /**
     * Returns the Table Def record for the provided table.
     *
     * @param {String} tableName The table name of the Table Def. This is the name of the server side table.
     * @return {Ext.data.Model} The Table Def record. Returns null if the Table Def is not found in the store.
     */
    getTableDefRecord: function (tableName) {
        return Ext.getStore('tableDefsStore').findRecord('tableName', tableName);
    },

    /**
     * Returns the Table Def object for the provided table.
     *
     * @param tableName The table name of the Table Def. This is the name of the server side table.
     * @return {Object} The Table Def object
     */
    getTableDefObject: function (tableName) {
        var tableDefRecord = this.getTableDefRecord(tableName),
            tableDefString,
            tableDefObject;

        if (tableDefRecord === null) {
            tableDefObject = null;
        } else {
            tableDefString = tableDefRecord.get('tableDef');
            tableDefObject = this.tableDefFromString(tableDefString);
        }

        return tableDefObject;
    },

    /**
     * De-serializes TableDef from the string.
     *
     * @private
     * @param {String} tableDefAsString serialized TableDef.
     * @return {TableDef} de-serialized object.
     */
    tableDefFromString: function (tableDefAsString) {
        // de-serialize TableDef from the string
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
        // serialize TableDef to string
        return JSON.stringify(tableDef);
    },

    /**
     * Compares the TableDef objects. The TableDef objects are considered to be equal if all of the properties are
     * equal.
     *
     * @private
     * @param {TableDef} object1 the first TableDef object to compare
     * @param {TableDef} object2 the second TableDef object to compare
     * @return {Boolean} returns true if the objects are equal.
     */
    compareTableDefObject: function (object1, object2) {
        var object1PropertyCount,
            object2PropertyCount,
            property;

        object1PropertyCount = object1 === null ? 0 : Object.keys(object1).length;
        object2PropertyCount = object2 === null ? 0 : Object.keys(object2).length;

        if (object1PropertyCount !== object2PropertyCount) {
            return false;
        }

        for (property in object1) {
            if (typeof object1[property] === 'object') {
                if (!this.compareTableDefObject(object1[property], object2[property])) {
                    return false;
                }
            } else if (object1[property] !== object2[property]) {
                return false;
            }
        }

        return true;
    },

    /**
     * Saves the Table Def object to the client database
     *
     * @param {Object} tableDef The Table Def object to save to the database.
     */
    saveTableDef: function (tableDef, onCompleted, scope) {
        var me = this,
            tableDefRecord,
            tableDefStore = Ext.getStore('tableDefsStore');

        if (Ext.isEmpty(tableDef)) {
            throw new Error('Cannot save the TableDef object');
        }

        tableDefRecord = me.getTableDefRecord(tableDef.name);

        if (tableDefRecord === null) {
            tableDefRecord = new Common.model.TableDef();
        }

        tableDefRecord.set('tableDef', me.tableDefToString(tableDef));
        tableDefRecord.set('tableName', tableDef.name);
        // Check if the tableDef is in the store

        tableDefStore.add(tableDefRecord);
        tableDefStore.sync(function() {
            Ext.callback(onCompleted, scope || me);
        }, me);
    },

    /**
     * Returns the Field Def objects for the table as a Ext.util.MixedCollection.
     * @param {String} tableName
     * @returns {Ext.util.MixedCollection}
     */
    getTableDefFieldCollection: function (tableName) {
        var me = this,
            fieldCollection = new Ext.util.MixedCollection(),
            tableDef = me.getTableDefObject(tableName);

        if (tableDef) {
            Ext.each(tableDef.fieldDefs, function (fieldDef) {
                fieldCollection.add(fieldDef.name, fieldDef);
            }, me);
        }

        return fieldCollection;
    },

    /**
     * Retrieves the TableDef object from the server
     *
     * @param {String} serverTableName The name of the server side table.
     */
    getTableDefFromServer: function (serverTableName) {
        var session = Ext.create('Common.Session'),
            tableDef = null;

        session.doInSession(function () {
            tableDef = MobileSyncServiceAdapter.getTableDef(serverTableName);
        });

        return tableDef;
    },

    /**
     * Retrieves the TableDef object from the WebCentral server.
     * @param {String} serverTableName The name of the server side table that the TableDef represents
     * @param {Function} onCompleted Executed when service completes. The onCompleted function return parameter
     *        is an object { tableDef: [The tableDef object as a string], success: [boolean] true if there are no
     *        errors, exception: [the exception if one occurred]
     *
     * @param {Object} scope The scope to execute the callback in
     */
    getTableDefFromServerAsync: function (serverTableName, onCompleted, scope) {
        var me = this,
            session = Ext.create('Common.Session'),
            sessionResult = session.startSessionWithReturn();

        if (sessionResult.success) {
            MobileSyncServiceAdapter.getTableDefAsync(serverTableName, function (result) {
                session.endSession();
                Ext.callback(onCompleted, scope || me, [result]);
            }, me);
        } else {
            Ext.callback(onCompleted, scope || me, [
                {tableDef: null, success: false, exception: sessionResult.exception}
            ]);
        }
    },


    findFieldDef: function (tableDef, fieldName) {
        var fieldDefs,
            ln, i;

        if (!tableDef) {
            return null;
        }

        fieldDefs = tableDef.fieldDefs;
        ln = fieldDefs.length;

        for (i = 0; i < ln; i++) {
            if (fieldDefs[i].name === fieldName) {
                return fieldDefs[i];
            }
        }
        return null;
    },

    findForeignKey: function (tableDef, referenceTable) {
        var foreignKeys = tableDef.foreignKeys,
            ln = foreignKeys.length,
            i;

        for (i = 0; i < ln; i++) {
            if (foreignKeys[i].primaryTableName === referenceTable) {
                return foreignKeys[i];
            }
        }

        return null;
    },

    getTableDefFieldNames: function (tableDef) {
        if (Ext.isEmpty(tableDef)) {
            return [];
        }

        return Ext.Array.pluck(tableDef.fieldDefs, 'name');
    },

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
    },

    /**
     * Returns a copy of the tableDef object where the fieldDefs are converted from an array
     * of fieldDef objects to a single object where each property is the name of the fieldDef.
     * This allows us to more easily access the fieldDef properties in the fieldDefs collection.
     * @param {String} tableName The server table name of the tableDef to retrieve
     * @returns {Object}
     */
    getTableDefWithFieldDefsAsObject: function(tableName) {
        var me = this,
            tableDefCopy = Ext.clone(me.getTableDefObject(tableName)),
            fieldDefObject = {};

        Ext.each(tableDefCopy.fieldDefs, function(fieldDef) {
            fieldDefObject[fieldDef.name] = fieldDef;
        }, me);

        tableDefCopy.fieldDefs = fieldDefObject;
        return tableDefCopy;
    }
});