var abGbFpDataS3PurchMat_ctrl = View.createController('abGbFpDataS3PurchMat_ctrl', {

	tabScope3_ctrl: View.getOpenerView().controllers.get('abGbFpDataS3_ctrl'),
    version_name: null,
    version_type: null,

	afterViewLoad:function(){
		this.abGbFpDataS3PurchMat_form.setMaxValue('gb_fp_s3_mat.recycled_content', 100);
		this.abGbFpDataS3PurchMat_form.setMinValue('gb_fp_s3_mat.recycled_content', 0);
	},
    afterInitialDataFetch: function(){
    
        this.version_type = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.waste_sol_version_type');
        this.version_name = this.tabScope3_ctrl.abGbFpDataDetails_form.getFieldValue('gb_fp_setup.waste_sol_version');
        
        customizeUnitField(this.abGbFpDataS3PurchMat_form, "gb_fp_s3_mat.units", "WEIGHT-LBS");
        
    },
    
	abGbFpDataS3PurchMat_grid_onAddNew: function(){
		this.abGbFpDataS3PurchMat_form.refresh(this.abGbFpDataS3PurchMat_grid.restriction, true);
	},

	abGbFpDataS3PurchMat_form_onSaveAndAddNew: function(){
		if(this.abGbFpDataS3PurchMat_form_onSave())
			this.abGbFpDataS3PurchMat_grid_onAddNew();
	},

	/**
     * Listener for 'save' action from 'abGbFpDataS3PurchMat_form' panel
     */
	abGbFpDataS3PurchMat_form_onSave: function(){
		this.abGbFpDataS3PurchMat_form.fields.get("gb_fp_s3_mat.amount_purchased").clear();
		
        if (!this.abGbFpDataS3PurchMat_form.canSave() || !validateWasteName())
        	return false;
        
        try {
            if (!convertUserEntry(this.abGbFpDataS3PurchMat_form, "gb_fp_s3_mat.amount_purchased_entry", "gb_fp_s3_mat.amount_purchased", "gb_fp_s3_mat.units", "gb_fp_s3_mat.units_type")) {
                return false;
            }
            
			this.abGbFpDataS3PurchMat_form.save();
            
            var bl_id = this.abGbFpDataS3PurchMat_form.getFieldValue("gb_fp_s3_mat.bl_id");
            var calc_year = parseInt(this.abGbFpDataS3PurchMat_form.getFieldValue("gb_fp_s3_mat.calc_year"));
            var scenario_id = this.abGbFpDataS3PurchMat_form.getFieldValue("gb_fp_s3_mat.scenario_id");
            var source_id = parseInt(this.abGbFpDataS3PurchMat_form.getFieldValue("gb_fp_s3_mat.source_id"));
            
            Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope3PurchasedMaterials",bl_id, calc_year, scenario_id, source_id);
            
            this.abGbFpDataS3PurchMat_grid.refresh();
        } 
        catch (e) {
            Workflow.handleError(e);
            return false;
        }
		
        return true;
	},
	
	/**
     * Listener for 'delete' action from 'abGbFpDataS3PurchMat_form' panel
     */
	abGbFpDataS3PurchMat_form_onDelete: function(){
		
		this.tabScope3_ctrl.dataController.onDeleteSource(this.abGbFpDataS3PurchMat_form ,this.abGbFpDataS3PurchMat_grid);
	}
	
});



/**
 * Listener for 'selectValue' action of the 'gb_fp_s3_mat.waste_name' field.
 */
function selectWasteName(){

    Ab.view.View.selectValue('abGbFpDataS3PurchMat_form', 
				getMessage('selectWasteName'), 
				['gb_fp_s3_mat.waste_name'], 
				'gb_fp_waste_sol_data', 
				['gb_fp_waste_sol_data.waste_name'], 
				['gb_fp_waste_sol_data.version_name', 'gb_fp_waste_sol_data.composition', 'gb_fp_waste_sol_data.waste_name'], 
				" gb_fp_waste_sol_data.version_name = '" + abGbFpDataS3PurchMat_ctrl.version_name + "' and gb_fp_waste_sol_data.version_type = '" + abGbFpDataS3PurchMat_ctrl.version_type + "'", 
				null, false);
}

/**
 * 'onchange' listener for 'gb_fp_s3_mat.waste_name' field. 
 */
function validateWasteName(){
	var errorMessage = getMessage('errWasteName');
	var waste_name = abGbFpDataS3PurchMat_ctrl.abGbFpDataS3PurchMat_form.getFieldValue("gb_fp_s3_mat.waste_name");
    
	parameters = {
        tableName: "gb_fp_waste_sol_data",
        fieldNames: toJSON(['gb_fp_waste_sol_data.waste_name']),
        restriction: toJSON(new Ab.view.Restriction({
			'gb_fp_waste_sol_data.waste_name': waste_name,
            'gb_fp_waste_sol_data.version_name': abGbFpDataS3PurchMat_ctrl.version_name,
			'gb_fp_waste_sol_data.version_type': abGbFpDataS3PurchMat_ctrl.version_type
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