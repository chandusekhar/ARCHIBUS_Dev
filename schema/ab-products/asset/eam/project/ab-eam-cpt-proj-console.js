/**
 * EAM Capital Projects Console - main controller.
 */
var abEamCptProjConsoleCtrl = View.createController('abEamCptProjConsoleCtrl', {
	
	/**
	 * Selected project id, works only with single selection
	 */
	projectId: null,
	
	/**
	 * Selected project name.
	 */
	projectName: null,
	/**
	 * Selected project id's, works with multiple selection
	 */
	projectIds: [],
	
	projectMember: {},

	afterInitialDataFetch: function(){
		this.updateTabsState();
		// set message to gant tab
		
	},
	
	updateTabsState: function(){
		var multipleProjectRestriction = new Ab.view.Restriction();
		multipleProjectRestriction.addClause('project.project_id', this.projectIds, 'IN');
		multipleProjectRestriction.addClause('project.status', ['Proposed', 'Requested'], 'IN');
		multipleProjectRestriction.addClause('is_from_eam', true, '=');
		
		var singleProjectRestriction = new Ab.view.Restriction();
		singleProjectRestriction.addClause('project.project_id', this.projectId, '=');
		singleProjectRestriction.addClause('project.status', ['Proposed', 'Requested'], 'IN');
		singleProjectRestriction.addClause('is_from_eam', true, '=');
		
		//KB3049945 - set project name to project code when project name not exists
		var sbRestriction = this.projectName ? this.projectName : this.projectId;
		var tabRestriction = {'abEamCptProjConsoleTabs_select': null, 
        		'abEamCptProjConsoleTabs_space': new Ab.view.Restriction({'sb_items.sb_name': sbRestriction}), 'abEamCptProjConsoleTabs_asset': new Ab.view.Restriction({'sb.sb_name': sbRestriction}),  
        		'abEamCptProjConsoleTabs_dashboard':singleProjectRestriction, 'abEamCptProjConsoleTabs_gantt': multipleProjectRestriction, 
        		'abEamCptProjConsoleTabs_location':multipleProjectRestriction};
			
		if ((this.projectId == null && this.projectIds.length == 0) 
				|| this.isNotInProjectTeam()){
			var tabStatus = {'abEamCptProjConsoleTabs_select': true, 
        		'abEamCptProjConsoleTabs_space':false, 'abEamCptProjConsoleTabs_asset':false, 'abEamCptProjConsoleTabs_dashboard':false, 
        		'abEamCptProjConsoleTabs_gantt':false, 'abEamCptProjConsoleTabs_location':false};
			this.enableTabs(tabStatus, tabRestriction);
		} else if (valueExistsNotEmpty(this.projectId) && this.projectIds.length == 1) {
			var tabStatus = {'abEamCptProjConsoleTabs_select': true, 
	        		'abEamCptProjConsoleTabs_space':true, 'abEamCptProjConsoleTabs_asset':true, 'abEamCptProjConsoleTabs_dashboard':true, 
	        		'abEamCptProjConsoleTabs_gantt':true, 'abEamCptProjConsoleTabs_location':true};
			
			this.enableTabs(tabStatus, tabRestriction);
		} else if (valueExistsNotEmpty(this.projectId) && this.projectIds.length > 1) {
			var tabStatus = {'abEamCptProjConsoleTabs_select': true, 
	        		'abEamCptProjConsoleTabs_space':false, 'abEamCptProjConsoleTabs_asset':false, 'abEamCptProjConsoleTabs_dashboard':false, 
	        		'abEamCptProjConsoleTabs_gantt':true, 'abEamCptProjConsoleTabs_location':true};
			this.enableTabs(tabStatus, tabRestriction);
		}
	},
	
	/**
	 * Enable/disable tabs
	 * @param tabsStatus object with tabs status.
	 */
	enableTabs: function(tabsStatus, tabsRestriction){
		for(var tab in tabsStatus){
			this.abEamCptProjConsoleTabs.enableTab(tab, tabsStatus[tab]);
			if (valueExists(tabsRestriction[tab])) {
				this.abEamCptProjConsoleTabs.setTabRestriction(tab, tabsRestriction[tab]);
			}
		}
	},
	
	isNotInProjectTeam: function(){
		var result = false;
		for(var project in this.projectMember){
			if(valueExists(this.projectMember[project]) 
					&& parseInt(this.projectMember[project]) == 0){
				result = true;
				break;
			}
		}
		return result;
	},
	
	/**
	 * Called when project row is clicked.
	 */
	onSelectProjectRow: function(projectId, checked, isProjectMember, projectName){
		if(!valueExists(checked)){
			// is called from row click
			if(valueExistsNotEmpty(this.projectId) 
					&& this.projectId == projectId) {
				// same project --> exit
				return false;
			}else{
				this.projectId = projectId;
			}
			checked = true;
		}
		
		if (checked) {
			if (!valueExistsNotEmpty(this.projectId)) {
				this.projectId = projectId;
			}
			if (valueExistsNotEmpty(projectName)) {
				this.projectName = projectName;
			}

			if (this.projectIds.indexOf(projectId) == -1) {
				this.projectIds.push(projectId);
			} 
			this.projectMember[projectId] = isProjectMember;
		}else{
			
			if( this.projectIds.indexOf(projectId) != -1){
				this.projectIds.splice(this.projectIds.indexOf(projectId), 1);
			}
			
			if (this.projectId == projectId) {
				this.projectId = null;
				this.projectName = null;
				
				if (this.projectIds.length != -1) {
					this.projectId = this.projectIds[0];
					this.projectName = getProjectName(this.projectId);
				}
			}
			this.projectMember[projectId] = null;
			delete this.projectMember[projectId];
		}
		this.updateTabsState();
	},
	
	resetSelection: function(){
		this.projectId = null;
		this.projectIds = [];
		this.updateTabsState();
	},
	
	selectTab: function(tabName){
		this.abEamCptProjConsoleTabs.selectTab(tabName);
	}
	
});


/**
 * Returns project name
 * @param projectId project names
 * @returns {String}
 */
function getProjectName(projectId){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('project.project_id', projectId, '=');
	
	var params = {
			tableName: 'project',
			fieldNames: toJSON(['project.project_id', 'project.project_name']),
			restriction: toJSON(restriction)
	};
	try {
		var result = Workflow.call('AbCommonResources-getDataRecord', params);
		if (result.code == 'executed') {
			return result.dataSet.getValue('project.project_name');
		} 
	} catch (e) {
		Workflow.handleError(e);
	}
}


