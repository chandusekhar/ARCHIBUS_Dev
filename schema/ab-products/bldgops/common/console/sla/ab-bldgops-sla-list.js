/**
 * Controller for SLA result list.
 */
View.createController('slaList', {

	/**
	 * Show actions in actions bar.
	 */
	afterViewLoad : function() {
		this.slaList.addEventListener('afterGetData', this.afterGetData, this);
		this.slaList.actionbar.actions.each(function(action) {
			action.show(true);
		});
		
		this.slaList.prevListener = this.goPrevPage;
		this.slaList.nextListener = this.goNextPage;
	},
	
	/**
	 * After fix KB3042033, The main view title(Manage Service Level Agreements) will be overwrited, so Hide summary form after view initialed.
	 */
	afterInitialDataFetch : function() {
		this.summaryForm.show(false);
	},
	
	/**
     * Go to previous page 
     */
	goPrevPage: function() {
		//this == grid slaList
		var currentPage = this.firstRecords.length + 1;
		this.addParameter('targetPage',currentPage - 1);
		this.onClickPrev();
	},
	
	/**
     * Go to next page 
     */
	goNextPage: function() {
		//this == grid slaList
		var currentPage = this.firstRecords.length + 1;
		this.addParameter('targetPage', currentPage + 1);
		this.onClickNext();
	},
	
	/**
     * Custom afterGetData listener, called by the grid after it gets the data from the server. 
	 * Replace Data from Database with Data of selected standard xls file.
	*
     * @param {Object} panel   The tree panel.
     * @param {Object} dataSet The data set recieved from the server.
     */
    afterGetData: function(panel, dataSet) {
		dataSet.index = [];
		panel.primaryKeyIds = ['helpdesk_sla_request.grouping'];
		panel.allCount = dataSet.allCount;
		if (panel.allCount > panel.recordLimit) {
			dataSet.hasMoreRecords = true;
			panel.hasPaging = true;
		}
	},
	
	/**
	 * Trigger delete SLA event when 'Delete Selected' in the action bar.
	 */
	slaList_onDeleteSelected : function() {
		var selectedRows = this.slaList.getSelectedRows();
		this.trigger('app:operation:express:sla:deleteSLA', selectedRows);
	},

	/**
	 * Trigger quick edit event when click the 'Quick Edit' button.
	 */
	slaList_onQuickEdit : function(row, action) {
		this.trigger('app:operation:express:sla:quickEditSLA', row);
	},

	/**
	 * Trigger edit details event when click the 'Edit Details' button.
	 */
	slaList_onEditDetails : function(row, action) {
		this.trigger('app:operation:express:sla:editDetailsSLA', row);
	},

	/**
	 * Trigger copy SLA event when click the 'Duplicate' button.
	 */
	slaList_onDuplicateSLA : function(row, action) {
		this.trigger('app:operation:express:sla:copySLA', row);
	},

	/**
	 * Trigger delete SLA event when click the 'X' button in the grid row.
	 */
	slaList_onDeleteSLA : function(row, action) {
		this.trigger('app:operation:express:sla:deleteSLA', row);
	}

});

/**
 * Trigger show summary event when click the text in the grid row.
 */
function showSLASummary() {
	var grid = View.panels.get('slaList');
	View.controllers.get(0).trigger('app:operation:express:sla:showSLASummaryPopUp',
			grid.rows[grid.selectedRowIndex].row);
}
