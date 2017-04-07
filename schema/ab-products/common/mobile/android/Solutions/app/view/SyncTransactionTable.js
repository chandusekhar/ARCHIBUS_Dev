Ext.define('Solutions.view.SyncTransactionTable', {
    extend: 'Ext.Container',

    requires: 'Common.sync.Manager',

    config: {
        styleHtmlContent: true,
        items: [
            {
                html: "A typical sync action involves the following steps:" +
                "<br />1. Transfer data from the mobile device to the Web Central database" +
                "<br />2. The mobile device initiates one or more workflow rules that act on the transferred data" +
                "<br />3. Transfer data from the Web Central database to the mobile device" +
                "<br />" +
                "<br />The mobile framework performs the synchronization using the Common.store.sync.SyncStore.synchronize() function." +
                "<br />Steps required to add a synchronize action for a new table:" +
                "<br />1. Create the Model class by extending the Common.model.ModelBase class" +
                "<br />2. Create the Store class by extending the Common.store.sync.SyncStore class" +
                "<br /><br /><strong>WARNING:</strong> This view syncs the shared Space Surveys store which is used by other apps."
            },
            {
                xtype: 'toolbar',
                title: 'My Toolbar',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        text: 'Sync',
                        itemId: 'syncButton'
                    }
                ]
            }
        ]
    },

    initialize: function() {
        var me = this,
            syncButton = me.down('#syncButton');

        syncButton.on('tap', 'doSync', me);
    },

    /**
     *  Synchronize each of the transaction tables
     *  The following steps are performed by the synchronization operation on each of the transaction tables:
     *  1. Records are retrieved from the mobile database where the mob_is_changed field is equal to 1
     *  2. The transaction table definition in the mobile database is compared
     *     with the table definition from the server side TableDef object. The
     *     mobile database definition is modified if it does not match the server side table definition.
     *  3. The changed records are 'checked in' to the WebCentral server database
     *  4. Records in the WebCentral database that are assigned to the current device
     *     owner are 'checked out' from the server database and transferred to the mobile database.
     */

    doSync: function() {
        var onFinish = function () {
            SyncManager.endSync();
            Common.service.Session.end();
        };

        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function () {
                SyncManager.startSync();
                return Common.service.Session.start();
            })
            .then(function () {
                return SyncManager.syncTransactionTables('spaceSurveysStore');
            })
            .then(function () {
                return SyncManager.loadStore('spaceSurveysStore');
            })
            .then(null, function (error) {
                // Handle any errors here
                Ext.Msg.alert('', error);
                return Promise.reject();
            })
            .done(onFinish, onFinish);
    }
});

