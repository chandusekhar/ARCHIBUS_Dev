/**
 * @author Ioan Draghici
 * 08/04/2009
 */

var caSumCls1ByBldgController = View.createController('caSumCls1ByBldgCtrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
	//csi restriction for summary panel
	csi_parameter_summary: '',
	//csi restriction for bldg list
	csi_parameter_bldg: '',
	//selected bl_id
	bl_id: '',
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
		this.consoleRestriction = " activity_log.activity_type = 'ASSESSMENT' AND activity_log.cond_priority <> 0 ";
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
			this.csi_parameter_bldg = " AND activity_log.csi_id IN (SELECT csi.csi_id FROM csi WHERE csi.hierarchy_ids LIKE '%|"+ csi_id +"|%')";
			this.csi_parameter_summary = " AND a.hierarchy_ids LIKE '%|"+ csi_id +"|%'";
		}else{
			this.csi_parameter_bldg = " AND 1 = 1 ";
			this.csi_parameter_summary = " AND 1 = 1";
		}
		this.listCASumCls1ByBldgBldgs.refresh(this.consoleRestriction + this.csi_parameter_bldg);
		this.repCASumCls1ByBldg.show(false);
		this.repCASumCls1ByBldgDetails.addParameter("consoleRestriction", this.consoleRestriction + this.csi_parameter_bldg);
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
		itemRestriction.addClause('activity_log.csi_id', '', 'IS NOT NULL');
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
		var paramCsiId = '1 = 1';
		if(csi_id){
			paramCsiId = 'a.hierarchy_ids LIKE \'%|'+csi_id+'|%\'';
			printableRestrictions.push({'title': getMessage('csiId'), 'value': csi_id});
		}
		
		// apply printable restrictions and vf_hierarchy_ids to the report
	    var parameters = {'printRestriction':true, 'printableRestriction':printableRestrictions, 'vf_hierarchy_ids':paramCsiId};
		
		View.openPaginatedReportDialog("ab-ca-bdg-a-rt-cls1-by-bl-prnt.axvw",
		{
			'ds_CaByPrj_owner': prjRestriction,
			'ds_CaByPrj_data': itemRestriction
		},
		parameters);
		
	}
})
/**
 * row click event for bldg list
 * @param {Object} row
 */
function showSummary(row){
	caSumCls1ByBldgController.bl_id = row['activity_log.bl_id'];
	var restriction  = caSumCls1ByBldgController.consoleRestriction;
	restriction += " AND activity_log.bl_id = '"+ row['activity_log.bl_id'] +"'";
	caSumCls1ByBldgController.repCASumCls1ByBldg.addParameter('consoleRestriction', restriction);
	caSumCls1ByBldgController.repCASumCls1ByBldg.addParameter('classification_id', caSumCls1ByBldgController.csi_parameter_summary);
	caSumCls1ByBldgController.repCASumCls1ByBldgDetails.addParameter('blId', " AND activity_log.bl_id = '"+ row['activity_log.bl_id'] +"'");
	caSumCls1ByBldgController.repCASumCls1ByBldg.refresh();
}

/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = caSumCls1ByBldgController;
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
	controller.repCASumCls1ByBldgDetails.restriction = restriction;
}

