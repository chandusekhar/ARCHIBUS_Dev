
View.createController('navigatorTest', {
	
	selectedActivityId: '',
	selectedProcessId: '',
	
	activities_grid_onSelectActivity: function(row) {
		this.selectedActivityId = row.getRecord().getValue('afm_activities.activity_id');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_processes.activity_id', this.selectedActivityId);
		
		this.processes_grid.refresh(restriction);
	},
	
	processes_grid_onSelectProcess: function(row) {
		this.selectedProcessId = row.getRecord().getValue('afm_processes.process_id');
		
		var restriction = new Ab.view.Restriction();
		restriction.addClause('afm_tasks.activity_id', this.selectedActivityId);
		restriction.addClause('afm_tasks.process_id', this.selectedProcessId);
		
		this.tasks_grid.refresh(restriction);
	}
});