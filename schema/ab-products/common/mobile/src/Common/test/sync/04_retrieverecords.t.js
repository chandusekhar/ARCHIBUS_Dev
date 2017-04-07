/**
 * Test retrieving records in async mode.
 */
/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.scripts.ScriptManager', 'Common.service.MobileSyncServiceAdapter',
        'Common.service.MobileSecurityServiceAdapter', 'Common.util.ConfigFileManager', 'Common.log.Logger', 'Common.config.GlobalParameters',
        'Common.test.util.TestUser', 'Common.util.Network', 'Common.service.Session', function () {

            var tableName = 'bl',
                fieldNames = [
                    'bl_id',
                    'name',
                    'city_id',
                    'state_id',
                    'ctry_id',
                    'use1',
                    'contact_name',
                    'date_bl',
                    'area_gross_ext',
                    'area_gross_int',
                    'area_rentable',
                    'area_usable',
                    'contact_phone',
                    'construction_type',
                    'site_id',
                    'bldg_photo'
                ],
                async,
                onFinish = function () {
                    Common.service.Session.end();
                    t.endAsync(async);
                    t.done();
                };

            t.beginAsync(async);
            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm').then(function () {
                    return Common.service.MobileSecurityServiceAdapter.startSession(ConfigFileManager.deviceId, 'en-US');
                })
                .then(function () {
                    return MobileSyncServiceAdapter.retrieveRecords(tableName, fieldNames, null);
                })
                .then(function (records) {
                    // Check that records are returned
                    if (records) {
                        t.isGreater(records.length, 0, 'Records are returned');
                        t.is(records[0].fieldValues.length, fieldNames.length + 1, 'Number of returned columns matches requested columns');
                    }
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Promise.reject();
                })
                .done(onFinish, onFinish);

        });
});

