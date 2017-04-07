/**
 * from ab-mo-edit.js for 2.0 views
 * TODO: rename it back to "ab-mo-edit.js" after the views conversion to 2.0 is finished
 */

var moveEditFormController = View.createController('moveEditForm', {
	panel: null,
    quest : null,
    
    hideButtons: function(formId, buttonId){
    	// hide the "Initiate a New Request" if we are not in the "Request Employee Move" task
		if(!View.controllers.get("moveForm")){
			View.panels.get(formId).showElement(buttonId, false);
		}
    },

	// Employee
    emform_afterRefresh : function() {
		this.add_move_questions(this.emform);
		this.refreshEqTa(this.emform, this.abMoEditEmContainer_tabs);
		this.hideButtons("emform", "requestNewEm");
    },
	
	// New Hire
    hireform_afterRefresh : function() {
		this.add_move_questions(this.hireform);
		this.refreshEqTa(this.hireform, this.abMoEditHireContainer_tabs);
		this.hideButtons("hireform", "requestNewHire");
    },
	
	// Employee Leaving
    leavingform_afterRefresh : function() {
		this.add_move_questions(this.leavingform);
		this.refreshEqTa(this.leavingform, this.abMoEditLeavingContainer_tabs);
		this.hideButtons("leavingform", "requestNewLeaving");
    },
    leavingform_onAction_abMoEditLeaving_eq : function() {
		this.openEqDialog(this.leavingform);
	},
    leavingform_onAction_abMoEditLeaving_ta : function() {
		this.openTaDialog(this.leavingform);
	},
	
	// Equipment
    eqform_afterRefresh : function() {
		this.add_move_questions(this.eqform);
		this.hideButtons("eqform", "requestNewEq");
    },
	
	// Asset
    assetform_afterRefresh : function() {
		this.add_move_questions(this.assetform);
		this.hideButtons("assetform", "requestNewAsset");
    },
	
	// Room
    rmform_afterRefresh : function() {
		this.add_move_questions(this.rmform);
		this.refreshEqTa(this.rmform, this.abMoEditRmContainer_tabs);
		this.hideButtons("rmform", "requestNewRm");
    },
    
    emform_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    },
    hireform_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    },
    leavingform_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    },
    eqform_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    },    
    assetform_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    },
    rmform_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    },

	add_move_questions : function(targetForm) {
		var mo_type = targetForm.getFieldValue('mo.mo_type');
		var q_id = 'Move Order - ' + mo_type;
		this.quest = new Ab.questionnaire.Quest(q_id, targetForm.id);		
	},
	
    refreshEqTa : function(moveForm, tabs) {
		this.panel_abMoEditMoAssets_eq.refresh(moveForm.restriction);
		if (this.panel_abMoEditMoAssets_eq.rows.length > 0){
			this.panel_abMoEditMoeq.refresh(moveForm.restriction);
			tabs.showTab(1);
		} else {
			tabs.hideTab(1);
		}

		this.panel_abMoEditMoAssets_ta.refresh(moveForm.restriction);
		if (this.panel_abMoEditMoAssets_ta.rows.length > 0){
			this.panel_abMoEditMota.refresh(moveForm.restriction);
			tabs.showTab(2);
		} else {
			tabs.hideTab(2);
		}
    }
});

// On Request we execute the requestIndividualMove workflow rule 
// and we open the examine form in a dialog box.

function onRequest(cmdContext) {
	// we first run the workflow rule and then
	// hide the request button and change the move status to Requested
	var form = cmdContext.command.getParentPanel();
	var mo_id = form.getFieldValue('mo.mo_id');

    try {
        var result = Workflow.callMethod('AbMoveManagement-MoveService-requestIndividualMove', mo_id);
		form.refresh();
    } catch (e) {
        Workflow.handleError(e);
    }
}

/**
 * Select the "Step 1: Initiate" tab
 * @param cmdContext
 */
function selectInitiateTab(cmdContext) {
	var moRequestCtrl = View.controllers.get("moveForm");
	
	if(moRequestCtrl){
		moRequestCtrl.motabs.selectTab("page1", null, true);
		moRequestCtrl.afterInitialDataFetch();
		
		// hide grids and fields for the equipments and tagged furniture associated with the employee/room
		var moType = moRequestCtrl.move.getFieldValue("mo.mo_type");
		switch (moType) {
		case "Employee":
		case "New Hire":
		case "Leaving":
			onChangeEmployee();
			break;

		case "Room":
			onChangeFromField('mo.from_rm_id');
			break;

		default:
			break;
		}
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

function selectDeptId(commandObject){
	var form = commandObject.getParentPanel();
	moveEditFormController.panel = form;

	View.selectValue(form.id, getMessage('deptCode'),
					['mo.dv_id','mo.dp_id','dp.name'], 'dp', ['dp.dv_id','dp.dp_id','dp.name'], ['dp.dv_id','dp.dp_id','dp.name'],
					null, 'afterSelectDeptId');
}

function afterSelectDeptId(targetFieldName, selectedValue, previousValue) {
	if(targetFieldName != "dp.name")
		return true;
	
	//var form = View.panels.get('panel_abMoEditReviewEm_moForm');
	moveEditFormController.panel.setFieldValue("dp.name", selectedValue);
	
	return true;
}
