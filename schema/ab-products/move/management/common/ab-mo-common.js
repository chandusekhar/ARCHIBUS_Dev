
function createCheckbox_vacant_rooms(form, indivGroup, procId, taskId) {
	if(!form)
		return;
		
	var mo_type = form.getFieldValue("mo.mo_type");
	
	if(mo_type == "Leaving") {
		return;
	}
	
	var tdNode = form.getFieldElement("mo.to_rm_id").parentNode;
	
	var inputNode = document.createElement("input");
	inputNode.setAttribute("type", "checkbox");
	inputNode.setAttribute("id", "vacant_rooms");
	inputNode.setAttribute("name", "vacant_rooms");
	if(indivGroup == "individual") {
		if(procId == DC || procId == VC || taskId == RMFA) {
			inputNode.setAttribute("disabled", true);
		}
	}

	var spanNode = document.createElement("span");
    spanNode.appendChild(document.createTextNode(getMessage("vacantOnly")));
	
	tdNode.appendChild(inputNode);
	tdNode.appendChild(spanNode);
}

function checkVacancyRoomsButton(form_name, bl_fieldName, fl_fieldName, vacancyRoomsButtonName)
{
	var objForm = View.panels.get(form_name);
	if(!objForm)
		return;
	
	var obj_bl_id = objForm.fields.get(bl_fieldName);
	var obj_fl_id = objForm.fields.get(fl_fieldName);
	
	if (!obj_bl_id || !obj_fl_id)
		return;
		
	var obj_vacancyRoomsButton = obj_fl_id.actions.get(vacancyRoomsButtonName);

	if (!obj_vacancyRoomsButton)
		return;

	var str_bl_id = objForm.getFieldValue(bl_fieldName);
	var str_fl_id = objForm.getFieldValue(fl_fieldName);

	if(str_bl_id!="" && str_fl_id!="") {
		obj_vacancyRoomsButton.enable(true);
	}
	else {
		obj_vacancyRoomsButton.enable(false);
	}
}

/*
 * enable/ disable show drawing button
 */
function afterSelectVal(fieldName, selectedValue, previousValue){
	if (fieldName == 'mo.to_fl_id' || fieldName == 'mo.to_rm_id' ) {
		setDrawingButton(View.getMainPanel(), selectedValue);
	}
}

//onchange event listener for floor field
//formPanel - panel which has the drawing button

function setDrawingButton(formPanel, value){
    if ((value != undefined && valueExistsNotEmpty(value)) || (value == undefined && valueExistsNotEmpty(formPanel.getFieldValue('mo.to_fl_id')))) {
		formPanel.fields.get('mo.to_fl_id').actions.get('showDrawing').enable(true);
		}
    else {
		formPanel.fields.get('mo.to_fl_id').actions.get('showDrawing').enable(false);
	}
}

function openSelectValueDrawing(commandObject){
    View.openDialog('ab-mo-edit-moves-select-value-drawing.axvw', null, false, {
        width: 1000,
        height: 600,
        closeButton: false,
		openerPanel:commandObject.getParentPanel(),
		vacantOnly: getOccupiableVacantRmRest(commandObject.getParentPanel())
    });
}

function selectRoomWithVacantCheck(commandObject)
{
	var panel = commandObject.getParentPanel();
	
	var strRest = "";
	var strRestVacant = getOccupiableVacantRmRest(panel);
	var blVal = panel.getFieldValue('mo.to_bl_id');
	var flVal = panel.getFieldValue('mo.to_fl_id');

	if (blVal != "") {
		strRest = "rm.bl_id= '" + blVal + "'";
		if (flVal != "") {
			strRest += " AND rm.fl_id= '" + flVal + "'";
		}
	}

	if(strRestVacant != "")
		strRest += (strRest != "" ? " AND " : "") + strRestVacant;
	
    View.selectValue(panel.id, getMessage('selectToRoomMessage'),
					['mo.to_bl_id','mo.to_fl_id','mo.to_rm_id'], 'rm',
					['rm.bl_id','rm.fl_id','rm.rm_id'], ['rm.bl_id','rm.fl_id','rm.rm_id','rm.rm_type'],
					strRest, 'afterSelectVal');
}

function getOccupiableVacantRmRest(panel)
{
	var vacantRoomCheckbox = document.getElementById("vacant_rooms");
	var moType = panel.getFieldValue("mo.mo_type"); 
	var occupiable = "(rm.rm_cat IS NULL OR EXISTS (SELECT 1 FROM rmcat WHERE rm.rm_cat = rmcat.rm_cat AND rmcat.occupiable=1 AND rmcat.used_in_calcs IN('all_totals', 'dp_comn_ocup_totals')))";
	var restriction = "";
	
	if(moType == "Employee" || moType == "New Hire") {
		restriction = occupiable;
	}

	if (vacantRoomCheckbox && vacantRoomCheckbox.checked) {
		var vacant = "(rm.cap_em > (SELECT COUNT(*) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id))";

		if(valueExistsNotEmpty(panel.getFieldValue("mo.project_id"))){
			var project_id = panel.getFieldValue("mo.project_id");
			project_id = project_id.replace(/\'/g, "''");
			vacant = "(rm.cap_em > (SELECT COUNT(*) FROM mo WHERE mo.to_bl_id=rm.bl_id AND mo.to_fl_id=rm.fl_id AND mo.to_rm_id=rm.rm_id AND mo.mo_type IN ('Employee','New Hire') AND mo.project_id = '" + project_id + "') + (SELECT COUNT(*) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id))";
		}

		restriction = occupiable + " AND " + vacant;
	}
		
	return restriction;
}

/**
 * used for paginated report as command function 
 * 
 * @param {Object} type - values 'group', 'single', 'scenario' 
 * @param {Object} commandObject
 */
function onPaginatedReport(type, commandObject){
	var panel = commandObject.getParentPanel();
	var projectId = "";
	var moveId = "";
	
	if(type == 'group'){
		projectId = panel.getFieldValue('project.project_id');
	}else if(type == 'single'){
		moveId = panel.getFieldValue('mo.mo_id');
	}else if(type == 'scenario'){
		var isAssigned = false;
		panel.gridRows.each(function(row){
			if(valueExistsNotEmpty(row.getRecord().getValue('mo_scenario_em.to_rm_id'))){
				isAssigned = true;
			}
		});
		if(panel.gridRows.length > 0 && isAssigned){
			var row = panel.gridRows.get(0);
			moveId = row.getRecord().getValue('mo_scenario_em.scenario_id');
			projectId = row.getRecord().getValue('mo_scenario_em.project_id');
		}else{
			View.showMessage(getMessage('error_no_data_rpt'));
			return;
		}
	}
	
	var result = Workflow.callMethod('AbMoveManagement-MoveService-onPaginatedReport', type, projectId, moveId);

    if (valueExists(result.jsonExpression) && result.jsonExpression != '') {
		result.data = eval('(' + result.jsonExpression + ')');
		var jobId = result.data.jobId;
		var url = 'ab-paginated-report-job.axvw?jobId=' + jobId;
		View.openDialog(url);
	}
}

/**
 * synchronize space transaction Service request status
 * 
 * @param {String}
 *            formId - form Id
 */
function synchronizeSpaceTransactionStatus(formId) {
	var form = View.panels.get(formId);
	var moId = form.getFieldValue('mo.mo_id');
	try {
		Workflow.callMethod('AbMoveManagement-MoveService-updateAssociatedServiceRequestStatus', 'mo', moId);
	} catch (e) {
		Workflow.handleError(e);
		return false;
	}

	return true;
}
