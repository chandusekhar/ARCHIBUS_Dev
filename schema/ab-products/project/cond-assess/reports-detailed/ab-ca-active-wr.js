/**
 * @author Ioan Draghici
 * 06/22/2009
 * TODO: 
 * 	- fix styles
 * */

var caActiveWrCtrl = View.createController('caActiveWrCtrl',{
	// selected projects
	selectedProjectIds: [],
	// filter restriction
	consoleRestriction: null,
	// crt node clicked in tree
	crtTreeNode: null,
	
	caActiveWrFilterPanel_onShow: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length ==0){
			View.showMessage(getMessage('noProjectSelected'));
			return;
		}
		
		var projectIds = "";
		if(this.selectedProjectIds.length > 0){
			projectIds = "AND activity_log.project_id IN ('"+ this.selectedProjectIds.join("','") +"')";
		}else{
			projectIds = "";
		}
		var console = this.caActiveWrFilterPanel;
		var siteId = console.getFieldValue('activity_log.site_id');
		if(siteId){
			siteId = "AND activity_log.site_id = '"+siteId+"'";
		}else{
			siteId = "";
		}
		
		var blId = console.getFieldValue('activity_log.bl_id');
		if(blId){
			blId = "AND activity_log.bl_id = '"+blId+"'";
		}else{
			blId = "";
		}
		
		var flId = console.getFieldValue('activity_log.fl_id');
		if(flId){
			flId = "AND activity_log.fl_id = '"+flId+"'";
		}else{
			flId = "";
		}

		var csiId = console.getFieldValue('activity_log.csi_id');
		if(csiId){
			csiId = "AND activity_log.csi_id = '"+csiId+"'";
		}else{
			csiId = "";
		}
		
		this.refreshTree(projectIds, siteId, blId, flId, csiId);
	},

	panel_CaActiveWr_Rep_afterGetData: function(panel, dataSet) {
        // add columns that are not present in the data set
		var localizedTotals = dataSet.totals[0].localizedValues;

        // replace value in localizedValues of totals[0]
		for (name in localizedTotals) {
			if (name == 'activity_log.cond_priority' ||
				name == 'activity_log.cond_value' ||
				name == 'activity_log.po_id' ||
				name == 'activity_log.description'){
					dataSet.totals[0].localizedValues[name] = '';
			}	
		}     
    },	
	/**
	 * refresh tree panel
	 * @param {Object} projectIds
	 * @param {Object} siteId
	 * @param {Object} blId
	 * @param {Object} flId
	 * @param {Object} csiId
	 */
	refreshTree: function(projectIds, siteId, blId, flId, csiId){
		this.regn_tree.addParameter('projectIds', projectIds);
		this.regn_tree.addParameter('siteId', siteId);
		this.regn_tree.addParameter('blId', blId);
		this.regn_tree.addParameter('flId', flId);
		this.regn_tree.addParameter('csiId', csiId);
		this.regn_tree.refresh();
		this.panel_CaActiveWr_Rep.show(false);
	},
	/**
	 * show selected project details report
	 */
	listProjects_onProjDetails: function(){
		showProjectDetails(this.listProjects, 'project.project_id');
	},
	
	/**
	 * show paginated report
	 */
	caActiveWrFilterPanel_onPaginatedReport: function(){
		this.selectedProjectIds = getKeysForSelectedRows(this.listProjects, 'project.project_id');
		if(this.selectedProjectIds.length == 0){
			View.showMessage(getMessage('noProjectSelectedForReport'));
			return;
		}
		var projRest = new Ab.view.Restriction();
		projRest.addClause('project.project_id', this.selectedProjectIds, 'IN');
		var consoleRestriction = this.caActiveWrFilterPanel.getRecord().toRestriction();
		projRest.addClauses(consoleRestriction);
		
		//prepare a custom printable restrictions - paired title and value (localized)
		var printableRestrictions = [];
		printableRestrictions.push({'title': getMessage('selectedProjects'), 'value': this.selectedProjectIds.join()});
			
        var site_id = this.caActiveWrFilterPanel.getFieldValue('activity_log.site_id');
        if (site_id) {
            printableRestrictions.push({
                'title': getMessage('siteId'),
                'value': site_id
            });
        }
        var bl_id = this.caActiveWrFilterPanel.getFieldValue('activity_log.bl_id');
        if (bl_id) {
            printableRestrictions.push({
                'title': getMessage('blId'),
                'value': bl_id
            });
        }
        var fl_id = this.caActiveWrFilterPanel.getFieldValue('activity_log.fl_id');
        if (fl_id) {
            printableRestrictions.push({
                'title': getMessage('flId'),
                'value': fl_id
            });
        }
        var csi_id = this.caActiveWrFilterPanel.getFieldValue('activity_log.csi_id');
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
		
		View.openPaginatedReportDialog("ab-ca-active-wr-prnt.axvw", {"ds_CaActiveWr_Rep": projRest},parameters);
	},
	/**
	 * show report for selected node
	 */
	showReport: function(){
		var projectIds = "";
		if(this.selectedProjectIds.length > 0){
			projectIds = "AND activity_log.project_id IN ('"+ this.selectedProjectIds.join("','") +"')";
		}else{
			projectIds = "AND 1 = 1";
		}
		var treeRestriction = "";
		if(this.crtTreeNode != null){
			var level = this.crtTreeNode.level.levelIndex;
			var data = this.crtTreeNode.data;
			switch(level){
				case 0 :
					{
						treeRestriction = "AND activity_log.site_id IN (SELECT site_id FROM site WHERE site.regn_id = '"+data['regn.regn_id.key']+"'";
						treeRestriction += "AND site.ctry_id = '"+data['regn.ctry_id.key']+"')";
						break;
					}
				case 1 :
					{
						treeRestriction = "AND activity_log.site_id = '"+data['site.site_id.key']+"'";
						break;
					}
				case 2 :
					{
						treeRestriction = "AND activity_log.bl_id = '"+data['bl.bl_id.key']+"'";
						break;
					}
				case 3 :
					{
						treeRestriction = "AND activity_log.bl_id = '"+data['fl.bl_id.key']+"' AND activity_log.fl_id = '"+data['fl.fl_id.key']+"'";
						break;
					}
				case 4 :
					{
						treeRestriction = "AND activity_log.bl_id = '"+data['rm.bl_id.key']+"' AND activity_log.fl_id = '"+data['rm.fl_id.key']+"' ";
						treeRestriction += "AND activity_log.rm_id = '"+data['rm.rm_id.key']+"'";
						break;
					}
			}
			
		}
		this.panel_CaActiveWr_Rep.addParameter('projectIds', projectIds);
		this.panel_CaActiveWr_Rep.addParameter('treeRestriction', treeRestriction);
		this.panel_CaActiveWr_Rep.refresh();
	}
})

/**
 * click event for tree items
 */
function onClickTreeNode(){
	var controller = View.controllers.get('caActiveWrCtrl');
	var crtTreeNode = View.panels.get("regn_tree").lastNodeClicked;
	controller.crtTreeNode = crtTreeNode;
	controller.showReport();
}
function panel_CaActiveWr_Details_onClick(context){
 	if (context.restriction.clauses.length > 0) {
		var restriction = " activity_log.assessment_id = '" + context.restriction.clauses[0].value +"'";

		View.openDialog('ab-ca-active-wr-details.axvw', null, true, {
	        width: 800,
	        height: 600,
	        closeButton: true,
	        afterInitialDataFetch: function(dialogView){
	          dialogView.panels.get('panel_CaActiveWr_Details').refresh(restriction);  
	        }
	    });
 }

}
