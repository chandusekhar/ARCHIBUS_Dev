
View.createController('gridGetRecords', {
    
    afterInitialDataFetch: function() {
        try {
        	// get records from the data source
        	var dataRecords = this.prgGridGetRecords_gridDs.getRecords();
        	
        	// add them to the grid
            this.prgGridGetRecords_grid.setRecords(dataRecords);
            
            // show the grid
            this.prgGridGetRecords_grid.show();
            
        } catch (e) {
            Workflow.handleError(e);
        }
    }
});