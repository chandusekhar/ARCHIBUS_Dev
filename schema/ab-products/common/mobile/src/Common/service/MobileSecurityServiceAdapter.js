/**
 * Encapsulates details of MobileSecurityService, SecurityService, SmartClientConfigService, AdminService calls.
 * Translates service exceptions using ExceptionTranslator.
 *
 * Includes the Promise API for the DWR security API
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 */
Ext.define('Common.service.MobileSecurityServiceAdapter', {
    singleton: true,
    alternateClassName: ['MobileSecurityServiceAdapter'],

    requires: [
        'Common.service.ExceptionTranslator',
        'Common.security.Security',
        'Common.controller.EventBus'
    ],

    mixins: ['Common.service.MobileServiceErrorHandler'],

    options: {
        async: true,
        headers: {"cache-control": "no-cache"},
        callback: Ext.emptyFn,
        errorHandler: Ext.emptyFn
    },

    /**
     * @property {Boolean} throwExceptionOnError controls if an exception is thrown when an error occurs
     * in the service. Setting the value to true allows the calling routine to handle the error.
     */
    throwExceptionOnError: true,

    resultObject: {
        success: false,
        exception: null,
        parameter: null
    },

    /**
     * *********************** Promise API Methods ***************************
     * The methods in this section return Promise objects and are used to
     * simply using asynchronous calls
     *
     */

    startSession: function (deviceId, localeName) {
        var me = this;
        return me.isSsoMode()
            .then(function (isSsoMode) {
                if (isSsoMode) {
                    return me.startSsoSession();
                } else {
                    return me.startSessionForDeviceId(deviceId, false);
                }
            })
            .then(function () {
                return me.setLocaleForSession(localeName);
            });
    },

    startSessionForDeviceId: function (deviceId, isRegistrationCheck) {
        var me = this,
            resolveFunc,
            rejectFunc,
            errorHandler = function (message, exception) {
                // Check for Device Not Registered error
                if (exception && exception.errorNumber === 23) {
                    Common.controller.EventBus.fireDeviceNotRegistered();
                }
                me.errorHandlerFunction(rejectFunc, message, exception);
            },
            registrationCheckErrorHandler = function (message, exception) {
                rejectFunc(exception);
            };

        var p = new Promise(function (resolve, reject) {
            resolveFunc = resolve;
            rejectFunc = reject;
        });

        var startSession = function () {
            var deviceIdEncrypted = Common.security.Security.encryptString(deviceId),
                options = Ext.clone(me.options);
            options.callback = resolveFunc;
            options.errorHandler = isRegistrationCheck ? registrationCheckErrorHandler : errorHandler;

            MobileSecurityService.startMobileUserSessionForDeviceId(deviceIdEncrypted, options);
        };

        startSession();

        return p;
    },

    startSsoSession: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var options = Ext.clone(me.options);

            options.callback = resolve;
            options.errorHandler = me.errorHandlerFunction.bind(me, reject);

            MobileSecurityService.startMobileSsoUserSession(options);
        });
    },

    /**
     * Ends the Session.
     * Does not report an error. Calling SecurityService.endMobileUserSession on an already closed session
     * is a NO-OP.
     * @returns {Promise} A Promise that is always resolved.
     */
    endSession: function () {
        var me = this;
        return new Promise(function (resolve) {
            var options = Ext.clone(me.options);
            options.callback = resolve;
            options.errorHandler = function (message, exception) {
                var errorMessage = Common.service.ExceptionTranslator.extractMessage(exception);
                Log.log(errorMessage, 'warn', me, arguments);
                // Do not report errors when logging out.
                resolve();
            };

            SecurityService.endMobileUserSession(options);
        });
    },

    /**
     * Sets the Session locale
     * @param {String} localeName The Java locale name
     * @returns {Promise}
     */
    setLocaleForSession: function (localeName) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var options = Ext.clone(me.options);
            options.callback = resolve;
            options.errorHandler = me.errorHandlerFunction.bind(me, reject);

            SecurityService.setLocaleFromJavaLocale(localeName, options);
        });
    },

    /**
     * Detects if the connection is using SSO mode
     * @returns {Promise} A Promise that resolves to true is the connection is using SSO. The Promise
     * resolves to false for non SSO connections.
     */
    isSsoMode: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            // Determine if WebCentral is in SSO mode:
            var options = Ext.clone(me.options);
            options.callback = function (ssoModeEncrypted) {
                var ssoModeDecrypted;
                if (ssoModeEncrypted.length > 0) {
                    ssoModeDecrypted = Common.security.Security.decryptString(ssoModeEncrypted);
                    if (ssoModeDecrypted.indexOf('preauth') !== -1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            };
            options.errorHandler = me.errorHandlerFunction.bind(me, reject);

            SmartClientConfigService.getSsoMode(options);
        });
    },


    /**
     * Checks if the device is registered by opening a Web Central session. If the session is started
     * successfully the device is registered. If there is an error starting the session the device
     * is not registered.
     * @param {String} deviceId of the device to check registration
     * @returns {Promise} a Promise object resolved to true if the device is registered, false otherwise.
     */
    isDeviceRegistered: function (deviceId) {
        var me = this;

        // The device cannot be registered if the device id is empty.
        if(Ext.isEmpty(deviceId)) {
            return Promise.resolve(false);
        } else {
            return me.isSsoMode()
                .then(function (isSsoMode) {
                    if (isSsoMode) {
                        return me.startSsoSession();
                    } else {
                        return me.startSessionForDeviceId(deviceId, true);
                    }
                })
                .then(function () {
                    return me.endSession();
                })
                .then(function () {
                    return Promise.resolve(true);
                }, function () {
                    return Promise.resolve(false);
                });
        }

    },


    /**
     * Checks if the user is a member of the supplied group.
     * @param {String} group The name of the user group to check membership in
     * @returns {Promise} A Promise that resolves to true if the user is a member of the group
     */
    isUserMemberOfGroup: function (group) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var options = Ext.clone(me.options);
            options.callback = resolve;
            options.errorHandler = me.errorHandlerFunction.bind(me, reject);

            AdminService.isUserMemberOfGroup(group, options);
        });
    },

    /**
     * Registers device with specified deviceId for ARCHIBUS user with specified username and password.
     *
     * @param {String} deviceId ID of the device to be registered.
     * @param {String} userName ARCHIBUS username for whom the device will be registered.
     * @param {String} password password of the ARCHIBUS user for whom the device will be registered.
     * @param {String} localeName Java locale name, for example "en_US". Used to translate exceptions.
     * @returns {Promise} A Promise object resolved when the registration action is completed.
     * */
    registerDevice: function (deviceId, userName, password, localeName) {
        var me = this;

        return new Promise(function (resolve, reject) {
            var deviceIdEncrypted = Common.security.Security.encryptString(deviceId),
                usernameEncrypted = Common.security.Security.encryptString(userName),
                passwordEncrypted = Common.security.Security.encryptString(password),
                logMessage = 'Calling MobileSecurityService.registerDevice: deviceId=[{0}], username=[{1}], password=[{2}], localeName=[{3}]',
                options = {
                    async: true,
                    headers: {"cache-control": "no-cache"},
                    callback: resolve,
                    errorHandler: me.errorHandlerFunction.bind(me, reject)
                };
            Log.log(Ext.String.format(logMessage, deviceId, userName, password, localeName), 'info');
            MobileSecurityService.registerDevice(deviceIdEncrypted, usernameEncrypted, passwordEncrypted, localeName, options);
        });
    },

    /**
     * Unregisters the device in Web Central. Sets the afm_users.mob_device_id value to null
     * for the user.
     * Records the unregistration event in the afm_mob_dev_reg table.
     * @param {String} userName The name of the user for whom to unregister the device.
     * @returns {Promise} A resolved Promise if the operation is successful. A rejected Promise
     * containing the error information if the operation fails.
     */
    unRegisterDevice: function (userName) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var usernameEncrypted = Common.security.Security.encryptString(userName),
                deviceIdEncrypted = Common.security.Security.encryptString(ConfigFileManager.deviceId),
                logMessage = 'Calling MobileSecurityService.unRegisterDevice: username=[{0}]',
                options = {
                    async: true,
                    headers: {"cache-control": "no-cache"},
                    callback: resolve,
                    errorHandler: me.errorHandlerFunction.bind(me, reject)
                };
            Log.log(Ext.String.format(logMessage, userName), 'info');
            MobileSecurityService.unRegisterDevice(usernameEncrypted, deviceIdEncrypted, options);
        });
    },

    /**
     * Records the registration event in the Web Central afm_mob_dev_reg table.
     * @param {String} userName of the user registering the device
     * @param {String} deviceId of the device being registered.
     * @param {String} deviceName the user defined name of the device. Not supported on all mobile platforms.
     * @returns {Promise} A resolved promise if the operation succeeds, otherwise a rejected promise containing
     * the error information.
     */
    recordDeviceRegistration: function (userName, deviceId, deviceName) {
        var me = this;
        return new Promise(function (resolve, reject) {
            var usernameEncrypted = Common.security.Security.encryptString(userName),
                deviceIdEncrypted = Common.security.Security.encryptString(deviceId),
                logMessage = 'Calling MobileSecurityService.recordDeviceRegistration',
                options = {
                    async: true,
                    headers: {"cache-control": "no-cache"},
                    callback: resolve,
                    errorHandler: me.errorHandlerFunction.bind(me, reject)
                };
            Log.log(logMessage, 'info');
            MobileSecurityService.recordDeviceRegistration(usernameEncrypted, deviceIdEncrypted, deviceName, options);
        });
    },

    /**
     * Retrieves the passphrase used to encrypt the Sqlite database.
     * @returns {Promise} A Promise object resolved with the passphrase
     */
    getSqlitePassphrase: function () {
        var me = this;
        return new Promise(function (resolve, reject) {
            var options = {
                async: true,
                headers: {"cache-control": "no-cache"},
                callback: resolve,
                errorHandler: me.errorHandlerFunction.bind(me, reject)
            };

            MobileSecurityService.getSqlitePassphrase(options);
        });
    },

    /**** Functions below are deprecated as of version 22.1. Use the 'Promisfyed' versions  ****/

    /**
     * Registers device with specified deviceId for ARCHIBUS user with specified username and password.
     * Executes in asynchronous mode.
     * @deprecated 22.1 Use registerDevice instead
     * @param {String} deviceId ID of the device to be registered.
     * @param {String} userName ARCHIBUS username for whom the device will be registered.
     * @param {String} password password of the ARCHIBUS user for whom the device will be registered.
     * @param {String} localeName Java locale name, for example "en_US". Used to translate exceptions.
     * @param {Function} onCompleted callback function executed when the operation is completed.
     * @param {Object} scope The scope to execute the callback function.
     */
    registerDeviceAsync: function (deviceId, userName, password, localeName, onCompleted, scope) {
        var me = this,
            deviceIdEncrypted = Common.security.Security.encryptString(deviceId),
            usernameEncrypted = Common.security.Security.encryptString(userName),
            passwordEncrypted = Common.security.Security.encryptString(password),
            logMessage = 'Calling MobileSecurityService.registerDevice: deviceId=[{0}], username=[{1}], password=[{2}], localeName=[{3}]',
            result = {
                success: false,
                exception: null
            },
            onSuccess = function () {
                result.success = true;
                Ext.callback(onCompleted, scope || me, [result]);
            },
            onError = function (message, exception) {
                result.success = false;
                exception.genericMessage = LocaleManager.getLocalizedString('Error Registering Device',
                    'Common.service.MobileSecurityServiceAdapter');
                result.exception = exception;
                Ext.callback(onCompleted, scope || me, [result]);
            },
            options = {
                async: true,
                timeout: Network.SERVICE_TIMEOUT * 1000,
                headers: {"cache-control": "no-cache"},
                callback: onSuccess,
                errorHandler: onError
            };

        Log.log(Ext.String.format(logMessage, deviceId, userName, password, localeName), 'info', me, arguments);

        MobileSecurityService.registerDevice(deviceIdEncrypted, usernameEncrypted, passwordEncrypted, localeName, options);
    },

    /**
     * *********************** Deprecated Methods ***************************
     * The methods in this section have been deprecated. These methods have been
     * replaced with Promisfied versions.
     *
     * It is recommended to use the Promise versions wherever possible
     */

    /**
     * Ends user session.
     * @deprecated 22.1 Please use {@link #endSession} instead
     */
    logout: function () {
        SecurityService.endMobileUserSession({
            async: false,
            headers: {"cache-control": "no-cache"},
            callback: Ext.emptyFn,
            errorHandler: Ext.emptyFn
        });
    },

    /**
     * Starts user session for the mobile user.
     * @deprecated Use Common.service.MobileSecurityServiceAdapter
     * @param {String} deviceId ID of the device.
     * @param {String} localeName Java locale name, for example "en_US".
     * @throws exception if operation fails.
     *
     * @deprecated 22.1 Please use {@link #startSession} instead
     */
    startMobileUserSession: function (deviceId, localeName) {
        var me = this;

        if (me.isInSsoMode()) {
            me.resultObject = me.startMobileSsoUserSession(me.throwExceptionOnError);
        } else {
            me.resultObject = me.startMobileUserSessionForDeviceId(deviceId, me.throwExceptionOnError);
        }
        if (me.resultObject.success) {
            me.setSessionLocale(localeName);
        }
        return me.resultObject;
    },


    /**
     * Starts the session for the mobile user. Does not throw an exception if
     * an error occurs during the session set up.
     * The status of the session operation is returned in the result object
     * @deprecated Common.service.MobileSecurityServiceAdapter
     * @param {String} deviceId The mobile device id
     * @param {String} localeName The locale setting of the mobile browser
     * @returns {Object} results object containing the success flag and any error messages.
     * @deprecated 22.1 Please use {@link #startSession} instead
     */
    startMobileUserSessionWithReturn: function (deviceId, localeName) {
        var me = this;

        if (me.isInSsoMode()) {
            me.resultObject = me.startMobileSsoUserSession(false);
        } else {
            me.resultObject = me.startMobileUserSessionForDeviceId(deviceId, false);
        }
        if (me.resultObject.success) {
            me.setSessionLocale(localeName);
        }
        return me.resultObject;
    },


    /**
     * Sets locale of the user session.
     * @deprecated Use Common.service.MobileSecurityServiceAdapter
     * @param {String} localeName Java locale name, for example "en_US".
     * @throws exception if operation fails.
     * @deprecated 22.1 Please use {@link #setLocaleForSession} instead
     */
    setSessionLocale: function (localeName) {
        SecurityService.setLocaleFromJavaLocale(localeName, {
            async: false,
            headers: {"cache-control": "no-cache"},
            callback: Ext.emptyFn,
            errorHandler: function (message, exception) {
                exception.genericMessage = LocaleManager.getLocalizedString('Error setting Session Locale.',
                    'Common.service.MobileSecurityServiceAdapter');
                Common.service.ExceptionTranslator.translate(exception);
            }
        });
    },

    /**
     * Starts user session for the mobile user.
     *
     * @throws exception if operation fails.
     * @deprecated 22.1 Please use {@link #startSsoSession} instead
     */
    startMobileSsoUserSession: function (throwError) {
        var me = this;
        if (!Ext.isDefined(throwError)) {
            throwError = true;
        }

        MobileSecurityService.startMobileSsoUserSession({
            async: false,
            headers: {"cache-control": "no-cache"},
            callback: function () {
                me.resultObject.success = true;
            },
            errorHandler: function (message, exception) {
                me.resultObject.success = false;
                exception.genericMessage = LocaleManager.getLocalizedString('Error starting User Session.',
                    'Common.service.MobileSecurityServiceAdapter');
                me.resultObject.exception = exception;
                if (throwError) {
                    Common.service.ExceptionTranslator.translate(exception);
                }
            }
        });

        return me.resultObject;
    },

    /**
     * Starts user session for the mobile user.
     *
     * @private
     * @param {String} deviceId ID of the device.
     * @param {Boolean} throwError
     *
     * @throws {Error} exception if operation fails.
     * @deprecated 22.1 Please use {@link #startSessionForDeviceId} instead
     */
    startMobileUserSessionForDeviceId: function (deviceId, throwError) {
        var me = this,
            deviceIdEncrypted = Common.security.Security.encryptString(deviceId),
            logMessage = 'deviceId=[{0}]';

        Log.log(Ext.String.format(logMessage, deviceId), 'info', me, arguments);

        if (!Ext.isDefined(throwError)) {
            throwError = true;
        }

        MobileSecurityService.startMobileUserSessionForDeviceId(deviceIdEncrypted, {
            async: false,
            headers: {"cache-control": "no-cache"},
            callback: function () {
                me.resultObject.success = true;
            },
            errorHandler: function (message, exception) {
                me.resultObject.success = false;
                exception.genericMessage = LocaleManager.getLocalizedString('Error starting User Session.',
                    'Common.service.MobileSecurityServiceAdapter');
                me.resultObject.exception = exception;

                if (throwError) {
                    Common.service.ExceptionTranslator.translate(exception);
                }
            }
        });

        return me.resultObject;
    },

    /**
     * Returns true if WebCentral uses one of the standard SSO configurations.
     *
     * @private
     * @return true if WebCentral uses one of the standard SSO configurations.
     * @throws exception if operation fails.
     * @deprecated 22.1 Please use {@link #isSsoMode} instead
     *
     */
    isInSsoMode: function () {

        // Determine if WebCentral is in SSO mode:
        var ssoModeEncrypted = '',
            inSsoMode = false,
            ssoModeDecrypted;

        SmartClientConfigService.getSsoMode({
            async: false,
            headers: {"cache-control": "no-cache"},
            callback: function (returnValue) {
                ssoModeEncrypted = returnValue;
            },
            errorHandler: function (message, exception) {
                exception.genericMessage = LocaleManager.getLocalizedString('Single Sign On Error',
                    'Common.service.MobileSecurityServiceAdapter');
                SecurityService.endMobileUserSession();
                Common.service.ExceptionTranslator.translate(exception);
            }
        });

        if (ssoModeEncrypted.length > 0) {
            ssoModeDecrypted = Common.security.Security.decryptString(ssoModeEncrypted);
            // We are in sso mode if the decrypted string contains
            // the the text preauth.
            inSsoMode = ssoModeDecrypted.indexOf('preauth') !== -1;
        }
        return inSsoMode;
    },

    /**
     * Returns User DTO.
     *
     * @deprecated 22.1 Use Common.store.UserInfo class instead.
     * @return DTO for User.
     * @throws exception if operation fails.
     */
    getUser: function () {
        var user = null;

        AdminService.getUser({
            async: false,
            headers: {"cache-control": "no-cache"},
            callback: function (returnValue) {
                user = returnValue;
            },
            errorHandler: function (message, exception) {
                exception.genericMessage = LocaleManager.getLocalizedString('Error retrieving User information.',
                    'Common.service.MobileSecurityServiceAdapter');
                Common.service.ExceptionTranslator.translate(exception);
            }
        });

        return user;
    },


    /**
     * Checks if the registered user is a member of the supplied group
     * @since 21.3
     * @param {String} group The group membership to check
     * @param {Function} onSuccess called when the membership check is complete if there are no errors
     * @param {Function} onError called when the membership check returns an error
     * @param {Object} scope The scope to execute the callbacks
     * @deprecated 22.1 Please use {@link #isUserMemberOfGroup} instead
     */
    isUserMemberOfGroupAsync: function (group, onSuccess, onError, scope) {
        var me = this,
            options = {
                async: true,
                headers: {"cache-control": "no-cache"},
                callback: function (returnValue) {
                    Ext.callback(onSuccess, scope || me, [returnValue]);
                },

                errorHandler: function (message, exception) {
                    Ext.callback(onError, scope || me, exception);
                }
            };
        AdminService.isUserMemberOfGroup(group, options);
    }

});