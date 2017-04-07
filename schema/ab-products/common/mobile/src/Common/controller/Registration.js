/**
 * Registration controller that manages the Registration view for all apps.
 * @since 23.1
 * @author Jeff Martin
 */
Ext.define('Common.controller.Registration', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.service.Session',
        'Common.service.MobileSyncServiceAdapter',
        'Common.service.MobileSecurityServiceAdapter',
        'Common.util.Device',
        'Common.util.VersionInfo',
        'Common.util.Database',
        'Common.util.Mask',
        'Common.service.ExceptionTranslator',
        'Common.util.Environment',
        'Common.env.Feature',
        'Common.model.Registration',
        'Common.util.Registration',
        'Common.view.registration.Registration',
        'Common.util.UserProfile'
    ],


    config: {
        refs: {
            registrationView: 'registration'
        },
        control: {
            'registration': {
                register: 'onRegisterDevice'
            },
            'button[action=guestSignOn]': {
                tap: 'onGuestSignOn'
            },
            'button[action=closeRegistrationView]': {
                tap: 'onCloseRegistrationView'
            }
        },

        guestUserAccount: 'GUEST-MOBILE',

        registrationFailedMessage: LocaleManager.getLocalizedString('Registration Failed', 'Common.controller.Registration'),
        registrationFailedMessageTitle: LocaleManager.getLocalizedString('Registration', 'Common.controller.Registration'),
        doYouWishToContinueMessage: LocaleManager.getLocalizedString('Do you want to continue?', 'Common.controller.Registration'),
        registerUserMessage: LocaleManager.getLocalizedString('Logging out does not remove your application data.<br>You will need to re-register the device to access the apps.',
            'Common.controller.Registration'),

        registrationServiceNotAvailableMessage: LocaleManager.getLocalizedString('The device registration service is not available. The Mobile services may not be enabled in the Web Central.',
            'Common.controller.Registration'),

        unRegisterErrorMessage: LocaleManager.getLocalizedString('Error occured Un-Registering the device. <br>{0}', 'Common.controller.Registration')
    },

    /**
     * Application entry point
     * Displays the registration form if the device is not registered
     */
    init: function () {
        Common.controller.EventBus.on('devicenotregistered', this.onDeviceNotRegistered, this);
    },

    /**
     * Retrieves a list of applications the user is authorized to access. The applicaton
     * list is saved in the device database.
     * @returns {Promise} A Promise object that is resolved when the operation completes.
     */
    refreshEnabledApplications: function () {
        var me = this;

        return Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    return Common.service.Session.start()
                        .then(function () {
                            return MobileSyncServiceAdapter.getEnabledApplications();
                        })
                        .then(function (enabledApplications) {
                            return me.saveEnabledApplications(enabledApplications);
                        })
                        .then(function () {
                            return Common.util.VersionInfo.retrieveAndSaveAppVersionInfo();
                        })
                        .then(function () {
                            return Common.service.Session.end();
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Common.service.Session.end();  // Always resolves
                        });
                } else {
                    // No network connection
                    return Promise.resolve();
                }
            });
    },

    displayRegistrationView: function () {
        var me = this;

        if (Ext.os.is.Android) {
            me.displayAndroidRegistrationView('');
        } else {
            if (!me.registrationView) {
                me.registrationView = Ext.create('Common.view.registration.Registration');
                Ext.Viewport.add(me.registrationView);
            }
            me.registrationView.setRecord(new Common.model.Registration());
            me.registrationView.show();
        }
    },

    displayAndroidRegistrationView: function (errorMessage) {
        var me = this;

        me.hideOpenMessageBoxes();
        Registration.displayRegistrationView(errorMessage, function (credentials) {
            var action = credentials.action,
                userName = credentials.username,
                password = credentials.password;

            if(action === 'register') {
                me.doRegisterDevice(userName, password);
            } else {
                Common.controller.EventBus.fireRegistratoinViewClosed();
            }
        }, function (error) {
            Ext.Msg.alert('', error);
        });
    },

    hideOpenMessageBoxes: function() {
        var sheets = Ext.ComponentQuery.query('sheet');

        Ext.each(sheets, function(sheet) {
            var zIndex = sheet.getZIndex(),
                baseCls = sheet.getBaseCls(),
                isHidden = !!sheet.getHidden();

            if(zIndex === 999 && baseCls === 'x-msgbox' && !isHidden) {
                sheet.hide();
            }
        });
    },

    loadApplicationsStore: function () {
        // Do not load the store if the user is not registered
        if(Ext.isEmpty(ConfigFileManager.username)) {
            return Promise.resolve();
        } else {
            return new Promise(function (resolve) {
                Ext.getStore('apps').load(resolve);
            });
        }
    },

    /**
     * Validates the username and password fields. Registers the device if the Web Central server is online
     * @param {Common.form.FormPanel} formPanel The Registration form.
     */
    onRegisterDevice: function (formPanel) {
        // Get username, password from the form;
        var me = this,
            formData = formPanel.getRecord(),
            username,
            password;

        if (formData.isValid()) {
            username = formData.get('username');
            password = formData.get('password');
            me.doRegisterDevice(username, password);
        } else {
            formPanel.displayErrors(formData);
        }
    },

    /**
     *
     * @private
     * @param {String} userName of the user registering the device.
     * @param {String} password of the user registering the device.
     */
    doRegisterDevice: function (userName, password) {
        var me = this,
            deviceId = me.getDeviceId(),
            registerDeviceMessage = LocaleManager.getLocalizedString('Register Device', 'AppLauncher.controller.Registration');

        var onFinish = function () {
            Mask.hideLoadingMask();
        };

        Mask.displayLoadingMask(registerDeviceMessage);
        Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    return me.deleteDesktopUserFiles()
                        .then(function () {
                            return Common.util.Registration.deleteDataFromDatabase();
                        })
                        .then(function () {
                            me.clearLocalStorageKeys();
                            return me.registerDevice(deviceId, userName, password);
                        })
                        .then(null, function (error) {
                            // Display the native Android registration view if there is an error.
                            if (Ext.os.is.Android) {
                                me.displayAndroidRegistrationView(error);
                            } else {
                                Ext.Msg.alert('', error);
                            }
                            return Common.service.Session.end();  // Close the session if there was an error
                        })
                        .done(onFinish, onFinish);
                } else {
                    if (Ext.os.is.Android) {
                        me.displayAndroidRegistrationView(Network.NETWORK_CONNECTION_UNAVAILABLE);
                    } else {
                        Network.displayConnectionMessage();
                    }
                    onFinish();
                }
            }, function(error) {
                if (Ext.os.is.Android) {
                    me.displayAndroidRegistrationView(error);
                }
                onFinish();
            });
    },

    /**
     * Returns the device id stored in the Configuration file when in native mode. Generates a random
     * device id when in Browser mode. Upates the configuration file if the device id is dynamically generated.
     * The device id is obtained from device when the app is in native mode and is written to the Configuration
     * file by the Mobile Client. The device id is retrieved from the Configuration file and sent to the
     * Web Central server when the user registers.
     * @returns {String}
     */
    getDeviceId: function () {
        var deviceId = ConfigFileManager.deviceId;

        // If we are not in native mode we need to generate a device id
        if (!Common.env.Feature.isNative) {
            deviceId = Device.generateDeviceId();
            // Save for use in the Session object
            ConfigFileManager.deviceId = deviceId;
        }

        return deviceId;
    },

    /**
     * Saves the users application info to the database The store is loaded with the existing application list.
     * The list is then replaced with the new application list that was downloaded from the server.
     *
     * @param {Object[]} enabledApplications List of user applications retrieved from the server
     * @returns {Promise} A Promise object that is resolved when the save operation is completed.
     */

    saveEnabledApplications: function (enabledApplications) {
        var me = this,
            appsStore = Ext.getStore('apps');

        // Force the apps table to be created when the store is loaded.
        appsStore.getProxy().setIsSchemaCurrent(false);

        return SyncManager.loadStore('apps')
            .then(function () {
                return me.removeAndSaveNewApplicationRecords(enabledApplications);
            });
    },

    /**
     * @private
     * @param enabledApplications
     * @returns {Promise}
     */
    removeAndSaveNewApplicationRecords: function (enabledApplications) {
        var me = this,
            store = Ext.getStore('apps'),
            enabledApplicationRecords = me.convertEnabledApplicationsToRecords(enabledApplications);

        return new Promise(function (resolve, reject) {
            store.removeAll();
            store.add(enabledApplicationRecords);
            store.sync(resolve, reject);
        });
    },


    /**
     * Registers device with specified deviceId for the ARCHIBUS user with specified username and password.
     *
     * @param {String} deviceId The ID of the device to be registered.
     * @param {String} username ARCHIBUS username for whom the device will be registered.
     * @param {String} password The password of the ARCHIBUS user for whom the device will be registered.
     * @return {Promise}
     */

    registerDevice: function (deviceId, username, password) {
        var me = this;
        return MobileSecurityServiceAdapter.registerDevice(deviceId, username, password, ConfigFileManager.localeName)
            .then(function () {
                // Set ConfigFileManager.isRegistered to true to maintain compatabilty with older Web Central versions.
                ConfigFileManager.isRegistered = true;
                ConfigFileManager.isDeviceRegistered = true;
                ConfigFileManager.username = username;
                ConfigFileManager.setUserDatabase();
                return Common.service.Session.start();
            })
            .then(function () {
                return me.retrieveSqlitePassphraseAndWriteToKeychain();
            })
            .then(function () {
                return SyncManager.downloadValidatingTable('userInfo');
            })
            .then(function () {
                return SyncManager.loadStore('userInfo');
            })
            .then(function () {
                var userProfile = Common.util.UserProfile.getUserProfile();
                me.savePreferences(true, userProfile.user_name, deviceId, userProfile.em_id);
            })
            .then(function () {
                var deviceName = device && device.name ? device.name : 'Unavailable';
                return MobileSecurityServiceAdapter.recordDeviceRegistration(ConfigFileManager.username, ConfigFileManager.deviceId, deviceName);
            })
            .then(function () {
                return MobileSyncServiceAdapter.getEnabledApplications();
            })
            .then(function (enabledApplications) {
                return me.saveEnabledApplications(enabledApplications);
            })
            .then(function () {
                // Destroy the Registration view
                var registrationView = me.getRegistrationView();
                if (registrationView) {
                    registrationView.hide();
                    registrationView.destroy();
                    me.registrationView = null;
                }
                return Common.service.Session.end();
            })
            .then(function () {
                document.location.reload();
                return Promise.resolve();
            });

    },

    /**
     * Retrieves the Sqlite passphrase from the mobileservices.properties file. Writes the passphrase to the
     * device keychain
     * @returns {Promise} A Promise object that is resolved when the operation is completed.
     */
    retrieveSqlitePassphraseAndWriteToKeychain: function () {
        var me = this,
            isWindowsPhone = !!Ext.os.is.WindowsPhone;

        if (Common.env.Feature.isNative && !isWindowsPhone) {
            return MobileSecurityServiceAdapter.getSqlitePassphrase().then(function (passPhrase) {
                return me.writePassphraseToKeychain(passPhrase);
            });
        } else {
            return Promise.resolve();
        }
    },

    writePassphraseToKeychain: function (passPhrase) {
        return new Promise(function (resolve, reject) {
            Keychain.setSqlitePassphrase(passPhrase, resolve, reject);
        });
    },

    /**
     * Saves the user preferences to the Configuration storage
     * @param {Boolean} isRegistered true if the device is registered, false otherwise
     * @param {String} username The user name of the device user
     * @param {String} deviceId The device id
     * @returns {Promise}
     */
    savePreferences: function (isRegistered, username, deviceId, employeeId) {

        ConfigFileManager.isRegistered = isRegistered;
        ConfigFileManager.isDeviceRegistered = isRegistered;
        ConfigFileManager.username = username;
        ConfigFileManager.deviceId = deviceId;
        ConfigFileManager.employeeId = employeeId;

        return new Promise(function (resolve, reject) {
            ConfigFileManager.sync(resolve, reject);
        });
    },

    /**
     * Converts the enabled application records returned from the server to an array of application model
     * objects.
     *
     * Note: The icon data is not written to the App table. The iconData field is provided in the
     * model definition to support downloading the icon from the afm_mobile_apps table in the future.
     * @param {Object[]} enabledApplications Enabled applications for the mobile user
     * @returns {Ext.data.Model[]} An array of application models
     */
    convertEnabledApplicationsToRecords: function (enabledApplications) {
        var me = this,
            applicationRecords = [];

        Ext.each(enabledApplications, function (application) {
            var applicationId,
                appModel;

            // Get the application id from the url. We only need the root of the url
            // For example: WorkRequest instead of ../WorkRequest/index.html.
            applicationId = application.url.replace(/\/index.html/g, '').replace(/..\//g, '');
            appModel = new Common.model.App();
            appModel.set('title', application.title);
            appModel.set('url', applicationId);
            appModel.set('isCached', false);
            applicationRecords.push(appModel);
        }, me);

        return applicationRecords;
    },

    /**
     * Clears the username, employee id and set the isRegistered value for the
     * user to false.
     * @private
     * @returns {Promise}
     */
    clearRegisteredUser: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            // Set isRegistered to false
            // Set userName to empty
            ConfigFileManager.username = '';
            ConfigFileManager.isDeviceRegistered = false;
            ConfigFileManager.employeeId = '';
            ConfigFileManager.sync(resolve, reject, me);
        });
    },

    /**
     * Removes all ARCHIBUS mobile keys from localStorage. ARCHIBUS mobile keys start with prefix Ab.
     */
    clearLocalStorageKeys: function () {
        var abMobileKeys = [],
            re = /^Ab\./,
            item;

        for (item in localStorage) {
            if (re.test(item)) {
                abMobileKeys.push(item);
            }
        }

        // Remove the keys if they exist
        Ext.each(abMobileKeys, function (key) {
            localStorage.removeItem(key);
        });
    },

    /**
     * Uses the device id defined in the device-api file. Uses the GUEST-MOBILE account.
     * Only available in browser mode
     */
    onGuestSignOn: function () {
        var me = this,
            username = me.getGuestUserAccount();

        me.deleteDesktopUserFiles()
            .then(function () {
                return Common.util.Registration.deleteDataFromDatabase();
            })
            .then(function () {
                ConfigFileManager.deviceId = device.uuid;
                ConfigFileManager.isRegistered = true;
                ConfigFileManager.isDeviceRegistered = true;
                return Common.service.Session.start();
            })
            .then(function () {
                me.clearLocalStorageKeys();
                return SyncManager.downloadValidatingTable('userInfo');
            })
            .then(function () {
                return SyncManager.loadStore('userInfo');
            })
            .then(function () {
                return MobileSyncServiceAdapter.getEnabledApplications();
            })
            .then(function (enabledApplications) {
                return me.saveEnabledApplications(enabledApplications);
            })
            .then(function () {
                return Common.service.Session.end();
            })
            .then(function () {
                var userProfile = Common.util.UserProfile.getUserProfile();
                return me.savePreferences(true, username, device.uuid, userProfile.em_id);
            })
            .then(function () {
                me.displayAppSelectionView();
                return Promise.resolve();
            })
            .then(null, function (error) {
                Ext.Msg.alert('', error);
                return Common.service.Session.end();  // Clean up session case of error.
            })
            .done();

    },

    /**
     * Sets the isCached flag in the appsClient store the first time the app is loaded
     * @private
     * @param {String} application The name of the application
     * @param {Boolean} value The value of the isCached flag
     * @param {Function} onCompleted callback function executed when the save operation is completed
     * @param {Object} scope The scope to execute the callback in.
     */
    setApplicationCacheFlag: function (application, value, onCompleted, scope) {
        var me = this,
            appStore = Ext.getStore('apps'),
            appRecord = appStore.findRecord('url', application);

        if (appRecord) {
            appStore.suspendEvents();
            appRecord.set('isCached', value);
            appStore.sync(function () {
                appStore.resumeEvents(true);
                Ext.callback(onCompleted, scope || me);
            }, function () {
                Ext.callback(onCompleted, scope || me);
            });
        } else {
            Ext.callback(onCompleted, scope || me);
        }
    },

    /**
     * Returns the value of the isCached flag for the application
     * @param {String} application The name of the application
     * @returns {Boolean} The value of the isCached flag
     */
    getApplicationCacheFlag: function (application) {
        var appStore = Ext.getStore('apps'),
            appRecord = appStore.findRecord('url', application),
            isCached = false;

        if (appRecord) {
            isCached = appRecord.get('isCached');
        }

        return isCached;
    },

    /**
     * Deletes the users downloaded files and documents if the app is running on the desktop.
     * Does nothing when the app is running on a device.
     * @returns {Promise}
     */
    deleteDesktopUserFiles: function () {
        if (Common.env.Feature.isNative) {
            return Promise.resolve();
        } else {
            return Common.util.Registration.deleteUserFiles();
        }
    },

    /**
     * Sets the ConfigFileManager.isRegistered flag to false. Displays the Registration view if the
     * device is not using an SSO connection. Does nothing if an SSO connection is detected.
     */
    onDeviceNotRegistered: function () {
        var me = this;
        Common.util.Registration.isInSsoMode()
            .then(function (ssoMode) {
                if (!ssoMode) {
                    // Display the registration view
                    ConfigFileManager.isDeviceRegistered = false;
                    ConfigFileManager.sync(function () {
                        me.displayRegistrationView();
                    });
                }

            }, function () {
                Log.log('Device is in SSO mode. Device is not registered.', 'error');
            });
    },

    onCloseRegistrationView: function() {
        var me = this,
            view = me.getRegistrationView();

        if (view) {
            view.hide();
            view.destroy();
            me.registrationView = null;
        }
        
        Common.controller.EventBus.fireRegistratoinViewClosed();
    }

});
