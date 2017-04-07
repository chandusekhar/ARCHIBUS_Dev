/*
 * 03/07/2010 IOAN KB 3026355
 * added opener grid panel for refresh after edit
 */

/*
 * This file goes together with ab-mo-common.js
 */

// 3-29-10 C. Kriezis Initialize the taskId variable in afterViewLoad function
var taskId;
//

View.createController('commonCtrl',{
	
	openerPanel: null,
	quest:null,
	
	// 3-29-10 C. Kriezis Added to account for the case the view is called from a Dashboard view and not from the Navigator
	/*
	 * 03/31/2010 IOAN insert a check to avoid infinite loop
	 * check curent window and parent window - is this are the same infinite loop is generated 
	 *  must exit from while
	 */
	afterViewLoad: function(){
		taskId = View.taskInfo.taskId;
		var openingWindow = View.getOpenerWindow();
		if (openingWindow) {
			var viewTitle = openingWindow.getMessage('viewTitle');
			var canContinue = true;
			while ((viewTitle == 'viewTitle') && (openingWindow != null) && canContinue) {
				var parentWindow = openingWindow.View.getOpenerWindow();
				if(parentWindow.View.type == "dasboard" || openingWindow == parentWindow){
					canContinue = false;
				}
				openingWindow = openingWindow.View.getOpenerWindow();
				viewTitle = openingWindow.getMessage('viewTitle');
			}
			if (((viewTitle == 'Complete Group Moves') || (viewTitle == 'Route Group Moves for Approval') || (viewTitle == 'Issue Group Moves') || (viewTitle == 'Review and Estimate Group Moves'))
				&& (taskId != viewTitle)) {
				taskId=viewTitle;
			}
		}
	},
	//

	afterInitialDataFetch: function(){
		
		if (this.form_abMoGroupEditHire != undefined) {
			this.form_abMoGroupEditHire.refresh(View.getOpenerView().restriction);
			
			this.panel_abMoEditMoAssets_eq.refresh(this.form_abMoGroupEditHire.restriction);
			this.panel_abMoEditMoAssets_ta.refresh(this.form_abMoGroupEditHire.restriction);
			
			// createCheckbox_vacant_rooms() is in ab-mo-common.js
			createCheckbox_vacant_rooms(this.form_abMoGroupEditHire, "group");
		} else if (this.form_abMoGroupEditLeaving != undefined) {
			this.form_abMoGroupEditLeaving.refresh(View.getOpenerView().restriction);
			
			this.panel_abMoEditMoAssets_eq.refresh(this.form_abMoGroupEditLeaving.restriction);
			this.panel_abMoEditMoAssets_ta.refresh(this.form_abMoGroupEditLeaving.restriction);
		} else if (this.form_abMoGroupEditEq != undefined) {
			// createCheckbox_vacant_rooms() is in ab-mo-common.js
			createCheckbox_vacant_rooms(this.form_abMoGroupEditEq, "group");
			checkVacancyRoomsButton(this.form_abMoGroupEditEq.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
		} else if (this.form_abMoGroupEditAsset != undefined) {
			// createCheckbox_vacant_rooms() is in ab-mo-common.js
			createCheckbox_vacant_rooms(this.form_abMoGroupEditAsset, "group");
			checkVacancyRoomsButton(this.form_abMoGroupEditAsset.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
		}
		if(View.parameters){
			if (View.parameters.openerPanel) {
				this.openerPanel = View.parameters.openerPanel;
			}
		}else if(View.getOpenerView().parameters){
			if (View.getOpenerView().parameters.openerPanel) {
				this.openerPanel = View.getOpenerView().parameters.openerPanel;
			}
		}
		
		setStatusSelect(this.form_abMoGroupEditHire, 'mo');
		setStatusSelect(this.form_abMoGroupEditLeaving, 'mo');
		setStatusSelect(this.form_abMoGroupEditEq, 'mo');
		setStatusSelect(this.form_abMoGroupEditAsset, 'mo');
		setStatusSelect(this.form_abMoGroupEditRm, 'mo');
	},
	
	form_abMoGroupEditHire_afterRefresh:function(){
		this.add_move_questions(this.form_abMoGroupEditHire);
		checkVacancyRoomsButton(this.form_abMoGroupEditHire.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
	},
	
	form_abMoGroupEditHire_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    }, 
    form_abMoGroupEditHire_onSaveButton : function() {
		this.saveAndRefresh(this.form_abMoGroupEditHire);
    },
	
	form_abMoGroupEditLeaving_afterRefresh:function(){
		this.add_move_questions(this.form_abMoGroupEditLeaving);
	},
	
	form_abMoGroupEditLeaving_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    }, 
    form_abMoGroupEditLeaving_onSaveButton : function() {
		this.saveAndRefresh(this.form_abMoGroupEditLeaving);
    },
	
	form_abMoGroupEditEq_afterRefresh:function(){
		this.add_move_questions(this.form_abMoGroupEditEq);
		checkVacancyRoomsButton(this.form_abMoGroupEditEq.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
	},
	
	form_abMoGroupEditEq_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    }, 
    form_abMoGroupEditEq_onSaveButton : function() {
		this.saveAndRefresh(this.form_abMoGroupEditEq);
    },
	form_abMoGroupEditAsset_afterRefresh:function(){
		this.add_move_questions(this.form_abMoGroupEditAsset);
		checkVacancyRoomsButton(this.form_abMoGroupEditAsset.id,'mo.to_bl_id','mo.to_fl_id','showDrawing');
	},
	form_abMoGroupEditAsset_beforeSave : function() {
    	this.quest.beforeSaveQuestionnaire();
    	return true;
    }, 
    form_abMoGroupEditAsset_onSaveButton : function() {
		this.saveAndRefresh(this.form_abMoGroupEditAsset);
    },
	
	saveAndRefresh: function(panel) {
		if (panel.save()) {
			if(this.openerPanel != null){
				this.openerPanel.refresh();
			}
		}
	},
	
	add_move_questions : function(targetForm) {
		var mo_type = targetForm.getFieldValue('mo.mo_type');
		var q_id = 'Move Order - ' + mo_type;
		this.quest = new Ab.questionnaire.Quest(q_id, targetForm.id);		
	}
	
});

/**
 * Removes option elements from the Status select element
 * @param {Object} form
 * @param {Object} tableName Values in "project","mo"
 */
function setStatusSelect(form, tableName){
	/* Remove option elements from Status field
	 * if from "Review and Estimate Group Moves" or "Issue Group Moves"
	 * or "Complete Group Moves"
	 */
	if (taskId != 'Review and Estimate Group Moves'
			&& taskId != 'Issue Group Moves'
			&& taskId != 'Complete Group Moves') {
		return;
	}

	if(form == undefined || form == null)
		return;
	
	var formFields = form.fields;
	var statusFormField = formFields.get(formFields.indexOfKey(tableName + ".status"));
	
	if(statusFormField == undefined || statusFormField == null)
		return;
		
	var statusField = statusFormField.dom;
	var removed = false;
	
	do {
		removed = false;
		for (var i = 0; i < statusField.options.length; i++) {
			var option = statusField.options[i];
			if (!optionValuePermitted(option.value, tableName, form)) {
				statusField.removeChild(option);
				removed = true;
				break;
			}
		}
	}
	while (removed);
}

function optionValuePermitted(optionValue, tableName, form){
	var optionPermitted = true;

	switch(taskId) {
		case 'Review and Estimate Group Moves':
			if ((tableName != 'mo' || (tableName == 'mo' && optionValue != form.getFieldValue("mo.status")))
					&& optionValue != 'Requested'
					&& optionValue != 'Requested-Estimated'
					&& optionValue != 'Requested-On Hold'
					&& optionValue != 'Requested-Rejected') {
				optionPermitted = false;
			}
			break;
		case 'Issue Group Moves':
			if ((tableName != 'mo' || (tableName == 'mo' && optionValue != form.getFieldValue("mo.status")))
					&& optionValue != 'Approved'
					&& optionValue != 'Approved-In Design'
					&& optionValue != 'Approved-Cancelled') {
				optionPermitted = false;
			}
			break;
		case 'Complete Group Moves':
			if ((tableName != 'mo' || (tableName == 'mo' && optionValue != form.getFieldValue("mo.status")))
					&& optionValue != 'Issued-In Process'
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
