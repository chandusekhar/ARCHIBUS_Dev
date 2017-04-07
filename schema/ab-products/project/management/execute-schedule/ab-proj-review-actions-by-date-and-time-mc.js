var projReviewActionsByDateAndTimeController = View.createController('projReviewActionsByDateAndTime', {

	consolePanel_afterRefresh: function() {
		this.consolePanel_onClear();
	},

	consolePanel_onClear : function() {
		clearConsole();
		if ($('num_days')) $('num_days').value = 0;
		var controller = View.getOpenerView().controllers.get('projManageConsole');
		this.consolePanel.setFieldValue('project.project_id', controller.project_id);
		this.consolePanel.enableField('project.project_id', false);
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

function workPkgSelvalWithRestriction()
{
	workPkgIdSelval('');
}
