/**
 * @author Ioan Draghici
 * 08/04/2009
 */

var caSumBldgCondController = View.createController('caSumBldgCondCtrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
	// context from drill down event
	drillDownContext: null,
	afterViewLoad: function(){
		var managerProcess = [{activityId : 'AbCapitalPlanningCA', processIds: ['Assessment Manager','Manage Assessments']}];
		var helpDeskProcess = [{activityId : 'AbBldgOpsHelpDesk', processIds: ['Create Service Request','Client']}];

		var isUserProcess = (this.view.isProcessAssignedToUser(helpDeskProcess) && this.view.isProcessAssignedToUser(managerProcess));
		afterCreateDataRows_removeWorkRequest(null, null, isUserProcess, this.repCASumBldgCondDetails);

		this.repCASumBldgCondDetails.afterCreateCellContent = afterCreateCellContent_disableIcon;
		this.tabsCASumBldgCond.enableTab('tabDetails', false);
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
	caFilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		var console = this.caFilterPanel;
		
		this.consoleRestriction = " activity_log.activity_type = 'ASSESSMENT' and activity_log.bl_id IS NOT NULL  AND activity_log.cond_priority <> 0 ";
		this.consoleRestriction += " AND activity_log.project_id IN ('"+ this.selectedProjectIds.join("','") +"')";
		this.consoleRestriction += getConsoleRestrictionAsSql(console);
		
		this.repCASumBldgCond.addParameter("consoleRestriction", this.consoleRestriction.replace('&lt;&g;','<>'));
		this.repCASumBldgCond.refresh();
	},
	repCASumBldgCond_afterRefresh: function(){
		this.tabsCASumBldgCond.selectTab('tabReport');
		this.tabsCASumBldgCond.enableTab('tabDetails', false);
	},
	/** 
	 * paginated report action 
	 */
	caFilterPanel_onPaginatedReport: function(){
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
		itemRestriction.addClause('activity_log.cond_priority', '0', '<>');
		itemRestriction.addClause('activity_log.bl_id', '', 'IS NOT NULL');
		var console = this.caFilterPanel;
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
		
		View.openPaginatedReportDialog("ab-ca-bl-ca-sum-prnt.axvw",
		{
			'ds_CaByPrj_owner': prjRestriction,
			'ds_CaByPrj_data': itemRestriction
		},parameters);
		
	},

	repCASumBldgCondDetails_afterRefresh: function(){
		var title = this.repCASumBldgCondDetails.title;
		if (this.repCASumBldgCondDetails.restriction != null) {
			var clause = this.repCASumBldgCondDetails.restriction.findClause("activity_log.bl_id");
			if (clause != null) {
				title += ": " + clause.value;
			}
			this.repCASumBldgCondDetails.setTitle(title);
		}
	},
	/**
	 * edit CA item
	 * @param {Object} row
	 */
	repCASumBldgCondDetails_onEdit: function(row, action){
		var controller = this;
		var activity_log_id = row.getFieldValue('activity_log.activity_log_id');
	
		// open edit dialog
		editCAItem(activity_log_id, function(){
			controller.caFilterPanel_onShow();
			repCASumBldgCond_onClickItem(controller.drillDownContext);
		});
	},
	repCASumBldgCondDetails_onCreateWorkReq: function(row, action){
		var controller = this;
		if(!createWorkRequest(this.view, row, function(){
				controller.caFilterPanel_onShow();
				repCASumBldgCond_onClickItem(controller.drillDownContext);
			})){
			return;
		}
	}
})

/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = caSumBldgCondController;
	var restriction = new Ab.view.Restriction();
	controller.selectedProjectIds = getKeysForSelectedRows(controller.listProjects, 'project.project_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_type', 'ASSESSMENT', '=');
	restriction.addClause('activity_log.cond_priority', '0', '<>');
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}else{
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	restriction.addClauses(controller.caFilterPanel.getRecord().toRestriction());
	controller.repCASumBldgCondDetails.restriction = restriction;
}

function repCASumBldgCond_onClickItem(context){
	var controller = View.controllers.get("caSumBldgCondCtrl");
	controller.drillDownContext = context;
	
	var restriction = new Ab.view.Restriction();
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}
	restriction.addClauses(controller.caFilterPanel.getRecord().toRestriction());
	restriction.addClauses(context.restriction);
	
	var detailsPanel = View.panels.get('repCASumBldgCondDetails');
	detailsPanel.refresh(restriction);
	
	var objTabs = View.panels.get('tabsCASumBldgCond');
	objTabs.selectTab('tabDetails');
	objTabs.tabs[1].config['enabled'] = 'true';
}
