var projReviewWorkPkgsOutForBidController = View.createController('projReviewWorkPkgsOutForBid', {

	projReviewWorkPkgsOutForBid_console_onFilter : function() {
		var restriction = getConsoleRestriction();
		this.selectWorkPkgReport.refresh(restriction);
		this.selectWorkPkgReport.show(true);
	},
	
	projReviewWorkPkgsOutForBid_bidReport_afterRefresh : function() {
		if (this.projReviewWorkPkgsOutForBid_bidReport.gridRows.getCount() <= 0)
			this.projReviewWorkPkgsOutForBid_bidReport.actions.get('addBid').enable(true);
		else {
			this.projReviewWorkPkgsOutForBid_bidReport.actions.get('addBid').enable(false);
			var action = this.projReviewWorkPkgsOutForBid_bidReport.gridRows.get(0).actions.get('edit');
			var record = this.projReviewWorkPkgsOutForBid_bidReport.gridRows.get(0).getRecord();
			var status = record.getValue('work_pkg_bids.status');
			if (status == 'Created' || status == 'Withdrawn') action.setTitle(getMessage('edit'));
			else action.setTitle(getMessage('view'));
		}
	},
	
	projReviewWorkPkgsOutForBid_bidReport_onEdit : function(row, action) {
		var record = row.getRecord();
		var status = record.getValue('work_pkg_bids.status');
		var restriction = this.projReviewWorkPkgsOutForBid_bidReport.getPrimaryKeysForRow(this.projReviewWorkPkgsOutForBid_bidReport.rows[0]);
		if (status == 'Created' || status == 'Withdrawn')
			View.openDialog('ab-proj-review-work-packages-out-for-bid-edit.axvw', restriction);
		else View.openDialog('ab-proj-review-work-packages-out-for-bid-report.axvw', restriction);
	},
	
	projReviewWorkPkgsOutForBid_bidReport_onAddBid : function() {
		var parameters = {};
		parameters.fieldValues = toJSON({
			'work_pkg_bids.project_id': this.projReviewWorkPkgsOutForBid_bidReport.restriction['work_pkgs.project_id'], 
			'work_pkg_bids.work_pkg_id': this.projReviewWorkPkgsOutForBid_bidReport.restriction['work_pkgs.work_pkg_id']
		});
		try {
	    	var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-addWorkPkgBid', parameters);
	    	var data = eval('('+result.jsonExpression+')');
			if (!data.emailMatchesVendor) 
			{
				View.showMessage(getMessage('noMatchingEmail'));
				return;
			}
			this.projReviewWorkPkgsOutForBid_bidReport.refresh();
			var restriction = this.projReviewWorkPkgsOutForBid_bidReport.getPrimaryKeysForRow(this.projReviewWorkPkgsOutForBid_bidReport.rows[0]);
			View.openDialog('ab-proj-review-work-packages-out-for-bid-edit.axvw', restriction);
		} catch (e) {
	    	Workflow.handleError(e);
		}
	}	
});

function getConsoleRestriction() {
	var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";
		
	var projReviewWorkPkgsOutForBid_console = View.panels.get('projReviewWorkPkgsOutForBid_console');
    var restriction = "";
	if (projReviewWorkPkgsOutForBid_console.getFieldValue('bl.state_id')) 
	{
		restriction += "(" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction +=  siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) AND ";
	}
   	if (projReviewWorkPkgsOutForBid_console.getFieldValue('bl.city_id'))	
   	{
   		restriction += "(" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction +=  siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) AND ";
   	} 
   	restriction += "project.project_id IS NOT NULL";
   	return restriction;
}

function getValidValue(inputFieldName)
{
	var consolePanel = View.panels.get('projReviewWorkPkgsOutForBid_console');
	var fieldValue = consolePanel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "''");
	return fieldValue;
}
