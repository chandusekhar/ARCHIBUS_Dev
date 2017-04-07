/**
 * @author Ioan Draghici
 * 06/23/2009
 * 08/14/2009 modified to summary panel
*/
var esEUsgIssuesCtrl = View.createController('esEUsgIssuesCtrl',{
	// selected projects
	selectedProjectIds: [],
	// context from drill down event
	drillDownContext: null,
	afterViewLoad: function(){
		var managerProcess = [{activityId : 'AbRiskES', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.repEsEUsgIssuesDetails);

		this.repEsEUsgIssuesDetails.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsEsEUsgIssues.enableTab('tabDetails', false);
	},
	/**
	 * show action 
	 */
	esEUsgIssuesFilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.selectedProjectIds, 'IN');
		restriction.addClauses(this.esEUsgIssuesFilterPanel.getRecord().toRestriction());
		this.repEsEUsgIssues.refresh(restriction);
	},
	repEsEUsgIssues_afterRefresh: function(){
		this.tabsEsEUsgIssues.selectTab('tabReport');
		this.tabsEsEUsgIssues.enableTab('tabDetails', false);
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
	esEUsgIssuesFilterPanel_onPaginatedReport: function(){
		var selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
		}else{
			var projRest = new Ab.view.Restriction();
			projRest.addClause('activity_log.project_id', selectedProjectIds, 'IN');
			var consoleRestriction = this.esEUsgIssuesFilterPanel.getRecord().toRestriction();
			
			//prepare a custom printable restrictions - paired title and value (localized)
			var printableRestrictions = [];
			printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': selectedProjectIds.join()});
			
			var site_id = this.esEUsgIssuesFilterPanel.getFieldValue('activity_log.site_id');
			if(	site_id){
				printableRestrictions.push({'title': getMessage('siteId'), 'value': site_id});
			}
			var bl_id = this.esEUsgIssuesFilterPanel.getFieldValue('activity_log.bl_id');
			if(bl_id){
				printableRestrictions.push({'title': getMessage('blId'), 'value': bl_id});
			}
			var fl_id = this.esEUsgIssuesFilterPanel.getFieldValue('activity_log.fl_id');
			if(fl_id){
				printableRestrictions.push({'title': getMessage('flId'), 'value': fl_id});
			}
			var csi_id = this.esEUsgIssuesFilterPanel.getFieldValue('activity_log.csi_id');
			if(csi_id){
				printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
			}
		
			// apply printable restrictions  to the report
	    	var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions};
			
			View.openPaginatedReportDialog('ab-es-o-energy-usage-prnt.axvw', {'ds_EsEUsg_owner':projRest,'ds_EsEUsg_data':consoleRestriction},parameters);
		}
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	repEsEUsgIssuesDetails_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			controller.esEUsgIssuesFilterPanel_onShow();
			repEsEUsgIssues_onClickItem(controller.drillDownContext);
		});
	},
	repEsEUsgIssuesDetails_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				controller.esEUsgIssuesFilterPanel_onShow();
				repEsEUsgIssues_onClickItem(controller.drillDownContext);
			})){
			return;
		}
	}
})


function setRestrictionToXLS(){
	var controller = esEUsgIssuesCtrl;
	controller.selectedProjectIds = getKeysForSelectedRows(controller.listProjects, 'project.project_id');
	var restriction = new Ab.view.Restriction();
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}else{
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	restriction.addClauses(controller.esEUsgIssuesFilterPanel.getRecord().toRestriction());
	controller.repEsEUsgIssuesDetails.restriction = restriction;
}
/**
 * open details panel from drill down
 * @param {Object} context
 */
function repEsEUsgIssues_onClickItem(context){
	var controller = View.controllers.get("esEUsgIssuesCtrl");
	controller.drillDownContext = context;
	
	var restriction = new Ab.view.Restriction();
	
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}
	restriction.addClauses(controller.esEUsgIssuesFilterPanel.getRecord().toRestriction());
	restriction.addClauses(context.restriction);
	
	var detailsPanel = View.panels.get('repEsEUsgIssuesDetails');
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('tabsEsEUsgIssues');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
	
}
