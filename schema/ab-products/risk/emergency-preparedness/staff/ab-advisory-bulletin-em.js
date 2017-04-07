/**
 * @author Kevenxi
 */
View.createController('abAdvisoryBulletinEmController', {

	/**
	 * generate paginated report for user selection
	 */
	abadvisoryBulletinEm_colrep_advisory_onPaginatedReport: function(){
		var advisory_id = this.abadvisoryBulletinEm_colrep_advisory.getFieldValue("advisory.advisory_id");
		if (valueExists(advisory_id)) {
			View.openPaginatedReportDialog('ab-advisory-bulletin-em-pgrp.axvw', null, null);
		}else{
			View.showMessage(getMessage("noRecords"));
		}
	}
    
});
