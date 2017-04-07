
View.createController('exProjectFindManageSqlParams', {
	
	/**
	 * Apply a custom search filter on the list of projects.
	 * The data source uses a custom SQL query. 
	 * The filter restriction will be converted to SQL on the server and inserted into the custom SQL query.
	 */
	exProjectFindManageSqlParams_gridParameter_onFilter: function() {
	    var restriction = new Ab.view.Restriction();
	    restriction.addClause("project.description", "%RENOVATION%", "LIKE");
	    restriction.addClause("project.description", "%UPDATE%", "LIKE", "OR");
	    this.exProjectFindManageSqlParams_gridParameter.refresh(restriction);
    }
});