var abGbFpDataS3WastesLiqMethod_ctrl = View.createController('abGbFpDataS3WastesLiqMethod_ctrl', {
    
	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS3WastesLiqMethod_calc.getFieldLabelElement("field_CH4Emissions").style.fontWeight = "bold";
	},

	afterInitialDataFetch: function(){
		this.setFormFields();
    },

    /**
	 * Call calculateScope3WasteLiquid WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS3WastesLiqMethod_cons.getFieldValue("gb_fp_s3_waste_liq.bl_id");
		var calc_year = parseInt(this.abGbFpDataS3WastesLiqMethod_cons.getFieldValue("gb_fp_s3_waste_liq.calc_year"));
		var scenario_id = this.abGbFpDataS3WastesLiqMethod_cons.getFieldValue("gb_fp_s3_waste_liq.scenario_id");
		var source_id = parseInt(this.abGbFpDataS3WastesLiqMethod_cons.getFieldValue("gb_fp_s3_waste_liq.source_id"));
        
	    try {
	    	var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3WasteLiquid",bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS3WastesLiqMethod_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope3WasteLiquid WFR
	 */
	setFieldsValues: function(data){
		setVirtualFieldValue(data, this.abGbFpDataS3WastesLiqMethod_calc, 'gb_fp_s3_waste_liq.percent_treat_anaerob', 'percent_treat_anaerob');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesLiqMethod_calc, 'gb_fp_s3_waste_liq.mgBOD5_gal_wastewater', 'mgBOD5_gal_wastewater');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesLiqMethod_calc, 'gb_fp_s3_waste_liq.mgCH4_mgBOD5', 'mgCH4_mgBOD5');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesLiqMethod_calc, 'gb_fp_s3_waste_liq.conv1', 'conv1');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesLiqMethod_calc, 'gb_fp_s3_waste_liq.conv2', 'conv2');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesLiqMethod_calc, 'gb_fp_s3_waste_liq.CH4_gwp_fact', 'CH4_gwp_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesLiqMethod_calc, 'gb_fp_s3_waste_liq.c_CO2', 'c_CO2');
	}
	
});