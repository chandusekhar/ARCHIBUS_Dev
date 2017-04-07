var abEditActionCtrl = View.createController('abEditActionCtrl',{
	/*
	 * specify what view is opened 
	 * valid values: data, voice, craft
	 */
	viewType: 'data',
	
	//questionnaire object
	quest: null,
	
	// grid restriction
	restriction: "",
	
	afterViewLoad: function(){
		if(View.panels.get('dataAction_content') != null){
			this.viewType = 'data';
			this.restriction = "(activity_log.activity_type='MOVE - DATA') AND (activity_log.status NOT IN ('CLOSED','CANCELLED')) AND ( (activity_log.mo_id IS NOT NULL AND activity_log.mo_id IN (SELECT mo_id FROM mo where status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified'))) OR (activity_log.project_id IS NOT NULL AND activity_log.project_id IN (SELECT project_id FROM project WHERE project_type = 'Move' AND status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified'))))";
		}else if(View.panels.get('voiceAction_content') != null){
			this.viewType = 'voice';
			this.restriction = "(activity_log.activity_type='MOVE - VOICE') AND (activity_log.status NOT IN ('CLOSED','CANCELLED')) AND ( (activity_log.mo_id IS NOT NULL AND activity_log.mo_id IN (SELECT mo_id FROM mo where status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified'))) OR (activity_log.project_id IS NOT NULL AND activity_log.project_id IN (SELECT project_id FROM project WHERE project_type = 'Move' AND status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified'))))";
		}else if(View.panels.get('craftAction_content') != null){
			this.viewType = 'craft';
			/*
			 * 12/21/2010 IOAN KB 3029643
			 * modify the restriction to shows entries which are not assigned to any specific 
			 * craftsperson, but are assigned to the current users trade
			 */
			this.restriction = "((activity_log.assigned_to IN (SELECT cf_id from cf where email = '"+View.user.email+"')) OR (activity_log.tr_id IN (SELECT tr_id from cf where email = '"+View.user.email+"') and activity_log.assigned_to is null)) AND (activity_log.status NOT IN ('CLOSED','CANCELLED')) AND ((activity_log.mo_id IS NOT NULL AND activity_log.mo_id IN (SELECT mo_id FROM mo where status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified'))) OR (activity_log.project_id IS NOT NULL AND activity_log.project_id IN (SELECT project_id FROM project WHERE project_type = 'Move' AND status IN ('Approved','Approved-In Design','Issued-In Process','Issued-On Hold','Completed-Pending','Completed-Not Ver','Completed-Verified'))))"
		}
		showTab('abEditAction_tabs', 'action', false);
	},
	
	afterInitialDataFetch: function(){
		this.abEditAction_list.refresh(this.restriction);
		setTitle();
	}
});


/*
 * show/hide specified tab
 * @param {Object} tabs
 * @param {Object} tabName
 * @param {Object} visible
 */
function showTab(tabs, tabName, visible){
	var objTabs = View.panels.get(tabs);
	if(visible){
		objTabs.showTab(tabName);
	}else{
		objTabs.hideTab(tabName);
	}
}
/*
 * refresh details tab
 */
function selectTab(tabs, tabName, visible){
	showTab(tabs, tabName, visible);
	var controller = View.controllers.get('abEditActionCtrl');
	var questionnaire_id = "Action - ";
	var form = View.panels.get('abEditAction_form');
	var questionnaire_type = "";
	var activity_type = form.getFieldValue('activity_log.activity_type');
	switch(activity_type){
		case "MOVE - DATA":
			questionnaire_type = "Move-Data";
			break;
		case "MOVE - VOICE":
			questionnaire_type = "Move-Voice";
			break;
	}
	questionnaire_id = questionnaire_id + questionnaire_type;
	controller.quest = new Ab.questionnaire.Quest(questionnaire_id, 'abEditAction_form'); 
	var autocreate_wr = controller.abEditAction_form.getFieldValue('activity_log.autocreate_wr');
	var objChk = document.getElementById("generateWorkRequest");
	if(autocreate_wr == "0"){
		objChk.checked = 0;
	} else {
		objChk.checked = 1;
	}
}
/*
 * set title for grid panel
 */
function setTitle(){
	var title = getMessage('title_abEditAction_list');
	View.panels.get('abEditAction_list').setTitle(title);
}

/*
 * click event on generateWorkRequest checkbox
 * selecting the checkbox will show problem type field and set autocreate work request 1
 * unselecting the checkbox will hide problem type field and set autocreate work request 0
 * and set problem type empty
 */
function genWorkRequest(){
	var controller = View.controllers.get('abEditActionCtrl');
	var form = View.panels.get('abEditAction_form');
	var objChk = document.getElementById("generateWorkRequest");
	if(objChk.checked == 1){
		form.setFieldValue("activity_log.autocreate_wr", "1");
	}else{
		form.setFieldValue("activity_log.autocreate_wr", "0");
	}
}
/*
 * save questionnaire
 * executed before form save
 */
function saveQuestionnaire(){
	var controller = View.controllers.get('abEditActionCtrl');
	controller.quest.beforeSaveQuestionnaire();
}
