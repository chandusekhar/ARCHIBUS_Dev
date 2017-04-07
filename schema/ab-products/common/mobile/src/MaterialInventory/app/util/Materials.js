Ext.define('MaterialInventory.util.Materials', {
    singleton: true,

    locationStoreNames: ['materialBuildings', 'materialFloors', 'materialRooms', 'materialAisles', 'materialCabinets', 'materialShelves', 'materialBins'],

    setProductName: function (callbackFn) {
        var db = SqliteConnectionManager.getConnection(),
            sql = 'UPDATE MaterialLocation SET product_name =(SELECT product_name FROM MaterialData where MaterialLocation.msds_id = MaterialData.msds_id), ' +
                'manufacturer_id = (SELECT manufacturer_id FROM MaterialData WHERE MaterialLocation.msds_id = MaterialData.msds_id)',
            onError = function (error) {
                throw new Error(error.message);
            };

        db.transaction(function (tx) {
            tx.executeSql(sql, null, callbackFn, onError);
        });
    },

    setFlagHasMaterials: function (callbackFn, scope) {
        var me = this;

        me.setFlagForLocationLevel('bl')
            .then(function () {
                me.setFlagForLocationLevel('fl')
                    .then(function () {
                        me.setFlagForLocationLevel('rm')
                            .then(function () {
                                me.setFlagForLocationLevel('aisle')
                                    .then(function () {
                                        me.setFlagForLocationLevel('cabinet')
                                            .then(function () {
                                                me.setFlagForLocationLevel('shelf')
                                                    .then(function () {
                                                        me.setFlagForLocationLevel('bin')
                                                            .then(function () {
                                                                Ext.callback(callbackFn, scope || me);
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    },

    setFlagForLocationLevel: function (level) {
        var me = this,
            i,
            filters = [],
            store = me.getStoreForLevel(level),
            isPagingDisabled = store.getDisablePaging(),
            currentFilters = store.getFilters();

        return me.getLocationsWithMaterials(level)
            .then(function (records) {
                if (records.length === 0) {
                    return MaterialInventory.util.Materials.setFlagDoneInventoryDate(level);
                }

                for (i = 0; i < records.length; i++) {
                    filters.push(MaterialInventory.util.Filter.createSubFiltersForLevel(level, records[i]));
                }

                store.setFilters(filters);
                store.setDisablePaging(true);

                return SyncManager.loadStore(store)
                    .then(function (records) {
                        return new Promise(function (resolve) {
                            for (i = 0; i < records.length; i++) {
                                records[i].set('has_materials', 1);
                            }

                            store.sync(function () {
                                store.setFilters(currentFilters);
                                store.setDisablePaging(isPagingDisabled);
                                resolve();
                            }, me);
                        });
                    })

                    .then(function () {
                        return SyncManager.loadStore(store);
                    })
                    .then(function () {
                        return MaterialInventory.util.Materials.setFlagDoneInventoryDate(level);
                    });
            });
    },

    getLocationsWithMaterials: function (level) {
        var me = this,
            store = me.getLocationWithMaterialsStoreForLevel(level);

        return store.retrieveAllRecords([]);
    },

    getStoreIndexForLocationLevel: function (store, level, sourceRecord) {
        var result;
        return store.findBy(function (record) {
            result = false;
            switch (level) {
                case 'bl':
                    result = record.get('bl_id') === sourceRecord.get('bl_id');
                    break;
                case 'fl':
                    result = record.get('bl_id') === sourceRecord.get('bl_id') && record.get('fl_id') === sourceRecord.get('fl_id');
                    break;
                case 'rm':
                    result = record.get('bl_id') === sourceRecord.get('bl_id') && record.get('fl_id') === sourceRecord.get('fl_id') &&
                        record.get('rm_id') === sourceRecord.get('rm_id');
                    break;
                case 'aisle':
                    result = record.get('bl_id') === sourceRecord.get('bl_id') && record.get('fl_id') === sourceRecord.get('fl_id') &&
                        record.get('rm_id') === sourceRecord.get('rm_id') && record.get('aisle_id') === sourceRecord.get('aisle_id');
                    break;
                case 'cabinet':
                    result = record.get('bl_id') === sourceRecord.get('bl_id') && record.get('fl_id') === sourceRecord.get('fl_id') &&
                        record.get('rm_id') === sourceRecord.get('rm_id') && record.get('aisle_id') === sourceRecord.get('aisle_id') &&
                        record.get('cabinet_id') === sourceRecord.get('cabinet_id');
                    break;
                case 'shelf':
                    result = record.get('bl_id') === sourceRecord.get('bl_id') && record.get('fl_id') === sourceRecord.get('fl_id') &&
                        record.get('rm_id') === sourceRecord.get('rm_id') && record.get('aisle_id') === sourceRecord.get('aisle_id') &&
                        record.get('cabinet_id') === sourceRecord.get('cabinet_id') && record.get('shelf_id') === sourceRecord.get('shelf_id');
                    break;
                case 'bin':
                    result = record.get('bl_id') === sourceRecord.get('bl_id') && record.get('fl_id') === sourceRecord.get('fl_id') &&
                        record.get('rm_id') === sourceRecord.get('rm_id') && record.get('aisle_id') === sourceRecord.get('aisle_id') &&
                        record.get('cabinet_id') === sourceRecord.get('cabinet_id') && record.get('shelf_id') === sourceRecord.get('shelf_id') && record.get('bin_id') === sourceRecord.get('bin_id');
                    break;
            }
            return result;
        });
    },

    /**
     * Valid levels are: bl, fl, rm, aisle, cabinet, shelf, bin
     * @param level
     */
    setFlagDoneInventoryDate: function (level) {
        var me = this,
            store;

        //verify if app is in inventory mode: user has inventory rights and inventory date is set
        if ((!AppMode.isInventoryMode() && !AppMode.isInventoryUpdateMode()) || Ext.isEmpty(AppMode.getInventoryDate())) {
            return new Promise(function (resolve) {
                resolve();
            });
        }

        store = me.getStoreForLevel(level);
        return store.retrieveAllRecords([])
            .then(function (records) {
                return me.setFlagDoneInventoryDateForRecords(level, records);
            });
    },

    setFlagDoneInventoryDateForRecords: function (level, records) {
        var me = this,
            localRecords = Ext.Array.clone(records), // Not sure if this is still required
            numberOfRecordsToProcess = records.length,
            numberOfRecordsProcessed = 0,
            checkComplete = function (resolve) {
                if (numberOfRecordsToProcess === numberOfRecordsProcessed) {
                    resolve();
                }
            };

        return new Promise(function (resolve) {
            // Check if there are records to process
            checkComplete(resolve);

            // We have records so start processing.
            Ext.each(localRecords, function (record) {
                me.setFlagDoneForLevel(level, record, function () {
                    numberOfRecordsProcessed += 1;
                    checkComplete(resolve);
                }, me);
            }, me);
        });
    },

    setFlagDoneForLevel: function (level, levelRecord, callbackFn, scope) {
        var hasMaterialValue = levelRecord.get('has_materials'),
            locationFiltersArray = [];

        // skip records that don't have materials
        if (hasMaterialValue === 1) {
            locationFiltersArray = MaterialInventory.util.Filter.createFiltersForLevel(level, levelRecord);
            //need to call the function with class name since this gets called from different scopes
            MaterialInventory.util.Materials.setFlagDone(levelRecord, locationFiltersArray, callbackFn, scope);
        } else {
            Ext.callback(callbackFn, scope);
        }
    },

    setFlagNotDoneForRecord: function (level, value, locationRecord, callbackFn, scope) {
        var me = this,
            promises = [],
            i,
            levels = ['bl', 'fl', 'rm', 'aisle', 'cabinet', 'shelf', 'bin'];

        me.getLocationRecordForLevelValue(level, value, locationRecord)
            .then(function (levelRecord) {
                for (i = 0; i < levels.length; i++) {
                    promises.push(me.setFlagNotDoneForLevel(levels[i], level === levels[i] ? levelRecord : locationRecord));
                }
                return Promise.all(promises);
            })

            .then(function () {
                //when clearing hierarchy prompt field the level record can't be found because parent value are alreary cleared
                // and need to update the the flag done for all records in the current level
                me.setFlagDoneInventoryDate(level);
            })
            .then(function () {
                Ext.callback(callbackFn, scope || me);
            });
    },

    getLocationRecordForLevelValue: function (level, value, locationRecord) {
        var me = this,
            parentLevel,
            fieldName = level + '_id',
            store,
            locationFiltersArray;

        return new Promise(function (resolve) {
            parentLevel = me.getParentLevel(level);
            if (Ext.isEmpty(locationRecord.get(parentLevel + '_id'))) {
                // on hirerachical prompt fields clear upper levels get cleared before the child level and child location record can't be found
                resolve(null);
            } else {
                store = me.getStoreForLevel(level);
                locationFiltersArray = MaterialInventory.util.Filter.createFiltersForLevel(parentLevel, locationRecord);
                locationFiltersArray.push(MaterialInventory.util.Filter.createFilter(fieldName, value));
                store.retrieveAllRecords(locationFiltersArray)
                    .then(function (records) {
                        if (records.length > 0) {
                            resolve(records[0]);
                        } else {
                            resolve(null);
                        }
                    });
            }
        });
    },

    setFlagNotDoneForLevel: function (level, levelRecord) {
        var me = this,
            locationFiltersArray,
            locationStore;

        return new Promise(function (resolve) {
            if (levelRecord && !Ext.isEmpty(levelRecord.get(level + '_id'))) {
                locationFiltersArray = MaterialInventory.util.Filter.createFiltersForLevel(level, levelRecord);
                locationStore = me.getStoreForLevel(level);
                locationStore.retrieveAllRecords(locationFiltersArray)
                    .then(function (locationRecords) {
                        if (locationRecords.length > 0) {
                            locationRecords[0].set({'done_inventory_date': null});
                            locationStore.sync(function () {
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    });
            } else {
                resolve();
            }
        });

    },

    /**
     * Verify if all materials in a specific location are done, which means they have date_last_inv value  the same as the inventory date selected by user.
     * If all materials in a location were inventoried then the flag done_inventory_date will have the value of the inventory date and those records will be highlighted in location lists.
     * @param locationRecord building, floor, room, aisle, cabinet, shelf, bin record for which the flag is calculated
     * @param locationFilterArray location filter for searched material locations
     * @param [callbackFn] function to execute on complete
     * @param [scope] scope for callbackFn
     */
    setFlagDone: function (locationRecord, locationFilterArray, callbackFn, scope) {
        var me = this,
            materialLocationsStore = Ext.getStore('materialLocations'),
            inventoryDate = AppMode.getInventoryDate(),
            done,
            locationStore,
            i,
            dateLastInv;

        materialLocationsStore.suspendEvents();
        materialLocationsStore.retrieveAllStoreRecords(locationFilterArray, function (materialLocationsRecords) {
            materialLocationsStore.resumeEvents(false);
            done = materialLocationsRecords.length !== 0;

            for (i = 0; i < materialLocationsRecords.length; i++) {
                dateLastInv = materialLocationsRecords[i].get('date_last_inv');
                if (Ext.isEmpty(dateLastInv) || Ext.isEmpty(inventoryDate) || dateLastInv.getTime() < inventoryDate.getTime()) {
                    done = false;
                    break;
                }
            }

            if (done) {
                locationStore = me.getLocationStoreForRecord(locationRecord);
                locationRecord.setProxy(locationStore.getProxy());
                locationRecord.set({'done_inventory_date': inventoryDate});
                locationRecord.save(callbackFn, scope);
            } else if (!Ext.isEmpty(locationRecord.get('done_inventory_date'))) {
                locationStore = me.getLocationStoreForRecord(locationRecord);
                locationRecord.setProxy(locationStore.getProxy());
                locationRecord.set({'done_inventory_date': null});
                locationRecord.save(callbackFn, scope);
            } else {
                Ext.callback(callbackFn, scope);
            }

        }, this);
    },

    getLocationStoreForRecord: function (record) {
        if (record instanceof MaterialInventory.model.space.MaterialBuilding) {
            return Ext.getStore('materialBuildings');
        }
        if (record instanceof MaterialInventory.model.space.MaterialFloor) {
            return Ext.getStore('materialFloors');
        }
        if (record instanceof MaterialInventory.model.space.MaterialRoom) {
            return Ext.getStore('materialRooms');
        }
        if (record instanceof MaterialInventory.model.space.MaterialAisle) {
            return Ext.getStore('materialAisles');
        }
        if (record instanceof MaterialInventory.model.space.MaterialCabinet) {
            return Ext.getStore('materialCabinets');
        }
        if (record instanceof MaterialInventory.model.space.MaterialShelf) {
            return Ext.getStore('materialShelves');
        }
        if (record instanceof MaterialInventory.model.space.MaterialBin) {
            return Ext.getStore('materialBins');
        }
    },

    updateFlagDoneInventoryDateForRecord: function (materialLocationRecord, callbackFn, scope) {
        var me = this;

        me.setFlagDoneForLocation('bl', materialLocationRecord)
            .then(function () {
                me.setFlagDoneForLocation('fl', materialLocationRecord)
                    .then(function () {
                        me.setFlagDoneForLocation('rm', materialLocationRecord)
                            .then(function () {
                                me.setFlagDoneForLocation('aisle', materialLocationRecord)
                                    .then(function () {
                                        me.setFlagDoneForLocation('cabinet', materialLocationRecord)
                                            .then(function () {
                                                me.setFlagDoneForLocation('shelf', materialLocationRecord)
                                                    .then(function () {
                                                        me.setFlagDoneForLocation('bin', materialLocationRecord)
                                                            .then(function () {
                                                                Ext.callback(callbackFn, scope || me);
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    },

    updateAllFlagsDoneInventoryDate: function (callbackFn, scope) {
        var me = this;

        MaterialInventory.util.Materials.setFlagDoneInventoryDate('bl')
            .then(function () {
                MaterialInventory.util.Materials.setFlagDoneInventoryDate('fl')
                    .then(function () {
                        MaterialInventory.util.Materials.setFlagDoneInventoryDate('rm')
                            .then(function () {
                                MaterialInventory.util.Materials.setFlagDoneInventoryDate('aisle')
                                    .then(function () {
                                        MaterialInventory.util.Materials.setFlagDoneInventoryDate('cabinet')
                                            .then(function () {
                                                MaterialInventory.util.Materials.setFlagDoneInventoryDate('shelf')
                                                    .then(function () {
                                                        MaterialInventory.util.Materials.setFlagDoneInventoryDate('bin')
                                                            .then(function () {
                                                                Ext.callback(callbackFn, scope || me);
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    },

    /**
     * Find corresponding location record and call setFlagDoneFn
     * @param level match location table names: bl, fl, rm, aisle, cabinet, shelf, bin
     * @param materialLocationRecord
     * return {Promise}
     */
    setFlagDoneForLocation: function (level, materialLocationRecord) {
        var store,
            filters = [],
            fieldName = level + '_id';

        return new Promise(function (resolve) {
            if (!Ext.isEmpty(materialLocationRecord.get(fieldName))) {
                store = MaterialInventory.util.Materials.getStoreForLevel(level);
                filters = MaterialInventory.util.Filter.createFiltersForLevel(level, materialLocationRecord);
                store.retrieveAllRecords(filters)
                    .then(function (records) {
                        if (records.length > 0) {
                            MaterialInventory.util.Materials.setFlagDoneForLevel(level, records[0], resolve);
                        } else {
                            resolve();
                        }
                    }, this);
            } else {
                resolve();
            }
        });
    },

    setLocationFlags: function (materialLocationRecord, callbackFn, scope) {
        var me = this;

        me.setLocationFlagsForLevel('bl', materialLocationRecord)
            .then(function () {
                me.setLocationFlagsForLevel('fl', materialLocationRecord)
                    .then(function () {
                        me.setLocationFlagsForLevel('rm', materialLocationRecord)
                            .then(function () {
                                me.setLocationFlagsForLevel('aisle', materialLocationRecord)
                                    .then(function () {
                                        me.setLocationFlagsForLevel('cabinet', materialLocationRecord)
                                            .then(function () {
                                                me.setLocationFlagsForLevel('shelf', materialLocationRecord)
                                                    .then(function () {
                                                        me.setLocationFlagsForLevel('bin', materialLocationRecord)
                                                            .then(function () {
                                                                Ext.callback(callbackFn, scope || me);
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    },

    setLocationFlagsForLevel: function (level, materialLocationRecord) {
        var me = this,
            fieldName,
            store,
            locationFiltersArray,
            isInventoryOpen = !Ext.isEmpty(AppMode.getInventoryDate());

        return new Promise(function (resolve) {
            fieldName = level + '_id';
            if (!Ext.isEmpty(materialLocationRecord.get(fieldName))) {
                store = me.getStoreForLevel(level);
                locationFiltersArray = MaterialInventory.util.Filter.createFiltersForLevel(level, materialLocationRecord);
                store.retrieveAllRecords(locationFiltersArray)
                    .then(function (records) {
                        records[0].set('has_materials', 1);
                        store.sync(function () {
                            if (isInventoryOpen) {
                                MaterialInventory.util.Materials.setFlagDoneForLevel(level, records[0], resolve);
                            } else {
                                resolve();
                            }
                        }, me);
                    }, this);
            } else {
                resolve();
            }
        });
    },

    /**
     * Set has_materials = 1 and update date_last_inv for a level record.
     * @param level
     * @param record
     * @param callbackFn
     * @param scope
     */
    setHasMaterialsForLevelRecord: function (level, record, callbackFn, scope) {
        var me = this,
            store;

        store = me.getStoreForLevel(level);
        record.set('has_materials', 1);

        // when location changes the material location record is no longer done and locations need to be marked as not done
        store.sync(callbackFn, scope);
    },

    updateHasMaterialsForLocationRecord: function (materialLocationRecord, callbackFn, scope) {
        var me = this;

        me.updateHasMaterialsForLocationValue('bl_id', materialLocationRecord.get('bl_id'), materialLocationRecord)
            .then(function () {
                me.updateHasMaterialsForLocationValue('fl_id', materialLocationRecord.get('fl_id'), materialLocationRecord)
                    .then(function () {
                        me.updateHasMaterialsForLocationValue('rm_id', materialLocationRecord.get('rm_id'), materialLocationRecord)
                            .then(function () {
                                me.updateHasMaterialsForLocationValue('aisle_id', materialLocationRecord.get('aisle_id'), materialLocationRecord)
                                    .then(function () {
                                        me.updateHasMaterialsForLocationValue('cabinet_id', materialLocationRecord.get('cabinet_id'), materialLocationRecord)
                                            .then(function () {
                                                me.updateHasMaterialsForLocationValue('shelf_id', materialLocationRecord.get('shelf_id'), materialLocationRecord)
                                                    .then(function () {
                                                        me.updateHasMaterialsForLocationValue('bin_id', materialLocationRecord.get('bin_id'), materialLocationRecord)
                                                            .then(function () {
                                                                Ext.callback(callbackFn, scope || me);
                                                            });
                                                    });
                                            });
                                    });
                            });
                    });
            });
    },

    updateHasMaterialsForLocationValue: function (fieldName, fieldValue, locationRecord) {
        var me = this,
            level,
            parentLevel,
            store,
            locationWithMaterialsStore,
            locationFiltersArray;

        return new Promise(function (resolve) {
            level = fieldName.replace('_id', '');
            parentLevel = me.getParentLevel(level);
            store = me.getStoreForLevel(level);
            locationFiltersArray = MaterialInventory.util.Filter.createFiltersForLevel(parentLevel, locationRecord);
            locationFiltersArray.push(MaterialInventory.util.Filter.createFilter(fieldName, fieldValue));
            store.retrieveRecord(locationFiltersArray, function (record) {
                if (record) {
                    locationWithMaterialsStore = me.getLocationWithMaterialsStoreForLevel(level);

                    locationWithMaterialsStore.retrieveAllStoreRecords(locationFiltersArray, function (locationWithMaterialsRecords) {
                        if (locationWithMaterialsRecords && locationWithMaterialsRecords.length > 0) {
                            record.set('has_materials', 1);
                        } else {
                            record.set('has_materials', 0);
                        }
                        store.sync(resolve);
                    });
                } else {
                    Ext.callback(resolve);
                }
            }, this);
        });
    },

    removeLocationFlags: function (materialLocationRecord) {
        var me = this,
            promises = [],
            i,
            levels = ['bl', 'fl', 'rm', 'aisle', 'cabinet', 'shelf', 'bin'];

        for (i = 0; i < levels.length; i++) {
            promises.push(me.removeLocationFlagsForLevel(materialLocationRecord, levels[i]));
        }
        return Promise.all(promises);
    },

    removeLocationFlagsForLevel: function (materialLocationRecord, level) {
        var me = this,
            fieldName,
            store,
            locationFiltersArray;

        return new Promise(function (resolve) {
            fieldName = level + '_id';
            if (!Ext.isEmpty(materialLocationRecord.get(fieldName))) {
                store = me.getStoreForLevel(level);
                locationFiltersArray = MaterialInventory.util.Filter.createFiltersForLevel(level, materialLocationRecord);
                store.retrieveAllRecords(locationFiltersArray)
                    .then(function (records) {
                        if (records.length > 0) {
                            records[0].set('has_materials', 0);
                            records[0].set('done_inventory_date', null);
                        }
                        store.sync(resolve);
                    });
            } else {
                resolve();
            }
        });

    },

    removeLocationFlagsForField: function (fieldName, fieldValue, materialLocationRecord, callbackFn, scope) {
        var me = this,
            level,
            parentLevel,
            store,
            locationFiltersArray;

        level = fieldName.replace('_id', '');
        parentLevel = me.getParentLevel(level);
        store = me.getStoreForLevel(level);
        locationFiltersArray = MaterialInventory.util.Filter.createFiltersForLevel(parentLevel, materialLocationRecord);
        locationFiltersArray.push(MaterialInventory.util.Filter.createFilter(fieldName, fieldValue));
        store.retrieveRecord(locationFiltersArray, function (record) {
            if (record) {
                record.set('has_materials', 0);
                record.set('done_inventory_date', null);
            }
            store.sync(callbackFn, Ext.emptyFn, scope);
        }, this);
    },

    getParentLevel: function (level) {
        var parentLevel;

        switch (level) {
            case 'bl':
                parentLevel = 'site';
                break;
            case 'fl':
                parentLevel = 'bl';
                break;
            case 'rm':
                parentLevel = 'fl';
                break;
            case 'aisle':
                parentLevel = 'rm';
                break;
            case 'cabinet':
                parentLevel = 'aisle';
                break;
            case 'shelf':
                parentLevel = 'cabinet';
                break;
            case 'bin':
                parentLevel = 'shelf';
                break;
        }

        return parentLevel;
    },

    getStoreForLevel: function (level) {
        var store;

        switch (level) {
            case 'bl':
                store = Ext.getStore('materialBuildings');
                break;
            case 'fl':
                store = Ext.getStore('materialFloors');
                break;
            case 'rm':
                store = Ext.getStore('materialRooms');
                break;
            case 'aisle':
                store = Ext.getStore('materialAisles');
                break;
            case 'cabinet':
                store = Ext.getStore('materialCabinets');
                break;
            case 'shelf':
                store = Ext.getStore('materialShelves');
                break;
            case 'bin':
                store = Ext.getStore('materialBins');
                break;
        }

        return store;
    },

    getLocationWithMaterialsStoreForLevel: function (level) {
        var store;

        switch (level) {
            case 'bl':
                store = Ext.getStore('buildingsWithMaterials');
                break;
            case 'fl':
                store = Ext.getStore('floorsWithMaterials');
                break;
            case 'rm':
                store = Ext.getStore('roomsWithMaterials');
                break;
            case 'aisle':
                store = Ext.getStore('aislesWithMaterials');
                break;
            case 'cabinet':
                store = Ext.getStore('cabinetsWithMaterials');
                break;
            case 'shelf':
                store = Ext.getStore('shelvesWithMaterials');
                break;
            case 'bin':
                store = Ext.getStore('binsWithMaterials');
                break;
        }

        return store;
    },

    setTier2Value: function (record, callbackFn, scope) {
        var msdsId = record.get('msds_id'),
            tier2ValuesStore = Ext.getStore('tier2Values'),
            filter = MaterialInventory.util.Filter.createFilter('msds_id', msdsId);

        tier2ValuesStore.retrieveRecord(filter, function (tier2ValueRecord) {
            if (tier2ValueRecord) {
                record.set('tier2', tier2ValueRecord.get('tier2'));
            }
            Ext.callback(callbackFn, scope);
        });
    }
});