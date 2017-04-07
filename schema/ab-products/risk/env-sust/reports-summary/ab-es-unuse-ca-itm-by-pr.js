/**
 * @author Ioan Draghici
 * 08/04/2009
 */

var unuseEsItmByPriorController = View.createController('unuseEsItmByPriorCtrl', {
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
	esFilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		var console = this.esFilterPanel;
		this.consoleRestriction = " activity_log.activity_type = 'ASSESSMENT' AND activity_log.sust_priority <> 0 ";
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
		this.listUnuseEsItmByPriorBldgs.refresh(this.consoleRestriction);
		this.repUnuseEsItmByPrior.show(false);
		this.repUnuseEsItmByPriorDetails.addParameter("consoleRestriction", this.consoleRestriction.replace('&lt;&gt;','<>'));
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
		itemRestriction.addClause('activity_log.cond_value', '5', '=');
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
		
		View.openPaginatedReportDialog("ab-es-unuse-ca-itm-by-pr-prnt.axvw",
		{
			'ds_EsByPrj_owner': prjRestriction,
			'ds_EsByPrj_data': itemRestriction
		},parameters);
		
	},
	
	repUnuseEsItmByPriorDetails_afterRefresh: function(){
		var title = this.repUnuseEsItmByPriorDetails.title +" " + this.bl_id;
		var clause = this.repUnuseEsItmByPriorDetails.restriction.findClause("activity_log.sust_priority");
		if(clause != null){
			title += "; "+ clause.value;
		}
		this.repUnuseEsItmByPriorDetails.setTitle(title);
	}
})
/**
 * row click event for bldg list
 * @param {Object} row
 */
function showSummary(row){
	unuseEsItmByPriorController.bl_id = row['activity_log.bl_id'];
	var restriction  = unuseEsItmByPriorController.consoleRestriction;
	restriction += " AND activity_log.bl_id = '"+ row['activity_log.bl_id'] +"'";
	unuseEsItmByPriorController.repUnuseEsItmByPriorDetails.addParameter('blId', " AND activity_log.bl_id = '"+ row['activity_log.bl_id'] +"'");
	unuseEsItmByPriorController.repUnuseEsItmByPrior.refresh(restriction);
	unuseEsItmByPriorController.repUnuseEsItmByPrior.setTitle(unuseEsItmByPriorController.repUnuseEsItmByPrior.title +" " + row['activity_log.bl_id']);

}

/**
 * set restriction on details panel for XSL export
 */
function setRestrictionToXLS(){
	var controller = unuseEsItmByPriorController;
	var restriction = new Ab.view.Restriction();
	controller.selectedProjectIds = getKeysForSelectedRows(controller.listProjects, 'project.project_id');
	var restriction = new Ab.view.Restriction();
	restriction.addClause('activity_log.activity_type', 'ASSESSMENT', '=');
	restriction.addClause('activity_log.sust_priority', '0', '<>');
	restriction.addClause('activity_log.cond_value', '5', '=');
	if(controller.selectedProjectIds.length > 0){
		restriction.addClause('activity_log.project_id', controller.selectedProjectIds, 'IN');
	}else{
		View.showMessage(getMessage('noProjectSelectedForXLS'));
   		return false;
	}
	restriction.addClauses(controller.esFilterPanel.getRecord().toRestriction());
	controller.repUnuseEsItmByPriorDetails.restriction = restriction;
}

// open details view
function repUnuseEsItmByPrior_onClick(context){
		
		var restriction = unuseEsItmByPriorController.consoleRestriction;
		var bl_id = '';
		var priority = '';
		var panelTitle = '';
		//add context restriction
		if (context.restriction.clauses[0] != null) {
			restriction += " and activity_log.sust_priority = " + context.restriction.clauses[0].value;
			var rowValues = unuseEsItmByPriorController.repUnuseEsItmByPrior.dataSet.getRowValues();
			for(var i=0;i<rowValues.length;i++){
				if(rowValues[i].n == context.restriction.clauses[0].value){
					priority = rowValues[i].l;
				}
			}
		}
		//add building restriction
		restriction += " and activity_log.bl_id = '" +unuseEsItmByPriorController.bl_id+"'";
		bl_id = unuseEsItmByPriorController.bl_id;
		
		View.openDialog('ab-es-unuse-ca-itm-by-pr-dtls.axvw', null, true, {
	        width: 800,
	        height: 600,
	        closeButton: true,
	        afterInitialDataFetch: function(dialogView){
			  var panel = dialogView.panels.get('repUnuseEsItmByPriorDetails');
			  panelTitle = ' '+ bl_id;
			  panelTitle += '; '+ priority;
			  dialogView.panels.get('repUnuseEsItmByPriorDetails').addEventListener('afterRefresh', function(){
			  	 panel.appendTitle(panelTitle); 
			  });
	          panel.refresh(restriction);
	        }
	    });
}
