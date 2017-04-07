var projReviewActionsByDateAndTimeController = View.createController('projReviewActionsByDateAndTime', {

	consolePanel_onClear : function() {
		clearConsole();
		if ($('num_days')) $('num_days').value = 0;
	},
	
	consolePanel_onShow : function() {
		if (this.consolePanel.getFieldValue('project.project_id') == '') 
		{
			View.showMessage(getMessage('emptyRequiredField'));
			return;
		}
		var project_id = this.consolePanel.getFieldValue('project.project_id');
		var work_pkg_id = this.consolePanel.getFieldValue('work_pkgs.work_pkg_id');
		if (!onCalcEndDates(project_id, work_pkg_id)) return;
		var restriction = getConsoleRestrictionForActions();
		if (trim($('activity_log.activity_type').value)) restriction += " AND activity_log.activity_type = \'" + getValidValue('activity_log.activity_type') + "\'";
		this.projReviewActionsByDateAndTimeActionsGrid.refresh(restriction);
		this.projReviewActionsByDateAndTimeActionsGrid.appendTitle(project_id);
	}
});

function projSelvalWithRestriction()
{
	var restriction = "project.is_template = 0 AND EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = project.project_id "+
		"AND activity_log.work_pkg_id IN (SELECT work_pkg_id FROM work_pkg_bids WHERE work_pkg_bids.status "+
		"IN ( 'Contract Signed', 'In Process', 'In Process-On Hold', 'Completed', 'Completed and Verified', 'Paid in Full') "+
		"AND vn_id = (SELECT vn_id FROM vn WHERE vn.email='"+View.user.email+"')))";
	projectIdSelval(restriction);
}

function workPkgSelvalWithRestriction()
{
	var restriction = "EXISTS (SELECT 1 FROM activity_log WHERE activity_log.project_id = work_pkgs.project_id "+
		"AND activity_log.work_pkg_id = work_pkgs.work_pkg_id) AND work_pkgs.work_pkg_id "+
		"IN (SELECT work_pkg_id FROM work_pkg_bids WHERE work_pkg_bids.status "+
		"IN ( 'Contract Signed', 'In Process', 'In Process-On Hold', 'Completed', 'Completed and Verified', 'Paid in Full') "+
		"AND vn_id = (SELECT vn_id FROM vn WHERE vn.email='"+View.user.email+"'))";
	workPkgIdSelval(restriction);
}
