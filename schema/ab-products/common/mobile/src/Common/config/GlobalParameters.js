/**
 * Holds global configuration values used by all mobile apps.
 * @since 22.1
 */
Ext.define('Common.config.GlobalParameters', {
    requires: [
        'Common.env.Feature',
        'Common.util.ConfigFileManager'
    ],

    singleton: true,
    alternateClassName: ['GlobalParameters'],

    documentFolder: 'AbDocuments',

    floorplanFolder: 'AbFloorplan',

    onDemandDocumentFolder: 'AbOnDemandDocuments',

    siteMapFolder: 'AbSiteMap',

    /**
     * @private
     * @returns {String} Returns either FILE or DATABASE
     */
    getDocumentStorageLocation: function() {
        var mobileDocsParameter =  Common.util.ApplicationPreference.getApplicationPreference('StoreMobilDocsAndPlansInDeviceDb');

        // We don't really need this check here because this is a 'priavte' method and the check is included
        // in #useFileStorage. We include it in case someone calls this method directly.
        if(!Common.env.Feature.hasFileSystem) {
            return 'DATABASE';
        }

        if(mobileDocsParameter === '1') {
            return 'DATABASE';
        } else {
            return 'FILE';
        }
    },

    /**
     * Returns true when the environment supports a file system and the StoreMobilDocsAndPlansInDeviceDb != 1
     * @returns {boolean}
     */
    useFileStorage: function() {
        if(!Common.env.Feature.hasFileSystem) {
            return false;
        } else {
            return Common.config.GlobalParameters.getDocumentStorageLocation() === 'FILE';
        }
    },

    /**
     * Returns the value of the user document folder.
     */
    getUserDocumentFolder: function() {
        if(Ext.isEmpty(ConfigFileManager.username)) {
            return Common.config.GlobalParameters.documentFolder;
        } else {
            return Common.config.GlobalParameters.documentFolder + '/' + ConfigFileManager.username;
        }
    },
    
    getUserFloorplanFolder: function() {
        return Common.config.GlobalParameters.floorplanFolder + '/' + ConfigFileManager.username;
    }
    
    
});