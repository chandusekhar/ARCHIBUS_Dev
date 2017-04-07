Ext.define('SpaceBook.util.Ui', {

    requires: 'Common.util.UserProfile',
    singleton: true,

    /**
     * Retrieves the user group settings
     * @returns {Object}
     */

    getUserAppAuthorization: function () {
        var userGroupStore = Ext.getStore('userGroups'),
            surveyGroup = false,
            surveyPostGroup = false,
            surveyGroupRecord,
            surveyPostGroupRecord,

            userAuthorization = {
                survey: false,
                surveyPost: false
            };

        surveyGroupRecord = userGroupStore.findRecord('groupName', 'SPAC-SURVEY');
        if (surveyGroupRecord) {
            surveyGroup = surveyGroupRecord.get('isMember');
        }

        surveyPostGroupRecord = userGroupStore.findRecord('groupName', 'SPAC-SURVEY-POST');
        if (surveyPostGroupRecord) {
            surveyPostGroup = surveyPostGroupRecord.get('isMember');
        }

        userAuthorization.survey = surveyGroup;
        userAuthorization.surveyPost = surveyPostGroup;

        return userAuthorization;
    },

    /**
     * Checks the users group memberships on app start
     * @param {Function} onCompleted
     * @param {Object} scope
     */
    applyUserGroupsOnStartUp: function (onCompleted, scope) {
        var me = this,
            onFinish = function () {
                Common.service.Session.end()
                    .then(function () {
                        Ext.callback(onCompleted, scope || me);
                    }, function () {
                        Ext.callback(onCompleted, scope || me);
                    });
            };

        Network.checkNetworkConnectionAndLoadDwrScripts(false)
            .then(function (isConnected) {
                if (isConnected) {
                    Common.service.Session.start()
                        .then(function () {
                            return me.applyUserGroups();
                        })
                        .then(null, function (error) {
                            Ext.Msg.alert('', error);
                            return Promise.reject();
                        })
                        .done(onFinish, onFinish);
                } else {
                    Ext.callback(onCompleted, scope || me);
                }
            }, function (error) {
                Ext.Msg.alert('', error);
                Ext.callback(onCompleted, scope || me);
            });
    },

    applyUserGroups: function () {
        var userGroups = [
            {
                userName: ConfigFileManager.username,
                groupName: 'SPAC-SURVEY',
                isMember: false
            },
            {
                userName: ConfigFileManager.username,
                groupName: 'SPAC-SURVEY-POST',
                isMember: false
            }
        ];

        return SpaceBook.util.Ui.checkGroupMembership(userGroups)
            .then(function (groups) {
                return SpaceBook.util.Ui.updateUserGroupsStore(groups);
            });
    },

    /**
     * Checks if the user is a member of each group in groupsToCheck
     * @param {Object[]} groupsToCheck An array of group objects to check the user's membership in.
     */
    checkGroupMembership: function (groupsToCheck) {

        var checkGroups = function () {
            var p = Promise.resolve();
            groupsToCheck.forEach(function (group) {
                p = p.then(function () {
                    return MobileSecurityServiceAdapter.isUserMemberOfGroup(group.groupName)
                        .then(function (isMember) {
                            group.isMember = isMember;
                            return Promise.resolve(groupsToCheck);
                        });
                });

            });
            return p;
        };

        return checkGroups();
    },


    updateUserGroupsStore: function (userGroups) {
        var me = this,
            userGroupsStore = Ext.getStore('userGroups'),
            setUserGroupsValues = function (resolve) {
                Ext.each(userGroups, function (group) {
                    var userGroupModel = Ext.create('Space.model.UserGroup');
                    userGroupModel.setData(group);
                    userGroupsStore.add(userGroupModel);
                }, me);

                userGroupsStore.sync(resolve);
            };

        return new Promise(function (resolve, reject) {
            // Load the store to make sure the table is created.
            SyncManager.loadStore(userGroupsStore)
                .then(function () {
                    userGroupsStore.removeAll();
                    // We also need to delete any UserGroup records from the client database
                    return userGroupsStore.deleteAllRecordsFromTable('UserGroup');
                })
                .then(function () {
                    userGroupsStore.sync();
                })
                .then(function () {
                    if (userGroupsStore.getRemovedRecords().length > 0) {
                        me.timeout(function () {
                            setUserGroupsValues(resolve);
                        }, me);
                    } else {
                        setUserGroupsValues(resolve);
                    }
                }, function (error) {
                    reject(error);
                });
        });
    },

    // KB3049449 - need to wait while removed records are destroyed before adding new records.
    timeout: function (callbackFn, scope) {
        var me = this,
            userGroupsStore = Ext.getStore('userGroups');
        setTimeout(function () {
            if (userGroupsStore.getRemovedRecords().length > 0) {
                me.timeout(callbackFn, scope);
            } else {
                Ext.callback(callbackFn, scope || me);
            }
        }, 100);
    },

    /**
     * Shows or hide the buttons 'Start Survey', 'Add to Survey, 'Sync Survey', 'Complete Survey' and 'Close Survey'.
     * Scope need to contain references for: floorPlanView, planTypePicker, startSurveyButton, syncSurveyButton,
     * addToSurveyButton, closeSurveyButton, completeSurveyButton.
     * @param scope
     */
    setSurveyButtonVisibility: function (scope) {
        var floorPlanView = scope.getFloorPlanView(),
            floorPlanRecord = floorPlanView.getRecord(),
            planTypeButtonPicker = scope.getPlanTypeButtonPicker(),
            planType = Space.SpaceSurvey.getPressedPlanTypeButtonPlanType(planTypeButtonPicker),
            authorization = this.getUserAppAuthorization();

        Space.SpaceSurvey.setSurveyButtonVisibility(floorPlanRecord, planType, authorization, scope);
    },

    /**
     * Update the highlight: highlight rooms that have date_last_surveyed and update room list by search criteria.
     */
    updateRoomHighlight: function (view, scope) {
        var floorPlanView = scope.getFloorPlanView(),
            planTypeButtonPicker = scope.getPlanTypeButtonPicker(),
            planType = Space.SpaceSurvey.getPressedPlanTypeButtonPlanType(planTypeButtonPicker),
            surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            roomSurveyStore;

        if (floorPlanView) {
            roomSurveyStore = floorPlanView.query('roomslist')[0].getStore();

            if (planType === '9 - SURVEY') {
                Common.util.RoomHighlight.updateSurveyPlanHighlights(surveyId, view.getRecord(), roomSurveyStore);
            }

            //store has a permanent filter for surveyId, blId, rmId
            Space.Space.onSearch(scope.getFloorPlanSearchField(), roomSurveyStore.getStoreId(), ['rm_id', 'name']);
        }

    },

    onPromptClearIconTap: function (store, form, fields) {
        var autoSync = store.getAutoSync(),
            record = form.getRecord(),
            i;

        if (record) {
            store.setAutoSync(false);
            for (i = 0; i < fields.length; i++) {
                record.set(fields[i], '');
            }
            store.setAutoSync(autoSync);
            form.setRecord(record);
        }
    },

    setActionPicker: function (downloadActionPicker) {
        var surveyState = SurveyState.getSurveyState(),
            surveyId = surveyState.surveyId,
            data = [
                {
                    action: 'start',
                    text: LocaleManager.getLocalizedString('Download Floor Plans', 'SpaceBook.util.Ui')
                }
            ],
            store;


        if (!Ext.isEmpty(surveyId)) {
            data.push({
                action: 'goToSurvey',
                text: LocaleManager.getLocalizedString('Active Survey: ', 'SpaceBook.util.Ui') + surveyId
            })
        }

        store = new Ext.data.Store({
            storeId: 'dropDownOccupancyDownloadListStore',
            data: data

        });

        //reset the list panel to display the new items and set the new store
        downloadActionPicker.listPanel = null;
        downloadActionPicker.setStore(store);
    }
});