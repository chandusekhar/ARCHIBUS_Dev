Ext.define('Solutions.view.PartialSync', {
    extend: 'Ext.Container',

    requires: [
        'Common.control.field.Number'
    ],

    config: {
        scrollable: true,
        items: [
            {
                xtype: 'container',
                html: ['<p>The Partial Sync feature provides a way for a table to be synced without deleting all of the existing data in the ',
                    'client database. The standard sync deletes all of existing records in the client database before inserting the new records.',
                    'The Partial Sync will delete only any existing records in the client database before inserting the new records.</p>',
                    '<p>To use this example:</p><ul><li>Delete the records in the Building Table</li><li>Select a Building Code to sync.</li>',
                    '<li>Perform the Sync.</li><li>Select a different Building Code to Sync.</li></ul>',
                    '<p>The following configurations are required to enable the Partial Sync feature for a Sync Store</p>',
                    '<ul><li>Set the store <strong>deleteAllRecordsOnSync</strong> property to <strong>false</strong></li>',
                    '<li>Set the model <strong>uniqueIdentifier</strong> property</li><li>Set a restriction on the store to limit the sync results</li></ul>'].join(''),
                styleHtmlContent: true
            },
            {
                xtype: 'container',
                margin: '10px',
                padding: '6px',
                style: 'border:1px solid grey',
                items: [
                    {
                        xtype: 'prompt',
                        name: 'bl_id',
                        itemId: 'buildingCodeSyncPrompt',
                        label: 'Building to Sync',
                        title: 'Buildings to Sync',
                        store: 'buildingCodes',
                        displayFields: [
                            {
                                name: 'bl_id',
                                title: 'Building Code'
                            },
                            {
                                name: 'name',
                                title: 'Building'
                            }
                        ]
                    },
                    {
                        xtype: 'prompt',
                        name: 'bl_id',
                        itemId: 'buildingPrompt',
                        label: 'Buildings',
                        title: 'Buildings',
                        store: 'buildingsStore',
                        displayFields: [
                            {
                                name: 'bl_id',
                                title: 'Building Code'
                            },
                            {
                                name: 'name',
                                title: 'Building'
                            }
                        ]
                    },
                    {
                        xtype: 'formattednumberfield',
                        label: 'Number of Buildings',
                        decimals: 0,
                        itemId: 'numRecords'
                    },
                    {
                        xtype: 'button',
                        text: 'Sync',
                        itemId: 'btnSync',
                        margin: '10px 20px 10px 20px'
                    },
                    {
                        xtype: 'button',
                        text: 'Delete Buildings',
                        itemId: 'btnDelete',
                        margin: '10px 20px 10px 20px'
                    }
                ]
            }

        ]
    },

    initialize: function () {
        var me = this,
            syncButton = me.down('#btnSync'),
            deleteButton = me.down('#btnDelete'),
            buildingStore = Ext.getStore('buildingsStore');

        // Configure the store to use Partial Sync
        buildingStore.setDeleteAllRecordsOnSync(false);

        syncButton.on('tap', 'onSync', me);
        deleteButton.on('tap', 'onDelete', me);

        me.updateBuildingCount();

    },

    onSync: function () {
        var me = this,
            buildingCodeSyncPrompt = me.down('#buildingCodeSyncPrompt'),
            buildingStore = Ext.getStore('buildingsStore'),
            blCode,
            restriction = {};

        // Get the Building code to sync
        blCode = buildingCodeSyncPrompt.getValue();

        // Verify that a code is selected
        if (Ext.isEmpty(blCode)) {
            Ext.Msg.alert('', 'Select a Building to Sync.');
            return;
        }

        // Set the store restriction
        restriction.fieldName = 'bl_id';
        restriction.operation = 'EQUALS';
        restriction.tableName = 'bl';
        restriction.value = blCode;

        buildingStore.setRestriction(restriction);

        me.performSync(buildingStore)
            .then(function () {
                // Update the number of building records;
                me.updateBuildingCount();
            });
    },

    performSync: function (store) {
        return Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function () {
                SyncManager.startSync();
                return Common.service.Session.start();
            })
            .then(function () {
                return store.deleteAndImportRecords();
            })
            .then(function () {
                SyncManager.endSync();
                return Common.service.Session.end();
            })
            .then(function () {
                return SyncManager.loadStore(store);
            })
            .then(null, function (error) {
                // Handle any errors here
                Ext.Msg.alert('', error);
                SyncManager.endSync(); // End the sync here to insure that the loading mask is hidden
                return Common.service.Session.end();   // End the session here in case the session is still open.
            });

    },

    onDelete: function () {
        var me = this,
            buildingsStore = Ext.getStore('buildingsStore');

        buildingsStore.deleteAllRecordsFromTable('Building')
            .then(function () {
                return SyncManager.loadStore(buildingsStore);
            })
            .then(function () {
                me.updateBuildingCount();
            });
    },

    updateBuildingCount: function () {
        var me = this,
            buildingCountField = me.down('formattednumberfield'),
            buildingStore = Ext.getStore('buildingsStore');

        buildingCountField.setValue(buildingStore.getTotalCount());

    }

});