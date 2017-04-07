/**
 * @author Ioan Draghici
 * 08/06/2009
 */

var esSumCls3BySiteController = View.createController('esSumCls3BySiteCtrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
	//csi restriction for summary panel
	csi_parameter_summary: '',
	//csi restriction for bldg list
	csi_parameter_site: '',
	//selected site_id
	site_id: '',
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
		this.consoleRestriction = " activity_log.activity_type = 'ASSESSMENT' AND activity_log.sust_priority <> 0 ";
		this.consoleRestriction += " AND activity_log.project_id IN ('"+ this.selectedProjectIds.join("','") +"')";
		var site_id = console.getFieldValue('activity_log.site_id');
		if(site_id){
			this.consoleRestriction += " AND activity_log.site_id = '"+ site_id +"'";
		}
		var bl_id = console.getFieldValue('activity_log.bl_id');
		if(bl_id){
			this.consoleRestriction += " AND activity_log.bl_id = '"+ bl_id +"'";
		}
		var fl_id = console.getFieldValue('activity_log.fl_id');
		if(fl_id){
			this.consoleRestriction += " AND activity_log.fl_id = '"+ fl_id +"'";
		}
		var csi_id = console.getFieldValue('activity_log.csi_id');
		if(csi_id){
			this.csi_parameter_site = " AND activity_log.csi_id IN (SELECT csi.csi_id FROM csi WHERE csi.hierarchy_ids LIKE '%|"+ csi_id +"|%')";
			this.csi_parameter_summary = " AND a.hierarchy_ids LIKE '%|"+ csi_id +"|%'";
		}else{
			this.csi_parameter_site = " AND 1 = 1";
			this.csi_parameter_summary = " AND 1 = 1";
		}
		this.listEsSumCls3BySiteSites.refresh(this.consoleRestriction + this.csi_parameter_site);
		this.repEsSumCls3BySite.show(false);
		this.repEsSumCls3BySiteDetails.addParameter("consoleRestriction", this.consoleRestriction + this.csi_parameter_site);
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
		itemRestriction.addClause('activity_log.site_id', '', 'IS NOT NULL');
		itemRestriction.addClause('activity_log.csi_id', '', 'IS NOT NULL');
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
		var paramCsiId = '1 = 1';
		if(csi_id){
			paramCsiId = 'a.hierarchy_ids LIKE \'%|'+csi_id+'|%\'';
			printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
		}
		
		// apply printable restrictions and vf_hierarchy_ids to the report
	    var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions, 'vf_hierarchy_ids':paramCsiId};
		
		View.openPaginatedReportDialog("ab-es-bdg-a-rt-cls3-by-st-prnt.axvw",
		{
			'ds_EsByPrj_owner': prjRestriction,
			'ds_EsByPrj_data': itemRestriction
		},parameters);
		
	}
})
/**
 * row click event for sites list
 * @param {Object} row
 */
function showSummary(row){
	esSumCls3BySiteController.site_id = row['activity_log.site_id'];
	var restriction  = esSumCls3BySiteController.consoleRestriction;
	restriction += " AND activity_log.site_id = '"+ row['activity_log.site_id'] +"'";
	esSumCls3BySiteController.repEsSumCls3BySiteDetails.addParameter("siteId", " AND activity_log.site_id = '"+ row['activity_log.site_id'] +"'");
	esSumCls3BySiteController.repEsSumCls3BySite.addParameter('consoleRestriction', restriction);
	esSumCls3BySiteController.repEsSumCls3BySite.addParameter('classification_id', esSumCls3BySiteController.csi_parameter_summary);
	esSumCls3BySiteController.repEsSumCls3BySite.refresh();
}

/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = esSumCls3BySiteController;
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
	controller.repEsSumCls3BySiteDetails.restriction = restriction;
}


