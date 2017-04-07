var abCbRptCostByPrjCtrl = View.createController('abCbRptCostByPrj', {
	
	selectionLabel: null,
	
	printableRestriction: [],
	
	afterInitialDataFetch: function(){
		this.abCbRptCostByPrjChart.setDataAxisTitle(getMessage('dataAxisTitle'));
	},
	
	
	/**
	 * Event listener for 'Show' button from filter panel
	 */
	abCbRptCostByPrj_filter_onShow: function(){
    	// validateDates
    	var startDate = this.abCbRptCostByPrj_filter.getFieldValue("dateFrom");
    	var endDate = this.abCbRptCostByPrj_filter.getFieldValue("dateTo");
    	if(!validateDates(startDate, endDate))
        	return;
		
		this.selectionLabel = getFilterSelectionAsLabel(this.abCbRptCostByPrj_filter);
		var restrictions = getFilterRestriction(this.abCbRptCostByPrj_filter, null, getMessage("projectFieldLabel"));
		var restriction = restrictions.restriction;
		this.printableRestriction = restrictions.printableRestriction;
		
		this.abCbRptCostByPrjChart.addParameter('filterRestriction', restriction);
		this.abCbRptCostByPrjChart.refresh(restriction);
		this.abCbRptCostByPrjChartActual.addParameter('filterRestriction', restriction);
		this.abCbRptCostByPrjChartActual.refresh(restriction);
		this.abCbRptCostByPrjChartEstimated.addParameter('filterRestriction', restriction);
		this.abCbRptCostByPrjChartEstimated.refresh(restriction);
	},
	
	
	abCbRptCostByPrjChart_afterRefresh: function(){
		this.abCbRptCostByPrjChart.setInstructions(this.selectionLabel);
		this.abCbRptCostByPrjChart.enableAction("exportDOCX", true);
		
	},
	
	abCbRptCostByPrjChartActual_afterRefresh: function(){
		this.abCbRptCostByPrjChartActual.setInstructions(this.selectionLabel);
		this.abCbRptCostByPrjChartActual.enableAction("exportDOCX", true);
		
	},
	
	abCbRptCostByPrjChartEstimated_afterRefresh: function(){
		this.abCbRptCostByPrjChartEstimated.setInstructions(this.selectionLabel);
		this.abCbRptCostByPrjChartEstimated.enableAction("exportDOCX", true);
		
	}
});