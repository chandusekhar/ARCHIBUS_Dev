/**
 * Controller for the View Activities view.
 */
var viewActivitiesController = View.createController('viewActivities', {
    
    /**
     * This function called after the view is loaded and the initial data fetch is complete.
     * Restricts for activities which contain processes. 
     */
    afterInitialDataFetch: function() {
    	var restriction = "EXISTS (SELECT * FROM afm_processes WHERE afm_processes.activity_id = afm_activities.activity_id)";
        this.detailsPanel.refresh(restriction);
    }
});
