var abGbFpDataS3WastesSol_ctrl = View.createController('abGbFpDataS3WastesSol_ctrl', {

    tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
    version_name: null,
    version_type: null,
    
    afterInitialDataFetch: function(){
    
        this.version_type = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.waste_sol_version_type');
        this.version_name = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.waste_sol_version');
        
        customizeUnitField(this.abGbFpDataS3WastesSol_form, "gb_fp_s3_waste_sol.units", "WEIGHT-LBS");
        
    },
    
    abGbFpDataS3WastesSol_grid_onAddNew: function(){
		this.abGbFpDataS3WastesSol_form.refresh(this.abGbFpDataS3WastesSol_grid.restriction, true);
	},

	abGbFpDataS3WastesSol_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3WastesSol_form_onSave())
			this.abGbFpDataS3WastesSol_grid_onAddNew();
	},

    /**
     * Listener for 'save' action from 'abGbFpDataS3WastesSol_form' panel
     */
    abGbFpDataS3WastesSol_form_onSave: function(){
		this.abGbFpDataS3WastesSol_form.fields.get("gb_fp_s3_waste_sol.amount_disposed").clear();
		this.abGbFpDataS3WastesSol_form.fields.get("gb_fp_s3_waste_sol.amount_recycled").clear();
		
        if (!this.abGbFpDataS3WastesSol_form.canSave() || !validateWasteName())
        	return false;
        
        try {
            if (!convertUserEntry(this.abGbFpDataS3WastesSol_form, "gb_fp_s3_waste_sol.amount_disposed_entry", "gb_fp_s3_waste_sol.amount_disposed", "gb_fp_s3_waste_sol.units", "gb_fp_s3_waste_sol.units_type")) {
                return false;
            }
            if (!convertUserEntry(this.abGbFpDataS3WastesSol_form, "gb_fp_s3_waste_sol.amount_recycled_entry", "gb_fp_s3_waste_sol.amount_recycled", "gb_fp_s3_waste_sol.units", "gb_fp_s3_waste_sol.units_type")) {
            	return false;
            }
            
            this.abGbFpDataS3WastesSol_form.save();
            
            var bl_id = this.abGbFpDataS3WastesSol_form.getFieldValue("gb_fp_s3_waste_sol.bl_id");
            var calc_year =  parseInt(this.abGbFpDataS3WastesSol_form.getFieldValue("gb_fp_s3_waste_sol.calc_year"));
            var scenario_id = this.abGbFpDataS3WastesSol_form.getFieldValue("gb_fp_s3_waste_sol.scenario_id");
            var source_id = parseInt(this.abGbFpDataS3WastesSol_form.getFieldValue("gb_fp_s3_waste_sol.source_id"));
            
            Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3WasteSolid", bl_id, calc_year, scenario_id, source_id);
            
            this.abGbFpDataS3WastesSol_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
        
        return true;
    },
	
   
    /**
     * Listener for 'delete' action from 'abGbFpDataS3WastesSol_form' panel
     */
    abGbFpDataS3WastesSol_form_onDelete: function(){
    
        this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3WastesSol_form, this.abGbFpDataS3WastesSol_grid);
    }
    
});



/**
 * Listener for 'selectValue' action of the 'gb_fp_s3_waste_sol.waste_name' field.
 */
function selectWasteName(){

    Ab.view.View.selectValue('abGbFpDataS3WastesSol_form', getMessage('selectWasteName'), ['gb_fp_s3_waste_sol.waste_name'], 'gb_fp_waste_sol_data', ['gb_fp_waste_sol_data.waste_name'], ['gb_fp_waste_sol_data.version_name', 'gb_fp_waste_sol_data.composition', 'gb_fp_waste_sol_data.waste_name'], " gb_fp_waste_sol_data.version_name = '" + abGbFpDataS3WastesSol_ctrl.version_name + "' and gb_fp_waste_sol_data.version_type = '" + abGbFpDataS3WastesSol_ctrl.version_type + "'", null, false);
}

/**
 * 'onchange' listener for 'gb_fp_s3_waste_sol.waste_name' field.
 */
function validateWasteName(){
	var errorMessage = getMessage('errWasteName');
	var waste_name = abGbFpDataS3WastesSol_ctrl.abGbFpDataS3WastesSol_form.getFieldValue("gb_fp_s3_waste_sol.waste_name");
	
    parameters = {
        tableName: "gb_fp_waste_sol_data",
        fieldNames: toJSON(['gb_fp_waste_sol_data.waste_name']),
        restriction: toJSON(new Ab.view.Restriction({
            'gb_fp_waste_sol_data.waste_name': waste_name,
            'gb_fp_waste_sol_data.version_name': abGbFpDataS3WastesSol_ctrl.version_name,
            'gb_fp_waste_sol_data.version_type': abGbFpDataS3WastesSol_ctrl.version_type
        }))
    };

	/* 
	 * 03/23/2011 KB 3030810
	 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
	 * TODO: after the core fixes the alteration of the value to validate, remove this code
	 */
	if(!validateValueWithApostrophes(waste_name, errorMessage))
		return false;
    
    try {
        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
        if (result.dataSet.records.length <= 0) {
            View.showMessage(errorMessage);
            return false;
        }
    } 
    catch (e) {
        Workflow.handleError(e);
		return false;
    }
	return true;
    
}