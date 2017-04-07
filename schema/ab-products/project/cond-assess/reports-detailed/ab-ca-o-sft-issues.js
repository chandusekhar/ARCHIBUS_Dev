/**
 * @author Ioan Draghici
 * 06/23/2009
 * 08/14/2009 modified to summary panel
*/
var caOSftIssuesCtrl = View.createController('caOSftIssuesCtrl',{
	// selected projects
	selectedProjectIds: [],
	// context from drill down event
	drillDownContext: null,
	afterViewLoad: function(){
		var managerProcess = [{activityId : 'AbCapitalPlanningCA', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];

		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.repCaOSftIssuesDetails);

		this.repCaOSftIssuesDetails.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsCaOSftIssues.enableTab('tabDetails', false);
	},
	/**
	 * show action 
	 */
	caOSftIssuesFilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.selectedProjectIds, 'IN');
		restriction.addClauses(this.caOSftIssuesFilterPanel.getRecord().toRestriction());
		this.repCaOSftIssues.refresh(restriction);
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
	caOSftIssuesFilterPanel_onPaginatedReport: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
		}else{
			var projRest = new Ab.view.Restriction();
			projRest.addClause('project.project_id', selectedProjectIds, 'IN');
			var consoleRestriction = this.caOSftIssuesFilterPanel.getRecord().toRestriction();
			
			//prepare a custom printable restrictions - paired title and value (localized)
			var printableRestrictions = [];
			printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': selectedProjectIds.join()});
			
			var site_id = this.caOSftIssuesFilterPanel.getFieldValue('activity_log.site_id');
			if(	site_id){
				printableRestrictions.push({'title': getMessage('siteId'), 'value': site_id});
			}
			var bl_id = this.caOSftIssuesFilterPanel.getFieldValue('activity_log.bl_id');
			if(bl_id){
				printableRestrictions.push({'title': getMessage('blId'), 'value': bl_id});
			}
			var fl_id = this.caOSftIssuesFilterPanel.getFieldValue('activity_log.fl_id');
			if(fl_id){
				printableRestrictions.push({'title': getMessage('flId'), 'value': fl_id});
			}
			var csi_id = this.caOSftIssuesFilterPanel.getFieldValue('activity_log.csi_id');
			if(csi_id){
				printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
			}
		
			// apply printable restrictions  to the report
	    	var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions};
			
			View.openPaginatedReportDialog('ab-ca-o-sft-issues-prnt.axvw', {'ds_CaByPrj_owner':projRest,'ds_CaByPrj_data':consoleRestriction},parameters);
		}
	},
	repCaOSftIssues_afterRefresh: function(){
		this.tabsCaOSftIssues.selectTab('tabReport');
		this.tabsCaOSftIssues.enableTab('tabDetails', false);
	},

	/**
	 * edit CA item
	 * @param {Object} row
	 */
	repCaOSftIssuesDetails_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			controller.caOSftIssuesFilterPanel_onShow();
			repCaOSftIssues_onClickItem(controller.drillDownContext);
		});
	},
	repCaOSftIssuesDetails_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				controller.caOSftIssuesFilterPanel_onShow();
				repCaOSftIssues_onClickItem(controller.drillDownContext);
			})){
			return;
		}
	}
})


function setRestrictionToXLS(){
	var controller = caOSftIssuesCtrl;
	controller.selectedProjectIds = getKeysForSelectedRows(controller.listProjects, 'project.project_id');
	var restriction = new Ab.view.Restriction();
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}else{
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	restriction.addClauses(controller.caOSftIssuesFilterPanel.getRecord().toRestriction());
	controller.repCaOSftIssuesDetails.restriction = restriction;
}
/**
 * open details panel from drill down
 * @param {Object} context
 */
function repCaOSftIssues_onClickItem(context){
	var controller = View.controllers.get("caOSftIssuesCtrl");
	controller.drillDownContext = context;
	
	var restriction = new Ab.view.Restriction();
	
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}
	restriction.addClauses(controller.caOSftIssuesFilterPanel.getRecord().toRestriction());
	restriction.addClauses(context.restriction);
	
	var detailsPanel = View.panels.get('repCaOSftIssuesDetails');
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('tabsCaOSftIssues');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
	
}
