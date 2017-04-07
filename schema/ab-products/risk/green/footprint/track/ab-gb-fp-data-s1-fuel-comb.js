var abGbFpDataS1FuelCombController = View.createController('abGbFpDataS1FuelCombCtrl', {
	tabScope1_ctrl: View.getOpenerView().controllers.get('abGbFpDataS1Ctrl'),

	afterInitialDataFetch: function(){
	    var units_type = this.abGbFpDataS1FuelComb_formSource.getDataSource().fieldDefs.get("gb_fp_s1_fuel_comb.ch4_n2o_units_type").defaultValue;
	    customizeUnitField(this.abGbFpDataS1FuelComb_formSource, "gb_fp_s1_fuel_comb.ch4_n2o_units", units_type);
	    
	    units_type = this.abGbFpDataS1FuelComb_formSource.getDataSource().fieldDefs.get("gb_fp_s1_fuel_comb.fuel_units_type").defaultValue;
	    customizeUnitField(this.abGbFpDataS1FuelComb_formSource, "gb_fp_s1_fuel_comb.fuel_units", units_type);
	},

	abGbFpDataS1FuelComb_gridFootprints_onAddNew: function(){
		this.abGbFpDataS1FuelComb_formSource.refresh(this.abGbFpDataS1FuelComb_gridFootprints.restriction, true);
	},
	
	validateFields: function(){
		var ch4_entry = this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.emiss_factor_ch4_entry");
		var n2o_entry = this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.emiss_factor_n2o_entry");
		
		if((valueExistsNotEmpty(ch4_entry) && !valueExistsNotEmpty(n2o_entry))
				|| (!valueExistsNotEmpty(ch4_entry) && valueExistsNotEmpty(n2o_entry))){
			View.showMessage(getMessage("bothEnteredOrNull"));
			return false;
		}

		if(!this.validateExistence('gb_fp_sectors'))
			return false;

		if(!valueExistsNotEmpty("gb_fp_s1_fuel_comb.technology")){
			clearFuelTechnology(true);
		}
		
		this.abGbFpDataS1FuelComb_formSource.fields.get("gb_fp_s1_fuel_comb.emiss_factor_ch4_val").clear();
		this.abGbFpDataS1FuelComb_formSource.fields.get("gb_fp_s1_fuel_comb.emiss_factor_n2o_val").clear();
		this.abGbFpDataS1FuelComb_formSource.fields.get("gb_fp_s1_fuel_comb.fuel_consumed").clear();
		
		return true;
	},
	
	abGbFpDataS1FuelComb_formSource_onSave: function(){
		if(!this.validateFields())
			return false;

		if(!this.abGbFpDataS1FuelComb_formSource.canSave())
			return false;

		// convert the user entered consumptions
		if(valueExistsNotEmpty(this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.emiss_factor_ch4_entry"))){
			if(!convertUserEntry(this.abGbFpDataS1FuelComb_formSource,
	    			"gb_fp_s1_fuel_comb.emiss_factor_ch4_entry", "gb_fp_s1_fuel_comb.emiss_factor_ch4_val",
	    			"gb_fp_s1_fuel_comb.ch4_n2o_units", "gb_fp_s1_fuel_comb.ch4_n2o_units_type"))
				return false;
		} else {
			this.abGbFpDataS1FuelComb_formSource.setFieldValue("gb_fp_s1_fuel_comb.emiss_factor_ch4_val", "");
		}

		if(valueExistsNotEmpty(this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.emiss_factor_n2o_entry"))){
			if(!convertUserEntry(this.abGbFpDataS1FuelComb_formSource,
	    			"gb_fp_s1_fuel_comb.emiss_factor_n2o_entry", "gb_fp_s1_fuel_comb.emiss_factor_n2o_val",
	    			"gb_fp_s1_fuel_comb.ch4_n2o_units", "gb_fp_s1_fuel_comb.ch4_n2o_units_type"))
				return false;
		} else {
			this.abGbFpDataS1FuelComb_formSource.setFieldValue("gb_fp_s1_fuel_comb.emiss_factor_n2o_val", "");
		}
		
		if(!convertUserEntry(this.abGbFpDataS1FuelComb_formSource,
    			"gb_fp_s1_fuel_comb.fuel_consumed_entry", "gb_fp_s1_fuel_comb.fuel_consumed",
    			"gb_fp_s1_fuel_comb.fuel_units", "gb_fp_s1_fuel_comb.fuel_units_type"))
			return false;
		
		// save form
		if(!this.abGbFpDataS1FuelComb_formSource.save())
			return false;
		
		if(!this.calculateScope1FuelCombustion())
			return false;
		
		// refresh grid
		this.abGbFpDataS1FuelComb_gridFootprints.refresh();
		
		return true;
	},

	abGbFpDataS1FuelComb_formSource_onSaveAndAddNew: function(){
		if(this.abGbFpDataS1FuelComb_formSource_onSave())
			this.abGbFpDataS1FuelComb_gridFootprints_onAddNew();
	},

	abGbFpDataS1FuelComb_formSource_onDelete: function(){
		this.tabScope1_ctrl.dataController.onDeleteSource(this.abGbFpDataS1FuelComb_formSource, this.abGbFpDataS1FuelComb_gridFootprints);
	},
	
	/**
	 * Validate existence of values for fields that do not have foreign keys
	 * @param {String} validationTable
	 */
	validateExistence: function(validationTable){
		var parameters = null;
		var errorMessage = getMessage("errorSelectSector");
		var sector_name = this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.sector_name");
		
		switch (validationTable) {
			// Validate Sector name
			case 'gb_fp_sectors':
				parameters = {
			        tableName: validationTable,
			        fieldNames: toJSON(['gb_fp_sectors.sector_name']),
			        restriction: toJSON(new Ab.view.Restriction({
			        	'gb_fp_sectors.sector_name': sector_name
			        }))
			    };
				break;
	
			default:
				break;
		}
		
		if(!parameters){
			return true;
		}

		/* 
		 * 03/23/2011 KB 3030810
		 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
		 * TODO: after the core fixes the alteration of the value to validate, remove this code
		 */
		if(!validateValueWithApostrophes(sector_name, errorMessage))
			return false;
		
	    try {
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.dataSet.records.length <= 0){
				View.showMessage(errorMessage);
				return false;
			}
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    },
    
    /**
     * Calls the WFR calculateScope1FuelCombustion to calculate the emissions for this source
     */
    calculateScope1FuelCombustion: function(){
		var bl_id = this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.calc_year"));
		var scenario_id = this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1FuelComb_formSource.getFieldValue("gb_fp_s1_fuel_comb.source_id"));
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1FuelCombustion", bl_id, calc_year, scenario_id, source_id);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    }
});

function clearFuelTechnology(clearTechMode){
	abGbFpDataS1FuelCombController.abGbFpDataS1FuelComb_formSource.setFieldValue("gb_fp_s1_fuel_comb.tech_base_code", "");
	abGbFpDataS1FuelCombController.abGbFpDataS1FuelComb_formSource.setFieldValue("gb_fp_s1_fuel_comb.technology", "");
	if(clearTechMode){
		abGbFpDataS1FuelCombController.abGbFpDataS1FuelComb_formSource.setFieldValue("gb_fp_s1_fuel_comb.tech_mode", "");
	}
}

function afterSelectFuelBaseCode(fieldName, selectedValue, previousValue){
	clearFuelTechnology(false);
}

/**
 *  Shows Select Value popup window for Technology field or Fuel field
 * 
 * @param {Object} formPanel
 * @param {Object} base_code_field
 * @param {Object} fuel_field
 * @param {Object} fuel_mode
 * @param {Object} title
 * @param {Object} actionListener
 */
function selectValueTechFuel(formPanel, base_code_field, fuel_field, fuel_mode, title, actionListener ){
	var restriction = new Ab.view.Restriction({
    	'gb_fp_fuels.fuel_base_code': formPanel.getFieldValue("gb_fp_s1_fuel_comb.fuel_base_code"),
    	'gb_fp_fuels.fuel_mode': fuel_mode
    });

	View.selectValue(formPanel.id, title,
					[base_code_field,fuel_field],
					'gb_fp_fuels',
					['gb_fp_fuels.fuel_base_code','gb_fp_fuels.fuel_name'],
					['gb_fp_fuels.fuel_name','gb_fp_fuels.fuel_base_code','gb_fp_fuel_types.fuel_base_name'],
					restriction, actionListener, false);
}
