
/**
 * The simplified JS source code that uses the Ab.paginate.ProgressPanel class available in V20.1.
 */
View.createController('progressPanelExampleController', {
	
	// Ab.paginate.ProgressPanel
	progressPanelWrapper: null,

    /**
     * Creates the progress panel instance.
     */
    afterViewLoad: function() {
	    this.progressPanelWrapper = new Ab.paginate.ProgressPanel(this.progressPanel, 
	    		this.afterJobFinished.createDelegate(this));
    },
    
    /**
     * Called by the Start Job / Stop Job button.
     */
    progressPanel_onProgressButton: function(row, action) {
        // if job has not run, start the job
        if (!this.progressPanelWrapper.isJobStarted()) {
        	// get and validate the date range
            var dateStart = this.consolePanel.getFieldValue("rmpct.date_start");
            var dateEnd = this.consolePanel.getFieldValue("rmpct.date_end");
        	if (!this.validateDateRange(dateStart, dateEnd)) {
        		return;
        	}
        	
        	// start the job and get the job ID/status
            var jobId = Workflow.startJob('AbCommonResources-SpaceService-updateAreaTotalsSpaceTime', dateStart, dateEnd);

            // notify the progress panel
            this.progressPanelWrapper.onJobStarted(jobId);
            
        } else if (!this.progressPanelWrapper.isJobFinished()) {
            // if the job has not yet complete, then the user wants to stop the job
        	this.progressPanelWrapper.stopJob();
        }
    },
    
    /**
     * Validates the console values. Returns true if values are valid.
     */
    validateDateRange: function(dateStart, dateEnd) {
        if (!(dateStart && dateEnd)) {
            View.showMessage(getMessage("enterDateValue"));
            return false;
        }
        
    	//kb3022805
        if (compareLocalizedDates(
        		this.consolePanel.getFieldElement('rmpct.date_end').value, 
        		this.consolePanel.getFieldElement('rmpct.date_start').value)) {
            View.showMessage(getMessage('errorDateStartEnd'));
            return false;
        }
        
        return true;
    },

    /**
     * Called by the progress panel after the job has finished.
     */
    afterJobFinished: function(status) {
	    View.alert('Job ' + status.jobId + ' has finished');
	    
	    // clear the progress panel status so that the job can be started again
	    this.progressPanelWrapper.clear();
    }
});





