//Global variables
// filter config options
var optimizationFilterConfig = new Ext.util.MixedCollection();

optimizationFilterConfig.addAll(
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

// visible field settings for asset registry panel
var assetRegistryVisibleFields = {
	'bl.asset_id': true,
	'bl.asset_type': true,
	'bl.asset_status': false,
	'bl.asset_std': true,
	'bl.pending_action': false,
	'bl.description': false,
	'bl.project_id': true,
	'bl.geo_region_id': false,
	'bl.ctry_id': false,
	'bl.state_id': false,
	'bl.city_id': false,
	'bl.site_id': true,
	'bl.bl_id': true,
	'bl.pr_id': false,
	'bl.fl_id': false,
	'bl.rm_id': false,
	'bl.bu_id': false,
	'bl.dv_id': false,
	'bl.dp_id': false
};

/**
 * Controller definition.
 */
var abEamAssetOptimizationController = View.createController('abEamAssetOptimizationController', {
	// filter console controller
	filterController: null,
	// main controller - tabs
	mainController: null,

	assetRegistryController: null,

	filterRestriction: null,

	assetRegRestriction: null,

	afterViewLoad: function(){
		this.initializeFilterConfig();
		this.filterController = View.controllers.get('abEamAssetFilterCtrl');
		this.filterController.initializeConfigObjects(optimizationFilterConfig);
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
		var parameters = {
		        'onClickClearSelectionHandler': function(){
		        	controller.onClickClearSelectionHandler();
		        },
				'onClickNodeEventHandler': function(treeType, restriction){
					controller.refreshFromTreeNode(treeType, restriction);
				},
                'onClickPPTHandler_level': function (projectId) {
                    controller.onClickPPTHandler(projectId);
                }
		};

		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeGeo').parameters = parameters;
		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeLocation').parameters = parameters;
		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeOrg').parameters = parameters;
		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeProj').parameters = parameters;

		var selectedTabName = this.abEamAssetOptimizationTree.getSelectedTabName();
		this.abEamAssetOptimizationTree.refreshTab(selectedTabName);

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
		
		// configure asset registry panel
		this.assetRegistryController = this.getAssetRegistryController();

		var assetByTypeConfig = {
				'isMultipleSelectionEnabled': false,
				'visibleFields': assetRegistryVisibleFields,
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
	                    onShowDetailsFromAssetRegistry(parentPanel, context, function(parentPanel, context){
	                    	parentPanel.refresh(parentPanel.restriction);
	                    });
	                }
	            }            
		};


		if(valueExists(this.assetRegistryController)){
			this.assetRegistryController.configureAssetByType(assetByTypeConfig);
		} else {
			// was not loaded yet
			this.abAssetOptimizationRegistryByType.parameters = {'assetByTypeConfig': assetByTypeConfig};
		}
		
		// if view is not loaded defer refresh action
		if (valueExists(this.assetRegistryController)) {
	        // load initial data
	        this.filterController.abEamAssetFilter_onFilter();		
		} else {
	        // load initial data
	        this.filterController.abEamAssetFilter_onFilter.defer(500, this.filterController);		
		}
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
		        'onClickClearSelectionHandler': function(){
		        	controller.onClickClearSelectionHandler();
		        },
				'onClickNodeEventHandler': function(treeType, restriction){
					controller.refreshFromTreeNode(treeType, restriction);
				},
				'onClickPPTHandler_level': function (projectId) {
					controller.onClickPPTHandler(projectId);
	            }
		};
		var geoTreeParameters = getGeographicalTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeGeo').parameters = geoTreeParameters;

        var locationTreeParameters = getLocationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
        this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeLocation').parameters = locationTreeParameters;
		
		var orgTreeParameters = getOrganizationTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeOrg').parameters = orgTreeParameters;

		var projTreeParameters = getProjectTreeRestrictionFromAssetFilter(this.filterRestriction, parameters);
		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationTreeProj').parameters = projTreeParameters;

		_.extend(parameters, {
			'filterRestriction': this.filterRestriction
		});
		this.abEamAssetOptimizationTree.findTab('abEamAssetOptimizationEqSystems').parameters = parameters;

		var selectedTabName = this.abEamAssetOptimizationTree.getSelectedTabName();
		this.abEamAssetOptimizationTree.refreshTab(selectedTabName);

		this.abAssetOptimizationLocation.loadView('ab-blank.axvw', null, null);

		if(this.assetRegistryController == null){
			this.assetRegistryController = this.getAssetRegistryController();
		}

		// filter restriction for asset registry pane;
		this.assetRegRestriction = getRestrictionForAssetRegistryFromFilter(restriction);

		this.assetRegistryController.showPanel(false);

		this.refreshLocationAndAssetRegistry('geographical', null, this.assetRegRestriction);

		// filter asset analysis panels
		this.filterAnalysisPanels(restriction);
	},

	// initialize filter config objects
	initializeFilterConfig: function(){

	},

	onClickClearSelectionHandler: function(){
    	this.filterController.resetFilter();
    },

	getMainController: function(){
		var controller = null;
		if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamAssetConsoleController'))) {
			controller = this.view.getOpenerView().controllers.get('abEamAssetConsoleController');
		}
		return controller;
	},

	refreshFromTreeNode: function(treeType, restriction){
		this.refreshLocationAndAssetRegistry(treeType, restriction, this.assetRegRestriction);
	},

	onClickPPTHandler: function (projectId) {
		var jobId = Workflow.startJob('AbCommonResources-ProjectRequirementsService-generatePPTPresentation', projectId);
		View.openJobProgressBar(getMessage("generatePPTMessage"), jobId, null, function (status) {
			var url = status.jobFile.url;
			window.location = url;
        });
    },

	refreshLocationAndAssetRegistry: function(treeType, treeRestriction, filterRestriction){
		// refresh location
		var gisRestriction = this.getGisMapRestriction(treeType, treeRestriction, filterRestriction);
		if(gisRestriction.clauses.length == 0){
			gisRestriction = null;
		}
		if(treeType == 'geographical' || treeType == 'location'){
			if(valueExists(treeRestriction) 
					&& ( valueExists(treeRestriction.findClause('fl.fl_id')) || valueExists(treeRestriction.findClause('rm.rm_id')))){
				this.abAssetOptimizationLocation.loadView('ab-eam-floor-plan.axvw', treeRestriction, null);
			}else{
		    	var menuActions = new Ext.util.MixedCollection();
		    	menuActions.addAll(
				     {id: 'costReplace', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
				     {id: 'costDepValue', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
				     {id: 'costValMarket', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: true, dataSourceId: 'abEamGisDs_assetRegistryCosts'}}
		    	);

		    	var mapToolsActionConfig = new Ext.util.MixedCollection();
		    	mapToolsActionConfig.add('toolsAction', {id: 'toolsAction', actionConfig: {visible: true, enabled: true, type: 'menu', listener: null, selected: false, actions: menuActions}});

				this.abAssetOptimizationLocation.parameters = {'mapToolsActionConfig' : mapToolsActionConfig,
																'panelTitle': getMessage('titleMapPanel'),
																'showMarkerLabels': false};
				this.abAssetOptimizationLocation.loadView('ab-eam-gis-map.axvw', gisRestriction, null);
			}

		} else if (treeType == 'organization') {
	    	var menuActions = new Ext.util.MixedCollection();
	    	menuActions.addAll(
			     {id: 'costReplace', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
			     {id: 'costDepValue', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
			     {id: 'costValMarket', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: true, dataSourceId: 'abEamGisDs_assetRegistryCosts'}}
	    	);

	    	var mapToolsActionConfig = new Ext.util.MixedCollection();
	    	mapToolsActionConfig.add('toolsAction', {id: 'toolsAction', actionConfig: {visible: true, enabled: true, type: 'menu', listener: null, selected: false, actions: menuActions}});

			this.abAssetOptimizationLocation.parameters = {'mapToolsActionConfig' : mapToolsActionConfig,
															'panelTitle': getMessage('titleMapPanel'),
															'showMarkerLabels': false};
			this.abAssetOptimizationLocation.loadView('ab-eam-gis-map.axvw', gisRestriction, null);
		} else if (treeType == 'project') {
	    	var menuActions = new Ext.util.MixedCollection();
	    	menuActions.addAll(
			     {id: 'costReplace', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
			     {id: 'costDepValue', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
			     {id: 'costValMarket', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: true, dataSourceId: 'abEamGisDs_assetRegistryCosts'}}
	    	);

	    	var mapToolsActionConfig = new Ext.util.MixedCollection();
	    	mapToolsActionConfig.add('toolsAction', {id: 'toolsAction', actionConfig: {visible: true, enabled: true, type: 'menu', listener: null, selected: false, actions: menuActions}});

			this.abAssetOptimizationLocation.parameters = {'mapToolsActionConfig' : mapToolsActionConfig,
															'panelTitle': getMessage('titleMapPanel'),
															'showMarkerLabels': false};
			this.abAssetOptimizationLocation.loadView('ab-eam-gis-map.axvw', gisRestriction, null);
		} else if (treeType == 'systems') {
			var menuActions = new Ext.util.MixedCollection();
			menuActions.addAll(
				{id: 'costReplace', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
				{id: 'costDepValue', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
				{id: 'costValMarket', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: true, dataSourceId: 'abEamGisDs_assetRegistryCosts'}}
			);

			var mapToolsActionConfig = new Ext.util.MixedCollection();
			mapToolsActionConfig.add('toolsAction', {id: 'toolsAction', actionConfig: {visible: true, enabled: true, type: 'menu', listener: null, selected: false, actions: menuActions}});

			this.abAssetOptimizationLocation.parameters = {'mapToolsActionConfig' : mapToolsActionConfig,
				'panelTitle': getMessage('titleMapPanel'),
				'showMarkerLabels': false};
			this.abAssetOptimizationLocation.loadView('ab-eam-gis-map.axvw', gisRestriction, null);
		} else {
			// is refreshed from filter directly - IS NOT WORKING
/*
			var menuActions = new Ext.util.MixedCollection();
	    	menuActions.addAll(
			     {id: 'costReplace', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
			     {id: 'costDepValue', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: false, dataSourceId: 'abEamGisDs_assetRegistryCosts'}},
			     {id: 'costValMarket', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuAction', selected: true, dataSourceId: 'abEamGisDs_assetRegistryCosts'}}
	    	);

	    	var mapToolsActionConfig = new Ext.util.MixedCollection();
	    	mapToolsActionConfig.add('toolsAction', {id: 'toolsAction', actionConfig: {visible: true, enabled: true, type: 'menu', listener: null, selected: false, actions: menuActions}});

			this.abAssetOptimizationLocation.parameters = {'mapToolsActionConfig' : mapToolsActionConfig,
															'panelTitle': getMessage('titleMapPanel'),
															'showMarkerLabels': false};
			this.abAssetOptimizationLocation.loadView('ab-eam-gis-map.axvw', filterRestriction, null);
*/
		}

		// refresh asset registry
		var registryRestr = getRestrictionForAssetRegistry(treeType, treeRestriction, filterRestriction);
		this.assetRegistryController = this.getAssetRegistryController();
		this.assetRegistryController.refreshPanel(registryRestr, null);

		// filter asset analysis panels
		this.filterAnalysisPanels(this.filterRestriction, {treeType: treeType, nodeRestriction: treeRestriction});
	},

	getGisMapRestriction: function (fromLocation, restriction, filterRestriction) {
        var result = new Ab.view.Restriction();
        if(valueExists(restriction)){
	        if (fromLocation == 'project') {
				var buildings = null;
				var programClause = restriction.findClause('program.program_id');
				if (programClause) {
					var programId = programClause.value;
					var tmpRestriction = "EXISTS(SELECT project.project_id FROM project WHERE project.project_id = activity_log.project_id AND ";
					tmpRestriction += " project.program_id = '" + makeSafeSqlValue(programId) + "' )";
					buildings = getActivityLogBuildings(tmpRestriction);
				} else {
					buildings = getActivityLogBuildings(restriction);
				}
				if (buildings.length > 0) {
					result.addClause('bl.bl_id', buildings, 'IN');
				}
			} else if (fromLocation == 'systems') {
				result.addClause('bl.asset_type', 'eq');
				var clause = restriction.findClause('eq.eq_id');
				result.addClause('bl.asset_id', clause.value, 'IN');
	        } else {
	            // geographical or location
	        	var floorClause = restriction.findClause('fl.bl_id');
	        	var roomClause = restriction.findClause('rm.bl_id');
	            if (floorClause) {
	                result.addClause('bl.bl_id', floorClause.value, '=');
	            } else if (roomClause) {
	                result.addClause('bl.bl_id', roomClause.value, '=');
	            } else {
	                result = restriction;
	            }
	        }
        } else if (valueExists(filterRestriction.restriction)) {
        	// when is refreshed from filter
        	result = filterRestriction.restriction;
        }
        return result;
    },

	getAssetRegistryController: function(){
		var result = null;
		if(valueExists(this.view.controllers.get('abEamAssetByTypeCtrl'))){
			result = this.view.controllers.get('abEamAssetByTypeCtrl');
		} else if(valueExists(this.abAssetOptimizationRegistryByType.contentView)
				&& valueExists(this.abAssetOptimizationRegistryByType.contentView.controllers)
				&& valueExists(this.abAssetOptimizationRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl'))){
			result = this.abAssetOptimizationRegistryByType.contentView.controllers.get('abEamAssetByTypeCtrl');
		}
		return result;
	},

	filterAnalysisPanels: function (filterRestriction, selectedTreeNode) {
		this.filterAssetScorecard(filterRestriction, selectedTreeNode);
		this.filterMissionSupport(filterRestriction, selectedTreeNode);
	},

	filterAssetScorecard: function (filterRestriction, selectedTreeNode) {
		View.controllers.get('assetScorecard').filter(filterRestriction, selectedTreeNode);
	},

	filterMissionSupport: function (filterRestriction, selectedTreeNode) {
		View.controllers.get('missionSupportController').filter(filterRestriction, selectedTreeNode);
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

