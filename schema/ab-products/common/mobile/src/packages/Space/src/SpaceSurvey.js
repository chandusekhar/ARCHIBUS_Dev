/**
 * Utility class to manage survey operations on Space objects
 *
 * @author Ana Paduraru
 * @since 21.2
 */
Ext.define('Space.SpaceSurvey', {
    singleton: true,

    activeSurveyMessage:  Ext.String.format(LocaleManager.getLocalizedString('There is not an active survey for this floor.<br>To initiate a survey, tap the {0} icon and select \'Start Survey\'.',
        'Space.SpaceSurvey'), '<span class="ab-select-action-icon"></span>'),

    noRoomAvailableMessage: Ext.String.format(LocaleManager.getLocalizedString('There is no Room data available for the selected Room.<br>Tap the {0} icon and select \'Add to Survey\' to update the Room data.',
        'Space.SpaceSurvey'), '<span class="ab-select-action-icon"></span>'),
    
    /**
     * Sets the visibility of all of the buttons used in Survey Mode
     */
    setSurveyButtonVisibility: function (floorPlanRecord, planType, authorization, scope) {
        var surveyState = SurveyState.getSurveyState(),
            syncSurveyButton = scope.getSyncSurveyButton(),
            isSurveyActiveForFloor = this.getIsSurveyActiveForFloor(floorPlanRecord, surveyState),
            isSpaceOccupancy = (scope.getApplication().getName() === "SpaceOccupancy");

        if (surveyState.isSurveyActive) {
            this.showButton(syncSurveyButton, authorization.survey);
        } else {
            this.showButton(syncSurveyButton, false);
        }

        this.filterSurveyActions(surveyState.isSurveyActive, authorization, isSpaceOccupancy, isSurveyActiveForFloor);

    },

    /**
     * Displays the view for starting a survey.
     * @param scope
     */
    displayStartSurvey: function (scope) {
        // Display the Start Survey Form
        var surveyModel = Ext.create('Space.model.SpaceSurvey'),
            startSurveyView,
            surveyCode = Space.SpaceSurvey.generateSurveyCode(scope.getFloorPlanView().getRecord());

        startSurveyView = Ext.create('Space.view.StartSurvey', {
            record: surveyModel
        });
        startSurveyView.setValues({
            em_id: ConfigFileManager.employeeId,
            survey_id: surveyCode
        });

        scope.getMainView().push(startSurveyView);
    },

    /**
     * Save the Space Survey data from the view for starting a survey.
     *
     * @param view
     * @return Promise object
     */
    saveSpaceSurvey: function (view, surveyType) {
        var store = Ext.getStore('spaceSurveysStore'),
            record = view.getRecord(),
            userName = ConfigFileManager.username;

        record.set('mob_is_changed', 1);
        record.set('mob_locked_by', userName);
        record.set('status', 'Issued');
        record.set('survey_date', new Date());
        record.set('survey_type', surveyType);

        store.add(record);
        return new Promise(function (resolve, reject) {
            store.sync(resolve, reject);
        });
    },

    filterSurveyActions: function (surveyIsActive, authorization, isSpaceOccupancy, isSurveyActiveForFloor, onCompleted, scope) {
        var me = this,
            filterArray = [],
            surveyActionsStore = Ext.getStore('surveyActionsStore'),
            i,
            filterByFunction = function (record) {
                for (i = 0; i < filterArray.length; i++) {
                    if (record.get('action') === filterArray[i]) {
                        return true;
                    }
                }

                return false;
            };

        if (surveyIsActive) {
            if (authorization.survey && !isSpaceOccupancy) {
                filterArray.push('complete');
            }
            if (authorization.surveyPost) {
                filterArray.push('close');
            }
            if (!isSurveyActiveForFloor && authorization.survey) {
                filterArray.push('add');
            }
        } else {
            if (authorization.survey) {
                filterArray.push('start');
            }
        }

        surveyActionsStore.clearFilter();
        surveyActionsStore.filterBy(filterByFunction);
        surveyActionsStore.loadPage(1, function () {
            Ext.callback(onCompleted, scope || me);
        }, scope);
    },

    getIsSurveyActiveForFloor: function (floorPlanRecord, surveyState) {
        var floorPlanData = floorPlanRecord.getData(),
            floorCodes = surveyState.floorCodes, i;

        if (!floorPlanRecord) {
            return false;
        }

        for (i = 0; i < floorCodes.length; i++) {
            if (floorCodes[i].bl_id === floorPlanData.bl_id &&
                floorCodes[i].fl_id === floorPlanData.fl_id) {
                return true;
            }
        }
        return false;
    },

    /**
     * Wraps button hiding logic into a positive logic expression
     * @private
     * @param button
     * @param show
     */
    showButton: function (button, show) {
        if (button) {
            button.setHidden(!show);
        }
    },

    /**
     * Get the last selected plan type.
     */
    getPressedPlanTypeButtonPlanType: function (planTypePicker) {
        var lastSelectedPlanTypeRecord = planTypePicker.getValue(),
            planType = null;
        if (lastSelectedPlanTypeRecord) {
            planType = lastSelectedPlanTypeRecord.get('plan_type');
        }
        return planType;
    },

    /**
     * Generates the survey code using the format
     * bl_id-fl_id YYYY-MM-dd H:m username
     */
    generateSurveyCode: function (floorPlanRecord) {
        var blId = floorPlanRecord.get('bl_id'),
            flId = floorPlanRecord.get('fl_id'),
            userName = ConfigFileManager.username,
            surveyCode;

        surveyCode = blId + '-' + flId + ' ' + Ext.DateExtras.format(new Date(), 'Y-m-d H:i') +
            ' ' + userName;

        return surveyCode;
    },

    loadRoomSurveyStore: function (roomSurveyStoreId, surveyId, blId, flId, callbackFn, scope) {
        var me = this;

        if (!surveyId) {
            surveyId = '';
        }

        Space.Space.setPermanentFilterForFields(['bl_id', 'fl_id', 'survey_id'], [blId, flId, surveyId],
            roomSurveyStoreId, [], callbackFn, scope || me);
    },

    /**
     * Sete permanent filters and load store.
     * @param storeId
     * @param surveyId
     * @param blId
     * @param flId
     * @returns Promise object
     */
    setFiltersAndLoadStore: function (storeId, surveyId, blId, flId) {
        if (!surveyId) {
            surveyId = '';
        }

        Space.Space.setPermanentFiltersWithoutLoad(['bl_id', 'fl_id', 'survey_id'], [blId, flId, surveyId],
            storeId, []);

        return SyncManager.loadStore(storeId);
    },

    filterStoresBySurveyId: function (storeIds, surveyId) {
        var i,
            filterArray = [],
            filter = Ext.create('Common.util.Filter', {
                property: 'survey_id',
                value: surveyId,
                exactMatch: true
            });

        filterArray.push(filter);

        for (i = 0; i < storeIds.length; i++) {
            Ext.getStore(storeIds[i]).filter(filterArray);
        }
    },

    displayNoActiveSurveyMessage: function() {
        var activeSurveyMessage = Space.SpaceSurvey.activeSurveyMessage;
        if(Ext.os.is.WindowsPhone) {
            activeSurveyMessage = activeSurveyMessage.replace('<br>', ' ').replace('<span class="ab-select-action-icon"></span>', ' V ');
            navigator.notification.alert(activeSurveyMessage, Ext.emtpyFn, LocalizedStrings.z_Survey );
        } else {
            Ext.Msg.alert(LocalizedStrings.z_Survey, activeSurveyMessage);
        }
    },
    
    displayNoRoomAvailableMessage: function() {
        var noRoomMessage = Space.SpaceSurvey.noRoomAvailableMessage;
        if(Ext.os.is.WindowsPhone) {
            noRoomMessage = noRoomMessage.replace('<span class="ab-select-action-icon"></span>', ' V ');
            navigator.notification.alert(noRoomMessage, Ext.emtpyFn, LocalizedStrings.z_Survey );
        } else {
            Ext.Msg.alert(LocalizedStrings.z_Survey, noRoomMessage);
        }
    }


});