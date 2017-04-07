/**
 * @auther: Lei
 */
var controller = View.createController('helpDeskQuestController', {

    quest: null,
    
    afterInitialDataFetch: function() {
		this.questPanel.actions.get('cancel').setTitle(getMessage('previous'));
    },
    /**
     * Trade questionnaire after quest panel refreshed.
     */
    questPanel_afterRefresh: function(){
    	var mainTabs = View.parentTab.parentPanel;
    	mainTabs.activityLogId=this.questPanel.getFieldValue("activity_log.activity_log_id");
    	mainTabs.taskType='departmentSpaceDetailTab';
    	mainTabs.lastTab='question';
    	var activityTypeValue = this.questPanel.getFieldValue("activity_log.activity_type");
        activityTypeValue="SERVICE DESK - DEPARTMENT SPACE";
        this.quest = new Ab.questionnaire.Quest(activityTypeValue, "questPanel");
        this.quest.showQuestions();
    },
    
    /**
     * Return basic tab when we click cancel button.
     */
    questPanel_onCancel: function(){
		var mainTabs = View.parentTab.parentPanel;
		var parentCtrl = View.getOpenerView().controllers.get(0);
		parentCtrl.basicRestriction["activity_log.activity_log_id"] = mainTabs.activityLogId;
		//fix KB3031741 - add activity_log.description to the basic tab restriction before go back to basic tab(Guo 2011/06/20)
		parentCtrl.basicRestriction["activity_log.description"] = this.questPanel.getFieldValue("activity_log.description");
		
		mainTabs.selectTab("basic", parentCtrl.basicRestriction, false, true, false);
	}
  
});

/**
 * Get questionnaire field value by given field name
 * @param fieldName
 * @returns
 */
function getQuestionnaireFieldValue(fieldName){
	var activityTypeValue = controller.questPanel.getFieldValue("activity_log.activity_type");
    var tabs = View.getOpenerView().panels.get("helpDeskRequestTabs")
    tabs.activityTypeValue = activityTypeValue;
	activityTypeValue="SERVICE DESK - DEPARTMENT SPACE";
	var restriction = new Ab.view.Restriction();
	restriction.addClause('questionnaire.questionnaire_id', activityTypeValue);
//	if (!this.showInactive) 
		restriction.addClause('questions.is_active', 1);
	var ds = View.dataSources.get('exPrgQuestionnaire_questionsDs');
	var questionRecords = ds.getRecords(restriction);
	for(var i=0;i<questionRecords.length;i++){
		var quest_name = questionRecords[i].getValue("questions.quest_name");
		if(fieldName==quest_name){
 			var questionRecord = questionRecords[i];
 			var recordType = questionRecord.getValue('questions.format_type');
 			var obj = $('questPanel_question' + i + '.answer_field');
 			if(obj){
 				var value = obj.value;
 				if (recordType == 'Date') {
// 					return dateFormatQues(getDateWithISOFormat(value));
 					return getDateWithISOFormat(value);
 				}else{
 					return value;
 				}
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
 * Execute when we click next button.
 * @returns {Boolean}
 */
function onNext(){
	
	var requestDate=getQuestionnaireFieldValue('date_start');
	if(requestDate==''){
		View.alert(getMessage('requestDateNotNull'));
		return;
	}
    controller.quest.beforeSaveQuestionnaire();
    if (!controller.questPanel.save()) {
        return;
    }

	if(compareISODates(requestDate,getCurrentDateISOFormat())){
		View.showMessage(getMessage('errorEndDateInThePast'));
		return;
	}
    if (controller.questPanel.getFieldValue("activity_log.description") == '') {
        controller.questPanel.clearValidationResult();
        controller.questPanel.addInvalidField("activity_log.description", getMessage("noDescription"));
        controller.questPanel.displayValidationResult();
        return false;
    }
    //for other view call
    var mainTabs = View.parentTab.parentPanel;
    mainTabs.requestDate=dateFormatQues(requestDate);
//    var tabs = View.panels.get("helpDeskRequestTabs");
    mainTabs.findTab("assignments").isContentLoaded=false;
    mainTabs.selectTab("assignments");
}