var projAtRiskWorkPkgsController = View.createController('projAtRiskWorkPkgs', {
	comments: ['budget_excess','cost_equal_budget','cost_exceeded_budget','ahead_of_schedule','equal_to_schedule','behind_schedule'],
	
	afterViewLoad: function() {
	    this.projAtRiskWorkPkgsCrossTable.addEventListener('afterGetData', this.projAtRiskWorkPkgsCrossTable_afterGetData, this);
	    
	    for (var i = 0; i < this.comments; i++) {
			this.projAtRiskWorkPkgsCrossTable.addParameter(this.comments[i], getMessage(this.comments[i]));
		}	
	    
	},
	
	projAtRiskWorkPkgsCrossTable_afterGetData: function(panel, dataSet) {
		dataSet.totals[0].localizedValues['activity_log.cost_performance_index_value'] = '';
		dataSet.totals[0].localizedValues['activity_log.scheduled_perf_index_value'] = '';
		dataSet.totals[0].localizedValues['activity_log.cost_performance_comment'] = '';
		dataSet.totals[0].localizedValues['activity_log.scheduled_performance_comment'] = '';
		for (var i = 0; i < dataSet.records.length; i++) {
			var cost_comment = dataSet.records[i].localizedValues['activity_log.cost_performance_comment'];
			switch (cost_comment) {
			case '1':
				dataSet.records[i].localizedValues['activity_log.cost_performance_comment'] = getMessage('budget_excess'); break;
			case '2':
				dataSet.records[i].localizedValues['activity_log.cost_performance_comment'] = getMessage('cost_equal_budget'); break;
			case '3':
				dataSet.records[i].localizedValues['activity_log.cost_performance_comment'] = getMessage('cost_exceeded_budget');
			}
			var schedule_comment = dataSet.records[i].localizedValues['activity_log.scheduled_performance_comment'];
			switch (schedule_comment) {
			case '4':
				dataSet.records[i].localizedValues['activity_log.scheduled_performance_comment'] = getMessage('ahead_of_schedule'); break;
			case '5':
				dataSet.records[i].localizedValues['activity_log.scheduled_performance_comment'] = getMessage('equal_to_schedule'); break;
			case '6':
				dataSet.records[i].localizedValues['activity_log.scheduled_performance_comment'] = getMessage('behind_schedule');
			}
		}
	},
	
	afterInitialDataFetch : function() {
		this.projAtRiskWorkPkgsCrossTable.refresh();
	}
});

function projAtRiskWorkPkgsCrossTable_onclick(obj) {
	if (obj.restriction.clauses.length < 2) return;
	View.openDialog('ab-proj-at-risk-work-pkgs-drill-down.axvw', obj.restriction);	
}
