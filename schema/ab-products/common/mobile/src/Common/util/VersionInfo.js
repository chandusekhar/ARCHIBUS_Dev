/**
 * Contains version information for the mobile applications.
 * @since 21.3
 * @author Jeff Martin
 */
Ext.define('Common.util.VersionInfo', {

    singleton: true,

    TIMEOUT: 10,

    serviceEndpoints: [
        'version',
        'revision',
        'schemaversion',
        'cordovaversion'
    ],

    versionInfo: {
        version: '',
        revision: '',
        schemaversion: '',
        cordovaversion: ''
    },

    getVersionInfo: function (origin) {
        var me = this,
            endpoints = me.serviceEndpoints;

        if (Ext.isEmpty(origin)) {
            origin = window.location.origin + '/archibus';
        }

        // Remove any trailing slashes from the origin URL
        origin = origin.replace(/\/*$/g, '');

        return Promise.all(endpoints.map(function (endpoint) {
                var url = origin + '/cxf/configs/' + endpoint;
                return me.callCxfService(url, endpoint);
            }))
            .then(function (versions) {
                Ext.each(versions, function (version) {
                    me.versionInfo[version.endpoint] = version.value;
                });
                return Promise.resolve(me.versionInfo);
            });
    },

    callCxfService: function (url, endpoint) {
        var me = this;

        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest(),
                requestTimer,
                result = {};

            result.endpoint = endpoint;
            result.value = '';

            xhr.open('GET', url, true);
            requestTimer = setTimeout(function () {
                xhr.abort();
            }, me.TIMEOUT * 1000);
            xhr.onreadystatechange = function () {
                var status,
                    content;
                if (xhr.readyState === 4) {
                    clearTimeout(requestTimer);
                    status = xhr.status;
                    content = xhr.responseText;

                    if ((status >= 200 && status < 300) || status === 304 || (status === 0 && content.length > 0)) {
                        result.value = content;
                        resolve(result);
                    } else if (status === 404 || status === 500) {
                        result.value = 'NOT_FOUND';
                        resolve(result);
                    }
                    else {
                        result.value = '';
                        resolve(result);
                    }
                }
            };
            xhr.send(null);
        });
    },

    /**
     * Checks if the Mobile Client version is compatible with the Web Central instance
     * @param {String} mobileClientVersion 1.0 or 2.0 depending on the version of the Mobile Client that is
     * connecting to this Web Central instance
     * @param {Object} versionInfo The versionInfo object containing the Web Central version information.
     * @returns {boolean}
     */
    isWebCentralVersionCompatible: function (mobileClientVersion, versionInfo) {

        var isCompatible = false;

        // Mobile Client version 1.0 can connect to a 21.1, 21.2 Web Central instance
        // or a 21.3 instance if the Cordova libray is 2.1.0
        if (mobileClientVersion === '1.0') {
            isCompatible = (versionInfo.version === 'NOT_FOUND' && versionInfo.revision === 'NOT_FOUND' && versionInfo.cordovaversion === 'NOT_FOUND') ||
                (versionInfo.version === '21' && versionInfo.revision === '3' && versionInfo.cordovaversion === '2.1.0');
        }

        // The Mobile Client 2.0 can only connect to a Web Central instance where the Cordova version is 3.5.0
        if (mobileClientVersion === '2.0') {
            isCompatible = (versionInfo.cordovaversion === '3.5.0');
        }

        return isCompatible;
    },

    /**
     * Retrieves the Web Central version information
     * Requires an active user session
     * @returns {Promise} A Promise resolved with the Web Central version information.
     */
    getWebCentralVersion: function() {
        return new Promise(function(resolve, reject) {
            var options = {
                async: true,
                callback: function(version) {
                    resolve(version.customerInfoDto.version);
                },
                errorHandler: function(message, exception) {
                    reject(exception.message);
                }
            };
            AdminService.getProgramLicense(options);
        });
    },

    getMobileClientVersion: function() {
        return new Promise(function(resolve, reject) {
            if(typeof AppVersion !== 'undefined') {
                AppVersion.getAppVersion(resolve, reject);
            } else {
                resolve('Not Available');
            }
        });
    },

    /**
     * Constructs the BuildInfo object that contains the build info for each of the registered applications
     * @private
     * @returns {Promise} A Promise resolved with the BuildInfo object
     */
    getApplicationBuildInfo: function () {
        var me = this,
            appStore = Ext.getStore('apps');

        return appStore.retrieveAllRecords()
            .then(function (records) {
                var urls = [];
                // The AppLauncher is not included in the list of registered apps so add it here
                var appLauncherVersionUrl = {url: me.getBaseUrl('AppLauncher') + '/AppLauncher.build.js', appName: 'AppLauncher'};
                urls.push(appLauncherVersionUrl);
                records.forEach(function (record) {
                    var appName = record.get('url'),
                        baseUrl = me.getBaseUrl(appName),
                        versionUrl = {url: baseUrl + '/' + appName + '.build.js', appName: appName};
                    urls.push(versionUrl);
                });
                return Promise.all(urls.map(me.getBuildInfo.bind(me)));
            });
    },

    /**
     * Retrieves the application build version file from the server. Decodes the JSON contents and updates the
     * app build information stored in the browser local storage.
     * @param {String} versionUrl A URL of the build version file. The file is in the form of [AppName].build.js.
     * The build version file contains the last build number and the last build date of the app.
     * @private
     * @returns {Promise} A resolved Promise object when the operation is completed.
     */
    getBuildInfo: function (versionUrl) {
        return new Promise(function (resolve) {
            Ext.Ajax.request({
                url: versionUrl.url,
                success: function (response) {
                    var buildInfo = Ext.decode(response.responseText);
                    versionUrl.buildInfo = buildInfo;
                    Common.util.VersionInfo.saveBuildVersion(versionUrl);
                    resolve();
                },
                failure: resolve
            });
        });
    },

    /**
     * Adds the build version info for the app to the build version data that is saved in local storage.
     * @private
     * @param {Object} versionInfo The versionInfo object containing the build version information for the app
     */
    saveBuildVersion: function (versionInfo) {
        var buildVersionItem = localStorage.getItem('Ab.BuildVersions'),
            buildsStr;

        buildVersionItem = Ext.isEmpty(buildVersionItem) ? {} : Ext.JSON.decode(buildVersionItem);

        buildVersionItem[versionInfo.appName] = {
            buildVersion: versionInfo.buildInfo.build,
            buildDate: versionInfo.buildInfo.date
        };
        buildsStr = Ext.JSON.encode(buildVersionItem);
        localStorage.setItem('Ab.BuildVersions', buildsStr);
    },

    getBaseUrl: function (appName) {
        var currentUrl = document.location.origin + document.location.pathname,
            baseUrl;

        // If the app is running on a device use the URL that is stored in the ConfigFileManager
        if(Common.env.Feature.isNative) {
            baseUrl = ConfigFileManager.url + '/' + appName;
        } else {
            baseUrl = currentUrl.replace('AppLauncher/index.html', appName);
        }

        return baseUrl;
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
    }

});
