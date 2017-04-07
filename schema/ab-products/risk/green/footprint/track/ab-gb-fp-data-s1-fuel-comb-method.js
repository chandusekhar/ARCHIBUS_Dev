var abGbFpDataS1FuelCombMethodController = View.createController('abGbFpDataS1FuelCombMethodCtrl', {
	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	afterInitialDataFetch: function(){
		this.setFormFields();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS1FuelCombMethod_formSource_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS1FuelCombMethod_formSource_calc.getFieldLabelElement("field_NonCO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS1FuelCombMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_fuel_comb.vf_kg_CO2").style.fontWeight = "bold";
		this.abGbFpDataS1FuelCombMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_fuel_comb.vf_mt_CO2").style.fontWeight = "bold";

		for (var i = 0; i <= 1; i++) {
			var fld = document.getElementById("ShowabGbFpDataS1FuelCombMethod_formSource_tot_field_empty_" + i);
			fld.style.borderTopStyle = "solid";
			fld.style.borderTopWidth = "thin";
		}
	},
	
	/**
	 * Call calculateScope1FuelCombustion WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS1FuelCombMethod_formSource_cons.getFieldValue("gb_fp_s1_fuel_comb.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1FuelCombMethod_formSource_cons.getFieldValue("gb_fp_s1_fuel_comb.calc_year"));
		var scenario_id = this.abGbFpDataS1FuelCombMethod_formSource_cons.getFieldValue("gb_fp_s1_fuel_comb.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1FuelCombMethod_formSource_cons.getFieldValue("gb_fp_s1_fuel_comb.source_id"));
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1FuelCombustion", bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS1FuelCombMethod_formSource_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope1FuelCombustion WFR
	 */
	setFieldsValues: function(data){
		var fields = ["fuel_density", "fuel_consumed_kg", "heat_val"];
		for (var i = 0; i < fields.length; i++) {
			for (var j = 1; j <= 3; j++){
				setVirtualFieldValue(data, this.abGbFpDataS1FuelCombMethod_formSource_calc, "gb_fp_s1_fuel_comb.vf_" + fields[i] + j, fields[i]);
			}
		}
		
		fields = ["carbon_fact", "oxid_fact", "ratio_mol_wght", "emiss_kgCO2",
		              "CH4_emiss_fact", "CH4_emiss_kg", "CH4_gwp_fact", "CH4_emiss_kgCO2",
		              "N2O_emiss_fact", "N2O_emiss_kg", "N2O_gwp_fact", "N2O_emiss_kgCO2"];
		
		for (var i = 0; i < fields.length; i++) {
			setVirtualFieldValue(data, this.abGbFpDataS1FuelCombMethod_formSource_calc, "gb_fp_s1_fuel_comb.vf_" + fields[i], fields[i]);
		}setVirtualFieldValue(data, this.abGbFpDataS1FuelCombMethod_formSource_tot, "gb_fp_s1_fuel_comb.vf_kg_CO2", "kg_CO2");

		// Emissions (MTCO2)
		setVirtualFieldValue(data, this.abGbFpDataS1FuelCombMethod_formSource_calc, "gb_fp_s1_fuel_comb.vf_emiss_mtCO2", "emiss_kgCO2", true);
		setVirtualFieldValue(data, this.abGbFpDataS1FuelCombMethod_formSource_calc, "gb_fp_s1_fuel_comb.vf_CH4_emiss_mtCO2", "CH4_emiss_kgCO2", true);
		setVirtualFieldValue(data, this.abGbFpDataS1FuelCombMethod_formSource_calc, "gb_fp_s1_fuel_comb.vf_N2O_emiss_mtCO2", "N2O_emiss_kgCO2", true);

		// Total Emissions (MTCO2)
		setVirtualFieldValue(data, this.abGbFpDataS1FuelCombMethod_formSource_tot, "gb_fp_s1_fuel_comb.vf_mt_CO2", "kg_CO2", true);
	}
});

