/**
 * get field ids for selected rows
 * @param grid
 * @param fieldName
 * @param arrayElementsType 'integer' or 'string'
 * @returns {Array}
 */
function getKeysForSelectedRows(grid, fieldName, arrayElementsType){
	var fieldIds = [];
	var selectedRecords = grid.getSelectedRecords();
    for (var i = 0; i < selectedRecords.length; i++) {
        var fieldId = selectedRecords[i].getValue(fieldName);
        if(arrayElementsType == 'integer'){
        	fieldId = parseInt(fieldId);
        }
        fieldIds.push(fieldId);
    }
    return fieldIds;
}

/**
 * Validate values for filter console.
 * 
 * @param filterId filter id
 */
function validateFilter(filterId){
	var objFilter = View.panels.get(filterId);
	var isValid = true;
	if(objFilter){
		objFilter.clearValidationResult();
		objFilter.fields.each(function(field){
			var fieldValue = objFilter.getFieldValue(field.fieldDef.id);
			if(!field.hidden && field.fieldDef.required && !valueExistsNotEmpty(fieldValue)){
				isValid = false;
				var message = getMessage("z_MESSAGE_NOVALUE_FIELD").replace("{0}", field.fieldDef.title);
				objFilter.addInvalidField(field.fieldDef.id, '');
				objFilter.displayValidationResult({message:'', detailedMessage:''});
				View.showMessage(message);
				return false;
			}
		});
	}
	return isValid;
}

/**
 * Assign training to employees.
 * 
 * @param trainingIds the selected training ids
 * @param employeeIds employee codes
 * @param initialDate selected date
 * @param incidentId the related incident id
 * @param callback callback function
 */
function assignTrainingToEmployees(trainingIds, employeeIds, initialDate, incidentId, callback){
	try{
		var jobId = Workflow.startJob('AbRiskEHS-EHSService-assignTrainingToEmployees', trainingIds, employeeIds, initialDate, incidentId);
	    View.openJobProgressBar(getMessage("z_MESSAGE_ASSIGN_EMPLOYEE_TO_TRAINING_JOB"), jobId, '', function(status) {
	    	if (valueExists(status.jobProperties.recordNo) && parseInt(status.jobProperties.recordNo) == 0) {
	    		View.showMessage(getMessage("z_MESSAGE_ASSIGN_EMPLOYEE_TO_TRAINING_NORECORDS"));
	    	}
	    	if(valueExists(callback)){
	    		callback.call();
	    	}
	    	
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Assign PPE to Employees.
 * @param ppeIds list of ppe ids.
 * @param employeeIds employee codes
 * @param deliveryDate delivery date
 * @param buildingId building code
 * @param floorId floor code
 * @param roomId room code
 * @param incidentId room code
 * @param callback callback function 
 */
function assignPPEToEmployees(ppeIds, employeeIds, deliveryDate, buildingId, floorId, roomId, incidentId, callback){
	try{
		var jobId = Workflow.startJob('AbRiskEHS-EHSService-assignPPEsToEmployees', ppeIds, employeeIds, deliveryDate, buildingId, floorId, roomId, incidentId);
	    View.openJobProgressBar(getMessage("z_MESSAGE_ASSIGN_PPE_TO_EM_JOB"), jobId, '', function(status) {
	    	if (valueExists(status.jobProperties.recordNo) && parseInt(status.jobProperties.recordNo) == 0) {
	    		View.showMessage(getMessage("z_MESSAGE_ASSIGN_PPE_TO_EM_NORECORDS"));
	    	}
	    	if(valueExists(callback)){
	    		callback.call();
	    	}
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Assign medical monitoring to employees.
 * 
 * @param monitorings list of selected medical monitorings
 * @param employeeIds employee codes
 * @param initialDate selected date
 * @param incidentId the related incident id
 * @param callback callback function
 */
function assignMonitoringToEmployees(monitorings, employeeIds, initialDate, incidentId, callback){
	try{
		var jobId = Workflow.startJob('AbRiskEHS-EHSService-assignMonitoringsToEmployees', monitorings, employeeIds, initialDate, incidentId);
	    View.openJobProgressBar(getMessage("z_MESSAGE_ASSIGN_MONITORING_TO_EM_JOB"), jobId, '', function(status) {
	    	if (valueExists(status.jobProperties.recordNo) && parseInt(status.jobProperties.recordNo) == 0) {
	    		View.showMessage(getMessage("z_MESSAGE_ASSIGN_MONITORING_TO_EM_NORECORDS"));
	    	}
	    	if(valueExists(callback)){
	    		callback.call();
	    	}
	    });
	} catch (e) {
		Workflow.handleError(e);
	}
}

/**
 * Delete the selected records in the given grid,
 * and refresh the grid
 * 
 * Messages in the calling view that should exist: "errorSelectRecords" and "confirmDelete"
 * 
 * @param grid
 * @param pKeyFields Array of field ids of the primary key fields
 */
function deleteSelectedRecordsInGrid(commandObj, pKeyFields){
	var grid = commandObj.getParentPanel();
	var dataSource = grid.getDataSource();
    var records = grid.getSelectedRecords();
    
    if(records.length <= 0){
    	View.showMessage(getMessage('errorSelectRecords'));
    	return false;
    }

	View.confirm(getMessage('confirmDelete'), function(button){
        if (button == 'yes') {
        	try{
	        	for( var i = 0; i < records.length; i++){
	    			var rec = records[i];
	    			
	    			var pKeyRec = new Ab.data.Record(null, false);
	    			for ( var j = 0; j < pKeyFields.length; j++) {
						var pKeyField = pKeyFields[j];
						pKeyRec.setValue(pKeyField, rec.getValue(pKeyField));
					}
	    			
	    			dataSource.deleteRecord(pKeyRec);
	    		}
	        	grid.refresh();
	        }catch(e){
	    		Workflow.handleError(e);
	    		return false;
	    	}
        }
    });
}

/**
 * Notify employee about event change.
 * @param type notification type
 * @param category notification category
 * @param primaryKey primary key object
 * @param newDates new dates
 * @param oldDates old dates
 * @param callback callback method
 */
function notifyEmployee(type, category, primaryKey, newValues, oldValues, callback){
	if (requireNotification(category, newValues)) {
		try{
			var result  = Workflow.callMethod('AbRiskEHS-EHSService-notifyEmployee', type, category, primaryKey, newValues, oldValues);
			if (result.code == 'executed') {
		    	if(valueExists(callback)){
		    		callback.call();
		    	}
			}
		} catch (e) {
			Workflow.handleError(e);
		}
	}
}

/**
 * Check is incident type require notification.
 * @param category notification category
 * @param newValues new values map
 */
function requireNotification(category, newValues) {
	var result = true;
	if (category === 'Incident') {
		var dataSource = View.dataSources.get('abEhsCommonEhsIncidentTypes_ds');
		// the incident might already be deleted, so we search directly the incident type
		//var incidentId = primaryKey['ehs_incidents.incident_id'];
		//var restriction = "EXISTS(SELECT ehs_incidents.incident_id FROM ehs_incidents WHERE ehs_incidents.incident_id = "+ incidentId +" AND ehs_incidents.incident_type = ehs_incident_types.incident_type )";
		var incidentTypeRec = dataSource.getRecord(new Ab.view.Restriction({"ehs_incident_types.incident_type": newValues['incident_type']}));
		result = (valueExistsNotEmpty(incidentTypeRec.getValue("ehs_incident_types.notification")) && parseInt(incidentTypeRec.getValue("ehs_incident_types.notification")) == 1);
	}
	return result;
}

/**
 * Prepare field values for incident notifications
 * 
 * @param controllerId controller id
 * @param formId edit form id
 */
function prepareIncidentNotificationValues(controllerId, formId){
	var objController = View.controllers.get(controllerId);
	var objEditForm = View.panels.get(formId);
	
	var frmNewValues = objEditForm.getFieldValues();
	var frmOldValues = objEditForm.getOldFieldValues();
	
	var newValues = {};
	var oldValues = {};
	var fields = new Array("incident_id", "date_incident", "incident_type", "injury_category_id",
			"site_id", "pr_id", "bl_id", "fl_id", "rm_id", "description", "safety_officer");
	var isValueChanged = false;
	
	for (var i = 0; i < fields.length; i++) {
		var field = fields[i];
		var crtNewValue = frmNewValues["ehs_incidents." + field];
		var crtOldValue = frmOldValues["ehs_incidents." + field];
		newValues[field] = (valueExistsNotEmpty(crtNewValue)? crtNewValue: "");
		oldValues[field] = (valueExistsNotEmpty(crtOldValue)? crtOldValue: "");
		isValueChanged = (isValueChanged || (newValues[field] != oldValues[field])); 
	}
	
	objController.isNotificationRequired = true;
	objController.newValues = newValues;
	objController.oldValues = oldValues;
	
	if (objController.notificationType == "Update" && !isValueChanged) {
		objController.isNotificationRequired =  false;
		objController.newValues = null;
		objController.oldValues = null;
	}
}

/**
 * Custom 'selectValue' action used by fields: incident_id. 
 * Sets as restriction the selected em_id, if setEmRestriction = true
 * 
 * @param destForm destination form ID
 * @param destTable destination table name for the incident_id field
 * @param setEmRestriction Set as restriction the form's employee? true/false
 */
function selectIncidentId(destForm, destTable, setEmRestriction) {
	var destFieldId = destTable + ".incident_id";
	var emId = "";
	var restriction = null;
	
	if(setEmRestriction){
		emId = View.panels.get(destForm).getFieldValue(destTable + ".em_id");
		restriction = "ehs_incidents.em_id_affected = ${sql.literal('" + emId + "')}";
	}

	var title = View.panels.get(destForm).fields.get(destFieldId).fieldDef.title;
	
	View.selectValue(destForm, title, [destFieldId],
			'ehs_incidents', 
			['ehs_incidents.incident_id'],
			['ehs_incidents.incident_id', 'ehs_incidents.incident_type', 'ehs_incidents.date_incident', 'ehs_incidents.description', 'ehs_incidents.em_id_affected'],
			restriction);
}

/**
 * Checks if the selected employee exists
 * If not, displays error message and return false.
 */

function validateEmId(emId){
	var isValid = true;
	emId = emId.toUpperCase();

	var emDs = View.dataSources.get('abEhsCommon_ds_em');
	var records = emDs.getRecords({'em.em_id': emId}).length;
	if(records == 0){
		View.showMessage(getMessage("selectValidEmployee"));
		isValid = false;
	}
	return isValid;
}

/**
 * Create incident redline.
 * @param incidentId incident code
 * @param blId building code
 * @param flId floor code
 * @param callbackFunction callback function
 */
function createIncidentRedline(incidentId, siteId, prId, blId, flId, callbackFunction){
	View.openDialog('ab-ehs-redlines-by-location.axvw', null, false, {
		width: 1024,
		height: 800,
		incidentId: incidentId,
		siteId: siteId,
		prId: prId,
		blId: blId,
		flId: flId,
		callback: function(newSiteId, newPrId, newBlId, newFlId, newRmId, message) {
	    	if(valueExists(callbackFunction)){
	    		callbackFunction(newSiteId, newPrId, newBlId, newFlId, newRmId, message);
	    	}
		}
	});
}

/**
 * Disable Date End if Restriction Type is Permanent.
 * @param formId id of the form panel
 */
function enableDisableRestrictionDateEnd(formId){
	var form = View.panels.get(formId);
	
	var restrictionTypeId = form.getFieldValue("ehs_restrictions.restriction_type_id");
	if(restrictionTypeId == "Permanent"){
		form.enableField("ehs_restrictions.date_end", false);
		form.fields.get("ehs_restrictions.date_end").clear();
	} else {
		form.enableField("ehs_restrictions.date_end", true);
	}
}

function validateWorkRestrictionForm(formId) {
	var form = View.panels.get(formId);
	var dateStart =  form.getFieldValue("ehs_restrictions.date_start");
	var dateEnd =  form.getFieldValue("ehs_restrictions.date_end");
	if (valueExistsNotEmpty(dateStart) && valueExistsNotEmpty(dateEnd)) {
		var objDateStart = form.getDataSource().parseValue("ehs_restrictions.date_start", dateStart, false);
		var objDateEnd = form.getDataSource().parseValue("ehs_restrictions.date_end", dateEnd, false);
		if (objDateStart > objDateEnd) {
			View.showMessage(getMessage("errDateStartEnd"));
			return false;
		}
	}
	
	// workaround for Date fields core error on date format
	form.getFieldElement('ehs_restrictions.date_actual').onchange();
	
	return true;
}

/**
 * Custom 'selectValue' action used by fields: medical_monitoring_id. 
 * Add to restriction selected em_id.
 */
function selectMedMonIdForWorkRestriction(formId, monitoringType) {
	var formPanel = View.panels.get(formId);
	var emId = formPanel.getFieldValue('ehs_restrictions.em_id');
	var restriction = "ehs_medical_mon_results.em_id = ${sql.literal('" + emId + "')}";
	var title = formPanel.fields.get("ehs_restrictions.medical_monitoring_id").fieldDef.title;
	
	if(valueExistsNotEmpty(monitoringType)){
		restriction += " AND ehs_medical_mon_results.monitoring_type = '" + monitoringType + "'";
	}
	
	View.selectValue(formId, title,
			['ehs_restrictions.medical_monitoring_id', 'ehs_restrictions.date_actual'],
			'ehs_medical_mon_results', 
			['ehs_medical_mon_results.medical_monitoring_id','ehs_medical_mon_results.date_actual'],
			['ehs_medical_mon_results.medical_monitoring_id','ehs_medical_mon_results.date_actual', 'ehs_medical_mon_results.monitoring_type',
			 'ehs_medical_monitoring.description', 'ehs_medical_mon_results.comments', 'ehs_medical_mon_results.status'],
			 restriction,
			 null,
			 false);
}
