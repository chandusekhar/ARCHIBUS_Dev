var projActionsSummaryController = View.createController('projActionsSummary', {
	statusSummaryValues: ['pending','ongoing','overdue','completed','overduePending','overdueOngoing'],
	
	afterViewLoad: function() {
		var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
		onCalcEndDatesForProject(projMngController.project_id);
		
		for (var i = 0; i < this.statusSummaryValues.length; i++) {
			var statusSummary = this.statusSummaryValues[i];
			this.projActionsSummaryGrid.addParameter(statusSummary, getMessage(statusSummary));
		}
	},
	
	projActionsSummaryCrossTable_beforeRefresh : function() {
		var projMngController = View.getOpenerView().getOpenerView().controllers.get('projMng');
		if (projMngController.project_id) { 
			onCalcEndDatesForProject(projMngController.project_id);
		}
	}
});

function projActionsSummaryCrossTable_onclick(obj) {
	var grid = View.panels.get('projActionsSummaryGrid');
	if (obj.restriction.clauses[0].name != 'project.project_id') {
		grid.addParameter('project_work_pkg_restriction', "RTRIM(project_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(work_pkg_id) = '" + obj.restriction.clauses[0].value + "'");
		grid.refresh();
	}
	else {
		grid.addParameter('project_work_pkg_restriction', '1=1');
		grid.refresh(obj.restriction);
	}
	grid.showInWindow({
	    width: 800,
	    height: 500
	});
	grid.appendTitle(obj.restriction.clauses[0].value);
}
