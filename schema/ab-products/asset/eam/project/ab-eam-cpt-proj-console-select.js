//Global variables
// filter config options
var basicFilterConfig = new Ext.util.MixedCollection();
basicFilterConfig.addAll(
	{id: 'show_projects', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: 'myProjects', hasEmptyOption: false}},
	{id: 'project.status', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: {'AllOpen': 'optProjectStatus_allOpen', 'Proposed': '', 'Requested': ''}, dfltValue: 'AllOpen', hasEmptyOption: false}},
	{id: 'project.criticality', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: {'All': 'optProjectCriticality_all', 'Mission Critical': '', 'Mission Support': '', 'Noncritical': ''}, dfltValue: 'All', hasEmptyOption: false}}
);

var extendedFilterConfig = new Ext.util.MixedCollection();
extendedFilterConfig.addAll(
	{id: 'time_frame', fieldConfig: {type: 'checkbox', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: null}},
	{id: 'from_year', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}},
	{id: 'to_year', fieldConfig: {type: 'enumList', hidden: false, readOnly: false,  values: null, dfltValue: null, hasEmptyOption: false}}
);

/**
 * Select project tab controller
 */
var abEamCptProjConsoleSelectCtrl = View.createController('abEamCptProjConsoleSelectCtrl', {
	// filter console controller
	filterController: null,

	// main controller - tabs
	mainController: null,
	
	afterViewLoad: function(){

		this.initializeFilterConfig();
		this.filterController = View.controllers.get('abProjectFilterController');
		this.filterController.initializeConfigObjects(basicFilterConfig, extendedFilterConfig);
		var controller = this;
		this.filterController.onFilterCallback = function(restriction){
			controller.onFilter(restriction);
		};
		this.filterController.onClickActionButton1Handler = function(buttonElem){
			controller.onClickReportMenu(buttonElem);
		};
		this.filterController.actionButton1Label = getMessage('buttonLabel_reports');
		
		// multiple selection change event listener
		this.abEamProject_projects.addEventListener('onMultipleSelectionChange', abEamProject_projects_onMultipleSelectionChange);
		
		this.abEamProjectEvaluation_list.setStatisticAttributes({
			formulas: ["sum", "avg"],
			fields: ["project.score", "project.cost_est_baseline", "project.area_affected", "project.emp_affected"]
		});
		
	},
	
	afterInitialDataFetch: function(){
		// get main Controller
		this.mainController = this.getMainController();
		// initialize filter
		this.filterController.initializeFilter();
		// set category configuration
		this.abEamProject_projects.setCategoryColors({'Proposed': '#6600CC', 'Requested' : '#33CC33'});
		this.abEamProject_projects.setCategoryConfiguration({
    		fieldName: 'project.status',
    		order: ['Proposed','Requested'],
    		getStyleForCategory: this.getStyleForCategory
    	});
		this.abEamProject_projects.categoryCollapsed = false;
    	this.abEamProject_projects.update();
    	this.showClearSelectionButton(this.mainController.projectIds.length > 0);
    	// configure map tools action button
    	this.initializeMapTools();
    	// hide south region
    	var mainLayoutManager = this.view.getLayoutManager('mainLayout');
    	var controller = this;
		if(mainLayoutManager) {
			//TODO find another solution for map loading 
			setTimeout(function(){
				mainLayoutManager.collapseRegion('south');
		    	// apply restriction to select panel
		    	var restriction = controller.filterController.getFilterRestriction();
		    	controller.onFilter(restriction);
			}, 1500);
		}
	},
	
	//specify styling properties for category         
	getStyleForCategory: function(record) {
		var style = {};
		var status = record.getValue('project.status');
		var targetPanel = View.panels.get("abEamProject_projects");
		style.color = targetPanel.getCategoryColors()[status]; 
		return style;
	},   

	// initialize filter config objects
	initializeFilterConfig: function(){
		// set year range for year fields
		var yearRange = getYearRange();
		var currentYear = getSystemYear();
		extendedFilterConfig.get('from_year').fieldConfig.values = yearRange;
		extendedFilterConfig.get('from_year').fieldConfig.dfltValue = currentYear.toString();
		extendedFilterConfig.get('to_year').fieldConfig.values = yearRange;
		extendedFilterConfig.get('to_year').fieldConfig.dfltValue = currentYear.toString();
		
	},
	
	/**
	 * On filter event handler
	 * @param restriction restriction object 
	 */
	onFilter: function(restriction){
		var filterRestriction = new Ab.view.Restriction();
		var filterSqlRestriction = "project.is_template = 0 AND project.status IN ('Proposed', 'Requested')";
		// show project restriction
		var showProjectClause = restriction.findClause('show_projects');
		if(showProjectClause && showProjectClause.value != 'allProjects'){
			var loggedEmId = makeSafeSqlValue(this.view.user.employee.id);
			filterSqlRestriction += " AND (EXISTS(SELECT 1 FROM projteam WHERE projteam.project_id = project.project_id AND projteam.member_id = '" 
	    		+ loggedEmId + "') OR project.requestor = '" + loggedEmId
	    		+ "' OR project.dept_contact = '" + loggedEmId 
	    		+ "' OR project.apprv_mgr1 = '" + loggedEmId
	    		+ "' OR project.proj_mgr = '" + loggedEmId + "') ";
			
		}
		// project status
		var projectStatusClause = restriction.findClause('project.status');
		if(projectStatusClause && projectStatusClause.value != 'AllOpen'){
			filterRestriction.addClause(projectStatusClause.name, projectStatusClause.value, projectStatusClause.op);
		}
		//project criticality
		var projectCriticalityClause = restriction.findClause('project.criticality');
		if(projectCriticalityClause && projectCriticalityClause.value != 'All'){
			filterRestriction.addClause(projectCriticalityClause.name, projectCriticalityClause.value, projectCriticalityClause.op);
		}
		
		// time range restriction
		var fromYearClause = restriction.findClause('from_year');
		var toYearClause = restriction.findClause('to_year');
		if(fromYearClause && toYearClause){
			var fromDate = fromYearClause.value + '-01-01';
			var toDate = fromYearClause.value + '-12-31';
			filterSqlRestriction += " AND (project.date_start <= ${sql.date('" + toDate + "')} " +
					"AND ((CASE WHEN project.date_target_end IS NULL THEN project.date_end ELSE project.date_target_end END) >= ${sql.date('" + fromDate + "')} " +
							"OR project.date_end IS NULL))"; 
		}
		
		//project.project_type
		var filterClause = restriction.findClause('project.project_type');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		// project.project_id
		var filterClause = restriction.findClause('project.project_id');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		// project.program_id
		var filterClause = restriction.findClause('project.program_id');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		// program.program_type
		var filterClause = restriction.findClause('program.program_type');
		if (filterClause){
			filterSqlRestriction += " AND EXISTS(SELECT program.program_id FROM program WHERE program.program_id = project.program_id " +
					"AND program.program_type " + getSqlClauseValue(filterClause.op, filterClause.value) + ")";
		}
		
		// project.proj_mgr
		var filterClause = restriction.findClause('project.proj_mgr');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}

		// project.dept_contact
		var filterClause = restriction.findClause('project.dept_contact');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		// project.contact_id
		var filterClause = restriction.findClause('project.contact_id');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		// project.requestor
		var filterClause = restriction.findClause('project.requestor');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}

		// project.dp_id
		var filterClause = restriction.findClause('project.dp_id');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		// project.dv_id
		var filterClause = restriction.findClause('project.dv_id');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}

		// project.bl_id
		var filterClause = restriction.findClause('project.bl_id');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		
		// project.site_id
		var filterClause = restriction.findClause('project.site_id');
		if (filterClause){
			filterRestriction.addClause(filterClause.name, filterClause.value, filterClause.op);
		}
		
		// geographical fields
		var blRelatedSqlREstriction = "EXISTS(SELECT bl.bl_id FROM bl WHERE " +
				"(bl.bl_id = project.bl_id OR EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.bl_id = bl.bl_id AND activity_log.project_id = project.project_id) " +
				"OR EXISTS(SELECT sb_items.auto_number FROM sb_items WHERE sb_items.bl_id = bl.bl_id AND sb_items.sb_name = project.project_name) " +
				"OR EXISTS(SELECT gp.gp_id FROM gp, portfolio_scenario WHERE gp.portfolio_scenario_id = portfolio_scenario.portfolio_scenario_id AND gp.bl_id = bl.bl_id AND portfolio_scenario.scn_name = project.project_name )) ";
		var siteRelatedSqlREstriction = "EXISTS(SELECT site.site_id FROM site WHERE " +
				"(site.site_id = project.site_id OR EXISTS(SELECT activity_log.activity_log_id FROM activity_log WHERE activity_log.site_id = site.site_id AND activity_log.project_id = project.project_id)) ";
		// ctry.geo_region_id
		var filterClause = restriction.findClause('ctry.geo_region_id');
		if (filterClause){
			var valSuffix = filterClause.op == 'LIKE'?"%":""; 
			blRelatedSqlREstriction += " AND EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = bl.ctry_id AND ctry.geo_region_id "  + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
			siteRelatedSqlREstriction += " AND EXISTS(SELECT ctry.ctry_id FROM ctry WHERE ctry.ctry_id = site.ctry_id AND ctry.geo_region_id "  + getSqlClauseValue(filterClause.op, filterClause.value) + " )";
		}
		// bl.ctry_id
		var filterClause = restriction.findClause('bl.ctry_id');
		if (filterClause){
			blRelatedSqlREstriction += " AND bl.ctry_id "  + getSqlClauseValue(filterClause.op, filterClause.value);
			siteRelatedSqlREstriction += " AND site.ctry_id " + getSqlClauseValue(filterClause.op, filterClause.value);
		}
		// bl.state_id
		var filterClause = restriction.findClause('bl.state_id');
		if (filterClause){
			blRelatedSqlREstriction += " AND bl.state_id " + getSqlClauseValue(filterClause.op, filterClause.value);
			siteRelatedSqlREstriction += " AND site.state_id " + getSqlClauseValue(filterClause.op, filterClause.value);
		}
		// bl.city_id
		var filterClause = restriction.findClause('bl.city_id');
		if (filterClause){
			blRelatedSqlREstriction += " AND bl.city_id " + getSqlClauseValue(filterClause.op, filterClause.value);
			siteRelatedSqlREstriction += " AND site.city_id " + getSqlClauseValue(filterClause.op, filterClause.value);
		}
		// project.site_id  - add this second time only for bl join part
		var filterClause = restriction.findClause('project.site_id');
		if (filterClause){
			blRelatedSqlREstriction += " AND bl.site_id " + getSqlClauseValue(filterClause.op, filterClause.value);
		}
		
		blRelatedSqlREstriction += ")";
		siteRelatedSqlREstriction += ")";
		
		// KB 3049407 show projects without building and site assigned 
		var projectWithoutBuildingAndSite = "(project.site_id IS NULL OR project.bl_id IS NULL)";
		
		filterSqlRestriction += " AND (" + blRelatedSqlREstriction + " OR " + siteRelatedSqlREstriction + " OR " + projectWithoutBuildingAndSite + ") ";
		
		this.abEamProject_projects.addParameter('filter_restriction', filterSqlRestriction);
		this.abEamProject_projects.refresh(filterRestriction);
		
    	// hide south region
    	var mainLayoutManager = this.view.getLayoutManager('mainLayout');
    	if(mainLayoutManager){
    		mainLayoutManager.collapseRegion('south');
    	}
    	// reset tab status
    	this.mainController.resetSelection();
    	
	},
	
	showProjectDetails: function(ctx){
		if (valueExists(ctx.restriction)) {
			var projectId = ctx.restriction['project.project_id'];
			this.abEamProject_projects.selectRowChecked(this.abEamProject_projects.selectedRowIndex, true);
		}
	},
	
	abEamProject_projects_onMultipleSelectionChange: function(row){
		var projectId = row['project.project_id'];
		var projectName = row['project.project_name'];
		var isProjectMember = row['project.vf_in_project_team'];
		var isSelected = row.row.isSelected();
		this.mainController.onSelectProjectRow(projectId, isSelected, isProjectMember, projectName);
		var projectIds = this.mainController.projectIds;
		this.showClearSelectionButton(this.mainController.projectIds.length > 0);
		this.showLocationAndScorecard(projectIds, true);
	},
	
	getMainController: function(){
		var controller = null;
		if (valueExists(this.view.getOpenerView()) && valueExists(this.view.getOpenerView().controllers.get('abEamCptProjConsoleCtrl'))) {
			controller = this.view.getOpenerView().controllers.get('abEamCptProjConsoleCtrl');
		}
		return controller;
	},
	
	showClearSelectionButton: function(visible){
		this.abEamProject_projects.actions.get('clearSelection').show(visible);
	},
	
	clearSelectedProjects: function(){
		if(valueExists(this.mainController)){
			this.mainController = this.getMainController();
		}
		var selectedGridRows = this.abEamProject_projects.getSelectedGridRows();
		for (var i=0; i < selectedGridRows.length; i++ ) {
			var gridRow = selectedGridRows[i];
			var record = gridRow.getRecord();
			var projectId = record.getValue('project.project_id');
			var projectName = record.getValue('project.project_name');
			var isProjectMember = record.getValue('project.vf_in_project_team');
			var isSelected = false;
			this.mainController.onSelectProjectRow(projectId, isSelected, isProjectMember, projectName);
			gridRow.select(false);
		}
		this.showClearSelectionButton(this.abEamProject_projects.getSelectedGridRows().length > 0);
		this.showLocationAndScorecard([], true);
	},
	
	showLocationAndScorecard: function(projectIds, isCheckboxClicked){
		var selectedRowNo = projectIds.length;

		// show south region
    	var mainLayoutManager = this.view.getLayoutManager('mainLayout');
    	if(mainLayoutManager 
    			&& mainLayoutManager.isRegionCollapsed('south')){
    		mainLayoutManager.expandRegion('south');
    	}
		if (selectedRowNo == 1) {
	    	this.abEamProjectEvaluation_list.show(false, true);
			var selectedProjectId = projectIds[0];
	    	this.abEamProjectScorecard_form.refresh(new Ab.view.Restriction({'project.project_id': selectedProjectId}));
	    	this.abEamProjectScorecard_form.show(true, true);
		} else if (selectedRowNo > 1) {
			this.abEamProjectScorecard_form.show(false, true);
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_id', projectIds, 'IN');
			this.abEamProjectEvaluation_list.refresh(restriction);
			this.abEamProjectEvaluation_list.show(true, true);
		} else if(selectedRowNo == 0){
	    	this.abEamProjectEvaluation_list.show(false, true);
			this.abEamProjectScorecard_form.show(false, true);
		}
    	
		var mapController = this.view.controllers.get('abEamGisMapController');
		if(mapController) {
			if (selectedRowNo == 0) {
				mapController.clearMap();
			} else {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('activity_log.project_id', projectIds, 'IN');
				restriction.addClause('activity_log.bl_id', null, 'IS NOT NULL');
				var blIds = selectedRowNo > 0?getActivityLogBuildings(restriction):null;
				
				var projectNames = getProjectNames(projectIds);
				var restriction = new Ab.view.Restriction();
				restriction.addClause('sb_items.sb_name', projectNames, 'IN');
				restriction.addClause('sb_items.bl_id', null, 'IS NOT NULL');
				var sbItemsBlIds = selectedRowNo > 0?getSbItemsBuildings(restriction):null;
				
				var portfolioScenarioIds = getPortfolioScenarioIds(projectNames);
				var gpBlIds = null;
				if(portfolioScenarioIds.length > 0){
					var restriction = new Ab.view.Restriction();
					restriction.addClause('gp.portfolio_scenario_id', portfolioScenarioIds, 'IN');
					restriction.addClause('gp.bl_id', null, 'IS NOT NULL');
					gpBlIds = selectedRowNo > 0?getGroupBuildings(restriction):null;
				}
				
				var buildings = concatenateArray(blIds, sbItemsBlIds, gpBlIds); // blIds.concat(sbItemsBlIds, gpBlIds);
				
				var blRestriction = null;
	
				if(buildings.length > 0){
					blRestriction = new Ab.view.Restriction();
					blRestriction.addClause('bl.bl_id',buildings, 'IN');
				}
				
				mapController.setSelectedProjects(projectIds);
				mapController.refreshMap(blRestriction);
			}
		}
		
	},
	
	// refresh scorecard panel to show image document.
	abEamProjectScorecard_form_afterRefresh: function(){
		// set width = 0 for first labels
		var trEl = this.abEamProjectScorecard_form.fields.get('doc_scorecard_img').dom.parentNode.parentNode;
		trEl.children[0].style.display = 'none';
		trEl.previousSibling.children[0].style.display = 'none';
		//this.abEamProjectScorecard_form.enableAction('refreshImage', valueExistsNotEmpty(this.abEamProjectScorecard_form.getFieldValue('project.doc_scorecard')));
		if(valueExistsNotEmpty(this.abEamProjectScorecard_form.getFieldValue('project.doc_scorecard'))){
			this.abEamProjectScorecard_form.showImageDoc('doc_scorecard_img', 'project.project_id', 'project.doc_scorecard');
		}
	},
	
	abEamProject_projects_afterRefresh: function() {
    	var controller = this;
    	this.abEamProject_projects.gridRows.each(function (row) {
    		var record = row.getRecord(); 
    		var isInProject = record.getValue('project.vf_in_project_team');
	    	var projectTeamIcon = row.actions.get('projectTeamIcon');
	    	
			if (isInProject > 0) {		  
				projectTeamIcon.show(true);
			} else {
				projectTeamIcon.show(false);
			}
    	});
    },
    
    initializeMapTools: function(){
    	var menuActions = new Ext.util.MixedCollection();
    	menuActions.addAll(
		     {id: 'proposedProjectCost', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuActionFromProject', selected: true, dataSourceId: 'abEamGisDs_proposedProjectCost'}},     
		     {id: 'proposedProjectAssetCost', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuActionFromProject', selected: false, dataSourceId: 'abEamGisDs_proposedProjectAssetCost'}},     
		     {id: 'projectArea', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuActionFromProject', selected: false, dataSourceId: 'abEamGisDs_projectArea'}},     
		     {id: 'projectHeadcount', actionConfig: {visible: true, enabled: true, type: '' , listener: 'onSelectMenuActionFromProject', selected: false, dataSourceId: 'abEamGisDs_projectHeadcount'}}     
    	);
    	
    	var mapToolsActionConfig = new Ext.util.MixedCollection();
    	mapToolsActionConfig.add('toolsAction', {id: 'toolsAction', actionConfig: {visible: true, enabled: true, type: 'menu', listener: null, selected: false, actions: menuActions}});

    	var mapController = this.view.controllers.get('abEamGisMapController');
    	if(mapController){
    		mapController.configureMapAction(mapToolsActionConfig);
    	}
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


/**
 * On multiple selection change event listener.
 * @param row grid row
 */
function abEamProject_projects_onMultipleSelectionChange(row){
	View.controllers.get('abEamCptProjConsoleSelectCtrl').abEamProject_projects_onMultipleSelectionChange(row);
}

/**
 * Get year range values.
 * 
 * @returns {value: label} object   
 */
function getYearRange() {
	var systemYear = getSystemYear();
	var range = {};
	for(var i=0; i< 21; i++){
		var crtYear = systemYear-10+i;
		range[crtYear.toString()] = crtYear.toString();
	}
	return range;
}
/**
 * Get system year.
 * 
 * @returns {Number}
 */
function getSystemYear(){
	var systemDate = new Date();
	var x = systemDate.getYear();
	systemYear = x % 100;
	systemYear += (systemYear < 38) ? 2000 : 1900;
	return systemYear;
}


function concatenateArray(array1, array2, array3){
	var result = [];
	if(valueExists(array1)){
		for(var i=0; i< array1.length; i++){
			if(valueExists(array1[i])){
				result.push(array1[i]);
			}
		}
	}
	if(valueExists(array2)){
		for(var i=0; i< array2.length; i++){
			if(valueExists(array2[i])){
				result.push(array2[i]);
			}
		}
	}
	if(valueExists(array3)){
		for(var i=0; i< array3.length; i++){
			if(valueExists(array3[i])){
				result.push(array3[i]);
			}
		}
	}
	
	return result;
}
/**
 * Clear selected records from project list.
 */
function clearSelectedRecords(){
	var controller = View.controllers.get('abEamCptProjConsoleSelectCtrl');
	controller.clearSelectedProjects();
}
