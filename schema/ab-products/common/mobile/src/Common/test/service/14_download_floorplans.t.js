/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* global StartTest */
/* jshint newcap:false */

/**
 * Tests the Common.util.Drawing.getDrawingsForFloor function using a floor that contains floor plans
 * Environment: Requires the HQ Canonical database
 */
StartTest(function (t) {

    t.requireOk('Common.log.Logger','Common.scripts.ScriptManager', 'Common.util.ConfigFileManager', 'Common.service.MobileSecurityServiceAdapter',
        'Common.test.util.TestUser', 'Common.service.Session', 'Floorplan.util.Floorplan', 'Common.service.drawing.Drawing',
        'Common.config.GlobalParameters', 'Common.device.File', 'Common.util.ApplicationPreference',
        'Common.store.AppPreferences', function () {

            var pkeyValues = [
                {
                    bl_id: 'HQ',
                    fl_id: '01'
                },
                {
                    bl_id: 'HQ',
                    fl_id: '15'
                },
                {
                    bl_id: 'HQ',
                    fl_id: '18'
                }];

            var planTypes = [
                '1 - ALLOCATION',
                '2 - CATEGORY',
                '3 - TYPE',
                '4 - OCCUPANCY',
                '5 - VACANCY',
                '6 - LEASE',
                '7 - EMERGENCY',
                '8 - HAZMAT',
                '9 - SURVEY'
            ];


            var async = t.beginAsync();
            var endTest = function () {
                Common.service.Session.end();
                t.endAsync(async);
                t.done();
            };

            // Register App Preferences store
            Ext.create('Common.store.AppPreferences');

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return Floorplan.util.Floorplan.getDrawingsForFloors(pkeyValues, planTypes);
                })
                .then(function (numberOfFloorPlansDownloaded) {
                    t.is(numberOfFloorPlansDownloaded, 3, 'Floorplan download succeeded');
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    alert(error);
                })
                .done(endTest, endTest);

        });
});

