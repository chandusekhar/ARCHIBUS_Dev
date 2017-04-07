/**
 * @author Ioan Draghici
 * 08/06/2009
 */

var esSumCls1ByRegnController = View.createController('esSumCls1ByRegnCtrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
	//csi restriction for summary panel
	csi_parameter_summary: '',
	//csi restriction for regn list
	csi_parameter_regn: '',
	//selected site_id
	regn_id: '',
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
			this.csi_parameter_regn = " AND activity_log.csi_id IN (SELECT csi.csi_id FROM csi WHERE csi.hierarchy_ids LIKE '%|"+ csi_id +"|%')";
			this.csi_parameter_summary = " AND a.hierarchy_ids LIKE '%|"+ csi_id +"|%'";
		}else{
			this.csi_parameter_regn = " AND 1 = 1";
			this.csi_parameter_summary = " AND 1 = 1";
		}
		this.listEsSumCls1ByRegnRegns.addParameter("consoleRestriction", this.consoleRestriction + this.csi_parameter_regn);
		this.listEsSumCls1ByRegnRegns.refresh();
		this.repEsSumCls1ByRegn.show(false);
		this.repEsSumCls1ByRegnDetails.addParameter("consoleRestriction", this.consoleRestriction + this.csi_parameter_regn);
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
		
		View.openPaginatedReportDialog("ab-es-bdg-a-rt-cls1-by-rg-prnt.axvw",
		{
			'ds_EsByPrj_owner': prjRestriction,
			'ds_EsByPrj_data': itemRestriction
		},parameters);
		
	}
})
/**
 * row click event for regn list
 * @param {Object} row
 */
function showSummary(row){
	esSumCls1ByRegnController.regn_id = row['activity_log.regn_id'];
	var restriction  = esSumCls1ByRegnController.consoleRestriction;
	var regn_restriction = " AND regn_id = '"+ row['activity_log.regn_id'] +"'";
	esSumCls1ByRegnController.repEsSumCls1ByRegnDetails.addParameter("regnId", regn_restriction);
	esSumCls1ByRegnController.repEsSumCls1ByRegn.addParameter('consoleRestriction', restriction);
	esSumCls1ByRegnController.repEsSumCls1ByRegn.addParameter('regnId', regn_restriction);
	esSumCls1ByRegnController.repEsSumCls1ByRegn.addParameter('classification_id', esSumCls1ByRegnController.csi_parameter_summary);
	esSumCls1ByRegnController.repEsSumCls1ByRegn.refresh();
}

/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = esSumCls1ByRegnController;
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
	controller.repEsSumCls1ByRegnDetails.restriction = restriction;
}

