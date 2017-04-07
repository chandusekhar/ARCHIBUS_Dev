var exampleController = View.createController('example', {
	chartStackedBar_chart_onPpt: function() {
	
	    var slides = [];
		   
		var panel = View.panels.get("chartStackedBar_chart");
		var title = $('chartStackedBar_chart_title').innerHTML;
		var image = panel.getImageBytes();
		slides.push({'title': title, 'images':[image]});

		 var jobId =  Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
		 View.openJobProgressBar("Please wait...", jobId, null, function(status) {
 	   		var url  = status.jobFile.url;
			window.location = url;
 	   	 });
    }  
});

