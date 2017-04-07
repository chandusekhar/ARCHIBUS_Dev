var abEqEqByCsiStatTabCtrl = View.createController('abEqEqByCsiStatTabCtrl', {
	selectedMetrics: null,
	fieldsArray: null,
	
	afterViewLoad: function(){
        //Initialize the 'selectedMetrics' which will be used by Statistics tab
        this.selectedMetrics = new Array();
        this.selectedMetrics.push(0);
        this.selectedMetrics.push(1);
        this.selectedMetrics.push(2);
        this.selectedMetrics.push(3);
        this.selectedMetrics.push(4);
        this.selectedMetrics.push(5);
        this.selectedMetrics.push(6);
        this.selectedMetrics.push(7);
        this.selectedMetrics.push(8);
        this.selectedMetrics.push(9);
        this.selectedMetrics.push(10);
        this.selectedMetrics.push(11);
        this.selectedMetrics.push(12);
        this.selectedMetrics.push(13);
        this.selectedMetrics.push(14);
        this.selectedMetrics.push(15);
        this.selectedMetrics.push(16);
        
        //Initialize the 'fieldsArray' which will be used by Statistics tab
        this.fieldsArray = new Array();
        this.fieldsArray.push('eq.vf_count');
        this.fieldsArray.push('eq.vf_owned');
        this.fieldsArray.push('eq.vf_leased');
        this.fieldsArray.push('eq.vf_cost_replace');
        this.fieldsArray.push('eq.vf_cost_dep_value');
        this.fieldsArray.push('eq.vf_cost_purchase');
        this.fieldsArray.push('eq.vf_cost_life_expct');
        this.fieldsArray.push('eq.vf_cond_new');
        this.fieldsArray.push('eq.vf_cond_good');
        this.fieldsArray.push('eq.vf_cond_fair');
        this.fieldsArray.push('eq.vf_cond_poor');
        this.fieldsArray.push('eq.vf_status_in');
        this.fieldsArray.push('eq.vf_status_out');
        this.fieldsArray.push('eq.vf_status_rep');
        this.fieldsArray.push('eq.vf_status_stor');
        this.fieldsArray.push('eq.vf_status_salv');
        this.fieldsArray.push('eq.vf_status_sold');
	},

	afterInitialDataFetch: function(){
		
        //set head fields 
        this.setHeadFields();
        
        
		//show only the default selected metrics fields
        var selectedIndex = 0;
        var selectedMetrics = this.selectedMetrics; //View.controllers.get('abEqEqByCsiGeoCtrl').selectedMetrics;
        var fieldsArray = this.fieldsArray; // View.controllers.get('abEqEqByCsiGeoCtrl').fieldsArray;
        for (i = 0; i < fieldsArray.length; i++) {
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
	 * Set the head columns of the 'abEqEqByCsiStatTab_form' panel
	 */
	setHeadFields: function(){
		
		this.abEqEqByCsiStatTab_form.setFieldValue("total" , getMessage("total"));
		this.abEqEqByCsiStatTab_form.setFieldValue("conditionCount" , getMessage("conditionCount"));
		this.abEqEqByCsiStatTab_form.setFieldValue("statusCount" , getMessage("statusCount"));
	},
	
	/**
     * show/hide statistics fields of "abEqEqByCsiStatTab_form" panel for correspondents , checked/unchecked, metrics fields
     * 
     * @param {Object} index
     * @param {Object} showField
     */
	showFormFields: function(index, showField){
        
		var formPanel = this.abEqEqByCsiStatTab_form;
        var fieldsArray = this.fieldsArray; // View.controllers.get('abEqEqByCsiGeoCtrl').fieldsArray;
		
        formPanel.showField(fieldsArray[index], showField);
    },
	
	/**
     * Event handler for 'selectMetricField' action
     */
	abEqEqByCsiStatTab_form_onSelectMetricFields: function(){

		View.openDialog('ab-eq-eq-by-csi-select-metrics.axvw',null, true, {
			width:400,
			height:600, 
			closeButton:false,
				afterViewLoad:function(dialogView){
					
					var dialogController = dialogView.controllers.get('abEqEqByCsiSelectMetricsCtrl');
					var dataSource = dialogController.abEqEqByCsiSelectMetrics_ds;
					
					// Define which 'metrics' will be returned by DataSource 
                    dataSource.addParameter("vf_count", getMessage("vf_count"));
                    dataSource.addParameter("vf_owned", getMessage("vf_owned"));
                    dataSource.addParameter("vf_leased", getMessage("vf_leased"));
                    dataSource.addParameter("vf_cost_replace", getMessage("vf_cost_replace"));
                    dataSource.addParameter("vf_cost_dep_value", getMessage("vf_cost_dep_value"));
                    dataSource.addParameter("vf_cost_purchase", getMessage("vf_cost_purchase"));
                    dataSource.addParameter("vf_cost_life_expct", getMessage("vf_cost_life_expct"));
                    dataSource.addParameter("vf_cond_new", getMessage("vf_cond_new"));
                    dataSource.addParameter("vf_cond_good", getMessage("vf_cond_good"));
                    dataSource.addParameter("vf_cond_fair", getMessage("vf_cond_fair"));
                    dataSource.addParameter("vf_cond_poor", getMessage("vf_cond_poor"));
                    dataSource.addParameter("vf_status_in", getMessage("vf_status_in"));
                    dataSource.addParameter("vf_status_out", getMessage("vf_status_out"));
                    dataSource.addParameter("vf_status_rep", getMessage("vf_status_rep"));
                    dataSource.addParameter("vf_status_stor", getMessage("vf_status_stor"));
                    dataSource.addParameter("vf_status_salv", getMessage("vf_status_salv"));
                    dataSource.addParameter("vf_status_sold", getMessage("vf_status_sold"));
					
					dialogController.dataSource = dataSource;
				}
		});
		
	 }

});

/**
 * set head fields after bldgMetricsBldgsStatistics_form is refreshed
 */
function abEqEqByCsiStatTab_form_afterRefresh(){
	
	abEqEqByCsiStatTabCtrl.setHeadFields();
}

