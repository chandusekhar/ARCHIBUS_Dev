/**
 * Created by jmartin on 2/25/16.
 */

StartTest(function (test) {

    test.requireOk('Common.scripts.ScriptManager', 'Common.service.Session',
        'Common.service.MobileSecurityServiceAdapter', 'Common.util.ConfigFileManager',
        'Common.test.util.TestUser', 'Common.log.Logger', function () {

            var async;
            var recordDeviceRegistration = function(userName, deviceId, deviceName) {

                return new Promise(function(resolve, reject) {
                    var options = {
                        async: true,
                        timeout: 20000,
                        headers: { "cache-control": "no-cache" },
                        callback: resolve,
                        errorHandler: function(exception, message) {
                            reject(message);
                        }
                    };
                    MobileSecurityService.recordDeviceRegistration(userName, deviceId, deviceName, options);
                });

            };

            var onFinish = function () {
                Common.service.Session.end();
                test.endAsync(async);
                test.done();
            };



            async = test.beginAsync();

            // Configure test user.
            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function() {
                    return recordDeviceRegistration('TRAM', Common.test.util.TestUser.testUserDeviceId, 'TEST');
                })
                .then(function() {
                    return recordDeviceRegistration('TRAM', '12345', 'TEST');
                })
                .then(function() {
                    return Common.service.Session.end();
                })
                .then(null, function(error) {
                    test.fail(error);
                })
                .done(onFinish, onFinish);

        });


});
