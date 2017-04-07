/* jshint -W064 */
/* jshint -W117 */
StartTest(function (t) {

    t.requireOk('Common.log.Logger', 'Common.scripts.ScriptManager', 'Common.util.ConfigFileManager', 'Common.service.MobileSecurityServiceAdapter',
        'Common.service.MobileSyncServiceAdapter', 'Common.test.util.TestUser', 'Common.service.Session',
        'Common.config.GlobalParameters', 'Common.device.File', function () {

            var onFinished = function () {
                Common.service.Session.end()
                    .then(function () {
                        t.endAsync(async);
                        t.done();
                    });
            };

            var async;

            t.beginAsync(async);

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function () {
                    return MobileSyncServiceAdapter.retrieveModifiedRecords('fl', ['bl_id', 'fl_id', 'name'], null, 100, false, 0);
                })
                .then(function (records) {
                    return MobileSyncServiceAdapter.retrieveModifiedRecords('bl', ['bl_id', 'name'], null, 100, false, 0);
                })
                .then(function(records) {
                    // TODO: check records.
                })
                .then(function () {
                    return Common.service.Session.end();
                })
                .then(null, function (error) {
                    t.fail(error);
                })
                .done(onFinished, onFinished);

        });
});