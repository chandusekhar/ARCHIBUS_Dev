Ext.define('ConditionAssessment.controller.ConditionAssessmentNavigation', {
    extend: 'Common.controller.NavigationController',
    requires: [
        'Common.util.Filter',
        'Ext.SegmentedButton',
        'Floorplan.util.Drawing',
        'Floorplan.util.Floorplan'
    ],

    config: {
        refs: {
            mainView: 'mainview',
            conditionAssessmentView: 'conditionAssessmentEditPanel',
            assessmentsList: 'conditionAssessmentListPanel',
            floorPlanSegmentedButton: 'projectContainer segmentedbutton',
            floorPlanList: 'floorPlanList',
            floorPlanPanel: 'assessmentFloorPlanPanel',
            projectContainer: 'projectContainer',
            documentItem: 'documentItem',
            filterAssessmentButton: 'button[itemId=assessmentFilterButton]',
            searchAssessmentField: 'search[name=searchAssessment]',
            carousel: 'swipecarousel',
            completeButton: 'button[action=completeAssessment]',
            homeButton: 'button[action=goToHomePage]'
        },

        control: {
            mainView: {
                pop: 'onViewPopped',
                push: 'onViewPushed'
            },
            floorPlanSegmentedButton: {
                toggle: 'onFloorPlanButtonToggled'
            },
            filterAssessmentButton: {
                tap: 'openFilterView'
            },
            'conditionAssessmentFilterPanel': {
                applyFilter: 'onFilterConditionAssessment',
                clearFilter: 'onRemoveFilterConditionAssessment'
            },
            completeButton: {
                tap: 'onCompleteButtonTapped'
            },
            homeButton: {
                tap: 'onGoToHomePage'
            },
            searchAssessmentField: {
                searchkeyup: function (searchFieldValue) {
                    // call searchAssessment with only one parameter
                    this.searchAssessment(searchFieldValue);
                },
                searchclearicontap: 'onClearSearchAssessment',
                scancomplete: 'onScanSearchAssessment'
            }
        }
    },

    onViewPopped: function (navView, poppedView) {
        var me = this,
            currentView = navView.getNavigationBar().getCurrentView(),
            assessmentListStore,

        //clear store filter to display all items in Assessment Items list, not only for a room
            resetAssessmentsStoreFilters = function (callbackFn) {
                assessmentListStore = Ext.getStore('conditionAssessmentsStore');
                assessmentListStore.clearFilter();
                assessmentListStore.filter('project_id', currentView.getProjectId());
                assessmentListStore.load(callbackFn, me);
            };

        if (currentView.xtype === 'projectContainer' && poppedView.xtype === 'conditionAssessmentEditPanel') {
            resetAssessmentsStoreFilters();
        } else if (currentView.xtype === 'assessmentFloorPlanPanel'
            && ( poppedView.xtype === 'conditionAssessmentEditPanel' || poppedView.xtype === 'conditionAssessmentListPanel' )) {
            resetAssessmentsStoreFilters(function () {
                ConditionAssessment.util.RoomHighlight.updatePlanHighlights(currentView.getRecord());
            }, me);
        }
        me.showHideToolbarButtons(navView, currentView);
    },

    onViewPushed: function (mainView, pushedView) {
        var me = this;

        me.callParent(arguments);
        ConditionAssessment.util.Ui.lastViewDispayed = pushedView;
        me.showHideToolbarButtons(mainView, pushedView);
    },

    showHideToolbarButtons: function (mainView, view) {
        var navBar = mainView.getNavigationBar(),
            showSaveButton = false,
            showAddButton = false,
            formView = this.getConditionAssessmentView();

        switch (view.xtype) {
            case 'conditionAssessmentEditPanel':
                showSaveButton = view.getIsCreateView();
                showAddButton = !view.getIsCreateView();
                break;
            case 'conditionAssessmentCarousel':
                showSaveButton = formView.getIsCreateView();
                showAddButton = !formView.getIsCreateView();
                break;

            default:
                break;
        }

        navBar.getAddButton().setHidden(!showAddButton);
        navBar.getSaveButton().setHidden(!showSaveButton);
        this.getHomeButton().setHidden(view.xtype === 'mainview' || view.xtype === 'projectContainer');
    },

    onGoToHomePage: function () {
        this.getMainView().reset();
    },

    /**
     * Override to set the Auto Sync property to false before syncing the record
     * This is needed to prevent the record from being adding to the data base twice.
     * Saves the contents of the Edit Panel to the database Validates and displays validation errors on
     * the Edit Panel
     *
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView
     * The currently displayed view.
     */
    saveEditPanel: function (currentView) {
        var me = this,
            record = currentView.getRecord(),
            store = Ext.getStore(currentView.getStoreId());

        // Check validation
        if (record.isValid()) {
            record.setChangedOnMobile();
            store.setAutoSync(false);
            store.add(record);
            store.sync(function () {
                store.setAutoSync(true);
                store.load(function () {
                    if (currentView.getIsCreateView()) {
                        Ext.Viewport.remove(currentView);
                        me.getMainView().pop(); // Return from Edit Assessment to the List of Assessments
                    } else {
                        me.getMainView().pop();
                    }
                }, me);
            });
        } else {
            currentView.displayErrors(record);
        }
    },

    /**
     * @override
     * @param {Common.view.navigation.EditBase/Common.view.navigation.ListBase} currentView
     * The currently displayed view.
     */
    displayAddPanel: function (currentView) {
        var currentRecord = currentView.getRecord(),
            view = this.getModalAddPanel(currentView, {
                title: currentView.getAddTitle(),
                displayCameraIcon: true,
                appName: 'ConditionAssessment'
            }),
            fieldNames = view.getCopyValuesFieldNames(),
            record = view.getRecord();

        // Initialize the new view with site, bl, fl, rm and eq from the current view
        Ext.each(fieldNames, function (fieldName) {
            record.set(fieldName, currentRecord.get(fieldName));
        });
        view.setRecord(record);

        Ext.Viewport.add(view);
        ConditionAssessment.util.Ui.lastViewDispayed = view;
        view.show();
    },

    /**
     *
     * Override the Common.view.NavigationController displayUpdatePanel function so that we pass the record
     * to be used in initialization of the view
     *
     *
     * Displays an Edit Panel when the disclose action is fired by a List Panel. The Edit panel contains
     * the record from the list row that was clicked. The Edit Panel that is displayed is determined by
     * the List View editViewClass configuration property.
     *
     * @param {Ext.Container} view The List View that generated the itemDisclosed event.
     * @param {Ext.data.Model} record The record associated with the List View row that was clicked.
     */
    displayUpdatePanel: function (view, record) {
        var me = this,
            editView = view.getEditViewClass(),
            updateView,
            titlePanel,
            pushUpdateView = function (updateView) {
                me.getMainView().push(updateView);
            };

        var config = editView === 'ConditionAssessment.view.ConditionAssessment' ? {initialRecord: record} : {};
        updateView = Ext.create(editView, config);

        if (updateView.xtype === 'projectContainer') {
            updateView.setProjectId(record.get('project_id'));
            updateView.setRecord(record);
            me.getFloorPlanSegmentedButton().setPressedButtons(0);
            me.filterAssessmentListByProject(record, pushUpdateView.bind(me, updateView));
        } else if (updateView.xtype === 'conditionAssessmentListPanel') {
            updateView.setProjectId(record.get('project_id'));
            updateView.setRecord(record);
            // Filter assessment items list
            me.filterAssessmentList(null, pushUpdateView.bind(me, updateView));
        } else if (updateView.xtype === 'assessmentFloorPlanPanel') {
            updateView.setProjectId(record.get('project_id'));
            updateView.setRecord(record);
            // set Floor Plan view title: bl_id - fl_id
            if (record) {
                titlePanel = updateView.down('titlepanel');
                if (titlePanel) {
                    titlePanel.setTitle(record.get('bl_id') + ' - ' + record.get('fl_id'));
                }
            }
            // Load floor plan data here
            me.loadSvgDataInFloorPlan(updateView, record)
                .then(pushUpdateView.bind(me, updateView), pushUpdateView.bind(me, updateView));
        } else {
            updateView.setRecord(record);
            if (updateView.xtype !== 'conditionAssessmentEditPanel') {
                me.getMainView().push(updateView);
            }
        }
    },

    loadSvgDataInFloorPlan: function (view, record) {
        var me = this,
            blId = record.get('bl_id'),
            flId = record.get('fl_id'),
            planType = 'ConditionAssessmentFloorPlan',
            highlightParameters = [
                {
                    view_file: "ab-con-assessment-itemxrm.axvw",
                    hs_ds: "abCondAssessmentItemxRmHighlight",
                    label_ds: 'abCondAssessmentItemxRmLabel',
                    label_clr: 'gray',
                    label_ht: '0.90'
                }
            ];

        return Floorplan.util.Floorplan.readFloorPlan(blId, flId, planType)
            .then(function (svgData) {
                if (Ext.isEmpty(svgData)) {
                    // Retrieve svgdata from server
                    return Floorplan.util.Drawing.retrieveSvgDataFromServer({
                        bl_id: blId,
                        fl_id: flId
                    }, null, highlightParameters);
                } else {
                    return Promise.resolve(svgData);
                }
            })
            .then(function (svgData) {
                if (!Ext.isEmpty(svgData)) {
                    view.setSvgData(svgData);
                    view.setEventHandlers([
                        {
                            assetType: 'rm',
                            handler: me.onClickRoom,
                            scope: me
                        }
                    ]);
                    return Floorplan.util.Floorplan.saveFloorPlan(blId, flId, planType, svgData);
                } else {
                    return Promise.reject();
                }
            })
            .then(function () {
                ConditionAssessment.util.RoomHighlight.updatePlanHighlights(view.getRecord());
                return Promise.resolve();
            })
            .then(null, function (error) {
                Log.log(error, 'error');
                return Promise.reject(error);
            });

    },

    /**
     * The function used for the Floorplan view room click/tap handler.
     */
    onClickRoom: (function () {
        var canFireEvent = true;
        return function (locationCodes) {
            if (canFireEvent) {
                canFireEvent = false;
                ConditionAssessment.app.fireEvent('roomtapped', locationCodes);
                setTimeout(function () {
                    canFireEvent = true;
                }, 1000);
            }
        };
    }()),

    /**
     * Opens the Filter view.
     */
    openFilterView: function () {
        var me = this,
            conditionAssessmentStore = Ext.getStore('conditionAssessmentsStore'),
            conditionAssessmentStoreFilters = conditionAssessmentStore.getFilters();

        var view = Ext.create('ConditionAssessment.view.ConditionAssessmentFilter', {
            'conditionAssessmentStoreFilters': conditionAssessmentStoreFilters
        });
        me.getMainView().push(view);
    },

    onRemoveFilterConditionAssessment: function () {
        var me = this,
            list = me.getProjectContainer(),
            onStoreLoad = function () {
                me.getMainView().pop();
                list.initialize();
            };

        me.filterAssessmentList(null, onStoreLoad);
    },

    onFilterConditionAssessment: function () {
        var me = this,
            conditionAssessmentFilterView = me.getNavigationBar().getCurrentView(),
            filters = conditionAssessmentFilterView.buildConditionAssessmentFilters(),
            list = me.getProjectContainer(),
            onStoreLoad = function () {
                me.getMainView().pop();
                list.initialize();
            };

        me.filterAssessmentList(filters, onStoreLoad);
    },

    searchAssessment: function (searchFieldValue, callbackFn, scope) {
        var searchFields = ['site_id', 'bl_id', 'fl_id', 'rm_id', 'eq_id', 'location', 'description'],
            filters = this.buildSearchFilters(searchFields, searchFieldValue);

        this.filterAssessmentStore(filters, callbackFn, scope);
    },

    buildSearchFilters: function (searchFields, searchFieldValue) {
        var filterArray = [];

        Ext.each(searchFields, function (field) {
            var filter = Ext.create('Common.util.Filter', {
                property: field,
                value: searchFieldValue,
                conjunction: 'OR',
                anyMatch: true
            });
            filterArray.push(filter);
        });

        return filterArray;
    },

    filterAssessmentStore: function (filters, callbackFn, scope) {
        var assessmentStore = Ext.getStore('conditionAssessmentsStore'),
            currentFilters = assessmentStore.getFilters();

        assessmentStore.clearFilter();
        filters.unshift(currentFilters[0]);
        assessmentStore.setFilters(filters);
        assessmentStore.load(callbackFn, scope);
    },

    onClearSearchAssessment: function () {
        var assessmentsList = this.getAssessmentsList(),
            projectId = assessmentsList.getProjectId(),
            assessmentStore = Ext.getStore('conditionAssessmentsStore');

        assessmentStore.clearFilter();
        assessmentStore.filter('project_id', projectId);
        assessmentStore.loadPage(1);
    },

    onScanSearchAssessment: function (scanResult) {
        var me = this,
            searchField = this.getSearchAssessmentField(),
            barcodeFormat,
            filterArray = [],
            onCompleted = function (records) {
                if (records.length === 1) {
                    // display the edit panel for the scanned assessment
                    me.displayUpdatePanel(me.getNavigationBar().getCurrentView(), records[0]);
                }
            };

        if (searchField) {
            barcodeFormat = searchField.getBarcodeFormat();
            if (Ext.isEmpty(barcodeFormat)) {
                me.searchAssessment(scanResult.code, onCompleted, me);
            } else {
                filterArray = me.buildDecodedAssessmentSearchFilters(scanResult, barcodeFormat);
                this.filterAssessmentStore(filterArray, onCompleted, me);
            }
        }
    },

    buildDecodedAssessmentSearchFilters: function (scanResult, barcodeFormat) {
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

    onFloorPlanButtonToggled: function (segmentedButton, button, isPressed) {
        var buttonId,
            assessmentsList = this.getAssessmentsList(),
            floorPlanList = this.getFloorPlanList(),
            hide;

        if (isPressed) {
            buttonId = button.getItemId();
            hide = buttonId === 'floorPlan';
            assessmentsList.setHidden(hide);
            floorPlanList.setHidden(!hide);
            this.setProjectContainerTitle(!hide);
        }
    },

    setProjectContainerTitle: function (isListView) {
        var mainView = this.getMainView(),
            navBar = mainView.getNavigationBar();

        if (isListView) {
            navBar.setTitle(LocaleManager.getLocalizedString('Assessment Items',
                'ConditionAssessment.controller.ConditionAssessmentNavigation'));
        } else {
            navBar.setTitle(LocaleManager.getLocalizedString('Floor Plans for Assessment',
                'ConditionAssessment.controller.ConditionAssessmentNavigation'));
        }
    },

    filterAssessmentList: function (filters, onStoreLoad) {
        var me = this,
            projectId = me.getProjectContainer().getRecord().get('project_id'),
            assessmentListStore = Ext.getStore('conditionAssessmentsStore'),
            allFilters = filters || [];

        var filter = Ext.create('Common.util.Filter', {
            property: 'project_id',
            value: projectId,
            conjunction: 'AND',
            exactMatch: true
        });
        allFilters.push(filter);
        assessmentListStore.clearFilter();
        assessmentListStore.setFilters(allFilters);
        assessmentListStore.loadPage(1, {
            callback: onStoreLoad,
            scope: me
        });
    },

    filterAssessmentListByProject: function (record, onStoreLoad) {
        var me = this,
            projectFloorsStore = Ext.getStore('projectFloorsStore'),
            conditionAssessmentsStore = Ext.getStore('conditionAssessmentsStore'),
            conditionAssessmentList = me.getAssessmentsList(),
            projectId = record.get('project_id');

        conditionAssessmentList.setProjectId(projectId);
        conditionAssessmentsStore.clearFilter();
        conditionAssessmentsStore.filter('project_id', projectId);
        conditionAssessmentsStore.loadPage(1, function () {
            projectFloorsStore.clearFilter();
            projectFloorsStore.filter('project_id', projectId);
            projectFloorsStore.loadPage(1, {
                callback: onStoreLoad,
                scope: me
            });
        }, this);
    },

    onCompleteButtonTapped: function () {
        var formView = this.getCarousel() ? this.getCarousel().getDisplayedView() : this.getConditionAssessmentView(),
            record = formView.getRecord();

        record.set('date_assessed', new Date());
    }
});