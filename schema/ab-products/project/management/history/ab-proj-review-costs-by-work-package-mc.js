var projReviewCostsWorkPkgController = View.createController('projReviewCostsWorkPkg', {
	
	afterViewLoad: function() {
        this.projReviewCostsWorkPkgCrossTable.addEventListener('afterGetData', this.projReviewCostsWorkPkgCrossTable_afterGetData, this);
    },
    
	projReviewCostsWorkPkgCrossTable_afterGetData: function(panel, dataSet) {
    	dataSet.totals[0].localizedValues['activity_log.contracted_cost'] = '';
    	dataSet.totals[0].localizedValues['activity_log.owner_count'] = '';
    	dataSet.totals[0].localizedValues['activity_log.vendor_count'] = '';
    	dataSet.totals[0].localizedValues['activity_log.cost_invoice'] = '';
    	dataSet.totals[0].localizedValues['activity_log.variance_design_baseline'] = '';
    	dataSet.totals[0].localizedValues['activity_log.variance_actual_design'] = '';
	}
});