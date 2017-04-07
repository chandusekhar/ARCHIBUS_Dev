/* global LocalFileSystem */
/* global Configuration */

/**
 * Domain object and store for application configuration.
 * Stores application configuration in a file.
 * Caches application configuration.
 * Allows the data to be loaded and accessed synchronously. The application should populate this object using the load
 * method. Changes to the configuration object should be saved to the file using the sync method.
 *
 * @author Jeff Martin
 * @author Valery Tydykov
 *
 * @since 21.1
 */
Ext.define('Common.util.ConfigFileManager', {
    alternateClassName: ['ConfigFileManager'],

    requires: [
        'Common.util.Environment',
        'Common.device.File'
    ],

    singleton: true,

    /**
     * @property {Boolean} isRegistered true when the Web Central URL is registered.
     */
    isRegistered: false,

    /**
     * Maintains the base url for all ARCHIBUS mobile applications
     */
    url: '',

    /**
     * Maintains the username of the user who registered this device
     */
    username: '',

    /**
     * Maintains the unique device identifier
     */
    deviceId: '',

    /**
     * Maintains the current locale as determined by the browser.
     *
     */
    localeName: 'en_US',

    /**
     * @property {Boolean} isDeviceRegistered true if the device is registered false otherwise
     */
    isDeviceRegistered: false,


    logger: {
        enabled: Ext.os.is.Desktop ? true : false,
        minLevel: 'verbose',
        writers: {
            console: {
                enabled: Ext.os.is.Desktop ? true : false
            },
            file: {
                enabled: false,
                fileSize: 30000,
                maxNumberOfFile: 5
            },
            database: {
                enabled: false,
                maxRecords: 30000
            }
        }
    },

    isLoaded: false,

    employeeId: '',

    dbMap: {},

    CONFIGURATION_FILENAME: 'MobileClient.conf',

    fileSystem: null,

    /**
     * Indicates if the app is running in Browser Mode. Browser Mode is enabled if the app is not running in the native
     * device environment or the app is running in the Chrome browser.
     */
    browserMode: false,

    /**
     * Prefix used when storing configuration items in local storage.
     */
    localStoragePrefix: 'Common.util.ConfigFileManager',

    constructor: function () {
        this.browserMode = Environment.getBrowserMode();

        // If we are not in browser mode then we are either in the native Phonegap environment
        // or we are running on the desktop Chrome browser.
        if (!this.browserMode) {
            // Override the Filesystem API to allow us to debug on the desktop using an environment
            // that simulates the device environment
            if (Ext.browser.is.Chrome) {
                this.overrideFileSystem();
            }
        }
    },

    /**
     * Reads the configuration data from the file system
     * @param onSuccess
     * @param onError
     * @param scope
     */

    load: function (onSuccess, onError, scope) {
        var me = this,
            isNativeMode = Environment.getNativeMode(),
            onFileRead = function (result) {
                // Convert the configuration object to properties
                me.objectToProperties(result);
                me.setUserDatabase();
                me.isLoaded = true;

                Ext.callback(onSuccess, scope || me, [result]);
            };

        if (me.browserMode) {
            me.readLocalStorage();
            Ext.callback(onSuccess, scope || me, ['local']);
        } else {
            if (isNativeMode) {
                me.readDeviceConfigFile(onFileRead, onError);
            } else {
                me.readConfigObject(onFileRead, onError, scope);
            }

        }
    },

    readDeviceConfigFile: function (onSuccess, onError) {
        var me = this;
        // Create the file if it does not exists
        Configuration.configFileExists(function (result) {
            if (result) {
                Configuration.readConfigFile(function (data) {
                    // convert file string data to JSON object
                    var jsonData;

                    if (Ext.isObject(data)) {
                        jsonData = data;
                    } else {
                        jsonData = Ext.JSON.decode(data);
                    }
                    Ext.callback(onSuccess, me, [jsonData]);
                }, function (errorMsg) {
                    alert('Error ' + errorMsg);
                    Ext.callback(onError, me);
                });
            } else {
                me.writeDeviceConfigFile(function () {
                    Ext.callback(onSuccess, me, [Ext.JSON.encode(me.propertiesToObject())]);
                });
            }
        });
    },

    writeDeviceConfigFile: function (onSuccess, onError) {
        // Convert object properties to JSON string
        var me = this,
            properties = me.propertiesToObject(),
            propertiesString = Ext.JSON.encode(properties);

        Configuration.writeConfigFile(propertiesString, onSuccess, onError);
    },

    /**
     * Writes the contents of the configuration object to the configuration file.
     *
     * @param onSuccess -
     *            Callback function called when the sync function completes
     * @param onError -
     *            Callback function called with error info if an error occurs
     * @param scope -
     *            Scope for the supplied callback execution.
     */
    sync: function (onSuccess, onError, scope) {
        var me = this,
            isNativeMode = Environment.getNativeMode(),
            obj = me.propertiesToObject();

        me.setUserDatabase();

        if (me.browserMode) {
            me.writeLocalStorage();
            Ext.callback(onSuccess, scope || me);
        } else {
            if (isNativeMode) {
                me.writeDeviceConfigFile(onSuccess, onError);
            } else {
                me.writeConfigObject(obj, onSuccess, onError, scope);
            }
        }
    },

    /**
     * Reads the configuration object from the file system
     * @param {Function} onSuccess
     * @param {Function} onError
     * @param {Object} scope
     */
    readConfigObject: function (onSuccess, onError, scope) {
        var me = this,
            defaultConfig = me.propertiesToObject();

        Common.device.File.fileExists(me.CONFIGURATION_FILENAME)
            .then(function () {
                // File exists
                Common.device.File.readFile(me.CONFIGURATION_FILENAME)
                    .then(function (fileData) {
                        Ext.callback(onSuccess, scope, [Ext.JSON.decode(fileData)]);
                    }, onError);
            }, function () {
                // File does not exist, write the default values
                var defaultConfigStr = Ext.JSON.encode(defaultConfig);
                Common.device.File.writeFile(me.CONFIGURATION_FILENAME, defaultConfigStr)
                    .then(function () {
                        Ext.callback(onSuccess, scope, [defaultConfig]);
                    }, onError);
            });
    },

    /**
     * Converts the configuration object to a string and writes the string to the configuration file.
     * @param {Object} configObject
     * @param {Function} onSuccess
     * @param {Object} onError
     */
    writeConfigObject: function (configObject, onSuccess, onError) {
        var me = this,
            configObjStr = JSON.stringify(configObject);

        Common.device.File.writeFile(me.CONFIGURATION_FILENAME, configObjStr)
            .then(onSuccess, onError);
    },

    /**
     * Converts the configuration object to individual ConfigFileManager properties.
     *
     * @private
     * @param configObject -
     *            The configuration object
     */
    objectToProperties: function (configObject) {
        var property;

        for (property in configObject) {
            if (configObject.hasOwnProperty(property)) {
                this[property] = configObject[property];
            }
        }

        // localeName is coming from the LocaleManager
        this.localeName = LocaleManager.getJavaLocale();
    },

    /**
     * Converts the ConfigFileManager properties to object format. Used when writing the configuration data to the file
     * system.
     *
     * @private
     * @return {Object}
     */
    propertiesToObject: function () {
        var me = this,
            configObject = {};

        configObject.isRegistered = me.isRegistered;
        configObject.username = me.username;
        configObject.deviceId = me.deviceId;
        configObject.url = me.url;
        configObject.localeName = me.localeName;
        configObject.employeeId = me.employeeId;
        configObject.logger = me.logger;
        configObject.dbMap = me.dbMap;
        configObject.isDeviceRegistered = me.isDeviceRegistered;

        return configObject;
    },

    /**
     * Reads configuration items from local storage
     */
    readLocalStorage: function () {

        var me = this,
            localStorageId = me.localStoragePrefix + '-',
            isRegistered = localStorage.getItem(localStorageId + 'isRegistered');

        if (isRegistered === null) {
            isRegistered = false;
        }

        me.isRegistered = isRegistered;
        me.username = localStorage.getItem(localStorageId + 'username');
        me.deviceId = localStorage.getItem(localStorageId + 'deviceId');
        me.url = document.location.href;
        me.localeName = LocaleManager.getJavaLocale();
        me.employeeId = localStorage.getItem(localStorageId + 'employeeId');
        me.isDeviceRegistered = localStorage.getItem(localStorageId + 'isDeviceRegistered');
    },

    /**
     * Writes configuration values to local storage
     */
    writeLocalStorage: function () {
        var me = this,
            localStorageId = me.localStoragePrefix + '-';

        localStorage.setItem(localStorageId + 'isRegistered', me.isRegistered);
        localStorage.setItem(localStorageId + 'username', me.username);
        localStorage.setItem(localStorageId + 'deviceId', me.deviceId);
        localStorage.setItem(localStorageId + 'url', me.url);
        localStorage.setItem(localStorageId + 'employeeId', me.employeeId);
        localStorage.setItem(localStorageId + 'isDeviceRegistered', me.isDeviceRegistered);
    },

    /**
     * Overrides the Filesystem API. Used when debugging using the Chrome desktop browser.
     *
     * @private
     *
     */
    overrideFileSystem: function () {

        // Global LocalFileSystem object for debugging on the desktop.
        window.LocalFileSystem = {
            TEMPORARY: window.TEMPORARY || 0,
            PERSISTENT: window.PERSISTENT || 1
        };

        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

        // Request quota storage for Chrome browsers
        // Try/Catch is required to prevent errors during the production build
        try {
            navigator.webkitPersistentStorage.requestQuota(500 * 1024 * 1024, function (grantedBytes) {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, grantedBytes, function () {
                    Log.log('Allocated Quota Storage.', 'info', this, arguments);
                }, function () {
                    Log.log('Error Requesting file system.', 'info', this, arguments);
                });
            }, function (e) {
                Log.log('Error requesting storage quota' + e, 'info', this, arguments);
            });
        } catch (e) {
            Ext.Msg.Alert('', 'Error overriding Filesystem ' + e);
        }
    },

    /**
     * Assigns the registered user to the users database. If no user is available the database
     * is assigned to the 'unassigned' user. If the user does not have an associated database
     * a new database entry is created or the unassigned database is used.
     */
    setUserDatabase: function () {
        var me = this,
            userName = me.username,
            dbMap = me.dbMap;

        if (Ext.isEmpty(userName)) {
            if(!dbMap.hasOwnProperty('unassigned')) {
                dbMap.unassigned = Ext.data.identifier.Uuid.Global.generate();
            }
        } else {
            if (!dbMap.hasOwnProperty(userName)) {
                if (dbMap.unassigned) {
                    dbMap[userName] = dbMap.unassigned;
                    delete dbMap.unassigned;
                } else {
                    // We should never execute this path. The dbMap object should always contain
                    // an unassigned property.
                    dbMap[userName] = Ext.data.identifier.Uuid.Global.generate();
                }
            }
        }
    }

});