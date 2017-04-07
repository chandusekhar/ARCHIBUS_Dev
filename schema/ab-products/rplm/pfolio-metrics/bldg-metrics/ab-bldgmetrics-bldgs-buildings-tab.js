var bldgBuildingsController = View.createController('bldgBuildingsController', {
	
	/**
     * Event handler for 'selectMetricField' action
     */
	bldgMetricsBldgsBuildings_grid_onSelectMetricFields: function(){
		
		View.openDialog('ab-bldgmetrics-select-metrics.axvw',null, true, {
			width:400,
			height:600, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsSelectMetrics_ctrl');
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_bldgsAllMetrics;
					
					// Define which 'metrics' will be returned by DataSource 
                    dataSource.addParameter("cost_per_area", getMessage("cost_per_area"));
                    dataSource.addParameter("avg_area_em", getMessage("avg_area_em"));
                    dataSource.addParameter("ru_ratio", getMessage("ru_ratio"));
                    dataSource.addParameter("usable_area", getMessage("usable_area"));
                    dataSource.addParameter("value_book", getMessage("value_book"));
                    dataSource.addParameter("value_market", getMessage("value_market"));
                    dataSource.addParameter("fci", getMessage("fci"));
                    dataSource.addParameter("operating_costs", getMessage("operating_costs"));
                    dataSource.addParameter("capital_project_cost", getMessage("capital_project_cost"));
                    dataSource.addParameter("area_estimated", getMessage("area_estimated"));
                    dataSource.addParameter("efficency_rate", getMessage("efficency_rate"));
                    dataSource.addParameter("int_gross_area", getMessage("int_gross_area"));
                    dataSource.addParameter("total_lease_neg_area", getMessage("total_lease_neg_area"));
                    dataSource.addParameter("total_occup_area", getMessage("total_occup_area"));
                    dataSource.addParameter("rentable_area", getMessage("rentable_area"));
                    dataSource.addParameter("total_room_area", getMessage("total_room_area"));
                    dataSource.addParameter("employee_headcount", getMessage("employee_headcount"));
                    dataSource.addParameter("max_bldg_occup", getMessage("max_bldg_occup"));
                    dataSource.addParameter("building_occupancy", getMessage("building_occupancy"));
                    dataSource.addParameter("vacancy_percent", getMessage("vacancy_percent"));
                    dataSource.addParameter("chargeable_cost", getMessage("chargeable_cost"));
					
					dialogController.dataSource = dataSource;
					
				}
		});
		
	 }
    
    
})



/**
 * Event handler for clicking on bl_id field from 'bldgMetricsBldgsBuildings_grid' panel
 * 
 * @param {Object} row
 */
function showBuildingDetailes(row){
    var rowRecord = row;
    View.openDialog('ab-rplm-pfadmin-leases-and-suites-by-building-base-report.axvw', null, true, {
        width: 1280,
        height: 600,
        closeButton: true,
        afterInitialDataFetch: function(dialogView){
            var dialogController = dialogView.controllers.get('repLeaseSuitesByBldgBase');
            dialogController.bl_id = rowRecord['bl.bl_id'];
            dialogController.initializeView();
        }
    });
}
