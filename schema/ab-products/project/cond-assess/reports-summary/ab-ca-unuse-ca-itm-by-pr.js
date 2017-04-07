/**
 * @author Ioan Draghici
 * 08/04/2009
 */

var unuseCAItmByPriorController = View.createController('unuseCAItmByPriorCtrl', {
	// selected projects
	selectedProjectIds: [],
	//console restriction
	consoleRestriction: '',
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
		this.consoleRestriction += " AND activity_log.cond_value = 5 ";
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
			this.consoleRestriction += " AND activity_log.csi_id  = '"+ csi_id +"'";
		}
		this.listUnuseCAItmByPriorBldgs.refresh(this.consoleRestriction);
		this.repUnuseCAItmByPrior.show(false);
		this.repUnuseCAItmByPriorDetails.addParameter("consoleRestriction", this.consoleRestriction.replace('&lt;&g<>'));
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
		var prjRestriction = new Ab.view.Restriction();
		
		//prepare a custom printable restrictions - paired title and value (localized)
		var printableRestrictions = [];
		printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': this.selectedProjectIds.join()});
		
		prjRestriction.addClause('project.project_id', this.selectedProjectIds, 'IN');
		
		var itemRestriction = new Ab.view.Restriction();
		itemRestriction.addClause('activity_log.activity_type', 'ASSESSMENT', '=');
		itemRestriction.addClause('activity_log.cond_priority', '0', '<>');
		itemRestriction.addClause('activity_log.cond_value', '5', '=');
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
		
		View.openPaginatedReportDialog("ab-ca-unuse-ca-itm-by-pr-prnt.axvw",
		{
			'ds_CaByPrj_owner': prjRestriction,
			'ds_CaByPrj_data': itemRestriction
		}, parameters);
		
	},
	
	repUnuseCAItmByPriorDetails_afterRefresh: function(){
		var title = this.repUnuseCAItmByPriorDetails.title +" " + this.bl_id;
		var clause = this.repUnuseCAItmByPriorDetails.restriction.findClause("activity_log.cond_priority");
		if(clause != null){
			title += "; "+ clause.value;
		}
		this.repUnuseCAItmByPriorDetails.setTitle(title);
	}
})
/**
 * row click event for bldg list
 * @param {Object} row
 */
function showSummary(row){
	unuseCAItmByPriorController.bl_id = row['activity_log.bl_id'];
	var restriction  = unuseCAItmByPriorController.consoleRestriction;
	restriction += " AND activity_log.bl_id = '"+ row['activity_log.bl_id'] +"'";
	unuseCAItmByPriorController.repUnuseCAItmByPriorDetails.addParameter('blId', " AND activity_log.bl_id = '"+ row['activity_log.bl_id'] +"'");
	unuseCAItmByPriorController.repUnuseCAItmByPrior.refresh(restriction);
	unuseCAItmByPriorController.repUnuseCAItmByPrior.setTitle(unuseCAItmByPriorController.repUnuseCAItmByPrior.title +" " + row['activity_log.bl_id']);

}

/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = unuseCAItmByPriorController;
	var restriction = new Ab.view.Restriction();
	controller.selectedProjectIds = getKeysForSelectedRows(controller.listProjects, 'project.project_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_type', 'ASSESSMENT', '=');
	restriction.addClause('activity_log.cond_priority', '0', '<>');
	restriction.addClause('activity_log.cond_value', '5', '=');
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}else{
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	restriction.addClauses(controller.caFilterPanel.getRecord().toRestriction());
	controller.repUnuseCAItmByPriorDetails.restriction = restriction;
}

// open details view
function repUnuseCAItmByPrior_onClick(context){
		
		var restriction = unuseCAItmByPriorController.consoleRestriction;
		var bl_id = '';
		var priority = '';
		var panelTitle = '';
		//add context restriction
		if (context.restriction.clauses[0] != null) {
			restriction += " and activity_log.cond_priority = " + context.restriction.clauses[0].value;
			var rowValues = unuseCAItmByPriorController.repUnuseCAItmByPrior.dataSet.getRowValues();
			for(var i=0;i<rowValues.length;i++){
				if(rowValues[i].n == context.restriction.clauses[0].value){
					priority = rowValues[i].l;
				}
			}
		}
		//add building restriction
		restriction += " and activity_log.bl_id = '" +unuseCAItmByPriorController.bl_id+"'";
		bl_id = unuseCAItmByPriorController.bl_id;
		
		View.openDialog('ab-ca-unuse-ca-itm-by-pr-dtls.axvw', null, true, {
	        width: 800,
	        height: 600,
	        closeButton: true,
	        afterInitialDataFetch: function(dialogView){
	          dialogView.panels.get('repUnuseCAItmByPriorDetails').refresh(restriction);
			  panelTitle =  dialogView.panels.get('repUnuseCAItmByPriorDetails').title;
			  panelTitle += ' '+ bl_id;
			  panelTitle += '; '+ priority;
			  dialogView.panels.get('repUnuseCAItmByPriorDetails').setTitle(panelTitle); 
	        }
	    });
}
