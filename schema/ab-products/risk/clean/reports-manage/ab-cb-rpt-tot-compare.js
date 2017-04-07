var abCbRptTotCompareCtrl = View.createController('abCbRptTotCompare', {
	printableRestriction: [],
	
	selectionLabel: null,
	/**
	 * Event listener for 'Show' button from filter panel
	 */
	abCbRptTotCompare_filter_onShow: function(){
    	// validateDates
    	var startDate = this.abCbRptTotCompare_filter.getFieldValue("dateFrom");
    	var endDate = this.abCbRptTotCompare_filter.getFieldValue("dateTo");
    	if(!validateDates(startDate, endDate))
        	return;
		
		var siteId = this.abCbRptTotCompare_filter.getFieldValue('bl.site_id');
		var blId = this.abCbRptTotCompare_filter.getFieldValue('activity_log.bl_id');
		if(!siteId && !blId){
			View.showMessage(getMessage('errSelection'));
			return;
		}else if(blId){
			this.abCbRptTotCompareChart.addParameter('groupBy','activity_log.bl_id');
		}else{
			this.abCbRptTotCompareChart.addParameter('groupBy','bl.site_id');
		}
		this.selectionLabel = getFilterSelectionAsLabel(this.abCbRptTotCompare_filter);
		var restrictions = getFilterRestriction(this.abCbRptTotCompare_filter);
		var restriction = restrictions.restriction;
		this.printableRestriction = restrictions.printableRestriction;
		
		this.abCbRptTotCompareChart.addParameter('filterRestriction', restriction)
		this.abCbRptTotCompareChart.refresh(restriction);
	},
	
	
	abCbRptTotCompareChart_afterRefresh: function(){
		this.abCbRptTotCompareChart.setInstructions(this.selectionLabel);
		this.abCbRptTotCompareChart.enableAction("exportDOCX", true);
		
	}
});