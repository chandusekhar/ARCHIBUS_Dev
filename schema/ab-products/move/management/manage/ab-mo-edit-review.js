/**
 * from ab-mo-edit.js for 2.0 views
 * TODO: rename it back to "ab-mo-edit.js" after the views conversion to 2.0 is finished
 * 
 * This file goes together with ab-mo-common.js
 * 
 */

var abMoEditReview_quest = null;

// 3-29-10 C. Kriezis Initialize the taskId and procId variables in afterViewLoad function
var taskId;
var procId;
//
var DC = 'Data Coordinator';
var VC = 'Voice Coordinator';
var CM = 'Complete Moves';
var RMFA = 'Route Moves for Approval';
var IM = 'Issue Moves';
var REM = 'Review and Estimate Moves';

var abMoEditReviewController = View.createController('abMoEditReviewCtrl', {
	
	panel: null,
	
    afterViewLoad: function(){
		// 3-29-10 C. Kriezis Added to account for the case the view is called from a Dashboard view and not from the Navigator
		taskId = View.taskInfo.taskId;
		procId = View.taskInfo.processId;
		
		var openingWindow = View.getOpenerWindow();
		if (openingWindow) {
			var viewTitle = openingWindow.getMessage('viewTitle');
			if (((viewTitle == CM) || (viewTitle == RMFA) || (viewTitle == IM) || (viewTitle == REM)) && (taskId != viewTitle)) {
				taskId=viewTitle;
			}
		}
		//
		if (this.panel_abMoEditReviewEm_moForm) {
			if(taskId != RMFA) {
				this.panel_abMoEditReviewEm_moForm.fields.get("mo.apprv_mgr1").fieldDef.required = false;
			}
			
			if(taskId != CM) {
				removeStar(this.panel_abMoEditReviewEm_moForm, "mo.to_bl_id");
				removeStar(this.panel_abMoEditReviewEm_moForm, "mo.to_fl_id");
				removeStar(this.panel_abMoEditReviewEm_moForm, "mo.to_rm_id");
			}
		}
		if (this.panel_abMoEditReviewHire_moForm) {
			if (taskId != RMFA) {
				this.panel_abMoEditReviewHire_moForm.fields.get("mo.apprv_mgr1").fieldDef.required = false;
			}

			if(taskId != CM) {
				removeStar(this.panel_abMoEditReviewHire_moForm, "mo.to_bl_id");
				removeStar(this.panel_abMoEditReviewHire_moForm, "mo.to_fl_id");
				removeStar(this.panel_abMoEditReviewHire_moForm, "mo.to_rm_id");
			}
		}
		if (this.panel_abMoEditReviewLeaving_moForm) {
			if (taskId != RMFA) {
				this.panel_abMoEditReviewLeaving_moForm.fields.get("mo.apprv_mgr1").fieldDef.required = (taskId == RMFA);
			}
			
			if(taskId != CM) {
				removeStar(this.panel_abMoEditReviewLeaving_moForm, "mo.from_bl_id");
				removeStar(this.panel_abMoEditReviewLeaving_moForm, "mo.from_fl_id");
				removeStar(this.panel_abMoEditReviewLeaving_moForm, "mo.from_rm_id");
			}
		}
		if (this.panel_abMoEditReviewRm_moForm) {
			if (taskId != RMFA) {
				this.panel_abMoEditReviewRm_moForm.fields.get("mo.apprv_mgr1").fieldDef.required = false;
			}

			if(taskId != CM) {
				removeStar(this.panel_abMoEditReviewRm_moForm, "mo.to_bl_id");
				removeStar(this.panel_abMoEditReviewRm_moForm, "mo.to_fl_id");
				removeStar(this.panel_abMoEditReviewRm_moForm, "mo.to_rm_id");
			}
		}
		
		// Remove option elements from Status field if from "Review and Estimate Moves"
		setStatusSelect(this.panel_abMoEditReviewEm_moForm);
		setStatusSelect(this.panel_abMoEditReviewHire_moForm);
		setStatusSelect(this.panel_abMoEditReviewLeaving_moForm);
		setStatusSelect(this.panel_abMoEditReviewRm_moForm);
		setStatusSelect(this.panel_abMoEditReviewAsset_moForm);
		setStatusSelect(this.panel_abMoEditReviewEq_moForm);
	},

	afterInitialDataFetch: function() {
		// createCheckbox_vacant_rooms() is in ab-mo-common.js
		createCheckbox_vacant_rooms(this.panel_abMoEditReviewEm_moForm, "individual", procId, taskId);
		createCheckbox_vacant_rooms(this.panel_abMoEditReviewHire_moForm, "individual", procId, taskId);
		createCheckbox_vacant_rooms(this.panel_abMoEditReviewRm_moForm, "individual", procId, taskId);
		createCheckbox_vacant_rooms(this.panel_abMoEditReviewAsset_moForm, "individual", procId, taskId);
		createCheckbox_vacant_rooms(this.panel_abMoEditReviewEq_moForm, "individual", procId, taskId);
		createCheckbox_vacant_rooms(this.panel_abMoEditCompleteAsset_moForm, "individual", procId, taskId);
		createCheckbox_vacant_rooms(this.panel_abMoEditCompleteEq_moForm, "individual", procId, taskId);
	}
});


// Start an individual move

function abMoEditReview_afterRefresh(form) {
	var mo_type = form.getFieldValue('mo.mo_type');
	var mo_id = form.getFieldValue('mo.mo_id');
	var status = form.getFieldValue('mo.status');
	
	if ((procId != DC) && (procId != VC)
			&& (taskId != CM) && (taskId != RMFA)) {
		if(taskId == IM) {
			// for Issue view we hide the autoApproveButton and disable/enable the issueButton
			if (form.getEl('autoApproveButton') != null) {
				form.showElement('autoApproveButton', false);
				setPreviousSiblingDisplay('autoApproveButton', false);
			}
			if (form.getEl('issueButton') != null) {
				form.enableAction('issueButton', status == 'Approved');
			}
		} else {
			// for Review view we hide the issueButton and disable/enable the autoApproveButton
			if (form.getEl('issueButton') != null) {
				form.showElement('issueButton', false);
				setPreviousSiblingDisplay('issueButton', false);
			}
			if (form.getEl('autoApproveButton') != null) {
				form.enableAction('autoApproveButton', status == 'Requested');
			}
		}
	} else {
		if (form.getEl('issueButton') != null) {
			form.showElement('issueButton', false);
			setPreviousSiblingDisplay('issueButton', false);
		}
		if (form.getEl('autoApproveButton') != null) {
			form.showElement('autoApproveButton', false);
			setPreviousSiblingDisplay('autoApproveButton', false);
		}
	}
	
	// hide the Close button if not from "Complete Moves"
	if (taskId != CM) {
		if (form.getEl('closeButton') != null) {
			form.showElement('closeButton', false);
			setPreviousSiblingDisplay('closeButton', false);
		}
	}

	// hide the Route for Approval button if not from "Route Moves for Approval"
	if (taskId != RMFA) {
		if (form.getEl('routeButton') != null) {
			form.showElement('routeButton', false);
			setPreviousSiblingDisplay('routeButton', false);
		}
	}

	// hide the Dummy Approving Manager fields if from "Route Moves for Approval"
	if (taskId == RMFA) {
		if(form.getFieldElement('apprv_mgr1_dummy'))
			form.showField('apprv_mgr1_dummy', false);
		if(form.getFieldElement('apprv_mgr2_dummy'))
			form.showField('apprv_mgr2_dummy', false);
		if(form.getFieldElement('apprv_mgr3_dummy'))
			form.showField('apprv_mgr3_dummy', false);
	}
	

	// set the questionnaire_id
	if (mo_type && mo_id) {
		var questionnaire_id = "Move Order - " + mo_type;

		// set readOnly to true for reports
		var readOnly = false;
		if ((status == "Issued-In Process") || 
		    (status == "Issued-On Hold") || 
		    (status == "Issued-Stopped") ||
		    (status == "Completed-Pending") ||
		    (status == "Completed-Not Ver") ||
		    (status == "Completed Verified")) {
			readOnly = true;
		}
		
		if ((procId == DC) || (procId == VC) || (taskId == RMFA)) {
			var readOnly = true;
		}

		abMoEditReview_quest = new Ab.questionnaire.Quest(questionnaire_id, form.id, readOnly);
	}
	
	//KB 3047263 field layout was changed from core, this function is no longer required 
	//replaceNewLinesInDivFields(form);
	
	/* For the employee, new hire, employee leaving and room movement,
	 * show the equipments/furniture list associated with the movement,
	 * and enable the "Equipment"/"Tagged Furniture" button;
	 * For all, refresh Actions tab
	 * For all except Leaving, enable/disable "Show Drawing" button (is in ab-mo-common.js)
	 */
	switch(mo_type) {
		case "Employee":
			refreshEqTa(form, abMoEditReviewController.abMoEditReviewEmContainer_tabs);
			refreshActionsTab(form);
			checkVacancyRoomsButton(form.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
			break;
		case "Room":
			refreshEqTa(form, abMoEditReviewController.abMoEditReviewRmContainer_tabs);
			refreshActionsTab(form);
			checkVacancyRoomsButton(form.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
			break;
		case "New Hire":
			refreshEqTa(form, abMoEditReviewController.abMoEditReviewHireContainer_tabs);
			refreshActionsTab(form);
			checkVacancyRoomsButton(form.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
			break;
		case "Leaving":
			refreshEqTa(form, abMoEditReviewController.abMoEditReviewLeavingContainer_tabs);
			refreshActionsTab(form);
			break;
		case "Equipment":
			refreshActionsTab(form);
			checkVacancyRoomsButton(form.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
			break;
		case "Asset":
			refreshActionsTab(form);
			checkVacancyRoomsButton(form.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
			break;
		default: 
			break;
	}
}

function removeStar(form, fieldName){
	form.fields.get(fieldName).fieldDef.required = false;
	var starSpan = form.getFieldElement(fieldName).parentNode.previousSibling.lastChild;
	starSpan.parentNode.removeChild(starSpan);
}

function replaceNewLinesInDivFields(form){

	var fields = ['mo.description','mo.comments'];
	for(var i=0; i < fields.length; i++) {
		var fieldName = fields[i];
		if (form.fields.get(fieldName).fieldDef.readOnly
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

function refreshEqTa(moveForm, tabs){
	var eqPanel = View.panels.get("panel_abMoEditMoAssets_eq");
	eqPanel.refresh(moveForm.restriction);
	if (eqPanel.rows.length > 0){
		abMoEditReviewController.panel_abMoEditMoeq.refresh(moveForm.restriction);
		tabs.showTab(1);
	} else {
		tabs.hideTab(1);
	}
	
	var taPanel = View.panels.get("panel_abMoEditMoAssets_ta");
	taPanel.refresh(moveForm.restriction);
	if (taPanel.rows.length > 0){
		abMoEditReviewController.panel_abMoEditMota.refresh(moveForm.restriction);
		tabs.showTab(2);
	} else {
		tabs.hideTab(2);
	}
}

function refreshActionsTab(moveForm){
	if(abMoEditReviewController.panel_abMoListAction_actList)
		abMoEditReviewController.panel_abMoListAction_actList.refresh(moveForm.restriction);
	if(abMoEditReviewController.panel_abMoListCompleteAction)
		abMoEditReviewController.panel_abMoListCompleteAction.refresh(moveForm.restriction);
}

// On Auto-Approve we execute the autoApproveIndividualMove workflow rule 
// and we open the examine form in a dialog box.

function onAutoApprove(commandObject) {
	// we hide the auto-approve button and change the move status to
	// Approved
	var form = commandObject.getParentPanel();
	var mo_id = form.getFieldValue('mo.mo_id');

    try {
        var result = Workflow.callMethod('AbMoveManagement-MoveService-autoApproveIndividualMove',mo_id);

		// Constantine 6-24-10 - Add the new status to the list.  Uses the same function as in Group Moves
		setStatusAddingOption(form, form.fields.get('mo.status'), "Approved");

        form.refresh();
    } catch (e) {
        Workflow.handleError(e);
    }
}

// On Issue we execute the issueIndividualMove workflow rule 
// and we open the examine form in a dialog box.

function onIssue(commandObject) {
	// we hide the issue button and change the move status to
	// Issued-In Process
	var form = commandObject.getParentPanel();
	var mo_id = form.getFieldValue('mo.mo_id');
	var requestor = form.getFieldValue('mo.requestor');
	var dv_id = form.getFieldValue('mo.dv_id');
	var dp_id = form.getFieldValue('mo.dp_id');
	var ac_id = form.getFieldValue('mo.ac_id');

    try {
        var result = Workflow.callMethod('AbMoveManagement-MoveService-issueIndividualMove', mo_id, requestor);

		// Constantine 6-24-10 - Add the new status to the list.  Uses the same function as in Group Moves
		setStatusAddingOption(form, form.fields.get('mo.status'), "Issued-In Process");

		form.refresh();
    } catch (e) {
        Workflow.handleError(e);
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

// Display Select Value dialog for selecting jacks while restricting to the selected room

function selectJack(commandObject, bl_id, fl_id, rm_id, destField, selectTitle,service)
{	
	var form = commandObject.getParentPanel();
    var restriction = new Ab.view.Restriction({
        'jk.bl_id': form.getFieldValue(bl_id),
		'jk.fl_id': form.getFieldValue(fl_id),
		'jk.rm_id': form.getFieldValue(rm_id),
		'jk.tc_service':service
    });

	View.selectValue(form.id, selectTitle,
					[destField], 'jk', ['jk.jk_id'], ['jk.jk_id','jk.jk_std'],
					restriction);
}

function beforeSaveForm()
{
	savePanelQuestions();
}

function savePanelQuestions()
{
	if(abMoEditReview_quest != null && !abMoEditReview_quest.readOnly)
		abMoEditReview_quest.beforeSaveQuestionnaire();
}

// On Route for Approval we execute the RouteIndividualMoveForApproval
// workflow rule and we open the examine form in a dialog box.

function onRouteIndividualMoveForApproval(cmdContext) {
	var form = cmdContext.command.getParentPanel();
	var mo_id = form.getFieldValue('mo.mo_id');
	var apprv_mgr1 = form.getFieldValue('mo.apprv_mgr1');
	var apprv_mgr2 = form.getFieldValue('mo.apprv_mgr2');
	var apprv_mgr3 = form.getFieldValue('mo.apprv_mgr3');

	if ((apprv_mgr1 != "" && apprv_mgr2 != "" && apprv_mgr1 == apprv_mgr2) ||
        (apprv_mgr1 != "" && apprv_mgr3 != "" && apprv_mgr1 == apprv_mgr3) ||
	    (apprv_mgr2 != "" && apprv_mgr3 != "" && apprv_mgr2 == apprv_mgr3))
	{
		View.showMessage(getMessage("same_apprv_mgr"));
		return;
	}
	else
	{
	    try {
	        var result = Workflow.callMethod('AbMoveManagement-MoveService-routeIndividualMoveForApproval', mo_id, apprv_mgr1, apprv_mgr2, apprv_mgr3);

			// Constantine 6-24-10 - Add the new status to the list.  Uses the same function as in Group Moves
			setStatusAddingOption(form, form.fields.get('mo.status'), "Requested-Routed");

			form.refresh();
	    } catch (e) {
	        Workflow.handleError(e);
	    }
	}	
}

// On Close we execute the closeIndividualMove workflow rule 
// and we open the examine form in a dialog box.

function onClose(commandObject) {
	// We hide the issue button and change the move status to
	// Closed
	var form = commandObject.getParentPanel();
	var mo_id = form.getFieldValue('mo.mo_id');

	try{
		var result= Workflow.callMethod('AbMoveManagement-MoveService-closeIndividualMove', mo_id);

		// Constantine 6-24-10 - Add the new status to the list.  Uses the same function as in Group Moves
		setStatusAddingOption(form, form.fields.get('mo.status'), "Closed");

		form.refresh();
	} catch (e) {
		Workflow.handleError(e);
	}
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

function selectDeptId(commandObject){
	var form = commandObject.getParentPanel();
	abMoEditReviewController.panel = form;

	View.selectValue(form.id, getMessage('deptCode'),
					['mo.dv_id','mo.dp_id','dp.name'], 'dp', ['dp.dv_id','dp.dp_id','dp.name'], ['dp.dv_id','dp.dp_id','dp.name'],
					null, 'afterSelectDeptId');
}

function afterSelectDeptId(targetFieldName, selectedValue, previousValue) {
	if(targetFieldName != "dp.name")
		return true;
	
	//var form = View.panels.get('panel_abMoEditReviewEm_moForm');
	abMoEditReviewController.panel.setFieldValue("dp.name", selectedValue);
	
	return true;
}

/**
 * Removes option elements from the Status select element
 */
function setStatusSelect(form){
	/* Remove option elements from Status field if from
	 * "Review and Estimate Moves" or "Issue Moves" or "Complete Moves"
	 */
	if (taskId != REM && taskId != IM && taskId != CM) {
		return;
	}

	if(form == undefined || form == null)
		return;
	
	var formFields = form.fields;
	var statusFormField = formFields.get(formFields.indexOfKey("mo.status"));
	
	if(statusFormField == undefined || statusFormField == null)
		return;
	
	var statusField = statusFormField.dom;
	var removed = false;
	
	do {
		removed = false;
		for (var i = 0; i < statusField.options.length; i++) {
			var option = statusField.options[i];
			if (!optionValuePermitted(option.value)) {
				statusField.removeChild(option);
				removed = true;
				break;
			}
		}
	}
	while (removed);
}

function optionValuePermitted(optionValue){
	var optionPermitted = true;
	
	switch(taskId) {
		case REM:
			if (optionValue != 'Requested'
					&& optionValue != 'Requested-Estimated'
					&& optionValue != 'Requested-On Hold'
					&& optionValue != 'Requested-Rejected') {
				optionPermitted = false;
			}
			break;
		case IM:
			if (optionValue != 'Approved'
					&& optionValue != 'Approved-In Design'
					&& optionValue != 'Approved-Cancelled') {
				optionPermitted = false;
			}
			break;
		case CM:
			if (optionValue != 'Issued-In Process'
					&& optionValue != 'Issued-On Hold'
					&& optionValue != 'Issued-Stopped'
					&& optionValue != 'Completed-Pending'
					&& optionValue != 'Completed-Not Ver'
					&& optionValue != 'Completed-Verified') {
				optionPermitted = false;
			}
			break;
		default:
			optionPermitted = true;
	}
	
	return optionPermitted;
}

/**
 * set project status adding the option if necesary
 * 
 * @param {Object} form
 * @param {Object} field
 * @param {Object} status
 */
function setStatusAddingOption(form, field, status){
	if(field){
		var addOption = true;
		var fieldDef = field.fieldDef;
		var fldDOM = field.dom;
		var statusText = fieldDef.enumValues[status];
		var objOptions = fldDOM.options;
		for(var i=0;i< objOptions.length; i++){
			var option = objOptions[i];
			if(option.value == status){
				addOption = false;
			}
		}
		if(addOption){
			var pos = parseInt(objOptions.length);
			if(Ext.isIE){
				fldDOM.add(new Option(status, statusText), pos);
				fldDOM.options.selectedIndex = pos;
			}else if(!Ext.isIE){
				fldDOM.add(new Option(status, statusText, true), null);
			}
		}else{
			form.setFieldValue(field.getFullName(), status);
		}
	}
}