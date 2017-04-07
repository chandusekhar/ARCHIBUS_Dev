var projMngRptSchedVarActController = View.createController('projMngRptSchedVarAct', {
	project_id: '',
	
	afterViewLoad: function() {
		this.project_id = View.getOpenerView().getOpenerView().controllers.get('projMng').project_id;
		onCalcEndDatesForProject(this.project_id);
	},
	
	afterInitialDataFetch: function() {
		this.projMngRptSchedVarActCrossTable.appendTitle(this.project_id);
	}
});

function projMngRptSchedVarActCrossTable_onclick(obj) {
	var grid = View.panels.get('projMngRptSchedVarActDrilldownGrid');
	if (obj.restriction.clauses.length > 1) {
		grid.addParameter('project_work_pkg_restriction', "RTRIM(activity_log.project_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(activity_log.work_pkg_id) = '" + obj.restriction.clauses[0].value + "'");
		grid.refresh();
	}
	else {
		grid.addParameter('project_work_pkg_restriction', '1=1');
		var restriction = View.panels.get('projMngRptSchedVarActCrossTable').restriction;
		grid.refresh(restriction);
	}
	grid.showInWindow({
	    width: 800,
	    height: 500
	});
}
