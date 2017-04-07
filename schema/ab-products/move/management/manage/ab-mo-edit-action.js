// ab-mo-edit-action.js - Called when editing an action

var controllerAbMoEditAction = View.createController('abMoEditAction_Controller', {

    afterInitialDataFetch: function(){
    
        var generateWorkRequest = document.getElementById("generateWorkRequest");
        if (this.panel_abMoEditAction != undefined) {
            var autocreate_wr = this.panel_abMoEditAction.getFieldValue("activity_log.autocreate_wr");
            if (autocreate_wr == "0") {
                generateWorkRequest.checked = 0;
            }
            else {
                generateWorkRequest.checked = 1;
            }
        }
        else 
            if (this.panel_abMoEditCompleteAction != undefined) {
                var autocreate_wr = this.panel_abMoEditCompleteAction.getFieldValue("activity_log.autocreate_wr");
                if (autocreate_wr == "0") {
                    generateWorkRequest.checked = 0;
                }
                else {
                    generateWorkRequest.checked = 1;
                }
            }
		else 
            if (this.panel_abMoEditActionLast != undefined) {
                var autocreate_wr = this.panel_abMoEditActionLast.getFieldValue("activity_log.autocreate_wr");
                if (autocreate_wr == "0") {
                    generateWorkRequest.checked = 0;
                }
                else {
                    generateWorkRequest.checked = 1;
                }
            }
    }
});

// genServiceRequest - Called when the Checkbox is clicked

function genServiceRequest(panel){
    if (document.getElementById("generateWorkRequest").checked == 1) {
        panel.setFieldValue("activity_log.autocreate_wr", "1");
    }
    else {
        panel.setFieldValue("activity_log.autocreate_wr", "0");
    }
}

var abMoEditAction_quest = null;

function abMoEditAction_afterRefresh(form){
    var activity_type = form.getFieldValue('activity_log.activity_type');
    var activity_log_id = form.getFieldValue('activity_log.activity_log_id');
    var quest_activity_type = "";
    
    
    
    // set the questionnaire_id
    if (activity_type && activity_log_id) {
        switch (activity_type) {
            case "MOVE - DATA":
                quest_activity_type = "Move-Data";
                break;
            case "MOVE - VOICE":
                quest_activity_type = "Move-Voice";
                break;
        }
        
        if (quest_activity_type != "") {
            var questionnaire_id = "Action - " + quest_activity_type;
            
            // set readOnly to false for editing forms
            var readOnly = false;
            abMoEditAction_quest = new Ab.questionnaire.Quest(questionnaire_id, form.id, readOnly);
        }
    }
    
}

function beforeSaveForm(){
    savePanelQuestions();
}

function savePanelQuestions(){
    if (abMoEditAction_quest != null) 
        abMoEditAction_quest.beforeSaveQuestionnaire();
}



// Presents Select Value dialog for selecting Assigned To - Craftspeople

function selectAssignedTo(commandObject){
    var form = commandObject.getParentPanel();
    var tr_id = form.getFieldValue('activity_log.tr_id');
    var strRest = "";
    if (tr_id != "") {
        strRest = "cf.tr_id= '" + tr_id + "'";
    }
    
    View.selectValue(form.id, getMessage('craftsperson'), ['activity_log.assigned_to'], 'cf', ['cf.cf_id'], ['cf.cf_id'], strRest);
}

// Close dialog for single moves and refresh the actions list from the opener view

function onAddActionMove(actionListView, editActionView){
    if (actionListView.panels.get("panel_abMoListAction_actList") != null) {
        actionListView.panels.get("panel_abMoListAction_actList").refresh();
    }
    if (actionListView.panels.get("panel_abMoListCompleteAction") != null) {
        actionListView.panels.get("panel_abMoListCompleteAction").refresh();
    }
    editActionView.closeThisDialog();
}


//onSave action -  if genServiceRequest is checked call WFR genWorkRequest
//panel - panel of the save action

function genServReq(panel){
	var moId = View.getOpenerView().panels.get(0).restriction['mo.mo_id'] != undefined ? View.getOpenerView().panels.get(0).restriction['mo.mo_id']: View.getOpenerView().getOpenerView().panels.get(0).restriction['mo.mo_id'] ;
	
    if (document.getElementById("generateWorkRequest").checked == 1) {
		Workflow.callMethod('AbMoveManagement-MoveService-genWorkRequest', panel.getFieldValue('activity_log.activity_log_id'), null ,moId);
    }
}