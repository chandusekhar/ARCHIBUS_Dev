Ext.define('Common.promise.util.DatabaseOperation', {
    requires: [
        'Common.store.proxy.SqliteConnectionManager',
        'Common.store.proxy.ProxyUtil'
    ],

    deleteAllRecordsFromTable: function (table, deleteAllRecordsOnSync) {
        var me = this;

        if (!deleteAllRecordsOnSync) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve, reject) {
                var db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                    deleteSql = 'DELETE FROM ' + table,
                    resetIdSql = 'DELETE FROM SQLITE_SEQUENCE WHERE name = ?';

                db.transaction(function (tx) {
                    tx.executeSql(deleteSql, null, function (tx) {
                        Log.log('Deleted records from table ' + table, 'verbose', me, arguments);
                        tx.executeSql(resetIdSql, [table], resolve,
                            function (tx, error) {
                                reject(error.message);
                            });
                    }, function (tx, error) {
                        reject(error.message);
                    });
                });
            });
        }
    },

    deleteRecords: function (records, table, keyFields) {
        var me = this;
        if (records.length === 0) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve, reject) {
                var db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                    deleteSql = 'DELETE FROM ' + table + ' WHERE ',
                    keyFieldsAndValues = me.convertDeletedRecordsFromServer(records, keyFields),
                    recordsToDelete = keyFieldsAndValues.length,
                    recordsDeleted = 0;

                db.transaction(function (tx) {
                    keyFieldsAndValues.forEach(function (keyField) {
                        var whereClause = me.generateDeleteWhereClause(keyField),
                            sql = deleteSql + whereClause.clause;

                        tx.executeSql(sql, whereClause.values, function () {
                            recordsDeleted++;
                            if (recordsDeleted === recordsToDelete) {
                                resolve();
                            }
                        }, function (tx, error) {
                            reject(error.message);
                        });
                    });
                });
            });
        }

    },

    generateDeleteWhereClause: function (keyFieldObject) {
        var me = this,
            whereClauseArray = [],
            values = [],
            value,
            p;

        for (p in keyFieldObject) {
            whereClauseArray.push(p + '= ?');
            value = keyFieldObject[p];
            if (Ext.isDate(value)) {
                value = me.formatDate(value);
            }
            values.push(value);
        }

        return {clause: whereClauseArray.join(' AND '), values: values};
    },


    /**
     * Converts the retrieved deleted records to an array of objects of keyFields and values
     * @param records
     * @param keyFields
     */
    convertDeletedRecordsFromServer: function (records, keyFields) {
        var convertedRecords = [],
            extractKeyFields = function (convertedRecord) {
                var keyFieldsAndValues = {};

                keyFields.forEach(function (keyField) {
                    if (convertedRecord.hasOwnProperty(keyField)) {
                        keyFieldsAndValues[keyField] = convertedRecord[keyField];
                    }
                });

                return keyFieldsAndValues;
            };

        records.forEach(function (record) {
            var data = {};
            record.fieldValues.forEach(function (field) {
                data[field.fieldName] = field.fieldValue;
            });
            convertedRecords.push(extractKeyFields(data));
        });

        return convertedRecords;
    },


    insertRecords: function (records, table, columns, model, deleteAllRecordsOnSync) {
        var me = this,
            insertPageSize = 500,
            numberOfPages = Math.ceil(records.length / insertPageSize),
            insertPageIndexArray = me.createInsertPageIndex(numberOfPages),
            errorMsg = 'The model object for table: [{0}] requires the uniqueIdentifier property to be defined.',
            uniqueId = [],
            values,
            p;

        if (!deleteAllRecordsOnSync) {
            if (Ext.isFunction(model.getUniqueIdentifier)) {
                uniqueId = model.getUniqueIdentifier();
            } else {
                return Promise.reject(Ext.String.format(errorMsg, table));
            }
        }

        values = me.getValues(records, columns, model, deleteAllRecordsOnSync, uniqueId);


        p = Promise.resolve();
        insertPageIndexArray.forEach(function (currentPage) {
            var valuesToInsert;
            p = p.then(function () {
                valuesToInsert = values.slice(currentPage * insertPageSize, (currentPage + 1) * insertPageSize);
                return me.doInsert(valuesToInsert, table, columns, deleteAllRecordsOnSync, uniqueId);
            });
        });
        return p;
    },

    doInsert: function (values, table, columns, deleteAllRecordsOnSync, uniqueId) {
        var me = this,
            totalValues = values.length;

        return new Promise(function (resolve, reject) {
            var placeholders,
                db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                tmp = [],
                errors = [],
                executed = 0,
                insertSql,
                deleteNullKeysSql,
                deleteSql = '';

            var insertHandlerFn = function () {
                    executed++;
                    if (executed === totalValues) {
                        resolve();
                    }
                },
                errorFn = function (tx, error) {
                    executed++;
                    errors.push({error: error});
                    if (executed === totalValues) {
                        reject(errors);
                    }
                },
                deleteErrorFn = function (tx, error) {
                    reject(error.message);
                };

            if (totalValues === 0) {
                resolve();
            } else {
                tmp = columns.map(function () {
                    return ('?');
                });

                placeholders = tmp.join(', ');

                insertSql = 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + placeholders + ')';

                if (!deleteAllRecordsOnSync) {
                    deleteNullKeysSql = 'DELETE FROM ' + table + me.generateNullWhereClause(uniqueId);
                    deleteSql = 'DELETE FROM ' + table + me.generateWhereClause(uniqueId);
                    db.transaction(function (tx) {
                        tx.executeSql(deleteNullKeysSql, null, function (tx) {
                            values.forEach(function (value) {
                                tx.executeSql(deleteSql, value.keyValues, function () {
                                    tx.executeSql(insertSql, value.fieldValues, insertHandlerFn, errorFn);
                                }, deleteErrorFn);
                            });
                        }, deleteErrorFn);
                    });
                } else {
                    // Start the transaction
                    db.transaction(function (tx) {
                        values.forEach(function (value) {
                            tx.executeSql(insertSql, value.fieldValues, insertHandlerFn, errorFn);
                        });
                    });
                }


            }
        });
    },

    generateWhereClause: function (uniqueIdentifier) {
        var whereClause = '',
            i;

        for (i = 0; i < uniqueIdentifier.length; i++) {
            if (i > 0) {
                whereClause += ' AND ';
            }
            whereClause += uniqueIdentifier[i] + ' = ? ';
        }

        return ' WHERE ' + whereClause;
    },

    /**
     * Generates a where clause for each of the identifier fields where the identifier
     * is null. When new records are created for transaction tables the key identifier value will
     * be null
     * @param uniqueIdentifier
     */
    generateNullWhereClause: function (uniqueIdentifier) {
        var whereClauseArray = [],
            whereClause = ' WHERE ';

        uniqueIdentifier.forEach(function (id) {
            whereClauseArray.push(id + ' IS NULL ');
        });

        whereClause += whereClauseArray.join(' OR ');

        return whereClause;

    },

    createTableIfNotExists: function (tableName, model) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var fields = ProxyUtil.constructFields(model),
                sql = 'CREATE TABLE IF NOT EXISTS ' + tableName + '(' + fields + ')',
                db = Common.store.proxy.SqliteConnectionManager.getConnection(),
                sqlIndexes = [];

            if (Ext.isFunction(model.getSqlIndexes)) {
                sqlIndexes = model.getSqlIndexes();
            }

            db.transaction(function (tx) {
                tx.executeSql(sql, null, function () {
                    me.createTableIndexes(tx, tableName, sqlIndexes)
                        .then(resolve, reject);
                }, function (tx, error) {
                    reject('Error creating table ' + tableName + ' error: ' + error.message);
                });
            });
        });
    },

    checkTableExists: function (tableName) {
        return new Promise(function (resolve, reject) {
            var db = SqliteConnectionManager.getConnection(),
                sql = 'SELECT sql FROM sqlite_master WHERE name=?';

            db.transaction(function (tx) {
                tx.executeSql(sql, [tableName], function (tx, results) {
                        var exists = results.rows.length > 0,
                            result = {exists: exists, result: results.rows};
                        resolve(result);
                    },
                    function (tx, error) {
                        reject(error.message);
                    });
            });
        });
    },

    createOrModifyTable: function (tableName, model) {
        var me = this;
        return new Promise(function (resolve, reject) {
            me.checkTableExists(tableName).then(function (result) {
                if (result.exists) {
                    // Check if changes need to be applied to the table
                    me.addColumnsToTable(result.result.item(0).sql, tableName, model).then(resolve, reject);
                    resolve();
                } else {
                    me.createTableIfNotExists(tableName, model)
                        .then(resolve, reject);
                }
            }, reject);

        });
    },

    addColumnsToTable: function (currentTableSql, tableName, model) {
        var me = this,
            databaseFields = me.parseTableDefinition(currentTableSql),
            modelFields = ProxyUtil.getDbFields(model),
            fieldsToAdd = me.compareSchemaToModel(databaseFields, modelFields);

        if (fieldsToAdd.length > 0 && me.isFieldToAddPrimaryKey(fieldsToAdd)) {
            // Drop and create a new table.
            return me.dropTable(tableName)
                .then(function () {
                    return me.createOrModifyTable(tableName, model);
                });
        }
        else if (fieldsToAdd.length > 0) {
            return me.doAddColumnsToTable(fieldsToAdd, tableName);
        } else {
            return Promise.resolve();
        }
    },

    /**
     * Checks if a new table field is a primary key field. Fields with primary
     * key constraints cannot be added to existing tables.
     * @param fieldsToAdd
     */
    isFieldToAddPrimaryKey: function (fieldsToAdd) {
        var isPrimaryKeyField = false;

        Ext.each(fieldsToAdd, function (field) {
            if (field.fieldType.indexOf('PRIMARY KEY') > 0) {
                isPrimaryKeyField = true;
                return false;
            }
        });

        return isPrimaryKeyField;
    },

    doAddColumnsToTable: function (fieldsToAdd, tableName) {
        var me = this,
            addColumns = function () {
                var p = Promise.resolve();
                fieldsToAdd.forEach(function (field) {
                    p = p.then(function () {
                        return me.addColumnToTable(tableName, field);
                    });
                });
                return p;
            };

        return addColumns();
    },

    addColumnToTable: function (tableName, field) {
        var db = SqliteConnectionManager.getConnection(),
            sql = 'ALTER TABLE ' + tableName + ' ADD COLUMN ' + field.fieldName + ' ' + field.fieldType,
            defaultUpdateSql = 'UPDATE ' + tableName + ' SET ' + field.fieldName + ' = ?';

        return new Promise(function (resolve, reject) {
            db.transaction(function (tx) {
                tx.executeSql(sql, null, function (tx) {
                    if (Ext.isEmpty(field.fieldDefault)) {
                        resolve();
                    } else {
                        tx.executeSql(defaultUpdateSql, [field.fieldDefault], resolve, function (tx, error) {
                            reject(error.message);
                        });
                    }
                }, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    },

    /**
     * Drops the table from the client database.
     * @param {String} tableName of the table to drop.
     * @returns {Promise} a resolved Promise when the operation completes, rejected Promise otherwise.
     */
    dropTable: function (tableName) {
        var db = SqliteConnectionManager.getConnection(),
            sql = 'DROP TABLE ' + tableName;

        return new Promise(function (resolve, reject) {
            db.transaction(function (tx) {
                tx.executeSql(sql, null, resolve, function (tx, error) {
                    reject(error.message);
                });
            });
        });
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

    createTableIndexes: function (tx, tableName, indexes) {
        var me = this,
            sqlTemplate = 'CREATE INDEX IF NOT EXISTS {0} ON {1} ({2})',
            totalIndexes = indexes.length,
            executed = 0;

        return new Promise(function (resolve, reject) {
            if (indexes.length === 0) {
                resolve();
            } else {
                Ext.each(indexes, function (index) {
                    var indexColumns = index.fields.join(','),
                        sql = Ext.String.format(sqlTemplate, index.indexName, tableName, indexColumns);

                    tx.executeSql(sql, null, function () {
                        executed++;
                        if (executed === totalIndexes) {
                            resolve();
                        }
                    }, function (tx, error) {
                        executed++;
                        Log.log(error, 'error');
                        reject(error);
                    });
                }, me);
            }
        });
    },

    /**
     * Parses the result returned from the SQLite master table query.
     *
     * @private
     * @param {String} tableDefinition The result of the SQLite master table query.
     * @return {Array} Column names of the SQLite database table.
     */
    // TODO: From Database Operation
    parseTableDefinition: function (tableDefinition) {
        var tableColumns = tableDefinition.match(/\((.+?)\)/)[1].split(',');

        return Ext.Array.map(tableColumns, function (column) {
            var field = Ext.String.trim(column).split(' ');
            return field[0];
        });
    },


    getValues: function (records, columns, model, deleteAllRecordsOnSync, uniqueIds) {
        var me = this,
            columnConfig = me.getColumnConfig(columns, model);

        return records.map(function (record) {
            return me.getRecordValues(record, columns, columnConfig, uniqueIds);
        });

    },

    getRecordValues: function (record, columns, columnConfig, uniqueIds) {
        var me = this,
            values = {};

        values.fieldValues = [];
        values.keyValues = [];

        columns.forEach(function (column) {
            var columnInfo = columnConfig[column],
                convertedValue,
                value;

            if (record.hasOwnProperty(column)) {
                convertedValue = columnInfo.convertFn.call(columnInfo.modelField, record[column]);
                if (convertedValue instanceof Common.type.CustomType) {
                    value = convertedValue.getValue();
                } else {
                    value = convertedValue;
                }
                if (columnInfo.isDateField) {
                    value = me.formatDate(value);
                }
            } else {
                value = columnInfo.modelField.getDefaultValue();
            }

            values.fieldValues.push(value);
        }, me);

        // Get the key values for the record
        values.keyValues = uniqueIds.map(function (id) {
            var value = record[id];
            if (Ext.isDate(value)) {
                value = me.formatDate(value);
            }
            return value;
        });

        return values;
    },


    getColumnConfig: function (columns, model) {
        var me = this,
            modelFields = model.getFields(),
            columnInfo = {};

        Ext.each(columns, function (column) {
            var modelField = modelFields.get(column),
                convertFn = modelField.getConvert(),
                modelFieldType = modelField.getType().type;

            columnInfo[column] = {};
            columnInfo[column].modelField = modelField;
            columnInfo[column].convertFn = convertFn;
            columnInfo[column].modelFieldType = modelFieldType;
            columnInfo[column].isDateField = me.isFieldTypeDate(modelFieldType);

        });

        return columnInfo;
    },

    isFieldTypeDate: function (type) {
        var typeUpperCase = type.toUpperCase();
        return typeUpperCase === 'DATECLASS' ||
            typeUpperCase === 'TIMECLASS' ||
            typeUpperCase === 'DATE' ||
            typeUpperCase === 'TIMESTAMPCLASS';

    },

    formatDate: function (date) {
        if (date === null) {
            return null;
        }
        return Ext.Date.format(date, 'Y-m-d H:i:s.u');
    },

    createInsertPageIndex: function (numberOfPages) {
        var pageIndexArray = [],
            i;

        for (i = 0; i < numberOfPages; i++) {
            pageIndexArray.push(i);
        }

        return pageIndexArray;
    },

    /**
     * Resets the mob_is_changed field to 0
     * @param {String} tableName The table to apply the update to.
     * @returns {Promise} A Promise object that is resolved when the operation completes.
     */
    resetMobIsChangedField: function (tableName) {
        return new Promise(function (resolve, reject) {
            var db = SqliteConnectionManager.getConnection(),
                sql = 'UPDATE ' + tableName + ' SET mob_is_changed = ?';

            db.transaction(function (tx) {
                tx.executeSql(sql, [0], resolve, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    }
});