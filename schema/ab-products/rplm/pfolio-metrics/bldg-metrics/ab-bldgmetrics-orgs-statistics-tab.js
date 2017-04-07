var abBldgMetricsOrgsStatistics_ctrl = View.createController('abBldgMetricsOrgsStatistics_ctrl', {
  
  	
    afterInitialDataFetch:function(){
		
        //set head fields 
        this.setHeadFields();
        
        
		//show only the default selected metrics fields
        
        var selectedIndex = 0;
        var selectedMetrics = View.controllers.get('abBldgMetricsOrgs_ctrl').selectedMetrics;
        for (i = 0; i < View.controllers.get('abBldgMetricsOrgs_ctrl').fieldsArray.length; i++) {
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
	 * Set the head columns of the 'bldgMetricsOrgsStatistics_form' panel
	 */
	setHeadFields:function(){
		
		this.bldgMetricsOrgsStatistics_form.setFieldValue("total" , getMessage("total"));
		this.bldgMetricsOrgsStatistics_form.setFieldValue("average" , getMessage("average"));
		this.bldgMetricsOrgsStatistics_form.setFieldValue("maximum" , getMessage("maximum"));
		this.bldgMetricsOrgsStatistics_form.setFieldValue("minimum" , getMessage("minimum"));
	},
	
	
    /**
     * show/hide statistics fields of "bldgMetricsOrgsStatistics_form" panel for correspondents , checked/unchecked, metrics fields
     * 
     * @param {Object} index
     * @param {Object} showField
     */
	showFormFields: function(index, showField){
        
		var formPanel = this.bldgMetricsOrgsStatistics_form;
        var fieldsArray = View.controllers.get('abBldgMetricsOrgs_ctrl').fieldsArray;
		
        formPanel.showField(fieldsArray[index] + "_sum", showField);
        formPanel.showField(fieldsArray[index] + "_avg", showField);
        formPanel.showField(fieldsArray[index] + "_max", showField);
        formPanel.showField(fieldsArray[index] + "_min", showField);
    },
	
	/**
     * Event handler for 'selectMetricField' action
     */
	bldgMetricsOrgsStatistics_form_onSelectMetricFields: function(){

		View.openDialog('ab-bldgmetrics-orgs-select-metrics.axvw',null, true, {
			width:400,
			height:600, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abBldgMetricsOrgsSelectMetrics_ctrl');
					var dataSource = dialogController.dsBldgMetricsSelectMetrics_orgsAllMetrics;
					
					// Define which 'metrics' will be returned by DataSource 
                    dataSource.addParameter("area_alloc", getMessage("area_alloc"));
                    dataSource.addParameter("area_chargable", getMessage("area_chargable"));
                    dataSource.addParameter("area_comn_nocup", getMessage("area_comn_nocup"));
                    dataSource.addParameter("area_comn_ocup", getMessage("area_comn_ocup"));
                    dataSource.addParameter("area", getMessage("area"));
                    dataSource.addParameter("area_comn_rm", getMessage("area_comn_rm"));
                    dataSource.addParameter("area_manual", getMessage("area_manual"));
                    dataSource.addParameter("area_comn_serv", getMessage("area_comn_serv"));
                    dataSource.addParameter("area_comn", getMessage("area_comn"));
                    dataSource.addParameter("area_unalloc", getMessage("area_unalloc"));
                    dataSource.addParameter("chargeable_cost", getMessage("chargeable_cost"));
                    dataSource.addParameter("em_headcount", getMessage("employee_headcount"));
                    dataSource.addParameter("cost_per_area", getMessage("cost_per_area"));
                    dataSource.addParameter("area_per_em", getMessage("area_per_em"));
                    dataSource.addParameter("fci", getMessage("fci"));
					
					dialogController.dataSource = dataSource;
				}
		});
		
	 }
    
    
})



/**
 * set head fields after bldgMetricsOrgsStatistics_form is refreshed
 */
function bldgMetricsOrgsStatistics_form_afterRefresh(){
	
	abBldgMetricsOrgsStatistics_ctrl.setHeadFields();
}
