Ab.namespace('command');

Ab.command.openLiveCycleDialog = Ab.command.openDialog.extend({

	/**
     * Constructor.
     */
    constructor: function(commandData) {
        this.inherit(commandData);
        
       	this.viewName = "ab-pdf-livecycle-progress.axvw";
       	
        var view = this.getTargetView();
        if(!view){
        	this.target = "parent";
        	view = this.getTargetView();
        }
        
        if(!valueExists(view.progressReportParameters)){
	 		view.progressReportParameters = {};
 		}

		if (valueExists(commandData.viewName)) {
        	view.progressReportParameters.viewName = commandData.viewName;
		}

		if (valueExists(commandData.dataSourceId)) {
        	view.progressReportParameters.dataSourceId = commandData.dataSourceId;
		}
		if (valueExists(commandData.restrictions)) {
        	view.progressReportParameters.restrictions = commandData.restrictions;
		}
		if (valueExists(commandData.fieldNames)) {
        	view.progressReportParameters.fieldNames = commandData.fieldNames;
		}
		if (valueExists(commandData.pdfFieldNames)) {
        	view.progressReportParameters.pdfFieldNames = commandData.pdfFieldNames;
		}
		if (valueExists(commandData.pdfControlTypes)) {
        	view.progressReportParameters.pdfControlTypes = commandData.pdfControlTypes;
		}
		if (valueExists(commandData.pdfTemplate)) {
        	view.progressReportParameters.pdfTemplate = commandData.pdfTemplate;
		}
		if (valueExists(commandData.recordLimit)) {
        	view.progressReportParameters.recordLimit = commandData.recordLimit;
		}
		
		if (valueExists(commandData.width)) {
        	this.width = commandData.width;
		} else {
			this.width = 800;
		}
		
		if (valueExists(commandData.height)) {
        	this.height = commandData.height;
		} else {
			this.height = 400;
		}
		this.newRecord = false;
    },
    
    handle: function(context) {
        this.inherit(context);
    }
});