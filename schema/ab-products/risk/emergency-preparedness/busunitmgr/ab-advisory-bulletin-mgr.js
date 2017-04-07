/**
 * @author Kevenxi
 */
View.createController('abAdvisoryBulletinMgrController', {

	/**
	 * generate paginated report for user selection
	 */
	advPanel_onPaginatedReport: function(){
		var advisory_id = this.advPanel.getFieldValue("advisory.advisory_id");
		if (valueExists(advisory_id)) {
			View.openPaginatedReportDialog('ab-advisory-bulletin-mgr-pgrp.axvw', null, null);
		}else{
			View.showMessage(getMessage("noRecords"));
		}
	}
    
});
