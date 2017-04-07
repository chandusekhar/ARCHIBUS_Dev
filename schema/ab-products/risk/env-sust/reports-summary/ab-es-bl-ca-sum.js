/**
 * @author Ioan Draghici
 * 08/04/2009
 */

var esSumBldgCondController = View.createController('esSumBldgCondCtrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
	// context from drill down event
	drillDownContext: null,
	afterViewLoad: function(){
		var managerProcess = [{activityId : 'AbRiskES', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];
		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.repEsSumBldgCondDetails);
		
		this.repEsSumBldgCondDetails.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsEsSumBldgCond.enableTab('tabDetails', false);
	},
	/**
	 * show selected project details
	 */
	listProjects_onProjDetails: function(){
		showProjectDetails(this.listProjects, 'project.project_id');
	},
	/**
	 * show action
	 */
	esFilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		var console = this.esFilterPanel;
		
		this.consoleRestriction = " activity_log.activity_type = 'ASSESSMENT' and activity_log.bl_id IS NOT NULL  AND activity_log.sust_priority <> 0 ";
		this.consoleRestriction += " AND activity_log.project_id IN ('"+ this.selectedProjectIds.join("','") +"')";
		this.consoleRestriction += getConsoleRestrictionAsSql(console);
		
		this.repEsSumBldgCond.addParameter("consoleRestriction", this.consoleRestriction.replace('&lt;&gt;','<>'));
		this.repEsSumBldgCond.refresh();
	},
	repEsSumBldgCond_afterRefresh: function(){
		this.tabsEsSumBldgCond.selectTab('tabReport');
		this.tabsEsSumBldgCond.enableTab('tabDetails', false);
	},
	/** 
	 * paginated report action 
	 */
	esFilterPanel_onPaginatedReport: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelectedForReport'));
			return;
		}
		//prepare a custom printable restrictions - paired title and value (localized)
		var printableRestrictions = [];
		printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': this.selectedProjectIds.join()});
		
		var prjRestriction = new Ab.view.Restriction();
		prjRestriction.addClause('project.project_id', this.selectedProjectIds, 'IN');
		var itemRestriction = new Ab.view.Restriction();
		itemRestriction.addClause('activity_log.activity_type', 'ASSESSMENT', '=');
		itemRestriction.addClause('activity_log.sust_priority', '0', '<>');
		itemRestriction.addClause('activity_log.bl_id', '', 'IS NOT NULL');
		var console = this.esFilterPanel;
		var site_id = console.getFieldValue('activity_log.site_id');
		if(site_id){
			itemRestriction.addClause('activity_log.site_id', site_id, '=');
			printableRestrictions.push({'title': getMessage('siteId'), 'value': site_id});
		}
		var bl_id = console.getFieldValue('activity_log.bl_id');
		if(bl_id){
			itemRestriction.addClause('activity_log.bl_id', bl_id, '=');
			printableRestrictions.push({'title': getMessage('blId'), 'value': bl_id});
		}
		var fl_id = console.getFieldValue('activity_log.fl_id');
		if(fl_id){
			itemRestriction.addClause('activity_log.fl_id', fl_id, '=');
			printableRestrictions.push({'title': getMessage('flId'), 'value': fl_id});
		}
		var csi_id = console.getFieldValue('activity_log.csi_id');
		if(csi_id){
			itemRestriction.addClause('csi.hierarchy_ids', '%|'+csi_id+'|%', 'LIKE');
			printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
		}
		
		// apply printable restrictions to the report
	    var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions};
		View.openPaginatedReportDialog("ab-es-bl-ca-sum-prnt.axvw",
		{
			'ds_EsByPrj_owner': prjRestriction,
			'ds_EsByPrj_data': itemRestriction
		},parameters);
		
	},

	repEsSumBldgCondDetails_afterRefresh: function(){
		var title = this.repEsSumBldgCondDetails.title;
		if (this.repEsSumBldgCondDetails.restriction != null) {
			var clause = this.repEsSumBldgCondDetails.restriction.findClause("activity_log.bl_id");
			if (clause != null) {
				title += ": " + clause.value;
			}
			this.repEsSumBldgCondDetails.setTitle(title);
		}
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	repEsSumBldgCondDetails_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			controller.esFilterPanel_onShow();
			repEsSumBldgCond_onClickItem(controller.drillDownContext);
		});
	},
	repEsSumBldgCondDetails_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				controller.esFilterPanel_onShow();
				repEsSumBldgCond_onClickItem(controller.drillDownContext);
			})){
			return;
		}
	}
})

/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = esSumBldgCondController;
	var restriction = new Ab.view.Restriction();
	controller.selectedProjectIds = getKeysForSelectedRows(controller.listProjects, 'project.project_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_type', 'ASSESSMENT', '=');
	restriction.addClause('activity_log.sust_priority', '0', '<>');
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}else{
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	restriction.addClauses(controller.esFilterPanel.getRecord().toRestriction());
	controller.repEsSumBldgCondDetails.restriction = restriction;
}

function repEsSumBldgCond_onClickItem(context){
	var controller = View.controllers.get("esSumBldgCondCtrl");
	controller.drillDownContext = context;
	
	var restriction = new Ab.view.Restriction();
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}
	restriction.addClauses(controller.esFilterPanel.getRecord().toRestriction());
	restriction.addClauses(context.restriction);
	
	var detailsPanel = View.panels.get('repEsSumBldgCondDetails');
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('tabsEsSumBldgCond');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
}
