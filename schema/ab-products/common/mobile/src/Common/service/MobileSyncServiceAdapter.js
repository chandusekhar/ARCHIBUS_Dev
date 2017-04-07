/**
 * Encapsulates details of MobileSyncService calls.
 *
 * @author Valery Tydykov
 * @since 21.1
 */
Ext.define('Common.service.MobileSyncServiceAdapter', {
    singleton: true,
    alternateClassName: ['MobileSyncServiceAdapter'],

    requires: [
        'Common.service.ExceptionTranslator',
        'Common.util.Network'
    ],

    mixins: ['Common.service.MobileServiceErrorHandler'],

    /**
     * Transfers records from the mobile client to the Web Central database table.
     * @param {String} tableName The name of the Web Central database table.
     * @param {String[]} inventoryKeyNames An array containing the names of the primary key fields for the Web Central
     * table
     * @param {Object[]} records An array of record objects to be written to the Web Central database table
     * @returns {Promise} A Promise object resolved when the check in
     */
    checkInRecords: function (tableName, inventoryKeyNames, records) {
        var me = this,
            logMessage = 'tableName=[{0}], inventoryKeyNames=[{1}], Number of Records =[{2}]',
            numberOfRecords = records ? records.length : 0;

        return new Promise(function(resolve, reject) {
            var options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: { "cache-control": "no-cache" },
                callback: resolve,
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };

            Log.log(Ext.String.format(logMessage, tableName, inventoryKeyNames, numberOfRecords ), 'info', me, 'checkInRecords');
            MobileSyncService.checkInRecords(tableName, inventoryKeyNames, records, options);
        });
    },

    checkOutRecords: function (tableName, fieldNames, restriction) {
        var me = this,
            logMessage = 'tableName=[{0}], fieldNames=[{1}]';

        return new Promise(function(resolve, reject) {
            var options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: { "cache-control": "no-cache" },
                callback: resolve,
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };

            Log.log(Ext.String.format(logMessage, tableName, fieldNames), 'info', me, 'checkOutRecords');
            MobileSyncService.checkOutRecords(tableName, fieldNames, restriction, options);
        });
    },

    retrieveRecords: function (tableName, fieldNames, restriction) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var options = {
                    async: true,
                    timeout: Network.SERVICE_TIMEOUT * 1000,
                    headers: {"cache-control": "no-cache"},
                    callback: resolve,
                    errorHandler: me.errorHandlerFunction.bind(me, reject)
                },
                logMessage = 'Calling MobileSyncService.retrieveRecords: tableName=[{0}], fieldNames=[{1}]';

            Log.log(Ext.String.format(logMessage, tableName, fieldNames), 'info', me, 'retrieveRecords');
            MobileSyncService.retrieveRecords(tableName, fieldNames, restriction, options);
        });
    },

    getTableDefAsync: function (tableName, completedCallback, scope) {
        var me = this,
            result = {
                tableDef: null,
                success: false,
                exception: null
            },
            onSuccess = function (tableDef) {
                result.tableDef = tableDef;
                result.success = true;
                Ext.callback(completedCallback, scope || me, [result]);
            },
            onError = function (message, exception) {
                result.success = false;
                exception.genericMessage = LocaleManager.getLocalizedString('Error retrieving TableDef.',
                    'Common.service.MobileSyncServiceAdapter');
                result.exception = exception;
                Ext.callback(completedCallback, scope || me, [result]);
            },
            options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: { "cache-control": "no-cache" },
                callback: onSuccess,
                errorHandler: onError
            };

        MobileSyncService.getTableDef(tableName, options);
    },

    /**
     * Returns a list of applications that the mobile user is authorized to use.
     * @return {Promise} A Promise object resolved with the array of authorized applications.
     *
     */
    getEnabledApplications: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var options = {
                async: true,
                headers: {"cache-control": "no-cache"},
                callback: resolve,
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };

            MobileSyncService.getEnabledApplications(options);
        });
    },


    /**
     * Retrieves the TableDef DTO object from the Web Central server for the provided table
     * @param {String} tableName The name of the server side table
     * @returns {Promise} A Promise that resolves to the tableDef object for the provided table
     * The Promise rejects with an error message if any errors are encountered.
     */
    getTableDef: function (tableName) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: {"cache-control": "no-cache"},
                callback: resolve,
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };
            MobileSyncService.getTableDef(tableName, options);
        });

    },

    /**
     * Retrieves a paged record set from the Web Central server for the provided table and fieldNames
     * @param {String} tableName The server side database table name
     * @param {String[]} fieldNames An array of field names to include in the result set
     * @param {Object} restriction The restriction to be applied to the result set
     * @param {Number} pageSize The number of records to retrieve at a time
     * @param {Boolean} [includeDocumentData] Returns the document data in the associated document contents field when true.
     * When false the document contents field is null. Defaults to true.
     *
     * @returns {Promise} A Promise that resolves to the returned record set. The Promise is rejected if
     * any errors occur.
     */
    retrievePagedRecords: function (tableName, fieldNames, restriction, pageSize, includeDocumentData) {
        var me = this,
            includeDocumentDataInSync = true;

        if(Ext.isDefined(includeDocumentData)) {
            includeDocumentDataInSync = includeDocumentData;
        }

        return new Promise(function (resolve, reject) {
            var options = {
                    async: true,
                    timeout: Network.SERVICE_TIMEOUT * 1000,
                    headers: {"cache-control": "no-cache"},
                    callback: resolve,
                    errorHandler: me.errorHandlerFunction.bind(me, reject)
                },
                logMessage = 'tableName=[{0}], fieldNames=[{1}], pageSize=[{2}]';

            Log.log(Ext.String.format(logMessage, tableName, fieldNames, pageSize), 'info', me, 'retrievePagedRecords');
            MobileSyncService.retrievePagedRecords(tableName, fieldNames, restriction, pageSize, includeDocumentDataInSync, options);
        });
    },

    /**
     * Retrieves the last download time for a client side table, user and device combination.
     * @param {String} clientTableName The name of the table in the client database.
     * @returns {Promise} a Promise resolved to the last download time. The download time is represented
     * as milliseconds.
     */
    retrieveLastTableDownloadTime: function(clientTableName) {
        var me = this;
        return new Promise(function(resolve, reject) {
            var options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: { "cache-control": "no-cache" },
                callback: function(timestamp) {
                    // Convert the timestamp Date object to number of milliseconds.
                    resolve(timestamp.getTime());
                },
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };

            MobileSyncService.retrieveTableDownloadTime(ConfigFileManager.username, ConfigFileManager.deviceId, clientTableName, options);
        });
    },

    /**
     * Writes the table download time to the server side afm_mobile_sync_history table.
     * @param {String} clientTableName of the table in the client database.
     * @param serverTableName of the table in the Web Central database.
     * @returns {Promise} a resolved Promise when the operation is completed.
     */
    recordLastTableDownloadTime: function(clientTableName, serverTableName) {
        var me = this;
        return new Promise(function(resolve, reject) {
            var options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: { "cache-control": "no-cache" },
                callback: resolve,
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };

            MobileSyncService.recordTableDownloadTime(ConfigFileManager.username, ConfigFileManager.deviceId, clientTableName, serverTableName, options);
        });
    },

    /**
     * Retrieves records that have been modified after the last table sync time.
     * Uses the data stored in the afm_table_trans table to determine the records to retrieve
     * from the target table.
     * @param {String} tableName of the server side table to retrieve the records from.
     * @param {String[]} fieldNames to include in the result set.
     * @param {Object} restriction to apply to the returned records.
     * @param {Number} pageSize of the number of records to return.
     * @param {Boolean} includeDocumentData true to include the document data in the returned records.
     * @param {Number} timestamp of the last table download time in millisecods since 1/1/1970
     * @returns {Promise} a Promise resolved with an array of modified records.
     */
    retrieveModifiedRecords: function(tableName, fieldNames, restriction, pageSize, includeDocumentData, timestamp) {
        var me = this,
            includeDocumentDataInSync = true;

        if(Ext.isDefined(includeDocumentData)) {
            includeDocumentDataInSync = includeDocumentData;
        }

        return new Promise(function (resolve, reject) {
            var options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: {"cache-control": "no-cache"},
                callback: resolve,
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };

            MobileSyncService.retrieveModifiedRecords(tableName, fieldNames, restriction, pageSize, includeDocumentDataInSync, timestamp, options);

        });
    },

    /**
     * Retrieves the primary key values of records that have been deleted since the last table download.
     * Used the data stored in the afm_table_trans table to determine the records that have been deleted.
     * @param {String} serverTableName of the database table name on the Web Central server.
     * @param {Number} timestamp of the last download.
     * @returns {Promise} a Promise resolved when the operation is completed.
     */
    retrieveDeletedRecords: function(serverTableName, timestamp) {
        return new Promise(function(resolve, reject) {
            var options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: { "cache-control": "no-cache" },
                callback: function(records) {
                    resolve(records);
                },
                errorHandler: function(exception, message) {
                    reject(message);
                }
            };

            MobileSyncService.retrieveDeletedRecords(serverTableName, timestamp, options);
        });
    }
});