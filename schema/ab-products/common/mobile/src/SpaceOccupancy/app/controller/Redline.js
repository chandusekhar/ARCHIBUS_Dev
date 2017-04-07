Ext.define('SpaceOccupancy.controller.Redline', {
    extend: 'Floorplan.controller.Redline',

    config: {
        refs: {
            mainView: 'mainview',
            planTypeButtonPicker: 'mainview buttonpicker[itemId=planTypePicker]',
            roomSurveyPromptListPanel: 'panel[itemId=roomPromptList]'
        },
        control: {
            'panel[itemId=roomPromptList] list': {
                itemtap: 'setRoomSurveyRecordFromPromptList'
            }
        },

        documentField: 'survey_redline_rm',

        redlineStoreId: 'occupancyRoomSurveyStore',

        roomPromptFieldConfig: {
            title: LocaleManager.getLocalizedString('Select Room', 'SpaceOccupancy.controller.Documents'),
            label: '',
            store: 'occupancyRoomSurveyStore',
            record: null,
            displayFields: [
                {
                    name: 'bl_id',
                    title: LocaleManager.getLocalizedString('Building Code', 'SpaceOccupancy.controller.Documents')
                },
                {
                    name: 'fl_id',
                    title: LocaleManager.getLocalizedString('Floor Code', 'SpaceOccupancy.controller.Documents')
                },
                {
                    name: 'rm_id',
                    title: LocaleManager.getLocalizedString('Room Code', 'SpaceOccupancy.controller.Documents')
                },
                {
                    name: 'rm_std',
                    title: LocaleManager.getLocalizedString('Room Standard', 'SpaceOccupancy.controller.Documents')
                }
            ],
            displayTemplate: {
                phone: '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Building:', 'SpaceOccupancy.controller.Documents') +
                    '</span><span>{bl_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Floor:', 'SpaceOccupancy.controller.Documents') +
                    '</span><span>{fl_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Room:', 'SpaceOccupancy.controller.Documents') +
                    '</span><span>{rm_id}</span></div>' +
                    '<div class="x-phone-prompt"><span class="prompt-label">' +
                    LocaleManager.getLocalizedString('Standard:', 'SpaceOccupancy.controller.Documents') +
                    '</span><span>{rm_std}</span></div>'
            },

            headerTemplate: {
                phone: '<div></div>'
            }
        }
    },


    /**
     * Override so that we can supply the selected Plan Type
     * @override
     */
    displayRedlineView: function () {
        var me = this,
            planType = Space.SpaceSurvey.getPressedPlanTypeButtonPlanType(me.getPlanTypeButtonPicker()),
            planTypeRecord;

        if (Ext.isEmpty(planType)) {
            planTypeRecord = Space.SpaceFloorPlan.getDefaultPlanTypeRecord();
            if (planTypeRecord) {
                planType = planTypeRecord.get('plan_type');
            }
        }

        me.setRedlinePlanType(planType);

        me.callParent();


    },


    /**
     * Override so we can display the Room Survey Prompt List when the Floor Plan view is displayed.
     * @override
     */
    onSaveImage: function () {
        var me = this,
            currentView = me.getMainView().getNavigationBar().getCurrentView(),  // currentView is the redline view
            record = currentView.getRecord(),
            store = Ext.getStore('occupancyRoomSurveyStore'),
            surveyId = SurveyState.getSurveyState().surveyId,
            filterArray;

        if (record instanceof Space.model.RoomSurvey) {
            me.saveRedlineData(record);
        } else if (record instanceof Space.model.SpaceFloor) {
            // We don't have a room id so display a list of rooms for the user to select from.
            filterArray = Space.Space.getFilterArray(record.get('bl_id'), record.get('fl_id'), null, surveyId);
            store.clearFilter();
            store.setFilters(filterArray);
            store.load(function () {
                var roomPromptField,
                    view;

                if (me.getRoomSurveyPromptListPanel()) {
                    me.getRoomSurveyPromptListPanel().show();
                } else {
                    me.getRoomPromptFieldConfig().record = record;
                    roomPromptField = Ext.create('Space.view.RoomSurveyPromptList', me.getRoomPromptFieldConfig());
                    view = roomPromptField.getPromptPanel();
                    view.setItemId('roomPromptList');
                    Ext.Viewport.add(view);
                }
            }, me);
        }
    },

    /**
     * Save the redline image into RoomSurvey records selected by user from prompted list.
     * @param list
     * @param index
     * @param target
     * @param record
     * @param e
     */
    setRoomSurveyRecordFromPromptList: function (list, index, target, record, e) {
        e.preventDefault();
        e.stopPropagation();

        this.saveRedlineData(record);
        this.getRoomSurveyPromptListPanel().hide();

        // avoid calling also Common.control.field.Prompt#onListTap
        return false;
    }
});