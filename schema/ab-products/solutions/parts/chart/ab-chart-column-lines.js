var exampleController = View.createController('example', {
	chartCol_chart_onPpt: function() {
	    var slides = [];
		var panel = View.panels.get("chartCol_chart");
		var image = panel.getImageBytes();
		var title = $('chartCol_chart_title').innerHTML;

		 slides.push({'title': title, 'type':'flash', 'images':[image]});
		 

		 var jobId =  Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
		 View.openJobProgressBar("Please wait...", jobId, null, function(status) {
 	   		var url  = status.jobFile.url;
			window.location = url;
 	   	 });

    }
   
});

function drawPlotLines() {
    var chart = View.getControl('', 'chartCol_chart');
    
    // draw a horizontal line
	chart.addTargetLine(
			18000000, 						// Y
			0xFF0000, 						// color
			'Standard');					// title for legend

	chart.addTargetLine(
			14000000, 						// Y
			0x0000FF, 						// color
			'Average');						// title for legend
}
