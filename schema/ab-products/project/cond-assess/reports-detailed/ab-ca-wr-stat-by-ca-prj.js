/**
 * @author Ioan Draghici
 * 06/18/2009
 * 08/14/2009 - modified to summary report
 */

/**
 * controller definition
 */
var caWrStatByPrjController = View.createController('caWrStatByPrjCtrl',{
	// selected projects
	selectedProjectIds: [],
	/**
	 * show action 
	 */
	caWrStatByPrjFilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.selectedProjectIds, 'IN');
		restriction.addClauses(this.caWrStatByPrjFilterPanel.getRecord().toRestriction());
		this.repCaWrStatByPrj.addParameter('projectRestriction', this.toSQLString(restriction));
		this.repCaWrStatByPrj.refresh();
	},
	
	repCaWrStatByPrj_afterGetData: function(panel, dataSet) {
        // add columns that are not present in the data set
		var localizedTotals = dataSet.totals[0].localizedValues;

        // replace value in localizedValues of totals[0]
		for (name in localizedTotals) {
			if (name == 'activity_log.hours_actual'||
				name == 'activity_log.cond_priority' ||
				name == 'activity_log.cond_value' ||
				name == 'activity_log.activity_log_id' ||
				name == 'activity_log.description'){
					dataSet.totals[0].localizedValues[name] = '';
			}	
		}     
    },
	
	/**
	 * parse restriction object to sql string
	 * @param {Object} abRestriction
	 */
	toSQLString: function(abRestriction){
		var result = "";
		for(var i=0;i < abRestriction.clauses.length;i++){
			var objClause = abRestriction.clauses[i];
			var field = objClause.name;
			var op = objClause.op;
			var relOp = objClause.relOp;
			var value = objClause.value;
			result += " " + field;
			if(op == 'IN'){
				result += " " + op +" ('"+ value.join("','") +"') ";
			}else{
				if (field == "activity_log.date_assessed") {
					result += " "+ (op.replace('&gt;', '>')).replace('&lt;', '<') +" ${sql.date('"+value+"')} ";
				}
				else {
					result += " " + op + " '" + value + "' ";
				}
			}
			if(i < abRestriction.clauses.length -1){
				result += relOp;
			}
		}
		return (result);
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
	caWrStatByPrjFilterPanel_onPaginatedReport: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelectedForReport'));
			return;
		}
		var projRest = new Ab.view.Restriction();
		projRest.addClause('project.project_id', this.selectedProjectIds, 'IN');
		var consoleRestriction = this.caWrStatByPrjFilterPanel.getRecord().toRestriction();
		projRest.addClauses(consoleRestriction);
		
		//prepare a custom printable restrictions - paired title and value (localized)
		var printableRestrictions = [];
		printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': this.selectedProjectIds.join()});
			
        var site_id = this.caWrStatByPrjFilterPanel.getFieldValue('activity_log.site_id');
        if (site_id) {
            printableRestrictions.push({
                'title': getMessage('siteId'),
                'value': site_id
            });
        }
        var bl_id = this.caWrStatByPrjFilterPanel.getFieldValue('activity_log.bl_id');
        if (bl_id) {
            printableRestrictions.push({
                'title': getMessage('blId'),
                'value': bl_id
            });
        }
        var fl_id = this.caWrStatByPrjFilterPanel.getFieldValue('activity_log.fl_id');
        if (fl_id) {
            printableRestrictions.push({
                'title': getMessage('flId'),
                'value': fl_id
            });
        }
        var csi_id = this.caWrStatByPrjFilterPanel.getFieldValue('activity_log.csi_id');
        if (csi_id) {
            printableRestrictions.push({
                'title': getMessage('csiId'),
                'value': csi_id
            });
        }
        
        // apply printable restrictions  to the report
        var parameters = {
            'printRestriction': true,
            'printableRestriction': printableRestrictions
        };	
		
		View.openPaginatedReportDialog("ab-ca-wr-stat-by-ca-prj-prnt.axvw", {"ds_CaActiveWr_Rep": projRest},parameters);
	}
})
function gridCaWrStatByPrjDetails_onClick(context) {
 	if (context.restriction.clauses.length > 0) {
		var restriction = " activity_log.assessment_id = " + context.restriction.clauses[0].value;

		View.openDialog('ab-ca-wr-stat-by-ca-prj-details.axvw', null, true, {
	        width: 800,
	        height: 600,
	        closeButton: true,
	        afterInitialDataFetch: function(dialogView){
	          dialogView.panels.get('gridCaWrStatByPrjDetails').refresh(restriction);  
	        }
	    });
 }
}
