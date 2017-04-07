var projActionsSummaryController = View.createController('projActionsSummary', {
	afterViewLoad: function() {
		var openerController = View.getOpenerView().controllers.get('projManageConsole');
		onCalcEndDatesForProject(openerController.project_id);
		
		this.projActionsSummaryGrid.afterCreateCellContent = function(row, column, cellElement) {	    
		    if (column.id == 'activity_log.status_summary') {
		    	var value = row[column.id];
		    	var contentElement = cellElement.childNodes[0];
				contentElement.nodeValue = getMessage(value);
		    }
		}
	},
	
	projActionsSummaryCrossTable_afterRefresh : function() {
			var openerController = View.getOpenerView().controllers.get('projManageConsole');
			onCalcEndDatesForProject(openerController.project_id);
	}
});

function projActionsSummaryCrossTable_onclick(obj) {
	var restriction = obj.restriction;
	if (obj.restriction.clauses[0].name != 'project.project_id') {
		restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.project_work_pkg_id', obj.restriction.clauses[0].value);
	}
	var grid = View.panels.get('projActionsSummaryGrid');
	grid.refresh(restriction);
	grid.showInWindow({
	    width: 800,
	    height: 500
	});
}
