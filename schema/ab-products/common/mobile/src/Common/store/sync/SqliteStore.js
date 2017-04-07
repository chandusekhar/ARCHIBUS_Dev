/**
 * Provides persistence to application domain objects/models.
 * Uses SQLite database for persistence.
 * Holds properties that override default behavior or values inherited from the parent class.
 * The Store class encapsulates a cache of domain objects.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 *
 */
Ext.define('Common.store.sync.SqliteStore', {
    extend: 'Ext.data.Store',

    mixins: ['Common.promise.util.DatabaseOperation'],

    requires: [
        'Common.store.proxy.Sqlite',
        'Common.data.ModelGenerator'
    ],

    isSqliteStore: true,

    config: {
        /**
         * @cfg {Boolean} disablePaging Disables built-in paging feature. When
         *      disablePaging is set to true the store will load all of the
         *      records from the database ignoring the pageSize configuration.
         *      This property should only be enabled for stores that manage
         *      tables with relatively small numbers of records.
         * @accessor
         */
        disablePaging: false,

        /**
         * @cfg {Boolean} enableAutoLoad  true to load the store during application start up when the
         * autoLoad configuration is set to false. If false, the store auto load function is set by
         * the autoLoad property.
         * When the app is executing in the native device environment, the loading of the store should
         * be delayed until the Phonegap library files have loaded.
         * Setting enableAutoLoad to true will load the store after the Phonegap library has loaded.
         */
        enableAutoLoad: true,

        /**
         * @cfg {Boolean} remoteFilter
         * true to defer any filtering operation to the server. If false, the filtering is done locally on
         * the client.
         * When set to true, you will have to manually call the load method after you filter to retrieve
         * the filtered data from the server.
         * Sqlite stores have this value set to true by default to force the filter
         * to be applied to the Sqlite database.
         *
         */
        remoteFilter: true,

        /**
         * @cfg {Boolean} dynamicModel Set to true if the store uses a dynamic model
         *      instance. Dynamic models are generated using a combination of
         *      the Application Preferences visible fields and the server table
         *      TableDef
         *
         */
        dynamicModel: false,

        /**
         * @cfg {Number} savedCurrentPage The current page before the paging setting is disabled
         * Used to save and restore the current page of the store when the disablePaging property is
         * changed.
         */
        savedCurrentPage: null,

        /**
         * @cfg {String} The table name to display in the busy indicator during the sync. The store
         * model name is used if this property is not set.
         */
        tableDisplayName: ''
    },

    applyTableDisplayName: function (name) {
        var me = this,
            proxy;

        if (Ext.isEmpty(name)) {
            proxy = me.getProxy();
            if (proxy && Ext.isFunction(me.getProxy().getTable)) {
                name = me.getProxy().getTable();
            }
        }
        return name;
    },


    updateDisablePaging: function (newDisablePaging) {
        if (newDisablePaging) {
            this.setSavedCurrentPage(this.currentPage);
        } else {
            // We are enabling paging for the store. Set the currentPage if it is not defined
            if (!Ext.isDefined(this.currentPage)) {
                this.currentPage = this.getSavedCurrentPage();
            }
        }
    },

    /**
     * Overrides the Ext.data.Store load function. Uses the disablePaging
     * configuration setting to turn off the paging function.
     *
     * @override
     * @param options
     * @param scope
     * @return {*}
     */
    load: function (options, scope) {
        var me = this,
            operation,
            currentPage = me.currentPage,
            pageSize = me.getPageSize(),
            start;

        options = options || {};

        if (Ext.isFunction(options)) {
            options = {
                callback: options,
                scope: scope || this
            };
        }

        if (me.getRemoteSort()) {
            options.sorters = options.sorters || this.getSorters();
        }

        if (me.getRemoteFilter()) {
            options.filters = options.filters || this.getFilters();
        }

        if (me.getRemoteGroup()) {
            options.grouper = options.grouper || this.getGrouper();
        }

        // Override the limit settings
        // Setting pageSize to null will cause the proxy to not
        // add the limit clause to the query.
        if (this.getDisablePaging()) {
            currentPage = null;
        } else {
            start = (currentPage - 1) * pageSize;
        }

        Ext.applyIf(options, {
            page: currentPage,
            start: start,
            limit: pageSize,
            addRecords: false,
            action: 'read',
            model: this.getModel()
        });


        operation = Ext.create('Ext.data.Operation', options);

        if (me.fireEvent('beforeload', me, operation) !== false) {
            me.loading = true;
            me.getProxy().read(operation, me.onProxyLoad, me);
        }

        return me;
    },

    /* Sencha framework function. Disable the JSHint maxstatements warning */
    /* jshint maxstatements: 30 */
    /**
     * @override
     * Override the Ext.data.Store sync function to add onSuccess, onFailure and scope parameters. Provides a
     * way to let the calling function know when the sync operation has completed.
     *
     * @param {Function} onSuccess  called when the sync has completed successfully.
     * @param {Function} onFailure  called when there is an error during the sync operation
     * @param {Object} scope  The scope to execute the callback functions
     *
     * Synchronizes the Store with its Proxy. This asks the Proxy to batch together any new, updated
     * and deleted records in the store, updating the Store's internal representation of the records
     * as each operation completes.
     * @return {Object}
     * @return {Object} return.added
     * @return {Object} return.updated
     * @return {Object} return.removed
     */
    sync: function (onCompleted, onFailure, scope) {
        var me = this,
            operations = {},
            toCreate = me.getNewRecords(),
            toUpdate = me.getUpdatedRecords(),
            toDestroy = me.getRemovedRecords(),
            needsSync = false;

        // Start override
        // Check additional parameters
        if (!onCompleted) {
            onCompleted = Ext.emptyFn;
        }

        if (!onFailure) {
            onFailure = Ext.emptyFn;
        }

        if (!scope) {
            scope = me;
        }
        // End override

        if (toCreate.length > 0) {
            operations.create = toCreate;
            needsSync = true;
        }

        if (toUpdate.length > 0) {
            operations.update = toUpdate;
            needsSync = true;
        }

        if (toDestroy.length > 0) {
            operations.destroy = toDestroy;
            needsSync = true;
        }

        // Override
        // Add success, failure and scope properties to the batch object
        if (needsSync && me.fireEvent('beforesync', this, operations) !== false) {
            me.getProxy().batch({
                operations: operations,
                listeners: me.getBatchListeners(),
                success: onCompleted,
                failure: onFailure,
                scope: scope
            });
        } else {
            Ext.callback(onCompleted, scope || me);
        }

        return {
            added: toCreate,
            updated: toUpdate,
            removed: toDestroy
        };
    },

    /**
     * Generates the model fields and applies the model to the store.
     */
    setDynamicModelDefinition: function () {
        var me = this;

        // Update the model reference. The generateModel function updates the
        // store model by reference
        // There is no need to call Store.setModel()
        Common.data.ModelGenerator.generateModel(me.getModel(), me.serverTableName);

        // Update the proxy model definition
        me.getProxy().updateModel(me.getModel());
    },

    /**
     * Retrieves all records from the store.
     * Disables the store paging, saves the applied filters, applies new filters and retrieves
     * the data from the SQLite database.
     * The original filters are reapplied and the store is loaded again to set the data
     * in the store back to the original state.
     * There are many cases where we need to retrieve all of the records from a store
     * without limiting the returned results by the store page size
     * This function provides a method for us to use to retrieve all of the records from
     * the database then put the contents of the store back to the original state.
     *
     * @param filters {Array} Filters to be applied to the store before retrieving the records
     */

    retrieveAllStoreRecords: function (filters, onCompleted, scope) {
        var me = this,
            currentFilters = me.getFilters(),
            retrievedRecords = [],
            isPagingDisabled = me.getDisablePaging();

        me.suspendEvents();
        me.clearFilter();
        if (!Ext.isEmpty(filters)) {
            me.setFilters(filters);
        }
        me.setDisablePaging(true);
        me.load(function (records) {
            retrievedRecords = records;
            me.setFilters(currentFilters);
            me.setDisablePaging(isPagingDisabled);
            me.loadPage(1, function () {
                me.resumeEvents(true);
                Ext.callback(onCompleted, scope || me, [retrievedRecords]);
            });
        });
    },

    /**
     * A Promisifyed version of {@link Common.store.sync.SqliteStore#retrieveAllStoreRecords}
     * Retrieves all of the records from the store. This function saves any existing filters
     * applied to the store, applies the provided filter(s) and disables paging on the store.
     * The original filters and paging settings are applied to the store after retrieving the
     * records
     * @param {Oject[]} [filters] The filters to apply to the store
     * @returns {Promise} A Promise resolved with the array of retrieved {@link Ext.data.Model} objects
     */
    retrieveAllRecords: function(filters) {
        var me = this;

        return new Promise(function(resolve) {
            var currentFilters = me.getFilters(),
                retrievedRecords = [],
                isPagingDisabled = me.getDisablePaging();

            me.suspendEvents();
            me.clearFilter();
            if (!Ext.isEmpty(filters)) {
                me.setFilters(filters);
            }
            me.setDisablePaging(true);
            me.load(function (records) {
                me.resumeEvents(true);
                retrievedRecords = records;
                me.setFilters(currentFilters);
                me.setDisablePaging(isPagingDisabled);
                me.loadPage(1, function () {
                   resolve(retrievedRecords);
                });
            });

        });
    },

    /**
     * Retrieves a single record from the store. Returns the first record in the result set if
     * multiple records are returned after loading the store.
     * @param filters
     * @param onCompleted
     * @param scope
     */
    retrieveRecord: function (filters, onCompleted, scope) {
        var me = this,
            currentFilters = me.getFilters(),
            retrievedRecord = null,
            isPagingDisabled = me.getDisablePaging();

        me.suspendEvents();
        me.clearFilter();
        if (!Ext.isEmpty(filters)) {
            me.setFilters(filters);
        }
        me.setDisablePaging(true);
        me.load(function (records) {
            me.resumeEvents(true);
            if (records && records.length > 0) {
                retrievedRecord = records[0];
            }
            me.setFilters(currentFilters);
            me.setDisablePaging(isPagingDisabled);
            me.loadPage(1, function () {
                Ext.callback(onCompleted, scope || me, [retrievedRecord]);
            });
        });
    },

    /**
     * Retrieves a single record from the store. The first record is returned if multiple
     * records match the filter criteria.
     * @param [String} filters filters to apply to the store.
     * @returns {Promise}
     */
    retrieveSingleRecord: function(filters) {
        var me = this,
            currentFilters = me.getFilters(),
            retrievedRecord = null,
            isPagingDisabled = me.getDisablePaging(),
            currentPage = me.currentPage;
        
        return new Promise(function(resolve, reject) {
            me.suspendEvents();
            me.clearFilter();
            if (!Ext.isEmpty(filters)) {
                me.setFilters(filters);
            }

            me.setDisablePaging(true);
            me.load(function (records) {
                me.resumeEvents(true);
                if (records && records.length > 0) {
                    retrievedRecord = records[0];
                }
                me.setFilters(currentFilters);
                me.setDisablePaging(isPagingDisabled);
                me.loadPage(currentPage, function (records, operation, success) {
                    if(success) {
                        resolve(retrievedRecord);
                    } else {
                        reject();
                    }
                });
            });
        });
            
    }

});