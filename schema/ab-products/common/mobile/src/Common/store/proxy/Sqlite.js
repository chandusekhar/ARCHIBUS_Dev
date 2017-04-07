/**
 * Provides a proxy interface for the Sqlite database. This class is based on
 * the Ext.data.proxy.SQL class but does not directly extend from the
 * Ext.data.proxy.SQL class.
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.proxy.Sqlite', {
    extend: 'Ext.data.proxy.Client',
    alias: 'proxy.Sqlite',
    mixins: ['Common.store.proxy.ChangeTableStructureOperation'],

    requires: 'Common.config.GlobalParameters',

    config: {

        /**
         * @cfg {Object} reader
         * @hide
         */
        reader: null,
        /**
         * @cfg {Object} writer
         * @hide
         */
        writer: null,

        /**
         * @cfg {String} table Name of the database table used
         *      to maintain the store data. The table name is
         *      generated from the name of the model associated
         *      with the proxy. If the proxy is assigned to
         *      Common.model.Building model the table name will
         *      be Building.
         */
        table: null,

        /**
         * @cfg {Array} columns. An array of columns names
         *      retrieved from the model definition. The array
         *      only includes column names of columns used in
         *      the database.
         */
        columns: '',

        /**
         * @cfg {Boolean} uniqueIdStrategy. True if the model is
         *      using a unique id. For most ARCHIBUS
         *      implementations this value will be false. Most
         *      implementations will use a 'simple' id strategy
         *      and let the database generate the sequential
         *      id's.
         */
        uniqueIdStrategy: false,

        /**
         * @cfg {String} defaultDataFormat The date format used
         *      when writing date data to the database
         */
        defaultDateFormat: 'Y-m-d H:i:s.000',

        /**
         * @cfg {Boolean} isSchemaCurrent True when the database
         *      table schema matches the table Model definition.
         *      The database schema is verified the first time
         *      the store accesses the database.
         */
        isSchemaCurrent: false,

        /**
         * @cfg {Boolean} throwExceptionOnError. When true any
         *      errors encountered when accessing the database
         *      result in an exception being thrown. When false,
         *      the exception event is generated when an error
         *      occurs
         */
        throwExceptionOnError: true
    },

    updateModel: function (model) {
        var modelName,
            defaultDateFormat,
            table;

        if (model) {
            modelName = model.modelName;
            defaultDateFormat = this.getDefaultDateFormat();
            table = modelName.slice(modelName.lastIndexOf('.') + 1);

            model.getFields().each(
                function (field) {
                    if (field.getType().type === 'date' && !field.getDateFormat()) {
                        field.setDateFormat(defaultDateFormat);
                    }
                });

            this.setUniqueIdStrategy(model.getIdentifier().isUnique);
            this.setTable(table);
            this.setColumns(this.getPersistedModelColumns(model));
        }

        this.callParent(arguments);
    },

    applyOperationParameters: function (params, operation) {
        var sorters = operation.getSorters(),
            filters = operation.getFilters(),
            page = operation.getPage(),
            start = operation.getStart(),
            limit = operation.getLimit();

        return Ext.apply(params, {
            page: page,
            start: start,
            limit: limit,
            sorters: sorters,
            filters: filters
        });
    },

    /**
     * Adds the results to the store. Throws an exception or fires the exception event if an error occurs.
     * @param {Ext.data.Operation} operation
     * @param {Object[]} resultSet
     */
    processResults: function (operation, resultSet) {
        var me = this,
            throwExceptionOnError = me.getThrowExceptionOnError(),
            action = operation.getAction();

        if (operation.process(action, resultSet) === false) {
            if (throwExceptionOnError) {
                throw new Error(me.getLocalizedErrorMessage(action));
            } else {
                me.fireEvent('exception', this, operation);
            }
        }
    },

    getLocalizedErrorMessage: function (action) {
        var message = '';

        switch (action) {
            case 'create':
                message = LocaleManager.getLocalizedString('Sqlite Proxy error during create operation', 'Common.store.proxy.Sqlite');
                break;
            case 'read':
                message = LocaleManager.getLocalizedString('Sqlite Proxy error during read operation', 'Common.store.proxy.Sqlite');
                break;
            case 'update':
                message = LocaleManager.getLocalizedString('Sqlite Proxy error during update operation', 'Common.store.proxy.Sqlite');
                break;
            case 'destroy':
                message = LocaleManager.getLocalizedString('Sqlite Proxy error during destroy operation', 'Common.store.proxy.Sqlite');
                break;
            default:
                message = LocaleManager.getLocalizedString('Sqlite Proxy error', 'Common.store.proxy.Sqlite');

        }
        return message;
    },

    create: function (operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            createOperation = function (transaction) {
                me.insertRecords(records, transaction, function (resultSet) {
                    me.processResults(operation, resultSet);
                    Ext.callback(callback, scope || me, [operation]);
                }, me, false);
            };

        operation.setStarted();
        me.executeOperation(createOperation);
    },

    read: function (operation, callback, scope) {
        var me = this,
            model = me.getModel(),
            idProperty = model.getIdProperty(),
            params = operation.getParams() || {},
            id = params[idProperty],
            readOperation = function (transaction) {
                me.selectRecords(transaction, id !== undefined ? id : params, function (resultSet) {

                    me.processResults(operation, resultSet);
                    Ext.callback(callback, scope || me, [operation]);
                });
            };

        params = me.applyOperationParameters(params, operation);

        operation.setStarted();
        me.executeOperation(readOperation);
    },

    update: function (operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            updateOperation = function (transaction) {
                me.updateRecords(transaction, records, function (resultSet) {
                    me.processResults(operation, resultSet);
                    Ext.callback(callback, scope || me, [operation]);
                });
            };

        operation.setStarted();
        me.executeOperation(updateOperation);
    },

    destroy: function (operation, callback, scope) {
        var me = this,
            records = operation.getRecords(),
            destroyOperation = function (transaction) {
                me.destroyRecords(transaction, records, function (resultSet) {
                    me.processResults(operation, resultSet);
                    Ext.callback(callback, scope || me, [operation]);
                });
            };

        operation.setStarted();
        me.executeOperation(destroyOperation);
    },

    /**
     * Executes the proxy operation
     *
     * @private
     * @param {Function} operationFunction
     */
    executeOperation: function (operationFunction) {
        var db = this.getDatabaseObject();

        this.checkCurrentSchema(function () {
            db.transaction(operationFunction);
        });
    },

    /**
     * Compares the current database table definition with the
     * model definition Creates the table if it does not exists.
     * Adds new columns to the table if they do not exist. The
     * check is executed one time before the first database
     * table access.
     *
     * @private
     * @param completedCallback
     * @param scope
     */
    checkCurrentSchema: function (completedCallback, scope) {
        var me = this,
            isSchemaCurrent = me.getIsSchemaCurrent(),
            onSchemaCheckCompleted = function () {
                me.setIsSchemaCurrent(true);
                Ext.callback(completedCallback, scope || me);
            };

        if (isSchemaCurrent) {
            onSchemaCheckCompleted();
        } else {
            me.createOrAlterTableIfNot(me.getTable(), me.getModel(), function () {
                me.setColumns(me.getPersistedModelColumns(me.getModel()));
                onSchemaCheckCompleted();
            });
        }
    },

    /**
     * Deletes all records from the database table. Resets the
     * Sqlite table id sequence
     *
     * @private
     * @param {Object} transaction The database transaction
     * @param {Function} callback Function called when the operation is complete.
     * @param {Object} scope The scope to execute the callback in.
     */
    deleteAllRecords: function (transaction, table, callback, scope) {
        var me = this,
            deleteSql = 'DELETE FROM ' + table,
            resetIdSql = 'DELETE FROM SQLITE_SEQUENCE WHERE name = ?';

        transaction.executeSql(deleteSql, null, function (transaction) {
            Log.log('Deleted records from table ' + table, 'info', arguments);
            transaction.executeSql(resetIdSql,
                [me.getTable()], function (tx) {
                    Ext.callback(callback, scope || me, [tx]);
                }, function (tx, error) {
                    alert('Error deleting records ' + error.message);
                    Ext.callback(callback, scope);
                });
        }, function (tx, error) {
            alert('Error deleting records ' + error.message);
            Ext.callback(callback, scope);
        });
    },

    deleteRecordsFromTables: function (tx, tables, onCompleted, scope) {
        var me = this;

        if (tables.length === 0) {
            Ext.callback(onCompleted, scope || me, [tx]);
        } else {
            Log.log('Delete records from Table [' + tables[0] + ']', 'info', me, arguments);
            me.deleteAllRecords(tx, tables[0], function () {
                tables.shift();
                me.deleteRecordsFromTables(tx, tables, onCompleted, scope);
            }, me);
        }
    },

    /**
     * Retrieves data from a model record.
     *
     * @private
     * @param {Ext.data.Model} record
     * @return {Object} data object
     */
    getDataFromModel: function (record) {
        var me = this,
            fields = record.getFields(),
            idProperty = record.getIdProperty(),
            uniqueIdStrategy = me.getUniqueIdStrategy(),
            data = {}, name, value;

        fields.each(function (field) {
            if (field.getPersist()) {
                name = field.getName();
                if (name === idProperty && !uniqueIdStrategy) {
                    return;
                }
                value = record.get(name);
                if (me.isFieldTypeDate(field.getType().type)) {
                    value = me.writeDate(value);
                }
                data[name] = value;
            }
        }, me);

        return data;
    },

    /**
     * Converts the Ext.data.Model data to a format suitable for inserting into the database
     * @deprecated
     * @param record
     * @returns {Object}
     */
    getRecordData: function (record) {
        return this.getDataFromModel(record);
    },

    /**
     * Inserts records into the Sqlite database. Based on the
     * insertRecords function in the Ext.data.proxy.SQL class.
     * The function has been modified to support inserting
     * records directly into the database without using the
     * associated data store.
     *
     * @param records
     * @param transaction
     * @param callback
     * @param scope
     */
    insertRecords: function (records, transaction, callback, scope) {
        var me = this,
            table = me.getTable(),
            columns = me.getColumns(),
            totalRecords = records.length,
            executed = 0,
            tmp = [], insertedRecords = [], errors = [],
            uniqueIdStrategy = me.getUniqueIdStrategy(),
            i, ln, placeholders, result;

        result = new Ext.data.ResultSet({
            records: insertedRecords,
            success: true
        });

        for (i = 0, ln = columns.length; i < ln; i++) {
            tmp.push('?');
        }
        placeholders = tmp.join(', ');

        Ext.each(records, function (record) {
            var id = record.getId(),
                data = me.getDataFromModel(record),
                values = me.getColumnValues(columns, data),
                sql = 'INSERT INTO ' + table + ' (' + columns.join(', ') + ') VALUES (' + placeholders + ')';

            transaction.executeSql(sql, values,
                function (transaction, resultSet) {
                    executed++;

                    insertedRecords.push({
                        clientId: id,
                        id: uniqueIdStrategy ? id : resultSet.insertId,
                        data: data,
                        node: data
                    });

                    if (executed === totalRecords) {
                        Ext.callback(callback, scope || me, [result, errors]);
                    }
                },
                function (transaction, error) {
                    executed++;
                    errors.push({
                        clientId: id,
                        error: error
                    });

                    if (executed === totalRecords) {
                        Ext.callback(callback, scope || me, [result, errors]);
                    }
                });
        });
    },

    /**
     * From Ext.data.proxy.SQL Override to correct error that
     * occurs if sorters are not defined
     *
     * @param transaction
     * @param params
     * @param callback
     * @param scope
     */
    selectRecords: function (transaction, params, callback, scope) {
        var me = this,
            table = me.getTable(),
            idProperty = me.getModel().getIdProperty(),
            sql = 'SELECT * FROM ' + table,
            records = [],
            sortStatement = ' ORDER BY ', i, ln, data, result,
            count, sorter, property, sqlTotalRecords;

        result = new Ext.data.ResultSet({
            records: records,
            success: true
        });

        if (!Ext.isObject(params)) {
            sql += ' WHERE ' + idProperty + ' = ' + params;
        } else {
            ln = params.filters && params.filters.length;
            sql += ProxyUtil.getFilterRestriction(params.filters);

            sqlTotalRecords = 'SELECT COUNT(*) AS TotalCount FROM ' + me.getTable();
            sqlTotalRecords += ProxyUtil.getFilterRestriction(params.filters);

            // 01.14.13 Added check if params.sorters exist
            ln = params.sorters && params.sorters.length;
            if (ln) {
                for (i = 0; i < ln; i++) {
                    sorter = params.sorters[i];
                    property = sorter.getProperty();
                    if (property !== null) {
                        sql += sortStatement + property + ' ' + sorter.getDirection();
                        sortStatement = ', ';
                    }
                }
            }

            // handle start, limit, sort, filter and group params
            // Override to handle the disablePaging property
            if (params.page !== undefined && params.page !== null && !isNaN(params.page) && !isNaN(params.start)) {
                sql += ' LIMIT ' + parseInt(params.start, 10) + ', ' + parseInt(params.limit, 10);
            }
        }

        Log.log(sql, 'verbose', me, arguments);

        me.executeSqlSelect(sql)
            .then(function (rows) {
                var rowDataArray = me.convertRowDataToArray(rows);
                return me.loadDocumentsFromFiles(rowDataArray);
            })
            .then(function (rowDataArray) {
                return me.loadFloorplansFromFiles(rowDataArray);
            })
            .then(function (rows) {
                count = rows.length;

                for (i = 0, ln = count; i < ln; i++) {
                    data = rows[i];
                    records.push({
                        clientId: null,
                        id: data[idProperty],
                        data: data,
                        node: data
                    });
                }
                return me.executeSqlSelect(sqlTotalRecords);
            })
            .then(function (rows) {
                var recordCount = rows.item(0).TotalCount;
                result.setSuccess(true);
                result.setTotal(recordCount);
                result.setCount(count);
                return Promise.resolve();
            })
            .then(null, function (error) {
                result.setSuccess(false);
                result.setTotal(0);
                result.setCount(0);
                Log.log(error, 'error', me, arguments);
                return Promise.resolve();
            })
            .done(function () {
                Ext.callback(callback, scope || me, [result]);
            });
    },

    executeSqlSelect: function (sql) {
        var db = this.getDatabaseObject();

        return new Promise(function (resolve, reject) {
            db.transaction(function (tx) {
                tx.executeSql(sql, null, function (tx, resultSet) {
                    resolve(resultSet.rows);
                }, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    },

    convertRowDataToArray: function (rowData) {
        var rowDataArray = [],
            count = rowData.length,
            ln,
            i;

        for (i = 0, ln = count; i < ln; i++) {
            rowDataArray.push(rowData.item(i));
        }

        return rowDataArray;
    },

    loadFloorplansFromFiles: function (rowDataArray) {
        var me = this,
            floorplanFields = me.getModelFloorplanFields(),
            useFileStorage = GlobalParameters.useFileStorage(),

            loadFloorplanFields = function () {
                var p = Promise.resolve();
                rowDataArray.forEach(function (row) {
                    p = p.then(function () {
                        return me.readFloorplansFromFile(row, floorplanFields)
                            .then(function () {
                                return Promise.resolve(rowDataArray);
                            });
                    });

                });
                return p;
            };

        if (floorplanFields.length === 0 || rowDataArray.length === 0 || !useFileStorage) {
            return Promise.resolve(rowDataArray);
        } else {
            return loadFloorplanFields();
        }

    },

    readFloorplansFromFile: function (row, floorplanFields) {
        var me = this,
            processFloorplanFields = function () {
                var p = Promise.resolve();
                floorplanFields.forEach(function (documentField) {
                    p = p.then(function () {
                        return me.readFloorplanFromFile(row, documentField);
                    });
                });
                return p;

            };

        return processFloorplanFields();
    },

    readFloorplanFromFile: function (row, floorplanField) {
        var fileName = row[floorplanField + '_file'],
            filePath = GlobalParameters.getUserFloorplanFolder() + '/' + fileName;

        if (Ext.isEmpty(fileName)) {
            return Promise.resolve(row);
        } else {
            return Common.device.File.readFile(filePath)
                .then(function (fileContent) {
                    row[floorplanField] = fileContent;
                    return Promise.resolve(row);
                }, function (error) {
                    return Promise.reject(error);
                });
        }
    },


    loadDocumentsFromFiles: function (rowDataArray) {
        var me = this,
            useFileStorage = GlobalParameters.useFileStorage(),
            documentFields = me.getModelDocumentFields(),
            loadDocumentFields = function () {
                var p = Promise.resolve();
                rowDataArray.forEach(function (row) {
                    p = p.then(function () {
                        return me.readDocumentsFromFile(row, documentFields)
                            .then(function () {
                                return Promise.resolve(rowDataArray);
                            });
                    });

                });
                return p;
            };

        if (documentFields.length === 0 || rowDataArray.length === 0 || !useFileStorage) {
            return Promise.resolve(rowDataArray);
        } else {
            return loadDocumentFields();
        }
    },

    readDocumentsFromFile: function (row, documentFields) {
        var me = this,
            processDocumentFields = function () {
                var p = Promise.resolve();
                documentFields.forEach(function (documentField) {
                    p = p.then(function () {
                        return me.readDocumentFromFile(row, documentField);
                    });
                });
                return p;

            };

        return processDocumentFields();
    },

    readDocumentFromFile: function (row, documentField) {
        var me = this,
            fileName = row[documentField.docField + '_file'],
            filePath = me.getDocumentFilePath(fileName),
            isNewDocument = row[documentField.docField + '_isnew'];

        if (Ext.isEmpty(fileName) || (isNewDocument === 'true')) {
            return Promise.resolve(row);
        } else {
            return Common.device.File.fileExists(filePath)
                .then(function() {
                    return Common.device.File.readFile(filePath)
                        .then(function (fileContent) {
                            row[documentField.docContentsField] = fileContent;
                            return Promise.resolve(row);
                        }, function (error) {
                            return Promise.reject(error);
                        });
                },function() {
                    return Promise.resolve(row);
                });
        }
    },

    getDocumentFilePath: function(fileName) {
        var me = this,
            documentFolder = GlobalParameters.getUserDocumentFolder();

        return documentFolder + '/' + me.getTable() + '/' + fileName;
    },

    /**
     * From Ext.data.proxy.SQL
     */
    updateRecords: function (transaction, records, callback, scope) {
        var me = this,
            table = me.getTable(),
            totalRecords = records.length,
            idProperty = me.getModel().getIdProperty(),
            executed = 0,
            updatedRecords = [],
            errors = [],
            result;

        result = new Ext.data.ResultSet({
            records: updatedRecords,
            success: true
        });

        Ext.each(records, function (record) {
            var id = record.getId(),
                data = me.getDataFromModel(record),
                updates = [],
                fieldsAndValues = me.getUpdateFieldsAndValues(record.modified, data),
                values = fieldsAndValues.values,
                sql;

            Ext.each(fieldsAndValues.columns, function (field) {
                updates.push(field + ' = ?');
            }, me);

            if (fieldsAndValues.columns.length === 0) {
                Ext.callback(callback, scope || me, [result, errors]);
            } else {
                sql = 'UPDATE ' + table + ' SET ' + updates.join(', ') + ' WHERE ' + idProperty + ' = ?';
                Log.log('Update: ' + sql + ' id: ' + id, 'verbose', me, arguments);
                transaction.executeSql(sql,
                    values.concat(id),
                    function () {
                        executed++;
                        updatedRecords.push({
                            clientId: id,
                            id: id,
                            data: data,
                            node: data
                        });

                        if (executed === totalRecords) {
                            Ext.callback(callback, scope || me, [result, errors]);
                        }
                    },
                    function (transaction, error) {
                        executed++;
                        errors.push({
                            clientId: id,
                            error: error
                        });

                        if (executed === totalRecords) {
                            Ext.callback(callback, scope || me, [result, errors]);
                        }
                    });
            }
        });
    },

    /**
     * From Ext.data.proxy.SQL
     */
    destroyRecords: function (transaction, records, callback, scope) {
        var me = this,
            table = me.getTable(),
            idProperty = me.getModel().getIdProperty(),
            ids = [],
            values = [],
            destroyedRecords = [],
            i, ln, result, record;

        for (i = 0, ln = records.length; i < ln; i++) {
            ids.push(idProperty + ' = ?');
            values.push(records[i].getId());
        }

        result = new Ext.data.ResultSet({
            records: destroyedRecords,
            success: true
        });

        transaction.executeSql('DELETE FROM ' + table + ' WHERE ' + ids.join(' OR '),
            values,
            function () {
                for (i = 0, ln = records.length; i < ln; i++) {
                    record = records[i];
                    destroyedRecords.push({
                        id: record.getId()
                    });
                }
                Ext.callback(callback, scope || me, [result]);

            }, function () {
                Ext.callback(callback, scope || me, [result]);
            });
    },

    /**
     * Override to use the SqliteConnectionManager class.
     *
     * @return {Object} The one and only database connection.
     */
    getDatabaseObject: function () {
        return SqliteConnectionManager.getConnection();
    },

    isFieldTypeDate: function (type) {
        var typeUpperCase = type.toUpperCase();

        return typeUpperCase === 'DATECLASS' ||
            typeUpperCase === 'TIMECLASS' ||
            typeUpperCase === 'DATE' ||
            typeUpperCase === 'TIMESTAMPCLASS';

    },

    writeDate: function (date) {
        if (date === null) {
            return date;
        } else {
            return Ext.Date.format(date, this.getDefaultDateFormat());
        }
    },

    getPersistedModelColumns: function (model) {
        var fields = model.getFields().items,
            uniqueIdStrategy = this.getUniqueIdStrategy(),
            idProperty = model.getIdProperty(),
            columns = [], ln = fields.length, i, field, name;

        for (i = 0; i < ln; i++) {
            field = fields[i];
            name = field.getName();

            if (name === idProperty && !uniqueIdStrategy) {
                continue;
            }

            if (field.getPersist() === true) {
                columns.push(field.getName());
            }
        }

        return columns;
    },

    getColumnValues: function (columns, data) {
        var ln = columns.length,
            values = [],
            i, column, value;

        for (i = 0; i < ln; i++) {
            column = columns[i];
            value = data[column];
            if (value !== undefined) {
                values.push(value);
            }
        }

        return values;
    },

    /**
     * Retrieves the data values for the fields that have been modified.
     * @param {Object} modified object containing the fields that have been modified
     * @param data The data for the model record
     * @returns {{columns: Array, values: Array}}
     */
    getUpdateFieldsAndValues: function (modified, data) {
        var field,
            columns = [],
            values = [],
            value;

        for (field in modified) {
            value = data[field];
            if (value !== undefined) {
                values.push(value);
                columns.push(field);
            }
        }

        return {columns: columns, values: values};
    },

    getModelDocumentFields: function () {
        var me = this,
            model = me.getModel(),
            documentFields = [];

        if (Ext.isFunction(model.getDocumentFields)) {
            documentFields = model.getDocumentFields();
        }

        return documentFields;
    },

    getModelFloorplanFields: function () {
        var me = this,
            model = me.getModel(),
            floorplanFields = [];

        if (Ext.isFunction(model.getFloorplanFields)) {
            floorplanFields = model.getFloorplanFields();
        }

        return floorplanFields;
    }
});