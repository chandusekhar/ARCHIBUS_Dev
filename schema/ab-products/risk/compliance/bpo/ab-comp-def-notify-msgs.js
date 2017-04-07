/**

* @author Zhang Yi

*/
var defNotificationMessageController = View.createController('defNotificationMessageController',
{
	afterInitialDataFetch: function(){
		//initial array of values and texts show in drop-down list "Message Purpose"
		var valueArray = new Array( "NOTIFY_TEMPLATE_SUBJECT", "NOTIFY_TEMPLATE_BODY");
		var textArray = new Array( getMessage("subject"), getMessage("body"));
		initialDropdownList("referenced", valueArray, textArray);
		//set translated values to custom field "Message Purpose" in grid by set SQL parameters
		this.abMessages_bottomPanel.addParameter('subject',getMessage("subject"));
 		this.abMessages_bottomPanel.addParameter('body',getMessage("body"));
		//show and refresh grid after translatable configuration
		this.abMessages_bottomPanel.show(true);
		this.abMessages_bottomPanel.refresh();
   },

	abMessages_detailsPanel_afterRefresh: function(){
		//set default values to new record
		if(this.abMessages_detailsPanel.newRecord){
			this.abMessages_detailsPanel.setFieldValue("messages.activity_id", "AbRiskCompliance");
			this.abMessages_detailsPanel.setFieldValue("messages.referenced_by", $('referenced').value);
		} 
		else {
			setOptionValue('referenced', this.abMessages_detailsPanel.getFieldValue("messages.referenced_by"));
		}

		this.abMessages_detailsPanel.enableField("messages.activity_id" ,false);
    },

	onReferenceByChange:function(){
		this.abMessages_detailsPanel.setFieldValue("messages.referenced_by", $('referenced').value);
	}
});