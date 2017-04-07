/**
 * Custom methods for JS Array object
 * getIndexOf(element) - get index of specified element
 * remove(element) - remove specified element from array
 */
Array.prototype.getIndexOf = function(el){for(var i=0;i<this.length;i++)if(this[i]==el)return i;return -1;}
Array.prototype.remove = function(el){var i = this.getIndexOf(el); if(i != -1){this.splice(i, 1);}}

/**
 * Compare two dates and show error message 
 * 
 * @param objPanel panel object
 * @param dateStart start date field id or alias
 * @param dateEnd end date field id or alias
 * @param op compare operator (>, >=, <, <=)
 * @param message error message
 * 
 * @returns boolean true/false
 */
function compareDates(objPanel, dateStart, dateEnd, message, op){
	var objDs = objPanel.getDataSource();
	var strDateStart  = objPanel.getFieldValue(dateStart);
	var strDateEnd = objPanel.getFieldValue(dateEnd);
	var fldDateStart = objPanel.fields.get(dateStart);
	var fldDateEnd = objPanel.fields.get(dateEnd);
	if(valueExistsNotEmpty(strDateStart) && valueExistsNotEmpty(strDateEnd)){
		var objDateStart = objDs.parseValue(fldDateStart.getFullName(), strDateStart, false);
		var objDateEnd = objDs.parseValue(fldDateEnd.getFullName(), strDateEnd, false);
		if((objDateStart >= objDateEnd && op == "<")
				||(objDateStart > objDateEnd && op == "<=")
				|| (objDateStart <= objDateEnd && op == ">")
				|| (objDateStart < objDateEnd && op == ">="))
		{
			var displayedMessage = getMessage(message);
			displayedMessage = displayedMessage.replace('{0}', '['+ fldDateStart.fieldDef.title +']');
			displayedMessage = displayedMessage.replace('{1}', '['+ fldDateEnd.fieldDef.title +']');
			objPanel.validationResult.valid = false;
			objPanel.validationResult.message = displayedMessage;
			objPanel.validationResult.invalidFields[dateStart] = "";
			objPanel.validationResult.invalidFields[dateEnd] = "";
			objPanel.displayValidationResult();
			//View.showMessage(displayedMessage);
			return false;
		}
	}
	return true;
}

/**
 * Get field value for selected grid rows.
 * @param objGrid
 * @param field
 * 
 * @returns array with selected field values
 */
function getFieldValueForSelectedRows(objGrid, field){
	var result = [];
	var rows = objGrid.getSelectedRows();
	for(var i = 0; i < rows.length; i++){
		var row = rows[i];
		var value = row[field];
		result.push(value);
	}
	return result;
}

/**
 * Get task mode restriction.
 * 
 * @param taskMode: Required. Task mode type, valid values: "manager", "assessor", "worker"
 * @param type: Optional. Restriction type: sql string or Ab.view.Restriction object, valid values "sql", "object". Default "object"
 */
function getTaskModeRestriction(taskMode, type){
	if(!valueExists(type)){
		type = "";
	}

	var result;
	if(type == "sql"){
		if(taskMode ==  "worker"){
			result = "(activity_log.assigned_to = '${user.employee.id}' OR activity_log.assessed_by = '${user.name}' OR activity_log.hcm_abate_by = '${user.employee.id}')";
		} else if(taskMode ==  "assessor"){
			result = "(activity_log.assigned_to = '${user.employee.id}' OR activity_log.assessed_by = '${user.name}' OR activity_log.hcm_abate_by = '${user.employee.id}')";
		}
	}else {
		
		if(taskMode ==  "worker"){
			result  = new Ab.view.Restriction();
			result.addClause('activity_log.assigned_to', '${user.employee.id}', '=', ')AND(');
			result.addClause('activity_log.assessed_by', '${user.name}', '=', 'OR');
			result.addClause('activity_log.hcm_abate_by', '${user.employee.id}', '=', 'OR');
		} else if(taskMode ==  "assessor"){
			result  = new Ab.view.Restriction();
			result.addClause('activity_log.assigned_to', '${user.employee.id}', '=', ')AND(');
			result.addClause('activity_log.assessed_by', '${user.name}', '=', 'OR');
			result.addClause('activity_log.hcm_abate_by', '${user.employee.id}', '=', 'OR');
		}
	}
	return result;
}

/**
 * Get project and  problem type restriction.
 * 
 * @param panel: Required. Project list panel
 * @param allowNullProbType: Optional. Specify if allow search for null problem type of just for selected problem type. Default false.
 * @param type: Optional. Restriction type: sql string or Ab.view.Restriction object, valid values "sql", "object". Default is "object".
 * 
 * @returns restriction
 */
function getProjectRestriction(panel, allowNullProbType, type){
	if(valueExists(allowNullProbType) && allowNullProbType.constructor == String){
		type = allowNullProbType;
		allowNullProbType = false;
	}
	if(!valueExists(allowNullProbType)){
		allowNullProbType = false;
	}
	if(!valueExists(type)){
		type = "";
	}
	// always read current selected project
	var result = "";
	if(valueExists(panel) && panel.type == "grid"){
		var selectedRows = panel.getSelectedRows();
		if(selectedRows.length == 1){
			var row = selectedRows[0];
			if (type == "sql"){
				result += "activity_log.project_id = '" + row['project.project_id'] + "' ";
				result += "AND ( activity_log.prob_type = '" + row['project.prob_type'] + "' ";
				if (allowNullProbType){
					result += "OR  activity_log.prob_type IS NULL ";
				}
				result += ") "
			}else{
				result =  new Ab.view.Restriction();
				result.addClause("activity_log.project_id", row['project.project_id'], "=", ')AND(');
				if(allowNullProbType){
					result.addClause("activity_log.prob_type", row['project.prob_type'], "=", ")AND(");
					result.addClause("activity_log.prob_type", '', "IS NULL", "OR");
				}else{
					result.addClause("activity_log.prob_type", row['project.prob_type'], "=", ")AND(");
				}
			}
		}
	}
	return result;
}

/**
 * Get project, problem type and task mode restriction.
 * 
 * @param panel: Required. Project list panel
 * @param taskMode: Required. Task mode type, valid values: "manager", "assessor", "worker"
 * @param allowNullProbType: Optional. Specify if allow search for null problem type of just for selected problem type. Default false
 * @param type: Optional. Restriction type: sql string or Ab.view.Restriction object, valid values "sql", "object". Default "object"
 * 
 * @returns restriction
 */
function getProjectTaskRestriction(panel, taskMode, allowNullProbType, type){
	// check arguments
	if(valueExists(allowNullProbType) && allowNullProbType.constructor == String){
		type = allowNullProbType;
		allowNullProbType = false;
	}
	if(!valueExists(allowNullProbType)){
		allowNullProbType = false;
	}
	if(!valueExists(type)){
		type = "";
	}
	// task mode is always present we read this first
	var restrTask = getTaskModeRestriction(taskMode, type);
	// get project restriction is panel exists
	var restrPrj = getProjectRestriction(panel, allowNullProbType, type);
	var result = "";
	if(type == "sql"){
		if (valueExists(restrTask) && restrTask.length > 0){
			result += restrTask;
		}
		if (valueExists(restrPrj) && restrPrj.length > 0){
			result += (result.length > 0?" AND ":"")+ restrPrj;
		}
	}else{
		result = new Ab.view.Restriction();
		if (valueExists(restrTask) && restrTask.clauses.length > 0){
			result.addClauses(restrTask, false, true);
		}
		if (valueExists(restrPrj) && restrPrj.clauses.length > 0){
			result.addClauses(restrPrj, false, true);
		}
	}
	return result;
}

/**
 * Create Service request event handler.
 * 
 * @param opener  opener view
 * @param type  item type assessment/action
 * @param projectId selected project id
 * @param probType probType of selected project
 * @param rows selected grid rows
 * @param callbackMethod callback function
 */
function onCreateServiceRequest(opener, pageMode, taskMode, projectId, probType, rows, pKeys, callbackMethod){
	// we must check if site is defined for all rows
	var isSiteId = true;
	for(var i = 0; i < rows.length; i++){
		var row =  rows[i];
		if(!valueExistsNotEmpty(row['activity_log.site_id'])){
			isSiteId = false;
			break;
		}
	}
	if(!isSiteId){
		View.showMessage(getMessage("siteCodeMandatToCreateServReq"));
		return false;
	}
	
	var cleanBuildingParameters = {
			type: pageMode,
			taskMode: taskMode,
			projectId: projectId,
			probType: probType,
			rows: rows,
			pKeys: pKeys,
			title: getMessage('titleServiceRequestView')
	};

	opener.openDialog('ab-cb-request-create.axvw', null, true, { 
		cleanBuildingParameters: cleanBuildingParameters,
		callback: function() {
			if(typeof callbackMethod == 'function'){
				callbackMethod();
			}
		}
	});
}

/**
 * Select specified grid rows.
 * 
 * @param grid grid panel
 * @param pKeys array with selected lines
 * @param fieldName pkey field name
 */
function selectGridRows(grid, pKeys, fieldName){
	
	if (typeof(pKeys) === 'object' && pKeys instanceof Array && pKeys.length > 0){
		// prepare a map
		var pKeyMap =  arrayToMap(pKeys);
		grid.gridRows.each(function(row){
			var value  = row.getFieldValue(fieldName);
			if(pKeyMap[value]){
				row.select(true);
			}
		});
		// check select all status
		var selectedRows = grid.getSelectedGridRows();
	    if(selectedRows.length === grid.gridRows.length){
			var checkAllEl = Ext.get(grid.id + '_checkAll');
			if (valueExists(checkAllEl)) {
				checkAllEl.dom.checked = true;
			}
	    }
	}
}

/**
 * Convert an array to 'map' object.
 * 
 * @param values
 * @returns 'map' object
 */
function arrayToMap(values){
	var map = {};
	if (typeof(values) === 'object' && values instanceof Array && values.length > 0){
		for (var i = 0; i < values.length; i++){
			map[values[i]] = values[i];
		}
	}
	return map;	
}

/**
 * Get radio button value.
 * @param name radio button name
 */
function getRadioValue(name){
	
	var objRadio = document.getElementsByName(name);
	if(objRadio){
		for( var i = 0; i < objRadio.length; i++ ){
			var optRadio = objRadio[i];
			if(optRadio.checked){
				return optRadio.value;
			}
		}
	}
	return "";
}

/**
 * Set problem type value to current panel in hidden field.
 * 
 * @param context
 *
 * NOT USED!??
function setProblemTypeValue(ctx, field, probTypeField){
	var panel = ctx.getParentPanel();
	var probTypeValue;
	if(valueExists(probTypeField)){
		probTypeValue = panel.getFieldValue(probTypeField);
	}else{
		var prjController = null;
		if (View.controllers.get('abCbProjectCtrl')){
			prjController = View.controllers.get('abCbProjectCtrl');
		}else if (View.getView('parent').controllers.get('abCbProjectCtrl')){
			prjController = View.getView('parent').controllers.get('abCbProjectCtrl');
		}else {
			return false;
		}
		var dataRow = prjController.getSelectedData();
		if(dataRow){
			probTypeValue = dataRow['project.prob_type'];
		}else{
			return false;
		}
	}
	var action = panel.fields.get(field).actions.get('selectValue_'+panel.id+'_'+field);
	for(var i=0; i < action.config.commands.length; i++){
		var configCommand = action.config.commands[i];
		var cmdCommand = action.command.commands[i];
		if (configCommand.type == "selectValue"){
			configCommand.restriction = "(prob_type = '"+ probTypeValue +"' OR prob_type IS NULL)";
			cmdCommand.restriction = "(prob_type = '"+ probTypeValue +"' OR prob_type IS NULL)";
			cmdCommand.dialogRestriction = "(prob_type = '"+ probTypeValue +"' OR prob_type IS NULL)";
		}
	}
}
*/
/**
 * Get activity parameter value.
 * 
 * @param activityId activity id
 * @param paramId parameter id
 */
function getActivityParameter(activityId, paramId){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('afm_activity_params.activity_id', activityId, '=');
	restriction.addClause('afm_activity_params.param_id', paramId, '=');
	var paramValue = "";
    var parameters = {
            tableName: 'afm_activity_params',
            fieldNames: toJSON(['afm_activity_params.activity_id', 'afm_activity_params.param_id', 'afm_activity_params.param_value']),
            restriction: toJSON(restriction)
        };
	try{
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if(result.code == "executed" && result.data.records.length > 0){
			paramValue = result.data.records[0]['afm_activity_params.param_value'];
		}
		return paramValue;
	}catch (e){
		Workflow.handleError(e);
		return false;
	}
}

/**
 * Check if selected buildings match selected sites.
 * 
 * @param site_id
 * @param bl_id
 */
function validateSiteAndBldg(site_id, bl_id){
	var message = 'no_match_bl_site';
	if(valueExistsNotEmpty(bl_id) && valueExistsNotEmpty(site_id)){
		var blIds;
		if(bl_id.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0){
			message = 'no_match_bl_site_multiple';
			blIds = bl_id.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
		}else{
			blIds = [];
			blIds.push(bl_id);
		}
		var siteIds;
		if(site_id.indexOf(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR) > 0){
			siteIds = site_id.split(Ab.form.Form.MULTIPLE_VALUES_SEPARATOR);
		}else{
			siteIds = [];
			siteIds.push(site_id);
		}
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', blIds, 'IN');
		restriction.addClause('bl.site_id', siteIds, 'IN');
		
		var parameters = {
			tableName: 'bl',
	        fieldNames: toJSON(['bl.bl_id', 'bl.site_id']),
	        restriction: toJSON(restriction)
		};
	    try {
	        var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
	        if (result.data.records.length != blIds.length){
				View.showMessage(getMessage(message));
				return false;
			}
	    } catch (e) {
	        Workflow.handleError(e);
			return false;
	    }
	}
	return true;
}

/**
 * Replace priority numeric value with text value.
 * @param panel grid control
 * @param fldName field name
 * @param fldConfig field config
 */
function setPriorityValue(panel, fldName, fldConfig){
	panel.gridRows.each(function(row){
		var crtValue = row.getFieldValue(fldName);
		if(valueExistsNotEmpty(crtValue)){
			/*
			 * row.setFieldValue(fldName, getMessage("optPriority_"+crtValue));
			 * Change only the display, not the value of the field
			 */
			row.cells.get(fldName).dom.firstChild.data = getMessage("optPriority_"+crtValue);
		}
	});
}

/**
 * Initialize site and building from the project
 * 
 * @param projectId
 * @param form
 * @param tableName table name for site and building fields
 */
function initFormFromProject(projectId, form, tableName){
	var table = tableName ? tableName : "activity_log";
	var restriction = new Ab.view.Restriction();
	restriction.addClause('project.project_id', projectId, '=');
	
	var parameters = {
            tableName: 'project',
            fieldNames: toJSON(['project.site_id', 'project.bl_id']),
            restriction: toJSON(restriction)
        };
	
	try{
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if(result.code == "executed" && result.data.records.length > 0){
			var record = result.data.records[0];
			form.setFieldValue(table + ".site_id", record['project.site_id']);
			form.setFieldValue(table + ".bl_id", record['project.bl_id']);
		}
	}catch (e){
		Workflow.handleError(e);
	}
}

