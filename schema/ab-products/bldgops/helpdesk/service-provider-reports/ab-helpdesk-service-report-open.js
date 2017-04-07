View.createController('helpdeskReportOpen', {

    /**
     * After the panel is created but before the initial data fetch: 
     * add custom event listener to the panel's afterGetData event.
     */
    afterViewLoad: function() {
        this.crossPanel.addEventListener('afterGetData', this.crossPanel_afterGetData, this);
    },
    
    /**
     * Now that the afterGetData listener is set, force the cross-table to refresh.
     */
    afterInitialDataFetch: function() {
        this.crossPanel.refresh();
    },
    
    /**
     * Custom afterGetData listener, called by the cross-tab panel after it egts the data from 
     * the server, but before the data is used to build the cross-table. 
     * @param {Object} panel   The calling cross-table panel.
     * @param {Object} dataSet The data set recieved from the server - can be modified here.
     */
    crossPanel_afterGetData: function(panel, dataSet) {
        // change all row titles
        for (var r = 0; r < dataSet.rowValues.length; r++) {
			if (dataSet.rowValues[r].l == "Not escalated"){
				dataSet.rowValues[r].l = getMessage("escalationType_notEscalated");
			}
			if (dataSet.rowValues[r].l == "Escalated for Response"){
				dataSet.rowValues[r].l = getMessage("escalationType_EscalatedforResponse");
			}
			if (dataSet.rowValues[r].l == "Escalated for Completion"){
				dataSet.rowValues[r].l = getMessage("escalationType_EscalatedforCompletion");
			}
        }
    }
})