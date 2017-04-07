var ucWrWebSiteController = View.createController('ucWrWebSiteController', {

	afterInitialDataFetch: function() {
	
		var taskFile = window.location.parameters['taskFile'];
		var websiteDisplay = View.panels.get("websiteDisplay");
		websiteDisplay.show(true);
		websiteDisplay.loadView(taskFile);
	}
});

