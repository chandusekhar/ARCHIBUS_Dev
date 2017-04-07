/**
 * Writes the cached Sencha files that are collected during start up to the SQLite database.
 * The application data is transferred from the start up code to the application in the Ab.appCacheData array.
 * @author Jeff Martin
 */
Ext.define('Common.util.AppCacheManager', {
    singleton: true,

    requires: [
        'Common.store.proxy.SqliteConnectionManager',
        'Common.util.Environment'
    ],

    /**
     * Writes the application cache data to the client database
     * The Abm.appCacheData array is populated in the Sencha microloader
     * start up code.
     */
    writeAppCacheData: function (onCompleted, scope) {
        var me = this,
            appData,
            appKey = '%',
            deleteSql = 'DELETE FROM AppCache WHERE key LIKE ?',
            insertSql = 'INSERT INTO AppCache(key, value) VALUES(?,?)',
            db,
            itemCount,
            onError = function (error) {
                Ext.callback(onCompleted, scope || me);
                throw new Error(error);
            },
            checkComplete = function () {
                if (itemCount === 0) {
                    Ext.callback(onCompleted, scope || me);
                }
            };

        if (me.isAbmDefined()) {
            db = window.openDatabase('AbApp', '1.0', 'ARCHIBUS Application Cache', 50 * 1024 * 1024);
            appData = Abm.appCacheData;
            itemCount = appData.length;
            if (Ext.isDefined(Abm.appKey)) {
                appKey = '%' + Abm.appKey + '%';
            }
            db.transaction(function (tx) {
                tx.executeSql(deleteSql, [appKey], function (tx) {
                    Ext.each(appData, function (item) {
                        tx.executeSql(insertSql, [item.key, item.value], function () {
                            itemCount -= 1;
                            checkComplete();
                        }, onError);
                    });
                }, onError);
            });
        } else {
            Ext.callback(onCompleted, scope || me);
        }
    },

    writeAppCacheDataToFile: function (onCompleted, scope) {
        var me = this,
            isNativeMode = Environment.getNativeMode(),
            appData,
            fileName;

        if (isNativeMode && me.isAbmDefined()) {
            appData = JSON.stringify(Abm.appCacheData);
            fileName = Abm.appKey;
            me.writeFile(fileName + '.abdata', appData, onCompleted, scope);
        } else {
            Ext.callback(onCompleted, scope || me);
        }
    },

    /**
     * Checks if the Abm.appCacheData global is defined
     * @private
     * @returns {boolean} True if Abm.appCacheData is defined.
     */
    isAbmDefined: function () {
        return (typeof Abm !== 'undefined' && typeof Abm.appCacheData !== 'undefined');
    },

    fileSystem: null,

    writeFile: function(fileName, data, onCompleted) {
        var me = this;
        Configuration.writeFile(fileName, data, function() {
            Log.log('Write app cache file complete for file ' + fileName, 'info');
            Ext.callback(onCompleted, me);
        }, function() {
            Log.log('Writing app cache file failed', 'error');
            Ext.callback(onCompleted, me);
        });
    },

    getFileSystem: function (onCompleted, onError) {
        var me = this;
        if (me.fileSystem !== null) {
            Ext.callback(onCompleted, me, [me.fileSystem]);
        } else {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
                me.fileSystem = fileSystem;
                Ext.callback(onCompleted, me, [fileSystem]);
            }, onError);
        }
    }
});