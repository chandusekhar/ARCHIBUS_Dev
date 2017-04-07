/**
 * Manages the checking and updating of the SQLite database table schema. The database table schema definition is
 * determined by the associated {@link Ext.data.Model} field definition.
 * This class is used as a mixin in the {@link Common.store.proxy.Sqlite} class.
 * The database table schema is checked once per proxy class instantiation.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.proxy.ChangeTableStructureOperation', {

    requires: [
        'Common.store.proxy.SqliteConnectionManager',
        'Common.store.proxy.ProxyUtil'
    ],

    /**
     * Called when the Change Table operation is complete. The function is initialized by the
     * createOrAlterTableIfNot function. The empty function definition is provided to handle the case
     * where one of the check table functions is called directly.
     */
    onChangeTableComplete: Ext.emptyFn,

    onDatabaseError: function (transaction, error) {
        throw new Error(LocaleManager.getLocalizedString('Database error: ',
            'Common.store.proxy.ChangeTableStructureOperation') + error.message);
    },

    /**
     * Creates a table in the database if the table does not exists. If the table exists, the existing
     * database schema definition is compared to the Model instance. Fields defined in the Model that
     * are not in the database are created in the database.
     *
     * @param {String} tableName Name of the table to operate on
     * @param {Ext.data.Model} model The model instance associated with this table.
     * @param {Function} successCallback Called when the operation is complete.
     * @param {Object} scope The scope to execute the successCallback function.
     */
    createOrAlterTableIfNot: function (tableName, model, successCallback, scope) {
        var me = this;

        me.onChangeTableComplete = function (action) {
            if (typeof successCallback === 'function') {
                successCallback.call(scope || me, action);
            }
        };

        me.checkTableExists(tableName, model);

    },

    /**
     * Checks if the table exists in the database. If the table does not exist it is created. If the
     * table exists in the database the database schema is compared to the Model instance. Calls the
     * ALTER Database operation if there is a difference between the database schema and Model.
     *
     * @param {String} tableName The name of the table to check.
     * @param {Ext.data.Model} model The Model associated with the table.
     */
    checkTableExists: function (tableName, model) {
        // TODO naming: checkTableExists contradicts createTable,addColumnsToTable - this method actually modifies schema
        var me = this,
            db = SqliteConnectionManager.getConnection(),
            sql = 'SELECT sql FROM sqlite_master WHERE name=?',
            noChangeMessage = LocaleManager.getLocalizedString('No database table change applied. [{0}]',
                'Common.store.proxy.ChangeTableStructureOperation');

        db.transaction(function (transaction) {
            transaction.executeSql(sql, [ tableName ], function (transaction, results) {
                var databaseFields, modelFields, fieldsToAdd;

                if (results.rows.length === 0) {
                    // The table does not exist, create it.
                    me.createTable(transaction, tableName, model);
                } else {
                    // Process table definition result
                    databaseFields = me.parseTableDefinition(results.rows.item(0).sql);
                    modelFields = ProxyUtil.getDbFields(model);
                    fieldsToAdd = me.compareSchemaToModel(databaseFields, modelFields);

                    // If the fieldNamesToAdd array is empty then we are finished
                    if (fieldsToAdd.length > 0) {
                        // Add new columns to the database.
                        me.addColumnsToTable(transaction, fieldsToAdd, tableName);
                        if (typeof me.getProxy === 'function') {
                            var proxy = me.getProxy();
                            proxy.setColumns(proxy.getPersistedModelColumns(model));
                        }
                    } else {
                        me.onChangeTableComplete(Ext.String.format(noChangeMessage, tableName));
                    }
                }
            }, me.onDatabaseError);
        });
    },

    /**
     * Creates the table in the SQLite database.
     *
     * @param {Object} transaction The open database transaction.
     * @param {String} tableName The name of the table to create.
     * @param {Ext.data.Model} model The model associated with this table.
     */
    createTable: function (transaction, tableName, model) {
        var me = this,
            sql = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(' + ProxyUtil.constructFields(model) + ')',
            createdTableMessage = 'Created Table [' + tableName + ']';

        transaction.executeSql(sql, null, function () {
            var sqlIndexes = [];

            Log.log(createdTableMessage,'info', me, arguments);
            // Get any defined indexes for this table
            if (Ext.isFunction(model.getSqlIndexes)) {
                sqlIndexes = model.getSqlIndexes();
            }
            me.createTableIndexes(transaction, tableName, sqlIndexes, function () {
                me.onChangeTableComplete(Ext.String.format(createdTableMessage, tableName));
            }, me);
        }, me.onDatabaseError);
    },

    createTableIndexes: function (tx, tableName, indexes, onCompleted, scope) {
        var me = this,
            sqlTemplate = 'CREATE INDEX IF NOT EXISTS {0} ON {1} ({2})',
            totalIndexes = indexes.length,
            executed = 0;

        if (indexes.length === 0) {
            Ext.callback(onCompleted, scope || me);
        } else {
            // Generate SQL from index config
            Ext.each(indexes, function (index) {
                var indexColumns = index.fields.join(','),
                    sql = Ext.String.format(sqlTemplate, index.indexName, tableName, indexColumns);

                tx.executeSql(sql, null, function () {
                    executed++;
                    if (executed === totalIndexes) {
                        Ext.callback(onCompleted, scope || me);
                    }
                }, function (tx, error) {
                    executed++;
                    // TODO: What to do with the error
                    alert('error ' + error.message);
                    if (executed === totalIndexes) {
                        Ext.callback(onCompleted, scope || me);
                    }
                });
            }, me);
        }
    },

    /**
     * Compares the existing database table columns with the fields defined in the associated Model.
     *
     * @param {Array} databaseColumns Database column names.
     * @param {Ext.util.MixedCollection} modelFields The Model fields collection.
     * @return {Array} Fields contained in the Model that are not in the database.
     */
    compareSchemaToModel: function (databaseColumns, modelFields) {

        var fieldsToAdd = [],
            modelFieldNames = Ext.Array.pluck(modelFields, 'name'),
        // Get the difference between the database and model field arrays
            fieldNamesToAdd = Ext.Array.difference(modelFieldNames, databaseColumns);

        Ext.each(fieldNamesToAdd, function (addField) {
            var field = null;
            Ext.each(modelFields, function (fieldObj) {
                if (fieldObj.name === addField) {
                    fieldsToAdd.push({
                        fieldName: fieldObj.name,
                        fieldType: fieldObj.type,
                        fieldDefault: fieldObj.defaultValue
                    });
                    field = fieldObj;
                    return false;
                }
            }, this);
        }, this);

        return fieldsToAdd;

    },

    /**
     * Executes the ALTER TABLE statement in the database. Updates the added fields default value if it
     * is defined in the Model field.
     *
     * @param {Object} transaction Current database transaction.
     * @param {Array} fieldsToAdd Field objects to add to the database table.
     * @param {String} tableName The name of the table to alter.
     */
    addColumnsToTable: function (transaction, fieldsToAdd, tableName) {
        var me = this,
            noDefaultValueMessage = LocaleManager.getLocalizedString('No default value update for field: [{0}]',
                'Common.store.proxy.ChangeTableStructureOperation'),
            updateDefaultValueMessage = LocaleManager.getLocalizedString('Update default value: field [{0}]',
                'Common.store.proxy.ChangeTableStructureOperation');

        Ext.each(fieldsToAdd, function (field) {
            var sql = 'ALTER TABLE ' + tableName + ' ADD COLUMN ' + field.fieldName + ' ' + field.fieldType;
            transaction.executeSql(sql, [], function (transaction) {
                if (Ext.isEmpty(field.fieldDefault)) {
                    me.onChangeTableComplete(Ext.String.format(noDefaultValueMessage, field.fieldName));
                    return;
                }
                // update field to have default value
                transaction.executeSql('UPDATE ' + tableName + ' SET ' + field.fieldName + ' = ?',
                    [ field.fieldDefault ], function () {
                        me.onChangeTableComplete(Ext.String.format(updateDefaultValueMessage, field.fieldName));
                    }, me.onDatabaseError);

            }, me.onDatabaseError);
        });

    },

    /**
     * Parses the result returned from the SQLite master table query.
     *
     * @private
     * @param {String} tableDefinition The result of the SQLite master table query.
     * @return {Array} Column names of the SQLite database table.
     */
    parseTableDefinition: function (tableDefinition) {
        var tableColumns = tableDefinition.match(/\((.+?)\)/)[1].split(',');

        return Ext.Array.map(tableColumns, function (column) {
            var field = Ext.String.trim(column).split(' ');
            return field[0];
        });
    },

    /**
     * Drops and creates the database table.
     *
     * @param {String} tableName The name of the table to operate on
     * @param {Ext.data.Model} model The model associated with the database table.
     * @param {Function} callback Callback called when the operation is complete.
     * @param {Object} scope The scope to execute the callback function.
     */
    dropAndCreateTable: function (tableName, model, callback, scope) {
        var me = this,
            db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            sqlDrop = 'DROP TABLE IF EXISTS ' + tableName,
            sqlCreate = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(' + ProxyUtil.constructFields(model) + ')',
            onSuccess = function () {
                Ext.callback(callback, scope || me);
            };

        db.transaction(function (transaction) {
            transaction.executeSql(sqlDrop, [], Ext.emptyFn, me.onDatabaseError);
            transaction.executeSql(sqlCreate, [], onSuccess, me.onDatabaseError);
        });
    },

    createTableIfNotExists: function (tableName, model, onCompleted, scope) {
        var me = this,
            sql = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(' + ProxyUtil.constructFields(model) + ')',
            createdTableMessage = 'Created Table [' + tableName + ']',
            db = Common.store.proxy.SqliteConnectionManager.getConnection();

        db.transaction(function (tx) {
            tx.executeSql(sql, null, function () {
                Log.log(createdTableMessage, 'info', me, arguments);
                Ext.callback(onCompleted, scope || me);
            }, function (tx, error) {
                Log.log('Error creating table ' + tableName + ' error: ' + error.message, 'error', me, arguments);
                Ext.callback(onCompleted, scope || me);
            });
        });
    }
});