/**
 * Set location information form properly.
 * 
 * @param form 
 * @param id
 * @param enable
 */
function setLocationForm(form, id){
	form.show(true);
	if(id){
		form.refresh("compliance_locations.location_id="+id,false);
	} else {
		form.refresh(null, true);
	}
}

/**
 * Save compliance_locations field and return new location_id, replace previous "saveLocationForm".
 * 
 * @param mainForm form for main record that references to location_id and contains regulation, program and requirement
 * @param locForm compliance location form
 * @param table name of table that references to location_id
 */
function createOrUpdateLocation(mainForm, locForm, table){
	
	//get int value of location_id
	var locId = mainForm.getFieldValue(table+".location_id");
	if(!locId){
		locId=-1;
	} else {
		locId = parseInt(locId);
	}
	
	//determine if there are any location field value
	var found=false;
	locForm.fields.each(function(field) {
		if(field.fieldDef.id != 'compliance_locations.location_id' && locForm.getFieldValue(field.fieldDef.id)){
			found = true;
		}
	});

	//if found then call WFR createOrUpdateLocation
	if(found){

		var loc = locForm.getOutboundRecord().values;
		var regulation = mainForm.getFieldValue(table+".regulation");
		var program = mainForm.getFieldValue(table+".reg_program");
		var requirement = mainForm.getFieldValue(table+".reg_requirement");

		try{
			var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-createOrUpdateLocation', 
				loc,locId,regulation,program,requirement);

			if(result.code == 'executed'){

				locId = result.jsonExpression;
				locForm.refresh( "compliance_locations.location_id="+locId, false);
				mainForm.setFieldValue(table+".location_id",locId);
			}
		}catch(e){
			
			Workflow.handleError(e);
			mainForm.setFieldValue(table+".location_id","");
		}
	}
	//if NOT found then just set location_id = null; the Schedule rule 'cleanUpLocations' will take care the left un-referenced location_id
	else {
		mainForm.setFieldValue(table+".location_id","");
	}	
}

/**
 * Delete location by calling WFR deleteLocation.
 * 
 * @param locId location id to delete
 * @param limit count limit used to check if delete given location
 * @param form need to clear location id
 * @param table table contain field location_id
 */
function deleteLocation(locId, limit, mainForm, table){
	try{
		var result  = Workflow.callMethod('AbRiskCompliance-ComplianceCommon-deleteLocation', 
			locId, limit);

		if(result.code == 'executed' && mainForm){
			mainForm.setFieldValue(table+".location_id","");
		}
	}catch(e){
		Workflow.handleError(e);
	}
}

