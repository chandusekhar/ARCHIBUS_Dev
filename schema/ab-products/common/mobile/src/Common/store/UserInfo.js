/**
 * Store containing user information for the registered user. The user information is retrieved using the Admin service.
 * The Admin service does not contain the craftsperson id. The craftsperson id is retrieved by retrieving the cf.cf_id
 * that is associated with the registered user email address.
 *
 * @since 21.3
 * @author Jeff Martin
 *
 */
Ext.define('Common.store.UserInfo', {
    extend: 'Common.store.sync.ValidatingTableStore',
    requires: ['Common.model.UserInfo'],

    config: {
        model: 'Common.model.UserInfo',
        storeId: 'userInfo',
        enableAutoLoad: true,
        disablePaging: true,
        proxy: {
            type: 'Sqlite'
        },
        tableDisplayName: ' ' // Not translated
    },

    userInfo: {
        name: '',
        email: '',
        cf_id: '',
        employee: {
            id: '',
            phone: '',
            organization: {
                departmentId: '',
                divisionId: ''
            },
            space: {
                buildingId: '',
                floorId: '',
                roomId: '',
                siteId: '',
                countryId: ''
            }
        }
    },

    deleteAndImportRecords: function () {
        var me = this,
            model = me.getModel(),
            proxy = me.getProxy(),
            table = proxy.getTable(),
            columns = proxy.getColumns();


        return me.createTableIfNotExists('UserInfo', model)
            .then(function () {
                return me.getUserInfoAndCraftspersonId();
            })
            .then(function (userInfo) {
                var userLocation = me.getUserLocation(userInfo);
                return me.verifyUserLocationAgainstVpaSettings(userInfo, userLocation);
            })
            .then(function(userInfo) {
                me.userInfo = userInfo;
                return me.deleteAllRecordsFromTable('UserInfo', true);
            })
            .then(function () {
                var records = me.convertUserInfoToServerRecord();
                return me.insertRecords(records, table, columns, model, true);
            })
            .then(function () {
                return me.recordDownloadTime();
            });
    },


    getUserInfoAndCraftspersonId: function () {
        var me = this,
            userInfo;

        return me.getUserInfo()
            .then(function (result) {
                userInfo = result;
                return me.getCraftspersonId(userInfo.email);
            })
            .then(function (cfId) {
                userInfo.cf_id = cfId;
                return Promise.resolve(userInfo);
            });
    },

    /**
     * Retrieves the users
     * @private
     */
    getUserInfo: function () {
        return new Promise(function (resolve, reject) {
            var options = {
                async: true,
                headers: {"cache-control": "no-cache"},
                callback: resolve,
                errorHandler: function (message, exception) {
                    var errorMessage = ExceptionTranslator.extractMessage(exception);
                    reject(errorMessage);
                }
            };

            AdminService.getUser(options);
        });
    },

    getCraftspersonId: function (email) {
        // Retrieve the cf record for the provided email
        var me = this,
            restriction = {
                clauses: [
                    {
                        tableName: 'cf',
                        fieldName: 'email',
                        operation: 'EQUALS',
                        value: email
                    }
                ]
            };

        return MobileSyncServiceAdapter.retrieveRecords('cf', ['cf_id', 'email'], restriction)
            .then(function (records) {
                var cfId;
                if (records.length > 0) {
                    cfId = me.getCfIdFromField(records[0]);
                }
                return Promise.resolve(cfId);
            });
    },

    /**
     * Converts the userInfo object into field object format that can be used to insert the record into the database.
     * @private
     * @returns {{fieldValues: Array}[]}
     */
    convertUserInfoToServerRecord: function () {
        var me = this,
            record = {},
            records = [],
            userInfo = me.userInfo;

        record.user_name = userInfo.name;
        record.email = userInfo.email;
        record.cf_id = userInfo.cf_id;
        record.em_id = userInfo.employee.id;
        record.phone = userInfo.employee.phone;
        record.bl_id = userInfo.employee.space.buildingId;
        record.fl_id = userInfo.employee.space.floorId;
        record.rm_id = userInfo.employee.space.roomId;
        record.dv_id = userInfo.employee.organization.divisionId;
        record.dp_id = userInfo.employee.organization.departmentId;
        record.site_id = userInfo.employee.space.siteId;

        records.push(record);

        return records;
    },

    /**
     * @private
     * @param record
     * @returns {string}
     */
    getCfIdFromField: function (record) {
        var i,
            ln = record.fieldValues.length,
            cfId = '';

        for (i = 0; i < ln; i++) {
            if (record.fieldValues[i].fieldName === 'cf_id') {
                cfId = record.fieldValues[i].fieldValue;
                break;
            }
        }

        return cfId;
    },

    getUserLocation: function (userInfo) {
        var location = {
                table: null,
                codes: [],
                hasDefaultLocation: false
            },
            blId = userInfo.employee.space.buildingId,
            flId = userInfo.employee.space.floorId,
            rmId = userInfo.employee.space.roomId;

        // Determine the table to verify
        if (Ext.isEmpty(blId) && Ext.isEmpty(flId) && Ext.isEmpty(rmId)) {
            return location;
        } else if (!Ext.isEmpty(blId) && Ext.isEmpty(flId) && Ext.isEmpty(rmId)) {
            location.table = 'bl';
            location.codes = [{field: 'bl_id', value: blId}];
            location.hasDefaultLocation = true;
            return location;
        } else if (!Ext.isEmpty(blId) && !Ext.isEmpty(flId) && Ext.isEmpty(rmId)) {
            location.table = 'fl';
            location.codes = [{field: 'bl_id', value: blId}, {field: 'fl_id', value: flId}];
            location.hasDefaultLocation = true;
            return location;
        } else if (!Ext.isEmpty(blId) && !Ext.isEmpty(flId) && !Ext.isEmpty(rmId)) {
            location.table = 'rm';
            location.codes = [{field: 'bl_id', value: blId}, {field: 'fl_id', value: flId}, {
                field: 'rm_id',
                value: rmId
            }];
            location.hasDefaultLocation = true;
            return location;
        }

        // Should never get here.
        return location;
    },

    /**
     * Generates the restriction to use when retrieving user location records.
     * @private
     * @param {Object} userLocation
     * @returns {{clauses: Array}}
     */
    getUserLocationTableRestriction: function (userLocation) {
        var restriction = {clauses: []};

        Ext.each(userLocation.codes, function (code) {
            restriction.clauses.push({
                tableName: userLocation.table,
                fieldName: code.field,
                operation: 'EQUALS',
                value: code.value
            });
        });
        return restriction;
    },

    /**
     * Checks the user location against the user VPA settings. The user location values are cleared
     * if the VPA settings do not agree with the location settings.
     *
     * @param {Object} userInfo
     * @param {Object} userLocation
     * @returns {Promise} A Promise object resolved to the userInfo object
     */
    verifyUserLocationAgainstVpaSettings: function (userInfo, userLocation) {
        var me = this,
            restriction = me.getUserLocationTableRestriction(userLocation),
            serverFields = Ext.Array.pluck(userLocation.codes, 'field');

        if (userLocation.hasDefaultLocation) {
            return MobileSyncServiceAdapter.retrieveRecords(userLocation.table, serverFields, restriction)
                .then(function (records) {
                    if (records && records.length > 0) {
                        return Promise.resolve(userInfo);
                    } else {
                        // No records where returned, the VPA settings do not match the location values entered
                        // for the user. Clear the userInfo location values.
                        userInfo.employee.space.buildingId = '';
                        userInfo.employee.space.floorId = '';
                        userInfo.employee.space.roomId = '';
                        return Promise.resolve(userInfo);
                    }
                });
        } else {
            return Promise.resolve(userInfo);
        }
    },

    /**
     * Removes the user info from the store.
     * Deletes the UserInfo data from the client database
     */
    deleteUserInfo: function() {
        var me = this;

        me.removeAll();
        return me.deleteAllRecordsFromTable('UserInfo', true)
            .then(function() {
                return me.loadStore();
            });
    },

    /**
     * Loads the Store
     * @returns {Promise} resolved with the loaded records when the loading is successful. Rejected
     * with the error message if the store loading fails.
     */
    loadStore: function() {
        var me = this;
        return new Promise(function(resolve, reject) {
            me.load({
                callback: function(records, operation, success) {
                    if(success) {
                        resolve(records);
                    } else {
                        reject(LocaleManager.getLocalizedString('Error loading Store.'));
                    }
                },
                scope: me
             });
        });
    }

});