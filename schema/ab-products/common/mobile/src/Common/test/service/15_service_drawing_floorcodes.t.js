StartTest(function (t) {

    t.requireOk('Common.log.Logger','Common.scripts.ScriptManager', 'Common.util.ConfigFileManager', 'Common.service.MobileSecurityServiceAdapter',
        'Common.test.util.TestUser', 'Common.service.Session', 'Common.service.drawing.Drawing',
        'Common.config.GlobalParameters', 'Common.device.File', 'Common.util.ApplicationPreference',
        'Common.store.AppPreferences', function () {

            var async = t.beginAsync();

            var onFinish = function () {
                Common.service.Session.end().then(function () {
                    t.endAsync(async);
                    t.done();
                });
            };

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return Common.service.drawing.Drawing.getFloorCodesForPublishedDrawings(['MARKET'], ['HQ']);
                })
                .then(function (floorCodes) {
                    t.ok(floorCodes, 'Floor Codes returned');
                    t.is(floorCodes.length, 9, 'Correct number of Floor Codes retrieved');  // HQ Canonic database v 23.1 - HQ building
                    // Test empty array parameters
                    return Common.service.drawing.Drawing.getFloorCodesForPublishedDrawings([], []);
                })
                .then(function (floorCodes) {
                    t.ok(floorCodes, 'Floor Codes returned');
                    t.is(floorCodes.length, 44, 'Correct number of Floor Codes retrieved');  // HQ Canonic database v 23.1 - All buildings
                    // Test null parameters
                    return Common.service.drawing.Drawing.getFloorCodesForPublishedDrawings(null, null);
                })
                .then(function (floorCodes) {
                    t.ok(floorCodes, 'Floor Codes returned');
                    t.is(floorCodes.length, 44, 'Correct number of Floor Codes retrieved');  // HQ Canonic database v 23.1 - All buildings
                    // Test null parameters
                    return Common.service.drawing.Drawing.getFloorCodesForPublishedDrawings(['MARKET'], ['LX']);
                })
                .then(function (floorCodes) {
                    t.ok(floorCodes, 'Floor Codes returned');
                    t.is(floorCodes.length, 0, 'Correct number of Floor Codes retrieved for building LX');  // HQ Canonic database v 23.1 - LX building
                    // Test null parameters
                    return Promise.resolve();
                })
                .then(null, function (error) {
                    t.fail(error);
                    return Promise.reject();
                })
                .done(onFinish, onFinish);


        });
});
