/**
 * Manages the only SQLite database connection: creates the database connection if it does not exist; stores the
 * database connection in a field.
 *
 * @author Valery Tydykov
 * @author Jeff Martin
 * @since 21.1
 *
 */
Ext.define('Common.store.proxy.SqliteConnectionManager', {
    alternateClassName: ['SqliteConnectionManager'],
    requires: [
        'Common.env.Feature',
        'Common.util.ConfigFileManager'
    ],

    singleton: true,

    /**
     * @cfg {String} name Name of database
     */
    name: 'ARCHIBUS',

    /**
     * @cfg {String} Version database version. If different than current, use updatedb event to update database.
     */
    version: '1.0',

    /**
     * @cfg {String} description Description of the database.
     */
    description: 'ARCHIBUS Mobile Applications Database',

    /**
     * @cfg {String} Size Max storage size in bytes.
     */
    size: 50 * 1024 * 1024,

    /**
     * {Database} The one and only Sqlite database connection.
     */
    connection: null,

    /**
     *
     * Creates the only database connection if it does not exist. Stores the database connection in a field.
     * The start up sequence requires that database connection is created after the Phonegap library is loaded.
     *
     * @return {Object} database connection.
     */
    getConnection: function () {
        var me = this,
            dbErrorMsg = LocaleManager.getLocalizedString('Error opening database: {0}', 'Common.store.proxy.SqliteConnectionManager'),
            userName = ConfigFileManager.username,
            dbName = 'ARCHIBUS';


        if (Common.env.Feature.isNative) {
            if (Ext.isEmpty(userName)) {
                ConfigFileManager.setUserDatabase();
                console.log('Using unassigned database');
                dbName = ConfigFileManager.dbMap.unassigned;
            } else {
                dbName = ConfigFileManager.dbMap[userName];
            }
        }


        me.name = dbName;
        if (me.connection === null) {
            if (Common.env.Feature.isNative) {
                Log.log('Open Database [' + dbName + ']', 'verbose');
                me.connection = window.sqlitePlugin.openDatabase(me.name, me.version, me.description, -1, function () {
                        Log.log('Database is open (callback) ' + dbName, 'debug');
                    },
                    function (error) {
                        Ext.Msg.alert('', Ext.String.format(dbErrorMsg, error));
                    });
            } else {
                me.connection = openDatabase(me.name, me.version, me.description, me.size);
            }
        }


        return me.connection;
    },

    invalidateConnection: function () {
        this.connection = null;
    }

});
