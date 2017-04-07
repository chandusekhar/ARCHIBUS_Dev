/**
 * Utility class to manage operations regarding floor plans on Space objects
 *
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Space.SpaceFloorPlan', {
    singleton: true,

    requires: 'Floorplan.util.Drawing',

    /**
     * Loads the floor plan SVG for the Floor Plan views.
     * @param {Ext.Container} view
     * @param {Ext.data.Model} record
     * @param {Object} planTypePicker
     * @param {Boolean} useOnlyActivePlanTypes
     */
    loadFloorPlanData: function (view, record, planTypePicker, useOnlyActivePlanTypes) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            title = LocaleManager.getLocalizedString('Floor Plans', 'Space.SpaceFloorPlan') + ' ' + blId + '-' + flId,
            fireItemSelected = function () {
                var planTypeRecord = me.getPlanTypeRecord(planTypePicker);
                planTypePicker.fireEvent('itemselected', planTypeRecord);
            };

        view.setRecord(record);
        view.setTitle(title);

        if (useOnlyActivePlanTypes) {
            me.filterActivePlanTypes(fireItemSelected, me);
        } else {
            fireItemSelected();
        }
    },

    filterActivePlanTypes: function (callbackFn, scope) {
        var filter,
            filterArray = [],
            planTypesStore = Ext.getStore('planTypes'),
            sorters = [
                {
                    property: 'title',
                    direction: 'ASC'
                }
            ];

        filter = Ext.create('Common.util.Filter', {
            property: 'active',
            value: 1,
            conjunction: 'AND',
            exactMatch: true
        });
        filterArray.push(filter);

        planTypesStore.clearFilter();
        planTypesStore.filter(filterArray);
        planTypesStore.setSorters(sorters);
        planTypesStore.load(callbackFn, scope);
    },

    /**
     * Returns the last selected plan type record or
     * the default plan type record (the first one in the list).
     */
    getPlanTypeRecord: function (planTypePicker) {
        var lastSelectedPlanTypeRecord,
            record;

        lastSelectedPlanTypeRecord = planTypePicker.getValue();
        if (lastSelectedPlanTypeRecord) {
            record = lastSelectedPlanTypeRecord;
        }
        return record;
    },

    /**
     * Common actions on plan type selection.
     * @param floorPlanPanel
     * @param planTypeRecord
     * @param scope caller scope
     */
    onPlanTypeSelection: function (floorPlanPanel, planTypeRecord, scope) {
        var surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId;

        if (scope.getFloorPlanTitleBar() && !Ext.isEmpty(planTypeRecord)) {
            this.showPlanTypeInTitle(scope.getFloorPlanTitleBar(), planTypeRecord, true);
        }

        this.onChangePlanType(floorPlanPanel, planTypeRecord, surveyId, Ext.emptyFn, this);
    },

    onChangePlanType: function (floorPlanView, planTypeRecord, surveyId, onCompleted, scope) {
        var record = floorPlanView.getRecord(),
            planType;

        if (planTypeRecord) {
            planType = planTypeRecord.get('plan_type');
        }

        floorPlanView.setPlanType(planType);
        this.loadDrawing(floorPlanView, planType, record, surveyId, onCompleted, scope);
    },


    loadDrawing: function (floorPlanView, planType, record, surveyId, onCompleted, scope) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),

            processSvgData = function (svgData) {
                var floorPlanRoomList = floorPlanView.query('roomslist')[0],
                    roomSurveyStore;

                if (svgData !== '') {
                    me.doProcessSvgData(svgData, floorPlanView);
                    me.showSearchHighlight(floorPlanView);
                    // Set highlights for survey plan type
                    if (planType && (planType === '9 - SURVEY' || planType === '17 - SURVEY-TRANS')) {
                        if (floorPlanView && floorPlanRoomList && surveyId) {
                            roomSurveyStore = floorPlanRoomList.getStore();
                            Common.util.RoomHighlight.updateSurveyPlanHighlights(surveyId, floorPlanView.getRecord(), roomSurveyStore);
                        }
                    }
                }
                Ext.callback(onCompleted, scope || me);
            };

        Floorplan.util.Drawing.readDrawingFromStorageOrRetrieveIfNot(blId, flId, planType, null, processSvgData, me);
    },

    doProcessSvgData: function (svgData, view) {
        var me = this;

        view.setSvgData(svgData);

        // TODO: Add option to disable adding events
        view.setEventHandlers([me.getRoomEventHandlerConfig(view)]);
    },

    getRoomEventHandlerConfig: function (view) {
        return {
            assetType: 'rm',
            handler: view.onClickRoom,
            scope: view
        };
    },

    showSearchHighlight: function (floorPlanView) {
        var searchField = Ext.ComponentQuery.query('search[itemId=floorPlanSearch]')[0],
            store = Ext.getStore('roomsStore');

        Space.SpaceFloorPlan.onHighlightBySearch(floorPlanView, searchField, store, ['rm_id', 'name']);
    },

    /**
     * Highlight, on floor plan, rooms that meet the search criteria.
     */
    onHighlightBySearch: function (floorPlanView, searchField, store, filterFields, scanResult) {
        this.highlightBySearch('floor', floorPlanView, searchField, store, filterFields, scanResult);
    },

    onClearHighlightBySearch: function (floorPlanView) {
        //if (!Ext.isEmpty(floorPlanView.divId)) {
        floorPlanView.clearFoundAssets();
        floorPlanView.zoomExtents();
        //}
    },

    /**
     * Highlight, on site map, buildings that meet the search criteria.
     */
    onHighlightBlBySearch: function (siteView, searchField, buildingsStore, filterFields) {
        var store = Ext.getStore(buildingsStore);
        this.highlightBySearch('site', siteView, searchField, store, filterFields);
    },

    /**
     * Highlight, on site map or floor plan, buildings or rooms that meet the search criteria.
     * @param type 'site' or 'floor'
     */
    highlightBySearch: function (type, view, searchField, store, filterFields, scanResult) {
        var me = this,
            filterArray = [],
            value = searchField.getValue(),
            assets = [],
            floorPlanType,
            barcodeFormat,
            container = (type === 'site' ? view.query('siteMapPanel')[0] : view),
            clearHighlight = function () {
                // KB3045888 when type is site the container doesn't have the function getPlanType
                if (container && Ext.isFunction(container.getPlanType)) {
                    floorPlanType = container.getPlanType();
                }
                if (!Ext.isEmpty(floorPlanType) && (floorPlanType === '12 - HOTELING' || floorPlanType === '11 - RESERVATIONS' ||
                    floorPlanType === '13 - LOCATE EM' || floorPlanType === '14 - LOCATE RM' || floorPlanType === '15 - MY DEPT SPACE')) {
                    // KB 3045866 the plan is already zoomed in; do not zoom out
                    container.clearFoundAssets();
                } else {
                    me.onClearHighlightBySearch(container);
                }
            };

        //TODO: Check isFloorPlanPanel logic
        if (container.isHidden() || !container.isFloorPlanPanel) {
            return;
        }

        if (value) {
            if (scanResult && scanResult.fields) {
                barcodeFormat = searchField.getBarcodeFormat();
                filterArray = Space.Space.buildDecodedTaskSearchFilters(scanResult, barcodeFormat);
            } else {
                Ext.each(filterFields, function (field) {
                    var filter = Ext.create('Common.util.Filter', {
                        property: field,
                        value: value,
                        conjunction: 'OR',
                        anyMatch: true
                    });
                    filterArray.push(filter);
                });
                if (store.permanentFilter) {
                    filterArray = filterArray.concat(store.permanentFilter);
                }
            }

            store.clearFilter();
            store.filter(filterArray);
            store.load(function (records) {
                var opts;
                Ext.each(records, function (record) {
                    if (type === 'site') {
                        assets.push(record.get('bl_id'));
                    } else {
                        assets.push(record.get('bl_id') + ';' + record.get('fl_id') + ';' + record.get('rm_id'));
                    }
                });

                opts = {'cssClass': 'zoomed-asset-bordered', removeStyle: false};
                container.findAssets(assets, opts);
            });
        } else {
            clearHighlight();
        }
    },

    getBlAndFlFilter: function (initialFilter) {
        var filterArray = [];

        Ext.each(initialFilter, function (clause) {
            if (clause.getProperty() === 'bl_id' || clause.getProperty() === 'fl_id') {
                filterArray.push(clause);
            }
        });

        return filterArray;
    },

    getSiteFilter: function (initialFilter) {
        var filterArray = [];

        Ext.each(initialFilter, function (clause) {
            if (clause.getProperty() === 'site_id') {
                filterArray.push(clause);
            }
        });

        return filterArray;
    },

    getDefaultPlanTypeRecord: function () {
        var planTypeStore = Ext.getStore('planTypes'),
            defaultRecord;


        if (!planTypeStore.isLoaded()) {
            throw new Error(LocaleManager.getLocalizedString('The Plan Type data is not loaded.', 'Space.SpaceFloorPlan'));
        }

        defaultRecord = planTypeStore.first();

        return defaultRecord;
    },

    onFloorPlanViewButtonToggled: function (button, isPressed, scope) {
        var buttonItemId = button.getItemId();

        if (isPressed) {
            switch (buttonItemId) {
                case 'roomList':
                    this.toggleFloorPlanDisplay(true, scope);
                    break;
                case 'floorPlanView':
                    this.toggleFloorPlanDisplay(false, scope);
                    break;
                default:
                    this.toggleFloorPlanDisplay(false, scope);
                    break;
            }
        }
    },

    toggleFloorPlanDisplay: function (displayRoomList, scope) {
        var planTypeButtonPicker = scope.getPlanTypeButtonPicker(),
            planTypeRecord = planTypeButtonPicker.getValue(),
            floorPlanContainer = scope.getFloorPlanContainer(),
            floorPlanView = scope.getFloorPlanView(),
            roomList = scope.getRoomList();

        planTypeButtonPicker.setHidden(displayRoomList);
        floorPlanContainer.setHidden(displayRoomList);
        roomList.setHidden(!displayRoomList);

        if (scope.getFloorPlanTitleBar() && !Ext.isEmpty(planTypeRecord)) {
            this.showPlanTypeInTitle(scope.getFloorPlanTitleBar(), planTypeRecord, !displayRoomList);
        }

        if (!displayRoomList) {
            this.showSearchHighlight(floorPlanView);
        }
    },

    /**
     * Add the Plan Type Name after "Rooms" in floor plan title bar.
     *
     * @param floorPlanTitleBar the title bar to be changed
     * @param planTypeRecord the current plan type record
     * @param includePlanType boolean to include the plan type in the title or set the title just 'Rooms'
     */
    showPlanTypeInTitle: function (floorPlanTitleBar, planTypeRecord, includePlanType) {
        var roomsTitle = LocaleManager.getLocalizedString('Rooms', 'Space.SpaceFloorPlan'),
            planType,
            defaultPlanTypeRecord,
            parentPanel = floorPlanTitleBar.getParent();

        if (includePlanType) {
            if (planTypeRecord) {
                planType = planTypeRecord.get('title');
            } else {
                defaultPlanTypeRecord = this.getDefaultPlanTypeRecord();
                if (defaultPlanTypeRecord) {
                    planType = defaultPlanTypeRecord.get('title');
                }
            }
            if (planType) {
                floorPlanTitleBar.setTitle(roomsTitle + ' - ' + planType);
            } else {
                floorPlanTitleBar.setTitle(roomsTitle);
            }
        } else {
            floorPlanTitleBar.setTitle(roomsTitle);
        }

        if(parentPanel){
            parentPanel.setTitle(floorPlanTitleBar.getTitle());
        }
    }
});