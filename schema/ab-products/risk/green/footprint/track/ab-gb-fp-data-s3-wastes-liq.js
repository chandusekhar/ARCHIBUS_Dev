var abGbFpDataS3WastesLiq_ctrl = View.createController('abGbFpDataS3WastesLiq_ctrl', {

	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
    version_name: null,
    version_type: null,

	afterInitialDataFetch: function(){
    
        this.version_type = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.waste_liq_version_type');
        this.version_name = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.waste_liq_version');
        
        customizeUnitField(this.abGbFpDataS3WastesLiq_form, "gb_fp_s3_waste_liq.units", "VOLUME LIQUID-GAL");
        
    },

    abGbFpDataS3WastesLiq_grid_onAddNew: function(){
		this.abGbFpDataS3WastesLiq_form.refresh(this.abGbFpDataS3WastesLiq_grid.restriction, true);
	},

	abGbFpDataS3WastesLiq_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3WastesLiq_form_onSave())
			this.abGbFpDataS3WastesLiq_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3WastesLiq_form' panel
     */
	abGbFpDataS3WastesLiq_form_onSave: function(){
		this.abGbFpDataS3WastesLiq_form.fields.get("gb_fp_s3_waste_liq.qty_treated").clear();
		
        if (!this.abGbFpDataS3WastesLiq_form.canSave() || !validateTreatment())
        	return false;
        
        try {
            if (!convertUserEntry(this.abGbFpDataS3WastesLiq_form, "gb_fp_s3_waste_liq.qty_treated_entry", "gb_fp_s3_waste_liq.qty_treated", "gb_fp_s3_waste_liq.units", "gb_fp_s3_waste_liq.units_type")) {
                return false;
            }
            
			this.abGbFpDataS3WastesLiq_form.save();
            
            var bl_id = this.abGbFpDataS3WastesLiq_form.getFieldValue("gb_fp_s3_waste_liq.bl_id");
            var calc_year = parseInt(this.abGbFpDataS3WastesLiq_form.getFieldValue("gb_fp_s3_waste_liq.calc_year"));
            var scenario_id = this.abGbFpDataS3WastesLiq_form.getFieldValue("gb_fp_s3_waste_liq.scenario_id");
            var source_id = parseInt(this.abGbFpDataS3WastesLiq_form.getFieldValue("gb_fp_s3_waste_liq.source_id"));
            
            Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3WasteLiquid",bl_id, calc_year, scenario_id, source_id);
            
            this.abGbFpDataS3WastesLiq_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
		
        return true;
	},
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3WastesLiq_form' panel
     */
	abGbFpDataS3WastesLiq_form_onDelete: function(){
		
		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3WastesLiq_form ,this.abGbFpDataS3WastesLiq_grid);
	}
	
});



/**
 * Listener for 'selectValue' action of the 'gb_fp_s3_waste_liq.treatment_id' field.
 */
function selectTreatment(){

    Ab.view.View.selectValue('abGbFpDataS3WastesLiq_form', 
				getMessage('selectTreatment'), 
				['gb_fp_s3_waste_liq.treatment_id'], 
				'gb_fp_waste_liq_data', 
				['gb_fp_waste_liq_data.treatment_id'], 
				['gb_fp_waste_liq_data.version_name', 'gb_fp_waste_liq_data.treatment_id'], 
				" gb_fp_waste_liq_data.version_name = '" + abGbFpDataS3WastesLiq_ctrl.version_name + "' and gb_fp_waste_liq_data.version_type = '" + abGbFpDataS3WastesLiq_ctrl.version_type + "'", 
				null, false);
}

/**
 * 'onchange' listener for 'gb_fp_s3_waste_liq.treatment_id' field. 
 */
function validateTreatment(){
    var errorMessage = getMessage('errTreatment');
    var treatment_id = abGbFpDataS3WastesLiq_ctrl.abGbFpDataS3WastesLiq_form.getFieldValue("gb_fp_s3_waste_liq.treatment_id");
    
	parameters = {
        tableName: "gb_fp_waste_liq_data",
        fieldNames: toJSON(['gb_fp_waste_liq_data.treatment_id']),
        restriction: toJSON(new Ab.view.Restriction({
			'gb_fp_waste_liq_data.treatment_id': treatment_id,
            'gb_fp_waste_liq_data.version_name': abGbFpDataS3WastesLiq_ctrl.version_name,
			'gb_fp_waste_liq_data.version_type': abGbFpDataS3WastesLiq_ctrl.version_type
        }))
    };

	/* 
	 * 03/23/2011 KB 3030810
	 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
	 * TODO: after the core fixes the alteration of the value to validate, remove this code
	 */
	if(!validateValueWithApostrophes(treatment_id, errorMessage))
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
}