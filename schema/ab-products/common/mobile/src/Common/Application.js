/**
 * Adds functionality to all Application class instances. Extends the Ext.app.Application class
 * to add ARCHIBUS specific functions
 *
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 *
 */

Ext.define('Common.Application', {
        extend: 'Ext.app.Application',

        requires: [
            'Ext.data.Types',
            'Ext.util.Region',
            'Common.env.Feature',
            'Common.log.Logger',
            'Common.util.Network',
            'Common.scripts.ScriptManager',
            'Common.util.ConfigFileManager',
            'Common.store.proxy.SqliteConnectionManager',
            'Common.store.sync.SqliteStore',
            'Common.store.proxy.Sqlite',
            'Common.config.GlobalParameters',
            'Ext.Toolbar',
            'Ext.form.FieldSet',
            'Ext.MessageBox',
            'Ext.Label',
            'Ext.field.Password',
            'Ext.field.Select',
            'Common.util.Mask',
            'Common.util.AppCacheManager',
            'Common.util.SynchronizationManager',  // Deprecated replace with Common.sync.Manager
            'Common.store.TableDefs',
            'Common.store.Currencies',
            'Common.store.SchemaPreferences',
            'Common.store.AppPreferences',
            'Common.store.TableDownloads',
            'Common.store.UserInfo',
            'Common.store.Users',
            'Common.overrides.viewport.Default',
            'Common.log.LogManager',
            'Common.store.Messages',
            'Common.service.Session',
            'Common.overrides.log.Logger',
            'Common.overrides.picker.Slot',
            'Common.overrides.util.Point',
            'Common.overrides.event.recognizer.Drag',
            'Common.overrides.field.Text',
            'Ext.Toast'
        ],

        commonStores: [
            'Common.store.TableDefs',
            'Common.store.Currencies',
            'Common.store.SchemaPreferences',
            'Common.store.AppPreferences',
            'Common.store.TableDownloads',
            'Common.store.UserInfo',
            'Common.store.Users',
            'Common.store.Messages'
        ],

        APP_LOADING_INDICATOR: 'appLoadingIndicator',


        statics: {
            /**
             * @property {String} appName The application name. Globally accessible using Common.Application.appName
             */
            appName: ''
        },


        constructor: function (config) {
            // Set the static appName property
            Common.Application.appName = config.name;
            this.callParent([config]);

        },

        /**
         * Override so that the ConfigFileManager can be loaded before the app stores are instantiated. Loading the
         * configuration first ensures that the user database mapping is loaded before the app accesses the
         * client database.
         * @override
         * @private
         * Controllers can also specify dependencies, so we grab them all here and require them.
         */
        loadControllerDependencies: function () {
            var controllers,
                classes = [],
                stores = [],
                controller, controllerStores, name;

            this.instantiateControllers();

            controllers = this.getControllerInstances();


            for (name in controllers) {
                controller = controllers[name];
                controllerStores = controller.getStores();
                stores = stores.concat(controllerStores);

                classes = classes.concat(controller.getModels().concat(controller.getViews()).concat(controllerStores));
            }

            this.setStores(this.getStores().concat(stores));

            // Initiate ARCHIBUS custom start up sequence.
            Ext.require(classes, this.loadConfigurationFile, this);
        },


        /**
         * Loads the ConfigFileManager
         */
        loadConfigurationFile: function () {
            var errorMessage = LocaleManager.getLocalizedString('Error loading the Configuration file.',
                'Common.Application'),
                browserStorageMessage = LocaleManager.getLocalizedString(
                    '<br>Accept the browser request to store data on your local computer and refresh the page.',
                    'Common.Application');

            Common.util.ConfigFileManager.load(this.onDependenciesLoaded, function () {
                if (Ext.os.is.Desktop && Ext.browser.is.Chrome) {
                    errorMessage += browserStorageMessage;
                }
                throw new Error(errorMessage);
            }, this);
        },

        /**
         * @private Callback that is invoked when all of the Application, Controller and Profile dependencies have
         *          been loaded. Launches the controllers, then the profile and application
         */

        onDependenciesLoaded: function () {
            var me = this,
                profile = me.getCurrentProfile(),
                controllers, name;

            me.instantiateStores();

            // <deprecated product=touch since=2.0>
            Ext.app.Application.appInstance = this;

            if (Ext.Router) {
                Ext.Router.setAppInstance(this);
            }
            // </deprecated>

            controllers = this.getControllerInstances();

            for (name in controllers) {
                controllers[name].init(this);
            }

            if (profile) {
                profile.launch();
            }

            // <debug>
            if (!me.isBrowserWebKit()) {
                return;
            }
            // </debug>
            me.loadDwrServices();
        },

        /**
         * Override to include the shared stores
         * @override
         */
        instantiateStores: function () {
            var stores = this.getStores(),
                length,
                store, storeClass, storeName, splits, i,
                sqliteStores = [];

            // Order stores. Instantiate SQLiteView stores last

            stores = this.commonStores.concat(stores);
            length = stores.length;

            for (i = 0; i < length; i++) {
                store = stores[i];

                if (Ext.data && Ext.data.Store && !(store instanceof Ext.data.Store)) {
                    if (Ext.isString(store)) {
                        storeName = store;
                        storeClass = Ext.ClassManager.classes[store];

                        store = {
                            xclass: store
                        };

                        //we don't want to wipe out a configured storeId in the app's Store subclass so need
                        //to check for this first
                        if (storeClass.prototype.defaultConfig.storeId === undefined) {
                            splits = storeName.split('.');
                            store.id = splits[splits.length - 1];
                        }
                    }

                    // If this is a SQLite view store save it and instantieate it after all other stores.
                    if (storeClass.prototype.config.proxy && storeClass.prototype.config.proxy.type === 'SqliteView') {
                        sqliteStores.push(store);
                        stores[i] = null;
                    } else {
                        stores[i] = Ext.factory(store, Ext.data.Store);
                    }
                }
            }
            // Remove all of the null items corresponding to SQLite view stores.
            stores = Ext.Array.clean(stores);

            // Instantiate SQLite stores
            Ext.each(sqliteStores, function (store) {
                stores.push(Ext.factory(store, Ext.data.Store));
            });

            this.setStores(stores);
        },


        loadDwrServices: function () {
            var me = this;

            me.registerDwrServiceScriptsIfConnected(function (isConnected) {
                var message = isConnected ? 'DWR Scripts are loaded' : 'DWR Scripts are not loaded. Network connection is not available';
                console.log(message);
                // Close any open orphaned Web Central Sessions
                if (isConnected) {
                    console.log('Clean up orphaned Web Central sessions.');
                    Common.service.Session.end().then(function () {
                        me.loadStoresAndSync();
                    });
                } else {
                    me.loadStoresAndSync();
                }
            }, me);
        },

        /**
         * Loads the configuration data from the configuration file. Notifies the application class when the
         * configuration file has been read. The application is ready to be launched when the file read operation is
         * completed.
         */
        loadStoresAndSync: function () {
            var me = this,
                autoSync = me.autoBackgroundDataSync;

            Common.log.LogManager.updateLogger(ConfigFileManager.logger);
            Log.log('Config File loaded', 'info', me, arguments);
            me.loadRequiredStores()
                .then(function () {
                    if (autoSync) {
                        SynchronizationManager.on('exception', me.onSyncError, me, {single: true});
                        me.destroyLoadingIndicator();
                        if (me.backgroundSyncFn && Ext.isFunction(me.backgroundSyncFn)) {
                            me.backgroundSyncFn.apply(me, [me.initializeApp, me]);
                        } else {
                            me.doAutoBackgroundSync(me.initializeApp, me);
                        }
                    } else {
                        me.initializeApp();
                    }
                });
        },


        onSyncError: function () {
            this.initializeApp();
        },

        /**
         * Applies the proxy configuration to all Sqlite stores then calls the launchApplication function in the
         * Application.
         *
         * @private
         */
        initializeApp: function () {
            var me = this,
                launcher = me.getLaunch(),
                controllers = me.getControllerInstances(),
                name,
                controllerMessage = LocaleManager.getLocalizedString("The controller '{0}' doesn't have a launch method. Are you sure it extends from Ext.app.Controller?",
                    'Common.Application');

            me.setStoreAutoLoad();


            // Save the microloader data
            Common.util.AppCacheManager.writeAppCacheDataToFile(function () {
                Log.log('AppCacheData write to file completed', 'info', this, arguments);
            });

            me.modifyValidationMessages();

            // Un-register the sync error handler
            SynchronizationManager.un('exception', me.onSyncError);

            me.destroyLoadingIndicator();

            // Call the launcher function in app.js
            launcher.call(this);

            // Call the launch function in each of the application controllers.

            for (name in controllers) {
                // <debug warn>
                if (controllers[name] && !(controllers[name] instanceof Ext.app.Controller)) {
                    Ext.Logger.warn(Ext.String.format(controllerMessage, name));
                } else {
                    // </debug>
                    controllers[name].launch(this);
                    // <debug warn>
                }
                // </debug>
            }

            me.redirectTo(window.location.hash.substr(1));
        },

        doAutoBackgroundSync: function (onCompleted, scope) {
            // Check if any of the validating tables require syncing
            if (SynchronizationManager.isValidatingTableSyncRequired()) {
                Common.util.Network.isDeviceAndServerConnectedAsync(null, function (isConnected) {
                    if (isConnected) {
                        // SynchronizationManager.doAutoSync appName parameter has been removed in 21.3
                        SynchronizationManager.doAutoSync(onCompleted, scope);
                    } else {
                        Ext.callback(onCompleted, scope);
                    }
                });
            } else {
                Ext.callback(onCompleted, scope);
            }
        },

        setStoreAutoLoad: function () {
            var stores = this.getApplicationStores();

            Ext.each(stores, function (store) {
                if (store instanceof Common.store.sync.SqliteStore) {
                    // If the store uses a dynamic model retrieve the model definition here
                    if (store.getDynamicModel()) {
                        store.setDynamicModelDefinition();
                    }
                    store.setAutoLoad(store.getEnableAutoLoad());
                }
            });
        },

        registerDwrServiceScriptsIfConnected: function (onCompleted, scope) {
            var me = this;
            Common.util.Network.isDeviceAndServerConnectedAsync(null, function (isConnected) {
                if (isConnected) {
                    Common.scripts.ScriptManager.registerDwrServiceScripts(function () {
                        Ext.callback(onCompleted, scope || me, [true]);
                    }, me);
                } else {
                    Ext.callback(onCompleted, scope || me, [false]);
                }
            }, me);
        },

        /**
         * Loads the TableDef and Preferences stores. These stores are required
         * during application start up.
         */
        loadRequiredStores: function () {
            var me = this,
                storeIds = [
                    'appPreferencesStore',
                    'tableDefsStore',
                    'currenciesStore',
                    'schemaPreferencesStore',
                    'tableDownloadStore',
                    'userInfo'
                ];

            return Promise.all(storeIds.map(me.loadStore));
        },

        /**
         * Loads a store
         * @private
         * @param storeId
         * @returns {*}
         */
        loadStore: function (storeId) {
            var store = Ext.getStore(storeId);
            return new Promise(function (resolve, reject) {
                store.load(resolve);
            });
        },

        /**
         * Gets a list of the Application stores but does not include the common stores
         * @private
         * @returns {Array}
         */
        getApplicationStores: function () {
            var me = this,
                stores = me.getApplication().getStores(),
                applicationStores = [];

            Ext.each(stores, function (store) {
                var storeClassName = store.$className;
                if (!Ext.Array.contains(me.commonStores, storeClassName)) {
                    applicationStores.push(store);
                }
            }, me);

            return applicationStores;

        },

        getCommonApplicationValidatingStores: function () {
            var storeIds = [
                'appPreferencesStore',
                'currenciesStore',
                'schemaPreferencesStore',
                'userInfo',
                'usersStore'
            ];

            return storeIds.map(Ext.getStore);
        },

        isBrowserWebKit: function () {
            return true;

            /*
             var browserNotSupportedMessage = LocaleManager.getLocalizedString('The current browser is not supported.\n\nSupported browsers:\n' +
             'Google Chrome\n' +
             'Apple Safari\n' +
             'Mobile Safari (iOS)\n' +
             'Android Browser\n' +
             'BlackBerry Browser',
             Common.Application);

             if (!Ext.browser.is.WebKit) {
             alert(browserNotSupportedMessage);
             return false;
             } else {
             return true;
             }
             */
        },

        destroyLoadingIndicator: function () {
            var loadingIndicator = Ext.fly(this.APP_LOADING_INDICATOR);
            if (loadingIndicator) {
                loadingIndicator.destroy();
            }
        },

        /**
         * Order the stores by proxy type. Place all of the stores using the sqlite view proxy at
         * the end of the list.
         * @param appStores
         * @returns {Array}
         */
        orderStores: function (appStores) {
            var dataStores = [],
                sqliteStores = [];

            Ext.each(appStores, function (store) {
                var proxy = store.getProxy();
                if (proxy && proxy.isSqliteViewProxy) {
                    sqliteStores.push(store);
                } else {
                    dataStores.push(store);
                }
            });

            return dataStores.concat(sqliteStores);
        },

        modifyValidationMessages: function () {
            if (Ext.data.Validations) {
                Ext.data.Validations.setPresenceMessage(LocaleManager.getLocalizedString('This value must be present:', 'Common.Application'));
                Ext.data.Validations.setLengthMessage(LocaleManager.getLocalizedString('This value is the wrong length:', 'Common.Application'));
                Ext.data.Validations.setFormatMessage(LocaleManager.getLocalizedString('This value has the wrong format:', 'Common.Application'));
                Ext.data.Validations.setInclusionMessage(LocaleManager.getLocalizedString('This value is not included in the list of acceptable values:', 'Common.Application'));
                Ext.data.Validations.setExclusionMessage(LocaleManager.getLocalizedString('This value is not an acceptable value:', 'Common.Application'));
                Ext.data.Validations.setEmailMessage(LocaleManager.getLocalizedString('This value is not a valid email:', 'Common.Application'));
            }
        }


    },
    function () {
        // Resolve issue where Ext.Msg.alert() does not close
        // https://www.sencha.com/forum/showthread.php?284450-MessageBox-cannot-be-closed-under-some-circumstances.&p=1041143
        Ext.override(Ext.MessageBox, {
            hide: function () {
                if (this.activeAnimation && this.activeAnimation._onEnd) {
                    this.activeAnimation._onEnd();
                }
                return this.callParent(arguments);
            },

            applyMessage: function (config) {
                config = {
                    html: config,
                    cls: this.getBaseCls() + '-text',
                    style: Ext.os.is.WindowsPhone ? 'width:19em' : ''  // Add a fixed width to force the text to wrap on Windows
                };

                return Ext.factory(config, Ext.Component, this._message);
            }
        });

        // KB 3043893
        // Force a redraw for all Android browsers when the mask is hidden
        Ext.override(Ext.Mask, {
            onHide: function () {
                var firstChild;
                Ext.util.InputBlocker.unblockInputs();
                // Oh how I loves the Android
                if (Ext.browser.is.AndroidStock4) {
                    firstChild = this.element.getFirstChild();
                    if (firstChild) {
                        firstChild.redraw();
                    }
                }
            }
        });
    }
)
;
