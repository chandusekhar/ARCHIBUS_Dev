var abMoveApproveForm_quest = null;

var abMoveApproveFormCtrl = View.createController('abMoveApproveFormCtrl',{
	afterInitialDataFetch: function(){
		if(this.view.parameters
				&& this.view.parameters["showOnLoad"]
				&& this.view.parameters["showOnLoad"] == true) {
			if (this.panel_abMoveApproveForm) {
				this.panel_abMoveApproveForm.show();
			} else if (this.panel_abMoveExamineForm) {
				this.panel_abMoveExamineForm.show();
				if(this.view.restriction) {
					this.panel_abMoveExamineForm_actions.refresh(this.view.restriction);
				}
			} else if (this.panel_abExamineMoveFormRequestor) {
				this.panel_abExamineMoveFormRequestor.show();
			}
		}
		if(this.view.restriction) {
			showMoveActions(this.view.restriction);
			showEqAndTa(this.view.restriction);
		}
	}
});

function onApproveMove(cmdContext){
	var form = cmdContext.command.getParentPanel();
	var mo_id = form.getFieldValue("mo.mo_id");
	var apprv_mgr1 = form.getFieldValue("mo.apprv_mgr1");
	var apprv_mgr2 = form.getFieldValue("mo.apprv_mgr2");
	var apprv_mgr3 = form.getFieldValue("mo.apprv_mgr3");
	try{
		var result = Workflow.callMethod("AbMoveManagement-MoveService-approveIndividualMove", mo_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
		form.enableButton("approveButton", false);
		form.enableButton("rejectButton", false);
		return true;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}

function onRejectMove(cmdContext){
	var form = cmdContext.command.getParentPanel();
	var mo_id = form.getFieldValue("mo.mo_id");
	var apprv_mgr1 = form.getFieldValue("mo.apprv_mgr1");
	var apprv_mgr2 = form.getFieldValue("mo.apprv_mgr2");
	var apprv_mgr3 = form.getFieldValue("mo.apprv_mgr3");
	try{
		var result = Workflow.callMethod("AbMoveManagement-MoveService-rejectIndividualMove", mo_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);
		form.enableButton("approveButton", false);
		form.enableButton("rejectButton", false);
		return true;
	}catch(e){
		Workflow.handleError(e);
		return false;
	}
}


function abMoveApproveForm_afterRefresh(form){
	var view_status = getMessage('view_status');
	
	if(view_status == 'Approve') {
		showHideFields(form);
		showHideActionButtons(form);
	}

	setLabels(form);
	replaceNewLinesInDivFields(form);
	buildQuestionnaire(form);
	showMoveActions(form.restriction);
	showEqAndTa(form.restriction);
}

function replaceNewLinesInDivFields(form){
	var fields = ['mo.description','mo.comments'];
	
	for(var i=0; i < fields.length; i++) {
		var fieldName = fields[i];
		if (form.fields.get(fieldName)
				&& form.fields.get(fieldName).fieldDef.readOnly
				&& form.getFieldElement(fieldName)
				&& form.getFieldElement(fieldName).nextSibling) {
			if (form.getFieldValue(fieldName) != "") {
				form.getFieldElement(fieldName).nextSibling.innerHTML = form.getFieldValue(fieldName).replace(/\n/g, "<BR/>");
			}
			else {
				// for Firefox we must have a new line in the DIV in order to have the same height as the field's label
				form.getFieldElement(fieldName).nextSibling.innerHTML = "<BR/>";
			}	
			form.getFieldElement(fieldName).nextSibling.style.overflow = "visible";
			form.getFieldElement(fieldName).nextSibling.style.backgroundColor = "white";
			form.getFieldElement(fieldName).nextSibling.style.borderWidth = "0px";
		}
	}
}

function buildQuestionnaire(form){
	var mo_type = form.getFieldValue('mo.mo_type');
	var mo_id = form.getFieldValue('mo.mo_id');
	var mo_status = form.getFieldValue('mo.status');
	
	// set the questionnaire_id
	if (mo_type && mo_id) {
		var questionnaire_id = "Move Order - " + mo_type;
		
		var readOnly = true;

		abMoveApproveForm_quest = new Ab.questionnaire.Quest(questionnaire_id, form.id, readOnly);
	}
}

function setLabels(form) {
	var mo_type = form.getFieldValue('mo.mo_type');
	
	// bug: form.setFieldLabel() sets the label of the FIRST field of the row
	if(mo_type == 'New Hire') {
		setFieldLabel(form, 'mo.em_id', getMessage('newHire'));
	} else if(mo_type == 'Leaving'){
		setFieldLabel(form, 'mo.em_id', getMessage('employeeLeaving'));
	} else if(mo_type == 'Equipment'){
		setFieldLabel(form, 'mo.em_id', getMessage('equipmentToMove'));
	} else if(mo_type == 'Asset'){
		setFieldLabel(form, 'mo.em_id', getMessage('assetToMove'));
	} else if(mo_type == 'Room'){
		setFieldLabel(form, 'mo.em_id', getMessage('roomToMove'));
	} else {
		setFieldLabel(form, 'mo.em_id', getMessage('employeeToMove'));
	}
}

function showHideFields(form) {
	for (var i = 1; i <= 3; i++) {
		form.showField('mo.apprv_mgr' + i, userIsMgrX(form,i));
		form.showField('mo.apprv_mgr' + i + '_status', userIsMgrX(form,i));
		form.showField('mo.date_app_mgr' + i, userIsMgrX(form,i));
	}
	
	form.showField('mo.comments', userIsMgr(form));
}

function showHideActionButtons(form) {
	if (document.getElementById('approveButton') != null) {
		form.showElement('approveButton', userIsMgr(form));
	}
	if (document.getElementById('rejectButton') != null) {
		form.showElement('rejectButton', userIsMgr(form));
		setPreviousSiblingDisplay('rejectButton', userIsMgr(form));
	} 
}

function userIsMgrX(form,mgrNo){
	return (View.user.employee.id == form.getFieldValue('mo.apprv_mgr' + mgrNo))
}

function userIsMgr(form){
	if(userIsMgrX(form,1) && (form.getFieldValue('mo.apprv_mgr1_status') == 'NR')
		|| userIsMgrX(form,2) && (form.getFieldValue('mo.apprv_mgr2_status') == 'NR')
		|| userIsMgrX(form,3) && (form.getFieldValue('mo.apprv_mgr3_status') == 'NR')){
		return true;
	}
	
	return false;
}

function setFieldLabel(form, fieldName, fieldLabel){
	var fieldEl = form.getFieldElement(fieldName);
	if (fieldEl != null) {
		fieldEl.parentNode.previousSibling.innerHTML = fieldLabel;
	}
}

// Function to set the previous sibling element to (not) display
// Used to clean/show the vertical lines between the action buttons 

function setPreviousSiblingDisplay(fieldName, display) {
	field=document.getElementById(fieldName);
	if (field != null && field.parentNode != null && field.parentNode.previousSibling) {
			field.parentNode.previousSibling.style.display = (display == true ? '' : 'none');
	}
}

function showMoveActions(restriction){
	var actionsPanel = View.panels.get("panel_abMoveExamineForm_actions");
	if(actionsPanel)
		actionsPanel.refresh(restriction);
}

function showEqAndTa(restriction){
	var eqPanel = View.panels.get("panel_abMoEditMoAssets_eq");
	if(eqPanel)
		eqPanel.refresh(restriction);
	
	var taPanel = View.panels.get("panel_abMoEditMoAssets_ta");
	if(taPanel)
		taPanel.refresh(restriction);
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
