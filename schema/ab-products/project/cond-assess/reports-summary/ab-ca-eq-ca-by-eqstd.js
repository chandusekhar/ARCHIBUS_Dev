var caCAEqCAByEqstdController = View.createController('caCAEqCAByEqstdCtrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
	//selected equipment standard
	eq_std: '',
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
		
		var existsAssessClause = "EXISTS (SELECT 1 FROM activity_log WHERE activity_log.eq_id = eq.eq_id AND {0})";

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
			this.consoleRestriction += " AND activity_log.csi_id IN (SELECT csi.csi_id FROM csi WHERE csi.hierarchy_ids LIKE '%|"+ csi_id +"|%')";
		}
		
		this.listCAEqCAByEqstdEqs.refresh(existsAssessClause.replace("{0}", this.consoleRestriction));
		
		this.repCAEqCAByEqstd.show(false);
		
		this.repCAEqCAByEqstdDetails.addParameter("consoleRestriction", this.consoleRestriction);
		this.repCAEqCAByEqstdDetails.addParameter("eqStd", " AND 1=1");
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
		
		var prjRestriction = "project.project_id IN ('" + this.selectedProjectIds.join("','") + "')";
		/*new Ab.view.Restriction();
		prjRestriction.addClause('project.project_id', this.selectedProjectIds, 'IN');*/
		
		var itemRestriction = new Ab.view.Restriction();
		itemRestriction.addClause('activity_log.activity_type', 'ASSESSMENT', '=');
		itemRestriction.addClause('activity_log.cond_priority', '0', '<>');
		itemRestriction.addClause('activity_log.eq_id', '', 'IS NOT NULL');
		
		var console = this.caFilterPanel;
		
		//prepare a custom printable restrictions - paired title and value (localized)
		var printableRestriction = [];
		printableRestriction.push({'title': getMessage('selectedProjects'), 'value': this.selectedProjectIds.join(", ")});
		
		var site_id = console.getFieldValue('activity_log.site_id');
		if(site_id){
			itemRestriction.addClause('activity_log.site_id', site_id, '=');
			printableRestriction.push({'title': getMessage('siteId'), 'value': site_id});
		}
		var bl_id = console.getFieldValue('activity_log.bl_id');
		if(bl_id){
			itemRestriction.addClause('activity_log.bl_id', bl_id, '=');
			printableRestriction.push({'title': getMessage('blId'), 'value': bl_id});
		}
		var fl_id = console.getFieldValue('activity_log.fl_id');
		if(fl_id){
			itemRestriction.addClause('activity_log.fl_id', fl_id, '=');
			printableRestriction.push({'title': getMessage('flId'), 'value': fl_id});
		}
		var csi_id = console.getFieldValue('activity_log.csi_id');
		var paramCsiId = '1 = 1';
		if(csi_id){
			paramCsiId = 'a.hierarchy_ids LIKE \'%|'+csi_id+'|%\'';
			printableRestriction.push({'title': getMessage('csiId'), 'value': csi_id});
		}
		
		// apply printable restrictions and vf_hierarchy_ids to the report
	    var parameters = {'vf_hierarchy_ids':paramCsiId, 'printRestriction':true, 'printableRestriction':printableRestriction};
	    var restriction = {
				'ds_CaByPrj_owner': prjRestriction,
				'ds_CaByPrj_data': itemRestriction
			}
		
		View.openPaginatedReportDialog("ab-ca-eq-ca-by-eqstd-prnt.axvw", restriction, parameters);
		
	}
})
/**
 * row click event for equipment standards list
 * @param {Object} row
 */
function showSummary(row){
	caCAEqCAByEqstdController.eq_std = row['eq.eq_std'];
	
	var restriction = caCAEqCAByEqstdController.consoleRestriction;
	restriction += " AND eq.eq_std = '" + row['eq.eq_std'] +"'";
	caCAEqCAByEqstdController.repCAEqCAByEqstd.addParameter('consoleRestriction', restriction);
	caCAEqCAByEqstdController.repCAEqCAByEqstd.refresh();
	
	caCAEqCAByEqstdController.repCAEqCAByEqstdDetails.addParameter("eqStd", " AND eq.eq_std = '"+ row['eq.eq_std'] +"'");
}
/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = caCAEqCAByEqstdController;
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
	controller.repCAEqCAByEqstdDetails.restriction = restriction;
}

