/**
 * @author: Song
 */
var helpDeskGroupMoveController = View.createController('helpDeskGroupMoveController', {
    quest: null,
    
    
    afterInitialDataFetch: function(){
        this.inherit();
	this.questPanel.actions.get('previous').setTitle(getMessage('previous'));
    },
    
    questPanel_afterRefresh: function(){
        this.initialEachPanel();
    },
    
    
    initialEachPanel: function(){
    
        var activityTypeValue = this.questPanel.getFieldValue("activity_log.activity_type");
//        activityTypeValue="SERVICE DESK - GROUP MOVE";
        this.quest = new Ab.questionnaire.Quest(activityTypeValue, "questPanel");
        this.quest.showQuestions();
        
        this.questPanel.actions.get("questNext").show(true);
        this.questPanel.actions.get("questConfirm").show(true);
        
        this.questPanel.actions.get("questNext").enable(true);
        this.questPanel.actions.get("questConfirm").enable(true);
        
        
        
        if (ABHDC_getTabsSharedParameters()["documents"]) {
            this.questPanel.actions.get("questConfirm").show(false);
        }
        else {
            this.questPanel.actions.get("questNext").show(false);
        }
    },
    /**
     * event handler is called when Previous button click. kb 3033830
     */
    questPanel_onPrevious: function(){
    	var mainTabs = View.parentTab.parentPanel;
    	var parentCtrl = View.getOpenerView().controllers.get(0);
    	parentCtrl.basicRestriction["activity_log.activity_log_id"] = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
    	//fix KB3031741 - add activity_log.description to the basic tab restriction before go back to basic tab(Guo 2011/06/20)
    	parentCtrl.basicRestriction["activity_log.description"] = this.questPanel.getFieldValue("activity_log.description");
    	mainTabs.selectTab("basic", parentCtrl.basicRestriction, false, true, false);
    }
});
/**
 * event handler is called when Next button click (sub-method). 
 * get Questionnaire field value
 * @param fieldName: name of current questionnaire field
 * @returns
 */
function getQuestionnaireFieldObj(fieldName){
	var activityTypeValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_type");
	var tabs = View.getControlsByType(parent, 'tabs')[0];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('questionnaire.questionnaire_id', activityTypeValue);
	restriction.addClause('questions.is_active', 1);
	var ds = View.dataSources.get('exPrgQuestionnaire_questionsDs');
	var questionRecords = ds.getRecords(restriction);
	for(var i=0;i<questionRecords.length;i++){
		var quest_name = questionRecords[i].getValue("questions.quest_name");
		if(fieldName==quest_name){
			var questionRecord = questionRecords[i];
			var recordType = questionRecord.getValue('questions.format_type');
			var obj = $('questPanel_question' + i + '.answer_field');
			return obj;
		}
	}
	return null;
}
/**
 * event handler is called when Next button click (sub-method). 
 * get Questionnaire field value
 * @param fieldName: name of current questionnaire field
 * @returns
 */
function getQuestionnaireFieldValue(fieldName){
	var activityTypeValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_type");
    var tabs = View.getControlsByType(parent, 'tabs')[0];
	var restriction = new Ab.view.Restriction();
	restriction.addClause('questionnaire.questionnaire_id', activityTypeValue);
		restriction.addClause('questions.is_active', 1);
	var ds = View.dataSources.get('exPrgQuestionnaire_questionsDs');
	var questionRecords = ds.getRecords(restriction);
	for(var i=0;i<questionRecords.length;i++){
		var quest_name = questionRecords[i].getValue("questions.quest_name");
		if(fieldName==quest_name){
			var questionRecord = questionRecords[i];
			var recordType = questionRecord.getValue('questions.format_type');
			var value = $('questPanel_question' + i + '.answer_field').value;
			if (recordType == 'Date') {
				return value;
//				return dateFormatQues(getDateWithISOFormat(value));
			}else{
				return value;
			}
		}
	}
	return null;
}
/**
 * private method, return date format mm/dd/yyyy 
 * @param dateStr
 * @returns
 */
function dateFormatQues(dateStr){
	if(dateStr!=null&&dateStr!='')
	return dateStr.split("-")[1]+"/"+dateStr.split("-")[2]+"/"+dateStr.split("-")[0];
	else 
	  return "";
}
/**
 * event handler is called when Next button click.
 * 1.check if it is individual move or group move, add field input value to Object tabs for further use.
 * 2.check to make sure fields not contain incorrect values.
 * 3.go to next assignments tab.
 */
function onNext(){
    var activityLogIdValue = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
//    var date_start = getQuestionnaireFieldValue("date_start");
//    var project_name = getQuestionnaireFieldValue("project_name");
//    alert(date_start+" "+project_name);
//    return;
    
	var result = false;
	var tabs = View.getControlsByType(parent, 'tabs')[0];
	var tabBasic = tabs.findTab("basic");
	//for the individual or group approve function.
	var activityTypeValue = tabs.activityTypeValue;
	if(tabBasic&&tabBasic.restriction){
    	var restriction = tabBasic.restriction;
        activityTypeValue = restriction["activitytype.activity_type"];
	}
	var serviceProvider = getServiceProvider(activityLogIdValue);
	//check if create group move
	if(activityTypeValue=="SERVICE DESK - GROUP MOVE"){
		//get parameters form questionnaire Panel
		var date_start = getQuestionnaireFieldValue("date_start");
		var date_end = getQuestionnaireFieldValue("date_end");
		
		var iso_date_start = getDateWithISOFormat(date_start);
		var iso_date_end = getDateWithISOFormat(date_end);
		var formate_date_start = dateFormatQues(iso_date_start);
		var formate_date_end = dateFormatQues(iso_date_end);
		if (!valueExistsNotEmpty(date_start)) {
	        View.showMessage(getMessage('dateStart'));
		}else if (!valueExistsNotEmpty(date_end)) {
	        View.showMessage(getMessage('dateEnd'));
		}else if(valueExistsNotEmpty(date_start)&&compareISODates(iso_date_end,iso_date_start)){
			View.showMessage(getMessage('errorDateStartEnd'));
		}else if(compareISODates(iso_date_end,getCurrentDateISOFormat())){
			View.showMessage(getMessage('errorEndDateInThePast'));
		}else if(serviceProvider==0){
			var bl_id = getQuestionnaireFieldValue("bl_id");
			var projectName = getQuestionnaireFieldValue('project_name');
			if(!valueExistsNotEmpty(projectName)){
				View.showMessage(getMessage('projectNameShouldRequired'));
				return;
			}else if(projectNameNotUnique(projectName)){
				View.showMessage(getMessage('projectNameShouldUnique'));
				return;
			}else if(!valueExistsNotEmpty(date_start)){
				View.showMessage(getMessage('dateStartShouldRequired'));
				return;
			}else if(!valueExistsNotEmpty(bl_id)){
				View.showMessage(getMessage('blIdShouldUnique'));
				return;
			}else{
				result = true;
			}
		}else if(serviceProvider==1){
			return;
		}else{
			result = true;
		}
		//check if create individual move
	}else if(activityTypeValue=="SERVICE DESK - INDIVIDUAL MOVE"){
		var move_end = getQuestionnaireFieldValue("date_start");
		var iso_move_end = getDateWithISOFormat(move_end);
		var formate_move_end = dateFormatQues(iso_move_end);
		if (!valueExistsNotEmpty(move_end)) {
	        View.showMessage(getMessage('moveDateIsNotNull'));
		}else if(compareISODates(iso_move_end,getCurrentDateISOFormat())){
			View.showMessage(getMessage('errorMoveDateInThePast'));
		}else{
			result = true;
		}
	}
	var dp_contact = getQuestionnaireFieldValue("dp_contact");
	if(!valueExistsNotEmpty(dp_contact)){
		View.showMessage(getMessage('dpContact'));
		return;
	}
    if(result){
    	if (helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.description") == '') {
    		helpDeskGroupMoveController.questPanel.clearValidationResult();
    		helpDeskGroupMoveController.questPanel.addInvalidField("activity_log.description", getMessage("noDescription"));
    		helpDeskGroupMoveController.questPanel.displayValidationResult();
    		return;
    	}
    	helpDeskGroupMoveController.quest.beforeSaveQuestionnaire();
    	var project = getQuestionnaireFieldObj("project_name");
    	if(project){
    		project.value = getQuestionnaireFieldValue("project_name").toUpperCase();
    	}
    	if (!helpDeskGroupMoveController.questPanel.save()) {
    		return;
    	}
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause("activity_log.activity_log_id", activityLogIdValue);

		var date_start = getQuestionnaireFieldValue("date_start");
		var date_end = getQuestionnaireFieldValue("date_end");
		var formate_date_start = dateFormatQues(getDateWithISOFormat(date_start));
		var formate_date_end = dateFormatQues(getDateWithISOFormat(date_end));
		
    	tabs.description = helpDeskGroupMoveController.questPanel.getFieldValue("activity_log.activity_log_id");
    	tabs.project_id = getQuestionnaireFieldValue("project_name");
    	tabs.dp_id = getQuestionnaireFieldValue("dp_id");
    	tabs.bl_id = getQuestionnaireFieldValue("bl_id");
    	tabs.date_start = formate_date_start;
    	tabs.move_date = formate_date_start;
    	tabs.date_end = formate_date_end;
    	tabs.activityLogIdValue = activityLogIdValue;
    	tabs.findTab("groupMoveDetailTab").isContentLoaded=false;
    	tabs.selectTab("groupMoveDetailTab", restriction, false, false, true);
    }
}
/**
 * test if exist project with the same name.
 */
function projectNameNotUnique(project_id){
	var restriction = new Ab.view.Restriction();
	restriction.addClause('project.project_id', project_id.toUpperCase());
	var ds = View.dataSources.get('exPrgQuestionnaire_project');
	var questionRecords = ds.getRecords(restriction);
	if(questionRecords!=null&&questionRecords.length>0){
		return true;
	}
	return false;
}

/**
 * get current date in ISO format(like '2013-12-26')
 */
function getCurrentDateISOFormat() {
	var curDate = new Date();
	var month = curDate.getMonth() + 1;
	var day = curDate.getDate();
	var year = curDate.getFullYear();
	return  year+ "-" +((month < 10) ? "0" : "") + month + "-"  + ((day < 10) ? "0" : "") + day;
}
/**
 * check if questionnaire can save
 * @returns {Boolean}
 */
function auestionnaireCanSave(){
    var canSave = true;
    for (var i = 0; i < 5; i++) {
        if(!$('questPanel_question' + i + '.answer_field').value){
			canSave = false;
			break;
		}
    }
    return canSave
}
function getServiceProvider(activityLogId){
	try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-getServiceProvider', parseInt(activityLogId));
		if(result.jsonExpression != ""){
			res = eval('('+result.jsonExpression+')');
			if(res.serviceProvider=='AbMoveManagement'){
				return 0;
			}
		}
	}catch(e){
		Workflow.handleError(e); 
		return 1;
	}
	return 2;
}