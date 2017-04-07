var abCbRptTotByYearCompareCtrl = View.createController('abCbRptTotByYearCompCtrl', {
	
	selectionLabel: null,
	
	printableRestriction: [],
	
	/**
	 * Event listener for 'Show' button from filter panel
	 */
	abCbRptTotByYearCompare_filter_onShow: function(){
    	// validateDates
    	var startDate = this.abCbRptTotByYearCompare_filter.getFieldValue("dateFrom");
    	var endDate = this.abCbRptTotByYearCompare_filter.getFieldValue("dateTo");
    	if(!validateDates(startDate, endDate))
        	return;
		
		var siteId = this.abCbRptTotByYearCompare_filter.getFieldValue('bl.site_id');
		var blId = this.abCbRptTotByYearCompare_filter.getFieldValue('activity_log.bl_id');
		if(!siteId && !blId){
			View.showMessage(getMessage('errSelection'));
			return;
		}else if(blId){
			this.abCbRptTotByYearCompare_totalChart.addParameter('groupBy','activity_log.bl_id');
		}else{
			this.abCbRptTotByYearCompare_totalChart.addParameter('groupBy','activity_log.site_id');
		}
		this.selectionLabel = getFilterSelectionAsLabel(this.abCbRptTotByYearCompare_filter);
		
		var restrictions = getFilterRestriction(this.abCbRptTotByYearCompare_filter);
		var restriction = restrictions.restriction;
		this.printableRestriction = restrictions.printableRestriction;
		
		this.abCbRptTotByYearCompare_totalChart.addParameter('filterRestriction', restriction);
		this.abCbRptTotByYearCompare_totalChart.refresh();
	},
	
	
	abCbRptTotByYearCompare_totalChart_afterRefresh: function(){
		this.abCbRptTotByYearCompare_totalChart.setInstructions(this.selectionLabel);
		this.abCbRptTotByYearCompare_totalChart.enableAction("exportDOCX", true);
		
	}
})


