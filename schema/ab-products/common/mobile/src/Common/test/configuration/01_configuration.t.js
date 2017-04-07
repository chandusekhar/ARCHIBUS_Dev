// Verify that a new configuration file is created when load is called the first time.

/* Disable JSHint warning of Missing 'new' prefix for the StartTest function. */
/* jshint newcap: false */
/* global StartTest */

StartTest(function (t) {
    t.requireOk('Common.util.ConfigFileManager', 'Common.lang.ComponentLocalizer',
        'Common.scripts.loader.Loader', 'Common.util.Format', 'Common.log.Logger', function () {

            var me = this,
                deleteFile,
                fileExists,
                async;

            LocalFileSystem = {
                TEMPORARY: window.TEMPORARY || 0,
                PERSISTENT: window.PERSISTENT || 1
            };

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


            deleteFile = function (onSuccess, scope) {

                var errorHandler = function (errMsg) {
                    alert('Error Deleting file ' + errMsg.code);
                    if (typeof onSuccess === 'function' && errMsg.code === 1) {
                        onSuccess.call(scope || me);
                    }
                };

                window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024 * 1024, function (fs) {
                    fs.root.getFile('MobileClient.conf', {create: false}, function (fileEntry) {

                        fileEntry.remove(function () {
                            console.log('File removed.');
                            if (typeof onSuccess === 'function') {
                                onSuccess.call(scope || me);
                            }
                        }, errorHandler);
                    }, errorHandler);
                }, errorHandler);
            };

            fileExists = function (onSuccess, scope) {

                var errorHandler = function (errMsg) {
                    alert('Error checking for file ' + errMsg.code);
                };

                window.requestFileSystem(LocalFileSystem.PERSISTENT, 1024 * 1024, function (fs) {
                    fs.root.getFile('MobileClient.conf', {create: false}, function (fileEntry) {

                        if (fileEntry.isFile === true) {
                            console.log('File exists.');
                            if (typeof onSuccess === 'function') {
                                onSuccess.call(scope || this, fileEntry.isFile);
                            }
                        }
                    }, errorHandler);
                }, errorHandler);
            };

            async = t.beginAsync();
            deleteFile(function () {
                console.log('Delete File finished');
                Common.util.ConfigFileManager.load(function () {
                    console.log('Configuration file loaded');
                    fileExists(function (fileExists) {
                        t.is(fileExists, true, 'Configuration file has been created');
                        Common.util.ConfigFileManager.sync(function () {
                            console.log('Config file sync complete');
                            t.endAsync(async);
                            t.done();
                        });

                    });
                });
            }, me);

        });

});


