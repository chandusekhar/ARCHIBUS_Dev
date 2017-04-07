var abGbFpDataS1S3MobileMethodController = View.createController('abGbFpDataS1S3MobileMethodCtrl', {
	afterViewLoad: function(){
		this.setFieldsStyle();
	},
	
	afterInitialDataFetch: function(){
		this.setTitles();
		this.setFormFields();
	},
	
	setFieldsStyle: function(){
		this.abGbFpDataS1S3MobileMethod_formSource_calc.getFieldLabelElement("field_CO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS1S3MobileMethod_formSource_calc.getFieldLabelElement("field_NonCO2Emissions").style.fontWeight = "bold";
		this.abGbFpDataS1S3MobileMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_s3_mobile.vf_kg_CO2").style.fontWeight = "bold";
		this.abGbFpDataS1S3MobileMethod_formSource_tot.getFieldLabelElement("gb_fp_s1_s3_mobile.vf_mt_CO2").style.fontWeight = "bold";

		for (var i = 1; i <= 2; i++) {
			var fld = document.getElementById("ShowabGbFpDataS1S3MobileMethod_formSource_tot_field_empty_" + i);
			fld.style.borderTopStyle = "solid";
			fld.style.borderTopWidth = "thin";
		}
	},
	
	setTitles: function(){
		switch (this.abGbFpDataS1S3MobileMethod_formSource_cons.getFieldValue("gb_fp_s1_s3_mobile.scope_cat")) {
			case "S1_COMPANY_ROAD":
				this.view.setTitle(getMessage("titleCompanyRoad"));
				break;
	
			case "S3_EMPLOYEE_ROAD":
				this.view.setTitle(getMessage("titleEmployeeRoad"));
				break;
	
			case "S3_EMPLOYEE_RAIL":
				this.view.setTitle(getMessage("titleEmployeeRail"));
				break;
	
			case "S3_CONTRACTOR_ROAD":
				this.view.setTitle(getMessage("titleContractorRoad"));
				break;
	
			default:
				break;
		}
	},
	
	/**
	 * Call calculateScope1Scope3Mobile WFR to get fields' values 
	 */
	setFormFields: function(){
		var bl_id = this.abGbFpDataS1S3MobileMethod_formSource_cons.getFieldValue("gb_fp_s1_s3_mobile.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1S3MobileMethod_formSource_cons.getFieldValue("gb_fp_s1_s3_mobile.calc_year"));
		var scenario_id = this.abGbFpDataS1S3MobileMethod_formSource_cons.getFieldValue("gb_fp_s1_s3_mobile.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1S3MobileMethod_formSource_cons.getFieldValue("gb_fp_s1_s3_mobile.source_id"));
		var scope_cat = this.abGbFpDataS1S3MobileMethod_formSource_cons.getFieldValue("gb_fp_s1_s3_mobile.scope_cat");
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1Scope3Mobile", bl_id, calc_year, scenario_id, source_id, scope_cat);
			if(valueExistsNotEmpty(result.data['message'])){
				showInformationInForm(this.abGbFpDataS1S3MobileMethod_formSource_cons, result.data['message']);
			}
			this.setFieldsValues(result.data);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	    }
	},
	
	/**
	 * Set values in fields, using the returned values from calculateScope1Scope3Mobile WFR
	 */
	setFieldsValues: function(data){
		var fields = ["emiss_fact", "emiss_kgCO2",
		              "CH4_emiss_fact", "CH4_gwp_fact", "CH4_emiss_kgCO2",
		              "N2O_emiss_fact", "N2O_gwp_fact", "N2O_emiss_kgCO2"];
		
		for (var i = 0; i < fields.length; i++) {
			setVirtualFieldValue(data, this.abGbFpDataS1S3MobileMethod_formSource_calc, "gb_fp_s1_s3_mobile.vf_" + fields[i], fields[i]);
		}
		setVirtualFieldValue(data, this.abGbFpDataS1S3MobileMethod_formSource_tot, "gb_fp_s1_s3_mobile.vf_kg_CO2", "kg_CO2");
		
		// Emissions (MTCO2 Eq.) CH4
		setVirtualFieldValue(data, this.abGbFpDataS1S3MobileMethod_formSource_calc, "gb_fp_s1_s3_mobile.vf_CH4_emiss_mtCO2", "CH4_emiss_kgCO2", true);
		
		//Emissions (MTCO2 Eq.) N2O
		setVirtualFieldValue(data, this.abGbFpDataS1S3MobileMethod_formSource_calc, "gb_fp_s1_s3_mobile.vf_N2O_emiss_mtCO2", "N2O_emiss_kgCO2", true);

		// Emissions (MTCO2)
		setVirtualFieldValue(data, this.abGbFpDataS1S3MobileMethod_formSource_calc, "gb_fp_s1_s3_mobile.vf_emiss_mtCO2", "emiss_kgCO2", true);

		// Total Emissions (MTCO2)
		setVirtualFieldValue(data, this.abGbFpDataS1S3MobileMethod_formSource_tot, "gb_fp_s1_s3_mobile.vf_mt_CO2", "kg_CO2", true);
	}
});

