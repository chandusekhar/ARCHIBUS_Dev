//Global variables
// filter config options
var dispUpdateFilterConfig = new Ext.util.MixedCollection();

dispUpdateFilterConfig.addAll(
    {id: 'alignment_field_1', fieldConfig: {type: 'text', hidden: true, readOnly: true, values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'bl.pending_action', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}},
    {id: 'deprec_method', fieldConfig: { type: 'enumList', hidden: false, readOnly: false, values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value_type', fieldConfig: {type: 'enumList', hidden: false, readOnly: false, values: null, dfltValue: null, hasEmptyOption: true}},
    {id: 'deprec_value', fieldConfig: {type: 'number', hidden: true, readOnly: false, values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'system_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'assembly_system_name', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'eq_system.stakeholder_type', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'eq_system.criticality_function', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'eq_system.criticality_mission', fieldConfig: {type: 'enumList', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'activity_log.csi_id', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}}
);

// visible field settings for asset registry panel
var assetRegistryVisibleFields = {
    'bl.asset_id': true,
    'bl.asset_type': true,
    'bl.asset_std': true,
    'bl.asset_status': true,
    'bl.pending_action': true,
    'bl.description': false,
    'bl.project_id': true,
    'bl.geo_region_id': false,
    'bl.ctry_id': false,
    'bl.state_id': false,
    'bl.city_id': false,
    'bl.site_id': true,
    'bl.bl_id': true,
    'bl.pr_id': false,
    'bl.fl_id': true,
    'bl.rm_id': true,
    'bl.bu_id': false,
    'bl.dv_id': false,
    'bl.dp_id': false
};

var abEamDisposalUpdateCtrl = View.createController('abEamDisposalUpdateCtrl', {
	// main controller - tabs
	mainController: null,

	// filter console controller
    filterController: null,

    assetRegistryController: null,

    filterRestriction: null,

    assetRegistryRestriction: null,

    selectedRecords: null,

    customViewRestriction: {
        'blSql': "NOT EXISTS(SELECT ot.ot_id FROM ot WHERE ot.bl_id = bl.bl_id AND ot.ot_id = (SELECT MAX(ot_int.ot_id) FROM ot ${sql.as} ot_int WHERE ot_int.bl_id = bl.bl_id)  AND ot.status IN('Pipeline')) ",
        'eqSql': "1=1",
        'taSql': "1=1",
        'propertySql': "1=1"
    },

    afterViewLoad: function () {
        this.initializeFilterConfig();
        this.filterController = View.controllers.get('abEamAssetFilterCtrl');
        this.filterController.initializeConfigObjects(dispUpdateFilterConfig);
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
        var controller = this;
        var selectedTabName = this.abEamAssetDisposalUpdateTree.getSelectedTabName();
        this.abEamAssetDisposalUpdateTree.refreshTab(selectedTabName);

		// get main Controller
		this.mainController = this.getMainController();
		// set filter restriction if was applied from another tab
		this.filterController.setRestriction(this.mainController.filterRestriction);
        // initialize filter
        this.filterController.initializeFilter();
        // configure asset registry panel
        this.assetRegistryController = this.getAssetRegistryController();

        var assetByTypeConfig = {
            'isMultipleSelectionEnabled': true,
            'visibleFields': assetRegistryVisibleFields,
            'onShowDetailsHandler': function (parentPanel, restriction) {
                controller.onShowAssetSummary(parentPanel, restriction);

            },
            'abEamAssetRegistryByType_list_action_1': {
                'title': getMessage('labelUpdateInventory'),
                'onClickHandler': function (parentPanel, context) {
                    controller.onClickUpdateDisposalInfo(parentPanel, context);
                }
            },
			
            'abEamAssetRegistryByType_row_icon_2': {
                'title': getMessage('labelEdit'),
                'onClickHandler': function (parentPanel, context) {
                    onShowDetailsFromAssetRegistry(parentPanel, context, function(parentPanel, restriction){
                    	controller.onShowAssetSummary(parentPanel, restriction);
                    });
                }
            },            
            'abEamAssetRegistryByType_row_action_1': {
				'title': getMessage('labelActivities'),
				'onClickHandler': function(parentPanel, context){
					controller.onClickActivities(parentPanel, context);
				}
			},
			'abEamAssetRegistryByType_row_action_2': {
				'title': getMessage('labelProfile'),
				'onClickHandler': function(parentPanel, context){
					controller.onClickProfile(parentPanel, context);
				}
			}
        };

        if (valueExists(this.assetRegistryController)) {
            this.assetRegistryController.configureAssetByType(assetByTypeConfig);
        } else {
            // was not loaded yet
            this.abAssetDispUpdateRegistryByType.parameters = {'assetByTypeConfig': assetByTypeConfig};
        }
	
        this.filterController.abEamAssetFilter_onFilter();
        
        // configure activities tabs 
        this.abEamAssetActivitiesTabs.selectTab('abEamAssetActivitiesTabs_depreciation', null, false, false, true);
        this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', false);
        this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
        this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

    },

    // initialize filter config objects
    initializeFilterConfig: function () {

    },


    onClickClearSelectionHandler: function(){
    	this.filterController.resetFilter();
    },

    onShowAssetSummary: function (parentPanel, restriction) {
    	if(!valueExists(restriction)){
    		restriction = parentPanel.restriction;
    	}
        var assetType = restriction.findClause('bl.asset_type').value;
        var assetId = restriction.findClause('bl.asset_id').value;
        var restriction = new Ab.view.Restriction();
        restriction.addClause('bl.asset_type', assetType, '=');
        restriction.addClause('bl.asset_id', assetId, '=');

        this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_depreciation', restriction);
        this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_current', restriction);

        var historyRestr = new Ab.view.Restriction();
        historyRestr.addClause('asset_trans.mod_table', assetType, '=');
        historyRestr.addClause('asset_trans.asset_id', assetId, '=');
        
        var selectedTabName = this.abEamAssetActivitiesTabs.getSelectedTabName();

        if (assetType == 'eq' || assetType == 'ta') {
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_eq_ta', true);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_bl_pr', false);
            this.abEamAssetActivitiesTabs.showTab('abEamAssetActivitiesTabs_history_ot', false);

            this.abEamAssetActivitiesTabs.setTabRestriction('abEamAssetActivitiesTabs_history_eq_ta', historyRestr);
            this.abEamAssetActivitiesTabs.enableTab('abEamAssetActivitiesTabs_history_eq_ta', true);

            if ('abEamAssetActivitiesTabs_history_bl_pr' === selectedTabName || 'abEamAssetActivitiesTabs_history_ot' === selectedTabName) {
                selectedTabName = 'abEamAssetActivitiesTabs_history_eq_ta';
                this.abEamAssetActivitiesTabs.selectTab(selectedTabName, null, false, false, true);
            }
        } else if (assetType == 'bl' || assetType == 'property') {
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

        
        this.assetSumaryTitle.show(true);
        if (Ext.get(this.abEamAssetActivitiesTabs.getWrapperElementId()).dom.style.display === "none") {
            this.abEamAssetActivitiesTabs.show(true);
        }
        this.abEamAssetActivitiesTabs.refreshTab(selectedTabName);
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
            'onClickNodeEventHandler': function (treeType, restriction) {
                controller.refreshFromTreeNode(treeType, restriction);
            },
            'onClickPPTHandler_level': function (projectId) {
            	controller.onClickPPTHandler(projectId);
            },
	        'onClickClearSelectionHandler': function(){
	        	controller.onClickClearSelectionHandler();
	        }
        };
        var geoTreeParameters = getGeographicalTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetDisposalUpdateTree.findTab('abEamAssetDisposalUpdateTreeGeo').parameters = geoTreeParameters;

        var locationTreeParameters = getLocationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetDisposalUpdateTree.findTab('abEamAssetDisposalUpdateTreeLocation').parameters = locationTreeParameters;

        var orgTreeParameters = getOrganizationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetDisposalUpdateTree.findTab('abEamAssetDisposalUpdateTreeOrg').parameters = orgTreeParameters;

        var projTreeParameters = getProjectTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetDisposalUpdateTree.findTab('abEamAssetDisposalUpdateTreeProj').parameters = projTreeParameters;
		
        _.extend(parameters, {
            'filterRestriction': this.filterRestriction
        });
        this.abEamAssetDisposalUpdateTree.findTab('abEamAssetDisposalUpdateEqSystems').parameters = parameters;

        var selectedTabName = this.abEamAssetDisposalUpdateTree.getSelectedTabName();
        this.abEamAssetDisposalUpdateTree.refreshTab(selectedTabName);

        this.assetRegistryRestriction = getRestrictionForAssetRegistryFromFilter(this.filterRestriction);
        this.assetRegistryController = this.getAssetRegistryController();
        if (valueExists(this.assetRegistryController)) {
            this.assetRegistryController.refreshPanel(this.assetRegistryRestriction, this.customViewRestriction);
        } else {
            this.initAssetRegistry.defer(500, this);
        }
    },
    
	/**
	 * Wait and display asset registry data on first load.
	 */
	initAssetRegistry: function () {
		this.assetRegistryController = this.getAssetRegistryController();
		if(valueExists(this.assetRegistryController)){
			this.assetRegistryController.refreshPanel(this.assetRegistryRestriction, this.customViewRestriction);
		} else {
			this.initAssetRegistry.defer(500, this);
		}
	},
	
	onClickActivities: function(parentPanel, context){
		var assetType = context.findClause('bl.asset_type').value;
		var assetId = context.findClause('bl.asset_id').value;
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.asset_type', assetType, '=');
		restriction.addClause('bl.asset_id', assetId, '=');
		
		View.openDialog('ab-eam-disposal-asset-summary.axvw', restriction, false, {
			applyActionStatusRestriction: true,
			width: 1024,
			heigth:800,
			closeButton: true
		});
	},

	onClickProfile: function (parentPanel, context) {
        var assetType = context.findClause('bl.asset_type').value;
        var assetId = context.findClause('bl.asset_id').value;
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
        });
    },

    /**
     * On click mark for action handler.
     */
    onClickUpdateDisposalInfo: function (parentPanel, context) {
        this.selectedRecords = parentPanel.getSelectedRecords();
        var selectedSameAssetType = true,
            mainAssetType = "";
        for (var i = 0; i < this.selectedRecords.length; i++) {
            var assetType = this.selectedRecords[i].getValue("bl.asset_type");
            if (assetType != mainAssetType && i > 0) {
                selectedSameAssetType = false;
                break;
            } else {
                mainAssetType = assetType;
            }
        }
        if (!selectedSameAssetType) {
            View.showMessage(getMessage('errMultipleAssetSelected'));
            return false;
        }
        var disposalInfoForm = this.abAssetDisposalManageDisposalInfo_form;
        var dialogConfig = {
            width: 700,
            height: 300,
            closeButton: false
        };
        disposalInfoForm.showInWindow(dialogConfig);
        var multipleAssetsSelected = this.selectedRecords.length > 1;
        disposalInfoForm.fields.get('bl.disposal_type').clearOptions();
        if (multipleAssetsSelected) {
            disposalInfoForm.refresh(null, false);
            disposalInfoForm.showField("bl.asset_id", false);
            disposalInfoForm.setFieldValue("bl.asset_type", mainAssetType);
            disposalInfoForm.setFieldValue("bl.pending_action", "Mark for Disposal");
        } else {
            var record = this.selectedRecords[0];
            var restriction = new Ab.view.Restriction();
            restriction.addClause('bl.asset_id', record.getValue('bl.asset_id'));
            restriction.addClause('bl.asset_type', record.getValue('bl.asset_type'));
            disposalInfoForm.refresh(restriction, false);
            disposalInfoForm.showField("bl.asset_id", true);
        }
    },

    abAssetDisposalManageDisposalInfo_form_afterRefresh: function (panel) {
        var assetType = panel.getRecord().getValue('bl.asset_type');
        var field = panel.fields.get('bl.disposal_type');
        field.addOption('Sell', getMessage('disposalType_Sell'));
        field.addOption('Discard', getMessage('disposalType_Discard'));
        field.addOption('Donate', getMessage('disposalType_Donate'));
        if ('bl' != assetType && 'property' != assetType) {
            field.addOption('Stolen', getMessage('disposalType_Stolen'));
        }
        if ('bl' != assetType && 'property' != assetType && 'ta' != assetType) {
            field.addOption('Lost', getMessage('disposalType_Lost'));
        }
        field.addOption('N/A', 'N/A');
    },

    abAssetDisposalManageDisposalInfo_form_onUpdateExecute: function () {
        var recordsProcessed = false;
        for (var i = 0; i < this.selectedRecords.length; i++) {
            recordsProcessed = this.abAssetDisposalManageDisposalInfo_form_onSaveAndExecute(this.selectedRecords[i], true);
            if (!recordsProcessed) {
                break;
            }
        }
        if (recordsProcessed) {
            View.alert(getMessage("assetRecordsUpdated"), function () {
                View.panels.get('abAssetDisposalManageDisposalInfo_form').closeWindow();
            });
            this.assetRegistryController.reloadPanel();
        }
    },

    abAssetDisposalManageDisposalInfo_form_onSave: function () {
        var recordsProcessed = false;
        for (var i = 0; i < this.selectedRecords.length; i++) {
            recordsProcessed = this.abAssetDisposalManageDisposalInfo_form_onSaveAndExecute(this.selectedRecords[i], false);
            if (!recordsProcessed) {
                break;
            }
        }
        if (recordsProcessed) {
            View.alert(getMessage("assetRecordsUpdated"), function () {
                View.panels.get('abAssetDisposalManageDisposalInfo_form').closeWindow();
            });
            this.assetRegistryController.reloadPanel();
        }
    },

    abAssetDisposalManageDisposalInfo_form_onSaveAndExecute: function (selectedRecord, isExecute) {
        var assetType = selectedRecord.getValue('bl.asset_type');
        var assetId = selectedRecord.getValue('bl.asset_id');

        var assetDataSource = this.view.dataSources.get("abDisposalInfo_ds_" + assetType);
        var otDataSource = this.view.dataSources.get("abDisposalInfo_ds_ot");

        var record = null;
        var otRecord = null;
        var disposalType = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposal_type');
        var otDateSold = assetDataSource.formatValue("bl.date_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.date_disposal'), true);
        var otDescription = String.format(getMessage('otDescription'), getMessage('asset_type_description_' + assetType), disposalType);
        if (valueExistsNotEmpty(otDateSold)) {
            otDescription += " " + getMessage("otDescriptionOnDate") + " " + otDateSold;
        }
        var otComments = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.comment_disposal');
        var otCostSelling = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposed_value');
        var otStatus = "Disposed";

        if (assetType == 'bl') {

            var assetStatus = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.status'),
                pendingAction = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.pending_action');
            if (isExecute) {
                if (disposalType == 'Sell' || disposalType == 'Discard') {
                    assetStatus = 'Disposed';
                } else if (disposalType == 'Donate') {
                    assetStatus = 'Donated';
                }
                pendingAction = 'N/A';
            }

            record = assetDataSource.getRecord(new Ab.view.Restriction({'bl.bl_id': assetId}));
            record.setValue("bl.disposal_type", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposal_type'));
            record.setValue("bl.date_disposal", assetDataSource.parseValue("bl.date_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.date_disposal'), false));
            record.setValue("bl.comment_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.comment_disposal'));
            record.setValue("bl.pending_action", pendingAction);
            record.setValue("bl.status", assetStatus);
            otRecord = new Ab.data.Record({
                'ot.bl_id': assetId,
                'ot.status': otStatus,
                'ot.description': otDescription,
                'ot.comments': otComments,
                'ot.date_sold': otDateSold,
                'ot.cost_selling': otCostSelling
            }, true);

        } else if (assetType == 'eq') {
            var assetStatus = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.status'),
                pendingAction = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.pending_action');
            if (isExecute) {
                if (disposalType == 'Sell') {
                    assetStatus = 'sold';
                } else if (disposalType == 'Discard') {
                    assetStatus = 'disp';
                } else if (disposalType == 'Donate') {
                    assetStatus = 'don';
                } else if (disposalType == 'Stolen') {
                    assetStatus = 'sto';
                } else if (disposalType == 'Lost') {
                    assetStatus = 'miss';
                }
                pendingAction = 'N/A';
            }
            record = assetDataSource.getRecord(new Ab.view.Restriction({'eq.eq_id': assetId}));
            record.setValue("eq.disposal_type", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposal_type'));
            record.setValue("eq.date_disposal", assetDataSource.parseValue("eq.date_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.date_disposal'), false));
            record.setValue("eq.comment_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.comment_disposal'));
            record.setValue("eq.pending_action", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.pending_action'));
            record.setValue("eq.value_salvage", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposed_value'));
            record.setValue("eq.pending_action", pendingAction);
            record.setValue("eq.status", assetStatus);
        } else if (assetType == 'ta') {
            var assetStatus = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.status'),
                pendingAction = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.pending_action');
            if (isExecute) {
                if (disposalType == 'Sell') {
                    assetStatus = 'sold';
                } else if (disposalType == 'Discard') {
                    assetStatus = 'disp';
                } else if (disposalType == 'Donate') {
                    assetStatus = 'don';
                } else if (disposalType == 'Stolen') {
                    assetStatus = 'sto';
                }
                pendingAction = 'N/A';
            }
            record = assetDataSource.getRecord(new Ab.view.Restriction({'ta.ta_id': assetId}));
            record.setValue("ta.disposal_type", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposal_type'));
            record.setValue("ta.date_disposal", assetDataSource.parseValue("ta.date_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.date_disposal'), false));
            record.setValue("ta.comment_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.comment_disposal'));
            record.setValue("ta.pending_action", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.pending_action'));
            record.setValue("ta.value_salvage", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposed_value'));
            record.setValue("ta.pending_action", pendingAction);
            record.setValue("ta.status", assetStatus);
        } else if (assetType == 'property') {
            var assetStatus = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.status'),
                pendingAction = this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.pending_action');
            if (isExecute) {
                if (disposalType == 'Sell') {
                    assetStatus = 'SOLD';
                } else if (disposalType == 'Discard' || disposalType == 'Stolen' || disposalType == 'Lost') {
                    assetStatus = 'DISPOSED';
                } else if (disposalType == 'Donate') {
                    assetStatus = 'DONATED';
                }
                pendingAction = 'N/A';
            }
            record = assetDataSource.getRecord(new Ab.view.Restriction({'property.pr_id': assetId}));
            record.setValue("property.disposal_type", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.disposal_type'));
            record.setValue("property.date_disposal", assetDataSource.parseValue("property.date_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.date_disposal'), false));
            record.setValue("property.comment_disposal", this.abAssetDisposalManageDisposalInfo_form.getFieldValue('bl.comment_disposal'));
            record.setValue("property.pending_action", pendingAction);
            record.setValue("property.status", assetStatus);

            otRecord = new Ab.data.Record({
                'ot.pr_id': assetId,
                'ot.status': otStatus,
                'ot.description': otDescription,
                'ot.comments': otComments,
                'ot.date_sold': otDateSold,
                'ot.cost_selling': otCostSelling
            }, true);
        }
        try {
            assetDataSource.saveRecord(record);
            if (isExecute && (assetType == 'bl' || assetType == 'property')) {
                otDataSource.saveRecord(otRecord);
            }
        } catch (e) {
            Workflow.handleError(e);
            return false;
        }
        return true;
    },

    refreshFromTreeNode: function (treeType, restriction) {
        var registryRestr = getRestrictionForAssetRegistry(treeType, restriction, this.assetRegistryRestriction, this.customViewRestriction);
        this.assetRegistryController = this.getAssetRegistryController();
        this.assetRegistryController.refreshPanel(registryRestr, this.customViewRestriction);
    },
    
    getAssetRegistryController: function () {
        var result = null;
        if (valueExists(this.view.controllers.get('abEamAssetByTypeCtrl'))) {
            result = this.view.controllers.get('abEamAssetByTypeCtrl');
        } else if (valueExists(this.abAssetDispUpdateRegistryByType.contentView)
            && valueExists(this.abAssetDispUpdateRegistryByType.contentView.controllers)
            && valueExists(this.abAssetDispUpdateRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl'))) {
            result = this.abAssetDispUpdateRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl');
        }
        return result;
    },
    
    onClickPPTHandler: function (projectId) {
        var jobId = Workflow.startJob('AbCommonResources-ProjectRequirementsService-generatePPTPresentation', projectId);
        View.openJobProgressBar(getMessage("generatePPTMessage"), jobId, null, function (status) {
            var url = status.jobFile.url;
            window.location = url;
        });
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

    getMainController: function(){
		var controller = null;
		if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamDisposalConsoleCtrl'))) {
			controller = this.view.getOpenerView().controllers.get('abEamDisposalConsoleCtrl');
		}
		return controller;
	}
    
});

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
