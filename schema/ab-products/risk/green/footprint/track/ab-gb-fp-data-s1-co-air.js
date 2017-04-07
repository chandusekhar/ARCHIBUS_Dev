var abGbFpDataS1CoAirController = View.createController('abGbFpDataS1CoAirCtrl', {
	tabScope1_ctrl: View.getOpenerView().controllers.get('abGbFpDataS1Ctrl'),
	
	// the form panel of Footprint Building Details tab
	fpDetailsForm: null,
	
	abGbFpDataS1CoAir_gridFootprints_onAddNew: function(){
		this.abGbFpDataS1CoAir_formSource.refresh(this.abGbFpDataS1CoAir_gridFootprints.restriction, true);
	},
	
	abGbFpDataS1CoAir_formSource_onSaveAndAddNew: function(){
		if(this.abGbFpDataS1CoAir_formSource_onSave())
			this.abGbFpDataS1CoAir_gridFootprints_onAddNew();
	},

	abGbFpDataS1CoAir_formSource_onSave: function() {
		if(!this.abGbFpDataS1CoAir_formSource.canSave())
			return false;
	
		if(!this.validateAircraft())
			return false;
		
		// save form
		if(!this.abGbFpDataS1CoAir_formSource.save())
			return false;
		
		if(!this.calculateScope1CompanyOwnedAircraft())
			return false;
		
		// refresh grid
		this.abGbFpDataS1CoAir_gridFootprints.refresh();
		
		return true;
	},

	abGbFpDataS1CoAir_formSource_onDelete: function(){
		this.tabScope1_ctrl.dataController.onDeleteSource(this.abGbFpDataS1CoAir_formSource, this.abGbFpDataS1CoAir_gridFootprints);
	},
	
	/**
	 * 'onchange' listener for 'gb_fp_s1_co_airc.aircraft_type' field. 
	 */
	validateAircraft: function(){
		if(!this.fpDetailsForm){
			this.fpDetailsForm = this.getFpDetailsForm();
		}

		var errorMessage = getMessage('errorSelectAircraft');
		var aircraft_type = this.abGbFpDataS1CoAir_formSource.getFieldValue("gb_fp_s1_co_airc.aircraft_type");
		
		parameters = {
	        tableName: "gb_fp_airc_data",
	        fieldNames: toJSON(['gb_fp_airc_data.aircraft_type']),
	        restriction: toJSON(new Ab.view.Restriction({
				'gb_fp_airc_data.version_type': this.fpDetailsForm.getFieldValue('gb_fp_setup.airc_version_type'),
	            'gb_fp_airc_data.version_name': this.fpDetailsForm.getFieldValue('gb_fp_setup.airc_version'),
				'gb_fp_airc_data.aircraft_type': aircraft_type
	        }))
	    };

		/* 
		 * 03/23/2011 KB 3030810
		 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
		 * TODO: after the core fixes the alteration of the value to validate, remove this code
		 */
		if(!validateValueWithApostrophes(aircraft_type, errorMessage))
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
	 * Get the form panel of Details tab
	 */
	getFpDetailsForm: function(){
		var dataView = View.getOpenerView().getOpenerView();
		var detailsView = dataView.panels.get("abGbFpData_fpTabs").tabs[0].getContentFrame();
		var fpDetailsForm = detailsView.View.controllers.get('abGbFpDataDetailsCtrl').abGbFpDataDetails_formFp;
		
		return fpDetailsForm;
	},
	
    /**
     * TODO Implement this function and call it on Save
     * Calls the WFR calculateScope1CompanyOwnedAircraft to calculate the emissions for this source
     */
    calculateScope1CompanyOwnedAircraft: function(){
		var bl_id = this.abGbFpDataS1CoAir_formSource.getFieldValue("gb_fp_s1_co_airc.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1CoAir_formSource.getFieldValue("gb_fp_s1_co_airc.calc_year"));
		var scenario_id = this.abGbFpDataS1CoAir_formSource.getFieldValue("gb_fp_s1_co_airc.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1CoAir_formSource.getFieldValue("gb_fp_s1_co_airc.source_id"));
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1CompanyOwnedAircraft", bl_id, calc_year, scenario_id, source_id);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    }
});

/**
 * Listener for 'selectValue' action of the 'gb_fp_s1_co_airc.aircraft_type' field.
 */
function selectAircraft(action){
	if(!abGbFpDataS1CoAirController.fpDetailsForm){
		abGbFpDataS1CoAirController.fpDetailsForm = abGbFpDataS1CoAirController.getFpDetailsForm();
	}
	var form = action.getParentPanel();

	var restriction = new Ab.view.Restriction({
		'gb_fp_airc_data.version_type': abGbFpDataS1CoAirController.fpDetailsForm.getFieldValue('gb_fp_setup.airc_version_type'),
        'gb_fp_airc_data.version_name': abGbFpDataS1CoAirController.fpDetailsForm.getFieldValue('gb_fp_setup.airc_version')
    });
	
    View.selectValue(form.id, 
				getMessage('selectAircraft'), 
				['gb_fp_s1_co_airc.aircraft_type'], 
				'gb_fp_airc_data', 
				['gb_fp_airc_data.aircraft_type'], 
				['gb_fp_airc_data.version_name', 'gb_fp_airc_data.aircraft_type'], 
				restriction, 
				null, false);
}
