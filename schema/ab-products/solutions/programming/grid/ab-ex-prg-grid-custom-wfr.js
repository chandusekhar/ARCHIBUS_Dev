
View.createController('gridWithCustomWfr', {

	/**
	 * Refresh the grid passing a custom restriction to the WFR.
	 */
	prgGridCustomWfr_grid_onCustomRefresh: function() {
	    var selectedEqIds = [];
	    selectedEqIds.push('COMPR-1601');
	    selectedEqIds.push('SMOK-DET-002');

	    var restriction = new Ab.view.Restriction();
	    restriction.addClause('wr.eq_id', selectedEqIds, 'IN');
	    
	    this.prgGridCustomWfr_grid.refresh(restriction);
    }
});