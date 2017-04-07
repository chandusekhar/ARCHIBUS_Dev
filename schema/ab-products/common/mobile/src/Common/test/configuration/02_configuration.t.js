// Verify loading and syncing of the ConfigFileManager class.

/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */
StartTest(function (t) {

    t.requireOk('Common.util.ConfigFileManager', 'Common.lang.ComponentLocalizer', 'Common.log.Logger',
        'Common.scripts.loader.Loader', 'Common.util.Format', function () {

            LocalFileSystem = {
                TEMPORARY: window.TEMPORARY || 0,
                PERSISTENT: window.PERSISTENT || 1
            };

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

            t.requireOk('Common.util.ConfigFileManager', function () {

                var async = t.beginAsync();
                // load the ConfigFileManager
                Common.util.ConfigFileManager.load(function () {
                    // set values
                    ConfigFileManager.isRegistered = true;
                    ConfigFileManager.url = 'www.google.com';
                    ConfigFileManager.username = 'AI';
                    ConfigFileManager.deviceId = '987';

                    ConfigFileManager.sync(function () {
                        t.is(ConfigFileManager.isRegistered, true, 'isRegistered matches');
                        t.is(ConfigFileManager.url, 'www.google.com', 'url matches');
                        t.is(ConfigFileManager.username, 'AI', 'username matches');
                        t.is(ConfigFileManager.deviceId, '987', 'deviceId matches');
                        t.endAsync(async);
                        t.done();
                    });

                });
            });
        });
});
