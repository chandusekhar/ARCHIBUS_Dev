var abGbFpDataS1RefrigMethodController = View.createController('abGbFpDataS1RefrigMethodCtrl', {
	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	afterInitialDataFetch: function(){
		this.setFormFields();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS1RefrigMethod_formSource_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS1RefrigMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_refrig_ac.vf_kg_CO2").style.fontWeight = "bold";
		this.abGbFpDataS1RefrigMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_refrig_ac.vf_mt_CO2").style.fontWeight = "bold";
	},
	
	/**
	 * Call calculateScope1RefrigerantAC WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS1RefrigMethod_formSource_cons.getFieldValue("gb_fp_s1_refrig_ac.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1RefrigMethod_formSource_cons.getFieldValue("gb_fp_s1_refrig_ac.calc_year"));
		var scenario_id = this.abGbFpDataS1RefrigMethod_formSource_cons.getFieldValue("gb_fp_s1_refrig_ac.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1RefrigMethod_formSource_cons.getFieldValue("gb_fp_s1_refrig_ac.source_id"));
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1RefrigerantAC", bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS1RefrigMethod_formSource_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope1RefrigerantAC WFR
	 */
	setFieldsValues: function(data){
		var fields = ["gwp_refrig", "refrig_charge", "annual_leak_rate"];
		
		for (var i = 0; i < fields.length; i++) {
			setVirtualFieldValue(data, this.abGbFpDataS1RefrigMethod_formSource_calc, "gb_fp_s1_refrig_ac.vf_" + fields[i], fields[i]);
		}
		setVirtualFieldValue(data, this.abGbFpDataS1RefrigMethod_formSource_tot, "gb_fp_s1_refrig_ac.vf_kg_CO2", "kg_CO2");

		// Emissions (MTCO2)
		setVirtualFieldValue(data, this.abGbFpDataS1RefrigMethod_formSource_tot, "gb_fp_s1_refrig_ac.vf_mt_CO2", "kg_CO2", true);
	}
});

