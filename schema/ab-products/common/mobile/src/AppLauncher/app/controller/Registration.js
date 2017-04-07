/**
 * Provides controller part of MVC functionality related to RegistrationPanel:
 *  - handles events;
 *  - prepares data to be shown in the panel, processes entered data;
 *  - shows RegistrationPanel.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('AppLauncher.controller.Registration', {
    extend: 'Common.controller.Registration',

    requires: [
        'AppLauncher.ui.Script',
        'AppLauncher.ui.IconData'
    ],

    config: {
        refs: {
            registrationView: 'registration',
            preferencesView: 'preferencesPanel',
            userSettingsView: 'usersettings',
            appList: 'appList'
        },
        control: {
            appList: {
                itemtap: 'launchSelectedApplication'
            },
            'button[action=logout]': {
                tap: 'onLogout'
            },
            'registration': {
                register: 'onRegisterDevice'
            },
            'button[action=guestSignOn]': {
                tap: 'onGuestSignOn'
            },
            'button[action=registerDevice]': {
                tap: 'displayRegistrationView'
            }
        }
    },

    /**
     * Application entry point
     * Displays the registration form if the device is not registered
     */
    launch: function () {
        // Hide the Phonegap splashscreen
        if (navigator.splashscreen) {
            navigator.splashscreen.hide();
        }
        Common.controller.EventBus.on('devicenotregistered', this.onDeviceNotRegistered, this);
        // Fix for Android orientation change bug http://www.sencha.com/forum/showthread.php?272988
        Ext.Viewport.bodyElement.on('resize', Ext.emptyFn, this, {buffer: 1});
        Ext.Viewport.on('orientationchange', 'onOrientationChange', this, {buffer: 50});

        this.onLaunch();

    },


    onLaunch: function () {
        var me = this,
            returnedFromApp = me.getAppLaunchedKey();

        if (ConfigFileManager.isDeviceRegistered) {
            if (returnedFromApp) {
                me.displayAppSelectionView();
            } else {
                me.refreshEnabledApplications()
                    .then(function () {
                        return me.displayAppSelectionView();
                    })
                    .done();
            }
        } else {
            me.displayAppSelectionView();
            // Device is not registered
            AppLauncher.ui.Script.isInSsoMode()
                .then(function (isSso) {
                    if (isSso) {
                        me.registerDevice(me.getDeviceId(), null, null);
                    } else {
                        me.displayRegistrationView();
                    }
                });
        }
    },

    onOrientationChange: function (viewport) {
        var me = this,
            preferencesView = me.getPreferencesView(),
            activeItem = viewport.getActiveItem(),
            preferencesViewIsHidden = true;

        if (preferencesView) {
            preferencesViewIsHidden = preferencesView.getHidden();
        }

        if (activeItem && activeItem.xtype === 'appSelectionPanel' && preferencesViewIsHidden) {
            if (AppLauncher.ui.IconView.isRedrawRequired()) {
                me.displayAppSelectionView();
            }
        }
    },


    /**
     * Retrieves the Web Central version, Mobile Client version, and Mobile App build information.
     * @returns {Promise} A Promise object resolved when the operation is completed.
     */
    retrieveAndSaveAppVersionInfo: function () {
        return Common.util.VersionInfo.getWebCentralVersion()
            .then(function (webCentralVersion) {
                // Save the version info
                localStorage.setItem('Ab.WebCentralVersion', webCentralVersion);
                return Common.util.VersionInfo.getMobileClientVersion();
            })
            .then(function (mobileClientVersion) {
                localStorage.setItem('Ab.MobileClientVersion', mobileClientVersion);
            })
            .then(function () {
                return Common.util.VersionInfo.getApplicationBuildInfo();
            });
    },


    displayAppSelectionView: function () {
        var me = this,
            returnFromApp = me.getAppLaunchedKey();

        return me.loadApplicationsStore()
            .then(function (records) {
                var preferencesView = me.getPreferencesView(),
                    registrationView = me.getRegistrationView();
                if (records && records.length === 1 && !returnFromApp) {
                    me.launchSelectedApplication(null, null, null, records[0]);
                } else {
                    // Destroy the view if it exists. This forces the icons to be regenerated
                    if (me.applicationSelectionView) {
                        me.applicationSelectionView.destroy();
                    }
                    me.applicationSelectionView = Ext.create('AppLauncher.view.AppContainer');
                    Ext.Viewport.add(me.applicationSelectionView);
                    me.resetAppLaunchedKey();
                    if(preferencesView) {
                        preferencesView.hide();
                    }
                    if(registrationView) {
                        registrationView.hide();
                    }
                    me.applicationSelectionView.show();
                }
                return Promise.resolve();
            });

    },

    getAppLaunchedKey: function () {
        return (localStorage.getItem('Ab.AppLauncher') === 'true');
    },

    resetAppLaunchedKey: function () {
        localStorage.setItem('Ab.AppLauncher', false);
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
                return Common.util.VersionInfo.retrieveAndSaveAppVersionInfo();
            })
            .then(function () {
                // Destroy the Registration view
                if (me.registrationView ) {
                    me.registrationView .hide();
                }
                return Common.service.Session.end();
            })
            .then(function () {
                me.displayAppSelectionView();
                AppLauncher.app.fireEvent('userregistered');
                return Promise.resolve();
            });

    },

    launchSelectedApplication: function (dataView, index, target, record) {
        // Load the application using an absolute URL
        var me = this,
            applicationUrl,
            browserMode = Common.util.Environment.getBrowserMode(),
            isAppCached = false,
            pageIsNotAvailableTitle = LocaleManager.getLocalizedString('App', 'AppLauncher.controller.Registration'),
            pageIsNotAvailableMessage = LocaleManager.getLocalizedString('The requested application is not available. The network connection is not available or the app has not been cached.',
                'AppLauncher.controller.Registration'),
            application,
            urlParameters;

        application = record.get('url');

        // <debug>
        // Handle the debug case
        if (Ext.os.deviceType === 'Desktop' || browserMode) {
            me.setBrowserModeUrl(application);
            return;
        }
        // </debug>

        // If we are running on a device we need to get the URL configuration from the config file.
        applicationUrl = ConfigFileManager.url + '/' + application + '/index.html';

        // <debug>
        // If the url has a deviceType parameter we are running in demo mode with a device type specified
        urlParameters = window.document.location.search;
        if (urlParameters.indexOf('?deviceType') !== -1) {
            me.setBrowserModeUrl(application);
            return;
        }
        // </debug>

        Mask.displayLoadingMask();
        Network.isDeviceAndServerConnectedAsync(applicationUrl, function (isConnected) {
            if (isConnected) {
                me.setApplicationCacheFlag(application, true, function () {
                    window.document.location = applicationUrl;
                }, me);
            } else {
                isAppCached = me.getApplicationCacheFlag(application);
                if (isAppCached) {
                    window.document.location = applicationUrl;
                } else {
                    Mask.hideLoadingMask();
                    Ext.Msg.alert(pageIsNotAvailableTitle, pageIsNotAvailableMessage);
                }
            }
        }, me);
    },

    // <debug>
    setBrowserModeUrl: function (application) {
        var currentUrl = window.location.href,
            targetUrl;

        // Replace AppLauncher with the new application name
        targetUrl = currentUrl.replace(/AppLauncher/g, application);
        window.document.location = targetUrl;
    },
    // </debug>

    onLogout: function () {
        var me = this,
            userSettingsView = me.getUserSettingsView(),
            preferencesPanel = me.getPreferencesView(),
            userName = userSettingsView.down('textfield[name=user_name]').getValue(),
            registerDeviceText = LocaleManager.getLocalizedString('Log Out', 'AppLauncher.controller.Registration'),
            registerUserMessage = me.getRegisterUserMessage() + '<div style="text-align:center">' + me.getDoYouWishToContinueMessage() + '</div>';

        // Check if there is a network connection before registering user.

        Mask.displayLoadingMask();
        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                Mask.hideLoadingMask();
                if (isConnected) {
                    // Warn user that data may be lost
                    Ext.Msg.confirm(registerDeviceText, Ext.String.format(registerUserMessage, userName), function (response) {
                        if (response === 'yes') {
                            Mask.displayLoadingMask();
                            MobileSecurityServiceAdapter.isDeviceRegistered(ConfigFileManager.deviceId)
                                .then(function (isRegistered) {
                                    var errorMsg;
                                    if (isRegistered) {
                                        Common.service.Session.start()
                                            .then(function () {
                                                // Do not clear the Guest User registration on the server.
                                                if(ConfigFileManager.username === me.getGuestUserAccount()) {
                                                    return Promise.resolve();
                                                } else {
                                                    return MobileSecurityServiceAdapter.unRegisterDevice(ConfigFileManager.username, ConfigFileManager.deviceId);
                                                }
                                            })
                                            .then(function () {
                                                return Common.service.Session.end();
                                            })
                                            .then(function () {
                                                me.clearLocalStorageKeys();
                                                if (preferencesPanel) {
                                                    preferencesPanel.hide();
                                                }
                                                return me.clearRegisteredUser();
                                            })
                                            .then(function() {
                                                return me.deleteUserInfo();
                                            })
                                            .then(function () {
                                                Mask.hideLoadingMask();
                                                // Open the Registration view if there are no errors
                                                me.onLaunch();
                                            })
                                            .then(null, function (error) {
                                                Mask.hideLoadingMask();
                                                AppLauncher.app.fireEvent('userunregistered');
                                                Ext.Msg.alert(LocalizedStrings.z_Error, error);
                                                Common.service.Session.end(); // Clean up the Session if there is an error
                                            }).done();
                                    } else {
                                        Mask.hideLoadingMask();
                                        AppLauncher.app.fireEvent('userunregistered');
                                        errorMsg = Ext.String.format(me.getUnRegisterErrorMessage(), 'Device is not registered.');
                                        Ext.Msg.alert(LocalizedStrings.z_Error, errorMsg);
                                        // Toggle buttons on the user settings form.
                                        if (userSettingsView) {
                                            userSettingsView.setButtonState(false);
                                        }
                                    }
                                });
                        }
                    }, me);
                }
            });
    },

    /**
     * Sets the ConfigFileManager.isRegistered flag to false. Launches the App list view.
     */
    onDeviceNotRegistered: function () {
        var me = this;
        Common.util.Registration.isInSsoMode()
            .then(function (ssoMode) {
                if (!ssoMode) {
                    // Display the registration view
                    ConfigFileManager.isDeviceRegistered = false;
                    ConfigFileManager.sync(function () {
                        me.onLaunch();
                    });
                }

            }, function () {
                Log.log('Device is in SSO mode. Device is not registered.', 'error');
            });

    },
    
    deleteUserInfo: function() {
        var userInfoStore = Ext.getStore('userInfo');
        if(Common.env.Feature.isNative) {
            return Promise.resolve();
        } else {
            return userInfoStore.deleteUserInfo();
        }
    }

});