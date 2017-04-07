var abGbFpDataS2PurchEController = View.createController('abGbFpDataS2PurchECtrl', {
	tabScope2_ctrl: View.getOpenerView().controllers.get('abGbFpDataS2Ctrl'),
	
	// app parameter Electricity Cost Category in Energy Management
	energy_mgmt_cost_cat: "",
	
	afterViewLoad: function(){
		this.showImportButton();
	},

	afterInitialDataFetch: function(){
	    var units_type = this.abGbFpDataS2PurchE_formSource.getDataSource().fieldDefs.get("gb_fp_s2_purch_e.units_type").defaultValue;
	    customizeUnitField(this.abGbFpDataS2PurchE_formSource, "gb_fp_s2_purch_e.units", units_type);
	},

	abGbFpDataS2PurchE_formSource_afterRefresh: function(){
		this.enableImportButton();
	},
	
	abGbFpDataS2PurchE_gridFootprints_onAddNew: function(){
		this.abGbFpDataS2PurchE_formSource.refresh(this.abGbFpDataS2PurchE_gridFootprints.restriction, true);
	},

	abGbFpDataS2PurchE_formSource_onSaveAndAddNew: function(){
		if(this.abGbFpDataS2PurchE_formSource_onSave())
			this.abGbFpDataS2PurchE_gridFootprints_onAddNew();
	},

	abGbFpDataS2PurchE_formSource_onSave: function(){
		this.abGbFpDataS2PurchE_formSource.fields.get("gb_fp_s2_purch_e.consumption").clear();
		
		if(!this.abGbFpDataS2PurchE_formSource.canSave())
			return false;
		
		// convert the user entered consumptions
		if(!convertUserEntry(this.abGbFpDataS2PurchE_formSource,
    			"gb_fp_s2_purch_e.consumption_entry", "gb_fp_s2_purch_e.consumption",
    			"gb_fp_s2_purch_e.units", "gb_fp_s2_purch_e.units_type"))
			return false;
		
		// save form
		if(!this.abGbFpDataS2PurchE_formSource.save())
			return false;
		
		if(!this.calculateScope2PurchasedElectricity())
			return false;
		
		// refresh grid
		this.abGbFpDataS2PurchE_gridFootprints.refresh();
		
		return true;
	},

	abGbFpDataS2PurchE_formSource_onDelete: function(){
		this.tabScope2_ctrl.dataController.onDeleteSource(this.abGbFpDataS2PurchE_formSource, this.abGbFpDataS2PurchE_gridFootprints);
	},
    
    /**
     * Calls the WFR calculateScope2PurchasedElectricity to calculate the emissions for this source
     */
    calculateScope2PurchasedElectricity: function(){
		var bl_id = this.abGbFpDataS2PurchE_formSource.getFieldValue("gb_fp_s2_purch_e.bl_id");
		var calc_year = parseInt(this.abGbFpDataS2PurchE_formSource.getFieldValue("gb_fp_s2_purch_e.calc_year"));
		var scenario_id = this.abGbFpDataS2PurchE_formSource.getFieldValue("gb_fp_s2_purch_e.scenario_id");
		var source_id = parseInt(this.abGbFpDataS2PurchE_formSource.getFieldValue("gb_fp_s2_purch_e.source_id"));
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope2PurchasedElectricity", bl_id, calc_year, scenario_id, source_id);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    },
    
    /**
     * Shows the Import button if the app parameter "energy_mgmt" = "Yes"
     * and the user has licence for Energy Management activity
     * Else hides the button;
     */
    showImportButton: function(){
    	var importAction = this.abGbFpDataS2PurchE_formSource.actions.get("importElectrAction");
    	var energy_mgmt = getActivityParameter("AbRiskGreenBuilding", "energy_mgmt");
    	
    	importAction.show(false);
    	
    	if(valueExistsNotEmpty(energy_mgmt) && energy_mgmt.toLowerCase() == "yes"){
    		try {
    			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-isActivityLicense", "AbRiskEnergyManagement");
    	    } 
    	    catch (e) {
    	        Workflow.handleError(e);
    	        return;
    	    }
    		
    	    if(result.value) {
        		importAction.show(true);
    	    }
    	}
    },

    /**
     * Enables the button if app parameter energy_mgmt_cost_cat is not empty
     * Else disables the button.
     */
    enableImportButton: function(){
    	var importAction = this.abGbFpDataS2PurchE_formSource.actions.get("importElectrAction");
    	
		this.energy_mgmt_cost_cat = getActivityParameter("AbRiskGreenBuilding", "energy_mgmt_cost_cat");
   		importAction.enable(valueExistsNotEmpty(this.energy_mgmt_cost_cat));
    }
});

/**
 * Gets the sum of electricity consumption in kWh
 * from Approved archived bills
 * for the year of the footprint
 * and cost category defined in energy_mgmt_cost_cat app parameter
 */
function importElectricity(){
	var ds = abGbFpDataS2PurchEController.abGbFpDataS2PurchE_dsImport;
	var form = abGbFpDataS2PurchEController.abGbFpDataS2PurchE_formSource;
	var bl_id = abGbFpDataS2PurchEController.abGbFpDataS2PurchE_formSource.getFieldValue("gb_fp_s2_purch_e.bl_id");
	var calc_year = abGbFpDataS2PurchEController.abGbFpDataS2PurchE_formSource.getFieldValue("gb_fp_s2_purch_e.calc_year");
	
	ds.addParameter("energyMgmtCostCat", abGbFpDataS2PurchEController.energy_mgmt_cost_cat);
	ds.addParameter("blId", bl_id);
	ds.addParameter("calcYear", calc_year);
	
    var records = ds.getRecords();
    if(!valueExistsNotEmpty(records[0].getValue("bill_archive.qty_kwh"))){
    	View.showMessage(getMessage("noRecordsOnImport").replace("{1}", bl_id).replace("{2}", calc_year).replace("{3}", abGbFpDataS2PurchEController.energy_mgmt_cost_cat));
    	return;
    }

    var unitsFieldElement = form.getFieldElement("gb_fp_s2_purch_e.units");

	// KB 3031012 - format numeric values with decimals before calling setFieldValue, depending on the locale
	var ds = form.getDataSource();

	// set the imported value and select the "kWh" option in units field
	var kWhSelected = false;
	for (var i = 0; i < unitsFieldElement.options.length; i++) {
		var option = unitsFieldElement.options[i];
		if(option.value == "kWh"){
			option.selected = true;
			// KB 3031012 - format numeric values with decimals before calling setFieldValue, depending on the locale
			//form.setFieldValue("gb_fp_s2_purch_e.consumption_entry", records[0].getValue("bill_archive.qty_kwh"));
			form.setFieldValue("gb_fp_s2_purch_e.consumption_entry", ds.formatValue("gb_fp_s2_purch_e.consumption_entry", records[0].getValue("bill_archive.qty_kwh"), true));
			kWhSelected = true;
			break;
		}
	}
	
	// if "kWh" not found in units list, convert the imported value in user-selected units
	if(!kWhSelected && unitsFieldElement.options.length) {
		var isDivision = true;
		// KB 3031012 - format numeric values with decimals before calling setFieldValue, depending on the locale
		//form.setFieldValue("gb_fp_s2_purch_e.consumption_entry", records[0].getValue("bill_archive.qty_kwh"));
		form.setFieldValue("gb_fp_s2_purch_e.consumption_entry", ds.formatValue("gb_fp_s2_purch_e.consumption_entry", records[0].getValue("bill_archive.qty_kwh"), true));
		convertUserEntry(form,
    			"gb_fp_s2_purch_e.consumption_entry", "gb_fp_s2_purch_e.consumption_entry",
    			"gb_fp_s2_purch_e.units", "gb_fp_s2_purch_e.units_type", isDivision);
	}
}
