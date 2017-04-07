var abGbFpDataS3OffSiteSrvMethod_ctrl = View.createController('abGbFpDataS3OffSiteSrvMethod_ctrl', {
	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS3OffSiteSrvMethod_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS3OffSiteSrvMethod_calc.getFieldLabelElement("field_NonCO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS3OffSiteSrvMethod_tot.getFieldLabelElement("gb_fp_s3_serv.kg_co2").style.fontWeight = "bold";
		this.abGbFpDataS3OffSiteSrvMethod_tot.getFieldLabelElement("gb_fp_s3_serv.emissions").style.fontWeight = "bold";
	
		for (var i = 1; i <= 2; i++) {
			var fld = document.getElementById("ShowabGbFpDataS3OffSiteSrvMethod_tot_field_empty_" + i);
			fld.style.borderTopStyle = "solid";
			fld.style.borderTopWidth = "thin";
		}
	},
	
	afterInitialDataFetch: function(){
		this.setFormFields();
    },

    /**
	 * Call calculateScope3OffSiteServers WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS3OffSiteSrvMethod_cons.getFieldValue("gb_fp_s3_serv.bl_id");
		var calc_year = parseInt(this.abGbFpDataS3OffSiteSrvMethod_cons.getFieldValue("gb_fp_s3_serv.calc_year"));
		var scenario_id = this.abGbFpDataS3OffSiteSrvMethod_cons.getFieldValue("gb_fp_s3_serv.scenario_id");
		var source_id = parseInt(this.abGbFpDataS3OffSiteSrvMethod_cons.getFieldValue("gb_fp_s3_serv.source_id"));
		
	    try {
	    	var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3OffSiteServers",bl_id, calc_year, scenario_id, source_id);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS3OffSiteSrvMethod_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope3OffSiteServers WFR
	 */
	setFieldsValues: function(data){
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.emiss_fact', 'emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.emiss_kgCO2', 'emiss_kgCO2');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.CH4_emiss_fact', 'CH4_emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.CH4_emiss_kg', 'CH4_emiss_kg');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.CH4_gwp_fact', 'CH4_gwp_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.CH4_emiss_kgCO2', 'CH4_emiss_kgCO2');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.N2O_emiss_fact', 'N2O_emiss_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.N2O_emiss_kg', 'N2O_emiss_kg');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.N2O_gwp_fact', 'N2O_gwp_fact');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.N2O_emiss_kgCO2', 'N2O_emiss_kgCO2');
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.emiss_kgCO2_1000', 'emiss_kgCO2', true);
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.CH4_emiss_kgCO2_1000', 'CH4_emiss_kgCO2', true);
		setVirtualFieldValue(data, this.abGbFpDataS3OffSiteSrvMethod_calc, 'gb_fp_s3_serv.N2O_emiss_kgCO2_1000', 'N2O_emiss_kgCO2', true);
	}
});