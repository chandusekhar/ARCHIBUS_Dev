View.createController('exGroupMoves', {

	/**
	 * Called when the user selects a project to edit.
	 */
	projectList_onEdit: function(row, action) {
	    // expand the south region with project tabs
	    var layoutManager = View.getLayoutManager('mainLayout');
	    layoutManager.expandRegion('south');
	    layoutManager.setRegionSize('east', 300);
	    
	    // create a restriction for selected project
	    var projectId = row.getRecord().getValue('project.project_id');
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('project.project_id', projectId);

	    // refresh all panels
	    this.projectReport.refresh(restriction);
	    this.projectForm.refresh(restriction);
	    this.employeeList.refresh(restriction);
	    this.newHireList.refresh(restriction);
	    this.leavingList.refresh(restriction);

	    // this is required to make the tabs visible after the layout region is expanded
	    this.projectTabs.afterLayout();
    }
});