/**
*
*  Added for 20.2 Compliance  :  first tab of panel1 of  "Compliance Event Notifications" report 
*														   
* @author Zhang Yi
*
*/
var rptNotificationController = View.createController('rptNotificationController',
{
	tabs:null,

	abCompNotificationForm_afterRefresh: function(){
        if (View.parentTab && View.parentTab.parentPanel) {
			this.tabs = View.parentTab.parentPanel;
			var templateId = 	this.abCompNotificationForm.getFieldValue("notifications.template_id");
			this.refreshRestTabs("viewNotifyTemplate", "notify_templates.template_id='"+templateId+"'");
			var eventId = 	this.abCompNotificationForm.getFieldValue("notifications.activity_log_id");
			this.refreshRestTabs("viewEvent", "activity_log.activity_log_id="+eventId+"");
		}
        var notifyId = this.abCompNotificationForm.getFieldValue("notifications.notify_id");
		this.abCompNotificationLog.addParameter('notifyId', notifyId);
        this.abCompNotificationLog.refresh();
        
   },

	refreshRestTabs: function(tabName, restriction) {
		if(this.tabs){
			this.tabs.enableTab(tabName,true);
			var subTab = this.tabs.findTab(tabName);
			//subTab.loadView();
			subTab.restriction = restriction;
		}
	}

 });