Ext.define('MaterialInventory.controller.Navigation', {
    extend: 'MaterialInventory.controller.Materials',

    config: {
        refs: {
            mainView: 'materialMainView',
            buildingsSegmentedButton: 'materialSitePanel > toolbar > segmentedbutton',
            floorPlanViewSelectButton: 'materialFloorPlanPanel > toolbar[docked=bottom] > segmentedbutton',
            siteList: 'materialSiteListPanel',
            buildingList: 'materialBuildingsListPanel',
            siteMap: 'materialSiteMapPanel',
            siteView: 'materialSitePanel',
            floorPlanView: 'materialFloorPlanPanel',
            floorListView: 'materialFloorsListPanel',
            floorPlanContainer: 'materialFloorPlanPanel > svgcomponent',
            roomList: 'materialRoomsList',
            aisleList: 'aisleslist',
            cabinetList: 'cabinetslist',
            shelfList: 'shelveslist',
            binList: 'binslist',
            materialList: 'materialList',
            materialForm: 'materialForm',
            floorPlanSearch: 'search[itemId=floorPlanSearch]',
            homeButton: 'button[action=goToHomePage]',
            redlineButton: 'button[action=openRedline]',
            planTypeButtonPicker: 'materialMainView buttonpicker[itemId=planTypePicker]',
            containerCodeField: 'materialForm barcodefield[name=container_code]',
            numContainersField: 'materialForm localizedspinnerfield[name=num_containers]',
            actionButtonPicker: 'materialMainView buttonpicker[itemId=actionPicker]',
            siteMaterialsButton: 'button[action=showSiteMaterials]',
            blMaterialsButton: 'button[action=showBuildingMaterials]',
            flMaterialsButton: 'button[action=showFloorMaterials]',
            rmMaterialsButton: 'button[action=showRoomMaterials]',
            aisleMaterialsButton: 'button[action=showAisleMaterials]',
            cabinetMaterialsButton: 'button[action=showCabinetMaterials]',
            shelfMaterialsButton: 'button[action=showShelfMaterials]',

            blPromptField: 'materialForm buildingPrompt',
            flPromptField: 'materialForm floorPrompt',
            rmPromptField: 'materialForm roomBarcodePrompt',
            aislePromptField: 'materialForm aislePrompt',
            cabinetPromptField: 'materialForm cabinetPrompt',
            shelfPromptField: 'materialForm shelfPrompt',
            binPromptField: 'materialForm binPrompt',

            rmPromptListPanel: 'panel[itemId=rmPromptList]',
            aislePromptListPanel: 'panel[itemId=aislePromptList]',
            cabinetPromptListPanel: 'panel[itemId=cabinetPromptList]',
            shelfPromptListPanel: 'panel[itemId=shelfPromptList]',
            binPromptListPanel: 'panel[itemId=binPromptList]',

            //used in Space.SpaceFloorPlan
            floorPlanTitleBar: 'materialFloorPlanPanel > titlebar'
        },

        control: {
            main: {
                push: 'onViewPushed',
                pop: 'onViewPopped'
            },
            homeButton: {
                tap: 'onGoToHomePage'
            },
            siteList: {
                listitemtap: 'onSiteListTapped'
            },
            buildingList: {
                listitemtap: 'onBuildingListTapped',
                itemmaterialbuttontap: function (record) {
                    this.displayMaterialsList('bl', record);
                }
            },
            buildingsSegmentedButton: {
                toggle: 'onBuildingSegmentedButtonToggled'
            },
            floorListView: {
                listitemtap: 'onFloorListTapped',
                itemmaterialbuttontap: function (record) {
                    this.displayMaterialsList('fl', record);
                }
            },
            floorPlanViewSelectButton: {
                toggle: 'onFloorPlanViewButtonToggled'
            },
            floorPlanView: {
                roomtap: 'onRoomTap',
                show: function () {
                    this.onDisplayFloorPlanView();
                }
            },
            floorPlanContainer: {
                aftersvgload: function () {
                    var planTypeRecord = Space.SpaceFloorPlan.getPlanTypeRecord(this.getPlanTypeButtonPicker()),
                        selectedPlanType,
                        roomsStore = Ext.getStore('materialRooms'),
                        container = this.getFloorPlanView(),
                        assets = [],
                        opts;

                    if (planTypeRecord) {
                        selectedPlanType = planTypeRecord.get('plan_type');
                        if (selectedPlanType === MaterialInventory.util.Ui.planTypes.LOCATE) {
                            // highlight the room that needs to be located
                            if (container.isHidden() || !container.isFloorPlanPanel) {
                                return;
                            }
                            roomsStore.each(function (record) {
                                var roomCode = record.getRoomId();
                                assets.push(roomCode);
                            });

                            opts = {'cssClass': 'zoomed-asset-default', removeStyle: false};
                            container.findAssets(assets, opts);
                        }
                    }
                }
            },
            roomList: {
                listitemtap: 'onRoomListTapped',
                itemmaterialbuttontap: function (record) {
                    this.displayMaterialsList('rm', record);
                }
            },
            aisleList: {
                listitemtap: 'onAisleListTapped',
                itemmaterialbuttontap: function (record) {
                    this.displayMaterialsList('aisle', record);
                }
            },
            cabinetList: {
                listitemtap: 'onCabinetListTapped',
                itemmaterialbuttontap: function (record) {
                    this.displayMaterialsList('cabinet', record);
                }
            },
            shelfList: {
                listitemtap: 'onShelfListTapped',
                itemmaterialbuttontap: function (record) {
                    this.displayMaterialsList('shelf', record);
                }
            },
            binList: {
                listitemtap: 'onBinListTapped',
                itemmaterialbuttontap: function (record) {
                    this.displayMaterialsList('bin', record);
                }
            },
            materialList: {
                itemsingletap: 'onMaterialListTapped'
            },
            'materialSiteListPanel search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialSites',
                        ['site_id', 'name', 'ctry_id', 'state_id', 'city_id'], this.getSiteList());
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialSites');
                }
            },
            'materialSitePanel search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialBuildings',
                        ['bl_id', 'name', 'address1', 'address2', 'city_id']);
                    Space.SpaceFloorPlan.onHighlightBlBySearch(this.getSiteView(), searchField, 'materialBuildings',
                        ['bl_id', 'name', 'address1', 'address2', 'city_id']);
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialBuildings');
                    Space.SpaceFloorPlan.onClearHighlightBySearch(this.getSiteMap());
                }
            },
            'materialFloorsListPanel search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialFloors', ['fl_id', 'name']);
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialFloors');
                }
            },
            'materialFloorPlanPanel search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialRooms', ['rm_id', 'rm_std']);

                    Space.SpaceFloorPlan.onHighlightBySearch(this.getFloorPlanView(), searchField,
                        Ext.getStore('materialRooms'), ['rm_id', 'rm_std']);

                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialRooms');
                    Space.SpaceFloorPlan.onClearHighlightBySearch(this.getFloorPlanView());
                }
            },
            'aisleslist search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialAisles',
                        ['aisle_id', 'name'], this.getAisleList());
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialAisles');
                }
            },
            'cabinetslist search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialCabinets',
                        ['aisle_id', 'cabinet_id', 'name'], this.getCabinetList());
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialCabinets');
                }
            },
            'shelveslist search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialShelves',
                        ['aisle_id', 'cabinet_id', 'shelf_id', 'name'], this.getShelfList());
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialShelves');
                }
            },
            'binslist search': {
                searchkeyup: function (value, searchField) {
                    Space.Space.onSearch(searchField, 'materialBins',
                        ['aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'], this.getBinList());
                },
                searchclearicontap: function () {
                    Space.Space.onClearSearchFilter('materialBins');
                }
            },
            planTypeButtonPicker: {
                itemselected: 'onChangePlanType',
                onPickerTap: function (list) {
                    var existActivePlanTypes = Space.SpaceDownload.verifyExistActivePlanTypesForApp('materialPlanTypes'),
                        listSelectionCount = list.getSelectionCount(), record;

                    if (existActivePlanTypes && listSelectionCount === 0) {
                        record = Space.SpaceFloorPlan.getPlanTypeRecord(this.getPlanTypeButtonPicker());
                        list.select(record, false, true); //select( records, keepExisting, suppressEvent )
                    }
                }
            },

            // materials
            sortMaterialField: {
                change: 'onApplySort'
            },
            materialSearchField: {
                searchkeyup: function (value) {
                    this.onSearchMaterial(value, ['container_code', 'product_name', 'container_status', 'bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id']);
                },
                searchclearicontap: 'onClearSearchMaterial',
                scancomplete: function (scanResult) {
                    var me = this;
                    // when a barcode is scanned it is for sure the container code
                    if (scanResult && !Ext.isEmpty(scanResult.fields.container_code)) {
                        me.onSearchMaterial(scanResult.fields.container_code, ['container_code'], function () {
                            me.scanContainer(scanResult.fields.container_code);
                        }, me);
                    }
                }
            },

            filterButton: {
                tap: 'displayFilterView'
            },
            'filterPanel': {
                clearFilter: 'clearFilter',
                applyFilter: 'applyFilter'
            },

            appModeButtons: {
                toggle: 'onAppModeButtonToggle'
            },
            calendarComponent: {
                selectionchange: 'onDateSelected'
            },
            'button[action=cancelCalendar]': {
                tap: 'cancelCalendarView'
            },
            closeInventoryButton: {
                tap: 'closeInventory'
            },

            'toolbarbutton[action=locateMaterial]': {
                tap: 'onLocateMaterial'
            },

            'button[action=viewMsds]': {
                tap: 'onViewMsds'
            },

            'button[action=verifyMaterial]': {
                tap: 'onVerifyMaterial'
            },

            containerCodeField: {
                keyup: function (field) {
                    this.onContainerCodeChanged(field.getValue());
                },
                clearicontap: function () {
                    this.onContainerCodeChanged('');
                },
                scancomplete: function (value) {
                    this.onContainerCodeChanged(value);
                }
            },

            siteMaterialsButton: {
                tap: function () {
                    this.onShowCurrentLocationMaterials('site');
                }
            },
            blMaterialsButton: {
                tap: function () {
                    this.onShowCurrentLocationMaterials('bl');
                }
            },
            flMaterialsButton: {
                tap: function () {
                    this.onShowCurrentLocationMaterials('fl');
                }
            },
            rmMaterialsButton: {
                tap: function () {
                    this.onShowCurrentLocationMaterials('rm');
                }
            },
            aisleMaterialsButton: {
                tap: function () {
                    this.onShowCurrentLocationMaterials('aisle');
                }
            },
            cabinetMaterialsButton: {
                tap: function () {
                    this.onShowCurrentLocationMaterials('cabinet');
                }
            },
            shelfMaterialsButton: {
                tap: function () {
                    this.onShowCurrentLocationMaterials('shelf');
                }
            },

            blPromptField: {
                change: function (field, newValue, oldValue) {
                    this.onChangeLocationFieldValue(field, newValue, oldValue, 'bl');
                }
            },
            flPromptField: {
                change: function (field, newValue, oldValue) {
                    this.onChangeLocationFieldValue(field, newValue, oldValue, 'fl');
                }
            },
            rmPromptField: {
                change: function (field, newValue, oldValue) {
                    this.onChangeLocationFieldValue(field, newValue, oldValue, 'rm');
                },
                scancomplete: function (scanResult) {
                    this.onScanLocation('rm', scanResult.code);
                }
            },
            aislePromptField: {
                change: function (field, newValue, oldValue) {
                    this.onChangeLocationFieldValue(field, newValue, oldValue, 'aisle');
                },
                scancomplete: function (scanResult) {
                    this.onScanLocation('aisle', scanResult.code);
                }
            },
            cabinetPromptField: {
                change: function (field, newValue, oldValue) {
                    this.onChangeLocationFieldValue(field, newValue, oldValue, 'cabinet');
                },
                scancomplete: function (scanResult) {
                    this.onScanLocation('cabinet', scanResult.code);
                }
            },
            shelfPromptField: {
                change: function (field, newValue, oldValue) {
                    this.onChangeLocationFieldValue(field, newValue, oldValue, 'shelf');
                },
                scancomplete: function (scanResult) {
                    this.onScanLocation('shelf', scanResult.code);
                }
            },
            binPromptField: {
                change: function (field, newValue, oldValue) {
                    this.onChangeLocationFieldValue(field, newValue, oldValue, 'bin');
                },
                scancomplete: function (scanResult) {
                    this.onScanLocation('bin', scanResult.code);
                }
            },

            'panel[itemId=rmPromptList] list': {
                itemtap: function (list, index, target, record, e) {
                    this.setRecordFromPromptList('rm', list, index, target, record, e);
                }
            },
            'panel[itemId=aislePromptList] list': {
                itemtap: function (list, index, target, record, e) {
                    this.setRecordFromPromptList('aisle', list, index, target, record, e);
                }
            },
            'panel[itemId=cabinetPromptList] list': {
                itemtap: function (list, index, target, record, e) {
                    this.setRecordFromPromptList('cabinet', list, index, target, record, e);
                }
            },
            'panel[itemId=shelfPromptList] list': {
                itemtap: function (list, index, target, record, e) {
                    this.setRecordFromPromptList('shelf', list, index, target, record, e);
                }
            },
            'panel[itemId=binPromptList] list': {
                itemtap: function (list, index, target, record, e) {
                    this.setRecordFromPromptList('bin', list, index, target, record, e);
                }
            }
        },

        disableListTapEvent: false,

        siteMapLoadingText: LocaleManager.getLocalizedString('Loading Site Map', 'MaterialInventory.controller.Navigation'),
        loadingFloorPlanText: LocaleManager.getLocalizedString('Loading Floor Plan', 'MaterialInventory.controller.Navigation'),
        loadingListsText: LocaleManager.getLocalizedString('Updating Lists', 'MaterialInventory.controller.Navigation')
    },

    onViewPushed: function (navView, view) {
        this.onDisplayView(navView, view);
    },

    onViewPopped: function (navView, poppedView) {
        var viewStack = this.getMainView().getNavigationBar().getViewStack(),
            currentView;

        this.callParent(arguments);

        if (viewStack && viewStack.length > 0) {
            currentView = viewStack[viewStack.length - 1];
            this.onDisplayView(navView, currentView);
        } else {
            this.getActionButtonPicker().setHidden(true);
        }

        // because prompt fields use the same stores as navigations lists,
        // permanent filters (from user navigation) need to be reapplied on location stores
        if (poppedView && poppedView.xtype === 'materialForm') {
            MaterialInventory.util.Filter.applyMaterialLocationFilters(function () {
                MaterialInventory.util.Ui.loadLocationStore();
            });
        }
    },

    onDisplayView: function (navView, view) {
        var navBar = navView.getNavigationBar(),
            saveButton = navBar.getSaveButton(),
            addButton = navBar.getAddButton(),
            isLocationListView = this.calculateIsLocationListView(view);

        this.getHomeButton().setHidden(view.xtype === 'materialSiteListPanel' || view.xtype === 'materialSitePanel');
        if (this.getRedlineButton()) {
            this.getRedlineButton().setHidden(true);
        }

        // show or hide the Plan Types button
        this.showHidePlanTypesButton(view);

        saveButton.setHidden(true);
        addButton.setHidden(view.xtype !== 'materialList');
        this.getActionButtonPicker().setHidden(!isLocationListView);

        if (isLocationListView) {
            this.setMaterialsButtonBadge(view);
        }

        if (view.xtype === 'materialList') {
            this.showHideAppModeButtons();
            this.setInventoryTabTitle();
        }
    },

    calculateIsLocationListView: function (view) {
        return view.xtype === 'materialSitePanel' || view.xtype === 'materialFloorsListPanel' ||
            view.xtype === 'materialFloorPlanPanel' || view.xtype === 'aisleslist' ||
            view.xtype === 'cabinetslist' || view.xtype === 'shelveslist' || view.xtype === 'binslist';
    },

    showHidePlanTypesButton: function (view) {
        var floorPlanViewSelectButton = this.getFloorPlanViewSelectButton(),
            activeFloorPlanTab,
            planTypeRecord;

        if (view.xtype === 'materialFloorPlanPanel') {
            if (floorPlanViewSelectButton && floorPlanViewSelectButton.getPressedButtons() && floorPlanViewSelectButton.getPressedButtons()[0]) {
                activeFloorPlanTab = floorPlanViewSelectButton.getPressedButtons()[0].getItemId();
                if (activeFloorPlanTab === 'roomList') {
                    this.getPlanTypeButtonPicker().setHidden(true);
                } else {
                    this.getPlanTypeButtonPicker().setHidden(false);
                }
            }
            planTypeRecord = Space.SpaceFloorPlan.getPlanTypeRecord(this.getPlanTypeButtonPicker());
            if (this.getFloorPlanTitleBar() && !Ext.isEmpty(planTypeRecord)) {
                Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), planTypeRecord, true);
            }
        } else {
            this.getPlanTypeButtonPicker().setHidden(true);
        }
    },

    onGoToHomePage: function () {
        this.getMainView().reset();
    },

    onSiteListTapped: function (list, index, target, record) {
        var me = this,
            siteId = record.get('site_id'),
            onCompleted = function () {
                me.displayUpdatePanel(list, record);
                Space.Space.setActiveBlButton(me);
            };

        me.getSiteList().setRecord(record);

        me.getSiteList().fireEvent('siteSelected', siteId, onCompleted, me);
    },

    setInventoryTabTitle: function () {
        var formattedSelectedDate;

        if ((AppMode.isInventoryMode || AppMode.isInventoryUpdateMode()) && !Ext.isEmpty(AppMode.getInventoryDate())) {
            formattedSelectedDate = Ext.Date.format(AppMode.getInventoryDate(), LocaleManager.getLocalizedDateFormat());
            this.getInventoryTabButton().setText(this.getInventoryTabTitleText() + ' ' + formattedSelectedDate);
        } else {
            this.getInventoryTabButton().setText(this.getInventoryTabTitleText());
        }
    },

    onBuildingSegmentedButtonToggled: function (segmentedButton, button, isPressed) {
        var buildingList = this.getBuildingList(),
            siteMap = this.getSiteMap(),
            siteList = this.getSiteList(),
            siteId = siteList.getRecord().get('site_id'),
            itemId = button.getItemId();

        if (isPressed) {
            if (itemId === 'buildingList') {
                siteMap.setHidden(true);
                buildingList.setHidden(false);
            }
            if (itemId === 'siteMap') {
                this.showSiteMap(siteMap, siteId);
                siteMap.setHidden(false);
                buildingList.setHidden(true);
                this.showSearchBlHighlight(this.getSiteView());
            }
        }
    },

    showSearchBlHighlight: function (siteView) {
        var searchField = Ext.ComponentQuery.query('#buildingSearch')[0],
            buildingStoreId = siteView.query('materialBuildingsListPanel')[0].getStore().getStoreId(),
            fieldsToSearch = ['bl_id', 'name', 'address1', 'address2', 'city_id'];

        Space.SpaceFloorPlan.onHighlightBlBySearch(siteView, searchField, buildingStoreId, fieldsToSearch);
    },

    showSiteMap: function (siteMap, siteId) {
        var me = this,
            siteDrawingStore = Ext.getStore('siteDrawings'),

            doProcessSvg = function (svgData) {
                siteMap.setSvgData(svgData);
                siteMap.setEventHandlers([
                    {
                        assetType: 'bl',
                        handler: me.onClickBuilding,
                        scope: me,
                        navController: me
                    }
                ]);
                Mask.hideLoadingMask();
            };

        Mask.displayLoadingMask(this.getSiteMapLoadingText());
        siteDrawingStore.clearFilter();
        siteDrawingStore.filter('site_id', siteId);
        siteDrawingStore.load(function (records) {
            if (records && records.length > 0) {
                doProcessSvg(records[0].get('svg_data'));
            } else {
                Mask.hideLoadingMask();
            }
        });
    },

    onBuildingListTapped: function (list, index, target, record) {
        var me = this,
            storeName = 'materialFloors';

        if (record.get('bl_id')) {
            Space.Space.setPermanentFilterForFields(['bl_id'], [record.get('bl_id')], storeName, [], function () {
                if (Ext.getStore(storeName).getTotalCount() > 0) {
                    me.displayUpdatePanel(list, record);
                } else {
                    me.displayMaterialsList('bl', record);
                }
            }, me);
        } else {
            me.displayUpdatePanel(list, record);
        }
    },

    /**
     * When a building is clicked on the site map
     *
     * @param blId bl_id value
     */
    onClickBuilding: (function () {
        var isTapped = false;
        return function (blId) {
            var me = this.navController,
                siteMapView = me.getSiteMap(),
                storeName = 'materialFloors',
                store = Ext.getStore(storeName),
                recordNotFoundMsg = LocaleManager.getLocalizedString('Selected building is not registered in the current site.', 'MaterialInventory.controller.Navigation');

            if (!isTapped) {
                isTapped = true;
                if (blId) {
                    Space.Space.setPermanentFilterForFields(['bl_id'], [blId], storeName, [], function () {

                        me.getBuildingRecord(blId, function (buildingRecord) {
                            if (Ext.isEmpty(buildingRecord)) {
                                Ext.Msg.alert('', recordNotFoundMsg);
                                return;
                            }
                            if (store.getTotalCount() > 0) {
                                me.displayUpdatePanel(siteMapView, buildingRecord);

                                //KB3041816 - to call onStoreLoad for 'No More Records' text display
                                store.load();
                            } else {
                                me.displayMaterialsList('bl', buildingRecord);
                            }
                        }, me);
                    }, me);
                }
                setTimeout(function () {
                    isTapped = false;
                }, 500);
            }
        };
    })(),

    getBuildingRecord: function (blId, onCompleted, scope) {
        var buildingStore = Ext.getStore('materialBuildings'),
            filter = {
                property: 'bl_id',
                value: blId
            };

        buildingStore.retrieveRecord(filter, onCompleted, scope);
    },

    onFloorListTapped: function (list, index, target, record) {
        var me = this,
            storeName = 'materialRooms',
            roomsStore = Ext.getStore(storeName),
            blId, flId;

        blId = record.get('bl_id');
        flId = record.get('fl_id');

        me.filterPlanTypes(function () {
            // Apply the room list filter
            Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id'], [blId, flId], storeName, [], function () {
                if (roomsStore.getTotalCount() > 0) {
                    me.displayUpdatePanel(list, record);
                    //refresh the roomList to use the roomsStore's permanent filter
                    roomsStore.filter(roomsStore.permanentFilter);
                    roomsStore.load();
                } else {
                    me.displayMaterialsList('fl', record);
                }
            }, me);
        }, me);

    },

    filterPlanTypes: function (callbackFn, scope) {
        var me = this,
            planTypeStore = Ext.getStore('materialPlanTypes'),
            filterArray = [],
            filter;

        if (Ext.isEmpty(AppMode.getInventoryDate())) {

            filter = Ext.create('Common.util.Filter', {
                property: 'plan_type',
                value: MaterialInventory.util.Ui.planTypes.INVENTORY,
                conjunction: 'AND',
                exactMatch: true,
                operator: '<>'
            });
            filterArray.push(filter);

            planTypeStore.clearFilter();
            planTypeStore.setFilters(filterArray);
            planTypeStore.load(function () {
                Ext.callback(callbackFn, scope || me);
            }, me);
        } else {
            planTypeStore.clearFilter();
            planTypeStore.load(function () {
                Ext.callback(callbackFn, scope || me);
            }, me);
        }
    },

    onFloorPlanViewButtonToggled: function (segmentedButton, button, isPressed) {
        var buttonItemId = button.getItemId();

        if (isPressed) {
            switch (buttonItemId) {
                case 'roomList':
                    this.toggleFloorPlanDisplay(true);
                    break;
                case 'floorPlanView':
                    this.toggleFloorPlanDisplay(false);
                    break;
                default:
                    this.toggleFloorPlanDisplay(false);
                    break;
            }
        }
    },

    toggleFloorPlanDisplay: function (displayRoomList) {
        var planTypeButtonPicker = this.getPlanTypeButtonPicker(),
            planTypeRecord = planTypeButtonPicker.getValue(),
            floorPlanContainer = this.getFloorPlanContainer(),
            floorPlanView = this.getFloorPlanView(),
            roomList = this.getRoomList(),
            showMaterialsButton = roomList.down('button[action=showFloorMaterials]');

        planTypeButtonPicker.setHidden(displayRoomList);
        floorPlanContainer.setHidden(displayRoomList);
        roomList.setHidden(!displayRoomList);

        if (showMaterialsButton) {
            showMaterialsButton.setHidden(planTypeRecord && planTypeRecord.get('plan_type') === MaterialInventory.util.Ui.planTypes.LOCATE);
        }

        if (this.getFloorPlanTitleBar() && !Ext.isEmpty(planTypeRecord)) {
            Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), planTypeRecord, !displayRoomList);
        }

        if (!displayRoomList) {
            this.showSearchHighlight(floorPlanView);
        }
    },

    showSearchHighlight: function (floorPlanView) {
        var searchField = floorPlanView.down('search[itemId=floorPlanSearch]'),
            store = Ext.getStore('materialRooms');

        if (searchField && !searchField.getHidden()) {
            Space.SpaceFloorPlan.onHighlightBySearch(floorPlanView, searchField, store, ['rm_id', 'name']);
        }
    },

    /**
     * Handles the item selected event of the Floor Plan picker button
     *
     * @param planTypeRecord
     * @param [onCompleted] function to run on completed
     * @param [scope] scope for onCompleted function
     */
    onChangePlanType: function (planTypeRecord, onCompleted, scope) {
        var floorPlanView = this.getFloorPlanView(),
            record = floorPlanView.getRecord(),
            planType;

        if (this.getFloorPlanTitleBar() && !Ext.isEmpty(planTypeRecord)) {
            Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), planTypeRecord, true);
        }

        if (planTypeRecord) {
            planType = planTypeRecord.get('plan_type');
        }

        floorPlanView.setPlanType(planType);
        this.loadDrawing(floorPlanView, planType, record, onCompleted, scope);
    },

    loadDrawing: function (floorPlanView, planType, record, onCompleted, scope) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            searchField = me.getFloorPlanSearch(),
            store = Ext.getStore('materialRooms'),

            processSvgData = function (svgData) {
                if (svgData !== '') {
                    Space.SpaceFloorPlan.doProcessSvgData(svgData, floorPlanView);
                    if (planType !== MaterialInventory.util.Ui.planTypes.LOCATE) {
                        Space.SpaceFloorPlan.onHighlightBySearch(floorPlanView, searchField, store, ['rm_id', 'name']);
                    }
                }
                Mask.hideLoadingMask();
                Ext.callback(onCompleted, scope || me);
            };

        Mask.displayLoadingMask(me.getLoadingFloorPlanText());
        Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, null, processSvgData, me);
    },

    onRoomTap: function (roomCodes) {
        var me = this,
            codes = roomCodes.split(';'),
            blId = codes[0],
            flId = codes[1],
            rmId = codes[2],
            storeName = 'materialAisles';

        me.getRoomRecord(blId, flId, rmId, function (roomRecord) {
            Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'rm_id'], [blId, flId, rmId], storeName, [], function () {
                if (Ext.getStore(storeName).getTotalCount() > 0) {
                    me.displayUpdatePanel(me.getFloorPlanView(), roomRecord);
                } else {
                    me.displayMaterialsList('rm', roomRecord);
                }
            }, me);
        }, me);
    },

    getRoomRecord: function (blId, flId, rmId, onCompleted, scope) {
        var roomStore = Ext.getStore('materialRooms'),
            filterArray = [];

        filterArray.push({property: 'bl_id', value: blId});
        filterArray.push({property: 'fl_id', value: flId});
        filterArray.push({property: 'rm_id', value: rmId});

        roomStore.retrieveRecord(filterArray, onCompleted, scope);
    },

    onRoomListTapped: function (list, index, target, record) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            storeName = 'materialAisles';

        // tap on room list in Locate Room modal view should not navigate to a different view
        if (this.getNavigationBar().getCurrentView().xtype !== 'materialFloorPlanPanel') {
            return;
        }

        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'rm_id'], [blId, flId, rmId], storeName, [], function () {
            if (Ext.getStore(storeName).getTotalCount() > 0) {
                me.displayUpdatePanel(list, record);
            } else {
                me.displayMaterialsList('rm', record);
            }
        }, me);
    },

    onAisleListTapped: function (list, index, target, record) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            aisleId = record.get('aisle_id'),
            storeName = 'materialCabinets';

        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'rm_id', 'aisle_id'], [blId, flId, rmId, aisleId],
            storeName, [], function () {
                if (Ext.getStore(storeName).getTotalCount() > 0) {
                    me.displayUpdatePanel(list, record);
                } else {
                    me.displayMaterialsList('aisle', record);
                }
            }, me);
    },

    onCabinetListTapped: function (list, index, target, record) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            aisleId = record.get('aisle_id'),
            cabinetId = record.get('cabinet_id'),
            storeName = 'materialShelves';

        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id'],
            [blId, flId, rmId, aisleId, cabinetId], storeName, [], function () {
                if (Ext.getStore(storeName).getTotalCount() > 0) {
                    me.displayUpdatePanel(list, record);
                } else {
                    me.displayMaterialsList('cabinet', record);
                }
            }, me);
    },

    onShelfListTapped: function (list, index, target, record) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            rmId = record.get('rm_id'),
            aisleId = record.get('aisle_id'),
            cabinetId = record.get('cabinet_id'),
            shelfId = record.get('shelf_id'),
            storeName = 'materialBins';

        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id'],
            [blId, flId, rmId, aisleId, cabinetId, shelfId], storeName, [], function () {
                if (Ext.getStore(storeName).getTotalCount() > 0) {
                    me.displayUpdatePanel(list, record);
                } else {
                    me.displayMaterialsList('shelf', record);
                }
            }, me);
    },

    onBinListTapped: function (list, index, target, record) {
        this.displayMaterialsList('bin', record);
    },

    onMaterialListTapped: function (list, index, target, record) {
        this.displayUpdatePanel(list, record);
    },

    /**
     * @override
     * Set custom title for add panel.
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView The currently displayed view.
     */
    displayAddPanel: function (currentView) {
        var view = this.getModalAddPanel(currentView, {title: currentView.getAddTitle()}),
            store = Ext.getStore(view.getStoreId()),
            viewRecord = Ext.create(store.getModel());

        if (viewRecord) {
            // set default values
            this.setLocationFieldValuesFromFilters(viewRecord);
            viewRecord.set('container_status', 'IN INVENTORY');
            viewRecord.set('num_containers', '1');
            view.setRecord(viewRecord);
        }
        Ext.Viewport.add(view);
        view.show();
    },

    setLocationFieldValuesFromFilters: function (record) {
        var locationFields = ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],
            filters = Ext.getStore('materialLocations').getFilters(),
            i,
            fieldName,
            value;

        for (i = 0; i < filters.length; i++) {
            fieldName = filters[i].getProperty();
            if (locationFields.indexOf(fieldName) >= 0 && filters[i].getExactMatch()) {
                value = filters[i].getValue();
                record.set(fieldName, value);
            }
        }
        record.set('site_id', MaterialInventory.util.Ui.selectedSite);
    },

    compareWithLocationFieldValuesFromFilters: function (record) {
        var locationFields = ['bl_id', 'fl_id', 'rm_id', 'aisle_id', 'cabinet_id', 'shelf_id', 'bin_id'],
            filters = Ext.getStore('materialLocations').getFilters(),
            i,
            fieldName,
            value,
            result = true;

        for (i = 0; i < filters.length; i++) {
            fieldName = filters[i].getProperty();
            if (locationFields.indexOf(fieldName) >= 0 && filters[i].getExactMatch()) {
                value = filters[i].getValue();
                if (value !== record.get(fieldName)) {
                    result = false;
                    break;
                }
            }
        }
        return result;
    },

    displayUpdatePanel: function (view, record) {
        // Views are created when displayed and destroyed when
        // removed from the navigation view.
        var me = this,
            editView = view.getEditViewClass(),
            updateView = Ext.create(editView),
            titlePanel,
            title = LocaleManager.getLocalizedString('Floor Plans', 'MaterialInventory.controller.Navigation') + ' ' + record.get('bl_id') + '-' + record.get('fl_id');

        // Check if this is a list or edit view
        if (updateView.isNavigationList) {
            if (typeof updateView.setParentId === 'function') {
                if (updateView.xtype === 'materialSitePanel') {
                    updateView.setParentId(record.get('site_id'));
                }
                if (updateView.xtype === 'materialFloorsListPanel') {
                    updateView.setParentId(record.get('bl_id'));
                }
            }
            if (updateView.xtype === 'materialFloorsListPanel' || updateView.xtype === 'aisleslist' ||
                updateView.xtype === 'cabinetslist' || updateView.xtype === 'shelveslist' || updateView.xtype === 'binslist') {
                updateView.setParentRecord(record);
            }
        } else if (updateView.isFloorPlanPanel) {
            // Disable the keyboard hide event on the floor plan view. The view is zoommed when the keyboard
            // is hidden on Android devices. This causes some problems when we return to the view from the
            // survey forms.
            updateView.setDisableZoomOnKeyboardHide(true);

            // Retrieve drawing data for the selected floor;
            // Don't call Space.SpaceFloorPlan.loadFloorPlanData in order to highlight the room in callback function of afterChangePlanType
            updateView.setRecord(record);
            updateView.setTitle(title);
            me.setDefaultPlanTypeRecord(function () {
                me.getMainView().push(updateView);
            }, me);
        } else {
            updateView.setRecord(record);
        }

        if (updateView.xtype === 'materialForm') {
            if (AppMode.isReviewMode() || (AppMode.isInventoryMode() && Ext.isEmpty(AppMode.getInventoryDate()))) {
                updateView.setFormMode('readOnly');
                titlePanel = updateView.down('titlepanel');
                if (titlePanel) {
                    titlePanel.setTitle(updateView.getReviewTitle());
                }
            } else {
                updateView.setFormMode('edit');
            }
        }

        if (view.xtype === 'binslist') {
            me.displayMaterialsList('bin', record);
        } else {
            // for floor plan panel the update view is displayed after setting the plan type
            if (!updateView.isFloorPlanPanel) {
                me.getMainView().push(updateView);
            }
        }
    },

    setDefaultPlanTypeRecord: function (callbackFn, scope) {
        var me = this,
            planTypesStore = Ext.getStore('materialPlanTypes'),
            defaultPlanTypeIsActive,
            noActivePlanTypes = planTypesStore.getTotalCount() === 0,
            firstPlanType,
            defaultNotActiveFn = function () {
                if (noActivePlanTypes) {
                    //Ext.callback(callbackFn, scope);
                    me.onChangePlanType(null, callbackFn, scope);
                } else {
                    firstPlanType = planTypesStore.getAt(0).get('plan_type');
                    me.selectButtonPickerPlanType(firstPlanType, callbackFn, scope);
                }
            };

        if (Ext.isEmpty(AppMode.getInventoryDate())) {
            defaultPlanTypeIsActive = !Ext.isEmpty(planTypesStore.findRecord('plan_type', MaterialInventory.util.Ui.planTypes.HAZMAT));
            if (defaultPlanTypeIsActive) {
                me.selectButtonPickerPlanType(MaterialInventory.util.Ui.planTypes.HAZMAT, callbackFn, scope);
            } else {
                defaultNotActiveFn();
            }
        } else {
            defaultPlanTypeIsActive = !Ext.isEmpty(planTypesStore.findRecord('plan_type', MaterialInventory.util.Ui.planTypes.INVENTORY));
            if (defaultPlanTypeIsActive) {
                me.selectButtonPickerPlanType(MaterialInventory.util.Ui.planTypes.INVENTORY, callbackFn, scope);
            } else {
                defaultNotActiveFn();
            }
        }
    },

    /**
     * Filter materials location store and display the list view.
     * @param level the location level: 'bl', 'fl', 'rm', 'aisle', 'cabinet', 'shelf', 'bin'
     * @param record
     */
    displayMaterialsList: function (level, record) {
        var me = this,
            locationFilters = [],
            store = Ext.getStore('materialLocations'),
            listView;

        switch (level) {
            case 'bin':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bin_id', record.get('bin_id')));
            /* falls through */
            case 'shelf':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('shelf_id', record.get('shelf_id')));
            /* falls through */
            case 'cabinet':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('cabinet_id', record.get('cabinet_id')));
            /* falls through */
            case 'aisle':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('aisle_id', record.get('aisle_id')));
            /* falls through */
            case 'rm':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('rm_id', record.get('rm_id')));
            /* falls through */
            case 'fl':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('fl_id', record.get('fl_id')));
            /* falls through */
            case 'bl':
                locationFilters.push(MaterialInventory.util.Filter.createFilter('bl_id', record.get('bl_id')));
                break;
        }

        // save the location filter since on the same store are applied also search filters and restrictions from filter view
        store.locationFilter = locationFilters;

        //clear the search field filter before displaying the list
        store.searchFilter = [];

        listView = Ext.create('MaterialInventory.view.MaterialList');

        // KB3048973 - clear the restriction from Filter view before navigationg to material locations list view
        me.clearFilter(function () {
            me.getMainView().push(listView);
        });
    },

    /**
     * Reload the floor plan drawing if the displayed plan type is different then the selected plan type.
     * When an inventory starts or ends the corresponding plan type is selected even, but the drawing is updated when the view is displayed.
     */
    onDisplayFloorPlanView: function () {
        var floorPlanView = this.getFloorPlanView(),
            displayedPlanType = floorPlanView.getPlanType(),
            floorRecord = floorPlanView.getRecord(),
            planTypeRecord = Space.SpaceFloorPlan.getPlanTypeRecord(this.getPlanTypeButtonPicker()),
            selectedPlanType;

        if (planTypeRecord) {
            selectedPlanType = planTypeRecord.get('plan_type');
            if (displayedPlanType !== selectedPlanType || MaterialInventory.util.Ui.floorPlanNeedsReload) {
                this.onChangePlanType(planTypeRecord);
                MaterialInventory.util.Ui.floorPlanNeedsReload = false;
            }
        }

        if (selectedPlanType === MaterialInventory.util.Ui.planTypes.INVENTORY) {
            MaterialInventory.util.Ui.updateInventoryPlanHighlights(floorRecord);
        }
    },

    /**
     * Override to set the Auto Sync property to false before syncing the record
     * This is needed to prevent the record from being adding to the data base twice.
     * Saves the contents of the Edit Panel to the database Validates and displays validation errors on
     * the Edit Panel
     *
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView
     * The currently displayed view.
     *
     */
    saveEditPanel: function (currentView) {
        var me = this,
            record = currentView.getRecord(),
            store = Ext.getStore(currentView.getStoreId());

        // Check validation
        if (record.isValid()) {
            record.setChangedOnMobile();
            MaterialInventory.util.Materials.setTier2Value(record, function () {
                store.setAutoSync(false);
                store.add(record);

                store.sync(function () {
                    store.setAutoSync(true);

                    if (Ext.isEmpty(record.get('location_auto_number'))) {
                        record.set('location_auto_number', 'MID-' + record.getId());
                    }

                    // set flags has_materials and done_inventory_date
                    Mask.displayLoadingMask(me.getLoadingListsText());
                    MaterialInventory.util.Materials.setLocationFlags(record, function () {
                        MaterialInventory.util.Filter.applyMaterialLocationFilters(function () {
                            MaterialInventory.util.Ui.loadLocationStore(function () {
                                Mask.hideLoadingMask();
                                if (currentView.getIsCreateView()) {
                                    Ext.Viewport.remove(currentView);
                                } else {
                                    me.getMainView().pop();
                                }
                            });
                        }, me);
                    }, me);

                });
            }, me);
        } else {
            currentView.displayErrors(record);
        }
    },

    /**
     * Handle tap on locate icon button in Edit Material form.
     */
    onLocateMaterial: function () {
        var me = this,
            form = me.getNavigationBar().getCurrentView(),
            locateView,
            planType = MaterialInventory.util.Ui.planTypes.LOCATE,
            materialRecord = form.getRecord(),
            blId = materialRecord.get('bl_id'),
            flId = materialRecord.get('fl_id'),
            rmId = materialRecord.get('rm_id');

        locateView = me.getModalLocateView(blId, flId);

        // Apply the room list filter
        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'rm_id'], [blId, flId, rmId], 'materialRooms', [],
            function () {
                // Disable the keyboard hide event on the floor plan view. The view is zoommed when the keyboard
                // is hidden on Android devices. This causes some problems when we return to the view from the
                // survey forms.
                locateView.setDisableZoomOnKeyboardHide(true);
                locateView.setRecord(materialRecord);

                me.selectButtonPickerPlanType(planType, function () {
                    // drawing is loaded on select plan type
                    // the highlight is set on aftersvgload event

                    Ext.Viewport.add(locateView);
                    locateView.show();
                }, me);

            }, me);
    },

    getModalLocateView: function (blId, flId) {
        var me = this,
            view = Ext.create('MaterialInventory.view.space.FloorPlan'),
            title = LocaleManager.getLocalizedString('Floor Plans', 'MaterialInventory.controller.Navigation') + ' ' + blId + '-' + flId,
            titleBars = view.query('titlebar'),
            i,
            onCloseView = function () {
                me.setDefaultPlanTypeRecord(function () {
                    Ext.Viewport.remove(view);
                    // call on view popped handler function to show/hide buttons
                    me.onViewPopped(me.getMainView());
                });
            };

        for (i = 0; i < titleBars.length; i++) {
            if (titleBars[i].down('search')) {
                titleBars[i].add({
                    xtype: 'button',
                    text: LocaleManager.getLocalizedString('Close',
                        'MaterialInventory.controller.Navigation'),
                    align: 'right',
                    listeners: {
                        tap: onCloseView
                    }
                });
                titleBars[i].setTitle(title);

                // hide search field on locate view since store is already filtered
                titleBars[i].down('search').setHidden(true);
            } else {
                view.remove(titleBars[i]);
            }
        }

        view.setIsModal(true);
        return view;
    },

    highlightRoom: function (container, record) {
        var opts,
            assets = [];

        assets.push(record.get('bl_id') + ';' + record.get('fl_id') + ';' + record.get('rm_id'));

        opts = {'cssClass': 'zoomed-asset-bordered', removeStyle: false};
        container.findAssets(assets, opts);
    },

    selectButtonPickerPlanType: function (planType, callbackFn, scope) {
        var planTypeButtonPicker = this.getPlanTypeButtonPicker(),
            planTypeStore = Ext.getStore('materialPlanTypes'),
            filters = [],
            planTypeRecord;

        if (planType) {
            if (planType === MaterialInventory.util.Ui.planTypes.LOCATE) {
                planTypeRecord = Ext.create('MaterialInventory.model.MaterialPlanType');
                planTypeRecord.set('plan_type', planType);
                planTypeButtonPicker.setValue(planTypeRecord);
                Ext.callback(callbackFn, scope);
            } else {
                filters.push(MaterialInventory.util.Filter.createFilter('plan_type', planType));
                planTypeStore.retrieveRecord(filters, function (planTypeRec) {
                    planTypeButtonPicker.setValue(planTypeRec);
                    Ext.callback(callbackFn, scope);
                });
            }
        } else {
            Ext.callback(callbackFn, scope);
        }
    },

    /**
     * When the user enters or scans a Container ID the Number of Containers field will be set to 1 and will be disabled.
     * @param newValue
     */
    onContainerCodeChanged: function (newValue) {
        var numContainers = this.getNumContainersField();

        if (numContainers) {
            numContainers.setValue(1);
            numContainers.setReadOnly(!Ext.isEmpty(newValue));
        }
    },

    // Get last created floor plan view since multiple are created because of locate action, used by the toggle action
    getFloorPlanView: function () {
        var floorPlanViews = Ext.ComponentQuery.query('materialFloorPlanPanel');

        return floorPlanViews[floorPlanViews.length - 1];
    },

    // Get last created rooms list view since multiple are created because of locate action, used by the toggle action
    getRoomList: function () {
        var roomListViews = Ext.ComponentQuery.query('materialRoomsList');

        return roomListViews[roomListViews.length - 1];
    },

    // Get floor plan container for the current floor plan view
    getFloorPlanContainer: function () {
        var floorPlanView = this.getFloorPlanView();

        return floorPlanView.down('svgcomponent');
    },

    onChangeLocationFieldValue: function (field, newValue, oldValue, level, callbackFn, scope) {
        var me = this,
            record,
            isInventoryOpen = !Ext.isEmpty(AppMode.getInventoryDate()),
            fieldName = level + "_id",
            materialLocationRecord = this.getMaterialForm().getRecord(),
            onComplete = function () {
                Mask.hideLoadingMask();
                Ext.callback(callbackFn, scope);
            };

        if(Ext.isEmpty(newValue) && Ext.isEmpty(oldValue)){
            return;
        }

        if (Ext.isEmpty(newValue)) {
            MaterialInventory.util.Ui.loadLocationStore(callbackFn, scope);
            return;
        }

        if (field.getStore() && field.getStore().getData() && field.getStore().getData().items.length >= 1) {
            record = field.getStore().getData().items[0];
            if (record && me.isRecordInstanceOfLevelClass(level, record)) {
                Mask.displayLoadingMask(me.getLoadingListsText());
                // check new location and set has_materials 1 or 0
                MaterialInventory.util.Materials.updateHasMaterialsForLocationValue(fieldName, newValue, record)
                    .then(function () {
                        // check old location and set has_materials 1 or 0
                        MaterialInventory.util.Materials.updateHasMaterialsForLocationValue(fieldName, oldValue, record)
                            .then(function () {
                                // when location changes the material location record is no longer done and locations need to be marked as not done
                                if (isInventoryOpen && materialLocationRecord) {
                                    // while the form fields get popuated with the record, the materialLocationRecord is null and there is no need to update the flag done
                                    MaterialInventory.util.Materials.setFlagNotDoneForRecord(level, oldValue, materialLocationRecord, function () {
                                        onComplete();
                                    });
                                } else {
                                    onComplete();
                                }
                            }, me);
                    });
            }
        }
    },

    isRecordInstanceOfLevelClass: function (level, record) {
        var isRecordInstanceOfClass = false;
        switch (level) {
            case 'bl':
                isRecordInstanceOfClass = record instanceof MaterialInventory.model.space.MaterialBuilding;
                break;
            case 'fl':
                isRecordInstanceOfClass = record instanceof MaterialInventory.model.space.MaterialFloor;
                break;
            case 'rm':
                isRecordInstanceOfClass = record instanceof MaterialInventory.model.space.MaterialRoom;
                break;
            case 'aisle':
                isRecordInstanceOfClass = record instanceof MaterialInventory.model.space.MaterialAisle;
                break;
            case 'cabinet':
                isRecordInstanceOfClass = record instanceof MaterialInventory.model.space.MaterialCabinet;
                break;
            case 'shelf':
                isRecordInstanceOfClass = record instanceof MaterialInventory.model.space.MaterialShelf;
                break;
            case 'bin':
                isRecordInstanceOfClass = record instanceof MaterialInventory.model.space.MaterialBin;
                break;
        }

        return isRecordInstanceOfClass;
    },

    onScanLocation: function (locationLevel, scannedCode) {
        var me = this,
            promptField,
            view,
            store,
            filterArray = [],
            filter,
            codeNotFound,
            fieldId,
            promptListPanel,
            promptFieldClass,
            listItemId;

        if (Ext.isEmpty(scannedCode)) {
            return;
        }

        switch (locationLevel) {
            case 'rm':
                promptField = this.getRmPromptField();
                store = Ext.getStore('materialRooms');
                codeNotFound = LocaleManager.getLocalizedString('Room with code \'{0}\' not found.', 'MaterialInventory.controller.Navigation');
                fieldId = 'rm_id';
                promptListPanel = me.getRmPromptListPanel();
                promptFieldClass = 'MaterialInventory.view.prompt.RoomPromptList';
                listItemId = 'rmPromptList';
                break;

            case 'aisle':
                promptField = this.getAislePromptField();
                store = Ext.getStore('materialAisles');
                codeNotFound = LocaleManager.getLocalizedString('Aisle with code \'{0}\' not found.', 'MaterialInventory.controller.Navigation');
                fieldId = 'aisle_id';
                promptListPanel = me.getAislePromptListPanel();
                promptFieldClass = 'MaterialInventory.view.prompt.AislePromptList';
                listItemId = 'aislePromptList';
                break;

            case 'cabinet':
                promptField = this.getCabinetPromptField();
                store = Ext.getStore('materialCabinets');
                codeNotFound = LocaleManager.getLocalizedString('Cabinet with code \'{0}\' not found.', 'MaterialInventory.controller.Navigation');
                fieldId = 'cabinet_id';
                promptListPanel = me.getCabinetPromptListPanel();
                promptFieldClass = 'MaterialInventory.view.prompt.CabinetPromptList';
                listItemId = 'cabinetPromptList';
                break;

            case 'shelf':
                promptField = this.getShelfPromptField();
                store = Ext.getStore('materialShelves');
                codeNotFound = LocaleManager.getLocalizedString('Shelf with code \'{0}\' not found.', 'MaterialInventory.controller.Navigation');
                fieldId = 'shelf_id';
                promptListPanel = me.getShelfPromptListPanel();
                promptFieldClass = 'MaterialInventory.view.prompt.ShelfPromptList';
                listItemId = 'shelfPromptList';
                break;

            case 'bin':
                promptField = this.getBinPromptField();
                store = Ext.getStore('materialBins');
                codeNotFound = LocaleManager.getLocalizedString('Bin with code \'{0}\' not found.', 'MaterialInventory.controller.Navigation');
                fieldId = 'bin_id';
                promptListPanel = me.getBinPromptListPanel();
                promptFieldClass = 'MaterialInventory.view.prompt.BinPromptList';
                listItemId = 'binPromptList';
                break;

            default:
                return;
        }

        filter = Ext.create('Common.util.Filter', {
            property: fieldId,
            value: scannedCode,
            exactMatch: true
        });
        filterArray.push(filter);

        store.setFilters(filterArray);
        store.loadPage(1, function (records) {
            if (records.length === 0) {
                Ext.Msg.alert('', Ext.String.format(codeNotFound, scannedCode));
                return;
            } else if (records.length === 1) {
                promptField.setRecord(records[0]);
                promptField.updateValue(scannedCode);
            } else {
                if (promptListPanel) {
                    view = promptListPanel;
                } else {
                    promptField = Ext.create(promptFieldClass);
                    view = promptField.getPromptPanel();
                    view.setItemId(listItemId);
                    store.setFilters(filterArray);
                }
                Ext.Viewport.add(view);
                view.show();
            }
        }, me);
    },

    /**
     * Set the selected bin record on the prompt field so that parent fields get updated.
     * @param locationLevel 'bin', 'shelf'
     * @param list
     * @param index
     * @param target
     * @param record
     * @param e
     */
    setRecordFromPromptList: function (locationLevel, list, index, target, record, e) {
        var me = this,
            promptField,
            fieldId,
            promptListPanel;

        e.preventDefault();
        e.stopPropagation();

        switch (locationLevel) {
            case 'rm':
                promptField = this.getRmPromptField();
                fieldId = 'rm_id';
                promptListPanel = me.getRmPromptListPanel();
                break;

            case 'aisle':
                promptField = this.getAislePromptField();
                fieldId = 'aisle_id';
                promptListPanel = me.getAislePromptListPanel();
                break;

            case 'cabinet':
                promptField = this.getCabinetPromptField();
                fieldId = 'cabinet_id';
                promptListPanel = me.getCabinetPromptListPanel();
                break;

            case 'shelf':
                promptField = this.getShelfPromptField();
                fieldId = 'shelf_id';
                promptListPanel = me.getShelfPromptListPanel();
                break;

            case 'bin':
                promptField = this.getBinPromptField();
                fieldId = 'bin_id';
                promptListPanel = me.getBinPromptListPanel();
                break;

            default:
                return;
        }

        if (record) {
            promptField.setRecord(record);
            promptField.updateValue(record.get(fieldId));
        }

        setTimeout(function () {
            promptListPanel.hide();
        }, 300);

        // avoid calling also Common.control.field.Prompt#onListTap
        return false;
    }
});