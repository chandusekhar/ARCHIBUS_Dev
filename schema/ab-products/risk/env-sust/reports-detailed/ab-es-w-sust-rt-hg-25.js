/**
 * @author Ioan Draghici
 * 06/22/2009
 * 08/14/2009 modified to summary panel
 */

var esWSustRtHg25Ctrl = View.createController('esWSustRtHg25Ctrl',{
	// selected projects
	selectedProjectIds: [],
	// restriction
	restriction: null,
	// context from drill down event
	drillDownContext: null,
	afterViewLoad: function(){
		var managerProcess = [{activityId : 'AbRiskES', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.repEsWSustRtHg25Details);

		this.repEsWSustRtHg25Details.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsEsWSustRtHg25.enableTab('tabDetails', false);
	},
	/**
	 * show action 
	 */
	esWSustRtHg25FilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.selectedProjectIds, 'IN');
		restriction.addClauses(this.esWSustRtHg25FilterPanel.getRecord().toRestriction());
		this.restriction = restriction;
		this.repEsWSustRtHg25.refresh(restriction);
	},
	repEsWSustRtHg25_afterRefresh: function(){
		this.tabsEsWSustRtHg25.selectTab('tabReport');
		this.tabsEsWSustRtHg25.enableTab('tabDetails', false);
	},
	/**
	 * show project details
	 */
	listProjects_onProjDetails: function(){
		showProjectDetails(this.listProjects, 'project.project_id');
	},
	/**
	 * show paginated report
	 */
	esWSustRtHg25FilterPanel_onPaginatedReport: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
		}else{
			var projRest = new Ab.view.Restriction();
			projRest.addClause('activity_log.project_id', selectedProjectIds, 'IN');
			var consoleRestriction = this.esWSustRtHg25FilterPanel.getRecord().toRestriction();
			
			//prepare a custom printable restrictions - paired title and value (localized)
			var printableRestrictions = [];
			printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': selectedProjectIds.join()});
			
			var site_id = this.esWSustRtHg25FilterPanel.getFieldValue('activity_log.site_id');
			if(	site_id){
				printableRestrictions.push({'title': getMessage('siteId'), 'value': site_id});
			}
			var bl_id = this.esWSustRtHg25FilterPanel.getFieldValue('activity_log.bl_id');
			if(bl_id){
				printableRestrictions.push({'title': getMessage('blId'), 'value': bl_id});
			}
			var fl_id = this.esWSustRtHg25FilterPanel.getFieldValue('activity_log.fl_id');
			if(fl_id){
				printableRestrictions.push({'title': getMessage('flId'), 'value': fl_id});
			}
			var csi_id = this.esWSustRtHg25FilterPanel.getFieldValue('activity_log.csi_id');
			if(csi_id){
				printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
			}
		
			// apply printable restrictions  to the report
	    	var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions};
			
			View.openPaginatedReportDialog('ab-es-w-sust-rt-hg-25-prnt.axvw', {'ds_EsSustRtHg25_owner':projRest,'ds_EsSustRtHg25_data':consoleRestriction},parameters);
		}
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	repEsWSustRtHg25Details_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			controller.esWSustRtHg25FilterPanel_onShow();
			repEsWSustRtHg25Details_onClickItem(controller.drillDownContext);
		});
	},
	repEsWSustRtHg25Details_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				controller.esWSustRtHg25FilterPanel_onShow();
				repEsWSustRtHg25Details_onClickItem(controller.drillDownContext);
			})){
			return;
		}
	}
})

function setRestrictionToXLS(){
	var controller = View.controllers.get("esWSustRtHg25Ctrl");
	var restriction = new Ab.view.Restriction();
	controller.selectedProjectIds = getKeysForSelectedRows(controller.listProjects, 'project.project_id');
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}else{
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	restriction.addClauses(controller.esWSustRtHg25FilterPanel.getRecord().toRestriction());
	controller.repEsWSustRtHg25Details.restriction = restriction;
}

/**
 * Opens Assessments drill down on click event
 * @param {Object} context The clicked line restriction
 */
function repEsWSustRtHg25Details_onClickItem(context) {
	var ctrl = View.controllers.get("esWSustRtHg25Ctrl");
	ctrl.drillDownContext = context;
	var restriction = " 1 = 1 ";
	
	if(ctrl.selectedProjectIds.length > 0){
		restriction += " AND activity_log.project_id IN ('" + ctrl.selectedProjectIds.join("','") + "') ";
	}
	/*
	 * 05/12/2010 IOAN fixed issue with drill down restriction
	 */
	if(context.restriction.clauses){
		var clause = context.restriction.findClause("activity_log.vf_cond_rating");
		if(clause){
			restriction += " AND (activity_log.sust_priority * activity_log.cond_value)" + " " + context.restriction.clauses[0].op + " '" + context.restriction.clauses[0].value + "'";
		}
	}
	var console = View.panels.get('esWSustRtHg25FilterPanel')
	restriction += getConsoleRestrictionAsSql(console);
	
	var detailsPanel = View.panels.get('repEsWSustRtHg25Details');
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('tabsEsWSustRtHg25');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
}
