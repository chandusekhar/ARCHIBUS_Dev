//Global variables
// filter config options
var managementFilterConfig = new Ext.util.MixedCollection();

managementFilterConfig.addAll(
    {id: 'alignment_field_1', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'bl.pending_action', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'deprec_method', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value_type', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}},

	{id: 'system_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'assembly_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'eq_system.stakeholder_type', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'eq_system.criticality_function', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'eq_system.criticality_mission', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'activity_log.csi_id', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}}
);


/**
 * Controller definition.
 */
var abEamAssetManagementController = View.createController('abEamAssetManagementController', {
    // filter console controller
    filterController: null,
    // main controller - tabs
    mainController: null,

    filterRestriction: null,

    //used to save temporary values from select grid row
    tmpAssetType: null,

    tmpGridPanel: null,

    tmpRecord: null,

    tmpActionType: null,

    tmpAnchor: null,

    tmpAssetId: null,

    tmpRefreshActivities: false,

    afterViewLoad: function () {
        // customize mini console
        this.abEamAssetInformFinancial_list.addEventListener('afterBuildHeader', this.abEamAssetRegistry_list_customizeHeader, this);
        this.abEamAssetInformProject_list.addEventListener('afterBuildHeader', this.abEamAssetRegistry_list_customizeHeader, this);
        this.abEamAssetInformFm_list.addEventListener('afterBuildHeader', this.abEamAssetRegistry_list_customizeHeader, this);
        this.abEamAssetInformIt_list.addEventListener('afterBuildHeader', this.abEamAssetRegistry_list_customizeHeader, this);

        // customize grid columns
        var controller = this;
        this.abEamAssetInformFinancial_list.afterCreateCellContent = function (row, column, cellElement) {
            controller.customizeAssetRegistryFields(row, column, cellElement);
        };
        this.abEamAssetInformProject_list.afterCreateCellContent = function (row, column, cellElement) {
            controller.customizeAssetRegistryFields(row, column, cellElement);
        };
        this.abEamAssetInformFm_list.afterCreateCellContent = function (row, column, cellElement) {
            controller.customizeAssetRegistryFields(row, column, cellElement);
        };
        this.abEamAssetInformIt_list.afterCreateCellContent = function (row, column, cellElement) {
            controller.customizeAssetRegistryFields(row, column, cellElement);
        };

        this.initializeFilterConfig();
        this.filterController = View.controllers.get('abEamAssetFilterCtrl');
        this.filterController.initializeConfigObjects(managementFilterConfig);
        var controller = this;
        this.filterController.onFilterCallback = function (restriction) {
            controller.onFilter(restriction);
        };
        this.filterController.onClickActionButton1Handler = function (buttonElem) {
            controller.onClickReportMenu(buttonElem);
        };
        this.filterController.actionButton1Label = getMessage('buttonLabel_reports');
    },

    afterInitialDataFetch: function () {
        this.showTabs(this.view.taskInfo.activityId, this.view.taskInfo.processId);

        var selectedTabName = this.abEamAssetManagementTree.getSelectedTabName();
        this.abEamAssetManagementTree.refreshTab(selectedTabName);

        // get main Controller
        this.mainController = this.getMainController();
		// set filter restriction if was applied from another tab
		this.filterController.setRestriction(this.mainController.filterRestriction);
        // initialize filter
        this.filterController.initializeFilter();

		if(valueExistsNotEmpty(this.mainController.queryParameters['bl_id'])) {
			this.filterController.setFieldValue('bl.bl_id', this.mainController.queryParameters['bl_id']);
		}
		if(valueExistsNotEmpty(this.mainController.queryParameters['project_id'])) {
			this.filterController.setFieldValue('bl.project_id', this.mainController.queryParameters['project_id']);
		}

        // load initial data
        this.filterController.abEamAssetFilter_onFilter();
    },

    /**
     * Show/hide tabs based on open location.
     */
    showTabs: function (activityId, processId) {
        this.abEamAssetInformTabs.addEventListener('beforeTabChange', beforeAssetInformTabChange);
        if (activityId == 'AbAssetEAM' && processId == 'Department Asset Manager') {
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_financial', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_project', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_fm', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_it', true);

            this.abEamAssetInformTabs.selectTab('abEamAssetInformTabs_project', null, false, false, true);
            this.abEamAssetInformProject_list.show(false, true);
            //select current activities tab
            this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_current', null, false, false, true);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

        } else if (activityId == 'AbAssetEAM' && processId == 'Facilities Asset Manager') {
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_financial', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_project', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_fm', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_it', true);

            this.abEamAssetInformTabs.selectTab('abEamAssetInformTabs_fm', null, false, false, true);
            this.abEamAssetInformFm_list.show(false, true);
            //select current activities tab
            this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_current', null, false, false, true);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

        } else if (activityId == 'AbAssetEAM' && (processId == 'Finance Asset Manager' || processId == 'Bucket EAM - Enterprise')) {
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_financial', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_project', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_fm', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_it', true);

            this.abEamAssetInformTabs.selectTab('abEamAssetInformTabs_financial', null, false, false, true);
            this.abEamAssetInformFinancial_list.show(false, true);
            //select depreciation tab
            this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_depreciation', null, false, false, true);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

        } else if (activityId == 'AbAssetEAM' && (processId == 'IT Asset Manager' || processId == 'Bucket EAM - ERP Integration')) {
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_financial', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_project', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_fm', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_it', true);

            this.abEamAssetInformTabs.selectTab('abEamAssetInformTabs_it', null, false, false, true);
            this.abEamAssetInformIt_list.show(false, true);
            //select current activities tab
            this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_current', null, false, false, true);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

        } else if (activityId == 'AbAssetAM' && processId == 'Asset Manager') {

            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_financial', false);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_project', false);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_fm', true);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_it', false);

            this.abEamAssetInformTabs.selectTab('abEamAssetInformTabs_fm', null, false, false, true);
            this.abEamAssetInformFm_list.show(false, true);
            //select current activities tab
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_depreciation', false);
            this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_current', null, false, false, true);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

        } else if (activityId == 'AbAssetAM' && processId == 'IT Asset Manager') {
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_financial', false);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_project', false);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_fm', false);
            this.abEamAssetInformTabs.showTab('abEamAssetInformTabs_it', true);

            this.abEamAssetInformTabs.selectTab('abEamAssetInformTabs_it', null, false, false, true);
            this.abEamAssetInformIt_list.show(false, true);
            //select current activities tab
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_depreciation', false);
            this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_current', null, false, false, true);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);
        }
    },
    /**
     * Customize fields for asset registry panel
     */
    customizeAssetRegistryFields: function (row, column, cellElement) {
        if (column.id == 'bl.asset_type') {
            cellElement.childNodes[0].innerHTML = getMessage('asset_type_' + cellElement.childNodes[0].text);
        } else if (column.id == 'bl.asset_status') {
            var status = row.row.getFieldValue('bl.asset_status');
            var assetType = row.row.getFieldValue('bl.asset_type');
            var localizedValue = this.getLocalizedAssetStatus(assetType, status);
            cellElement.childNodes[0].innerHTML = localizedValue;
        }
    },

    /**
     * On filter event handler
     * @param restriction restriction object
     */
    onFilter: function (restriction) {
		//set current restriction  to main controller.
		this.mainController.filterRestriction = restriction;

		var controller = this;
        this.filterRestriction = restriction;
        var parameters = {
	        'onClickClearSelectionHandler': function(){
	        	controller.onClickClearSelectionHandler();
	        },
            'onClickNodeEventHandler': function (treeType, restriction) {
                controller.refreshFromTreeNode(treeType, restriction);
            }
        };


        var geoTreeParameters = getGeographicalTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetManagementTree.findTab('abEamAssetManagementTreeGeo').parameters = geoTreeParameters;

        var locationTreeParameters = getLocationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetManagementTree.findTab('abEamAssetManagementTreeLocation').parameters = locationTreeParameters;

        var orgTreeParameters = getOrganizationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetManagementTree.findTab('abEamAssetManagementTreeOrg').parameters = orgTreeParameters;

        _.extend(parameters, {
            'onClickAddHandler': function (restriction, commandContext) {
                controller.onClickAddFromProjectTree(restriction, commandContext);
            },
            'onClickPPTHandler_level': function (projectId) {
                controller.onClickPPTHandler(projectId);
            }
        });
        var projTreeParameters = getProjectTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetManagementTree.findTab('abEamAssetManagementTreeProj').parameters = projTreeParameters;

        _.extend(parameters, {
            'filterRestriction': this.filterRestriction
        });
        this.abEamAssetManagementTree.findTab('abEamAssetManagementEqSystems').parameters = parameters;

        var selectedTabName = this.abEamAssetManagementTree.getSelectedTabName();
        this.abEamAssetManagementTree.refreshTab(selectedTabName);

        var assetRegRestriction = getRestrictionForAssetRegistryFromFilter(restriction);

        this.refreshAssetRegistryPanel(this.abEamAssetInformFinancial_list, assetRegRestriction);
        this.refreshAssetRegistryPanel(this.abEamAssetInformProject_list, assetRegRestriction);
        this.refreshAssetRegistryPanel(this.abEamAssetInformFm_list, assetRegRestriction);
        this.refreshAssetRegistryPanel(this.abEamAssetInformIt_list, assetRegRestriction);

    },

    onClickClearSelectionHandler: function(){
    	this.filterController.resetFilter();
    },

    /**
     * Returns localized status value for asset.
     * @param type  asset type
     * @param value status value
     * @return string
     */
    getLocalizedAssetStatus: function (type, value) {
        var localizedValue = '';
        if (valueExistsNotEmpty(value)) {
            var assetStatusDs = this.abAssetRegistryStatus_ds;
            if (type == 'bl') {
                localizedValue = assetStatusDs.fieldDefs.get('bl.status').enumValues[value];
            } else if (type == 'property') {
                localizedValue = assetStatusDs.fieldDefs.get('property.status').enumValues[value];
            } else if (type == 'eq') {
                localizedValue = assetStatusDs.fieldDefs.get('eq.status').enumValues[value];
            } else if (type == 'ta') {
                localizedValue = assetStatusDs.fieldDefs.get('ta.status').enumValues[value];
            }
        }
        return localizedValue;
    },

    // initialize filter config objects
    initializeFilterConfig: function () {

    },

    getMainController: function () {
        var controller = null;
        if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamAssetConsoleController'))) {
            controller = this.view.getOpenerView().controllers.get('abEamAssetConsoleController');
        }
        return controller;
    },

    refreshFromTreeNode: function (treeType, restriction) {
        var objAssetRegRestr = getRestrictionForAssetRegistry(treeType, restriction, this.filterRestriction);

        //TODO refresh only visible panel
        this.refreshAssetRegistryPanel(this.abEamAssetInformFinancial_list, objAssetRegRestr);
        this.refreshAssetRegistryPanel(this.abEamAssetInformProject_list, objAssetRegRestr);
        this.refreshAssetRegistryPanel(this.abEamAssetInformFm_list, objAssetRegRestr);
        this.refreshAssetRegistryPanel(this.abEamAssetInformIt_list, objAssetRegRestr);

    },

    refreshAssetRegistryPanel: function (objPanel, objAssetRegRestriction) {
        var objRestriction = objAssetRegRestriction.restriction;
        var sqlTypeRestriction = valueExistsNotEmpty(objAssetRegRestriction.sql) ? objAssetRegRestriction.sql : "1=1";
        var blTypeRestriction = valueExistsNotEmpty(objAssetRegRestriction.blSql) ? objAssetRegRestriction.blSql : "1=1";
        var eqTypeRestriction = valueExistsNotEmpty(objAssetRegRestriction.eqSql) ? objAssetRegRestriction.eqSql : "1=1";
        var taTypeRestriction = valueExistsNotEmpty(objAssetRegRestriction.taSql) ? objAssetRegRestriction.taSql : "1=1";
        var propertyTypeRestriction = valueExistsNotEmpty(objAssetRegRestriction.propertySql) ? objAssetRegRestriction.propertySql : "1=1";

        objPanel.addParameter('blTypeRestriction', blTypeRestriction);
        objPanel.addParameter('eqTypeRestriction', eqTypeRestriction);
        objPanel.addParameter('taTypeRestriction', taTypeRestriction);
        objPanel.addParameter('propertyTypeRestriction', propertyTypeRestriction);
        objPanel.addParameter('sqlTypeRestriction', sqlTypeRestriction);

        objPanel.refresh(objRestriction);
    },

    onClickAddFromProjectTree: function (restriction, commandContext) {
        this.addProjectAction(restriction, true, true, function () {
            View.controllers.get('abEamAssetManagementController').reloadTree();
        });
    },
    
    addProjectAction: function (restriction, enableProjectId, newRecord, callbackFn) {
        View.openDialog('ab-proj-mng-act-edit.axvw', restriction, newRecord, {
            width: 1024,
            height: 600,
            createWorkRequest:false,
            isCopyAsNew: false,
            showDocumentsPanel: true,
            enableProjectId: enableProjectId,
            panelsConfiguration: {
                'projMngActEdit_Progress': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                         {name: 'activity_log.status'},
                         {name: 'activity_log.hours_est_baseline', required: true},
                         {name: 'activity_log.date_planned_for', required: true},
                         {name: 'activity_log.duration_est_baseline', required: true},
                         {name: 'activity_log.date_required'},
                         {name: 'activity_log.date_scheduled_end'}
                    ]
                },
                'projMngActEdit_Costs': {
                    actions: [{id: 'showMore', hidden: true}, {id: 'showLess', hidden: true}],
                    fields: [
                        {name: 'activity_log.cost_est_cap', required: true},
                        {name: 'activity_log.cost_estimated', required: true}
                    ]
                },
                'projMngActEdit_Details': {
                    fields: [
                         {name: 'activity_log.doc'},
                         {name: 'activity_log.description'},
                         {name: 'activity_log.created_by'},
                         {name: 'activity_log.date_requested'},
                         {name: 'activity_log.approved_by'},
                         {name: 'activity_log.date_approved'}
                    ]
                }
            },
            callback: function () {
                if (callbackFn) {
                    callbackFn();
                }
            }
        });
    },

    reloadTree: function () {
        var selectedTabName = this.abEamAssetManagementTree.getSelectedTabName();
        this.abEamAssetManagementTree.findTab(selectedTabName).refresh();
    },

    onClickPPTHandler: function (projectId) {
        var jobId = Workflow.startJob('AbCommonResources-ProjectRequirementsService-generatePPTPresentation', projectId);
        View.openJobProgressBar(getMessage("generatePPTMessage"), jobId, null, function (status) {
            var url = status.jobFile.url;
            window.location = url;
        });
    },

    abEamAssetRegistry_list_customizeHeader: function (panel, parentElement) {
        var columnIndex = 0;
        for (var i = 0, col; col = panel.columns[i]; i++) {
            if (col.id == 'bl.asset_type' && !col.hidden) {
                var headerRows = parentElement.getElementsByTagName("tr");
                // customize filter row if this exists
                if (headerRows.length > 1 && headerRows[1].id == panel.id + '_filterRow') {
                    var filterInputId = panel.getFilterInputId(col.id);
                    this.updateMiniConsole(panel, headerRows[1], columnIndex, filterInputId);
                }
            }
            if (!col.hidden) {
                columnIndex++;
            }
        }
    },

    /**
     * Customize filter row for recurring pattern column.
     *
     * @param panel grid panel
     * @param rowElement filter row element
     * @param columnIndex column index
     * @param filterInputId filter input id
     */
    updateMiniConsole: function (panel, rowElement, columnIndex, filterInputId) {
        var recurringTypes = {
            'bl': getMessage('asset_type_bl'),
            'eq': getMessage('asset_type_eq'),
            'ta': getMessage('asset_type_ta'),
            'property': getMessage('asset_type_property')
        };

        var headerCells = rowElement.getElementsByTagName("th");
        var headerCell = headerCells[columnIndex];
        // remove input element if exists
        var inputElements = headerCell.getElementsByTagName("input");
        if (inputElements[filterInputId]) {
            headerCell.removeChild(inputElements[filterInputId]);
        }
        // add select element
        var i = 0;
        var input = document.createElement("select");
        input.options[i++] = new Option("", "", true);
        for (var storedValue in recurringTypes) {
            input.options[i++] = new Option(recurringTypes[storedValue], storedValue);
        }
        input.className = "inputField_box";

        // run filter when user click on one enum value
        Ext.EventManager.addListener(input, "change", panel.onFilter.createDelegate(panel));
        input.id = filterInputId;
        if (headerCell.childNodes.length > 0) {
            headerCell.insertBefore(input, headerCell.childNodes[0]);
        } else {
            headerCell.appendChild(input);
        }
    },

    onAddEditAsset: function (type, viewName, restriction, newRecord, gridPanel) {
    	var controller = View.controllers.get('abEamAssetManagementController');

    	var dialogConfig = null;
        if (type == 'bl') {
            dialogConfig = {
                width: 1024,
                height: 800,
                closeButton: true,
                type: type,
                hideTabs: true,
                callback: function () {
                    gridPanel.refresh(gridPanel.restriction);
                    if (controller.tmpRefreshActivities) {
                    	controller.onShowAssetDetails(controller.tmpAssetType, controller.tmpGridPanel, controller.tmpRecord);
                    }
                }
            };
        } else {
            dialogConfig = {
                width: 1024,
                height: 800,
                closeButton: true,
                callback: function () {
                    gridPanel.refresh(gridPanel.restriction);
                    if (controller.tmpRefreshActivities) {
                    	controller.onShowAssetDetails(controller.tmpAssetType, controller.tmpGridPanel, controller.tmpRecord);
                    }
                }
            };
        }

        View.getOpenerView().openDialog(viewName, restriction, newRecord, dialogConfig);
    },

    onShowAssetDetails: function (type, gridPanel, record) {
        var assetId = record.getValue('bl.asset_id');
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.asset_type', type, '=');
        restriction.addClause('bl.asset_id', assetId, '=');

        this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_depreciation', restriction);
        this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_current', restriction);

        var historyRestr = new Ab.view.Restriction();
        historyRestr.addClause('asset_trans.mod_table', type, '=');
        historyRestr.addClause('asset_trans.asset_id', assetId, '=');

        var selectedTabName = this.abEamAssetActivitiesTabs.getSelectedTabName();

        if (type == 'eq' || type == 'ta') {
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_eq_ta', true);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

            this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_history_eq_ta', historyRestr);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', true);

            if ('abEamAssetActivitiesTabs_history_bl_pr' === selectedTabName || 'abEamAssetActivitiesTabs_history_ot' === selectedTabName) {
                selectedTabName = 'abEamAssetActivitiesTabs_history_eq_ta';
                this.abEamAssetActivitiesTabs.selectTab(selectedTabName, null, false, false, true);
            }
        } else if (type == 'bl' || type == 'property') {
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_eq_ta', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', true);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', true);

            this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_history_bl_pr', historyRestr);
            this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_history_ot', historyRestr);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_bl_pr', true);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_ot', true);

            if ('abEamAssetActivitiesTabs_history_eq_ta' === selectedTabName) {
                selectedTabName = 'abEamAssetActivitiesTabs_history_bl_pr';
                this.abEamAssetActivitiesTabs.selectTab(selectedTabName, null, false, false, true);
            }
        }


        if (gridPanel.id != 'abEamAssetInformFinancial_list'
            && selectedTabName == 'abEamAssetActivitiesTabs_depreciation') {
            selectedTabName == 'abEamAssetActivitiesTabs_current';
            this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_current', null, false, false, true);
        }
        this.abEamAssetActivitiesTabs.refreshTab(selectedTabName);
    },

    onShowDetails: function (row) {
    	var controller = View.controllers.get('abEamAssetManagementController');
        var record = row.row.getRecord();
        var gridPanel = row.grid;
        var assetType = record.getValue('bl.asset_type');
        controller.tmpAssetId = record.getValue('bl.asset_id');

        controller.tmpAssetType = assetType;
        controller.tmpRecord = record;
        controller.tmpGridPanel = gridPanel;

        controller.onShowAssetDetails(assetType, gridPanel, record);
    },

    onAssignRow: function (row) {
        var record = row.row.getRecord();
        var rowIndex = row.row.getIndex();
        var buttonId = row.grid.id + '_row' + rowIndex + '_assignRow';
        var button = document.getElementById(buttonId);
        var assetType = record.getValue('bl.asset_type');
        assignAsset(assetType, record, button);
    },

    onEditRow: function (row) {
        var record = row.row.getRecord();
        var gridPanel = row.grid;
        var assetType = record.getValue('bl.asset_type');
        var assetId = record.getValue('bl.asset_id');
        var viewName = '';
        var controller = View.controllers.get('abEamAssetManagementController');
        if(valueExistsNotEmpty(controller.tmpAssetId) && controller.tmpAssetId == assetId){
        	controller.tmpRefreshActivities = true;
        }else{
        	controller.tmpRefreshActivities = false;
        }

        var restriction = new Ab.view.Restriction();
        if (assetType == 'bl') {
            restriction.addClause('bl.bl_id', assetId, '=');
            viewName = 'ab-eam-def-geo-loc.axvw';
        } else if (assetType == 'property') {
            restriction.addClause('property.pr_id', assetId, '=');
            viewName = 'ab-rplm-properties-define-form.axvw';
        } else if (assetType == 'eq') {
            restriction.addClause('eq.eq_id', assetId, '=');
            viewName = 'ab-eq-edit-form.axvw';
        } else if (assetType == 'ta') {
            restriction.addClause('ta.ta_id', assetId, '=');
            viewName = 'ab-ta-edit-form.axvw';
        }
        controller.onAddEditAsset(assetType, viewName, restriction, false, gridPanel);
    },

    onProfileRow: function (row) {
        var record = row.row.getRecord();
        var assetId = record.getValue('bl.asset_id');
        var assetType = record.getValue('bl.asset_type');
        var viewName = null;
        var restriction = new Ab.view.Restriction();
        if (assetType == 'bl') {
            viewName = 'ab-profile-building.axvw';
            restriction.addClause('bl.bl_id', assetId, '=');
        } else if (assetType == 'property') {
            viewName = 'ab-profile-property.axvw';
            restriction.addClause('property.pr_id', assetId, '=');
        } else if (assetType == 'eq') {
            viewName = 'ab-profile-equipment.axvw';
            restriction.addClause('eq.eq_id', assetId, '=');
        } else if (assetType == 'ta') {
            viewName = 'ab-profile-ta.axvw';
            restriction.addClause('ta.ta_id', assetId, '=');
        }

        View.getOpenerView().openDialog(viewName, restriction, false, {
            width: 1024,
            height: 600,
            closeButton: true
        })
    },

    onClickReportMenu: function (buttonElem) {

        var reportMenuItem = new MenuItem({
            menuDef: {
                id: 'reportsMenu',
                type: 'menu',
                viewName: null,
                isRestricted: false,
                parameters: null
            },
            onClickMenuHandler: onClickMenu,
            onClickMenuHandlerRestricted: onClickMenuWithRestriction,
            submenu: abEamReportsCommonMenu
        });
        reportMenuItem.build();

        var menu = new Ext.menu.Menu({items: reportMenuItem.menuItems});
        menu.show(buttonElem, 'tl-bl?');
    },

    /**
     * Maximize asset activities preserving the current tabs states and restrictions
     */
    assetActivitiesTitle_onMaximize: function () {
        var currentTabs = this.abEamAssetActivitiesTabs;
        View.openDialog('ab-eam-lifecycle-asset-trans-tabs.axvw', null, false, {
            maximize: true,
            modal: true,
            afterViewLoad: function (dialogView) {
                var controller = dialogView.controllers.get('abEamAssetTransTabsCtrl');
                controller.setTabsState(currentTabs);
            }
        });
    },

    getSelectedregistryGrid: function(){
    	var selectedTabName = this.abEamAssetInformTabs.getSelectedTabName();
    	var gridPanel = null;
    	if (selectedTabName == 'abEamAssetInformTabs_financial'){
    		gridPanel = this.abEamAssetInformFinancial_list;
    	} else if (selectedTabName == 'abEamAssetInformTabs_project') {
    		gridPanel = this.abEamAssetInformProject_list;
    	} else if (selectedTabName == 'abEamAssetInformTabs_fm') {
    		gridPanel = this.abEamAssetInformFm_list;
    	} else if (selectedTabName == 'abEamAssetInformTabs_it') {
    		gridPanel = this.abEamAssetInformIt_list;
    	}
    	return gridPanel;
    }
});

function onAddAsset(assetType){
	var controller = View.controllers.get('abEamAssetManagementController');
	var gridPanel = controller.getSelectedregistryGrid();

	var viewName = '';
	if(assetType == 'bl'){
		viewName = 'ab-eam-def-geo-loc.axvw';
	} else if(assetType == 'property'){
		viewName = 'ab-rplm-properties-define-form.axvw';
	} else if(assetType == 'eq'){
		viewName = 'ab-eq-edit-form.axvw';
	} else if(assetType == 'ta'){
		viewName = 'ab-ta-edit-form.axvw';
	}
	controller.onAddEditAsset(assetType, viewName, null, true, gridPanel);
}

function onClickMenu(menu) {
    if (valueExists(menu.viewName)) {
        var dialogConfig = {
            width: 1024,
            height: 800,
            closeButton: true
        };
        if (valueExists(menu.parameters)) {
            for (param in menu.parameters) {
                if (param == 'title') {
                    dialogConfig[param] = getMessage(menu.parameters[param]);
                } else {
                    dialogConfig[param] = menu.parameters[param];
                }
            }
        }
        View.openDialog(menu.viewName, null, false, dialogConfig);
    }
}

function onClickMenuWithRestriction(menu) {
    // TODO : pass restriction to view name
    if (valueExists(menu.viewName)) {
        var dialogConfig = {
            width: 1024,
            height: 800,
            closeButton: true
        };
        if (valueExists(menu.parameters)) {
            for (param in menu.parameters) {
                if (param == 'title') {
                    dialogConfig[param] = getMessage(menu.parameters[param]);
                } else {
                    dialogConfig[param] = menu.parameters[param];
                }
            }
        }
        View.openDialog(menu.viewName, null, false, dialogConfig);
    }
}

function beforeAssetInformTabChange(tabPanel, currentTabName, newTabName) {
    var showDepricationTab = ('abEamAssetInformTabs_financial' === newTabName);
    View.controllers.get('abEamAssetManagementController').abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_depreciation', showDepricationTab);
    if ('abEamAssetInformTabs_financial' === currentTabName && !showDepricationTab) {
        View.controllers.get('abEamAssetManagementController').abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_current', null, false, false, true);
    }
}