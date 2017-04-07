var bldgStatisticsController = View.createController('bldgStatisticsController', {
  
  	
    afterInitialDataFetch:function(){
		
        //set head fields 
        this.setHeadFields();
        
        
		//show only the default selected metrics fields
        
        var selectedIndex = 0;
        var selectedMetrics = View.controllers.get('abBldgMetricsBldgs_ctrl').selectedMetrics;
        for (i = 0; i < View.controllers.get('abBldgMetricsBldgs_ctrl').fieldsArray.length; i++) {
            if (i == selectedMetrics[selectedIndex] && selectedIndex < selectedMetrics.length) {
                this.showFormFields(i, true);
                selectedIndex++;
            }
            else {
                this.showFormFields(i, false);
            }
        }
			
	},
	
	
	/**
	 * Set the head columns of the 'bldgMetricsBldgsStatistics_form' panel
	 */
	setHeadFields:function(){
		
		this.bldgMetricsBldgsStatistics_form.setFieldValue("total" , getMessage("total"));
		this.bldgMetricsBldgsStatistics_form.setFieldValue("average" , getMessage("average"));
		this.bldgMetricsBldgsStatistics_form.setFieldValue("maximum" , getMessage("maximum"));
		this.bldgMetricsBldgsStatistics_form.setFieldValue("minimum" , getMessage("minimum"));
	},
	
	
    /**
     * show/hide statistics fields of "bldgMetricsBldgsStatistics_form" panel for correspondents , checked/unchecked, metrics fields
     * 
     * @param {Object} index
     * @param {Object} showField
     */
	showFormFields: function(index, showField){
        
		var formPanel = this.bldgMetricsBldgsStatistics_form;
        var fieldsArray = View.controllers.get('abBldgMetricsBldgs_ctrl').fieldsArray;
		
        formPanel.showField(fieldsArray[index] + "_sum", showField);
        formPanel.showField(fieldsArray[index] + "_avg", showField);
        formPanel.showField(fieldsArray[index] + "_max", showField);
        formPanel.showField(fieldsArray[index] + "_min", showField);
    },
	
	/**
     * Event handler for 'selectMetricField' action
     */
	bldgMetricsBldgsStatistics_form_onSelectMetricFields: function(){

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
 * set head fields after bldgMetricsBldgsStatistics_form is refreshed
 */
function bldgMetricsBldgsStatistics_form_afterRefresh(){
	
	bldgStatisticsController.setHeadFields();
}
