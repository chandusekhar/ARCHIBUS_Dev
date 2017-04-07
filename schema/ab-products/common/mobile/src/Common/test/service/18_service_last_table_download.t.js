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

            var getLastSyncTime = function (clientTableName) {
                return new Promise(function (resolve, reject) {
                    var options = {
                        async: true,
                        timeout: 20000,
                        headers: {"cache-control": "no-cache"},
                        callback: function(timestamp) {
                            var value = timestamp.getTime();
                            resolve(value);
                        },
                        errorHandler: function(message, exception) {
                            reject(exception);
                        }
                    };

                    MobileSyncService.retrieveTableDownloadTime(ConfigFileManager.username, ConfigFileManager.deviceId, clientTableName, options);
                });
            };

            var recordTableDownloadTime = function(clientTableName, serverTableName) {
                return new Promise(function(resolve, reject) {
                    var options = {
                        async: true,
                        timeout: 20000,
                        headers: { "cache-control": "no-cache" },
                        callback: resolve,
                        errorHandler: function(message, exception) {
                            reject(exception);
                        }
                    };

                    MobileSyncService.recordTableDownloadTime(ConfigFileManager.username, ConfigFileManager.deviceId, clientTableName, serverTableName, options);
                });
            };

            t.beginAsync(async);

            Common.test.util.TestUser.registerTestUser('TRAM', 'afm')
                .then(function () {
                    return Common.service.Session.start();
                })
                .then(function() {
                    return recordTableDownloadTime('Building', 'bl');
                })
                .then(function () {
                    return getLastSyncTime('Building');
                })
                .then(function (timestamp) {
                    // TODO: Verify timestamp.
                })
                .then(null, function (error) {
                    t.fail(error);
                })
                .done(onFinished, onFinished);

        });
});
