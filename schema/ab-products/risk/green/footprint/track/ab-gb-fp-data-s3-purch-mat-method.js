var abGbFpDataS3PurchMatMethod_ctrl = View.createController('abGbFpDataS3PurchMatMethod_ctrl', {

	afterViewLoad:function(){
		this.setFieldsStyle();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS3PurchMatMethod_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
	},
    
	afterInitialDataFetch: function(){
		this.setFormFields();
    },

    /**
	 * Call calculateScope3PurchasedMaterials WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS3PurchMatMethod_cons.getFieldValue("gb_fp_s3_mat.bl_id");
		var calc_year = parseInt(this.abGbFpDataS3PurchMatMethod_cons.getFieldValue("gb_fp_s3_mat.calc_year"));
		var scenario_id = this.abGbFpDataS3PurchMatMethod_cons.getFieldValue("gb_fp_s3_mat.scenario_id");
		var source_id = parseInt(this.abGbFpDataS3PurchMatMethod_cons.getFieldValue("gb_fp_s3_mat.source_id"));
		
	    try {
	    	var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3PurchasedMaterials",bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS3PurchMatMethod_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope3PurchasedMaterials WFR
	 */
	setFieldsValues: function(data){
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.virgin_amount_purch', 'virgin_amount_purch');
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.raw_mat_acquis', 'raw_mat_acquis');
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.recy_amount_purch', 'recy_amount_purch', false, 'recy_amount_purch_one');
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.recy_amount_purch', 'recy_amount_purch', false, 'recy_amount_purch_two');
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.product_manuf', 'product_manuf');
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.forest_carbon', 'forest_carbon');
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.emiss_mtce', 'emiss_mtce');
		setVirtualFieldValue(data, this.abGbFpDataS3PurchMatMethod_calc, 'gb_fp_s3_mat.c_CO2', 'c_CO2');
	}
});