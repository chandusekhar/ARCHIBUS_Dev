/**
 * Controller for printing the drawing's PDF  report.
 *	  Added for 21.2 Space Console 
 *	 @Author Zhang Yi

 * Events:
 * app:space:express:console:printPDF
 */
var abPlanMoveScenarioPrintCtrl = View.createController('abPlanMoveScenarioPrintCtrl', {

	/**
     * Constructor.
     */
    afterCreate: function() {
		this.on('app:move:plan:scenario:printPDF', this.printPdfReport );
		this.on('app:move:plan:scenario:printDOCX', this.printDocxReport);
    },
    
    /**
     * Print the drawing Pdf report.
     */
    printPdfReport: function(projectId, scenarioId, drawingPanel) {
		this.printReport( projectId, scenarioId, drawingPanel, 'pdf') ; 
    },

    /**
     * Print the drawing Pdf report.
     */
    printDocxReport: function(projectId, scenarioId, drawingPanel) {
		this.printReport( projectId, scenarioId, drawingPanel, 'docx') ; 
    }, 

	/**
     * Print the drawing Pdf report.
     */
    printReport: function(projectId, scenarioId, drawingPanel, exportType) {
    	var pdfRestrictions = {};
    	var pdfParameters = {};
    	pdfParameters.legends = {};
    	
		//get highlight and label dataSource ids from drawing control
    	var highligtDS = drawingPanel.currentHighlightDS;
    	var labelDS = drawingPanel.currentLabelsDS;
    	var legendDS = highligtDS+ '_legend';
    	
		//prepare restriction from filter and selected floors
		var passedRestrictions = {	};
		passedRestrictions[highligtDS] =  {};
		passedRestrictions[labelDS] =  {};

		//highlight dataSource is required for paginated report
    	if(highligtDS === '' || highligtDS === 'None'){
    		highligtDS = 'dummyDs';
    	}

		//pass drawingName to skip core's expensive process to get it
		//pdfParameters.drawingName = selectedFloor.dwgName;
		//dataSources defined in a separate axvw which is shared with drawing control axvw
		pdfParameters.dataSources = {viewName:'ab-mo-gp-plan-move-scenario-print-ds.axvw', required:highligtDS + ';' + labelDS};	
		
		pdfParameters.highlightDataSource = 'rm:'+highligtDS;
		if(labelDS !== '' && labelDS !== 'None'){
			pdfParameters.labelsDataSource = 'rm:'+labelDS;
			pdfParameters.labelHeight = "rm:3";
		}
		
		if(highligtDS !== 'dummyDs'){
			//add legend dataSource to required list
			pdfParameters.dataSources.required = pdfParameters.dataSources.required +  ';' + legendDS;
			
			//required legend panel
			pdfParameters.legends.required = 'panel_'+legendDS;
		}
		
	  //prepare parameters from filter's parameters
		pdfParameters['projectId']=projectId;
		pdfParameters['scenarioId'] = scenarioId;

		if(valueExistsNotEmpty(pdfParameters.highlightDataSource)){
			if (exportType === "pdf") {
				View.openPaginatedReportDialog("ab-mo-gp-plan-move-scenario-print-pdf.axvw", passedRestrictions, pdfParameters);	
			} else if (exportType === "docx"){
				View.openPaginatedReportDialog("ab-mo-gp-plan-move-scenario-print-docx.axvw", passedRestrictions, pdfParameters);	
			}
    	}
    }
});