/*
 * AFM Custom Progress Report class
 * 
 */

Ab.namespace('paginate');

Ab.paginate.ResultsReport = Ab.paginate.BaseReport.extend({	

	// the panel object that the progress report resides
    panel: null,
    
    // JSON map tp hold the job progresses for all job statuses
    result: null,
    
   	constructor: function(panel, result) {

   		this.inherit(panel, result);
		
		this.addDataRows();
	 	
	 	this.removeFooter();
	 	
	 	this.addFooter("2",  Ab.view.View.getLocalizedString(this.REPORT_USELINK_PREVIEW_MESSAGE));
	},
   	
   	    
    refresh: function(result){

		this.result = result;

		this.removeDataRows();

   		this.addDataRows();
   	},
   	
	addDataRows: function(){
	
		if(typeof this.result != 'undefined'){
			
			//get the result
			this.result = Workflow.getJobStatus(this.result.jobId);
			
	        // store the number of partial results
			if(this.result.jobPartialResults!=null){
				var resultLength = this.result.jobPartialResults.length;
		   		for(var index=0; index < resultLength; index++){
			   		this.addDataRow(index, this.result.jobPartialResults[index]);
				}
			}
		}
	},
	
	// remove all the table rows from the table	
	removeDataRows: function(){

		var oTBody = this.panel.tableBodyElement;
	   	
	   	if(oTBody==null){
			return;
		}
	   	
	   	while (oTBody.firstChild) 
		{
		    //The list is LIVE so it will re-index each call
		    oTBody.removeChild(oTBody.firstChild);
		 };
	},
	
	addDataRow: function(index, dataRow){

		var	oTr = this.insertChild(this.panel.tableBodyElement, "tr");
		
		if(this.result.jobPartialResults!=null){
			this.insertChild(oTr, "td",  null, "<i>" + this.result.jobPartialResults[index].title + "</i>");
				   	
		   	if(index == this.result.jobPartialResults.length-1 && parseInt(dataRow.jobPercentComplete) < 100){
				this.insertChild(oTr, "td", null, "<i>" + Ab.view.View.getLocalizedString(this.REPORT_GENERATING) + "</i>");
			} else {
				this.insertChild(oTr, "td",  null, "<i><a href='" + this.result.jobPartialResults[index].url + "' target='_blank'>" + this.result.jobPartialResults[index].name + "</a></i>");
			}
		}
	},
	
	// @begin_translatable
    REPORT_GENERATING: 'Still Generating...',
	REPORT_USELINK_PREVIEW_MESSAGE: 'Use these links to preview portions of the report as it generates.'
	// @end_translatable

});

