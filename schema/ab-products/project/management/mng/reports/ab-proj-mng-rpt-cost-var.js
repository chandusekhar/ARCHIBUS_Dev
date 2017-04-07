var projMngRptCostVarController = View.createController('projMngRptCostVar', {
	project_id: '',
	work_pkg_id: '',
	
	afterInitialDataFetch: function() {
		var consoleController = View.getOpenerView().getOpenerView().controllers.get('projMng');
		this.project_id = consoleController.project_id;
		this.projMngRptCostVarCrossTable.appendTitle(this.project_id);
	},
	
	projMngRptCostVarGrid_onSelectWorkPkg : function(row, action) {
		var record = row.getRecord();
	    this.work_pkg_id = record.getValue('work_pkgs.work_pkg_id');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_id', this.project_id);
		restriction.addClause('activity_log.work_pkg_id', this.work_pkg_id);
		this.projMngRptCostVarCrossTable.refresh(restriction);
		this.projMngRptCostVarCrossTable.show(true);
		this.projMngRptCostVarCrossTable.appendTitle(this.project_id + " - " + this.work_pkg_id);
	},
	
	projMngRptCostVarActionsGrid_afterRefresh: function() {
		var title = this.project_id;
		if (this.work_pkg_id != '') {
			title += ' - ' + this.work_pkg_id;
		}
		this.projMngRptCostVarActionsGrid.appendTitle(title);
	}
});

function projMngRptCostVarCrossTable_onclick(obj) {
	var drilldown = View.panels.get('projMngRptCostVarColumnReport');
	if (obj.restriction.clauses.length < 3) {
		drilldown = View.panels.get('projMngRptCostVarActionsGrid');
		drilldown.addParameter('action_item_restriction', '1=1');
		drilldown.refresh(obj.restriction);
	}
	else {
		drilldown.addParameter('action_item_restriction', "RTRIM(wbs_id) ${sql.concat} ' - ' ${sql.concat} RTRIM(action_title) ${sql.concat} ' - ' ${sql.concat} RTRIM(activity_log_id) = '" + obj.restriction.findClause('activity_log.action_item').value + "'");
		drilldown.refresh();
	}
	drilldown.showInWindow({
	    width: 800,
	    height: 400
	});
}