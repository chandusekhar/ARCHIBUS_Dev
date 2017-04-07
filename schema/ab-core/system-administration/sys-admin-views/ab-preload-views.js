/**
 * Controller for the Preload Views view.
 */
View.createController('preloadViews', {
	
	/**
	 * If the view is invoked with another view name as a URL parameter, preload specified view.
	 */
	afterInitialDataFetch: function() {
		var viewname = window.location.parameters['viewname'];
		if (valueExists(viewname)) {
			try {
			    Workflow.callMethod('AbSystemAdministration-ConfigHandlers-preloadView', viewname);
			    View.alert(viewname + ' loaded');
			} catch (e) {
				Workflow.handleError(e);
			}
		}
	},

	preloadPanel_onStartAll: function() {
		this.startPreload('AbSystemAdministration-ConfigHandlers-preloadAllViews');
	},

	preloadPanel_onStartNavigatorOnly: function() {
		this.startPreload('AbSystemAdministration-ConfigHandlers-preloadNavigatorViews');
	},

    /**
     * Starts the preload job.
     */
	startPreload: function(workflowRuleId) {
		try {
			var jobId = Workflow.startJob(workflowRuleId);
			
			var controller = this;
			
	        View.openJobProgressBar(
	            getMessage('preload_progress_message'),
			    jobId, 
			    '', 
			    function(status) {
					View.showMessage(getMessage('preload_success_message'));
			    }
	        );
		} catch (e) {
			Workflow.handleError(e);
		}
	}
});
