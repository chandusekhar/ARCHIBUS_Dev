
/**
 * Controller to edit metrics limits value.
 * Only edit the following metric limits value:
 * - occ_Area_perOccupant
 * - occ_Density
 * - occ_Occupancy_percent
 * - ops_Costs-Maintenance_monthly
 * - ops_WorkCompleted_monthly
 * - ops_WorkOpen_weekly
 * - ops_WorkRequested_monthly
 * 
 * @author heqiang
 */
var defMetricLimitsController = View.createController('defMetricLimitsController', {
	
	/**
	 * After completing data fetch, we disable 'select all'.
	 */
	afterInitialDataFetch: function() {
//        this.afmMetricsGrid.enableSelectAll(false);
    },
    
    /**
     * After loading view, we register the handler to handle the select event.
     */
    afterViewLoad: function() {
//    	var controller = this;
//        this.afmMetricsGrid.addEventListener('onMultipleSelectionChange', function(row) {
//            controller.handleGridSelectEvent(row);
//        });
    },
    
    /**
     * We handle the select event and show the edit form.
     */
    handleGridSelectEvent: function(row) {
//    	if(row.row.isSelected()) {
//    		this.afmMetricsGrid.unselectAll();
//        	row.row.select();
//        	if(row.row.isSelected()) {
//        		var metricName = row.row.getFieldValue('afm_metric_definitions.metric_name');
//            	var restriction = new Ab.view.Restriction();
//            	restriction.addClause('afm_metric_definitions.metric_name', metricName, '=');
//            	this.defineMetricLimitsForm.refresh(restriction);
//            	this.defineMetricLimitsForm.show(true);
//            	this.defineMetricLimitsForm.setTitle("Edit Metric Definition-" + metricName);
//        	} 
//    	} else {
//    		this.defineMetricLimitsForm.setTitle("Edit Metric Definition");
//    		this.defineMetricLimitsForm.show(false);
//    	}
    }
});