View.createController('abBldgMetricsOrgsBuildings', {
	
	/**
     * Event handler for 'selectMetricField' action
     */
	abBldgMetricsOrgsBuildings_grid_onSelectMetricFields: function(){
		
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

