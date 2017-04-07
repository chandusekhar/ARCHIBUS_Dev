/**
 * Read only proxy that supports reading data from a SQLite database view.
 * The SqliteView class is used to combine data from different SQLite databases into one readonly store.
 * The SqliteView class creates a view in the SQLite database using the viewDefinition and viewName configuration
 * parameters.
 * The database view is dropped and created once per proxy object instantiation. The SQLite tables that the view is
 * created for must already exist in the database when the proxy creates the view.
 *
 *
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.proxy.SqliteView', {
    extend: 'Ext.data.proxy.Client',
    requires: [
        'Common.store.proxy.SqliteConnectionManager',
        'Common.store.proxy.ProxyUtil'
    ],

    alias: 'proxy.SqliteView',

    isSqliteViewProxy: true,

    config: {
        /**
         * @cfg {String/Function} viewDefinition The SQL view definition of the view used in the proxy. The view definition
         *      should include only the SQL select statement used to create the view.
         *      The viewDefinition can be defined as a function. This is useful if there are view parameters that are
         *      not available when the class definition is parsed.
         */
        viewDefinition: null,

        /**
         * @cfg {String} viewName The name of the view in the SQLite database.
         *
         */
        viewName: null,

        /**
         * @cfg {Boolean} isViewDefinitionCurrent True if the view has been created in the SQLite database, false
         *      if it has not been created. The view is dropped and created the first time the read
         *      operation is called.
         */
        isViewDefinitionCurrent: false,

        /**
         * @cfg {Array} baseTables Array containing the base tables for the view. The baseTable values are used
         * to verify that the tables are present in the database before the the view is created.
         */
        baseTables: [],

        /**
         * @cfg {Boolean} usesTransactionTable set to true if any of the view tables are used as a transaction
         * table. Used by the {#Common.util.SynchronizationManager} when loading the store after a sync.
         */
        usesTransactionTable: false,

        /**
         * @cfg {String} countTable. The table to use for the Total Count property. SQLite performs a full table
         * scan when executing the COUNT() command. In some cases the query runs forever and does not finish.
         * The countTable property can be used to force the count to be done on one of the tables contained in the
         * view.
         */
        countTable: null


    },

    /**
     * Returns the one and only database connection
     * @private
     * @returns {Object}
     */
    getDatabaseConnection: function () {
        return Common.store.proxy.SqliteConnectionManager.getConnection();
    },

    /**
     * Throws exception when a database error occurs
     * @private
     * @param {Object} transaction The database transaction
     * @param {Object} error The error object
     */
    throwDatabaseError: function (transaction, error) {
        throw new Error(LocaleManager.getLocalizedString('Database Error [SqliteView] ',
            'Common.store.proxy.SqliteView') + error.message);
    },

    /**
     * Sets the isViewDefinitionCurrent field to false when the viewDefinition is changed. This
     * will force the view to be created in the client database during the next read operation.
     * Note: Modifying the view definition requires that the store model is changed if the
     * view fields are changed.
     * @param newView
     */
    updateViewDefinition: function (newView, oldView) {
        // Only set the IsViewDefinitionCurrent flag when there is an existing view and the view
        // definition has changed.
        if (newView && oldView) {
            this.setIsViewDefinitionCurrent(false);
        }
    },

    /**
     * The create method is not supported for the SqliteView proxy class
     * @override
     */
    create: function () {
        throw new Error(LocaleManager.getLocalizedString(
            'SqlliteView is read only and does not support creating records.',
            'Common.store.proxy.SqliteView'));
    },

    /**
     * The update method is not supported for the SqliteView proxy class
     * @override
     */
    update: function () {
        throw new Error(LocaleManager.getLocalizedString(
            'SqliteView is read only and does not support updating records',
            'Common.store.proxy.SqliteView'));
    },

    /**
     * The destroy method is not supported for the SqliteView proxy class
     * @override
     */
    destroy: function () {
        throw new Error(LocaleManager.getLocalizedString(
            'SqliteView is read only and does not support deleting records',
            'Common.store.proxy.SqliteView'));
    },

    /**
     * @override
     * @param operation {Object} The proxy operation object
     * @param callback {Function} Callback executed when the read operation completes
     * @param scope {Object} The scope to execute the callback in
     */
    read: function (operation, callback, scope) {
        var me = this,
            viewDefinitionIsCurrent = me.getIsViewDefinitionCurrent(),
            baseTableCount = me.getBaseTables().length,
            params = operation.getParams() || {},
            errorMessage;

        params = me.applyOperationParameters(params, operation);
        operation.setParams(params);
        if (viewDefinitionIsCurrent) {
            Log.log('View definition is current ' + me.getViewName(), 'verbose', me, arguments);
            me.executeReadOperation(operation, callback, scope);
        } else {
            me.checkBaseTablesExist(function (numberOfTables) {
                if (numberOfTables === baseTableCount) {
                    me.dropAndCreateViewIfChanged(function (success) {
                        if (success) {
                            me.setIsViewDefinitionCurrent(true);
                            me.executeReadOperation(operation, callback, scope);
                        } else {
                            alert('error creating view ' + me.getViewName());
                        }
                    }, me);
                } else {
                    errorMessage = LocaleManager.getLocalizedString(
                        'The database does not contain the required table definitions for Sqllite view {0}',
                        'Common.store.proxy.SqliteView');
                    throw new Error(Ext.String.format(errorMessage, me.getViewName()));
                }
            }, me);
        }
    },

    // TODO: Duplicated in Common.store.proxy.Sqlite
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
     * Selects records from the database view
     * @param operation {Object} The proxy operation object
     * @param callback {Function} Callback executed when the executeReadOperation completes
     * @param scope {Object} The scope to execute the callback in
     * @throws Exception {Object} Throws exception if there is an error during the database access.
     */
    executeReadOperation: function (operation, callback, scope) {
        var me = this;

        me.selectRecords(operation, function (resultSet) {
            if (operation.process(operation.getAction(), resultSet) === false) {
                throw new Error(LocaleManager.getLocalizedString('Database error in SqliteView proxy.',
                    'Common.store.proxy.SqliteView'));
            }
            Ext.callback(callback, scope || me, [operation]);
        }, me);
    },

    /**
     * Creates the view in the Sqlite database
     * @param callback {Function} Callback executed when the createViewIfNotExists operation completes
     * @param scope {Object} The scope to execute the callback in
     */
    createViewIfNotExists: function (callback, scope) {
        var me = this,
            viewDefinition = me.getViewDefinition(),
            viewName = me.getViewName(),
            sql = 'CREATE VIEW IF NOT EXISTS ' + viewName + ' AS ' + viewDefinition,
            db = me.getDatabaseConnection(),

            onSuccess = function () {
                Ext.callback(callback, scope || me);
            };

        Log.log(sql, 'verbose', me, arguments);
        db.transaction(function (transaction) {
            transaction.executeSql(sql, null, onSuccess, me.throwDatabaseError);
        });
    },

    /**
     * Drops the view in the Sqlite database
     * @param {Function} callback Callback executed when the dropViewIfExists operation completes
     * @param {Object} scope The scope to execute the callback in
     */
    dropViewIfExists: function (callback, scope) {
        var me = this,
            db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            sql = 'DROP VIEW IF EXISTS ' + me.getViewName(),
            onSuccess = function () {
                me.createViewIfNotExists(callback, scope);
            };

        db.transaction(function (transaction) {
            transaction.executeSql(sql, [], onSuccess, me.throwDatabaseError);
        });
    },

    dropAndCreateViewIfChanged: function (onCompleted, scope) {
        var me = this,
            db = me.getDatabaseConnection(),
            viewName = me.getViewName(),
            viewDefinition = me.getViewDefinition(),
            dropViewSql = 'DROP VIEW IF EXISTS ' + viewName,
            createViewSql = 'CREATE VIEW ' + viewName + ' AS ' + viewDefinition,
            dbViewSql = 'SELECT sql FROM sqlite_master WHERE tbl_name = ?',
            errorFn = function (tx, error) {
                Log.log('Error creation SQLite view ' + error.message, 'error', me, arguments);
                Ext.callback(onCompleted, scope || me, [false]);
            };

        db.transaction(function (tx) {
            tx.executeSql(dbViewSql, [viewName], function (tx, result) {
                if (result.rows.length > 0) {
                    // Check if the existing view defintion matches the defined view definition
                    if (result.rows.item(0).sql.toLowerCase() === createViewSql.toLowerCase()) {
                        // The existing db view definition matches the store view definition. Do
                        // not alter the client database
                        Ext.callback(onCompleted, scope || me, [true]);
                    } else {
                        tx.executeSql(dropViewSql, null, function (tx) {
                            tx.executeSql(createViewSql, null, function () {
                                Log.log('CREATED VIEW ' + viewName, 'info', me, arguments);
                                Ext.callback(onCompleted, scope || me, [true]);
                            }, errorFn);
                        }, errorFn);
                    }
                } else {
                    // Create view
                    tx.executeSql(dropViewSql, null, function (tx) {
                        tx.executeSql(createViewSql, null, function () {
                            Log.log('CREATED VIEW ' + viewName, 'info', me, arguments);
                            Ext.callback(onCompleted, scope || me, [true]);
                        }, errorFn);
                    }, errorFn);
                }
            }, errorFn);
        });
    },

    /**
     * Verifies that the required view base tables are present in the database before creating the view.
     *
     * @param callback
     *            {Function} Called when the database access is complete. Returns the count of
     * @param scope
     */
    checkBaseTablesExist: function (callback, scope) {
        var me = this,
            db = Common.store.proxy.SqliteConnectionManager.getConnection(),
            baseTables = me.getBaseTables(),
            baseTableNames,
            sql,
            onSuccess = function (transaction, result) {
                Ext.callback(callback, scope || me, [result.rows.item(0).TableCount]);
            };

        // Build the restriction
        baseTableNames = Ext.Array.map(baseTables, function (table) {
            return "'" + table + "'";
        });

        sql = 'SELECT COUNT(*) AS TableCount FROM sqlite_master WHERE name IN(' +
            baseTableNames.join(',') + ')';

        db.transaction(function (transaction) {
            // TODO: Don't throw on error
            transaction.executeSql(sql, [], onSuccess, me.throwDatabaseError);
        });
    },

    /**
     * Generates the select statement using the object properties
     * @private
     * @param filters {Object} Filter object
     * @returns {string} The select statement
     *
     */
    getSelectStatement: function (filters, params) {
        var modelFields = this.getModel().getFields().items,
            whereClause = ProxyUtil.getFilterRestriction(filters),
            fields = [], selectFields, sql;

        Ext.each(modelFields, function (field) {
            var fieldName = field.getName();
            if (fieldName !== 'id') {
                fields.push(fieldName);
            }
        });

        selectFields = fields.join(',');

        sql = 'SELECT ' + selectFields + ' FROM ' + this.getViewName();

        // Replace = with LIKE to handle case sensitive searching. Do not replace = when it is part of a comparison operator: <= or >=
        whereClause = whereClause.replace(/[^<>]=/g, ' LIKE ');

        sql += whereClause;

        // handle start, limit, sort, filter and group
        // params
        // Override to handle the disablePaging property
        if (params.page !== undefined && params.page !== null && !isNaN(params.page) && !isNaN(params.start)) {
            sql += ' LIMIT ' + parseInt(params.start, 10) + ', ' + parseInt(params.limit, 10);
        }
        return sql;
    },

    /**
     * Selects records from the database view
     * @private
     */
    selectRecords: function (operation, callback, scope) {
        var me = this,
            params = operation.getParams() || {},
            db = me.getDatabaseConnection(),
            filters = operation.getFilters(),
            idProperty = me.getModel().getIdProperty(),
            records = [];

        db.transaction(function (transaction) {
            var result = new Ext.data.ResultSet({
                    records: records,
                    success: true
                }),
                sql = me.getSelectStatement(filters, params),
                i;

            Log.log(sql, 'verbose', me, arguments);
            transaction.executeSql(sql, null, function (transaction, resultSet) {
                var ln,
                    rows = resultSet.rows,
                    count = rows.length,
                    sqlTotalRecords,
                    data,
                    table = Ext.isEmpty(me.getCountTable()) ? me.getViewName() : me.getCountTable();

                for (i = 0, ln = count; i < ln; i++) {
                    data = rows.item(i);
                    records.push({
                        clientId: null,
                        id: data[idProperty],
                        data: data,
                        node: data
                    });
                }
                sqlTotalRecords = 'SELECT COUNT(*) AS TotalCount FROM ' + table;
                sqlTotalRecords += ProxyUtil.getFilterRestriction(params.filters);

                transaction.executeSql(sqlTotalRecords, null, function (tx, results) {
                    var recordCount = results.rows.item(0).TotalCount;

                    result.setSuccess(true);
                    result.setTotal(recordCount);
                    result.setCount(count);
                    Ext.callback(callback, scope || me, [result]);
                });
            }, function (transaction, errors) {
                result.setSuccess(false);
                result.setTotal(0);
                result.setCount(0);
                Log.log(errors, 'error', me, arguments);
                Ext.callback(callback, scope || me, [result]);
            });
        });
    },

    /**
     * Overrides the viewDefinition getter. Executes the viewDefinition funciton if the viewDefinition
     * is defined as a function.
     * @returns {*}
     */
    getViewDefinition: function() {
        var me = this;

        if(Ext.isFunction(me._viewDefinition)) {
            return me._viewDefinition.call(me);
        } else {
            return me._viewDefinition;
        }
    }
});