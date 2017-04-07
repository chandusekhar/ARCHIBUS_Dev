Ext.define('Common.store.sync.PagedSyncStore', {
    extend: 'Common.store.sync.SyncStore',

    tableDef: null,


    config: {
        /**
         * @cfg {Number} syncRecordsPageSize The number of records to retrieve at one time from the Web Central server.
         */
        syncRecordsPageSize: 1000
    },

    /**
     * Override to implement paging
     * @override
     * @returns {Promise}
     */
    importRecords: function (timestamp) {
        var me = this,
            resolveFunc,
            rejectFunc,
            pageSize = me.getSyncRecordsPageSize(),
            pagingRestriction = me.getRestriction(),
            numberOfImportedRecords = pageSize,
            proxy = me.getProxy(),
            table = proxy.getTable(),
            columns = proxy.getColumns(),
            deleteAllRecordsOnSync = me.getDeleteAllRecordsOnSync();


        var p = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        var doImportRecords = function () {
            if (numberOfImportedRecords === 0 || numberOfImportedRecords < pageSize) {
                resolveFunc();
            } else {
                // TODO: retrieve records needs to be different
                me.retrieveRecords(pagingRestriction, pageSize, timestamp)
                    .then(function (records) {
                        numberOfImportedRecords = records.length;
                        pagingRestriction = me.createRestrictionUsingLastRecord(records, me.getRestriction());
                        return me.convertRecordsFromServer(records);
                    }, function(error) {
                        // Update numberOfImported records so the recursion will terminate.
                        numberOfImportedRecords = 0;
                        rejectFunc(error);
                    })
                    .then(function (convertedRecords) {
                        return me.insertRecords(convertedRecords, table, columns, me.getModel(), deleteAllRecordsOnSync);
                    })
                    .then(null, function (error) {
                        // Update numberOfImported records so the recursion will terminate.
                        numberOfImportedRecords = 0;
                        rejectFunc(error);
                    })
                    .then(doImportRecords);
            }
        };

        doImportRecords();

        return p;
    },

    retrieveRecords: function (restriction, pageSize, timestamp) {
        var me = this,
            includeDocumentData = me.getIncludeDocumentDataInSync(),
            useTimestampSync = me.getTimestampDownload(),
            lastModifiedRestriction = {
                tableName: me.serverTableName,
                fieldName: 'last_modified',
                operation: 'GT',
                value: timestamp,
                relativeOperation: 'AND'
            },
            deletedRestriction = {
                tableName: me.serverTableName,
                fieldName: 'deleted',
                operation: 'EQUALS',
                value: 0,
                relativeOperation: 'AND'
            },
            retrieveRestriction;

        if (restriction) {
            retrieveRestriction = Ext.clone(restriction);
            if(useTimestampSync) {
                retrieveRestriction.clauses.push(lastModifiedRestriction, deletedRestriction);
            }
        }

        return Common.service.MobileSyncServiceAdapter.retrievePagedRecords(me.serverTableName, me.serverFieldNames, retrieveRestriction, pageSize, includeDocumentData);
    }


});