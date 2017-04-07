Ext.define('AssetReceipt.controller.AssetReceiptSync', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.sync.Manager'
    ],

    config: {
        refs: {
            mainView: 'assetReceiptMain',
            backgroundDataFilterPanel: 'backgroundDataFilter',
            optionsPanel: 'optionsPanel'
        },

        control: {
            'button[action=downloadBackgroundData]': {
                tap: 'downloadBackgroundData'
            },
            'button[action=syncAssets]': {
                tap: 'onSyncAssets'
            },
            'button[action=completeAssets]': {
                tap: 'onCompleteAssets'
            }
        },

        errorTitle: LocaleManager.getLocalizedString('Error', 'AssetReceipt.controller.AssetReceiptSync'),
        wfrErrorMsg: LocaleManager.getLocalizedString('An error occured while executing the workflow rule.', 'AssetReceipt.controller.AssetReceiptSync'),
        notAllRecordsSaveMsg: LocaleManager.getLocalizedString('Not all records were saved because other assets with the same codes already exist in the inventory.', 'AssetReceipt.controller.AssetReceiptSync')
    },

    downloadInitialBackgroundData: function (onCompleted, scope) {
        var me = this,
            validatingStoreNames = ['assetReceiptFloors', 'assetReceiptRooms', 'assetReceiptEmployees'],
            onFinish = function () {
                SyncManager.endSync();
                Common.service.Session.end()
                    .then(function () {
                            Ext.callback(onCompleted, scope || me);
                        },
                        function () {
                            Ext.callback(onCompleted, scope || me);
                        });
            };

        if (SyncManager.syncIsActive) {
            return;
        }

        Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    Common.service.Session.start()
                        .then(function () {
                            SyncManager.startSync();
                            return SyncManager.downloadValidatingTables(['sitesStore', 'buildingsStore']);
                        })
                        .then(function () {
                            return SyncManager.loadStores(['sitesStore', 'buildingsStore']);
                        })
                        .then(function () {
                            return SyncManager.initializeTableForStore('assetReceiptEquipment');
                        })
                        .then(function () {
                            return SyncManager.loadStores(validatingStoreNames);
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                } else {
                    Ext.callback(onCompleted, scope || me);
                }

            }, function () {
                Ext.callback(onCompleted, scope || me);
            });
    },

    downloadBackgroundData: function () {
        var me = this,
            filterPanel = me.getBackgroundDataFilterPanel(),
            siteField = filterPanel.down('sitePrompt'),
            blField = filterPanel.down('buildingPrompt'),
            siteId,
            blId,
            location,
            onFinish = function () {
                SyncManager.endSync();
                Common.service.Session.end();
            };

        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    if (siteField) {
                        siteId = siteField.getValue();
                    }

                    if (blField) {
                        blId = blField.getValue();
                    }
                    return AssetReceiptFilter.validateBackgroundDataFilter(siteId, blId);
                } else {
                    return Promise.reject();
                }

            })
            .then(function () {
                return Common.service.Session.start();
            })
            .then(function () {
                location = {
                    site_id: siteId,
                    bl_id: blId
                };
                AssetReceiptData.addLocation(location);
                SyncManager.startSync();
                return me.filterDownloadBackgroundData();
            })
            .then(function () {
                me.getMainView().pop();
                me.getOptionsPanel().showHideButtons();
                return Promise.resolve();
            })
            .then(null, function (error) {
                if (error) {
                    Ext.Msg.alert('', error);
                }
                return Promise.reject();
            })
            .done(onFinish, onFinish);
    },

    filterDownloadBackgroundData: function () {
        var me = this,
            locations = Ext.Array.clone(AssetReceiptData.getCurrentLocations()),
            validatingStoreNames = ['assetReceiptFloors', 'assetReceiptRooms', 'assetReceiptEmployees'],
            storesAndTablesList = [
                {store: 'assetReceiptFloors', table: 'fl'},
                {store: 'assetReceiptRooms', table: 'rm'},
                {store: 'assetReceiptEmployees', table: 'em'}
            ];

        return me.generateStoreRestrictions(storesAndTablesList, locations)
            .then(function (restrictions) {
                me.setStoresRestrictions(storesAndTablesList, restrictions);
            })
            .then(function () {
                return SyncManager.downloadValidatingTables(validatingStoreNames);
            })
            .then(function () {
                return SyncManager.initializeTableForStore('assetReceiptEquipment');
            })
            .then(function () {
                return SyncManager.loadStores(validatingStoreNames);
            })
            .then(function () {
                return Workflow.execute('AbAssetManagement-AssetReceiptMobileService-copyEqStdToSyncTable', [ConfigFileManager.username]);
            })
            .then(function () {
                return SyncManager.syncTransactionTables(['equipmentStandardsSyncStore']);
            })
            .then(function () {
                return Common.promise.util.TableDef.getTableDefFromServer('eqstd_sync');
            })
            .then(function () {
                return SyncManager.loadStores(['assetReceiptFloorPrompt', 'assetReceiptRoomPrompt', 'assetReceiptDivisions', 'assetReceiptDepartments', 'equipmentStandardsSyncStore']);
            });

    },

    generateStoreRestrictions: function (storesAndTablesList, locations) {
        var me = this,
            restrictions = [];

        var buildRestrictions = function () {
            var p = Promise.resolve();
            locations.forEach(function (location) {
                var siteId,
                    blId;

                p = p.then(function () {
                    siteId = location.site_id;
                    blId = location.bl_id;
                    if (Ext.isEmpty(blId)) {
                        return me.setBuildingRestrictions(siteId)
                            .then(function (buildingRestrictions) {
                                restrictions = restrictions.concat(buildingRestrictions);
                                return Promise.resolve(restrictions);
                            });
                    } else {
                        restrictions.push({
                            tableName: '',
                            fieldName: 'bl_id',
                            operation: 'EQUALS',
                            value: blId,
                            relativeOperation: 'OR'
                        });
                        return Promise.resolve(restrictions);
                    }
                });

            });
            return p;
        };

        return buildRestrictions();

    },

    setBuildingRestrictions: function (siteId) {
        var buildingStore = Ext.getStore('buildingsStore'),
            siteFilter = AssetReceiptFilter.createFilter('site_id', siteId),
            restrictions = [];

        return buildingStore.retrieveAllRecords(siteFilter)
            .then(function (records) {
                Ext.each(records, function (record) {
                    restrictions.push({
                        tableName: '',
                        fieldName: 'bl_id',
                        operation: 'EQUALS',
                        value: record.get('bl_id'),
                        relativeOperation: 'OR'
                    });
                });
                return Promise.resolve(restrictions);

            });
    },

    setStoresRestrictions: function (storesAndTablesList, restrictions) {
        var store,
            finalRestrictions,
            i;

        for (i = 0; i < storesAndTablesList.length; i++) {
            store = Ext.getStore(storesAndTablesList[i].store);
            finalRestrictions = this.setRestrictionsTableName(restrictions, storesAndTablesList[i].table);
            store.setRestriction(finalRestrictions);
        }
    },

    setRestrictionsTableName: function (restrictions, tableName) {
        var restrictionsClone = Ext.clone(restrictions),
            i;

        for (i = 0; i < restrictionsClone.length; i++) {
            restrictionsClone[i].tableName = tableName;
        }

        return restrictionsClone;
    },

    syncAssets: function () {
        var onFinish = function () {
            SyncManager.endSync();
            Common.service.Session.end();
        };

        if (SyncManager.syncIsActive) {
            return;
        }

        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.startSync();
                    return Common.service.Session.start()
                        .then(function () {
                            return SyncManager.syncTransactionTables(['assetReceiptEquipment', 'equipmentStandardsSyncStore']);
                        })
                        .then(function () {
                            return SyncManager.loadStores(['assetReceiptEquipment', 'equipmentStandardsSyncStore']);
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                }

            });
    },

    completeAssets: function () {
        var me = this,
            eqStore = Ext.getStore('assetReceiptEquipment'),
            eqstdStore = Ext.getStore('equipmentStandardsSyncStore'),
            onFinish = function () {
                SyncManager.endSync();
                Common.service.Session.end();
            };

        if (SyncManager.syncIsActive) {
            return;
        }

        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    SyncManager.startSync();
                    return Common.service.Session.start()
                        .then(function () {
                            return SyncManager.uploadModifiedRecords('equipmentStandardsSyncStore');
                        })
                        .then(function () {
                            return Workflow.execute('AbAssetManagement-AssetReceiptMobileService-saveNewEquipmentStandards', [ConfigFileManager.username]);
                        })
                        .then(function () {
                            eqstdStore.removeAll();
                            SyncManager.downloadTransactionRecords('equipmentStandardsSyncStore');
                        })
                        .then(function () {
                            return SyncManager.uploadModifiedRecords('assetReceiptEquipment');
                        })
                        .then(function () {
                            return Workflow.execute('AbAssetManagement-AssetReceiptMobileService-completeReceiptEq', [ConfigFileManager.username]);
                        })
                        .then(function (result) {
                            if (!result.value) {
                                Ext.Msg.alert(me.getErrorTitle(), me.getNotAllRecordsSaveMsg());
                            }
                        })
                        .then(function () {
                            eqStore.removeAll();
                            SyncManager.downloadTransactionRecords('assetReceiptEquipment');
                        })
                        .then(function () {
                            return SyncManager.loadStores(['assetReceiptEquipment','equipmentStandardsSyncStore']);
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                }
            });
    },


    /**
     * Prevents multiple fast taps from triggering simutaneous sync actions.
     */
    onCompleteAssets: (function () {
        var isTapped = false;
        return function () {
            if (!isTapped) {
                isTapped = true;
                this.completeAssets();
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })(),

    onSyncAssets: (function () {
        var isTapped = false;
        return function () {
            if (!isTapped) {
                isTapped = true;
                this.syncAssets();
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })()
});