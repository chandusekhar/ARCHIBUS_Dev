/**
* Added for 20.1 Compliance 
*
* This view is used  as a pop-up dialog for "View Default Notification"
*
* @author Zhang Yi
*/
var defNotificationController = View.createController('defNotificationController',
{
	//sign indicate if  view is opened by clicking "View Default Notifications"
	mode:"report",

	afterInitialDataFetch: function(){
		this.abCompNotifyTemplateColumnRpt.show(false);
		this.setTitles();
	},

	isFromRequirementView:function(){
		return this.abCompNotificationGrid.restriction.indexOf("regulation")>0?true:false;
	},

	/**
	 * Private method: set proper title to grid and form
	 */
	setTitles:function(){
		if(this.isFromRequirementView()){
			this.abCompNotificationGrid.setTitle(getMessage("gridTitleForReq"));
			this.abCompNotifyTemplateColumnRpt.setTitle(getMessage("formTitleForReq"));
		} else {
			this.abCompNotificationGrid.setTitle(getMessage("gridTitleForProg"));
			this.abCompNotifyTemplateColumnRpt.setTitle(getMessage("formTitleForProg"));
		};
	}

});
