Ext.define('SpaceOccupancy.controller.FloorPlan', {

    extend: 'Ext.app.Controller',

    requires: 'Space.SpaceSurvey',

    config: {
        refs: {
            mainView: 'mainview',
            planTypeButtonPicker: 'mainview buttonpicker[itemId=planTypePicker]',
            floorPlanView: 'floorPlanPanel',
            floorPlanViewSelectButton: 'floorPlanPanel > toolbar[docked=bottom] > segmentedbutton',
            roomList: 'roomslist',
            roomSurveyPanel: 'spaceOccupRoomSurveyPanel',
            startSurveyButton: 'toolbarbutton[action=startSurvey]',

            // used in Space package
            floorPlanContainer: 'floorPlanPanel svgcomponent',
            floorPlanTitleBar: 'floorPlanPanel > titlebar'
        },
        control: {
            floorPlanViewSelectButton: {
                toggle: 'onFloorPlanViewButtonToggled'
            },
            floorPlanView: {
                roomtap: 'displayRoomSurvey'
            },
            roomList: {
                roomlisttap: 'displayRoomSurvey'

            },
            planTypeButtonPicker: {
                itemselected: 'onChangePlanType',
                onPickerTap: function (list) {
                    var existActivePlanTypes = Space.SpaceDownload.verifyExistActivePlanTypesForApp('spaceOccupancyPlanTypes'),
                        listSelectionCount = list.getSelectionCount(), record;

                    if (existActivePlanTypes && listSelectionCount === 0) {
                        record = Space.SpaceFloorPlan.getPlanTypeRecord(this.getPlanTypeButtonPicker());
                        list.select(record, false, true); //select( records, keepExisting, suppressEvent )
                    }
                }
            }
        }

    },

    /**
     * Handles the item selected event of the Floor Plan picker button
     *
     * @param planTypeRecord
     */
    onChangePlanType: function (planTypeRecord) {
        var floorPlanPanel = this.getFloorPlanView(),
            planType,
            surveyButton = this.getStartSurveyButton();

        //if this is not the first load
        if (surveyButton) {
            // TODO: avoid calling other controllers...
            this.getApplication().getController('SpaceOccupancy.controller.Survey').setSurveyButtonVisibility();
            if (planTypeRecord) {
                planType = planTypeRecord.get('plan_type');
            }
        }

        Space.SpaceFloorPlan.onPlanTypeSelection(floorPlanPanel, planTypeRecord, this);

        if (surveyButton && surveyButton.getHidden() === false && planType !== SpaceOccupancy.util.Ui.getSurveyPlanType()) {
            surveyButton.setHidden(true);
        }
    },

    onFloorPlanViewButtonToggled: function (segmentedButton, button, isPressed) {
        Space.SpaceFloorPlan.onFloorPlanViewButtonToggled(button, isPressed, this);
    },

    /**
     * Displays the Room Survey form.
     *
     * @param roomCode {String} Contains room code as bl_id;fl_id;rm_id.
     */
    displayRoomSurvey: function (roomCode) {
        var me = this,
            surveyState = SurveyState.getSurveyState();
        
        if (!surveyState.isSurveyActive) {
            Space.SpaceSurvey.displayNoActiveSurveyMessage();
        } else {
            me.getRoomRecord(roomCode, function (roomRecord) {
                if (roomRecord === null) {
                    Space.SpaceSurvey.displayNoRoomAvailableMessage();
                } else {
                    roomRecord.set('survey_id', surveyState.surveyId);
                    me.doDisplayRoomSurvey(roomCode, roomRecord);
                }
            }, me);
        }
    },

    doDisplayRoomSurvey: function (roomCode, roomRecord) {
        var me = this,
            navView = me.getMainView(),
            codes = roomCode.split(';'),
            roomSurveyView,
            filterArray;

        //set filters for RoomSurvey store for swipe navigation
        var roomStore = Ext.getStore('occupancyRoomSurveyStore'),
            disablePaging = roomStore.getDisablePaging();
        filterArray = Space.Space.getFilterArray(codes[0], codes[1], null, SurveyState.getSurveyState().surveyId);
        roomStore.setFilters(filterArray);

        roomSurveyView = Ext.create('SpaceOccupancy.view.RoomCarousel');

        //load all records for current floor for swipe navigation
        roomStore.setDisablePaging(true);
        roomStore.load(function () {
            roomStore.setDisablePaging(disablePaging);
            roomSurveyView.setRecord(roomRecord);

            SpaceOccupancy.util.Filters.applyFiltersOnRoomSurveyPanel(roomSurveyView.getDisplayedView(), roomRecord);

            navView.push(roomSurveyView);
        });
    },

    getRoomRecord: function (roomCodes, onCompleted, scope) {
        var roomStore = Ext.getStore('occupancyRoomSurveyStore'),
            surveyId = SurveyState.getSurveyState().surveyId,
            codes = roomCodes.split(';'),
            filterArray;

        filterArray = Space.Space.getFilterArray(codes[0], codes[1], codes[2], surveyId);
        roomStore.retrieveRecord(filterArray, onCompleted, scope);
    }
});
