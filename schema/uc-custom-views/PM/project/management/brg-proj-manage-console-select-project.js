var projManageConsoleSelectProjectController = View.createController('projManageConsoleSelectProject', {

	selectProjectReport_onSelectProject : function(row, action) {
		var record = row.getRecord();
	    var project_id = record.getValue('project.project_id');
		var openerController = View.getOpenerView().controllers.get('projManageConsole');
		openerController.setProjectId(project_id);
		openerController.projManageConsoleTabs.selectTab(openerController.selectedProjManageTab);
		View.closeThisDialog();
	}
});

/****************************************************************
 * Project Restriction Console functions
 */

function onProjectIdSelval() {
	projectIdSelval("project.is_template = 0");
}
