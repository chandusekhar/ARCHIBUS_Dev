/**
 * @author Kevenxi
 */
View.createController('abEmEscalationContactsController', {

	/**
	 * generate paginated report for user selection
	 */
	abEmEscalationContacts_grid_recovery_onPaginatedReport: function(){
		if (this.abEmEscalationContacts_grid_recovery.rows.length > 0) {
			View.openPaginatedReportDialog('ab-em-escalation-contacts-pgrp.axvw', null, null);
		}else{
			showMessage(getMessage("noRecords"));
		}
	}
    
    
});
