var abCbRptSummaryChartCtrl =  View.createController('abCbRptSummaryChart', {
	
	
	restriction: "1=1",
	
	printableRestriction: [],
	
	/**
	 * Event listener for 'Show' button from filter panel
	 */
	abCbRptSummaryChart_filter_onShow: function(){
    	// validateDates
    	var startDate = this.abCbRptSummaryChart_filter.getFieldValue("dateFrom");
    	var endDate = this.abCbRptSummaryChart_filter.getFieldValue("dateTo");
    	if(!validateDates(startDate, endDate))
        	return;
		
		var selectedRows = this.abCbRptSummaryChartProjects.getSelectedRows();
		if(!selectedRows.length){
			View.showMessage(getMessage('errNoProjectSelected'));
			return;
		}
		
		var selectedProjectIds = new Array();
		for (var index in selectedRows){
			selectedProjectIds[index] = selectedRows[index]['project.project_id'];
		}
		
		var restrictions = getFilterRestriction(this.abCbRptSummaryChart_filter, selectedProjectIds, getMessage("projectFieldLabel"));
		this.restriction = restrictions.restriction;
		this.printableRestriction = restrictions.printableRestriction;
		
		this.abCbRptSummaryChart.addParameter('filterRestriction',this.restriction.replace(/activity_log./g, 'c.'));
		this.abCbRptSummaryChart.refresh(this.restriction);
		
		this.abCbRptSummaryChart.enableAction("doc", true);
	},
	
	/**
	 * open view with selected project details 
	 * defined in ab-cb-rpt-common.js
	 */
	abCbRptSummaryChartProjects_onProjDetails: function(){
		showProjectDetails(this.abCbRptSummaryChartProjects, 'project.project_id');
	}
});

/**
 * Listener for clicking on stacked bar.
 * 
 * @param ctx
 */
function openDialog(ctx) {

	View.openDialog('ab-cb-rpt-summary-dialog.axvw',null, true, {
		width:800,
		height:600, 
		closeButton:false,
			afterInitialDataFetch:function(dialogView){
				var dialogController = dialogView.controllers.get('abCbRptSummaryDialogCtrl');
				dialogController.abCbRptSummaryDialog_panelSubstance.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelSubstance.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelSubstance.refresh(ctx.restriction);
				dialogController.setInstructionsElement(0);
				dialogController.abCbRptSummaryDialog_panelProject.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelProject.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelProject.refresh(ctx.restriction);
				dialogController.abCbRptSummaryDialog_panelSite.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelSite.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelSite.refresh(ctx.restriction);
				dialogController.abCbRptSummaryDialog_panelBuilding.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelBuilding.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelBuilding.refresh(ctx.restriction);
				dialogController.abCbRptSummaryDialog_panelBlBySubst.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelBlBySubst.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelBlBySubst.refresh(ctx.restriction);
				dialogController.abCbRptSummaryDialog_panelFloor.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelFloor.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelFloor.refresh(ctx.restriction);
				dialogController.abCbRptSummaryDialog_panelRoom.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelRoom.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelRoom.refresh(ctx.restriction);
				dialogController.abCbRptSummaryDialog_panelAssessments.addParameter("filterRestriction", abCbRptSummaryChartCtrl.restriction);
				dialogController.abCbRptSummaryDialog_panelAssessments.addParameter("filterPrintableRestriction", abCbRptSummaryChartCtrl.printableRestriction);
				dialogController.abCbRptSummaryDialog_panelAssessments.refresh(ctx.restriction);
				
			}
	});
}
