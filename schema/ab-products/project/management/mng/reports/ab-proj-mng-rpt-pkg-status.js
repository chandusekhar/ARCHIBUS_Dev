var projMngRptPkgStatusController = View.createController('projMngRptPkgStatus', {
	
	afterInitialDataFetch: function() {
		var project_id = View.getOpenerView().getOpenerView().controllers.get('projMng').project_id;
		this.projMngRptPkgStatusGrid.appendTitle(project_id);
	}
});

