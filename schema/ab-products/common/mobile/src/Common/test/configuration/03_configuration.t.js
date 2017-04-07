// Verify that an exception is thrown if the error callback is omitted on the read operation.

/*jshint newcap: false */
/* global StartTest */

StartTest(function (t) {

    t.requireOk('Common.util.ConfigFileManager', 'Common.lang.ComponentLocalizer', 'Common.log.Logger',
        'Common.scripts.loader.Loader', 'Common.util.Format', function () {

            var async;

            LocalFileSystem = {
                TEMPORARY: window.TEMPORARY || 0,
                PERSISTENT: window.PERSISTENT || 1
            };

            window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


            t.requireOk('Common.util.ConfigFileManager', function () {

                // Override ConfigFileManager.readConfigObject function to generate error
                async = t.beginAsync();
                Common.util.ConfigFileManager.readConfigObject = function (resultCallback, errorCallback, scope) {
                    var me = this, defaultConfig = me.propertiesToObject(),

                        onError = function (errMsg) {
                            // if the error code is 1 the file does not exist.
                            // create the file with default values
                            if (errMsg.code === 1) {
                                me.writeConfigObject(defaultConfig, function () {
                                    if (typeof resultCallback === 'function') {
                                        resultCallback.call(scope || me, defaultConfig);
                                    }
                                });
                            } else if (typeof errorCallback === 'function') {
                                errorCallback.call(scope || me, errMsg);
                            } else {
                                throw errMsg;
                            }
                        };

                    // Throw error
                    onError(99);
                };

                // Handle error in callback
                ConfigFileManager.load(Ext.emptyFn(),
                    function (error) {
                        console.log('error ' + error);
                        t.is(error, 99, 'Error handled in callback');

                        // Allow exception to be thrown
                        try {
                            ConfigFileManager.load();
                        }
                        catch (e) {
                            console.log(e);
                            t.is(e, 99, 'Exception thrown');
                            t.endAsync();
                            t.done();
                        }
                    });
            });

        });
});
