/**
 * 01.22.2015 JM - Removed code that sets Task Container panel title to 'Completed Task'. Completed tasks
 * are no longer displayed after completing the survey. See KB 3046246
 */
Ext.define('AssetAndEquipmentSurvey.controller.Navigation', {
    extend: 'Common.controller.NavigationController',

    config: {
        refs: {
            mainView: 'main',
            taskEditPanel: 'taskEditPanel',
            taskListView: 'taskListPanel',
            surveySearchField: 'surveyListPanel search',
            taskSearchField: 'taskListPanel search',
            floorPlanSegmentedButton: 'taskContainer segmentedbutton',
            taskFloorPlanList: 'floorPlanList',
            taskContainer: 'taskContainer',
            taskFloorPlanPanel: 'taskFloorPlanPanel',
            completeSurveyButton: 'button[action=completeEquipmentSurvey]',
            surveySortField: 'selectfield[name=surveySortField]',
            sortField: 'selectfield[name=sortTasks]',
            commentsField: 'taskEditPanel textareafield[name=survey_comments]',
            eqIdField: 'taskEditPanel barcodefield[name=eq_id]',
            completeSurveyTaskButton: 'button[action=completeSurveyTask]',
            carousel: 'swipecarousel',
            taskPromptListPanel: 'taskPromptList',
            floorPlanPanel: 'floorplanpanel',
            surveyListPanel: 'surveyListPanel',
            homeButton: 'button[action=goToHomePage]'
        },

        control: {
            surveySearchField: {
                searchkeyup: 'onSearchSurveyList',
                searchclearicontap: 'onClearSurveySearch'
            },
            taskSearchField: {
                searchkeyup: function (searchFieldValue) {
                    // call onSearchTaskList with only one parameter
                    this.onSearchTaskList(searchFieldValue);
                },
                searchclearicontap: 'onClearSearch',
                scancomplete: 'onScanSearchTask'
            },
            floorPlanSegmentedButton: {
                toggle: 'onFloorPlanButtonToggled'
            },
            surveySortField: {
                change: 'onApplySurveySort'
            },
            sortField: {
                change: 'onApplySort'
            },
            commentsField: {
                focus: 'onCommentsFieldFocus'
            },
            eqIdField: {
                scancomplete: function (scanresult) {
                    var value = scanresult.code,
                        eqIdField = this.getEqIdField(),
                        maxLength = eqIdField.getMaxLength();

                    if (value.length > maxLength) {
                        Ext.Msg.confirm('', Ext.String.format(this.getCodeTooBigMsg(), maxLength), function (buttonId) {
                            if (buttonId === 'yes') {
                                eqIdField.setValue(value.substr(0, maxLength));
                            }else{
                                eqIdField.setValue('');
                            }
                        });
                    }
                }
            },
            completeSurveyTaskButton: {
                tap: 'onCompleteSurveyTask'
            },
            carousel: {
                viewchanged: 'onTaskViewChanged'
            },
            'button[action=cancelTaskPromptList]': {
                tap: function () {
                    this.getTaskPromptListPanel().hide();
                }
            },
            'taskPromptList search': {
                searchkeyup: 'onSearchTaskPromptList',
                searchclearicontap: 'onClearTaskPromptSearch'
            },
            surveyListPanel: {
                itemSingleTapped: function (item, record) {
                    AssetAndEquipmentSurvey.util.RoomHighlight.surveyDate = Ext.Date.format(record.get('survey_date'), 'Y-m-d');
                }
            },
            homeButton: {
                tap: 'onGoToHomePage'
            }
        },

        codeTooBigMsg: LocaleManager.getLocalizedString('Only asset codes with {0} characters or less are supported. Codes with more than {0} characters will be truncated.', 'AssetAndEquipmentSurvey.controller.Navigation')
    },

    /**
     * Override
     *
     * @param view
     * @param record
     */
    displayUpdatePanel: function (view, record) {
        // Views are created when displayed and destroyed when removed from the
        // navigation view.
        var me = this,
            editView = view.getEditViewClass(),
            updateView,
            taskList,
            surveyId = record.get('survey_id');

        if(editView === 'AssetAndEquipmentSurvey.view.Task'){
            // set the record after creating the view when the fields are generated dinamically
            updateView = Ext.create(editView, {record:null});
        }else{
            updateView = Ext.create(editView, me.getTaskEditPanelConfig(editView, record));
        }
        taskList = me.getTaskListView();

        if (updateView.xtype === 'taskContainer') {
            updateView.setRecord(record);
            me.getFloorPlanSegmentedButton().setPressedButtons(0);
            // Filter task list
            AssetAndEquipmentSurvey.util.Filter.filterTaskList(surveyId, function () {
                taskList.setSurveyId(surveyId);
                me.getMainView().push(updateView);
            }, me);
        } else {
            if (updateView.isFloorPlanPanel) {
                updateView.setRecord(record);
                // Retrieve the svg data
                Floorplan.util.Floorplan.readFloorPlan(record.get('bl_id'), record.get('fl_id'), 'TaskFloorPlan')
                    .then(function (svgData) {
                        updateView.setSvgData(svgData);
                        updateView.setEventHandlers([
                            {
                                assetType: 'rm',
                                handler: me.onClickRoom,
                                scope: me
                            }
                        ]);
                        me.getMainView().push(updateView);
                    });
            } else if (updateView.xtype === 'taskcarousel') {
                me.getMainView().push(updateView);
            } else{
                //called when barcode scanned in assets list search identifies only one record
                //called from Floor Plan assets list for rooms with multiple assets
                updateView.setRecord(record);
                me.getMainView().push(updateView);
            }
        }
    },

    getTaskEditPanelConfig: function (editView, record) {
        var taskEditPanelConfig = {};
        if (editView === 'AssetAndEquipmentSurvey.view.TaskCarousel' ||
            editView === 'AssetAndEquipmentSurvey.view.Task') {
            taskEditPanelConfig = {
                record: record,
                // need the surveyId set before calling generateFields in the AssetAndEquipmentSurvey.view.Task#initialize function,
                // which is called before applyRecord function
                surveyId: record.get('survey_id')
            };
        }
        return taskEditPanelConfig;
    },

    onViewPopped: function (mainView, poppedView) {
        // Reload task list when returning from the edit task view
        var taskListStore = Ext.getStore('surveyTasksStore'),
            navBar = mainView.getNavigationBar(),
            currentView = navBar.getCurrentView(),
            addButton = navBar.getAddButton(),
            surveyId, status, currentViewRecord, taskList, isListView;

        // add button will be displayed in taskContainer and function setTaskContainerButtons sets its visibility
        addButton.setHidden(true);

        if (poppedView.xtype === 'taskEditPanel') {
            taskListStore.loadPage(1);
        }
        if (poppedView.xtype === 'taskFloorPlanPanel') {
            surveyId = poppedView.getSurveyId();
            taskListStore.clearFilter();
            taskListStore.filter('survey_id', surveyId);
            taskListStore.loadPage(1);
        }
        if (currentView) {
            if (currentView.xtype === 'taskContainer') {
                taskList = this.getTaskListView();
                isListView = !Ext.isEmpty(taskList) && !taskList.isHidden();

                this.setTaskContainerTitle(isListView);

                currentViewRecord = currentView.getRecord();
                if (currentViewRecord) {
                    status = currentView.getRecord().get('status');
                    this.setTaskContainerButtons(status);
                }
            } else if (currentView.xtype === 'taskFloorPlanPanel') {
                // update the highlight: rooms having all assets surveyed
                AssetAndEquipmentSurvey.util.RoomHighlight.updateSurveyPlanHighlights(currentView.getRecord());
            }

            this.getHomeButton().setHidden(currentView.xtype === 'main' || currentView.xtype === 'taskContainer');
        }
    },

    onViewPushed: function (mainView, pushedView) {
        var me = this,
            status,
            record = pushedView.getRecord(),
            isSurveyComplete,
            navBar = mainView.getNavigationBar(),
            addButton = navBar.getAddButton();

        me.callParent(arguments);
        AssetAndEquipmentSurvey.util.Ui.lastViewDispayed = pushedView;

        addButton.setHidden(true);

        this.getHomeButton().setHidden(pushedView.xtype === 'main' || pushedView.xtype === 'taskContainer');

        if (pushedView.xtype === 'taskContainer') {
            status = record.get('status');
            me.setTaskContainerButtons(status);
        }

        if (pushedView.xtype === 'taskEditPanel') {
            if (pushedView.getIsCreateView()) {
                isSurveyComplete = record.get('survey_complete');
                mainView.getNavigationBar().getSaveButton().setHidden(isSurveyComplete);
                me.getCompleteSurveyTaskButton().setHidden(true);
            } else {
                me.getCompleteSurveyTaskButton().setHidden(false);
            }
        }
    },

    onGoToHomePage: function () {
        this.getMainView().reset();
    },

    onSearchSurveyList: function (searchFieldValue) {
        // Filter the Survey table
        var surveysStore = Ext.getStore('surveysStore'),
            searchFields = ['survey_id', 'description', 'survey_date'],
            filters = this.buildSearchFilters(searchFields, searchFieldValue);

        surveysStore.clearFilter();
        surveysStore.setFilters(filters);
        surveysStore.load();
    },

    /**
     * Remove all filters.
     */
    onClearSurveySearch: function () {
        var surveysStore = Ext.getStore('surveysStore');

        surveysStore.clearFilter();
        surveysStore.loadPage(1);
    },

    onSearchTaskList: function (searchFieldValue, callbackFn, scope) {
        // Filter the Task table
        var searchFields = ['eq_id', 'eq_std', 'bl_id', 'fl_id', 'rm_id'],
            filters = this.buildSearchFilters(searchFields, searchFieldValue);

        this.filterTasksStore(filters, callbackFn, scope);
    },

    filterTasksStore: function (filters, callbackFn, scope) {
        var taskStore = Ext.getStore('surveyTasksStore'),
            currentFilters = taskStore.getFilters();

        taskStore.clearFilter();
        filters.unshift(currentFilters[0]);
        taskStore.setFilters(filters);
        taskStore.load(callbackFn, scope);
    },

    onScanSearchTask: function (scanResult) {
        var me = this,
            searchField = this.getTaskSearchField(),
            barcodeFormat,
            filterArray = [],
            onCompleted = function (records) {
                if (records.length === 1) {
                    // display the edit panel for the scanned task
                    me.displayUpdatePanel(me.getNavigationBar().getCurrentView(), records[0]);
                }
            };

        if (searchField) {
            barcodeFormat = searchField.getBarcodeFormat();
            if (Ext.isEmpty(barcodeFormat)) {
                me.onSearchTaskList(scanResult.code, onCompleted, me);
            } else {
                filterArray = me.buildDecodedTaskSearchFilters(scanResult, barcodeFormat);
                this.filterTasksStore(filterArray, onCompleted, me);
            }
        }
    },

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
                    exactMatch: true
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
     * Remove all filters except the survey id filter.
     */
    onClearSearch: function () {
        var taskContainer = this.getTaskContainer(),
            surveyId = taskContainer.getSurveyId(),
            taskStore = Ext.getStore('surveyTasksStore');

        taskStore.clearFilter();
        taskStore.filter('survey_id', surveyId);
        taskStore.loadPage(1);
    },

    onSearchTaskPromptList: function (searchFieldValue) {
        var taskStore = Ext.getStore('surveyTasksStore'),
            searchFields = ['eq_id', 'eq_std', 'bl_id', 'fl_id', 'rm_id'],
            filters = this.buildSearchFilters(searchFields, searchFieldValue),
            currentFilters = taskStore.getFilters(),
            taskPromptListPanel = this.getTaskPromptListPanel(),
            taskFilters = taskPromptListPanel.getTaskFilters(),
            allFilters;

        taskStore.clearFilter();
        filters.unshift(currentFilters[0]);

        allFilters = filters.concat(taskFilters);
        taskStore.setFilters(allFilters);
        taskStore.load();
    },

    onClearTaskPromptSearch: function () {
        var taskStore = Ext.getStore('surveyTasksStore'),
            taskPromptListPanel = this.getTaskPromptListPanel(),
            taskFilters = taskPromptListPanel.getTaskFilters();

        taskStore.clearFilter();
        taskStore.setFilters(taskFilters);
        taskStore.loadPage(1);
    },

    buildSearchFilters: function (searchFields, searchValue) {
        var filterArray = [];

        Ext.each(searchFields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field,
                value: searchValue,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        return filterArray;
    },

    onFloorPlanButtonToggled: function (segmentedButton, button, isPressed) {
        var me = this,
            buttonId,
            taskList = me.getTaskListView(),
            taskFloorList = me.getTaskFloorPlanList(),
            hide;

        if (isPressed) {
            buttonId = button.getItemId();
            hide = (buttonId === 'floorPlan');
            taskList.setHidden(hide);
            taskFloorList.setHidden(!hide);
            me.setTaskContainerTitle(!hide);
        }
    },

    // TODO: Need a better way to handle the title switch
    setTaskContainerTitle: function (isListView) {
        var mainView = this.getMainView(),
            navBar = mainView.getNavigationBar(),
            equipmentItemsTitle = LocaleManager.getLocalizedString('Equipment Items', 'AssetAndEquipmentSurvey.controller.Navigation'),
            floorPlanSurveyTitle = LocaleManager.getLocalizedString('Floor Plans for Survey', 'AssetAndEquipmentSurvey.controller.Navigation'),
            title;

        title = isListView ? equipmentItemsTitle : floorPlanSurveyTitle;

        navBar.setTitle(title);
    },

    /**
     * The function used for the Floorplan view room click/tap handler.
     */
    onClickRoom: (function () {
        var canFireEvent = true;
        return function (locationCodes) {
            if (canFireEvent) {
                canFireEvent = false;
                AssetAndEquipmentSurvey.app.fireEvent('roomtapped', locationCodes);
                setTimeout(function () {
                    canFireEvent = true;
                }, 1000);
            }
        };
    }()),

    onAddSurveyTask: function () {
        var mainView = this.getMainView(),
            taskContainer = this.getTaskContainer(),
            taskView = Ext.create('AssetAndEquipmentSurvey.view.Task', {
                isCreateView: true,
                surveyId: taskContainer.getSurveyId()
            });

        mainView.push(taskView);
    },

    /**
     * @override
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView
     * The currently displayed view.
     */
    displayAddPanel: function (currentView) {
        var view = this.getModalAddPanel(currentView, {
            surveyId: this.getTaskContainer().getSurveyId(),
            displayCameraIcon: true,
            appName: 'AssetAndEquipmentSurvey'
        });

        Ext.Viewport.add(view);
        AssetAndEquipmentSurvey.util.Ui.lastViewDispayed = view;
        view.show();
    },

    onCompleteSurveyTask: function () {
        var editTaskView,
            dateLastSurveyed,
            taskRecord,
            currentDate = new Date();

        if (!Ext.isEmpty(this.getCarousel()) && !Ext.isEmpty(this.getCarousel().getDisplayedView())) {
            editTaskView = this.getCarousel().getDisplayedView();
        } else {
            editTaskView = this.getNavigationBar().getCurrentView();
        }

        dateLastSurveyed = editTaskView.query('datepickerfield[name=date_last_surveyed]');
        taskRecord = editTaskView.getRecord();

        if (dateLastSurveyed && dateLastSurveyed.length > 0) {
            dateLastSurveyed[0].setValue(currentDate);
        } else {
            taskRecord.set('date_last_surveyed', currentDate);
        }
    },

    setTaskContainerButtons: function (status) {
        var addButton = this.getNavigationBar().getAddButton(),
            completeSurveyButton = this.getCompleteSurveyButton(),
            isComplete = (status === 'Complete');

        if (addButton) {
            addButton.setHidden(isComplete);
        }
        if (completeSurveyButton) {
            completeSurveyButton.setHidden(isComplete);
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
            isCreateView = currentView.getIsCreateView(),
            store = Ext.getStore(currentView.getStoreId());

        // Check validation
        if (record.isValid()) {
            me.isDistinctEquipment(record, store, function () {
                record.setChangedOnMobile();
                store.setAutoSync(false);
                store.add(record);
                store.sync(function () {
                    store.setAutoSync(true);
                    store.load(function () {
                        if (isCreateView) {
                            Ext.Viewport.remove(currentView);
                        } else {
                            me.getMainView().pop();
                        }
                    });
                });
            }, me);
        } else {
            currentView.displayErrors(record);
        }
    },

    /**
     * Displays an alert message if the same equipment already exists.
     * @param {Ext.data.Model} record
     * @param store
     * @param callbackFn
     * @param scope
     */
    isDistinctEquipment: function (record, store, callbackFn, scope) {
        var me = this,
            filterArray = [],
            saveSameEquipmentTitle = LocaleManager.getLocalizedString('Same equipment',
                'AssetAndEquipmentSurvey.controller.Navigation'),
            saveSameEquipmentMessage = LocaleManager.getLocalizedString('An equipment item with the same code already exists in {0}-{1}-{2}. If you continue the equipment will be saved in this location on sync. Proceed?',
                'AssetAndEquipmentSurvey.controller.Navigation'),
            message,
            blId,
            flId,
            rmId;

        filterArray.push(Ext.create('Common.util.Filter', {
            property: 'eq_id',
            value: record.get('eq_id'),
            exactMatch: true
        }));
        filterArray.push(Ext.create('Common.util.Filter', {
            property: 'survey_id',
            value: record.get('survey_id'),
            exactMatch: true
        }));

        store.retrieveAllStoreRecords(filterArray, function (records) {
            if (records && records.length > 0) {
                blId = Ext.isEmpty(records[0].get('bl_id')) ? '' : records[0].get('bl_id');
                flId = Ext.isEmpty(records[0].get('fl_id')) ? '' : records[0].get('fl_id');
                rmId = Ext.isEmpty(records[0].get('rm_id')) ? '' : records[0].get('rm_id');
                message = Ext.String.format(saveSameEquipmentMessage, blId, flId, rmId);
                Ext.Msg.confirm(saveSameEquipmentTitle, message, function (buttonId) {
                    if (buttonId === 'yes') {
                        Ext.callback(callbackFn, scope || me);
                    }
                });
            } else {
                Ext.callback(callbackFn, scope || me);
            }
        });
    },

    onApplySurveySort: function (field, value) {
        var surveysStore = Ext.getStore('surveysStore'),
            surveySort = [
                {
                    property: 'survey_id',
                    direction: 'ASC'
                }
            ],
            dateSort = [
                {
                    property: 'survey_date',
                    direction: 'ASC'
                }
            ];

        if (value === 'survey') {
            surveysStore.setSorters(surveySort);
        } else {
            surveysStore.setSorters(dateSort);
        }
        surveysStore.loadPage(1);
    },

    onApplySort: function (field, value) {
        var taskStore = Ext.getStore('surveyTasksStore'),
            eqSort = [
                {
                    property: 'eq_id',
                    direction: 'ASC'
                }
            ],
            locationSort = [
                {
                    property: 'bl_id',
                    direction: 'ASC'
                },
                {
                    property: 'fl_id',
                    direction: 'ASC'
                },
                {
                    property: 'rm_id',
                    direction: 'ASC'
                }
            ];

        if (value === 'equipment') {
            taskStore.setSorters(eqSort);
        } else {
            taskStore.setSorters(locationSort);
        }
        taskStore.loadPage(1);
    },

    /**
     * On Comments field focus,
     * insert Survey Code and Survey Date at the beginning of the field,
     * if the field is not modified and the record is not modified
     */
    onCommentsFieldFocus: function (field) {
        var fieldValue = field.getValue(),
            currentView = this.getMainView().getNavigationBar().getCurrentView(),
            currentViewRecord = currentView.getRecord(),
            mobIsChanged = currentViewRecord.get('mob_is_changed'),
            surveyId = currentViewRecord.get('survey_id'),
            surveyStore = Ext.getStore('surveysStore'),
            surveyRecord = surveyStore.findRecord('survey_id', surveyId),
            surveyDate = surveyRecord.get('survey_date'),
            localizedDate = '',
            surveyInfo,
            surveyLabel = LocaleManager.getLocalizedString('Survey Code', 'AssetAndEquipmentSurvey.controller.Navigation'),
            surveyDateLabel = LocaleManager.getLocalizedString('Survey Date', 'AssetAndEquipmentSurvey.controller.Navigation');

        if (mobIsChanged && field.isDirty()) {
            return;
        }

        if (Ext.isDate(surveyDate)) {
            localizedDate = Ext.DateExtras.format(surveyDate, LocaleManager.getLocalizedDateFormat());
        }

        surveyInfo = surveyLabel + ' ' + surveyId + ' ' + surveyDateLabel + ' ' + localizedDate;

        field.setValue(surveyInfo + '\n\n' + fieldValue);
    },

    onTaskViewChanged: function (direction, carousel) {
        // Set the list selection
        var index = carousel.getViewIndex(),
            taskList = this.getTaskListView().down('list');

        taskList.select(index, false, true);
    }
});