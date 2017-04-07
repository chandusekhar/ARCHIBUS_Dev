Ext.define('Common.util.Registration', {
    requires: 'Common.store.proxy.SqliteConnectionManager',

    singleton: true,

    deleteUserFiles: function () {
        if (Common.env.Feature.hasFileSystem) {
            return this.doDeleteUserFiles();
        } else {
            return Promise.resolve();
        }
    },

    /**
     * Deletes user document and floorplan files
     */
    doDeleteUserFiles: function () {
        var userName = ConfigFileManager.username,
            documentFolder = GlobalParameters.documentFolder + '/' + userName,
            floorPlanFolder = GlobalParameters.floorplanFolder + '/' + userName,
            onDemandDocumentFolder = GlobalParameters.onDemandDocumentFolder + '/' + userName,

            deleteDocumentsPromise = Common.device.File.deleteFilesInDirectoryRecursive(documentFolder),
            deleteFloorplansPromise = Common.device.File.deleteFilesInDirectoryRecursive(floorPlanFolder),
            onDemandDocumentsPromise = Common.device.File.deleteFilesInDirectoryRecursive(onDemandDocumentFolder);

        return Promise.all([deleteDocumentsPromise, deleteFloorplansPromise, onDemandDocumentsPromise]);
    },

    /**
     * Deletes the data from each database table when the device is in Desktop mode. Does nothing when the
     * app is running on the device.
     * @returns {Promise}
     */
    deleteDataFromDatabase: function() {
        if(Common.env.Feature.isNative) {
            SqliteConnectionManager.invalidateConnection();
            return Promise.resolve();
        } else {
            return Common.util.Database.deleteFromAllTables();
        }
    },

    /**
     * Checks if the device is registered using SSO
     * @returns {Promise} Resovled to true if there is a network connection and the device is configured
     * to use SSO otherwise returns a rejected Promise.
     */
    isInSsoMode: function() {
        return Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function(isConnected) {
                if(isConnected) {
                    return MobileSecurityServiceAdapter.isSsoMode();
                } else {
                    return Promise.reject();
                }
            });

    }
});