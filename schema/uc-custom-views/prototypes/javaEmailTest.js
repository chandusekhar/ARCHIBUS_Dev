
function sendEmail(){
    alert(1);
    try {
        var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmail', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
        'UC_WRMANAGER_COM_BODY','UC_WRMANAGER_COM_SUBJECT','wr','wr_id','174662',
        '', 'ewong@brg.com');

        /*

				var result = Workflow.callMethod('AbCommonResources-ucEmailService-sendEmailCustomTags', 'AbBldgOpsOnDemandWork', 'UC_EMAIL_WFR',
				'UC_FMIT_CONTACT_US_BODY','UC_FMIT_CONTACT_US_SUBJECT','','','',
				'', sendTo, {"description": parsedDesc, "requestor": requestor });
        */
    }
    catch (ex) {
        Workflow.handleError(ex);
    }
    alert(2);
}