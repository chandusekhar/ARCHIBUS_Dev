/**
 * It is called when user click "Save for all Arrangements for this Room" button
 */
function onSaveAllArrangements(){
	var form = View.panels.get("resource_std_form");
	
	var roomResourceStandard = new Object();
	
	roomResourceStandard.fixed_resource_id = form.getFieldValue('rm_resource_std.fixed_resource_id');
	roomResourceStandard.resource_std = form.getFieldValue('rm_resource_std.resource_std');
	roomResourceStandard.description = form.getFieldValue('rm_resource_std.description');
	roomResourceStandard.eq_id = form.getFieldValue('rm_resource_std.eq_id');
	roomResourceStandard.bl_id = form.getFieldValue('rm_resource_std.bl_id');
	roomResourceStandard.fl_id = form.getFieldValue('rm_resource_std.fl_id');
	roomResourceStandard.rm_id = form.getFieldValue('rm_resource_std.rm_id');
	roomResourceStandard.config_id = form.getFieldValue('rm_resource_std.config_id');
	roomResourceStandard.rm_arrange_type_id = form.getFieldValue('rm_resource_std.rm_arrange_type_id');
	
	if(!roomResourceStandard.fixed_resource_id || !roomResourceStandard.resource_std) {
		View.showMessage(getMessage("fillMandatoryFieldsError"));
		return;
	}
	
	if (!form.save()) {
		return false;
	}
	
	//Invokes saveArrangementFixedResource WFR to save the fixed resource for all arrangements for this room.	
    var rmResourceStd = toJSON(roomResourceStandard);
    
	try{
		var result =  Workflow.callMethod("AbWorkplaceReservations-common-saveArrangementFixedResource", rmResourceStd);
		var isOk = resultSaveArrangementFixedResource(result);
		return isOk;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}

/**
 * Handle the result of WFR AbWorkplaceReservations-saveArrangementFixedResource
 * @param {Object} result come from WFR
 */
function resultSaveArrangementFixedResource(result){
    if (result.code == 'executed') {   
        View.showMessage(getMessage("saveAllArrangementSuccessfully"));
		return true;
    }else{
		View.showMessage(result.message);
		return false;
	}
}


/**
 * generate Fix_Resource_ID if newRecord
 * 
 * Fix_Resource_ID = (resource_std + "-" + bl__id + "-" + fl_id+ "-" + rm_id + "-" + config_id)
 * 
 * @param {Object} fieldName
 * @param {Object} selectedValue
 * @param {Object} previousValue 
 */
function afterSelectResourceStandard(fieldName, selectedValue, previousValue){
	var form = View.panels.get('resource_std_form');
	
	if (form.newRecord) {
		var resource_std = selectedValue;
		
		var bl_id = form.getFieldValue('rm_resource_std.bl_id');
		var fl_id = form.getFieldValue('rm_resource_std.fl_id');
		var rm_id = form.getFieldValue('rm_resource_std.rm_id');
		var config_id = form.getFieldValue('rm_resource_std.config_id');
		var fixed_resource_id = "";
	
		if (resource_std) {
			fixed_resource_id = trim(resource_std) + "-" + bl_id + "-" + fl_id + "-" + rm_id + "-" + config_id;
		}
		
		form.setFieldValue('rm_resource_std.fixed_resource_id', fixed_resource_id);
	}
}
