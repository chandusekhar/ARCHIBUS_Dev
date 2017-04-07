/**
 * @fileoverview Javascript Functions for <a href='../../../viewdoc/overview-summary.html#ab-helpdesk-request-quest.axvw' target='main'>ab-helpdesk-request-quest.axvw</a>
 */

var controller = View.createController('helpDeskQuestController', {
	
	quest: null,
	
	afterInitialDataFetch: function() {
		this.inherit();
		this.questPanel.actions.get('cancel').setTitle(getMessage('previous'));
	},
	
	questPanel_afterRefresh: function(){
		this.initialEachPanel();
	},
	
	initialEachPanel: function(){
		 
		var activityTypeValue = this.questPanel.getFieldValue("activity_log.activity_type");
		
		this.quest = new Ab.questionnaire.Quest(activityTypeValue, "questPanel");
		this.quest.showQuestions();
				
		
		this.questPanel.actions.get("questNext").show(true);
		this.questPanel.actions.get("questConfirm").show(true);
		
		this.questPanel.actions.get("questNext").enable(true);
		this.questPanel.actions.get("questConfirm").enable(true);
		
		
		
		if(ABHDC_getTabsSharedParameters()["documents"]){
			this.questPanel.actions.get("questConfirm").show(false);
		} else {
			this.questPanel.actions.get("questNext").show(false);
		}
	},
	
	/**
	 * Cancel quest panel
	 */
	questPanel_onCancel: function(){
		var mainTabs = View.parentTab.parentPanel;
		var parentCtrl = View.getOpenerView().controllers.get(0);
		parentCtrl.basicRestriction["activity_log.activity_log_id"] = this.questPanel.getFieldValue("activity_log.activity_log_id");
		//fix KB3031741 - add activity_log.description to the basic tab restriction before go back to basic tab(Guo 2011/06/20)
		parentCtrl.basicRestriction["activity_log.description"] = this.questPanel.getFieldValue("activity_log.description");
		
		mainTabs.selectTab("basic", parentCtrl.basicRestriction, false, true, false);
	}
});	


 


/**
* Saves request<br />
* Calls WFR <a href='../../../javadoc/com/archibus/eventhandler/helpdesk/RequestHandler.html#submitRequest(com.archibus.jobmanager.EventHandlerContext)' target='main'>AbBldgOpsHelpDesk-submitRequest</a><br />
* Selects Overview tab
* @param {String} formName current form
*/
function onSubmit() {
	
	controller.quest.beforeSaveQuestionnaire();
	if (!controller.questPanel.save()) {
		return;
	}
	
 	var record = ABHDC_getDataRecord2(controller.questPanel);
 	                
    var id = controller.questPanel.getFieldValue("activity_log.activity_log_id");
	    
    try {
		var result = Workflow.callMethod('AbBldgOpsHelpDesk-RequestsService-submitRequest', id,record);
	}catch(e){
		if (e.code == 'ruleFailed'){
			View.showMessage(e.message);
		}else{
			Workflow.handleError(e);
		}
		return;  
	}
	
	if (result.code == 'executed') { 
		var tabs = View.getOpenerView().panels.get('helpDeskRequestTabs'); 	
       	var restriction = new Ab.view.Restriction();
       	restriction.addClause("activity_log.activity_log_id",id,"=");
       	       	
       	tabs.selectTab("result",restriction,false,false,false);
    } else {
    	 
    	Workflow.handleError(result);            		 
    }
    
    //controller.questPanel.actions.get("questConfirm").enable(false); 
 
}
 /**
  * Forword next tabs.
  * @returns {Boolean}
  */
function onNext(){
	
	controller.quest.beforeSaveQuestionnaire();
	if (!controller.questPanel.save()) {
		return;
	}
	
	if(controller.questPanel.getFieldValue("activity_log.description") == ''){
		controller.questPanel.clearValidationResult();	
		controller.questPanel.addInvalidField("activity_log.description",getMessage("noDescription"));
		controller.questPanel.displayValidationResult();
		return false;
	}
	var activityLogIdValue = controller.questPanel.getFieldValue("activity_log.activity_log_id");
	
	var restriction = new Ab.view.Restriction();
	restriction.addClause("activity_log.activity_log_id",activityLogIdValue);

	var tabs = View.getOpenerView().panels.get("helpDeskRequestTabs");
 	tabs.selectTab("docs",restriction,false,false,false);
}
 