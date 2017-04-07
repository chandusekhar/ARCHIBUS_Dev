
var consoleExample = View.createController('consoleExample', {

	/**
	 * Custom JS function that shows how to work with multiple value restrictions in JS code.
	 */
	exConsole_wrConsole_onShowRestriction: function() {
	    var console = this.exConsole_wrConsole;
	    
	    // get the default console restriction
	    var defaultRestriction = console.getFieldRestriction();
	    
	    // display the default restriction
	    View.showMessage('message', defaultRestriction);
	    
	    // create a custom restriction - add single or multiple values restriction clause
	    var customRestriction = new Ab.view.Restriction();
	    if (console.hasFieldMultipleValues('wr.bl_id')) {
	        var valuesArray = console.getFieldMultipleValues('wr.bl_id');
	        customRestriction.addClause('wr.bl_id', valuesArray, 'IN', 'AND');
	    } else {
	        var value = console.getFieldValue('wr.bl_id');
	        customRestriction.addClause('wr.bl_id', value, '=', 'AND');
	    }
	    
	    // display the custom restriction
	    // View.showMessage('message', customRestriction);
    },
    
    getRestriction:function(){
    	  var console = this.exConsole_wrConsole;
    	  var customRestriction = new Ab.view.Restriction();
   
    	  var wr_id = console.getFieldValue('wr.wr_id');
    	  if(wr_id!=null && wr_id!=''){
		    	customRestriction.addClause('wr.wr_id', wr_id, '=');
		   }
    	
		if (console.hasFieldMultipleValues('wr.bl_id') && console.getFieldMultipleValues('wr.bl_id').length > 1 ) {
				customRestriction.addClause('wr.bl_id', console.getFieldMultipleValues('wr.bl_id'), 'IN', 'AND');
			} else {
			    var value = console.getFieldValue('wr.bl_id');
			    if(value != null && value != ''){
			    	customRestriction.addClause('wr.bl_id', value, '=', 'AND');
			    }
			}
	  	    
	  	   var date_requested = console.getFieldValue('wr.date_requested.from');
		    if(date_requested!=null && date_requested!=''){
		    	customRestriction.addClause('wr.date_requested', date_requested, '&gt;=');
		    }
		    
		    date_requested = console.getFieldValue('wr.date_requested.to');
		    if(date_requested!=null && date_requested!=''){
		    	customRestriction.addClause('wr.date_requested',date_requested, '&lt;=');
		    }
		    
	  	   return customRestriction;
    },
    /**
     * show parsed restriction in grid pane's DOC report.
     */
    print: function(){
    	View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE));   
		var panel = this.exConsole_wrReport;
		var restriction = this.getRestriction();
		var printOutRestriction = true;
		
		var url  = this.getReportURL(panel, restriction, printOutRestriction);
		if (valueExistsNotEmpty(url)) {
			window.location = url;
		}
		View.closeProgressBar();
	 },
	 
	 /**
	  * this could be as a general method to print out restriction in DOCX.
	  */
	 getReportURL: function(panel, restriction, printOutRestriction){
			var parameters =  panel.getParametersForRefresh();
			parameters.printRestriction = printOutRestriction;
			
			//call panel's callReportJob to get report job id
			var jobId = panel.callDOCXReportJob(panel.title, restriction, parameters);
			
			var jobStatus = Workflow.getJobStatus(jobId);
				
			while (jobStatus.jobFinished != true && jobStatus.jobStatusCode != 8) {
				jobStatus = Workflow.getJobStatus(jobId);
			}
			
			if (jobStatus.jobFinished) {
				return jobStatus.jobFile.url;
			}
			return null;
	 }
});