
View.createController('testGridRestrictions', {
	
	/**
	 * Apply restriction with clauses combined using the AND operation (default). 
	 */
	testGridRestrictions_grid_onAnd: function() {
		var restriction = new Ab.view.Restriction();
	    restriction.addClause("wr.requestor", 'ABERNATHY, ALISON', "=");
	    restriction.addClause("wr.status", 'R', "=");
		this.testGridRestrictions_grid.refresh(restriction);
	},
	
	/**
	 * Apply restriction with clauses combined using the OR operation. 
	 */
	testGridRestrictions_grid_onOr: function() {
		var restriction = new Ab.view.Restriction();
	    restriction.addClause("wr.requestor", 'JONES, BECKY', "=");
	    restriction.addClause("wr.requestor", 'BARTLETT, JOAN', "=", "OR");
	    restriction.addClause("wr.requestor", 'LARGENKINS, CHRISTINE', "=", "OR");
		this.testGridRestrictions_grid.refresh(restriction);
	},
	
	/**
	 * Apply restriction with clauses combined using AND and )OR( operations.
	 * (requestor = 'ABERNATHY, ALISON' AND status = 'Approved') OR (requestor = 'BECKWITH, DAVID' AND status = 'Requested') 
	 */
	testGridRestrictions_grid_onCombination: function() {
		var restriction = new Ab.view.Restriction();
	    restriction.addClause("wr.requestor", 'ABERNATHY, ALISON', "=");
	    restriction.addClause("wr.status", 'A', "=");
	    restriction.addClause("wr.requestor", 'BECKWITH, DAVID', "=", ")OR(");
	    restriction.addClause("wr.status", 'R', "=");
		this.testGridRestrictions_grid.refresh(restriction);
	}
});
