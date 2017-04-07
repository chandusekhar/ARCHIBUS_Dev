var abExFormPanelTempMessageCtrl = View.createController('abExFormPanelTempMessageCtrl', {
	abExFormPanelTempMessage_form_onDisplayMessage: function(){
		this.abExFormPanelTempMessage_form.displayTemporaryMessage(getMessage("messageDefaultDuration"));
	},
	
	abExFormPanelTempMessage_form_onDisplayMessageFive: function(){
		this.abExFormPanelTempMessage_form.displayTemporaryMessage(getMessage("messageFiveDuration"), 5000);
	}
});