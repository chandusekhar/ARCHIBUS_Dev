var abGbFpDataS1CoAirMethodController = View.createController('abGbFpDataS1CoAirMethodCtrl', {
	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	afterInitialDataFetch: function(){
		this.setFormFields();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS1CoAirMethod_formSource_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS1CoAirMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_co_airc.vf_kg_CO2").style.fontWeight = "bold";
		this.abGbFpDataS1CoAirMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_co_airc.vf_mt_CO2").style.fontWeight = "bold";
	},
	
	/**
	 * Call calculateScope1CompanyOwnedAircraft WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS1CoAirMethod_formSource_cons.getFieldValue("gb_fp_s1_co_airc.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1CoAirMethod_formSource_cons.getFieldValue("gb_fp_s1_co_airc.calc_year"));
		var scenario_id = this.abGbFpDataS1CoAirMethod_formSource_cons.getFieldValue("gb_fp_s1_co_airc.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1CoAirMethod_formSource_cons.getFieldValue("gb_fp_s1_co_airc.source_id"));
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1CompanyOwnedAircraft", bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS1CoAirMethod_formSource_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope1CompanyOwnedAircraft WFR
	 */
	setFieldsValues: function(data){
		var fields = ["heat_content", "avg_fuel_consumed", "fuel_density", "carbon_fact", "c_CO2"];
		
		for (var i = 0; i < fields.length; i++) {
			setVirtualFieldValue(data, this.abGbFpDataS1CoAirMethod_formSource_calc, "gb_fp_s1_co_airc.vf_" + fields[i], fields[i]);
		}
		setVirtualFieldValue(data, this.abGbFpDataS1CoAirMethod_formSource_tot, "gb_fp_s1_co_airc.vf_kg_CO2", "kg_CO2");

		// Emissions (MTCO2)
		setVirtualFieldValue(data, this.abGbFpDataS1CoAirMethod_formSource_tot, "gb_fp_s1_co_airc.vf_mt_CO2", "kg_CO2", true);
	}
});

