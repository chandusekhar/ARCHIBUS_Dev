/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* global StartTest */
/* jshint newcap:false */

/**
 * Tests the Common.util.Drawing.getDrawingsForFloor function using a floor that contains floor plans
 * Environment: Requires the HQ Canonical database
 */
StartTest(function (t) {

    t.requireOk('Common.log.Logger','Common.scripts.ScriptManager', 'Common.util.ConfigFileManager', 'Common.service.MobileSecurityServiceAdapter',
        'Common.test.util.TestUser', 'Common.service.Session', 'Floorplan.util.Floorplan', 'Common.service.drawing.Drawing', function () {

            var pkeyValues = {
                bl_id: 'HQ',
                fl_id: '01'
            };

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

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return Floorplan.util.Floorplan.getDrawingsForFloor(pkeyValues, planTypes);
                })
                .then(function (drawingData) {
                    t.is(drawingData.drawings.length, 9, "Number of plan types is correct");
                    // Check that each drawing data object contains SVG data
                    Ext.each(drawingData.drawings, function (object) {
                        t.isGreater(object.svg.length, 0, object.planType + ' has SVG data');
                    });
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Promise.resolve();
                })
                .done(endTest, endTest);

        });
});

