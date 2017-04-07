/**
 * Used by ab-ex-drawing-rpt-pdf.axvw to dynamically generate drawing control's corresponding PDF report.
 * 
 */
var selectedFloor = {};

View.createController('drawingPDF', {
	afterViewLoad: function() {	
		selectedFloor = {};
	},
	
	/**
	 * PPTX report
	 */
	cadPanel_onPpt: function(){
		this.buildReport({outputFileType:'pptx'});
	},
	/**
	 * PDF report
	 */
	cadPanel_onPdf: function(){
		var pdfParameter = {};
		
		var drawingZoomInfo = this.cadPanel.getDrawingZoomInfo();
		if(drawingZoomInfo !== null){
			drawingZoomInfo.image =  this.cadPanel.getImageBytes();
			pdfParameter.drawingZoomInfo = drawingZoomInfo;
		}
		//turn off legend table's ledger color
		pdfParameter.tableLedgerShadingColor = "0xFFFFFF";
		//set documentTemplate
		pdfParameter.documentTemplate = "report-cadplan-imperial-landscape-17x22.docx";
		
		this.buildReport(pdfParameter);
	},
			
	buildReport: function(reportParameter){
    	var pdfRestrictions = {};
    	var pdfParameters = reportParameter;
    
    	pdfParameters.legends = {};
    	
    	//get highlight and label dataSource ids from drawing control
    	var highligtDS = this.cadPanel.currentHighlightDS;
    	var labelDS = this.cadPanel.currentLabelsDS;
    	var legendDS = highligtDS+ '_legend';
    	
    	//highlight dataSource is required for paginated report
    	if(highligtDS === '' || highligtDS === 'None'){
    		highligtDS = 'dummyDs';
    	}
 
    	var restriction = new Ab.view.Restriction();
		restriction.addClause('rm.bl_id',  selectedFloor.blId, '=');
		restriction.addClause('rm.fl_id',  selectedFloor.flId, '=');
		//pass the restriction to highlight, label and legend dataSources
		pdfRestrictions[highligtDS] = restriction;
		pdfRestrictions[labelDS] = restriction;
		pdfRestrictions[legendDS] = restriction;
		
		//pass drawingName to skip core's expensive process to get it
		pdfParameters.drawingName = selectedFloor.dwgName;
		//dataSources defined in a separate axvw which is shared with drawing control axvw
		pdfParameters.dataSources = {viewName:'ab-ex-drawing-rpt-pdf-datasources.axvw', required:highligtDS + ';' + labelDS};	
		
		pdfParameters.highlightDataSource = 'rm:'+highligtDS;
		if(labelDS !== '' && labelDS !== 'None'){
			pdfParameters.labelsDataSource = 'rm:'+labelDS;
			pdfParameters.labelHeight = "rm:3";
		}
		
		if(highligtDS !== 'dummyDs'){
			//add legend dataSource to required list
			pdfParameters.dataSources.required = pdfParameters.dataSources.required +  ';' + legendDS;
			
			//if legend panels are not defined in paginated report view, you could define legend panels dynamically
			//pdfParameters.legends.panelDefs= [this.getLegendPanel(legendDS)];
			
			//required legend panel
			pdfParameters.legends.required = 'panel_'+legendDS;
			
			//show room border highlight in PDF
			//pdfParameters.borderHighlight='rm:5';
		}
		
    	if(valueExistsNotEmpty(pdfParameters.highlightDataSource)){
    		//open paginated report ab-ex-dwg-rpt-pdf.axvw
    		 var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-buildDocxFromView', 'ab-ex-dwg-rpt-pdf.axvw', pdfRestrictions, pdfParameters, null);
    		 View.openJobProgressBar("Please wait...", jobId, null, function(status) {
    	 	   		var url  = status.jobFile.url;
    	 	   		window.open(url);
    	 	  });
    	}
    },
    
    /**
     * Gets legend panel definition objects based on legend dataSource.
     * 
     * @param legendDS legend datasource id.
     * @returns legend panel def object.
     */
    getLegendPanel: function(legendDS){
    	var legendPanel = {dataSource: legendDS};
		if(legendDS === 'highlightDivisionsDs_legend'){
			legendPanel.fields = [{table:'dv', name:'name'},{table:'dv', name:'hpattern_acad', title:'Legend'}];
		}else if(legendDS === 'highlightDepartmentsDs_legend'){
			legendPanel.fields = [{table:'dp', name:'dv_id'},{table:'dp', name:'name'}, {table:'dp', name:'hpattern_acad', title:'Legend'}];
		}else if(legendDS === 'highlightCategoriesDs_legend'){
			legendPanel.fields = [{table:'rm', name:'rm_cat'}, {table:'rmcat', name:'hpattern_acad', title:'Legend'}];
		}else if(legendDS === 'highlightSuperCategoriesDs_legend'){
			legendPanel.fields = [{table:'rmcat', name:'supercat'},{table:'rmcat', name:'hpattern_acad', title:'Legend'}];
		}else if(legendDS === 'highlightStandardsDs_legend'){
			legendPanel.fields = [{table:'rm', name:'rm_std'}, {table:'rmstd', name:'hpattern_acad', title:'Legend'}];
		}else if(legendDS === 'highlightTypesDs_legend'){
			legendPanel.fields = [{table:'rm', name:'rm_type'}, {table:'rmtype', name:'hpattern_acad', title:'Legend'}];
		}else if(legendDS === 'highlightHeadCountDs_legend' || legendDS === 'highlightVacantRoomsDs_legend'){
			legendPanel.fields = [{table:'rm', name:'count_em'}, {table:'rm', name:'count_em', title:'Legend', legendKey:'true'}];
		}
		return legendPanel;
    }
});

function onFloorSelect(){
	var grid = View.panels.get('floorsList_panel');
	var row = grid.rows[grid.selectedRowIndex];
    selectedFloor.blId = row['rm.bl_id'];	
    selectedFloor.flId = row['rm.fl_id'];	
    selectedFloor.dwgName = row['rm.dwgname'];	
	var dwgCtrlLoc = new Ab.drawing.DwgCtrlLoc(selectedFloor.blId, selectedFloor.flId, null,  selectedFloor.dwgName);
	var drawingPanel = View.panels.get('cadPanel');
	drawingPanel.addDrawing(dwgCtrlLoc, new DwgOpts());
}