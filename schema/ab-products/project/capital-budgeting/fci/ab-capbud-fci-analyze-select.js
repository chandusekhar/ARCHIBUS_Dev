var capbudFciAnalyzeSelectController = View.createController('capbudFciAnalyzeSelect', {

	capbudFciAnalyzeSelectProjects_onSelect : function () {
		var records = this.capbudFciAnalyzeSelectProjects.getSelectedRecords();
		var openerController = View.getOpenerView().controllers.get('capbudFciAnalyze');
		openerController.projects = records;
		openerController.showConsoleValues();
		View.closeThisDialog();
	},
	
	capbudFciAnalyzeSelectBuildings_onSelect : function () {
		var records = this.capbudFciAnalyzeSelectBuildings.getSelectedRecords();
		var openerController = View.getOpenerView().controllers.get('capbudFciAnalyze');
		openerController.buildings = records;
		openerController.showConsoleValues();
		View.closeThisDialog();
	},
	
	capbudFciAnalyzeSelectScenarios_onSelect : function () {
		var records = this.capbudFciAnalyzeSelectScenarios.getSelectedRecords();
		var openerController = View.getOpenerView().controllers.get('capbudFciAnalyze');
		openerController.scenarios = records;
		openerController.showConsoleValues();
		View.closeThisDialog();
	}
});