Ext.define('MaterialInventory.controller.Materials', {
    extend: 'Common.controller.NavigationController',

    config: {
        refs: {
            mainView: 'materialMainView',
            appModeButtons: 'materialList > toolbar > segmentedbutton',
            syncButton: 'toolbarbutton[itemId=syncMaterialButton]',
            closeInventoryButton: 'toolbarbutton[itemId=closeInventoryButton]',
            reviewTabButton: 'button[itemId=reviewTab]',
            inventoryTabButton: 'button[itemId=inventoryTab]',
            inventoryDateCalendarView: 'inventoryDateCalendar',
            sortMaterialField: 'selectfield[name=sortMaterialField]',
            materialSearchField: 'materialList search[name=materialSearchField]',
            filterButton: 'button[action=filterMaterialsList]',
            calendarComponent: 'inventoryDateCalendar calendar'
        },

        errorText: LocaleManager.getLocalizedString('Error', 'MaterialInventory.controller.Materials'),
        futureDateText: LocaleManager.getLocalizedString('Inventory Start Date cannot be in the future', 'MaterialInventory.controller.Materials'),
        closeInventoryText: LocaleManager.getLocalizedString('This action will save your changes on the server. If you reset the Inventory Start Date then the app will no longer highlight inventoried items. Are you sure you want to clear the Inventory Start Date?', 'MaterialInventory.controller.Materials'),
        inventoryTabTitleText: LocaleManager.getLocalizedString('Inventory', 'MaterialInventory.controller.Materials'),
        downloadDocumentMessage: LocaleManager.getLocalizedString('Downloading Document', 'MaterialInventory.controller.Materials'),
        containerNotFoundMessage: LocaleManager.getLocalizedString('Container is not registered.', 'MaterialInventory.controller.Materials'),
        containerMultipleRecordsMessage: LocaleManager.getLocalizedString('Container is registered multiple times.', 'MaterialInventory.controller.Materials'),
        containerLocationMatchMessage: LocaleManager.getLocalizedString('The container you have scanned is in a different location: {0}. Do you want to update its location as your current location: {1} or do you want to cancel the scan and navigate to a different location?', 'MaterialInventory.controller.Materials'),
        updateLocationText: LocaleManager.getLocalizedString('Update location', 'MaterialInventory.controller.Materials'),
        cancelText: LocaleManager.getLocalizedString('Cancel', 'MaterialInventory.controller.Materials')
    },

    onSearchMaterial: function (value, filterFields, callbackFn, scope) {
        var filterArray = [],
            store = Ext.getStore('materialLocations');

        // Create Filters
        Ext.each(filterFields, function (field) {
            var filter = MaterialInventory.util.Filter.createFilter(field, value, 'OR', false);
            filterArray.push(filter);
        });

        // save the search filter since on the same store are applied also location filters and restrictions from filter view
        store.searchFilter = filterArray;

        // Apply Filters
        MaterialInventory.util.Filter.applyMaterialLocationFilters(callbackFn, scope);
    },

    onClearSearchMaterial: function () {
        var store = Ext.getStore('materialLocations');
        store.searchFilter = [];
        MaterialInventory.util.Filter.applyMaterialLocationFilters();
    },

    /**
     * Applies the selected sort to the store.
     */
    onApplySort: function (field, value) {
        var materialLocationsStore = Ext.getStore('materialLocations');

        switch (value) {
            case 'location':
                materialLocationsStore.setSorters(materialLocationsStore.getSortByLocation());
                break;

            case 'product':
                materialLocationsStore.setSorters(materialLocationsStore.getSortByProduct());
                break;

            case 'status':
                materialLocationsStore.setSorters(materialLocationsStore.getSortByStatus());
                break;

            case 'hazmat':
                materialLocationsStore.setSorters(materialLocationsStore.getSortByHazmat());
                break;

            // The location case is the default.
            default:
                materialLocationsStore.setSorters(materialLocationsStore.getSortByLocation());
                break;
        }

        materialLocationsStore.loadPage(1);
    },

    displayFilterView: function () {
        var me = this,
            view = Ext.create('MaterialInventory.view.Filter');

        // relaod the custodians store because the list might have changed by setting new custodians for MaterialLocation records
        Ext.getStore('custodians').load(function () {
            me.getMainView().push(view);
        }, me);
    },

    applyFilter: function () {
        var me = this,
            navigationBar = me.getMainView().getNavigationBar(),
            filterValues = navigationBar.getCurrentView().getValues();

        MaterialInventory.util.Filter.createFilterViewRestriction(filterValues);
        MaterialInventory.util.Filter.applyMaterialLocationFilters(function () {
            me.getMainView().pop();
        }, me);
    },

    clearFilter: function (callbackFn, scope) {
        var currentView = this.getMainView().getNavigationBar().getCurrentView(),
            store = Ext.getStore('materialLocations');

        if (currentView.xtype === 'filterPanel') {
            currentView.reset();
        }

        MaterialInventory.util.Filter.filterViewSelectedValues = {};
        store.userFilter = [];

        MaterialInventory.util.Filter.applyMaterialLocationFilters(callbackFn, scope);
    },

    showHideAppModeButtons: function () {
        var hasInventoryDate = !Ext.isEmpty(AppMode.getInventoryDate()),
            appModeButtons = this.getAppModeButtons();

        if (AppMode.isInventoryUpdateMode()) {
            this.getAppModeButtons().setHidden(false);
            if (hasInventoryDate) {
                this.showInventoryTab();
                appModeButtons.setPressedButtons(this.getInventoryTabButton());
            } else {
                this.showUpdateTab();
                appModeButtons.setPressedButtons(this.getReviewTabButton());
            }
        } else if (AppMode.isInventoryMode()) {
            this.getAppModeButtons().setHidden(false);
            if (hasInventoryDate) {
                this.showInventoryTab();
                appModeButtons.setPressedButtons(this.getInventoryTabButton());
            } else {
                this.showReviewTab();
                appModeButtons.setPressedButtons(this.getReviewTabButton());
            }
        } else if (AppMode.isUpdateMode()) {
            this.getAppModeButtons().setHidden(true);
            this.showUpdateTab();
            appModeButtons.setPressedButtons(this.getReviewTabButton());
        } else {
            this.getAppModeButtons().setHidden(true);
            this.showReviewTab();
            appModeButtons.setPressedButtons(this.getReviewTabButton());
        }
    },

    showInventoryTab: function () {
        //Sync, Add, and Close Inventory buttons are displayed
        var addButton = this.getMainView().getNavigationBar().getAddButton();

        if (this.getSyncButton()) {
            this.getSyncButton().setHidden(false);
        }

        if (addButton) {
            addButton.setHidden(false);
        }

        if (this.getCloseInventoryButton()) {
            this.getCloseInventoryButton().setHidden(false);
        }

        this.showVerifyItemBtn(true);
    },

    showUpdateTab: function () {
        //Sync and Add are available, but Close Inventory button is hidden
        var addButton = this.getMainView().getNavigationBar().getAddButton();

        if (this.getSyncButton()) {
            this.getSyncButton().setHidden(false);
        }

        if (addButton) {
            addButton.setHidden(false);
        }

        if (this.getCloseInventoryButton()) {
            this.getCloseInventoryButton().setHidden(true);
        }

        this.showVerifyItemBtn(false);
    },

    showReviewTab: function () {
        //Sync, Add and Close Inventory buttons are hidden
        var addButton = this.getMainView().getNavigationBar().getAddButton();

        if (this.getSyncButton()) {
            this.getSyncButton().setHidden(true);
        }

        if (addButton) {
            addButton.setHidden(true);
        }

        if (this.getCloseInventoryButton()) {
            this.getCloseInventoryButton().setHidden(true);
        }

        this.showVerifyItemBtn(false);
    },

    onAppModeButtonToggle: function (segmentedButton, button, isPressed) {
        var itemId = button.getItemId(),
            hasInventoryDate = !Ext.isEmpty(AppMode.getInventoryDate());

        if (isPressed) {
            if (itemId === 'reviewTab') {
                if (AppMode.isUpdateMode() || AppMode.isInventoryUpdateMode()) {
                    this.showUpdateTab();
                } else {
                    this.showReviewTab();
                }
                if (AppMode.isReviewMode() || AppMode.isUpdateMode()) {
                    this.getAppModeButtons().setHidden(true);
                }
            } else {
                if (hasInventoryDate) {
                    this.showInventoryTab();
                } else {
                    this.showSelectDatePanel();
                }
            }
        }
    },

    showSelectDatePanel: function () {
        var view = Ext.create('MaterialInventory.view.CalendarView');
        Ext.Viewport.add(view);
        view.show();
    },

    onDateSelected: function (calendar, selectedDate) {
        var me = this,
            formattedSelectedDate,
            currentDate = (new Date()).setHours(0, 0, 0, 0),
            materialLocationsStore = Ext.getStore('materialLocations');

        selectedDate.setHours(0, 0, 0, 0);
        if (selectedDate > currentDate) {
            Ext.Msg.alert(me.getErrorText(), me.getFutureDateText());
            return;
        }

        Mask.displayLoadingMask();
        AppMode.setInventoryDate(selectedDate);
        formattedSelectedDate = Ext.Date.format(selectedDate, LocaleManager.getLocalizedDateFormat());
        me.getInventoryTabButton().setText(me.getInventoryTabTitleText() + ' ' + formattedSelectedDate);

        materialLocationsStore.suspendEvents();
        MaterialInventory.util.Materials.updateAllFlagsDoneInventoryDate(function () {
            materialLocationsStore.resumeEvents(true);
            me.filterPlanTypes(function () {
                // reload list store to show verify buttons
                MaterialInventory.util.Filter.applyMaterialLocationFilters(function () {
                    me.closeCalendarView();
                    me.showInventoryTab();
                    me.setDefaultPlanTypeRecord();
                    Mask.hideLoadingMask();
                }, me);
            }, me);
        }, me);
    },

    closeCalendarView: function () {
        var view = this.getInventoryDateCalendarView();
        Ext.Viewport.remove(view);
    },

    cancelCalendarView: function () {
        this.closeCalendarView();

        this.switchToReview();
    },

    switchToReview: function () {
        var reviewTabButton = this.getAppModeButtons().getItems().get('reviewTab');

        if (AppMode.isUpdateMode() || AppMode.isInventoryUpdateMode()) {
            this.showUpdateTab();
        } else {
            this.showReviewTab();
        }

        this.getAppModeButtons().setPressedButtons(reviewTabButton);
    },

    closeInventory: function () {
        var me = this;

        Network.checkNetworkConnectionAndLoadDwrScripts(true)
            .then(function (isConnected) {
                if (isConnected) {
                    Ext.Msg.confirm('', me.getCloseInventoryText(), function (buttonId) {
                        if (buttonId === 'yes') {

                            me.getApplication().getController('MaterialInventory.controller.MaterialInventorySync').onSyncButtonTap();

                            AppMode.setInventoryDate(null);
                            me.getInventoryTabButton().setText(me.getInventoryTabTitleText());

                            me.switchToReview();

                            // reload list store to hide verify buttons
                            Ext.getStore('materialLocations').load(function () {
                                me.filterPlanTypes(function () {
                                    me.setDefaultPlanTypeRecord();
                                }, me);
                            });
                        }
                    });
                }
            });
    },

    showVerifyItemBtn: function (show) {
        var verifyItemButtons = Ext.ComponentQuery.query('button[action=verifyMaterial]');

        if (show) {
            // reload list store to show/hide verify buttons depending on security role
            Ext.getStore('materialLocations').load();
        } else {
            Ext.each(verifyItemButtons, function (verifyBtn) {
                verifyBtn.setHidden(true);
            });
        }
    },


    onViewMsds: function (button, event) {
        var record = button.getRecord(),
            documentsStore = Ext.getStore('materialMsds'),
            msdsId,
            currentView,
            documentRecord,
            documentData,
            fileName,
            documentUnavailableMsg = LocaleManager.getLocalizedString('Document unavailable', 'MaterialInventory.controller.Materials'),
            displayDocument = function () {
                fileName = documentRecord.get('doc');
                documentData = documentRecord.get('doc_contents');
                if (Ext.isEmpty(fileName) || Ext.isEmpty(documentData)) {
                    Ext.Msg.alert('', documentUnavailableMsg);
                } else {
                    DocumentManager.displayDocument(documentData, fileName);
                }
            };

        // avoid navigation caused by list item tap
        event.stopPropagation();
        event.stopEvent();

        // for list item buttons the record is set on the button; for toolbar buttons in edit form the record is obtained from the form
        if (Ext.isEmpty(record)) {
            currentView = this.getNavigationBar().getCurrentView();
            record = currentView.getRecord();

            if (Ext.isEmpty(record)) {
                return;
            }
        }

        msdsId = record.get('msds_id');

        if (!Ext.isEmpty(msdsId)) {
            documentRecord = documentsStore.findRecord('msds_id', msdsId);
            if (Ext.isEmpty(documentRecord)) {
                this.downloadDocument(msdsId, function (record) {
                    if (Ext.isEmpty(record)) {
                        Ext.Msg.alert('', documentUnavailableMsg);
                    } else {
                        documentRecord = record;
                        displayDocument();
                    }
                }, this);
            } else {
                displayDocument();
            }
        }
    },

    downloadDocument: function (msdsId, callbackFn, scope) {
        var me = this,
            storeName = 'materialMsds',
            store = Ext.getStore(storeName),
            restriction = [],
            documentRecord = null;

        Network.checkNetworkConnectionAndDisplayMessageAsync(function (isConnected) {
            if (isConnected) {
                SynchronizationManager.startSync();
                Mask.setLoadingMessage(me.getDownloadDocumentMessage());
                restriction.push({
                    tableName: 'msds_data',
                    fieldName: 'msds_id',
                    operation: 'EQUALS',
                    value: msdsId
                });

                store.setRestriction(restriction);
                SynchronizationManager.downloadValidatingTablesForStores([storeName], function () {
                    SynchronizationManager.endSync();
                    store.load(function () {
                        documentRecord = store.findRecord('msds_id', msdsId);
                        Ext.callback(callbackFn, scope, [documentRecord]);
                    });
                }, me);
            }
        }, me);
    },

    onVerifyMaterial: function (button, event) {
        var me = this,
            record = button.getRecord(),
            currentView;

        // avoid navigation caused by list item tap
        event.stopPropagation();
        event.stopEvent();

        // for list item buttons the record is set on the button; for toolbar buttons in edit form the record is obtained from the form
        if (Ext.isEmpty(record)) {
            currentView = this.getNavigationBar().getCurrentView();
            record = currentView.getRecord();

            if (Ext.isEmpty(record)) {
                return;
            }
        }

        record.set('date_last_inv', new Date());

        MaterialInventory.util.Materials.updateFlagDoneInventoryDateForRecord(record, function () {
            MaterialInventory.util.Filter.applyMaterialLocationFilters(function () {
                if (!Ext.isEmpty(currentView) && currentView.xtype === 'materialForm') {
                    me.getMainView().pop();
                }
            }, me);
        }, me);
    },

    scanContainer: function (containerCode) {
        var me = this,
            materialLocationsStore = Ext.getStore('materialLocations'),
            filters = [],
            buttons,
            oldMaterialLocationRecord,
            materialLocationRecord,
            message;

        filters.push(MaterialInventory.util.Filter.createFilter('container_code', containerCode));
        materialLocationsStore.retrieveAllStoreRecords(filters, function (records) {
            if (records.length === 0) {
                Ext.Msg.alert('', me.getContainerNotFoundMessage());
            } else if (records.length > 1) {
                Ext.Msg.alert('', me.getContainerMultipleRecordsMessage());
            } else {
                materialLocationRecord = records[0];
                if (me.compareWithLocationFieldValuesFromFilters(materialLocationRecord)) {
                    // container's location match the drill down location
                    // display edit panel
                    me.displayUpdatePanel(me.getMaterialList(), materialLocationRecord);
                } else {
                    // container's location don't match the drill down location
                    message = me.getContainerLocationMatchMessage();
                    message = message.replace('{0}', me.getLocationCodeForRecord(materialLocationRecord));
                    message = message.replace('{1}', me.getLocationCodeForFilters());

                    buttons = [
                        {text: me.getUpdateLocationText(), itemId: 'updateLocation'},
                        {text: me.getCancelText(), itemId: 'cancel'}
                    ];
                    Ext.Msg.show({
                            title: '',
                            message: message,
                            buttons: buttons,
                            promptConfig: false,
                            fn: function (buttonId) {
                                if (buttonId === 'updateLocation') {
                                    MaterialInventory.util.Materials.removeLocationFlags(materialLocationRecord)
                                        .then(function () {
                                            oldMaterialLocationRecord = Ext.Object.merge(Ext.create('MaterialInventory.model.MaterialLocation'), materialLocationRecord);
                                            me.setLocationFieldValuesFromFilters(materialLocationRecord);
                                            materialLocationsStore.add(materialLocationRecord);

                                            materialLocationsStore.sync(function () {
                                                // set location flags for all new locations of the material record
                                                MaterialInventory.util.Materials.setLocationFlags(materialLocationRecord, function () {
                                                    // set location flags for all old locations of the material record where there are other materials in those locations
                                                    MaterialInventory.util.Materials.updateHasMaterialsForLocationRecord(oldMaterialLocationRecord, function () {
                                                        MaterialInventory.util.Filter.applyMaterialLocationFilters(function () {
                                                            me.displayUpdatePanel(me.getMaterialList(), materialLocationRecord);
                                                        }, me);
                                                    }, me);
                                                }, me);
                                            });
                                        });
                                } else if (buttonId === 'cancel') {
                                    me.getMaterialSearchField().setValue('');
                                    me.onClearSearchMaterial();
                                }
                            },
                            scope: me
                        }
                    )
                    ;
                }
            }
        }, me);
    },

    getLocationCodeForRecord: function (record) {
        var locationFields = ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],
            locationCode = '',
            i;

        for (i = 0; i < locationFields.length; i++) {
            if (record.get(locationFields[i])) {
                if (i > 0) {
                    locationCode += '-';
                }
                locationCode += record.get(locationFields[i]);
            } else {
                return locationCode;
            }
        }

        return locationCode;
    },

    getLocationCodeForFilters: function () {
        var locationFields = ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],
            locationCode = '',
            filters = Ext.getStore('materialLocations').getFilters(),
            i, j,
            fieldName,
            value;

        for (i = 0; i < locationFields.length; i++) {
            for (j = 0; j < filters.length; j++) {
                fieldName = locationFields[i];
                if (filters[j].getProperty() === fieldName && filters[j].getExactMatch()) {
                    value = filters[j].getValue();
                    if (i > 0) {
                        locationCode += '-';
                    }
                    locationCode += value;
                }
            }
        }

        return locationCode;
    },

    // handle tap on buttons 'Materials in Site', 'Materials in Building' etc.
    onShowCurrentLocationMaterials: function (level) {
        var currentView = this.getMainView().getNavigationBar().getCurrentView(),
            record = currentView.getRecord();

        if (!record && Ext.isFunction(currentView.getParentRecord)) {
            record = currentView.getParentRecord();
        }

        this.onShowMaterialsList(level, record);
    },


    onShowMaterialsList: function (level, record) {
        var me = this,
            locationFilters,
            store = Ext.getStore('materialLocations'),
            listView;

        locationFilters = me.getLocationFiltersForShowMaterials(level, record);

        // save the location filter since on the same store are applied also search filters and restrictions from filter view
        store.locationFilter = locationFilters;

        //clear the search field filter before displaying the list
        store.searchFilter = [];

        listView = Ext.create('MaterialInventory.view.MaterialList');

        MaterialInventory.util.Filter.applyMaterialLocationFilters(function () {
            me.getMainView().push(listView);
        }, me);
    },

    getLocationFiltersForShowMaterials: function (level, record) {
        var locationFilters = [];

        switch (level) {
            case 'site':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('site_id', MaterialInventory.util.Ui.selectedSite));
                locationFilters.push(MaterialInventory.util.Filter.createIsNullOrEmptyFilter('bl_id'));
                break;
            case 'bl':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createIsNullOrEmptyFilter('fl_id'));
                break;
            case 'fl':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createIsNullOrEmptyFilter('rm_id'));
                break;
            case 'rm':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                locationFilters.push(MaterialInventory.util.Filter.createIsNullOrEmptyFilter('aisle_id'));
                break;
            case 'aisle':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('aisle_id', record.get('aisle_id')));
                locationFilters.push(MaterialInventory.util.Filter.createIsNullOrEmptyFilter('cabinet_id'));
                break;
            case 'cabinet':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('aisle_id', record.get('aisle_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('cabinet_id', record.get('cabinet_id')));
                locationFilters.push(MaterialInventory.util.Filter.createIsNullOrEmptyFilter('shelf_id'));
                break;
            case 'shelf':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('aisle_id', record.get('aisle_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('cabinet_id', record.get('cabinet_id')));
                locationFilters.push(MaterialInventory.util.Filter.createFilter('shelf_id', record.get('shelf_id')));
                locationFilters.push(MaterialInventory.util.Filter.createIsNullOrEmptyFilter('bin_id'));
                break;
        }

        return locationFilters;
    },

    setMaterialsButtonBadge: function (view) {
        var me = this,
            level,
            locationFilters,
            record,
            store = Ext.getStore('materialLocations'),
            button;

        switch (view.xtype) {
            case 'materialSitePanel':
                level = 'site';
                button = this.getSiteMaterialsButton();
                break;
            case 'materialFloorsListPanel':
                level = 'bl';
                button = this.getBlMaterialsButton();
                break;
            case 'materialFloorPlanPanel':
                level = 'fl';
                button = this.getFlMaterialsButton();
                break;
            case 'aisleslist':
                level = 'rm';
                button = this.getRmMaterialsButton();
                break;
            case 'cabinetslist':
                level = 'aisle';
                button = this.getAisleMaterialsButton();
                break;
            case 'shelveslist':
                level = 'cabinet';
                button = this.getCabinetMaterialsButton();
                break;
            case 'binslist':
                level = 'shelf';
                button = this.getShelfMaterialsButton();
                break;
        }

        record = view.getRecord();

        if (!record && Ext.isFunction(view.getParentRecord)) {
            record = view.getParentRecord();
        }

        if (record) {
            locationFilters = this.getLocationFiltersForShowMaterials(level, record);

            store.retrieveAllStoreRecords(locationFilters, function (records) {
                // on Home button tap this is called repeatedly and an error is thrown if button.setBadgeText is called when the view is no longer displayed
                if (!Ext.isEmpty(button) && me.getMainView().getNavigationBar().getCurrentView().xtype === view.xtype) {
                    button.setBadgeText(records.length);
                }
            }, me);
        }
    },

    /**
     * @override
     * This function should be called only from the Navigation controller.
     */
    displayAddPanel: Ext.emptyFn
})
;