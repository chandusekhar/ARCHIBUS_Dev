/**
 * @author Ioan Draghici
 * 08/06/2009
 */

var caCAEqCondByCls3Controller = View.createController('caCAEqCondByCls3Ctrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
	//csi restriction for summary panel
	csi_parameter_summary: '',
	//csi restriction for eq list
	csi_parameter_eq: '',
	//selected site_id
	eq_id: '',
	activitytype: 'ASSESSMENT',
	
	afterInitialDataFetch: function(){
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			this.activitytype = '%';
			View.setTitle(getMessage('comm_title'));
			this.listProjects.selectAll();
			this.caFilterPanel_onShow();
			var restriction = "activity_log.eq_id IS NOT NULL AND activity_log.cond_priority <> 0 AND EXISTS(SELECT project.project_id FROM project " +
					"	WHERE activity_log.project_id = project.project_id AND (project.project_type=\'COMMISSIONING\' OR project.project_type LIKE \'ASSESSMENT%\') )";
			this.repCAEqCondByCls3.addParameter("consoleRestriction", restriction);
			this.repCAEqCondByCls3.addParameter('classification_id',' AND 1=1');
			this.repCAEqCondByCls3.refresh();
		}
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
		this.consoleRestriction = " activity_log.activity_type LIKE '" + this.activitytype + "' AND activity_log.cond_priority <> 0 ";
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
			this.csi_parameter_eq = " AND activity_log.csi_id IN (SELECT csi.csi_id FROM csi WHERE csi.hierarchy_ids LIKE '%|"+ csi_id +"|%')";
			this.csi_parameter_summary = " AND a.hierarchy_ids LIKE '%|"+ csi_id +"|%'";
		}else{
			this.csi_parameter_summary = " AND 1 = 1";
			this.csi_parameter_eq = " AND 1 = 1";
		}
		this.listCAEqCondByCls3Eqs.refresh(this.consoleRestriction + this.csi_parameter_eq);
		this.repCAEqCondByCls3.show(false);
		this.repCAEqCondByCls3Details.addParameter("consoleRestriction", this.consoleRestriction + this.csi_parameter_eq);
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
		itemRestriction.addClause('activity_log.activity_type', this.activitytype, 'LIKE');
		itemRestriction.addClause('activity_log.cond_priority', '0', '<>');
		itemRestriction.addClause('activity_log.eq_id', '', 'IS NOT NULL');
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
		
		View.openPaginatedReportDialog("ab-ca-eq-ca-by-cls3-prnt.axvw",
		{
			'ds_CaByPrj_owner': prjRestriction,
			'ds_CaByPrj_data': itemRestriction
		},parameters);
		
	}
})
/**
 * row click event for sites list
 * @param {Object} row
 */
function showSummary(row){
	caCAEqCondByCls3Controller.eq_id = row['activity_log.eq_id'];
	var restriction  = caCAEqCondByCls3Controller.consoleRestriction;
	restriction += " AND activity_log.eq_id = '"+ row['activity_log.eq_id'] +"'";
	caCAEqCondByCls3Controller.repCAEqCondByCls3Details.addParameter("eqId", " AND activity_log.eq_id = '"+ row['activity_log.eq_id'] +"'");
	caCAEqCondByCls3Controller.repCAEqCondByCls3.addParameter('consoleRestriction', restriction);
	caCAEqCondByCls3Controller.repCAEqCondByCls3.addParameter('classification_id', caCAEqCondByCls3Controller.csi_parameter_summary);
	caCAEqCondByCls3Controller.repCAEqCondByCls3.refresh();
}
/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = caCAEqCondByCls3Controller;
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
	controller.repCAEqCondByCls3Details.restriction = restriction;
}

