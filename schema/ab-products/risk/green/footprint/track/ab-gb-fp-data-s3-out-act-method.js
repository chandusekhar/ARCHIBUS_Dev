var abGbFpDataS3OutActMethod_ctrl = View.createController('abGbFpDataS3OutActMethod_ctrl', {

	afterViewLoad:function(){
		this.setFieldsStyle();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS3OutActMethod_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
	},

	afterInitialDataFetch: function(){
		this.setFormFields();
    },

    /**
	 * Call calculateScope3Outsourced WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS3OutActMethod_cons.getFieldValue("gb_fp_s3_outs.bl_id");
		var calc_year = parseInt(this.abGbFpDataS3OutActMethod_cons.getFieldValue("gb_fp_s3_outs.calc_year"));
		var scenario_id = this.abGbFpDataS3OutActMethod_cons.getFieldValue("gb_fp_s3_outs.scenario_id");
		var source_id = parseInt(this.abGbFpDataS3OutActMethod_cons.getFieldValue("gb_fp_s3_outs.source_id"));
		
	    try {
	    	var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3Outsourced",bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS3OutActMethod_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope3Outsourced WFR
	 */
	setFieldsValues: function(data){
		setVirtualFieldValue(data, this.abGbFpDataS3OutActMethod_calc, 'gb_fp_s3_outs.kWh_copy', 'kWh_copy');
		setVirtualFieldValue(data, this.abGbFpDataS3OutActMethod_calc, 'gb_fp_s3_outs.energy_consumption', 'energy_consumption');
		setVirtualFieldValue(data, this.abGbFpDataS3OutActMethod_calc, 'gb_fp_s3_outs.emiss_fact', 'emiss_fact');
	}
});