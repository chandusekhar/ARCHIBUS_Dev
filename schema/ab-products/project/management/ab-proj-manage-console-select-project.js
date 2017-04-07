var projManageConsoleSelectProjectController = View.createController('projManageConsoleSelectProject', {
	
	afterInitialDataFetch: function() {
		if (this.view.taskInfo.activityId == 'AbProjCommissioning') {
			var console = View.panels.get('consolePanel');
			console.setFieldValue('project.project_type', 'COMMISSIONING');
			var restriction = new Ab.view.Restriction();
			restriction.addClause('project.project_type', 'COMMISSIONING');
			this.selectProjectReport.refresh(restriction);
		}
	},
	
	selectProjectReport_onSelectProject : function(row, action) {
		var record = row.getRecord();
	    var project_id = record.getValue('project.project_id');
	    var project_name = record.getValue('project.project_name');
		var openerController = View.getOpenerView().controllers.get('projManageConsole');
		openerController.setProjectId(project_id);
		openerController.project_name = project_name;
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