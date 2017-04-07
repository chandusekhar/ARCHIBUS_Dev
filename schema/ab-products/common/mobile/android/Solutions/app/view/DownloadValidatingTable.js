Ext.define('Solutions.view.DownloadValidatingTable', {
    extend: 'Common.view.navigation.ListBase',

    requires: [
        'Common.sync.Manager',
        'Common.service.Session'
    ],

    /** Steps required to add a Validating table action:
     1. Create the Model class by extending the Ext.data.Model class
     2. Create the Store class by extending the Common.store.sync.ValidatingTableStore class
     3. Register the Store by adding it in the app.js file

     The sync of Background Data might be automatical by setting 'autoBackgroundDataSync: true' in app.js file,
     as is works for this app. */

    /**
     * This example uses the store 'Common.store.EquipmentStandards', which was added in the app.js file.
     */
    config: {
        styleHtmlContent: true,
        items: [
            {
                xtype: 'toolbar',
                title: {
                    //title: 'My Toolbar',
                    style: {
                        'text-align': 'right'
                    }
                },
                docked: 'top',
                width: '100%',
                items: [
                    {
                        xtype: 'toolbarbutton',
                        text: 'Empty the Store',
                        handler: function () {
                            var eqStdStore = Ext.getStore('equipmentStandardsStore');

                            eqStdStore.setDisablePaging(true);
                            eqStdStore.load(function () {
                                eqStdStore.removeAll();
                                eqStdStore.sync(function () {
                                    eqStdStore.setDisablePaging(false);
                                    eqStdStore.load();
                                });
                            });
                        }
                    },
                    {
                        xtype: 'toolbarbutton',
                        text: 'Download',
                        handler: function () {
                            var eqStdStore = Ext.getStore('equipmentStandardsStore');

                            Network.checkNetworkConnectionAndLoadDwrScripts(true)
                                .then(function () {
                                    SyncManager.startSync();
                                    return Common.service.Session.start();
                                })
                                .then(function () {
                                    return eqStdStore.deleteAndImportRecords();
                                })
                                .then(function () {
                                    SyncManager.endSync();
                                    return Common.service.Session.end();
                                })
                                .then(function () {
                                    return SyncManager.loadStore(eqStdStore);
                                })
                                .then(null, function (error) {
                                    // Handle any errors here
                                    Ext.Msg.alert('', error);
                                    SyncManager.endSync(); // End the sync here to insure that the loading mask is hidden
                                    Common.service.Session.end();   // End the session here in case the session is still open.
                                })
                                .done();
                        }
                    }]
            },
            {
                html: "<br />A specific validating table can be downloaded using ValidatingTableStore#clearAndImportRecords function, as demonstrated on Download button action." +
                "<br />The button 'Empty the Store' can be used to delete all records in the store and empty the list. This will make the effect of the Download button clearer. The store is initially populated since this app uses auto background data sync."
            },
            {
                xtype: 'list',
                flex: 1,
                itemId: 'eqList',
                itemTpl: '{eq_std}',
                store: 'equipmentStandardsStore',
                plugins: {
                    xclass: 'Common.plugin.ListPaging',
                    autoPaging: false
                }
            }
        ]
    }
});