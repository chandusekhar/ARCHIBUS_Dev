Ext.define('SpaceBook.controller.FloorPlan', {

    extend: 'Ext.app.Controller',

    requires: [
        'Space.model.RoomSurvey',
        'Space.SpaceSurvey'
    ],

    config: {
        refs: {
            mainView: 'mainview',
            planTypeButtonPicker: 'mainview buttonpicker[itemId=planTypePicker]',
            floorPlanView: 'floorPlanPanel',
            floorPlanViewSelectButton: 'floorPlanPanel > toolbar[docked=bottom] > segmentedbutton',
            roomList: 'roomslist',
            startSurveyButton: 'toolbarbutton[action=startSurvey]',

            //used in Space.SpaceFloorPlan
            floorPlanContainer: 'floorPlanPanel > svgcomponent',
            floorPlanTitleBar: 'floorPlanPanel > titlebar',

            // required by setSurveyButtonVisibility function
            syncSurveyButton: 'toolbarbutton[action=syncSurvey]',
            completeSurveyButton: 'toolbarbutton[action=completeSurvey]',
            addToSurveyButton: 'toolbarbutton[action=addToSurvey]',
            closeSurveyButton: 'toolbarbutton[action=closeSurvey]'
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
                    var existActivePlanTypes = Space.SpaceDownload.verifyExistActivePlanTypesForApp('spaceBookPlanTypes'),
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
            SpaceBook.util.Ui.setSurveyButtonVisibility(this);
            if (planTypeRecord) {
                planType = planTypeRecord.get('plan_type');
            }
        }

        Space.SpaceFloorPlan.onPlanTypeSelection(floorPlanPanel, planTypeRecord, this);

        if (surveyButton && surveyButton.getHidden() === false && planType !== '9 - SURVEY') {
            surveyButton.setHidden(true);
        }
    },

    onFloorPlanViewButtonToggled: function (segmentedButton, button, isPressed) {
        Space.SpaceFloorPlan.onFloorPlanViewButtonToggled(button, isPressed, this);
    },

    /**
     * Displays the Room Survey form.
     *
     * @param {String} roomCodes Semi-colon delimited string containing the Building Code, Floor Code and Room Code
     * with the format bl_id;fl_id;rm_id
     */
    displayRoomSurvey: function (roomCodes) {
        var me = this,
            codes = roomCodes.split(';'),
            roomSurveyView,
            surveyState = SurveyState.getSurveyState(),
            userAppAuthorization = SpaceBook.util.Ui.getUserAppAuthorization();

        // Check if the user can access the survey features
        if (userAppAuthorization.survey === false && userAppAuthorization.surveyPost === false) {
            return;
        }

        if (!surveyState.isSurveyActive) {
            Space.SpaceSurvey.displayNoActiveSurveyMessage();
        } else {
            me.getRoomRecord(codes, function (roomRecord) {
                if (roomRecord === null) {
                    Space.SpaceSurvey.displayNoRoomAvailableMessage();
                } else {
                    roomSurveyView = Ext.create('SpaceBook.view.RoomSurvey');
                    roomRecord.set('survey_id', surveyState.surveyId);
                    roomSurveyView.setRecord(roomRecord);
                    me.getMainView().push(roomSurveyView);
                }
            }, me);
        }
    },

    getRoomRecord: function (codes, callbackFn, scope) {
        var roomStore = Ext.getStore('roomSurveyStore'),
            surveyId = SurveyState.getSurveyState().surveyId,
            filters;

        filters = [
            {property: "survey_id", value: surveyId},
            {property: "bl_id", value: codes[0]},
            {property: "fl_id", value: codes[1]},
            {property: "rm_id", value: codes[2]}
        ];

        roomStore.retrieveRecord(filters, callbackFn, scope);
    }
});