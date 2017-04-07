/**
 * Controller for the Preload Views view.
 */
View.createController('searchViews', {

	searchPanel_onStart : function() {

		try {
			var searchString = $('searchString').value;
			var jobId = Workflow.startJob('AbSystemAdministration-SearchService-searchForString', searchString);
			var controller = this;
			
	        View.openJobProgressBar(
	            getMessage('search_progress_message'),
			    jobId, 
			    '', 
			    function(status) {
					// View.showMessage(getMessage('search_success_message'));
			    }
	        );
		} catch (e) {
			Workflow.handleError(e);
		}
	}
});
