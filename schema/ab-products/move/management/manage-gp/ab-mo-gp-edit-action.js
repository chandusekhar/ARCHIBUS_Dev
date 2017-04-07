var controllerAbMoGroupEditAc = View.createController('abMoGroupEditAc_Controller', {

    quest: null,
    
    afterInitialDataFetch: function(){

		var generateWorkRequest = document.getElementById("generateWorkRequest");
		var autocreate_wr = this.form_abMoGroupEditAction.getFieldValue("activity_log.autocreate_wr");    
        if (autocreate_wr == "0") {
            generateWorkRequest.checked = 0;
        }
        else {
            generateWorkRequest.checked = 1;
        }
    },
    
    form_abMoGroupEditAction_afterRefresh: function(){
        var form = this.form_abMoGroupEditAction;
        var activity_type = form.getFieldValue('activity_log.activity_type');
        var activity_log_id = form.getFieldValue('activity_log.activity_log_id');
        var quest_activity_type = "";
        
        if (activity_type && activity_log_id) {
            switch (activity_type) {
                case "MOVE - DATA":
                    quest_activity_type = "Move-Data";
                    break;
                case "MOVE - VOICE":
                    quest_activity_type = "Move-Voice";
                    break;
            }
        }
        if (quest_activity_type != "") {
            var questionnaire_id = "Action - " + quest_activity_type;
            this.quest = new Ab.questionnaire.Quest(questionnaire_id, form.id);
        }
        
    },
    
    form_abMoGroupEditAction_beforeSave: function(){
        if (this.quest != null) {
            this.quest.beforeSaveQuestionnaire();
        }
    }
});


function closeAndRefresh(){
    View.getOpenerView().getOpenerView().panels.items[0].refresh();
    View.getOpenerView().closeThisDialog();
}


// genServiceRequest - Called when the Checkbox is clicked

function genServiceRequest(){
    if (document.getElementById("generateWorkRequest").checked == 1) {
        controllerAbMoGroupEditAc.form_abMoGroupEditAction.setFieldValue("activity_log.autocreate_wr","1");
    }
    else {
        controllerAbMoGroupEditAc.form_abMoGroupEditAction.setFieldValue("activity_log.autocreate_wr","0");
    }
}

//onSave action -  if genServiceRequest is checked call WFR genWorkRequest

function genServReq(){
	var projectId = View.getOpenerView().getOpenerView().panels.get(0).getFieldValue('project.project_id');
	
    if (document.getElementById("generateWorkRequest").checked == 1) {
		Workflow.callMethod('AbMoveManagement-MoveService-genWorkRequest', controllerAbMoGroupEditAc.form_abMoGroupEditAction.getFieldValue('activity_log.activity_log_id'), projectId ,null);
    }
}


