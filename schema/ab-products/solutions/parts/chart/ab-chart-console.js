function displayChartSelectedItem(obj){
	//obj.chart will be chart object
	//obj.restriction will be passed the restriction object
	//obj.selectedChartData will be selected-column item data object from swf chart
	var str = "";
	for(var name in obj.selectedChartData){
		str = str + "[" + name +":"+obj.selectedChartData[name] + "]";
	}
	alert(str);
}

/**
 * Print out passed custom restriction. 
 * 
 */
var abChartConsole = View.createController('abChartConsole', {	
	 print: function(){
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));  
		var console = this.chartConsole_console;
		var bl_id = console.getFieldValue('bl.bl_id');
		var city_id = console.getFieldValue('bl.city_id');
		
		var printableRestriction = [];
		
		if(city_id!=null && city_id!=''){
			printableRestriction.push({'title': 'Restricted by the city', 'value': city_id});
		}
		if(bl_id!=null && bl_id!=''){
			printableRestriction.push({'title': 'Restricted by the building', 'value': bl_id});
		}
		
		var panel = this.chartConsole_chart;
		
		var parameters = {'printRestriction':true, 'printableRestriction':printableRestriction};
		
		//call panel's callReportJob to get report job id
		var jobId = panel.callDOCXReportJob(panel.title, null, parameters);
		
		var jobStatus = Workflow.getJobStatus(jobId);
		while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
			jobStatus = Workflow.getJobStatus(jobId);
		}
		
		if (jobStatus.jobFinished) {
			var url  = jobStatus.jobFile.url;
			if (valueExistsNotEmpty(url)) {
				window.location = url;
			}
		}
		
		View.closeProgressBar();
		
	 }
});

function showRecords(){
	var restriction = new Ab.view.Restriction();
	
	var console_name = "chartConsole_console";
	var console = View.panels.get(console_name);

	var city_id = console.getFieldValue('bl.city_id');
	if (city_id != '') {
		restriction.addClause('bl.city_id', city_id , '=');
	}
	
	var bl_id = console.getFieldValue('bl.bl_id');
	if (bl_id != '') {
		restriction.addClause('bl.bl_id', bl_id , '=');
	}
		
	// apply restriction 
	View.panels.get("chartConsole_chart").refresh(restriction);
}



