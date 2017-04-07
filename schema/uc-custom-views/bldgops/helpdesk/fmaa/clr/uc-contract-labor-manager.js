var clrController = View.createController('clrController', {

	afterViewLoad: function() {
		
	},
	
	detailsPanel_onOpenEmailDialog: function() {
		this.sendEmailDialog.refresh("1=0", true);
		this.sendEmailDialog.showInWindow({
						newRecord: false,
            closeButton: false
        });
	},
	
	
	nav_details_info_onOpenEmailDialog: function() {
		this.sendEmailDialog.refresh("1=0", true);
		this.sendEmailDialog.showInWindow({
			newRecord: false,
            closeButton: false
        });
	}
	
	
	
});


function onSendWrEmail()
{
	var sendTo = View.panels.get('sendEmailDialog').getFieldValue('wr_other.description');
	var thisWrId = View.panels.get('detailsPanel').getFieldValue('wr.wr_id');

	try {
		var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
		'UC_WRMANAGER_SENDWR_BODY','UC_WRMANAGER_SENDWR_SUBJECT','wr','wr_id',thisWrId,
		'', sendTo);
	}
	catch (ex) {
		Workflow.handleError(ex);
		return false;
	}

	alert("Email sent to "+sendTo);
	return true;
}