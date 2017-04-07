/**
 * Test server side restriction
 * Note: Execute test using the HQ database
 */
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */

StartTest(function (t) {

    t.requireOk('Common.scripts.ScriptManager', 'Common.service.MobileSyncServiceAdapter', 'Common.log.Logger',
        'Common.service.MobileSecurityServiceAdapter', 'Common.util.ConfigFileManager', 'Common.config.GlobalParameters',
        'Common.test.util.TestUser', 'Common.service.Session', 'Common.util.Network', function () {

            var tableName = 'bl',
                fieldNames = ['bl_id', 'name'],
                restriction = {},
                cityRestriction,
                async,
                desiredResult = [
                    {
                        bl_id: ['HQ', 'JFK A'],
                        recordCount: 2
                    }
                ];

            var onFinish = function () {
                Common.service.Session.end();
                t.endAsync(async);
                t.done();
            };

            restriction.clauses = [
                {
                    tableName: 'bl',
                    fieldName: 'bl_id',
                    operation: 'EQUALS',
                    value: 'HQ',
                    relativeOperation: 'OR_BRACKET'
                },
                {
                    tableName: 'bl',
                    fieldName: 'bl_id',
                    operation: 'EQUALS',
                    value: 'JFK A',
                    relativeOperation: 'OR_BRACKET'
                }
            ];

            cityRestriction = {
                clauses: [
                    {
                        tableName: 'bl',
                        fieldName: 'ctry_id',
                        operation: 'EQUALS',
                        value: 'USA',
                        relativeOperation: 'AND_BRACKET'
                    },
                    {
                        tableName: 'bl',
                        fieldName: 'city_id',
                        operation: 'EQUALS',
                        value: 'PHILADELPHIA',
                        relativeOperation: 'AND_BRACKET'
                    }
                ]
            };

            async = t.beginAsync();

            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return MobileSyncServiceAdapter.retrieveRecords(tableName, fieldNames, restriction);
                })
                .then(function (records) {
                    t.is(desiredResult[0].recordCount, records.length, 'Record length matches');
                    t.is(desiredResult[0].bl_id[0], records[0].fieldValues[0].fieldValue, 'Building ID Matches');
                    t.is(desiredResult[0].bl_id[1], records[1].fieldValues[0].fieldValue, 'Building ID Matches');
                    return Promise.resolve();
                })
                .then(function () {
                    return MobileSyncServiceAdapter.retrieveRecords(tableName, fieldNames, cityRestriction);
                })
                .then(function (records) {
                    t.is(8, records.length, 'City restriction number of records match');
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Promise.reject();
                })
                .done(onFinish, onFinish);
        });
});

