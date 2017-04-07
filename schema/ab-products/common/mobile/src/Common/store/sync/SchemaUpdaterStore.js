/**
 * Provides functionality to update schema of the store: updates model and table of the store according to the
 * server-side TableDef, if cached TableDef does not match.
 * Uses DWR service to get TableDef from the server.
 * Holds information required for mapping to the server-side table: serverTableName.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.store.sync.SchemaUpdaterStore', {
    extend: 'Common.store.sync.SqliteStore',
    requires: [
        'Common.service.MobileSyncServiceAdapter',
        'Common.data.ModelGenerator',
        'Common.controller.EventBus',
        'Common.util.ImageData',
        'Common.promise.util.TableDef',
        'Common.device.File'
    ],

    /**
     * @property {String} serverTableName The name of the server side table associated with the store
     */
    serverTableName: null,

    ANDROID_MAX_FIELD_SIZE: 500 * 1024,

    config: {
        /**
         * @cfg {Number} syncRecordsPageSize The number of records to retrieve at one time from the Web Central server.
         */
        syncRecordsPageSize: 5000,

        /**
         * @cfg {Boolean} The document data is populated in the associated [doc]_contents fields when true. Set to false
         * to use the On Demand Document Download feature
         */
        includeDocumentDataInSync: true,

        /**
         * @cfg {String} documentTable The name of the Web Central table that contains the document data. The store may use a sync table
         * in which case the document table is different that the store serverTableName.
         * Example: A store that has a server table of activity_log_sync will have a document table of activity_log.
         *
         * This configuration is required when using the On Demand Document Download feature.
         */
        documentTable: null,

        /**
         * @cfg {String[]} The document table primary key fields.
         */
        documentTablePrimaryKeyFields: [],

        /**
         * @cfg {Boolean} deleteAllRecordsOnSync When true all records for the table are deleted in the client database
         * during the sync. Set to false to enable the Partial Sync mode.
         */
        deleteAllRecordsOnSync: true,

        /**
         *  @cfg {Object/Object[]} restriction The restriction clause sent to the server during synchronization
         *  The restriction can be specified as a restriction object or an array of restriction objects
         *
         *  Example
         *
         *      restriction:  {
         *           fieldName: "status"
         *           operation: "EQUALS"
         *           tableName: "survey"
         *           value: "Issued"
         *      };
         *
         *  Multiple restrictions can be applied using an object array. The restrictions are combined using an AND
         *  operator. The relativeOps property can be used to use a different operator.
         *
         *  Applying multiple restrictions combined with an OR operator.
         *
         *     restriction: [
         *            {
         *                tableName: 'afm_activity_params',
         *                fieldName: 'applies_to',
         *                operation: 'EQUALS',
         *                value: 'Mobile',
         *                relativeOperation : 'OR'
         *            },
         *            {
         *                tableName: 'afm_activity_params',
         *                fieldName: 'param_id',
         *                operation: 'EQUALS',
         *                value: 'BudgetCurrency',
         *                relativeOperation : 'OR'
         *            }
         *      ]
         *
         *  This restriction generates the SQL statement of
         *      SELECT FROM afm_activity_params WHERE applies_to = 'Mobile' OR param_id = 'BudgetCurrency'
         *
         *  Restriction Properties:
         *
         *  The operation property can have the following values:
         *
         *     Operation         SQL Operator
         *
         *     EQUALS                 =
         *     NOT_EQUALS             <>
         *     LIKE                   LIKE
         *     NOT_LIKE               NOT_LIKE
         *     GT                     >
         *     LT                     <
         *     IS_NULL                IS NULL
         *     IS_NOT_NULL            IS NOT NULL
         *
         *  The relativeOperation property can have one of the following values
         *
         *     relativeOperation       SQL
         *
         *     AND                     WHERE field1 = 'A' AND field2 = 'B'
         *     OR                      WHERE field1 = 'A' OR field2 = 'B'
         *     AND_BRACKET             WHERE (field1 = 'A' AND field2 = 'B')
         *     OR_BRACKET              WHERE (filed1 = 'A' OR field2 = 'B')
         *
         */
        restriction: null,

        /**
         * @cfg {Boolean} timestampDownload true to enable the timestamp download feature for the store.
         * When false all records are downloaded and replaced on the client.
         */
        timestampDownload: false

    },

    /**
     * Converts the restriction configuration into an restriction.clauses array
     * @param {Object/Object[]} restriction
     * @returns {Object}
     */
    applyRestriction: function (restriction) {
        var clauses = [],
            restrictionObject = null;

        if (restriction) {
            // If the restriction is an Array add each restriction object to
            // the clauses array
            if (Ext.isArray(restriction)) {
                clauses = restriction;
            } else {
                clauses.push(restriction);
            }
            restrictionObject = {};
            restrictionObject.clauses = clauses;
        }
        return restrictionObject;
    },

    /**
     * Updates model and table of the store according to the server-side TableDef, if cached TableDef
     * does not match. Commits the cached tableDefs to the database.
     *
     * @param {Object} tableDef The TableDef object
     * @returns {Promise}
     */
    updateIfNotModelAndTable: function (tableDef) {
        var me = this,
            cachedTableDefObject = Common.promise.util.TableDef.getTableDefObject(me.serverTableName);

        if (cachedTableDefObject === null || !TableDef.compareTableDefObject(cachedTableDefObject, tableDef)) {
            // If this is a sync table we need to get a list of fields to include in the model from the AppPreferences store
            if (me.getDynamicModel()) {
                Common.data.ModelGenerator.generateModel(me.getModel(), me.serverTableName, tableDef);
            }
            return me.createOrModifyTable(me.getProxy().getTable(), me.getModel())
                .then(function () {
                    return Common.promise.util.TableDef.saveTableDef(tableDef);
                });

        } else {
            // Nothing to do, just resolve and return.
            return Promise.resolve();
        }
    },

    /**
     *
     * @deprecated 22.1
     * @param onCompleted
     * @param scope
     */
    getTableDefFromServer: function (onCompleted, scope) {
        MobileSyncServiceAdapter.getTableDefAsync(this.serverTableName, onCompleted, scope);
    },


    /* Paging Functions */

    getPrimaryKeyValuesFromFieldObject: function (fieldObject, primaryKeyFields) {
        var me = this,
            primaryKeyValues = {};

        Ext.each(fieldObject.fieldValues, function (field) {
            Ext.each(primaryKeyFields, function (primaryKeyField) {
                if (field.fieldName === primaryKeyField) {
                    primaryKeyValues[field.fieldName] = field.fieldValue;
                }
            }, me);
        }, me);

        return primaryKeyValues;
    },

    retrieveRecords: function (restriction, pageSize, timestamp) {
        var me = this,
            includeDocumentData = me.getIncludeDocumentDataInSync();

        if (timestamp > 0) {
            return Common.service.MobileSyncServiceAdapter.retrieveModifiedRecords(me.serverTableName, me.serverFieldNames, restriction, pageSize, includeDocumentData, timestamp);
        } else {
            return Common.service.MobileSyncServiceAdapter.retrievePagedRecords(me.serverTableName, me.serverFieldNames, restriction, pageSize, includeDocumentData);
        }

    },

    createRestrictionUsingLastRecord: function (records, storeRestriction) {
        var me = this,
            lastRecord,
            primaryKeyFields,
            restriction;

        if (records.length === 0) {
            return null;
        }

        lastRecord = records[records.length - 1];
        primaryKeyFields = Common.util.TableDef.getPrimaryKeyFieldsFromTableDef(me.tableDef);
        restriction = me.generateRestrictionClause(lastRecord, primaryKeyFields, storeRestriction);

        return restriction;
    },

    generateRestrictionClause: function (lastRecord, primaryKeyFields, storeRestriction) {
        var me = this,
            tableName = me.serverTableName,
            restriction = {},
            clauses = [],
            primaryKeyValues = me.getPrimaryKeyValuesFromFieldObject(lastRecord, primaryKeyFields);

        if (storeRestriction !== null) {
            clauses = Ext.Array.clone(storeRestriction.clauses);
        }

        // TODO: The restriction generator only handles tables with up to 3 primary key fields. Update function
        // to work with N primary key values.

        Ext.each(primaryKeyFields, function (keyField, index, allItems) {
            if (index === 0) {
                clauses.push({
                    tableName: tableName,
                    fieldName: keyField,
                    operation: 'GT',
                    value: primaryKeyValues[keyField],
                    relativeOperation: 'AND'
                });
            }

            if (index === 1) {
                clauses.push({
                    tableName: tableName,
                    fieldName: allItems[0],
                    operation: 'GTE',
                    value: primaryKeyValues[allItems[0]],
                    relativeOperation: 'OR_BRACKET'
                });
                clauses.push({
                    tableName: tableName,
                    fieldName: keyField,
                    operation: 'GT',
                    value: primaryKeyValues[keyField],
                    relativeOperation: 'AND'
                });
            }

            if (index === 2) {
                clauses.push({
                    tableName: tableName,
                    fieldName: allItems[0],
                    operation: 'GTE',
                    value: primaryKeyValues[allItems[0]],
                    relativeOperation: 'OR_BRACKET'
                });
                clauses.push({
                    tableName: tableName,
                    fieldName: allItems[1],
                    operation: 'GTE',
                    value: primaryKeyValues[allItems[1]],
                    relativeOperation: 'AND'
                });
                clauses.push({
                    tableName: tableName,
                    fieldName: allItems[2],
                    operation: 'GT',
                    value: primaryKeyValues[allItems[2]],
                    relativeOperation: 'AND'
                });
            }
        });

        restriction.clauses = clauses;

        return restriction;
    },

    convertRecordsFromServer: function (records) {
        var me = this,
            isAndroid = Ext.os.is.Android,
            model = me.getModel(),
            docFields = [],
            docContentsFields = [],
            convertedRecords,
            documentFolder = GlobalParameters.documentFolder + '/' + ConfigFileManager.username,
            includeDocumentData = me.getIncludeDocumentDataInSync(),
            useFileStorage = GlobalParameters.useFileStorage(),
            processAndroidRecord = function (convertedRecord, currentServerRecord) {
                var fieldSize,
                    fieldValue,
                    field,
                    primaryKeyValues,
                    docField,
                    fileNotAvailableStr;

                for (field in convertedRecord) {
                    fieldValue = convertedRecord[field];
                    if (fieldValue && Ext.isString(fieldValue) && fieldValue.length > me.ANDROID_MAX_FIELD_SIZE) {
                        fieldSize = fieldValue.length;
                        // If this is a document field then replace the image data with a 'File Not Available' image
                        // The model has document fields, check if this is a doc contents field associated with a document field.
                        if (docContentsFields.length > 0 && Ext.Array.contains(docContentsFields, field)) {
                            convertedRecord[field] = Common.util.ImageData.fileNotAvailableImage;
                            docField = field.replace('_contents', '');
                            fileNotAvailableStr = LocaleManager.getLocalizedString('file_not_available', 'Common.store.sync.SchemaUpdaterStore');
                            convertedRecord[docField] = fileNotAvailableStr + '.jpg';
                        } else {
                            convertedRecord[field] = '';
                        }
                        primaryKeyValues = me.getPrimaryKeyValuesFromFieldObject(currentServerRecord, me.inventoryKeyNames);
                        Common.controller.EventBus.fireFieldSizeLimitExceeded(me.serverTableName, field, primaryKeyValues, fieldSize);
                    }
                }

                return convertedRecord;
            },


            convertRecord = function (record) {
                var data = {},
                    currentServerRecord = record;

                Ext.each(record.fieldValues, function (field) {
                    data[field.fieldName] = field.fieldValue;
                }, me);

                // Reset the mob_is_changed field on checkout
                if (data.hasOwnProperty('mob_is_changed')) {
                    data.mob_is_changed = 0;
                }

                if (isAndroid && !useFileStorage) {
                    Log.log('Start processing records for Android 1MB limit', 'info');
                    return processAndroidRecord(data, currentServerRecord);
                } else {
                    return data;
                }
            };

        // Get the document fields from the model if this is a model that extends Common.data.Model
        if (Ext.isFunction(model.getDocumentFields)) {
            docFields = model.getDocumentFields();
            docContentsFields = Ext.Array.pluck(docFields, 'docContentsField');
        }

        convertedRecords = Ext.Array.map(records, convertRecord);

        if (useFileStorage && docFields && docFields.length > 0 && convertedRecords.length > 0 && includeDocumentData) {
            // Process documents

            return Common.device.File.createDirectory(documentFolder + '/' + me.getModelTableName())
                .then(function () {
                    return me.saveDocumentsToFile(convertedRecords, docFields);
                })
                .then(null, function(error) {
                    Log.log(error, 'error');
                    return Promise.reject(error);
                });
        } else {
            // We are not storing the document data in the file system. Just pass the converted records in the
            // Promise resolution.
            return Promise.resolve(convertedRecords);
        }

    },

    saveDocumentsToFile: function (convertedRecords, documentFields) {
        var me = this,
            saveDocuments = function () {
                var p = Promise.resolve();
                convertedRecords.forEach(function (convertedRecord) {
                    p = p.then(function () {
                        return me.processDocumentFileFields(convertedRecord, documentFields).then(function () {
                            return Promise.resolve(convertedRecords);
                        });
                    });
                });
                return p;
            };
        return saveDocuments();
    },

    processDocumentFileFields: function (convertedRecord, documentFields) {
        var me = this,

            processFields = function () {
                var p = Promise.resolve();
                documentFields.forEach(function (documentField) {
                    p = p.then(function () {
                        return me.processDocument(convertedRecord, documentField);
                    });
                });
                return p;
            };

        return processFields();

    },

    processDocument: function (convertedRecord, documentField) {
        var me = this,
            documentTable = me.getDocumentTable(),
            documentKeyFields = me.getDocumentTablePrimaryKeyFields(),
            documentFolder = GlobalParameters.documentFolder + '/' + ConfigFileManager.username;

        return new Promise(function (resolve, reject) {
            var documentFileName,
                documentPrimaryKey,
                filePath;

            if (documentTable === null || documentKeyFields.length === 0) {
                reject('The documentTable and documentTablePrimaryKeyFields properties must be set in store ' + me.$className);
            } else if (convertedRecord.hasOwnProperty(documentField.docContentsField) && !Ext.isEmpty(convertedRecord[documentField.docContentsField])) {
                // Get Filename
                documentPrimaryKey = me.getPrimaryKeyObject(convertedRecord);
                documentFileName = me.generateFileName(documentTable, documentField.docField, convertedRecord[documentField.docField], documentPrimaryKey);
                filePath = documentFolder + '/' + me.getModelTableName() + '/' + documentFileName;
                Common.device.File.deleteFileIfExists(filePath)
                    .then(function() {
                        Common.device.File.writeFile(filePath, convertedRecord[documentField.docContentsField])
                            .then(function () {
                                convertedRecord[documentField.docField + '_file'] = documentFileName;
                                convertedRecord[documentField.docContentsField] = '';
                                Log.log('Write doc_contents to file for field ' + documentField.docField, 'verbose');
                                resolve(convertedRecord);
                            }, reject);
                    }, reject);

            } else {
                resolve();
            }
        });
    },

    getModelTableName: function () {
        var me = this,
            model = me.getModel(),
            modelName,
            table = 'UNKNOWN';

        if (model) {
            modelName = model.modelName;
            table = modelName.slice(modelName.lastIndexOf('.') + 1);
        }

        return table;
    },

    getPrimaryKeyObject: function (convertedRecord) {
        var me = this,
            primaryKeyObject = {},
            primaryKeyFields = me.getDocumentTablePrimaryKeyFields();

        Ext.each(primaryKeyFields, function (key) {
            primaryKeyObject[key] = convertedRecord[key];
        });

        return primaryKeyObject;

    },

    //TODO: Duplicated in DocumentManager. Remove duplicated function
    generateFileName: function (tableName, documentField, documentFileName, key) {
        var keyValues = '',
            value;

        for (value in key) {
            keyValues += key[value] + '-';
        }

        return Ext.String.format('{0}{1}-{2}-{3}', keyValues, tableName, documentField, documentFileName);
    },

    disableStoreEvents: function () {
        var me = this,
            model = me.getModel();
        // Disable store events during sync to prevent UI updates
        me.suspendEvents();
        model.prototype.disableEditHandling = true;
    },

    enableStoreEvents: function (error) {
        var me = this,
            model = me.getModel();

        me.resumeEvents(true);
        model.prototype.disableEditHandling = false;

        if (error) {
            return Promise.reject(error);
        } else {
            return Promise.resolve();
        }

    }


});