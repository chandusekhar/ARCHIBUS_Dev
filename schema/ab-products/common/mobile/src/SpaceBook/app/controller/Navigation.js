Ext.define('SpaceBook.controller.Navigation', {
    extend: 'Space.controller.Navigation',

    config: {
        refs: {
            mainView: 'mainview',
            roomList: 'roomslist',
            completeSurveyTaskButton: 'button[action=completeSurveyTask]',
            planTypeButtonPicker: 'mainview buttonpicker[itemId=planTypePicker]',
            surveyActionButtonPicker: 'mainview buttonpicker[itemId=surveyActionPicker]',
            homeButton: 'button[action=goToHomePage]',
            appsButton: 'button[action=backToAppLauncher]',
            downloadDataButton: 'button[itemId=downloadData]',
            downloadActionPicker: 'mainview buttonpicker[itemId=downloadActionPicker]',
            floorPlanSearchField: 'floorPlanPanel search', //used for both floor plan and room list
            divisionField: 'spaceRoomSurveyPanel divisionPrompt',
            categoryField: 'spaceRoomSurveyPanel roomCategoryPrompt',
            roomSurveyForm: 'spaceRoomSurveyPanel',
            redlineButton: 'button[action=openRedline]',
            floorPlanTitleBar: 'floorPlanPanel > titlebar',

            // required by setSurveyButtonVisibility function
            startSurveyButton: 'toolbarbutton[action=startSurvey]',
            syncSurveyButton: 'toolbarbutton[action=syncSurvey]',
            completeSurveyButton: 'toolbarbutton[action=completeSurvey]',
            addToSurveyButton: 'toolbarbutton[action=addToSurvey]',
            closeSurveyButton: 'toolbarbutton[action=closeSurvey]'
        },

        control: {
            mainView: {
                push: 'onViewPushed',
                pop: 'onViewPopped'
            },
            floorListView: {
                listitemtap: 'onFloorListTapped'
            },
            completeSurveyTaskButton: {
                tap: 'onCompleteSurveyTask'
            },
            categoryField: {
                clearicontap: function () {
                    var roomSurveyStore = Ext.getStore('roomSurveyStore');
                    SpaceBook.util.Ui.onPromptClearIconTap(roomSurveyStore, this.getRoomSurveyForm(), ['rm_cat', 'rm_type']);
                }
            },
            divisionField: {
                clearicontap: function () {
                    var roomSurveyStore = Ext.getStore('roomSurveyStore');
                    SpaceBook.util.Ui.onPromptClearIconTap(roomSurveyStore, this.getRoomSurveyForm(), ['dv_id', 'dp_id']);
                }
            },
            downloadActionPicker: {
                itemselected: 'selectActionListItem'
            }
        }
    },

    /**
     * Display existing survey in drop down menu.
     */
    launch: function () {
        SpaceBook.util.Ui.setActionPicker(this.getDownloadActionPicker());
    },

    onViewPushed: function (navView, view) {
        if (view.xtype === 'floorPlanPanel') {
            SpaceBook.util.Ui.setSurveyButtonVisibility(this);
            SpaceBook.util.Ui.updateRoomHighlight(view, this);
        }

        this.showHideToolbarButtons(view);

        if (view.xtype === 'floorPlanPanel') {
            this.getPlanTypeButtonPicker().setStore('spaceBookPlanTypes');
        }
    },

    onViewPopped: function (navView, view) {
        var navBar = this.getNavigationBar(),
            currentView = navBar.getCurrentView();

        if (currentView.xtype === 'floorPlanPanel') {
            SpaceBook.util.Ui.setSurveyButtonVisibility(this);
            this.updateFloorPlanViewTitle(currentView);
        }

        if (view.xtype === 'spaceRoomSurveyPanel') {
            // update the highlight: highlight rooms that have date_last_surveyed
            SpaceBook.util.Ui.updateRoomHighlight(view, this);
        }

        this.showHideToolbarButtons(currentView);

        this.callParent(arguments);
    },

    showHideToolbarButtons: function (view) {
        var viewXtype = view.xtype,
            selectedFloorPlanViewTab;

        if (viewXtype === 'floorPlanPanel') {
            selectedFloorPlanViewTab = view.down('segmentedbutton').getPressedButtons()[0].getItemId();
            this.getPlanTypeButtonPicker().setHidden(selectedFloorPlanViewTab === 'roomList');
        } else {
            this.getPlanTypeButtonPicker().setHidden(true);
        }

        this.getSurveyActionButtonPicker().setHidden(viewXtype !== 'floorPlanPanel');
        this.getHomeButton().setHidden(viewXtype === 'mainview' || viewXtype === 'sitePanel');
        this.getAppsButton().setHidden(viewXtype !== 'mainview');
        this.getDownloadDataButton().setHidden(viewXtype !== 'mainview');
        this.getDownloadActionPicker().setHidden(viewXtype !== 'mainview' && viewXtype !== 'sitePanel' && viewXtype !== 'floorsListPanel');
        this.getRedlineButton().setHidden(!(viewXtype === 'floorPlanPanel'
            || viewXtype === 'spaceRoomSurveyPanel') || !SurveyState.getSurveyState().isSurveyActive);
    },

    updateFloorPlanViewTitle:function(view){
        var selectedFloorPlanViewTab,
            planTypeRecord;

        selectedFloorPlanViewTab = view.down('segmentedbutton').getPressedButtons()[0].getItemId();
        if(selectedFloorPlanViewTab === 'roomList'){
            Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), null, false);
        }else{
            planTypeRecord = Space.SpaceFloorPlan.getPlanTypeRecord(this.getPlanTypeButtonPicker());
            Space.SpaceFloorPlan.showPlanTypeInTitle(this.getFloorPlanTitleBar(), planTypeRecord, true);
        }
    },

    /**
     * Displays an Edit Panel when the disclose action is fired by a List Panel. The Edit panel contains
     * the record from the list row that was clicked. The Edit Panel that is displayed is determined by
     * the List View editViewClass configuration property.
     *
     * @param {Ext.Container} view The List View that generated the itemDisclosed event.
     * @param {Ext.data.Model} record The record associated with the List View row that was clicked.
     */
    displayUpdatePanel: function (view, record) {
        // Views are created when displayed and destroyed when
        // removed from the navigation view.
        var editView = view.getEditViewClass(),
            updateView = Ext.create(editView);

        // Check if this is a list or edit view
        if (updateView.isNavigationList) {
            if (typeof updateView.setParentId === 'function') {
                if (updateView.xtype === 'sitePanel') {
                    updateView.setParentId(record.get('site_id'));
                }
                if (updateView.xtype === 'floorsListPanel') {
                    updateView.setParentId(record.get('bl_id'));
                }
            }
        } else if (updateView.isFloorPlanPanel) {
            // Disable the keyboard hide event on the floor plan view. The view is zoommed when the keyboard
            // is hidden on Android devices. This causes some problems when we return to the view from the
            // survey forms.
            updateView.setDisableZoomOnKeyboardHide(true);
            // Retrieve drawing data for the selected floor
            this.setDefaultPlanTypeRecord();
            Space.SpaceFloorPlan.loadFloorPlanData(updateView, record, this.getPlanTypeButtonPicker(), false);
        } else {
            updateView.setRecord(view, record);
        }

        this.getMainView().push(updateView);
    },

    setDefaultPlanTypeRecord: function () {
        var planTypeStore = Ext.getStore('planTypes'),
            spaceBookPlanTypes = Ext.getStore('spaceBookPlanTypes'),
            planTypeRecord,
            planType;

        if (spaceBookPlanTypes && spaceBookPlanTypes.getData().length > 0) {
            planType = spaceBookPlanTypes.getData().get(0).get('plan_type');
            if (planType) {
                planTypeRecord = planTypeStore.findRecord('plan_type', planType);
                this.getPlanTypeButtonPicker().setValue(planTypeRecord);
            }
        }
    },

    onFloorListTapped: function (list, index, target, record) {
        var me = this,
            roomSurveyStore = Ext.getStore('roomSurveyStore'),
            surveyId = SurveyState.getSurveyState().surveyId,
            blId, flId;


        blId = record.get('bl_id');
        flId = record.get('fl_id');

        list.setEditViewClass('Space.view.FloorPlan');

        // Apply the room list filter
        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id'], [blId, flId], 'roomsStore', [], function () {
            Space.SpaceSurvey.loadRoomSurveyStore('roomSurveyStore', surveyId, blId, flId, function () {
                me.displayUpdatePanel(list, record);
                //refresh the roomList to use the roomSurveyStore's permanent filter
                roomSurveyStore.filter(roomSurveyStore.permanentFilter);
                roomSurveyStore.load();
            }, me);
        }, me);
    },

    onCompleteSurveyTask: function () {
        var taskView = this.getMainView().getNavigationBar().getCurrentView(),
            dateLastSurveyed = taskView.query('datepickerfield[name=date_last_surveyed]'),
            taskRecord = taskView.getRecord(),
            currentDate = new Date();

        if (dateLastSurveyed && dateLastSurveyed.length > 0) {
            dateLastSurveyed[0].setValue(currentDate);
        } else {
            taskRecord.set('date_last_surveyed', currentDate);
        }

        this.saveEditPanel(taskView);
    },

    selectActionListItem: function (value) {
        var me = this,
            surveyFloors,
            list,
            store,
            blId,
            flId,
            filters = [],
            roomSurveyStore = Ext.getStore('roomSurveyStore'),
            surveyId = SurveyState.getSurveyState().surveyId,
            currentView = this.getMainView().getNavigationBar().getCurrentView();

        if (value.get('action') === 'goToSurvey') {
            surveyFloors = SurveyState.getFloorCodes();

            if (surveyFloors.length > 1) {
                // verify if floors list is already displayed
                if (currentView && currentView.xtype === 'floorsListPanel') {
                    return;
                }

                list = this.getBuildingList();
                if (Ext.isEmpty(list)) {
                    list = Ext.create('Space.view.BuildingList');
                }
                store = list.getStore();
                filters = Space.Space.getFilterArray(surveyFloors[0].bl_id);
                store.retrieveRecord(filters, function (buildingRecord) {
                    if (buildingRecord.get('bl_id')) {
                        Space.Space.setPermanentFilterForFields(['bl_id'], [buildingRecord.get('bl_id')], 'spaceBookFloors', [], function () {
                            me.displayUpdatePanel(list, buildingRecord);
                        }, me);
                    } else {
                        me.displayUpdatePanel(list, buildingRecord);
                    }
                }, me);
            } else {
                list = this.getFloorListView();
                if (Ext.isEmpty(list)) {
                    list = Ext.create('Space.view.FloorList');
                }
                store = list.getStore();

                list.setEditViewClass('Space.view.FloorPlan');

                filters = Space.Space.getFilterArray(surveyFloors[0].bl_id, surveyFloors[0].fl_id);
                store.retrieveRecord(filters, function (floorRecord) {
                    blId = floorRecord.get('bl_id');
                    flId = floorRecord.get('fl_id');
                    // Apply the room list filter
                    Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id'], [blId, flId], 'roomsStore', [], function () {
                        Space.SpaceSurvey.loadRoomSurveyStore('roomSurveyStore', surveyId, blId, flId, function () {
                            me.displayUpdatePanel(list, floorRecord);
                            //refresh the roomList to use the roomSurveyStore's permanent filter
                            roomSurveyStore.filter(roomSurveyStore.permanentFilter);
                            roomSurveyStore.load();
                        }, me);
                    }, me);
                }, me);
            }
        }
    }
});