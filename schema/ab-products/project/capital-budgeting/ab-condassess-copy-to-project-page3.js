var condassessCopyToProjectPage3Controller = View.createController('condassessCopyToProjectPage3', {
	
	condassessCopyToProjectPage3Grid_afterRefresh : function() {
		var condassessCopyToProjectController = View.getOpenerView().controllers.get('condassessCopyToProject');
		this.condassessCopyToProjectPage3Grid.appendTitle(condassessCopyToProjectController.projectIdName);
	}
});