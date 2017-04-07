//Global variables
// filter config options
var dispEvaluateFilterConfig = new Ext.util.MixedCollection();

dispEvaluateFilterConfig.addAll(
		{id: 'alignment_field_1', fieldConfig: {type: 'text', hidden: true, readOnly: true,  values: null, dfltValue: null, hasEmptyOption: false}},
		{id: 'bl.pending_action', fieldConfig: {type: 'enumList', hidden: false, readOnly: true,  values: null, dfltValue: 'Mark for Evaluation', hasEmptyOption: false}},
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

var abEamDisposalEvaluateCtrl = View.createController('abEamDisposalEvaluateCtrl', {
	// main controller - tabs
	mainController: null,

	// filter console controller
	filterController: null,

	assetRegistryController: null,
	
	filterRestriction: null,

	selectedRecords: null,
	
	assetRegistryRestriction: null,

	customViewRestriction: {
				'blSql' : "NOT EXISTS(SELECT ot.ot_id FROM ot WHERE ot.bl_id = bl.bl_id AND ot.ot_id = (SELECT MAX(ot_int.ot_id) FROM ot ${sql.as} ot_int WHERE ot_int.bl_id = bl.bl_id)  AND ot.status IN('Pipeline')) AND bl.pending_action = 'Mark for Evaluation'",
				'propertySql' : "property.pending_action = 'Mark for Evaluation'",
				'taSql' : "ta.pending_action = 'Mark for Evaluation'",
				'eqSql' : "eq.pending_action = 'Mark for Evaluation'"
			},
	

	afterViewLoad: function(){
		this.initializeFilterConfig();
		this.filterController = View.controllers.get('abEamAssetFilterCtrl');
		this.filterController.initializeConfigObjects(dispEvaluateFilterConfig);
		var controller = this;
		this.filterController.onFilterCallback = function(restriction){
			controller.onFilter(restriction);
		};
		this.filterController.onClickActionButton1Handler = function(buttonElem){
			controller.onClickReportMenu(buttonElem);
		};
		this.filterController.actionButton1Label = getMessage('buttonLabel_reports');
	},

	afterInitialDataFetch: function(){
		var controller = this;
		var selectedTabName = this.abEamAssetDisposalEvaluateTree.getSelectedTabName();
		this.abEamAssetDisposalEvaluateTree.refreshTab(selectedTabName);
		
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
				'onShowDetailsHandler': function(parentPanel, restriction){
					onShowDetailsFromAssetRegistry(parentPanel, restriction);
				},
				'abEamAssetRegistryByType_list_action_1': {
					'title': getMessage('labelMarkForAction'),
					'onClickHandler': function(parentPanel, context){
						controller.onClickMarkForAction(parentPanel, context);
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
				},
	            'abEamAssetRegistryByType_row_icon_2': {
	                'title': getMessage('labelEdit'),
	                'onClickHandler': function (parentPanel, context) {
	                    onShowDetailsFromAssetRegistry(parentPanel, context, function(parentPanel, restriction){
	                    	parentPanel.refresh(parentPanel.restriction);
	                    });
	                }
	            }            
		};

		if(valueExists(this.assetRegistryController)){
			this.assetRegistryController.configureAssetByType(assetByTypeConfig);
		} else {
			// was not loaded yet
			this.abAssetDispEvaluateRegistryByType.parameters = {'assetByTypeConfig': assetByTypeConfig};
		}
		this.filterController.abEamAssetFilter_onFilter();
	},

	// initialize filter config objects
	initializeFilterConfig: function(){
		
	},
	
    onClickClearSelectionHandler: function(){
    	this.filterController.resetFilter();
    },

	/**
	 * On filter event handler
	 * @param restriction restriction object 
	 */
	onFilter: function(restriction){
		//set current restriction  to main controller.
		this.mainController.filterRestriction = restriction;

		var controller = this;
		this.filterRestriction = restriction;
		var parameters = {
				'onClickNodeEventHandler': function(treeType, restriction){
					controller.refreshFromTreeNode(treeType, restriction);
				},
				'onClickPPTHandler_level': function (projectId) {
					controller.onClickPPTHandler(projectId);
	            },
		        'onClickClearSelectionHandler': function(){
		        	controller.onClickClearSelectionHandler();
		        }
		};
		var geoTreeParameters = getGeographicalTreeRestrictionFromAssetFilter(this.filterRestriction, parameters, this.customViewRestriction);
		this.abEamAssetDisposalEvaluateTree.findTab('abEamAssetDisposalEvaluateTreeGeo').parameters = geoTreeParameters;
		
		var locationTreeParameters = getLocationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters, this.customViewRestriction);
		this.abEamAssetDisposalEvaluateTree.findTab('abEamAssetDisposalEvaluateTreeLocation').parameters = locationTreeParameters;

		var orgTreeParameters = getOrganizationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
		this.abEamAssetDisposalEvaluateTree.findTab('abEamAssetDisposalEvaluateTreeOrg').parameters = orgTreeParameters;
		
		var projTreeParameters = getProjectTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
		this.abEamAssetDisposalEvaluateTree.findTab('abEamAssetDisposalEvaluateTreeProj').parameters = projTreeParameters;

		_.extend(parameters, {
			'filterRestriction': this.filterRestriction
		});
		this.abEamAssetDisposalEvaluateTree.findTab('abEamAssetDisposalEvaluateEqSystems').parameters = parameters;

		var selectedTabName = this.abEamAssetDisposalEvaluateTree.getSelectedTabName();
		this.abEamAssetDisposalEvaluateTree.refreshTab(selectedTabName);
		
		this.assetRegistryRestriction = getRestrictionForAssetRegistryFromFilter(this.filterRestriction);
		this.assetRegistryController = this.getAssetRegistryController();
		if(valueExists(this.assetRegistryController)){
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
	
	/**
	 * On click mark for action handler.
	 */
	onClickMarkForAction: function(parentPanel, context){
		this.selectedRecords = parentPanel.getSelectedRecords();
		this.abEvaluatePendingActionSelect.clear();
		this.abEvaluatePendingActionSelect.showInWindow({
			anchor: context,
			width: 400,
			height: 200,
			closeButton: false
		});
	},

	abEvaluatePendingActionSelect_onSave: function(){
		var pendingAction = this.abEvaluatePendingActionSelect.getFieldValue('pending_action');
		if (updateAssetField(this.assetRegistryController.view, this.selectedRecords, 'pending_action', pendingAction)) {
			this.assetRegistryController.reloadPanel();
			this.selectedRecords = null;
			this.abEvaluatePendingActionSelect.closeWindow();
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
	
	refreshFromTreeNode: function(treeType, restriction){
		var registryRestr = getRestrictionForAssetRegistry(treeType, restriction, this.assetRegistryRestriction, this.customViewRestriction);
		this.assetRegistryController = this.getAssetRegistryController();
		this.assetRegistryController.refreshPanel(registryRestr, this.customViewRestriction);
	},
	
	getAssetRegistryController: function(){
		var result = null;
		if(valueExists(this.view.controllers.get('abEamAssetByTypeCtrl'))){
			result = this.view.controllers.get('abEamAssetByTypeCtrl');
		} else if(valueExists(this.abAssetDispEvaluateRegistryByType.contentView) 
				&& valueExists(this.abAssetDispEvaluateRegistryByType.contentView.controllers) 
				&& valueExists(this.abAssetDispEvaluateRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl'))){
			result = this.abAssetDispEvaluateRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl');
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
	
	onClickReportMenu: function(buttonElem){
    	
    	var reportMenuItem = new MenuItem({
    		menuDef: {
    			id: 'reportsMenu',
    			type: 'menu',
    			viewName: null, 
    			isRestricted: false, 
    			parameters: null},
    		onClickMenuHandler: onClickMenu,
    		onClickMenuHandlerRestricted: onClickMenuWithRestriction,
    		submenu: abEamReportsCommonMenu
    	});
    	reportMenuItem.build();
    	
		var menu = new Ext.menu.Menu({items: reportMenuItem.menuItems});
		menu.show(buttonElem, 'tl-bl?');
    },
	
    onClickProfile: function(parentPanel, context){
		var assetType = context.findClause('bl.asset_type').value;
		var assetId = context.findClause('bl.asset_id').value;
		var viewName = null;
		var restriction = new Ab.view.Restriction();
		if(assetType == 'bl'){
			viewName = 'ab-profile-building.axvw';
			restriction.addClause('bl.bl_id', assetId, '=');
		} else if(assetType == 'property'){
			viewName = 'ab-profile-property.axvw';
			restriction.addClause('property.pr_id', assetId, '=');
		} else if(assetType == 'eq'){
			viewName = 'ab-profile-equipment.axvw';
			restriction.addClause('eq.eq_id', assetId, '=');
		} else if(assetType == 'ta'){
			viewName = 'ab-profile-ta.axvw';
			restriction.addClause('ta.ta_id', assetId, '=');
		}
		
		View.getOpenerView().openDialog(viewName, restriction, false, {
			width:1024,
			height: 600,
			closeButton: true
		})
    },

	getMainController: function(){
		var controller = null;
		if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamDisposalConsoleCtrl'))) {
			controller = this.view.getOpenerView().controllers.get('abEamDisposalConsoleCtrl');
		}
		return controller;
	}
    
});

function onClickMenu(menu){
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}

function onClickMenuWithRestriction(menu){
	// TODO : pass restriction to view name
	if (valueExists(menu.viewName)) {
		var dialogConfig = {
				width:1024,
				height:800,
				closeButton: true
		};
		if(valueExists(menu.parameters)){
			for(param in menu.parameters){
				if(param == 'title'){
					dialogConfig[param] = getMessage(menu.parameters[param]);
				}else{
					dialogConfig[param] = menu.parameters[param];
				}
			}
		}
		View.openDialog(menu.viewName, null, false, dialogConfig);
	}
}
