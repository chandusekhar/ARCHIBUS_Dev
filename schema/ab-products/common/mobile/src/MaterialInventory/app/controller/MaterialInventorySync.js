Ext.define('MaterialInventory.controller.MaterialInventorySync', {
    extend: 'Ext.app.Controller',

    requires: [
        'Common.service.Session',
        'Common.sync.Manager',
        'Floorplan.util.Floorplan'
    ],

    config: {
        refs: {
            siteView: 'materialSitePanel',
            mainView: 'materialMainView',
            actionButtonPicker: 'materialMainView buttonpicker[itemId=actionPicker]',
            siteList: 'materialSiteListPanel'
        },
        control: {
            actionButtonPicker: {
                itemselected: 'onActionPickerItemSelected'
            },
            'toolbarbutton[itemId=syncMaterialButton]': {
                tap: 'onSyncButtonTap'
            },
            progressbarpanel: {
                cancel: function () {
                    Space.SpaceDownload.onCancelProgress();
                },
                complete: function () {
                    Space.SpaceDownload.onCompleteProgress();
                }
            },
            siteList:{
                siteSelected: 'downloadDataForSite'
            }
        },

        loadingMessage: LocaleManager.getLocalizedString('Loading...', 'MaterialInventory.controller.MaterialInventorySync'),
        noDocumentMessage: LocaleManager.getLocalizedString('No document available for selected location.', 'MaterialInventory.controller.MaterialInventorySync'),
        emptySiteMessage: LocaleManager.getLocalizedString('There are no buildings in the selected site.', 'MaterialInventory.controller.MaterialInventorySync')
    },

    init: function () {
        // Stores custodians and editUsers are views on store materialLocations.
        // The loading order is important to avoid errors caused by the SqliteStore when the base table does not exist

        var storesToLoad = [
            'materialLocations',
            'custodians',
            'editUsers',
            'buildingsWithMaterials',
            'floorsWithMaterials',
            'roomsWithMaterials',
            'aislesWithMaterials',
            'cabinetsWithMaterials',
            'shelvesWithMaterials',
            'binsWithMaterials'
        ];

        SyncManager.loadStores(storesToLoad);
    },


    /**
     * Download all sites when the app starts
     * @param {Function} onCompleted Function executed when the download is complete
     * @param {Object} scope The scope to execute the onCompleted function
     */
    downloadSites: function (onCompleted, scope) {
        var me = this,
            onFinished = function () {
                Common.service.Session.end();
                Mask.hideLoadingMask();
                Ext.callback(onCompleted, scope || me);
            };

        Mask.displayLoadingMask(me.getLoadingMessage());
        Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    Common.service.Session.start()
                        .then(function () {
                            return MaterialInventory.util.Ui.applyUserGroups();
                        })
                        .then(function () {
                            return SyncManager.downloadValidatingTable('materialSites');
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinished, onFinished);
                } else {
                    Mask.hideLoadingMask();
                    Ext.callback(onCompleted, scope || me);
                }
            }, function (error) {
                Ext.Msg.alert('', error);
                Mask.hideLoadingMask();
                Ext.callback(onCompleted, scope || me);
            });
    },

    /**
     * Download data for the selected site.
     - clear validating tables (default behavior implemented in SynchronizationManager.doValidatingSync)
     - download validating tables filtered by site_id
     - first sync material locations because user might have been updated locations before returning to the site list screen (same as tapping the Sync action button)
     - if MaterialLocation table is empty then call the WFR that copies msds_location records for the current site into msds_location_sync table and sets the tier2 field values
     - sync between MaterialLocation and msds_location_sync table.
     - calculate values for flag field has_materials in location tables

     * @param siteId site code
     * @param [onCompleted] function called on complete
     * @param [scope] scope for callbackFn
     */

    downloadDataForSite: function (siteId, onCompleted, scope) {
        var me = this,
            previousSite = MaterialInventory.util.Ui.selectedSite,
            onFinish = function (error) {
                SyncManager.endSync();
                // KB3049013 - Don't open a site that has no building
                if (error === me.getEmptySiteMessage()) {
                    Common.service.Session.end();
                } else {
                    Common.service.Session.end()
                        .then(onCompleted.bind(scope));
                }

            },
            onError = function (error) {
                Ext.Msg.alert('', error);
                return Promise.reject(error);
            };

        Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    Common.service.Session.start()
                        .then(function () {
                            SyncManager.startSync();
                            if (Ext.isEmpty(previousSite)) {
                                return me.downloadDataForNewSite(siteId)
                                    .then(null, onError)
                                    .then(onFinish, onFinish);
                            } else {
                                return me.syncAndRemoveMaterialLocations(siteId)
                                    .then(function () {
                                        return me.downloadDataForNewSite(siteId);
                                    })
                                    .then(null, onError)
                                    .then(onFinish, onFinish);
                            }
                        });
                } else {
                    Ext.Msg.alert('', 'A network connection is not available. The Site data will not be downloaded');
                }
            }, function (error) {
                Ext.Msg.alert('', error);
                Ext.callback(onCompleted, scope || me);
            });
    },

    /**
     * Wraps the Materials.setFlagHasMaterials and Materials.setProductName functions in
     * a Promise object
     * @returns {Promise} A Promise that is resolved when the functions have completed.
     */
    setMaterialFlagAndProductName: function () {
        return new Promise(function (resolve) {
            MaterialInventory.util.Materials.setFlagHasMaterials(function () {
                MaterialInventory.util.Materials.setProductName(resolve);
            });
        });
    },

    copyMaterialLocationDataAndSync: function (siteId) {
        return Workflow.execute('AbRiskMSDS-MsdsMobileService-copyMaterialLocationToSyncTable', [ConfigFileManager.username, siteId], Network.SERVICE_TIMEOUT)
            .then(function () {
                return SyncManager.syncTransactionTables(['materialLocations']);
            });
    },


    downloadDataForNewSite: function (siteId) {
        var me = this,
            materialLocations = Ext.getStore('materialLocations');

        MaterialInventory.util.Ui.selectedSite = siteId;

        return me.downloadSiteDrawings(siteId)
            .then(function () {
                return me.downloadValidatingTablesForSite(siteId);
            })
            .then(function () {
                if (materialLocations && materialLocations.getData().length === 0) {
                    return me.copyMaterialLocationDataAndSync(siteId);
                } else {
                    return Promise.resolve();
                }
            })
            .then(function () {
                return me.setMaterialFlagAndProductName();
            })
            .then(function () {
                return SyncManager.loadStore('materialLocations');
            })
            .then(function () {
                SyncManager.endSync();  // End the sync here to close the loading mask
                return me.downloadFloorPlans();
            });
    },

    downloadSiteDrawings: function (siteId) {
        var me = this;

        return me.getSiteDrawingRecords(siteId)
            .then(function (records) {
                if (records.length === 0) {
                    return Promise.resolve();
                } else {
                    return Space.SpaceDownload.getSiteDrawingFromServerWithoutSession(records);
                }
            });
    },

    /**
     * Download validating tables restricted by site_id. Downloads data for stores: materialBuildings, materialFloors,
     * materialRooms, materialAisles, materialCabinets, materialShelves, materialBins restricted by site code and for store planTypes.
     * @param {String} siteId site code
     * @return {Promise} A promise that is resolved to true when the sync is completed.
     */
    downloadValidatingTablesForSite: function (siteId) {
        var me = this,
            buildingsStore = Ext.getStore('materialBuildings'),
            storesAndTablesList = [
                {store: 'materialFloors', table: 'fl'},
                {store: 'materialRooms', table: 'rm'},
                {store: 'materialAisles', table: 'aisle'},
                {store: 'materialCabinets', table: 'cabinet'},
                {store: 'materialShelves', table: 'shelf'},
                {store: 'materialBins', table: 'bin'},
                {store: 'materialEmployees', table: 'em'}
            ],
            validatingStoreNames = Ext.Array.clone(MaterialInventory.util.Materials.locationStoreNames);

        // buildings are downloaded before other location stores
        validatingStoreNames = Ext.Array.remove(validatingStoreNames, 'materialBuildings');

        validatingStoreNames.push('materialEmployees');

        validatingStoreNames.push('planTypes');
        validatingStoreNames.push('planTypeGroups');
        validatingStoreNames.push('materialData');

        // msds_chemical and msds_constituent tables are user to determine tier2 for new records
        validatingStoreNames.push('materialChemicals');
        validatingStoreNames.push('materialConstituents');

        validatingStoreNames.push('containerCategories');
        validatingStoreNames.push('containerTypes');
        validatingStoreNames.push('materialUnits');
        validatingStoreNames.push('pressureUnits');
        validatingStoreNames.push('publishDates');

        buildingsStore.setRestriction({
            tableName: 'bl',
            fieldName: 'site_id',
            operation: 'EQUALS',
            value: siteId
        });

        return SyncManager.downloadValidatingTable('materialBuildings')
            .then(function () {
                return SyncManager.loadStore('materialBuildings');
            })
            .then(function () {
                var numberOfBuildings = Ext.getStore('materialBuildings').getTotalCount();
                if (numberOfBuildings === 0) {
                    return Promise.reject(me.getEmptySiteMessage());
                } else {
                    return me.applyBlRestriction(storesAndTablesList)
                        .then(function () {
                            return SyncManager.downloadValidatingTables(validatingStoreNames);
                        })
                        .then(function () {
                            return SyncManager.loadStores(validatingStoreNames.concat(['tier2Values', 'materialPlanTypes', 'custodianEmployees']));
                        });
                }
            });


    },

    applyBlRestriction: function (storesAndTablesList) {
        return new Promise(function (resolve) {
            var store,
                storeServerTable,
                buildingsStore = Ext.getStore('materialBuildings'),
                buildings = [],
                restriction,
                i, j;

            buildingsStore.retrieveAllStoreRecords(null, function (buildingRecords) {
                buildings = Ext.Array.pluck(Ext.Array.pluck(buildingRecords, 'data'), 'bl_id');

                for (i = 0; i < storesAndTablesList.length; i++) {
                    store = Ext.getStore(storesAndTablesList[i].store);
                    storeServerTable = storesAndTablesList[i].table;
                    restriction = [];

                    for (j = 0; j < buildings.length; j++) {
                        restriction.push({
                            tableName: storeServerTable,
                            fieldName: 'bl_id',
                            operation: 'EQUALS',
                            value: buildings[j],
                            relativeOperation: 'OR'
                        });
                    }
                    store.setRestriction(restriction);
                }

                resolve();
            }, this);
        });

    },

    getSiteDrawingRecords: function (siteId) {
        return new Promise(function (resolve, reject) {
            var db = SqliteConnectionManager.getConnection(),
                sql = Ext.String.format('SELECT site_id,detail_dwg FROM MaterialSite WHERE detail_dwg IS NOT NULL AND site_id=\'{0}\'', siteId);

            db.transaction(function (tx) {
                tx.executeSql(sql, null, function (tx, result) {
                    var ln = result.rows.length,
                        detailDrawings = [];

                    if (ln > 0) {
                        detailDrawings.push({
                            site_id: result.rows.item(0).site_id,
                            detail_dwg: result.rows.item(0).detail_dwg
                        });
                    }
                    resolve(detailDrawings);
                }, function (tx, error) {
                    reject(error.message);
                });
            });
        });
    },


    downloadFloorPlans: function () {
        var me = this,
            numberOfFloors,
            floorCodesToDownload,
            planTypes = MaterialInventory.util.Ui.getPlanTypes(),
            noActivePlanTypesMessage = LocaleManager.getLocalizedString('No active plan types found.', 'MaterialInventorySync');

        return new Promise(function (resolve, reject) {
            if (planTypes.length === 0) {
                reject(noActivePlanTypesMessage);
            } else {
                me.getFloorCodes()
                    .then(function (floorCodes) {
                        floorCodesToDownload = floorCodes;
                        numberOfFloors = floorCodes.length;

                        if (numberOfFloors === 0) {
                            resolve();
                        } else {
                            return Space.SpaceDownload.checkFloorPlanDownloadLimitAndContinue(numberOfFloors);
                        }
                    })
                    .then(function (continueDownload) {
                        if (continueDownload) {
                            Space.SpaceDownload.displayProgressBar(numberOfFloors);
                            return Floorplan.util.Floorplan.getDrawingsForFloors(floorCodesToDownload, planTypes, Space.SpaceDownload.updateProgressBar);
                        } else {
                            resolve();
                        }
                    })
                    .then(function (numberOfFloorPlansDownloaded) {
                        var noFloorsMessage = LocaleManager.getLocalizedString('No floors available.', 'MaterialInventory.controller.MaterialInventorySync'),
                            noFloorPlansMessage = LocaleManager.getLocalizedString('No floor plans available.', 'MaterialInventory.controller.MaterialInventorySync'),
                            floorPlanMessage = Ext.String.format(Space.SpaceDownload.numberOfFloorPlansDownloadedMessage, numberOfFloorPlansDownloaded, numberOfFloors);

                        if (numberOfFloorPlansDownloaded && numberOfFloorPlansDownloaded !== 0) {
                            Ext.Msg.alert('', floorPlanMessage);
                            MaterialInventory.util.Ui.floorPlanNeedsReload = true;
                        } else {
                            if (numberOfFloors === 0) {
                                Ext.Msg.alert('', noFloorsMessage);
                            } else {
                                Ext.Msg.alert('', noFloorPlansMessage);
                            }
                        }

                        resolve();
                    }, function () {
                        var incompleteDownloadMessage = LocaleManager.getLocalizedString('Not all floor plans were downloaded.', 'MaterialInventory.controller.MaterialInventorySync');
                        reject(incompleteDownloadMessage);
                        Floorplan.util.Floorplan.isDownloadCancelled = false;
                    });
            }
        });
    },

    /**
     * Retrieves the floor codes for the MaterialFloors store
     * @private
     * @returns {Promise} A Promise that resolves to an array of floorCode objects
     */
    getFloorCodes: function () {
        var me = this,
            floorsStore = Ext.getStore('materialFloors'),
            floorCodes;

        return floorsStore.retrieveAllRecords([])
            .then(function (records) {
                floorCodes = Ext.Array.map(records, function (record) {
                    return {
                        bl_id: record.get('bl_id'),
                        fl_id: record.get('fl_id')
                    };
                }, me);
                return Promise.resolve(floorCodes);
            });
    },

    syncMaterialLocations: function (siteId) {
        return SyncManager.syncTransactionTables(['materialLocations'])
            .then(function () {
                return Workflow.execute('AbRiskMSDS-MsdsMobileService-updateMaterialLocationFromSyncTable', [ConfigFileManager.username, siteId], Network.SERVICE_TIMEOUT);
            })
            .then(function () {
                return Workflow.execute('AbRiskMSDS-MsdsMobileService-copyMaterialLocationToSyncTable', [ConfigFileManager.username, siteId], Network.SERVICE_TIMEOUT);
            })
            .then(function () {
                return SyncManager.syncTransactionTables(['materialLocations']);
            });
    },


    syncAndRemoveMaterialLocations: function (siteId) {
        return SyncManager.syncTransactionTables(['materialLocations'])
            .then(function () {
                return Workflow.execute('AbRiskMSDS-MsdsMobileService-updateMaterialLocationFromSyncTable', [ConfigFileManager.username, siteId], Network.SERVICE_TIMEOUT);
            })
            .then(function () {
                return Workflow.execute('AbRiskMSDS-MsdsMobileService-removeMaterialLocationFromSyncRecords', [ConfigFileManager.username, siteId], Network.SERVICE_TIMEOUT);
            })
            .then(function () {
                Ext.getStore('materialLocations').removeAll();
                return SyncManager.syncTransactionTables(['materialLocations']);
            });
    },

    /**
     * @private
     * @returns {Promise}
     */
    applyMaterialLocationFilters: function () {
        return new Promise(function (resolve) {
            MaterialInventory.util.Filter.applyMaterialLocationFilters(resolve);
        });
    },

    setProductName: function () {
        return new Promise(function (resolve) {
            MaterialInventory.util.Materials.setProductName(resolve);
        });
    },

    onSyncButtonTap: function () {
        var me = this,
            syncMessage = LocaleManager.getLocalizedString('Sync Material Locations', 'MaterialInventory.controller.MaterialInventorySync'),
            onFinish = function () {
                SyncManager.endSync();  // Call endSync here to insure that the loading mask is cleared
                Common.service.Session.end();
            };

        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    Mask.setLoadingMessage(syncMessage);
                    Common.service.Session.start()
                        .then(function () {
                            SyncManager.startSync();
                            return me.syncMaterialLocations(MaterialInventory.util.Ui.selectedSite);
                        })
                        .then(function () {
                            return me.setProductName();
                        })
                        .then(function () {
                            return me.applyMaterialLocationFilters();
                        })
                        .then(function () {
                            SyncManager.endSync();
                            return me.downloadFloorPlans();
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                }

            }, function (error) {
                Ext.Msg.alert('', error);
            });
    },


    /**
     * Builds the restriction to be applied to the Material MSDS documents store
     * @private
     * @param {Common.data.Model[]} materialLocationRecords Material Location records
     * @returns {Object[]} restriction objects
     */
    buildMsdsDocumentRestriction: function (materialLocationRecords) {
        var restriction = [],
            msdsIds,
            uniqueMsdsIds;

        msdsIds = materialLocationRecords.map(function (record) {
            return record.get('msds_id');
        });

        uniqueMsdsIds = Ext.Array.unique(msdsIds);

        // Get the msds_id's
        Ext.each(uniqueMsdsIds, function (id) {
            restriction.push({
                tableName: 'msds_data',
                fieldName: 'msds_id',
                operation: 'EQUALS',
                value: id,
                relativeOperation: 'OR'
            });
        });

        return restriction;
    },

    /**
     * Downloads all MSDS documents for the provided location level
     * @param {String} level The location level.
     * Valid levels are:
     *  - site: download all documents for the site
     *  - bl: download all documents for the building
     *  - fl: download all documents for the floor
     *  - rm: download all documents for the room
     *  - aisle: download all documents for the aisle
     *  - cabinet: download all documents for the cabinet
     *  - shelf: download all documents for the shelf
     *  @param [callbackFn] callback function
     *  @param [scope] scope for callback function
     */
    downloadDocuments: function (level, callbackFn, scope) {
        var me = this,
            onCompleted = function () {
                Ext.callback(callbackFn, scope || me);
            };

        me.doDownloadDocuments(level)
            .then(onCompleted, onCompleted);
    },

    /**
     * Executes the document download
     * @private
     * @param {String} level
     * @returns {Promise} A Promise that is resolved when the document download is complete
     */
    doDownloadDocuments: function (level) {
        var me = this,
            filterArray,
            materialMsdsStore = Ext.getStore('materialMsds'),
            materialLocationsStore = Ext.getStore('materialLocations'),
            endDocumentDownload = function () {
                SyncManager.endSync();
                return Common.service.Session.end();
            };

        return Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    filterArray = me.getDownloadDocumentFilters(level);
                    materialLocationsStore.retrieveAllRecords(filterArray)
                        .then(function (records) {
                            if (records.length === 0) {
                                return Promise.reject(me.getNoDocumentMessage());
                            } else {
                                materialMsdsStore.setRestriction(me.buildMsdsDocumentRestriction(records));
                                return Common.service.Session.start();
                            }
                        })
                        .then(function () {
                            SyncManager.startSync();
                            return SyncManager.downloadValidatingTable(materialMsdsStore);
                        })
                        .then(endDocumentDownload, function (error) {
                            Ext.Msg.alert('', error);
                            endDocumentDownload();
                        });
                } else {
                    return Promise.resolve();
                }
            });
    },

    getDownloadDocumentFilters: function (level) {
        var filterArray = [],
            currentView = this.getMainView().getNavigationBar().getCurrentView(),
            record = currentView.getRecord();

        if (!record && Ext.isFunction(currentView.getParentRecord)) {
            record = currentView.getParentRecord();
        }

        switch (level) {
            case 'site':
                filterArray.push(MaterialInventory.util.Filter.createFilter('site_id', MaterialInventory.util.Ui.selectedSite));
                break;
            case 'bl':
                filterArray.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                break;
            case 'fl':
                filterArray.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                break;
            case 'rm':
                filterArray.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                break;
            case 'aisle':
                filterArray.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('aisle_id', record.get('aisle_id')));
                break;
            case 'cabinet':
                filterArray.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('aisle_id', record.get('aisle_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('cabinet_id', record.get('cabinet_id')));
                break;
            case 'shelf':
                filterArray.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('aisle_id', record.get('aisle_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('cabinet_id', record.get('cabinet_id')));
                filterArray.push(MaterialInventory.util.Filter.createFilter('shelf_id', record.get('shelf_id')));
                break;
        }

        return filterArray;
    },

    onActionPickerItemSelected: function () {
        var currentView = this.getMainView().getNavigationBar().getCurrentView();

        switch (currentView.xtype) {
            case 'materialSitePanel':
                this.downloadDocuments('site');
                break;
            case 'materialFloorsListPanel':
                this.downloadDocuments('bl');
                break;
            case 'materialFloorPlanPanel':
                this.downloadDocuments('fl');
                break;
            case 'aisleslist':
                this.downloadDocuments('rm');
                break;
            case 'cabinetslist':
                this.downloadDocuments('aisle');
                break;
            case 'shelveslist':
                this.downloadDocuments('cabinet');
                break;
            case 'binslist':
                this.downloadDocuments('shelf');
                break;
        }
    }
});