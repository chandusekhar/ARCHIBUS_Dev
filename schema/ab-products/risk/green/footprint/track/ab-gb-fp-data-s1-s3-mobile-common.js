/**
 * Listener for 'selectValue' action of the 'gb_fp_s1_s3_mobile.vehicle_type' field.
 */
function selectVehicle(action,transpType){
	var form = action.getParentPanel();
	var dataView = View.getOpenerView().getOpenerView();
	var detailsView = dataView.panels.get("abGbFpData_fpTabs").tabs[0].getContentFrame();
	var fpDetailsForm = detailsView.View.controllers.get('abGbFpDataDetailsCtrl').abGbFpDataDetails_formFp;
	var restriction = new Ab.view.Restriction({
    	'gb_fp_mobile_data.version_type': fpDetailsForm.getFieldValue('gb_fp_setup.mobile_version_type'),
    	'gb_fp_mobile_data.version_name': fpDetailsForm.getFieldValue('gb_fp_setup.mobile_version'),
    	'gb_fp_mobile_data.transp_type': transpType
    });
	
    View.selectValue(form.id, 
				getMessage('selectVehicle'), 
				['gb_fp_s1_s3_mobile.vehicle_type'], 
				'gb_fp_mobile_data', 
				['gb_fp_mobile_data.vehicle_type'], 
				['gb_fp_mobile_data.version_name', 'gb_fp_mobile_data.vehicle_type'], 
				restriction, 
				null, false);
}

/**
 * 'onchange' listener for 'gb_fp_s1_s3_mobile.vehicle_type' field. 
 * Uses validateValueWithApostrophes() function from ab-gb-fp-common.js
 */
function validateVehicle(form, transpType){
	var dataView = View.getOpenerView().getOpenerView();
	var detailsView = dataView.panels.get("abGbFpData_fpTabs").tabs[0].getContentFrame();
	var fpDetailsForm = detailsView.View.controllers.get('abGbFpDataDetailsCtrl').abGbFpDataDetails_formFp;
	var errorMessage = getMessage('errVehicle');
	var vehicle_type = form.getFieldValue("gb_fp_s1_s3_mobile.vehicle_type");

	parameters = {
        tableName: "gb_fp_mobile_data",
        fieldNames: toJSON(['gb_fp_mobile_data.vehicle_type']),
        restriction: toJSON(new Ab.view.Restriction({
			'gb_fp_mobile_data.vehicle_type': vehicle_type,
			'gb_fp_mobile_data.version_type': fpDetailsForm.getFieldValue('gb_fp_setup.mobile_version_type'),
            'gb_fp_mobile_data.version_name': fpDetailsForm.getFieldValue('gb_fp_setup.mobile_version'),
			'gb_fp_mobile_data.transp_type' : transpType
        }))
    };

	/* 
	 * 03/23/2011 KB 3030810
	 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
	 * TODO: after the core fixes the alteration of the value to validate, remove this code
	 */
	if(!validateValueWithApostrophes(vehicle_type, errorMessage))
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
	return true
}