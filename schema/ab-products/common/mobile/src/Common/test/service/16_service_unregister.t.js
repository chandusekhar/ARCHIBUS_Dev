/* jshint -W064 */
/* jshint -W117 */
StartTest(function (t) {

    t.requireOk('Common.log.Logger', 'Common.scripts.ScriptManager', 'Common.util.ConfigFileManager', 'Common.service.MobileSecurityServiceAdapter',
        'Common.test.util.TestUser', 'Common.service.Session', 'Common.config.GlobalParameters', 'Common.device.File', function () {

            var onFinished = function() {
                Common.service.Session.end()
                    .then(function() {
                        t.endAsync(async);
                        t.done();
                    });
            };

            /**
             * Verify the MobileSecurityServiceAdapter.unRegisterDevice method.
             * Unregistering device should result in the afm_users.mob_device_id being set to
             * null for the unregistered user.
             */
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function() {
                    return MobileSecurityServiceAdapter.unRegisterDevice('TRAM');
                })
                .then(function() {
                    t.diag('Unregister completed successfullly. Inspect afm_users table');
                }, function(error) {
                    t.fail(error);
                })
                .done(onFinished, onFinished);
        });
});