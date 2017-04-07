
View.createController('exLocateEmployeeDrawing', {
	
	// selected grid rows
	selectedRows: null,
	
	// number of selected grid rows
	totalSelectedRows: 0,
	
	/**
	 * Highlight all selected employees.
	 */
	locateEmployee_employees_onShowSelected: function() {
		// clear previous drawings
		this.locateEmployee_cadPanel.clear();

		// store selected rows
	    this.selectedRows = this.locateEmployee_employees.getSelectedRows();
	    this.totalSelectedRows = this.selectedRows.length; 

	    // display the progress indicator - the operation might take a while
	    View.initializeProgressBar();
	    
	    // show the first employee
	    this.showNextEmployee();
	},
	
	/**
	 * Highlights location of the next employee in the selectedRows array.
	 */
	showNextEmployee: function() {
		// get the next employee record
		var nextRow = this.selectedRows.pop();
		
		if (nextRow) {
			// the next employee record exists
			try {
				// highlight it
				this.locateEmployee_cadPanel.highlightAssets(null, nextRow);
				// update the progress bar
				View.updateProgressBar((this.totalSelectedRows - this.selectedRows.length) / this.totalSelectedRows);
				// add a delay before displaying the next employee - the drawing control requires it
				this.showNextEmployee.defer(300, this);
				
			} catch (e) {
				// handle the error
				View.closeProgressBar();
				Workflow.handleError(e);
			}
		} else {
			// we have displayed all employee records
			View.closeProgressBar();
		}
	}
});

