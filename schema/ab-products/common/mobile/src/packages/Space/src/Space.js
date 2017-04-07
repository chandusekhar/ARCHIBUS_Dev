/**
 * Utility class to manage operations on Space objects
 *
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Space.Space', {
    singleton: true,

    requires: [
        'Common.view.report.Detail',
        'Space.view.report.Configuration'
    ],

    showLocationDetailView: function (record, viewType) {
        var reportConfig,
            detailView;

        switch (viewType) {
            case 'site':
                reportConfig = Space.view.report.Configuration.getSiteReportConfig();
                reportConfig.title = Ext.String.format('{0} - {1}', record.get('site_id'), record.get('name'));
                break;
            case 'bl':
                reportConfig = Space.view.report.Configuration.getBuildingReportConfig();
                reportConfig.title = Ext.String.format('{0} - {1}', record.get('bl_id'), record.get('name'));
                break;
            case 'fl':
                reportConfig = Space.view.report.Configuration.getFloorReportConfig();
                reportConfig.title = Ext.String.format('{0} - {1}', record.get('blName'), record.get('fl_id'));
                break;
            case 'rm':
                reportConfig = Space.view.report.Configuration.getRoomInfoReportConfig();
                break;
            default:
                reportConfig = {};
                break;
        }

        reportConfig.record = record;
        detailView = Ext.create('Common.view.report.Detail', reportConfig);

        detailView.show();
    },

    /**
     * Set site_id permanent filter on buildings store
     */
    setSitePermanentFilter: function (siteId, storeName, additionalFilter, onLoadComplete, scope) {
        var me = this,
            buildingsStore = Ext.getStore(storeName),
            filterArray = [], filter;

        // Create site Filter
        if (siteId) {
            filter = Ext.create('Common.util.Filter', {
                property: 'site_id',
                value: siteId,
                conjunction: 'AND',
                exactMatch: true
            });
        } else {
            filter = Ext.create('Common.util.Filter', {
                property: 'site_id',
                value: '',
                conjunction: 'AND',
                isEqual: true,
                matchIsNullValue: true
            });
        }

        filterArray.push(filter);

        if (buildingsStore) {
            if (!Ext.isEmpty(additionalFilter)) {
                filterArray = filterArray.concat(additionalFilter);
            }
            buildingsStore.permanentFilter = filterArray;

            buildingsStore.clearFilter();
            buildingsStore.filter(filterArray);
            buildingsStore.load(function () {
                Ext.callback(onLoadComplete, scope || me);
            });
        }
    },

    /**
     * Set bl_id, fl_id and multiple rooms permanent filter on store
     */
    setBuildingFloorAndRoomsPermanentFilter: function (blId, flId, rooms, storeName, callbackFn, scope) {
        var me = this,
            roomsStore = Ext.getStore(storeName),
            filterArray = [],
            subFilterArray = [],
            blFilter, flFilter,
            filter = Ext.create('Common.util.Filter', {
                property: 'dummyProperty',
                value: 'dummyValue',
                conjunction: 'AND',
                exactMatch: true
            });

        //ceate rooms filter
        Ext.each(rooms, function (room) {
            var subFilter = {
                property: 'rm_id',
                value: room.get('rm_id'),
                conjunction: 'OR',
                exactMatch: true
            };
            subFilterArray.push(subFilter);
        }, me);
        if (subFilterArray.length !== 0) {
            filter.setSubFilter(subFilterArray);
            filterArray.push(filter);
        }

        // Create bl Filter
        blFilter = Ext.create('Common.util.Filter', {
            property: 'bl_id',
            value: blId,
            exactMatch: true
        });
        filterArray.push(blFilter);

        // Create fl filter
        flFilter = Ext.create('Common.util.Filter', {
            property: 'fl_id',
            value: flId,
            exactMatch: true
        });

        filterArray.push(flFilter);

        roomsStore.permanentFilter = filterArray;

        roomsStore.clearFilter();
        roomsStore.filter(filterArray);
        roomsStore.load(function () {
            Ext.callback(callbackFn, scope || me);
        });
    },

    /**
     * Set permanent filter for fields on store
     */
    // KB 3045867
    setPermanentFilterForFields: function (fieldNames, fieldValues, storeName, additionalFilter, onLoadComplete, scope) {
        var me = this,
            store = Ext.getStore(storeName),
            filterArray = [],
            filter, i;

        for (i = 0; i < fieldNames.length; i++) {
            filter = Ext.create('Common.util.Filter', {
                property: fieldNames[i],
                value: fieldValues[i],
                exactMatch: true
            });
            filterArray.push(filter);
        }

        if (!Ext.isEmpty(additionalFilter)) {
            filterArray = filterArray.concat(additionalFilter);
        }
        store.permanentFilter = filterArray;

        store.clearFilter();
        store.filter(filterArray);
        store.load(function () {
            Ext.callback(onLoadComplete, scope || me);
        });
    },

    /**
     * Set permanent filter for fields on store
     */
    // KB 3045867
    setPermanentFiltersWithoutLoad: function (fieldNames, fieldValues, storeName, additionalFilter) {
        var store = Ext.getStore(storeName),
            filterArray = [],
            filter, i;

        for (i = 0; i < fieldNames.length; i++) {
            filter = Ext.create('Common.util.Filter', {
                property: fieldNames[i],
                value: fieldValues[i],
                exactMatch: true
            });
            filterArray.push(filter);
        }

        if (!Ext.isEmpty(additionalFilter)) {
            filterArray = filterArray.concat(additionalFilter);
        }
        store.permanentFilter = filterArray;

        store.clearFilter();
        store.setFilters(filterArray);
    },

    /**
     * Search functionality for Sites, Buildings, Floors and others
     */
    onSearch: function (searchField, storeName, filterFields, list, callbackFn, scope) {
        var me = this,
            store = Ext.getStore(storeName),
            filterArray = [],
            value = searchField.getValue();

        // Create Filters
        Ext.each(filterFields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field,
                value: value,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        me.loadSearchStore(store, filterArray, searchField, list, callbackFn, scope);
    },

    /**
     * Search functionality for Scanned searches
     */
    onSearchDecoded: function (scanResult, searchField, storeName, list, callbackFn, scope) {
        var me = this,
            store = Ext.getStore(storeName),
            filterArray,
            barcodeFormat = searchField.getBarcodeFormat();

        filterArray = me.buildDecodedTaskSearchFilters(scanResult, barcodeFormat);

        me.loadSearchStore(store, filterArray, searchField, list, callbackFn, scope);
    },

    loadSearchStore: function (store, filterArray, searchField, list, callbackFn, scope) {
        var me = this,
            loadStore = function () {
                store.clearFilter();
                store.filter(filterArray);
                store.loadPage(1, function (records) {
                    // search field in floor plan view doesn't have name property
                    if (records.length === 0 && searchField.getName && searchField.getName() === 'siteSearch' && list) {
                        list.setEmptyText(list.getNoSitesMessage());
                    }
                    Ext.callback(callbackFn, scope || me);
                }, me);
            };

        if (store.permanentFilter) {
            filterArray = store.permanentFilter.concat(filterArray);
        }

        if (store.isLoading()) {
            setTimeout(function () {
                loadStore();
            }, 500);
        } else {
            loadStore();
        }
    },

    /**
     * Build filters array from scan result object based on barcode format search field configuration.
     * @param scanResult
     * @param barcodeFormat
     * @returns {Array} filters array
     */
    buildDecodedTaskSearchFilters: function (scanResult, barcodeFormat) {
        var fields,
            values,
            filterArray = [],
            subFilterArray = [],
            filter;

        Ext.each(barcodeFormat, function (configObj) {
            fields = configObj.fields;
            values = scanResult.fields;

            if (configObj.hasOwnProperty('useDelimiter') && configObj.useDelimiter) {
                filter = Ext.create('Common.util.Filter', {
                    property: 'dummyProperty',
                    value: 'dummyValue',
                    conjunction: 'OR',
                    exactMatch: false
                });

                Ext.each(fields, function (field) {
                    subFilterArray.push({
                        property: field,
                        value: values[field],
                        // if scanned value was parsed use AND else use OR
                        conjunction: values[field] === scanResult.code ? 'OR' : 'AND'
                    });
                });

                filter.setSubFilter(subFilterArray);
                filterArray.push(filter);

            } else {
                Ext.each(fields, function (field) {
                    filter = Ext.create('Common.util.Filter', {
                        property: field,
                        value: values[field],
                        conjunction: 'OR',
                        anyMatch: true
                    });
                    filterArray.push(filter);
                });
            }
        });
        return filterArray;
    },

    /**
     * Clear search filters functionality for any store.
     */
    onClearSearchFilter: function (storeName) {
        var store = Ext.getStore(storeName);

        if (store) {
            store.clearFilter();
            if (store.permanentFilter) {
                store.filter(store.permanentFilter);
            }
            store.loadPage(1);
        }
    },

    /**
     * Set active the site map toggle button if the map is available,
     * else activate the list button.
     */
    setActiveBlButton: function (scope) {
        var siteListRecord = scope.getSiteList().getRecord(),
            buildingsSegmentedButton = scope.getBuildingsSegmentedButton(),
            activeButton;

        activeButton = siteListRecord.get('detail_dwg') ? 1 : 0;
        if (buildingsSegmentedButton) {
            buildingsSegmentedButton.setPressedButtons(activeButton);
        }
    },

    /**
     * Toggle the Site view between the list and map views.
     */
    onBuildingSegmentedButtonToggled: function (button, isPressed, onCompleted, scope) {
        var buildingList = scope.getBuildingList(),
            siteMap = scope.getSiteMap(),
            itemId = button.getItemId();

        if (isPressed) {
            if (itemId === 'buildingList') {
                siteMap.setHidden(true);
                buildingList.setHidden(false);
            }
            if (itemId === 'siteMap') {
                this.showSiteMap(siteMap, onCompleted, scope);
                siteMap.setHidden(false);
                buildingList.setHidden(true);
                this.showSearchBlHighlight(scope.getSiteView());
            }
        }
    },

    showSearchBlHighlight: function (siteView) {
        var searchField = Ext.ComponentQuery.query('#buildingSearch')[0],
            buildingStoreId = siteView.query('buildingsListPanel')[0].getStore().getStoreId(),
            fieldsToSearch = ['bl_id', 'name', 'address1', 'address2', 'city_id'];

        Space.SpaceFloorPlan.onHighlightBlBySearch(siteView, searchField, buildingStoreId, fieldsToSearch);
    },

    showSiteMap: function (siteMap, onCompleted, scope) {
        var me = this,
            siteDrawingStore = Ext.getStore('siteDrawings'),
            siteId = Space.Space.getValueFromStorePermanentFilter('spaceBookBuildings', 'site_id'),

            doProcessSvg = function (svgData) {
                siteMap.setSvgData(svgData);
                siteMap.setEventHandlers([
                    {
                        assetType: 'bl',
                        handler: scope.onClickBuilding,
                        scope: me,
                        navController: scope
                    }
                ]);
                me.callFunctionOnSiteMap(siteMap, onCompleted, scope);
            };

        siteDrawingStore.clearFilter();
        siteDrawingStore.filter('site_id', siteId);
        siteDrawingStore.load(function (records) {
            if (records && records.length > 0) {
                doProcessSvg(records[0].get('svg_data'));

            }
        });
    },

    callFunctionOnSiteMap: function (siteMap, onCompleted, scope) {
        var me = this;
        if (!siteMap.isPainted()) {
            setTimeout(function () {
                me.callFunctionOnSiteMap(siteMap, onCompleted, scope);
            }, 100);
        } else {
            Ext.callback(onCompleted, scope || me);
        }
    },

    /**
     * Retrieve the building record for a given floor
     */
    getBuildingRecord: function (blId, onCompleted, scope) {
        var buildingStore = Ext.getStore('spaceBookBuildings'),
            filter = {
                property: 'bl_id',
                value: blId
            };

        buildingStore.retrieveRecord(filter, onCompleted, scope);
    },

    /**
     * Returns the value of a property from a store's permanent filter.
     */
    getValueFromStorePermanentFilter: function (storeName, propertyName) {
        var store = Ext.getStore(storeName),
            filterArray = [],
            i;

        if (store) {
            filterArray = store.permanentFilter;
            for (i = 0; i < filterArray.length; i++) {
                if (filterArray[i].getProperty() === propertyName) {
                    return filterArray[i].getValue();
                }
            }
        }
        return '';
    },

    // '' values will be taken into consideration. To not add one value use null.
    getFilterArray: function (blId, flId, rmId, surveyId) {
        var filterArray = [],
            blFilter,
            flFilter,
            rmFilter,
            surveyFilter;

        if (!Ext.isEmpty(blId, true)) {
            blFilter = Ext.create('Common.util.Filter', {
                property: 'bl_id',
                value: blId,
                conjunction: 'AND',
                exactMatch: true
            });
            filterArray.push(blFilter);
        }

        if (!Ext.isEmpty(flId, true)) {
            flFilter = Ext.create('Common.util.Filter', {
                property: 'fl_id',
                value: flId,
                conjunction: 'AND',
                exactMatch: true
            });
            filterArray.push(flFilter);
        }

        if (!Ext.isEmpty(rmId, true)) {
            rmFilter = Ext.create('Common.util.Filter', {
                property: 'rm_id',
                value: rmId,
                conjunction: 'AND',
                exactMatch: true
            });
            filterArray.push(rmFilter);
        }

        if (!Ext.isEmpty(surveyId, true)) {
            surveyFilter = Ext.create('Common.util.Filter', {
                property: 'survey_id',
                value: surveyId,
                conjunction: 'AND',
                exactMatch: true
            });
            filterArray.push(surveyFilter);
        }

        return filterArray;
    }
});