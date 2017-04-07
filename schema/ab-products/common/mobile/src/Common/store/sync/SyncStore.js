/**
 * Provides persistence and synchronization to application domain objects/models.
 * Uses SQLite database for persistence.
 * Uses DWR services for synchronization with the server.
 * Holds information required for mapping to the server-side table: serverTableName, inventoryKeyNames.
 * The Store class encapsulates a cache of domain objects.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.sync.SyncStore', {
    extend: 'Common.store.sync.SchemaUpdaterStore',
    requires: 'Common.service.MobileSyncServiceAdapter',

    config: {

        checkInPageSize: 20
    },

    /**
     * @property {String[]} serverFieldNames The server side table field names that are synchronized
     * with this store.
     */
    serverFieldNames: null,

    /**
     * @property {String[]} inventoryKeyNames The primary key field names of the associated server
     * side table
     */
    inventoryKeyNames: null,

    /**
     * Override the restriction property getter so we can add the Current User Restriction
     * The user name may not be loaded in the ConfigFileManager class when the class is parsed
     */
    getRestriction: function () {
        var me = this,
            restriction = me._restriction,
            currentUserRestriction = me.createAssignedToCurrentUserRestriction();

        if (Ext.isEmpty(restriction)) {
            return currentUserRestriction;
        } else {
            restriction.clauses.push(currentUserRestriction.clauses[0]);
            return restriction;
        }
    },

    /**
     * Creates the 'mob_locked_by' restriction. This restriction
     * is applied to all transactional sync stores.
     *
     * @private
     */
    createAssignedToCurrentUserRestriction: function () {
        var restriction = {},
            userName = ConfigFileManager.username;

        restriction.clauses = [
            {
                tableName: this.serverTableName,
                fieldName: 'mob_locked_by',
                operation: 'EQUALS',
                value: userName
            }
        ];

        return restriction;
    },

    /**
     * @deprecated 22.1 use SyncStore instead
     * @param callback
     * @param scope
     */
    synchronize: function (callback, scope) {
        var me = this,
            doComplete = function (result) {
                Common.service.Session.end().
                then(function () {
                    Ext.callback(callback, scope || me, [result]);
                });
            };

        var session = Common.service.Session.start();

        session.then(function () {
            me.syncStore()
                .then(function () {
                    doComplete({success: true});
                }, function (message) {
                    doComplete({success: false, exception: message});
                });
        }, function (message) {
            doComplete({success: false, exception: message});
        });
    },


    /**
     *
     * @returns {Promise} A Promise object resolved when the sync operation completes
     */
    syncStore: function () {
        var me = this,
            changedOnMobileRecords;

        Common.controller.EventBus.fireStoreSyncStart(me);

        return Common.service.MobileSyncServiceAdapter.getTableDef(me.serverTableName)
            .then(function (tableDef) {
                me.tableDef = tableDef;
                return me.getChangedOnMobileRecords();
            })
            .then(function (records) {
                return me.processChangedOnMobileRecords(records);
            })
            .then(function (records) {
                changedOnMobileRecords = records;
                return me.updateIfNotModelAndTable(me.tableDef);
            })
            .then(function () {
                return me.checkInRecords(changedOnMobileRecords);
            })
            .then(function () {
                return me.downloadTransactionRecords();
            });
    },

    downloadTransactionRecords: function () {
        var me = this,
            proxy = me.getProxy(),
            table = proxy.getTable(),
            useTimestampSync = me.getTimestampDownload();

        Common.controller.EventBus.fireStoreSyncStart(me);
        me.disableStoreEvents();

        return Promise.resolve()
            .then(function () {
                return MobileSyncServiceAdapter.retrieveLastTableDownloadTime(table);
            })
            .then(function (timestamp) {
                me.lastModifiedTimestamp = timestamp;
                if (timestamp === 0 || !useTimestampSync) {
                    me.setDeleteAllRecordsOnSync(true);
                    return me.deleteAllRecordsFromTable(table, true);
                } else {
                    me.setDeleteAllRecordsOnSync(false);
                }
            })
            .then(function () {
                return me.importRecords(me.lastModifiedTimestamp);
            })
            .then(function () {
                return me.retrieveRecordsToDelete(me.lastModifiedTimestamp);
            })
            .then(function (deletedRecords) {
                return me.deleteRecords(deletedRecords, table, me.inventoryKeyNames);
            })
            .then(function () {
                return me.enableStoreEvents();
            })
            .then(function () {
                return MobileSyncServiceAdapter.recordLastTableDownloadTime(table, me.serverTableName);
            })
            .then(function () {
                Common.controller.EventBus.fireStoreSyncEnd(me);
            })
            .then(null, function (error) {
                // Enable the store events in case of error. Pass the error message to the calling Promise
                return me.enableStoreEvents(error);
            });
    },

    importRecords: function (timestamp) {
        var me = this,
            proxy = me.getProxy(),
            table = proxy.getTable(),
            columns = proxy.getColumns(),
            model = me.getModel(),
            deleteAllRecordsOnSync = me.getDeleteAllRecordsOnSync(),
            useTimestampSync = me.getTimestampDownload();

        var restriction = me.getRestriction(),
            serverFieldNames = me.getServerFieldsFromModel();

        var lastModifiedRestriction = {
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
            retrieveRestriction = null;

        if (restriction) {
            retrieveRestriction = Ext.clone(restriction);
            if(useTimestampSync) {
                retrieveRestriction.clauses.push(lastModifiedRestriction, deletedRestriction);
            }
        }

        // TODO: Include documents
        // TODO: Paging
        return Common.service.MobileSyncServiceAdapter.checkOutRecords(me.serverTableName, serverFieldNames, retrieveRestriction)
            .then(function (records) {
                return me.convertRecordsFromServer(records);
            })
            .then(function (convertedRecords) {
                return me.insertRecords(convertedRecords, table, columns, model, deleteAllRecordsOnSync);
            });
    },

    /**
     * Gets from this store records where the mob_is_changed value is set to 1.
     *
     * @private
     * @return {Ext.data.Model[]} records according to the filter.
     */
    getChangedOnMobileRecords: function () {
        var me = this,
            paging = me.getDisablePaging();

        return new Promise(function (resolve, reject) {
            me.clearFilter();
            me.filter('mob_is_changed', 1);
            // Disable paging so we can be sure that we retrieve all of the records
            me.setDisablePaging(true);
            me.load({
                callback: function (records, operation, success) {
                    if (success) {
                        me.clearFilter();
                        // Reset the store page size
                        me.setDisablePaging(paging);
                        resolve(records);
                    } else {
                        reject('Get Changed on Mobile Records failed.');
                    }
                },
                scope: me
            });
        });
    },

    /**
     * Checks in all changed records in this store.
     *
     * @private
     */
    checkInRecords: function (records) {
        var me = this,
            pageSize = me.getCheckInPageSize(),
            numberOfPages = Math.ceil(records.length / pageSize),
            pageIndexArray = me.createCheckinPageIndex(numberOfPages);

        var p = Promise.resolve();
        pageIndexArray.forEach(function (currentPage) {
            p = p.then(function () {
                var recordsToSync = records.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
                    serverRecords = me.convertRecordsForServer(recordsToSync);

                return Common.service.MobileSyncServiceAdapter.checkInRecords(me.serverTableName, me.inventoryKeyNames, serverRecords);
            });
        });
        return p;
    },

    /**
     * Uploads records to the Web Central sync table where the mob_is_changed value is 1
     */
    uploadModifiedRecords: function () {
        var me = this,
            changedOnMobileRecords;

        Common.controller.EventBus.fireStoreSyncStart(me);

        me.disableStoreEvents();

        return Common.service.MobileSyncServiceAdapter.getTableDef(me.serverTableName)
            .then(function (tableDef) {
                me.tableDef = tableDef;
                return me.getChangedOnMobileRecords();
            })
            .then(function (records) {
                return me.processChangedOnMobileRecords(records);
            })
            .then(function (records) {
                changedOnMobileRecords = records;
                return me.updateIfNotModelAndTable(me.tableDef);
            })
            .then(function () {
                return me.checkInRecords(changedOnMobileRecords);
            })
            .then(function () {
                Common.controller.EventBus.fireStoreSyncEnd(me);
                return me.enableStoreEvents();
            })
            .then(null, function (error) {
                // Enable the store events in case of error
                return me.enableStoreEvents(error);
            });
    },


    /**
     * Returns an array where each index represents a page to be processed
     * by the checkInRecords function
     * @private
     * @param {Number} numberOfPages
     * @returns {Array}
     */
    createCheckinPageIndex: function (numberOfPages) {
        var pageIndexArray = [],
            i;

        for (i = 0; i < numberOfPages; i++) {
            pageIndexArray.push(i);
        }

        return pageIndexArray;

    },

    /**
     * Checks out all records to this store and table that meet the restriction.
     *
     * @private
     * @param {Object[]} restriction to be applied to the server-side table.
     */
    checkOutRecords: function (restriction) {
        var me = this,
            serverFieldNames = me.getServerFieldsFromModel();

        return Common.service.MobileSyncServiceAdapter.checkOutRecords(me.serverTableName, serverFieldNames, restriction)
            .then(function (records) {
                return me.convertRecordsFromServer(records);
            });
    },


    /**
     * Searches the record for all document fields. If the document field is populated and the
     * associated doc_isnew property is false, the document data is cleared and not included in the
     * check in
     *
     * @param {Array} changedOnMobileRecords
     */

    processDocumentFields: function (changedOnMobileRecords) {
        var me = this,
            autoSync = me.getAutoSync();

        var p = Promise.resolve();

        // Disable autoSync to prevent unnescesarry database updates
        me.setAutoSync(false);
        Ext.each(changedOnMobileRecords, function (record) {

            var fields = record.getFields().items;
            Ext.each(fields, function (field) {
                var fieldName,
                    docIsNewValue;

                p = p.then(function () {
                    if (field.getIsDocumentField()) {
                        fieldName = field.getName();
                        docIsNewValue = record.get(fieldName + '_isnew');
                        if (!docIsNewValue) {
                            record.set(fieldName + '_contents', '');
                            record.set(fieldName, '');
                            return Promise.resolve();
                        } else {
                            // Check if documents are marked for deletion
                            if (record.get(fieldName + '_contents') === 'TUFSS19ERUxFVEVE') {
                                return DocumentManager.deleteDocument(me, record, fieldName)
                                    .then(function () {
                                        record = me.setDocumentContents(record, fieldName, false);
                                        return Promise.resolve(changedOnMobileRecords);
                                    });
                            } else {
                                return Promise.resolve(changedOnMobileRecords);
                            }
                        }
                    } else {
                        return Promise.resolve(changedOnMobileRecords);
                    }
                });
            }, me);

            me.setAutoSync(autoSync);
            return p;

        }, me);
    },

    processChangedOnMobileRecords: function (changedOnMobileRecords) {
        var me = this,
            model = me.getModel(),
            docFields,
            processRecords = function () {
                var p = Promise.resolve();
                changedOnMobileRecords.forEach(function (record) {
                    p = p.then(function () {
                        // Get the document fields from the model if this is a model that extends Common.data.Model
                        if (Ext.isFunction(model.getDocumentFields)) {
                            docFields = model.getDocumentFields();
                            if (docFields && docFields.length > 0) {
                                return me.processDocuments(docFields, record)
                                    .then(function () {
                                        return Promise.resolve(changedOnMobileRecords);
                                    });
                            } else {
                                // No document fields to process
                                return Promise.resolve(changedOnMobileRecords);
                            }
                        } else {
                            return Promise.resolve(changedOnMobileRecords);
                        }
                    });
                });
                return p;
            };

        if (changedOnMobileRecords && changedOnMobileRecords.length > 0) {
            return processRecords();
        } else {
            return Promise.resolve(changedOnMobileRecords);
        }
    },

    processDocuments: function (documentFields, record) {
        // TODO: disable autoSync
        var me = this,
            process = function () {
                var p = Promise.resolve();
                documentFields.forEach(function (docField) {
                    p = p.then(function () {
                        var fieldName = docField.docField,
                            isNewDoc = record.get(fieldName + '_isnew');
                        if (!isNewDoc) {
                            record.set(fieldName + '_contents', '');
                            record.set(fieldName, '');
                            return Promise.resolve();
                        } else if (isNewDoc && record.get(fieldName + '_contents') === 'TUFSS19ERUxFVEVE') {
                            return DocumentManager.deleteDocument(me, record, fieldName)
                                .then(function () {
                                    me.setDocumentContents(record, fieldName, false);
                                    return Promise.resolve();
                                });
                        } else {
                            return Promise.resolve();
                        }
                    });
                });
                return p;
            };
        return process();
    },

    setDocumentContents: function (record, documentField, markForSyncDeletion) {
        record.set(documentField, markForSyncDeletion ? documentField : null);
        record.set(documentField + '_contents', markForSyncDeletion ? 'TUFSS19ERUxFVEVE' : null);
        record.set(documentField + '_isnew', markForSyncDeletion);
        record.set(documentField + '_file', '');

        return record;
    },

    /**
     * Generates an array of field names that are supplied to the server for synchronization The server
     * fields are generated dynamically because we need to support the synchronization of dynamic model
     * instances. The model id fields and doc_contents fields are not included in fields sent to the
     * server.
     *
     * @returns {Ext.data.Model[]} Model field names to be sent to the server during synchronization.
     */
    getServerFieldsFromModel: function () {
        var model = this.getModel(),
            fields = model.getFields().items,
            serverFields = [];

        Ext.each(fields, function (field) {
            var fieldName = field.getName(),
                isDocContentsField = fieldName.indexOf('_contents') !== -1;

            if (field.getIsSyncField() && fieldName !== 'id' && !isDocContentsField) {
                serverFields.push(field.getName());
            }
        });

        return serverFields;
    },

    /**
     * Converts each Model object to the server-side record object.
     *
     * @param {Ext.data.Model[]} records to be converted.
     * @return {Ext.data.Model[]} converted records.
     */
    convertRecordsForServer: function (records) {
        var me = this,
            convertRecordForServer = function (model) {
                var convertedFields = [],
                    fields = model.getFields().items;

                Ext.each(fields, function (field) {
                    var fieldName = field.getName(),
                        isSyncField = field.getIsSyncField(),
                        fieldValue;


                    if (fieldName !== 'id' && isSyncField) {
                        fieldValue = me.getFieldValueFromModel(model, field);
                        convertedFields.push({
                            fieldName: fieldName,
                            fieldValue: fieldValue
                        });
                    }
                }, me);

                return {
                    fieldValues: convertedFields
                };
            };

        return Ext.Array.map(records, convertRecordForServer);
    },

    getFieldValueFromModel: function(model, field) {
        var value = model.data[field.getName()];
        if(field.getType().type === 'bool') {
            value = new Common.type.Integer({value: value ? 1 : 0});
        }
        return value;
    },

    retrieveRecordsToDelete: function (timestamp) {
        var me = this,
            restriction = me.getRestriction(),
            pageSize = me.getSyncRecordsPageSize(),
            includeDocumentData = me.getIncludeDocumentDataInSync(),
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
                value: 1,
                relativeOperation: 'AND'
            },
            useTimestampDownload = me.getTimestampDownload();

        if(useTimestampDownload) {
            if (restriction) {
                restriction.clauses.push(lastModifiedRestriction, deletedRestriction);
            }
            return Common.service.MobileSyncServiceAdapter.retrievePagedRecords(me.serverTableName, me.serverFieldNames, restriction, pageSize, includeDocumentData);
        } else {
            return Promise.resolve([]);
        }
    }


});