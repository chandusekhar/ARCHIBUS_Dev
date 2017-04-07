/**
*
*  Added for 20.1 Compliance  :  second tab view of "Manage Notification Templates", 
*														   similiar  to edit form panel of 'Define Notification Templates' 
* @author Zhang Yi
*
*/
var editNotificationController = View.createController('editNotificationController',
{
	tabs:null,

	abCompNotificationForm_afterRefresh: function(){
        if (View.parentTab && View.parentTab.parentPanel) {
           this.tabs = View.parentTab.parentPanel;

			if(!this.abCompNotificationForm.newRecord){
				this.tabs.workflow = 'free';
				this.tabs.setAllTabsEnabled(true);
				this.tabs.selectedTemplateId = this.abCompNotificationForm.getFieldValue("notifications.template_id");
				this.tabs.eventId = this.abCompNotificationForm.getFieldValue("notifications.activity_log_id");
			}

			if(this.tabs.isEdit!=null && this.tabs.isEdit!="undefined"){
				showAllActionsOfPanel(this.abCompNotificationForm,this.tabs.isEdit);
				enableAllFieldsOfPanel(this.abCompNotificationForm,this.tabs.isEdit);
			}

			var index = View.getOpenerView().controllers.length;
			var parentController = View.getOpenerView().controllers.get(index-1);
			if("report" ==parentController.mode){
					showAllActionsOfPanel(this.abCompNotificationForm,false);
					enableAllFieldsOfPanel(this.abCompNotificationForm,false);
					this.abCompNotificationForm.setTitle(getMessage("reportTitle"));
			}  else {
					showAllActionsOfPanel(this.abCompNotificationForm,true);
					enableAllFieldsOfPanel(this.abCompNotificationForm,true);
					this.abCompNotificationForm.setTitle(getMessage("editTitle"));
			}
		}

		var templateId = 	this.abCompNotificationForm.getFieldValue("notifications.template_id");
		this.refreshRestTabs("viewNotifyTemplate", "notify_templates.template_id='"+templateId+"'");
		var eventId = 	this.abCompNotificationForm.getFieldValue("notifications.activity_log_id");
		this.refreshRestTabs("viewEvent", "activity_log.activity_log_id="+eventId+"");
   },

	refreshRestTabs: function(tabName, restriction) {
		if(this.tabs){
			this.tabs.enableTab(tabName,true);
			var subTab = this.tabs.findTab(tabName);
			//subTab.loadView();
			subTab.restriction = restriction;
		}
	},
	
	/*
	* Event Handler function: refresh the Notify Template column report when user change the 'Notification Template Code' in form and save it. 
	*/
	refreshTemplateColumnRpt: function() {
		var templateId = 	this.abCompNotificationForm.getFieldValue("notifications.template_id");
		this.refreshRestTabs("viewNotifyTemplate", "notify_templates.template_id='"+templateId+"'");
	}
 });