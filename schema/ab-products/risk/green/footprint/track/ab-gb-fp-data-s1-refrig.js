var abGbFpDataS1RefrigController = View.createController('abGbFpDataS1RefrigCtrl', {
	tabScope1_ctrl: View.getOpenerView().controllers.get('abGbFpDataS1Ctrl'),
	
	// the form panel of Footprint Building Details tab
	fpDetailsForm: null,
	
	abGbFpDataS1Refrig_gridFootprints_onAddNew: function(){
		this.abGbFpDataS1Refrig_formSource.refresh(this.abGbFpDataS1Refrig_gridFootprints.restriction, true);
	},
	
	abGbFpDataS1Refrig_formSource_onSaveAndAddNew: function(){
		if(this.abGbFpDataS1Refrig_formSource_onSave())
			this.abGbFpDataS1Refrig_gridFootprints_onAddNew();
	},

	abGbFpDataS1Refrig_formSource_onSave: function(){
		if(!this.abGbFpDataS1Refrig_formSource.canSave())
			return false;
		
		if(!abGbFpDataS1RefrigController.validateRefrigAC())
			return false;
		
		if(!abGbFpDataS1RefrigController.validateRefrig())
			return false;

		// save form
		if(!this.abGbFpDataS1Refrig_formSource.save())
			return false;
		
		if(!this.calculateScope1RefrigerantAC())
			return false;
		
		// refresh grid
		this.abGbFpDataS1Refrig_gridFootprints.refresh();
		
		return true;
	},

	abGbFpDataS1Refrig_formSource_onDelete: function(){
		this.tabScope1_ctrl.dataController.onDeleteSource(this.abGbFpDataS1Refrig_formSource, this.abGbFpDataS1Refrig_gridFootprints);
	},
	
	/**
	 * 'onchange' listener for 'gb_fp_s1_refrig_ac.refrig_ac_type' field. 
	 */
	validateRefrigAC: function(){
		if(!this.fpDetailsForm){
			this.fpDetailsForm = this.getFpDetailsForm();
		}

		var errorMessage = getMessage('errorSelectRefrigAC');
		var refrig_ac_type = this.abGbFpDataS1Refrig_formSource.getFieldValue("gb_fp_s1_refrig_ac.refrig_ac_type");
			
		parameters = {
	        tableName: "gb_fp_refrig_data",
	        fieldNames: toJSON(['gb_fp_refrig_data.refrig_ac_type', 'gb_fp_refrig_data.eq_std']),
	        restriction: toJSON(new Ab.view.Restriction({
				'gb_fp_refrig_data.version_type': this.fpDetailsForm.getFieldValue('gb_fp_setup.refrig_version_type'),
	            'gb_fp_refrig_data.version_name': this.fpDetailsForm.getFieldValue('gb_fp_setup.refrig_version'),
				'gb_fp_refrig_data.refrig_ac_type': refrig_ac_type
	        }))
	    };

		/* 
		 * 03/23/2011 KB 3030810
		 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
		 * TODO: after the core fixes the alteration of the value to validate, remove this code
		 */
		if(!validateValueWithApostrophes(refrig_ac_type, errorMessage))
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
	 * 'onchange' listener for 'gb_fp_s1_refrig_ac.refrigerant_type' field. 
	 */
	validateRefrig: function(){
		if(!this.fpDetailsForm){
			this.fpDetailsForm = this.getFpDetailsForm();
		}

		var errorMessage = getMessage('errorSelectRefrig');
		var refrigerant_type = this.abGbFpDataS1Refrig_formSource.getFieldValue("gb_fp_s1_refrig_ac.refrigerant_type");
		
		parameters = {
	        tableName: "gb_fp_gwp_data",
	        fieldNames: toJSON(['gb_fp_gwp_data.gas_ref_name']),
	        restriction: toJSON(new Ab.view.Restriction({
				'gb_fp_gwp_data.version_type': this.fpDetailsForm.getFieldValue('gb_fp_setup.gwp_version_type'),
	            'gb_fp_gwp_data.version_name': this.fpDetailsForm.getFieldValue('gb_fp_setup.gwp_version'),
	            'gb_fp_gwp_data.gas_ref_type': 'R',
				'gb_fp_gwp_data.gas_ref_name': refrigerant_type
	        }))
	    };

		/* 
		 * 03/23/2011 KB 3030810
		 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
		 * TODO: after the core fixes the alteration of the value to validate, remove this code
		 */
		if(!validateValueWithApostrophes(refrigerant_type, errorMessage))
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
     * Calls the WFR calculateScope1RefrigerantAC to calculate the emissions for this source
     */
    calculateScope1RefrigerantAC: function(){
		var bl_id = this.abGbFpDataS1Refrig_formSource.getFieldValue("gb_fp_s1_refrig_ac.bl_id");
		var calc_year = parseInt(this.abGbFpDataS1Refrig_formSource.getFieldValue("gb_fp_s1_refrig_ac.calc_year"));
		var scenario_id = this.abGbFpDataS1Refrig_formSource.getFieldValue("gb_fp_s1_refrig_ac.scenario_id");
		var source_id = parseInt(this.abGbFpDataS1Refrig_formSource.getFieldValue("gb_fp_s1_refrig_ac.source_id"));
		
	    try {
			var result = Workflow.callMethod("AbRiskGreenBuilding-FootprintService-calculateScope1RefrigerantAC", bl_id, calc_year, scenario_id, source_id);
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    }
});

/**
 * KB 3030451 get number of units for eqStd
 * @returns {Boolean}
 */
function getAcCounts(fieldName, selectedValue, previousValue){
	var form = View.panels.get('abGbFpDataS1Refrig_formSource');
	var controller = View.controllers.get("abGbFpDataS1RefrigCtrl");
	if(!controller.fpDetailsForm){
		controller.fpDetailsForm = controller.getFpDetailsForm();
	}
	
	var versionType = controller.fpDetailsForm.getFieldValue('gb_fp_setup.refrig_version_type');
	var version = controller.fpDetailsForm.getFieldValue('gb_fp_setup.refrig_version');
	var acType;
	if(selectedValue != undefined){
		acType = selectedValue;
	}else{
		acType = form.getFieldValue("gb_fp_s1_refrig_ac.refrig_ac_type");
	}
	
	// get eq standard
	var parameters = {
	        tableName: "gb_fp_refrig_data",
	        fieldNames: toJSON(['gb_fp_refrig_data.eq_std']),
	        restriction: toJSON(new Ab.view.Restriction({
				'gb_fp_refrig_data.version_type': versionType,
	            'gb_fp_refrig_data.version_name': version,
				'gb_fp_refrig_data.refrig_ac_type': acType
	        }))
	    };
	var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	if(result.code == 'executed'){
		var record = result.data.records[0];
		var eqStd = record['gb_fp_refrig_data.eq_std'];
		if(valueExistsNotEmpty(eqStd)){
			var blId = form.getFieldValue("gb_fp_s1_refrig_ac.bl_id");
			parameters = {
			        tableName: "eq",
			        fieldNames: toJSON(['eq.eq_id', 'eq.eq_std']),
			        restriction: toJSON(new Ab.view.Restriction({
						'eq.bl_id': blId,
			            'eq.eq_std': eqStd
			        }))
			    };
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.code == 'executed'){
				var acCounts = result.data.records.length;
				form.setFieldValue("gb_fp_s1_refrig_ac.refrig_ac_count", acCounts);
				return true;
			}else{
		        Workflow.handleError(e);
		        return false;
			}
		}else{
			form.setFieldValue("gb_fp_s1_refrig_ac.refrig_ac_count", "");
		}
	}else{
        Workflow.handleError(e);
        return false;
	}
	
}

/**
 * Listener for 'selectValue' action of the 'gb_fp_s1_refrig_ac.refrig_ac_type' field.
 */
function selectRefrigAC(action){
	if(!abGbFpDataS1RefrigController.fpDetailsForm){
		abGbFpDataS1RefrigController.fpDetailsForm = abGbFpDataS1RefrigController.getFpDetailsForm();
	}
	var form = action.getParentPanel();

	var restriction = new Ab.view.Restriction({
		'gb_fp_refrig_data.version_type': abGbFpDataS1RefrigController.fpDetailsForm.getFieldValue('gb_fp_setup.refrig_version_type'),
        'gb_fp_refrig_data.version_name': abGbFpDataS1RefrigController.fpDetailsForm.getFieldValue('gb_fp_setup.refrig_version')
    });
	
    View.selectValue(form.id, 
				getMessage('selectRefrigAC'), 
				['gb_fp_s1_refrig_ac.refrig_ac_type'], 
				'gb_fp_refrig_data', 
				['gb_fp_refrig_data.refrig_ac_type'], 
				['gb_fp_refrig_data.version_name', 'gb_fp_refrig_data.refrig_ac_type', 'gb_fp_refrig_data.eq_std'], 
				restriction, 
				'getAcCounts', false);
}

/**
 * Listener for 'selectValue' action of the 'gb_fp_s1_refrig_ac.refrigerant_type' field.
 */
function selectRefrig(action){
	if(!abGbFpDataS1RefrigController.fpDetailsForm){
		abGbFpDataS1RefrigController.fpDetailsForm = abGbFpDataS1RefrigController.getFpDetailsForm();
	}
	var form = action.getParentPanel();

	var restriction = new Ab.view.Restriction({
		'gb_fp_gwp_data.version_type': abGbFpDataS1RefrigController.fpDetailsForm.getFieldValue('gb_fp_setup.gwp_version_type'),
	    'gb_fp_gwp_data.version_name': abGbFpDataS1RefrigController.fpDetailsForm.getFieldValue('gb_fp_setup.gwp_version'),
	    'gb_fp_gwp_data.gas_ref_type': 'R'
    });
	
    View.selectValue(form.id, 
				getMessage('selectRefrig'), 
				['gb_fp_s1_refrig_ac.refrigerant_type'], 
				'gb_fp_gwp_data', 
				['gb_fp_gwp_data.gas_ref_name'], 
				['gb_fp_gwp_data.version_name', 'gb_fp_gwp_data.gas_ref_name'], 
				restriction, 
				null, false);
}
