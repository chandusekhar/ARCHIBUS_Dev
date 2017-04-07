var abGbFpDataS3EmpTransAirMethod_ctrl = View.createController('abGbFpDataS3EmpTransAirMethod_ctrl', {
	
	afterViewLoad: function(){
		this.setFieldsStyle();
	},

	setFieldsStyle: function(){
		this.abGbFpDataS3EmpTransAirMethod_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS3EmpTransAirMethod_calc.getFieldLabelElement("field_NonCO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS3EmpTransAirMethod_tot.getFieldLabelElement("gb_fp_s3_em_air.kg_co2").style.fontWeight = "bold";
		this.abGbFpDataS3EmpTransAirMethod_tot.getFieldLabelElement("gb_fp_s3_em_air.emissions").style.fontWeight = "bold";

		for (var i = 1; i <= 2; i++) {
			var fld = document.getElementById("ShowabGbFpDataS3EmpTransAirMethod_tot_field_empty_" + i);
			fld.style.borderTopStyle = "solid";
			fld.style.borderTopWidth = "thin";
		}
	},
    
	afterInitialDataFetch: function(){
		this.setFormFields();
    },

    /**
	 * Call calculateScope3EmployeeAircraft WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS3EmpTransAirMethod_cons.getFieldValue("gb_fp_s3_em_air.bl_id");
		var calc_year = parseInt(this.abGbFpDataS3EmpTransAirMethod_cons.getFieldValue("gb_fp_s3_em_air.calc_year"));
		var scenario_id = this.abGbFpDataS3EmpTransAirMethod_cons.getFieldValue("gb_fp_s3_em_air.scenario_id");
		var source_id = parseInt(this.abGbFpDataS3EmpTransAirMethod_cons.getFieldValue("gb_fp_s3_em_air.source_id"));
		
	    try {
	    	var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3EmployeeAircraft",bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS3EmpTransAirMethod_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope3EmployeeAircraft WFR
	 */
	setFieldsValues: function(data){
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.emiss_fact', 'emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.emiss_kgCO2', 'emiss_kgCO2');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.CH4_emiss_fact', 'CH4_emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc,'gb_fp_s3_em_air.CH4_gwp_fact', 'CH4_gwp_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.CH4_emiss_kgCO2', 'CH4_emiss_kgCO2');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.N2O_emiss_fact', 'N2O_emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.N2O_gwp_fact', 'N2O_gwp_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.N2O_emiss_kgCO2', 'N2O_emiss_kgCO2');
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.emiss_kgCO2_1000', 'emiss_kgCO2', true);
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.CH4_emiss_kgCO2_1000', 'CH4_emiss_kgCO2', true);
		setVirtualFieldValue(data, this.abGbFpDataS3EmpTransAirMethod_calc, 'gb_fp_s3_em_air.N2O_emiss_kgCO2_1000', 'N2O_emiss_kgCO2', true);
	}
	
});