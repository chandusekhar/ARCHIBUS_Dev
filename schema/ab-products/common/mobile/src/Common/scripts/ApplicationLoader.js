/**
 *  Overwrites the Ext.application object. Used to replace the Ext.application class with the Common.Application
 *  class. This class is loaded before any other framework class.
 *
 *  The class should be the first class loaded in the app.js file.
 *
 *      Ext.require([ 'Common.scripts.ApplicationLoader', 'Common.Application', 'Ext.data.Validations'
 *          ''Common.lang.ComponentLocalizer'' ], function() {
 *              Ext.application({
 *              name : 'MyApp',
 *              // Remaining app configuration ...
 *          }
 *     );
 *
 *  @author Jeff Martin
 *  @since 21.1
 */
Ext.define('Common.scripts.ApplicationLoader', {
    singleton: true,

    requires: [
        'Common.log.LogManager',
        'Ext.Toast'
    ]

}, function () {
    Ext.apply(Ext, {
        application: function (config) {
            var me = this,
                appName = config.name,
                onReady,
                scope,
                requires,
                logger;

            if (!config) {
                config = {};
            }

            // Shared logging configuration
            logger = Common.log.LogManager.getDefaultLogConfig();

            config.logger = logger;


            config.onUpdated = function () {
                var updateMessage = LocaleManager.getLocalizedString('This application has been updated to the latest version. Reloading the application.',
                    'Common.scripts.ApplicationLoader');

                Ext.toast(updateMessage, 5000);

                setTimeout(function() {
                    Common.util.AppCacheManager.writeAppCacheDataToFile(function () {
                        var buildVersionUrl = {
                            url: ConfigFileManager.url + '/' + Common.Application.appName + '.build.js',
                            appName: Common.Application.appName
                        };

                        // Update the build version stored in local storage
                        Common.util.VersionInfo.getBuildInfo(buildVersionUrl)
                            .then(function () {
                                window.location.reload();
                            });

                    }, me);
                }, 5000);
            };

            if (!Ext.Loader.config.paths[appName]) {
                Ext.Loader.setPath(appName, config.appFolder || 'app');
            }

            requires = Ext.Array.from(config.requires);
            config.requires = ['Common.Application'];

            onReady = config.onReady;
            scope = config.scope;

            config.onReady = function () {
                config.requires = requires;
                new Common.Application(config);

                if (onReady) {
                    onReady.call(scope);
                }
            };

            Ext.setup(config);
        }
    });
});
