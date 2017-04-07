/**
 * Handle all the image related functions.
 * 
 * @author   Ying Qin
 * @version  22.1
 * @date     5/2015
 */
var SvgImage = Base.extend({
	 
	 //drawing control
	 control: null,

	 activityLogId: '',
	 
	 constructor: function(control){
		 this.control = control;
	 },
	 
	 /**
	  * download image content from the database and display 
	  */
	 loadImageFromDb: function(){
	
		 var record = this.control.svgData.getLastRedlineRecord(this.control.config.activityLogId);
		 
		 if(record && record.getValue("afm_redlines.image_file")){
			 var autoNumber = record.getValue("afm_redlines.auto_number");
	    	 var fileName = record.getValue("image_file");
	    	 var keys = {'auto_number': autoNumber};

	    	 var control= this.control;
	    	 DocumentService.getImage(keys, "afm_redlines", "image_file", '1', true, {
	            callback: function(image) {
	            	control.loadImage(image);
	           	 	control.showLegend(true);

	           	 	// load redmarks
	           	 	if(record && record.getValue("afm_redlines.html5_redlines")){
	        			control.savedParameters.loadRedmarks(record, control);
	                }
	        		
	        		// no changes - do not show the saveSvg action
	   	   			control.showAction(control.svgActions.Z_SAVESVGACTION_ID, false);
	            },
	            errorHandler: function(m, e) {
	                View.showException(e);
	            }
	    	 });
		 }
	 },

	 

	  
	  /**
	   * upload image to activityLog table doc4 field.
	   */
	  saveCapturedImageToDb: function(imageContent, control){

		if( !imageContent)
			return;

		var activityLogId = control.config.activityLogId;
		var keys = {'activity_log_id': activityLogId};
    	var fileName = "activity_log-" + activityLogId + "-doc4.png";
    	var datasource = control.svgData.datasources["activity_log"];
	  	var parameters = { "tableName": "activity_log",
	  					   "fieldName": "doc4",
	  					   "documentName": fileName
	  					  };
	  	
	  	//get the data after data:image\/png;base64,
	  	var imageDataBytes = imageContent.substr(imageContent.indexOf(",")+1);
		DrawingSvgService.checkin(imageDataBytes, keys, parameters, {
	   	   	callback: function() {
	   	   		var record = datasource.getRecord("activity_log_id =" + activityLogId);
	   	   		if(record){
	   	   			record.setValue('activity_log.doc4', fileName);
	   	   			datasource.saveRecord(record);
	   	   			
	   	   			// save success - do not show the saveSvg action
	   	   			control.showAction(control.svgActions.Z_SAVESVGACTION_ID, false);

	   	   		}
	   	   		
	   	   		return true;
	   	   	},
	   	    errorHandler: function(m, e){
	   	        Ab.view.View.showException(e);
	   	    }
	   	});
	  }
});