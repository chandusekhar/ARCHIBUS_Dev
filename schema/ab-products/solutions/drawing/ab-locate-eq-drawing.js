
View.createController('exLocateEquipmentDrawing', {
	
	// selected grid rows
	selectedRows: null,
	
	/**
	 * Highlight all selected equipment.
	 */
	locateEquipment_equipments_onShowSelected: function() {
		// clear previous drawings
		this.locateEquipment_cadPanel.clear();

		// store selected rows
	    this.selectedRows = this.locateEquipment_equipments.getSelectedRows();

	    // show the first employee
	    this.showNextEquipment();
	},
	
	/**
	 * Highlights location of the next employee in the selectedRows array.
	 */
	showNextEquipment: function() {
		// get the next employee record
		var nextRow = this.selectedRows.pop();
		
		if (nextRow) {
			// the next employee record exists
			try {
				// highlight it
				this.locateEquipment_cadPanel.highlightAssets(null, nextRow);

				// add a delay before displaying the next employee - the drawing control requires it
				this.showNextEquipment.defer(300, this);
				
			} catch (e) {
				// handle the error
				Workflow.handleError(e);
			}
		}
	}
});

