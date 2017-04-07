var abGbFpDataS3WastesSolMethod_ctrl = View.createController('abGbFpDataS3WastesSolMethod_ctrl', {

	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS3WastesSolMethod_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
	},
    
    afterInitialDataFetch: function(){
        this.setFormFields();        
    },
    
    /**
	 * Call calculateScope3WasteSolid WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS3WastesSolMethod_cons.getFieldValue("gb_fp_s3_waste_sol.bl_id");
		var calc_year = parseInt(this.abGbFpDataS3WastesSolMethod_cons.getFieldValue("gb_fp_s3_waste_sol.calc_year"));
		var scenario_id = this.abGbFpDataS3WastesSolMethod_cons.getFieldValue("gb_fp_s3_waste_sol.scenario_id");
		var source_id = parseInt(this.abGbFpDataS3WastesSolMethod_cons.getFieldValue("gb_fp_s3_waste_sol.source_id"));
        
	    try {
	    	var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3WasteSolid", bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS3WastesSolMethod_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope3WasteSolid WFR
	 */
	setFieldsValues: function(data){
		this.abGbFpDataS3WastesSolMethod_cons.setFieldValue("amount_recycle_units", this.abGbFpDataS3WastesSolMethod_cons.getFieldValue("gb_fp_s3_waste_sol.units"));
		
		setVirtualFieldValue(data, this.abGbFpDataS3WastesSolMethod_calc, 'gb_fp_s3_waste_sol.amount_disp_tons', 'amount_disp_tons');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesSolMethod_calc, 'gb_fp_s3_waste_sol.disp_emiss_fact', 'disp_emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesSolMethod_calc, 'gb_fp_s3_waste_sol.amount_recy_tons', 'amount_recy_tons');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesSolMethod_calc, 'gb_fp_s3_waste_sol.recy_emiss_fact', 'recy_emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesSolMethod_calc, 'gb_fp_s3_waste_sol.emiss_mtce', 'emiss_mtce');
		setVirtualFieldValue(data, this.abGbFpDataS3WastesSolMethod_calc, 'gb_fp_s3_waste_sol.c_CO2', 'c_CO2');
	}
    
    
});
