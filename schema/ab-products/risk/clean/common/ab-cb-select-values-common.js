/**
 * Contains select values with custom restriction
 */

var genericController = View.createController('genericController', {
	// register events
	afterViewLoad: function(){
		// register onMultipleSelectionChange for custom panels
		var objHazardPanel = View.panels.get('abCbHazardId_list'); 
		if (objHazardPanel) {
			objHazardPanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [objHazardPanel]));
		}
		var objActionPanel = View.panels.get('abCbActionId_list'); 
		if (objActionPanel) {
			objActionPanel.addEventListener('onMultipleSelectionChange', onMultipleSelectionChange.createDelegate(this, [objActionPanel]));
		}
	}
})


/**
 * Open custom select value panel for hazard id.
 * @param formId
 * @param fieldName
 * @param taskMode
 * @param projectId
 * @param projProbType
 */
function selectValue_HazardId(formId, fieldName, taskMode, projectId, projProbType){
	var targetPanelId = "abCbHazardId_list";
	var targetFieldId = "activity_log.activity_log_id";
	var popUpConfig = {width: 1024, height: 800};
	
	var restriction = "";
	var taskModeRestr = "";
	if(taskMode == "assessor" || taskMode == "worker"){
		restriction += "AND ( activity_log.assessed_by = ${sql.literal(user.name)}  OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) ";
		restriction += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})) ";
	}
	
	if(valueExists(projectId)){
		if(typeof(projectId) === 'object' && projectId instanceof Array){
			restriction += "AND activity_log.project_id IN ('" + projectId.join("','") + "') ";
		}else{
			restriction += "AND activity_log.project_id = ${sql.literal('" + projectId + "')} ";
		}
	}
	
	if (formId == "abCbActItemsCommlogFilter"){
		restriction += "AND EXISTS(SELECT 1 FROM ls_comm WHERE ls_comm.activity_log_id = activity_log.activity_log_id)";
	}else if (formId == "abCbActItemsActionFilter" || formId == "abCbRptActSummary_panelFilter"){
		if(taskMode == "assessor" || taskMode == "worker"){
			taskModeRestr = "AND ( a.assessed_by = ${sql.literal(user.name)}  OR a.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) ";
			taskModeRestr += "OR a.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}))";
		}
		restriction += "AND EXISTS(SELECT a.activity_log_id FROM activity_log a WHERE a.activity_type LIKE 'HAZMAT -%' ";
		restriction += "AND a.assessment_id = activity_log.activity_log_id AND a.project_id = activity_log.project_id " + taskModeRestr +" )";
	}else if(formId == "abCbActivityReqFilter"){
		if(taskMode == "assessor" || taskMode == "worker"){
			taskModeRestr = "AND (a.supervisor = ${sql.literal(user.employee.id)}";
			taskModeRestr += "OR (a.supervisor IS NULL AND NOT a.work_team_id IS NULL AND a.work_team_id IN (SELECT work_team_id FROM cf WHERE email = '${user.email}')))";
		}
		restriction += "AND EXISTS(SELECT a.activity_log_id FROM activity_log a WHERE a.activity_type = 'SERVICE DESK - MAINTENANCE' ";
		restriction += "AND a.assessment_id = activity_log.activity_log_id AND a.project_id = activity_log.project_id " + taskModeRestr +" )";
	}
	
	if(restriction.indexOf("AND") < 2){
		restriction = restriction.slice(restriction.indexOf("AND")+3, restriction.length);
	}
	
	openSelectValue(targetPanelId, targetFieldId, formId, fieldName, popUpConfig, restriction);
	
}

/**
 * Open custom select value panel for action id.
 * @param formId
 * @param fieldName
 * @param taskMode
 * @param projectId
 * @param projProbType
 */
function selectValue_ActionId(formId, fieldName, taskMode, projectId, projProbType, isNewCommLog){
	if(!valueExistsNotEmpty(isNewCommLog)){
		isNewCommLog = false;
	}

	var targetPanelId = "abCbActionId_list";
	var targetFieldId = "activity_log.activity_log_id";
	var popUpConfig = {width: 1024, height: 800};

	var restriction = "";
	if(taskMode == "assessor" || taskMode == "worker"){
		restriction += "AND ( activity_log.assessed_by = ${sql.literal(user.name)}   OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}) ";
		restriction += "OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})) ";
	}
	restriction += "AND activity_log.project_id = '" + projectId + "' ";
	
	if(!isNewCommLog){
		restriction += "AND activity_log.assessment_id IS NULL AND EXISTS(SELECT 1 FROM ls_comm WHERE ls_comm.activity_log_id = activity_log.activity_log_id)";
	}

	if(restriction.indexOf("AND") < 2){
		restriction = restriction.slice(restriction.indexOf("AND")+3, restriction.length);
	}
	
	openSelectValue(targetPanelId, targetFieldId, formId, fieldName, popUpConfig, restriction);
	
}

/**
 * Open select value with a custom panel.
 * 
 * @param targetPanel - panel to be shown
 * @param targetField - field from where to read value
 * @param parentPanel - parent panel
 * @param parentField - field where to save values
 * @param popUpConfig - pop-up configuration
 * @param restriction - restriction (can be sql string or Ab.view.Restriction object )
 * @returns
 */
function openSelectValue(targetPanelId, targetFieldId, parentPanelId, parentFieldId, popUpConfig, restriction){
	if ( !valueExists(restriction) ) {
		restriction = new Ab.view.Restriction();
	}
	// we must customize grid panel
	var objParentPanel = View.panels.get(parentPanelId);
	var objParentField = objParentPanel.fields.get(parentFieldId);
	var isMultipleSelectionEnabled = (valueExists(objParentField.fieldDef.selectValueType) && objParentField.fieldDef.selectValueType == 'multiple');
	// get current saved value;
	var crtValue = objParentPanel.getFieldValue(parentFieldId);
	// get map of values
	var mapValue = getMapFromValue(crtValue);
	var isMultipleValue = (mapValue.length > 1);
	
	// must save current configuration data on grid
	var selectConfig = {
			sourcePanelId: targetPanelId,
			sourceFieldId: targetFieldId,
			targetPanelId: parentPanelId,
			targetFieldId: parentFieldId
	};
	// refresh target panel
	var objTargetPanel = View.panels.get(targetPanelId);
	
	objTargetPanel.refresh(restriction);
	objTargetPanel.selectConfig = selectConfig;

	if ( !isMultipleSelectionEnabled ) {
		// we must hide selection column
		objTargetPanel.multipleSelectionEnabled = false;
		objTargetPanel.showColumn("multipleSelectionColumn", false);
		// we must remove saveSelected and clear
		var saveSelected = objTargetPanel.actions.get("saveSelected");
		if (saveSelected) {
			saveSelected.show(false);
		}
		var clear = objTargetPanel.actions.get("clear");
		if (clear) {
			clear.show(false);
		}
		objTargetPanel.update();
	}
	else {
	  setSelectedValues(objTargetPanel, mapValue);
    }

	objTargetPanel.showInWindow(popUpConfig);
	objTargetPanel.actions.get("saveSelected").forcedDisabled = false;
	objTargetPanel.actions.get("clear").forcedDisabled = false;
	
}

/**
 * Select saved values.
 * @param objTargetPanel
 * @param mapValue
 * @returns
 */
function setSelectedValues(grid, values){
	var sourceField = grid.selectConfig.sourceFieldId;
	if ( values.length > 0 ){
		grid.gridRows.each(function (row) {
			var rowVal = row.getFieldValue(sourceField);
			if (valueExists(values[rowVal])) {
				row.select();
			}
		});
		// check select all button
		var selectedRows = grid.getSelectedGridRows();
	    if(selectedRows.length === grid.gridRows.length){
			var checkAllEl = Ext.get(grid.id + '_checkAll');
			if (valueExists(checkAllEl)) {
				checkAllEl.dom.checked = true;
			}
	    }
		grid.enableAction('saveSelected', true);
		grid.enableAction('clear', true);
	}
}

/**
 * Read current value and return a map with selected values.
 * 
 * @param value
 * @returns map object
 */
function getMapFromValue(value){
	// define an object with length
	var map = {length:0};
	var MULTIPLE_VALUE_SEPARATOR = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
	if ( valueExistsNotEmpty(value) ) {
		while (value.length > 0){
			// get first index of multiple value separator
			var crtPos = value.indexOf(MULTIPLE_VALUE_SEPARATOR);
			if(crtPos == -1){
				crtPos = value.length;
			}
			var tmpVal = value.slice(0, crtPos);
			if(tmpVal.length > 0){
				map[tmpVal] = tmpVal;
				map.length++;
			}
			value = value.slice(crtPos + MULTIPLE_VALUE_SEPARATOR.length);
		}
	}
	return map;
}

/**
 * onMultipleSelectionChange event listener.
 * 
 * @param objGrid
 * @returns
 */
function onMultipleSelectionChange(grid){
	// if multiple selection is enabled 
	if ( grid.multipleSelectionEnabled ){
		// enable /disable save selected button
		var selectedRows = grid.getSelectedGridRows();
		grid.enableAction('saveSelected', selectedRows.length > 0);
		grid.enableAction('clear', selectedRows.length > 0);
		
		// check select all status
	    if(selectedRows.length === grid.gridRows.length){
			var checkAllEl = Ext.get(grid.id + '_checkAll');
			if (valueExists(checkAllEl)) {
				checkAllEl.dom.checked = true;
			}
	    }
	}
}

/**
 * On Clear selected values handler.
 * @returns
 */
function onClearValues(context){
	var grid = context.command.getParentPanel();
	
	var targetPanelId = grid.selectConfig.targetPanelId;
	var targetFieldId = grid.selectConfig.targetFieldId;
	// reset field
	var targetPanel = View.panels.get(targetPanelId);
	targetPanel.fields.get(targetFieldId).clear();
	// close dialog
	if (grid && grid.isShownInWindow()) {
		grid.closeWindow();
	} else {
		var view = View.getOpenerWindow().View;
		if (view != null) {
			view.closeDialog();
		}
	}
	return true;
}

/**
 * Save selected values.
 * 
 * @returns
 */
function onSaveValues(context){
	var grid = context.command.getParentPanel();
	
	var targetPanelId = grid.selectConfig.targetPanelId;
	var targetFieldId = grid.selectConfig.targetFieldId;
	var sourceFieldId= grid.selectConfig.sourceFieldId;
	
	
	var MULTIPLE_VALUE_SEPARATOR = Ab.form.Form.MULTIPLE_VALUES_SEPARATOR;
	
	try{
		var value = '';
		var selRows = grid.getSelectedGridRows();
		if( selRows.length > 0) {
			var map = {};
			for (var i=0; i < selRows.length; i++){
				var row = selRows[i];
				var tmpValue = row.getFieldValue(sourceFieldId);
				if(valueExistsNotEmpty(tmpValue) && !map[tmpValue]){
					value += tmpValue + MULTIPLE_VALUE_SEPARATOR;
				}
			}
			// discard first separator
			if(value.indexOf(MULTIPLE_VALUE_SEPARATOR)== 0){
				value = value.slice(MULTIPLE_VALUE_SEPARATOR.length, value.length);
			}
			// discard the trailing multiple value separator
			if (value.lastIndexOf(MULTIPLE_VALUE_SEPARATOR) == value.length - MULTIPLE_VALUE_SEPARATOR.length) {
				value = value.slice(0, value.length - MULTIPLE_VALUE_SEPARATOR.length);
			}
			
		}else {
			var row = grid.gridRows.get(grid.selectedRowIndex);
			if (row) {
				value = row.getFieldValue(sourceFieldId);
			}
		}
		
		var objTargetPanel = View.panels.get(targetPanelId);
		objTargetPanel.setFieldValue(targetFieldId, value);
		
		// close dialog
		if (grid && grid.isShownInWindow()) {
			grid.closeWindow();
		} else {
			var view = View.getOpenerWindow().View;
			if (view != null) {
				view.closeDialog();
			}
		}
		return true;
	}catch(e){
		return false;
	}
}

/**
 * Get problem type restriction.
 * Handle multiple value case.
 * @param probType
 */
function getProbTypeRestriction(field, probType){
	var restriction = new Ab.view.Restriction();
	if(valueExists(probType)){
		var op = (typeof(probType) === 'object' && probType instanceof Array) ? "IN" : "=";
		restriction.addClause(field, probType, op, ")AND(");
		restriction.addClause(field, '', "IS NULL", "OR");
	}
	
	return restriction;
}

/**
 * Show select value for action items.
 * @param formId form id
 * @param fieldName field full name 
 * @param taskMode current task mode (manager, field assessor or abatement worker)
 * @param projectId selected project id
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_ActionItemID(formId, fieldName, taskMode, projectId, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = new Ab.view.Restriction();
	restriction.addClause("activity_log.activity_type", "HAZMAT -%", "LIKE");
	var restrTask = getTaskModeRestriction(taskMode);
	if (valueExists(restrTask) && restrTask.clauses.length > 0){
		restriction.addClauses(restrTask, false, true);
	}
	if(valueExistsNotEmpty(projectId)){
		restriction.addClause("activity_log.project_id", projectId, "=", ')AND(');
	}
	/**
	 * Do we need this restriction for action items ?
	 * is disabled now.
	 */
	if(valueExists(projProbType) && 1 == 2){
		restriction.addClause("activity_log.prob_type", projProbType, "=", ")AND(");
		restriction.addClause("activity_log.prob_type", '', "IS NULL", "OR");
	}
	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'activity_log',
    	selectFieldNames: ["activity_log.activity_log_id"],
    	visibleFieldNames: ["activity_log.activity_log_id", "activity_log.activity_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select value for hazard location type.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HcmLocTypId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_hcm_loc_typ.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_hcm_loc_typ',
    	selectFieldNames: ["cb_hcm_loc_typ.hcm_loc_typ_id"],
    	visibleFieldNames: ["cb_hcm_loc_typ.hcm_loc_typ_id", "cb_hcm_loc_typ.name", "cb_hcm_loc_typ.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select for user fields that must show records from cb_accredit_person.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_CbAccreditPerson(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_accredit_person.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_accredit_person',
    	selectFieldNames: ["cb_accredit_person.person_id"],
    	visibleFieldNames: ["cb_accredit_person.person_id", "cb_accredit_person.accredit_type_id", "cb_accredit_person.accredit_source_id", "cb_accredit_person.date_accredited", "cb_accredit_person.date_expire"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select hazard status id
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HazardStatusId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_hazard_status.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_hazard_status',
    	selectFieldNames: ["cb_hazard_status.hcm_haz_status_id"],
    	visibleFieldNames: ["cb_hazard_status.hcm_haz_status_id", "cb_hazard_status.name", "cb_hazard_status.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select hazard material code.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HcmId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_hcm.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_hcm',
    	selectFieldNames: ["cb_hcm.hcm_id"],
    	visibleFieldNames: ["cb_hcm.hcm_id", "cb_hcm.name", "cb_hcm.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select hazard rank.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HcmHazRankId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_hazard_rank.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_hazard_rank',
    	selectFieldNames: ["cb_hazard_rank.hcm_haz_rank_id"],
    	visibleFieldNames: ["cb_hazard_rank.hcm_haz_rank_id", "cb_hazard_rank.name", "cb_hazard_rank.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select hazard rating.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HcmHazRatingId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_hazard_rating.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_hazard_rating',
    	selectFieldNames: ["cb_hazard_rating.hcm_haz_rating_id"],
    	visibleFieldNames: ["cb_hazard_rating.hcm_haz_rating_id", "cb_hazard_rating.name", "cb_hazard_rating.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select hazard condition.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HcmCondId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_hcm_cond.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_hcm_cond',
    	selectFieldNames: ["cb_hcm_cond.hcm_cond_id"],
    	visibleFieldNames: ["cb_hcm_cond.hcm_cond_id", "cb_hcm_cond.name", "cb_hcm_cond.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select hazard class id.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HcmClassId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_hcm_class.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_hcm_class',
    	selectFieldNames: ["cb_hcm_class.hcm_class_id"],
    	visibleFieldNames: ["cb_hcm_class.hcm_class_id", "cb_hcm_class.name", "cb_hcm_class.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select laboratory id.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_LabId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("vn.prob_type", projProbType);
	restriction.addClause("vn.vendor_type", "LAB", "=", ")AND(");
	

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'vn',
    	selectFieldNames: ["vn.vn_id"],
    	visibleFieldNames: ["vn.vn_id", "vn.company", "vn.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select Sample composition.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_SampleCompId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_sample_comp.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_sample_comp',
    	selectFieldNames: ["cb_sample_comp.sample_comp_id"],
    	visibleFieldNames: ["cb_sample_comp.sample_comp_id", "cb_sample_comp.name", "cb_sample_comp.prob_type"],
    	actionListener: 'afterSelectSampleCompId',
    	restriction: restriction,
    	selectValueType: selectValueType,
    	sortValues: toJSON([{
			fieldName: "cb_sample_comp.sample_comp_id",
			sortOrder: 1
    	}])
	});
}

/**
 * Refresh CAS Number and Is Hazard fields after selecting sample Composition.
 * @param formId form id
 * @param fieldName field name
 * @param selectedValue selected value
 * @param previousValue previous value
 */
function afterSelectSampleCompIdCommon(formId, fieldName, selectedValue, previousValue){
	var form  = View.panels.get(formId);
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause('cb_sample_comp.sample_comp_id', selectedValue, '=');
	
    var parameters = {
            tableName: 'cb_sample_comp',
            fieldNames: toJSON(['cb_sample_comp.cas_num', 'cb_sample_comp.is_hazard']),
            restriction: toJSON(restriction)
        };
	try{
		var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
		if(result.code == "executed" && result.data.records.length > 0){
			var casNum = result.data.records[0]['cb_sample_comp.cas_num'];
			var isHazard = result.data.records[0]['cb_sample_comp.is_hazard.raw'];
			
			form.setFieldValue('cb_sample_comp.is_hazard',isHazard);
			form.setFieldValue('cb_sample_comp.cas_num',casNum);
		}
	}catch (e){
		Workflow.handleError(e);
		return false;
	}
	
	return true;
}

/**
 * Show select units.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_CbUnitsId(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("cb_units.prob_type", projProbType);

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'cb_units',
    	selectFieldNames: ["cb_units.cb_units_id"],
    	visibleFieldNames: ["cb_units.cb_units_id", "cb_units.name", "cb_units.prob_type"],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}
/**
 * Select value project id.
 * 
 * @param formId
 * @param fieldName
 * @param projProbType
 * @param selectValueType
 * @param currentProjectId Project id to exclude from the selection list; optional
 */
function selectValue_ProjectId(formId, fieldName, projProbType, selectValueType, currentProjectId){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = getProbTypeRestriction("project.prob_type", projProbType);
	restriction.addClause("project.project_type", "ASSESSMENT - HAZMAT", "=", ")AND(");
	if(currentProjectId){
	restriction.addClause("project.project_id", currentProjectId, "!=");
	}

	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'project',
    	selectFieldNames: ["project.project_id"],
    	visibleFields: [
    		    		{fieldName: 'project.project_id'},
    		    		{fieldName: 'project.prob_type', title: getMessage('titleSubstance')},
    		    		{fieldName: 'project.summary'}
    		    		],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * returns the substances of the selected projects
 * from the given projects grid
 */
function getSelectedProbTypes(grid){
	if(!grid)
		return null;
	
	var projProbTypes = null;
	var selectedRecords = grid.getSelectedRecords();
	
	if(selectedRecords.length)
		projProbTypes = [];
	
	for (var i = 0; i < selectedRecords.length; i++) {
		var record = selectedRecords[i];
		projProbTypes.push(record.getValue("project.prob_type"));
	}
	
	return projProbTypes;
}

/**
 * returns the selected projects
 * from the given projects grid
 */
function getSelectedProjects(grid){
	if(!grid)
		return null;
	
	var projects = null;
	var selectedRecords = grid.getSelectedRecords();
	
	if(selectedRecords.length)
		projects = [];
	
	for (var i = 0; i < selectedRecords.length; i++) {
		var record = selectedRecords[i];
		projects.push(record.getValue("project.project_id"));
	}
	
	return projects;
}

/**
 * Open Assessed By select value.
 * @param formId
 * @param fieldName
 */
function selectValue_AssessedBy(formId, fieldName){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	var panel = View.panels.get('abCbAssessedByNew');
	panel.addParameter('activityId', View.taskInfo.activityId);
	panel.addParameter('yes', getMessage('msg_yes'));
	panel.addParameter('no', getMessage('msg_no'));
	panel.addParameter('parentFormId', formId);
	var popUpConfig = {width: 600, height: 400, closeButton: true};
	panel.showInWindow(popUpConfig);
	panel.refresh(null, false, true); // no restriction, not new record, clear restriction
}

/**
 * On select assessor.
 */
function onSelectAssessor(ctx){
	var parentPanel = ctx.command.getParentPanel();
	var assessor = parentPanel.getFieldValue("activity_log.assessed_by");
	if(valueExistsNotEmpty(assessor)){
		var assessedByForm = parentPanel.parameters.assessedByForm;
		var assessedByField = parentPanel.parameters.assessedByField;
		assessedByForm.setFieldValue(assessedByField, assessor);
		parentPanel.closeWindow();
	}else{
		View.showMessage(getMessage("errSelectAssessor"));
	}
}

/**
 * set existing user
 * @param {Object} row
 */
function setExistingUser(row){
	var userName = row['activity_log.assessed_by'];
	var form = View.panels.get('abCbAssessedBy');
	form.setFieldValue('activity_log.assessed_by', userName);
	var grid = View.panels.get('abCbAssessedByExisting');
	grid.closeWindow();
}
/**
 * set new user
 * @param {Object} row
 */
function setNewUser(row){
	var userName = row['afm_userprocs.user_name'];
	var grid = View.panels.get(row.grid.id);
	
	var form = View.panels.get(grid.parameters.parentFormId);
	form.setFieldValue('activity_log.assessed_by', userName);
	grid.closeWindow();
}

/**
 * Show select value Substance.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_Substance(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	
	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	var restriction = null;
	
	if(selectValueType === "hierTree"){
		/* select value with passing config doesn't work with hierTree,
		 * so we call the select value in the old way
		 */

		// create restriction
		restriction = "probtype.prob_class='CB-SUBST'";

		View.selectValue(formId,
				title,
				visibleFieldNames,
				'probtype',
				['probtype.prob_type'],
				['probtype.prob_type', 'probtype.description'],
				restriction,
				null, true, true, null, null, null,
				selectValueType);
	} else {
		// create restriction
		restriction = new Ab.view.Restriction();
		restriction.addClause("probtype.prob_class", "CB-SUBST", "=");

		View.selectValue({
	    	formId: formId,
	    	title: title,
	    	fieldNames: visibleFieldNames,
	    	selectTableName: 'probtype',
	    	selectFieldNames: ["probtype.prob_type"],
	    	visibleFields: [
	    		{fieldName: 'probtype.prob_type', title: getMessage('titleSubstanceCode')},
	    		{fieldName: 'probtype.description', title: getMessage('titleSubstanceDescription')}
	    	],
	    	restriction: restriction,
	    	selectValueType: selectValueType
		});
	}
}

/**
 * Show select value abatement reason.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_AbatementReason(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = new Ab.view.Restriction();
	restriction.addClause("causetyp.cause_type", "CB-%", "LIKE");
	
	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'causetyp',
    	selectFieldNames: ["causetyp.cause_type"],
    	visibleFields: [
    		{fieldName: 'causetyp.cause_type', title: getMessage('titleAbatementReasonCode')},
    		{fieldName: 'causetyp.description', title: getMessage('titleAbatementReasonDescription')}
    	],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}

/**
 * Show select value hazard response.
 * @param formId form id
 * @param fieldName field full name 
 * @param projProbType problem type of selected project
 * @param selectValueType select value type
 */
function selectValue_HazardResponse(formId, fieldName, projProbType, selectValueType){
	var form  = View.panels.get(formId);
	var title = form.fields.get(fieldName).fieldDef.title;
	// create restriction
	var restriction = new Ab.view.Restriction();
	restriction.addClause("repairty.repair_type", "CB-%", "LIKE");
	
	var visibleFieldNames = new Array();
	visibleFieldNames.push(fieldName);
	
	View.selectValue({
    	formId: formId,
    	title: title,
    	fieldNames: visibleFieldNames,
    	selectTableName: 'repairty',
    	selectFieldNames: ["repairty.repair_type"],
    	visibleFields: [
    		{fieldName: 'repairty.repair_type', title: getMessage('titleHazardResponseCode')},
    		{fieldName: 'repairty.description', title: getMessage('titleHazardResponseDescription')}
    	],
    	restriction: restriction,
    	selectValueType: selectValueType
	});
}
