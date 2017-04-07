/**
 * called by ab-ex-svg-example.axvw
 */
var bl_id='';
var fl_id='';
var dwgname = '';
var plan_type = "1 - ALLOCATION";

var exampleController = View.createController('example', {
	
	svgControl: null,
    
    loadSvg: function(bl_id, fl_id) {
    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['plan_type'] = plan_type;
    	//parameters.highlightParameters = [{'view_file':"ab-ex-rmxdp-dwg-rpt.axvw", 'hs_ds': "ds_abExRmxdpDwgRpt_highlightData", 'label_ds':'ds_abExRmxdpDwgRpt_labelNames'}];
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};

    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.svgControl = new Ab.svg.DrawingControl("svgDiv", "svg_ctrls", parameters);    			
    	this.svgControl.load("svgDiv", parameters);
    	
    	// bind event to highlighted rooms. this.showReport is callback
    	this.svgControl.addEventHandlers(this.svgControl, [{'assetType' : 'rm', 'handler' : this.showReport}]);
    	
    	// resize specified DOM element whenever the panel size changes
    	this.svg_ctrls.setContentPanel(Ext.get('svgDiv'));
    },
    
    /**
     * Pops up a detailed room report when clicking any highlighted room
     * roomIDs: a string like HQ;18;155. (TODO: move to SVG control)
     * position: mouse click position to identify selected room's position like {x:200, y:200}
     */   
    showReport: function(roomIDs, position) {
    	var arrayRoomIDs = roomIDs.split(";");
    	var reportView = View.panels.get("room_detail_report");
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('rm.bl_id', arrayRoomIDs[0]);
    	restriction.addClause('rm.fl_id', arrayRoomIDs[1]);
    	restriction.addClause('rm.rm_id', arrayRoomIDs[2]);
    	reportView.refresh(restriction);

    	reportView.showInWindow({title:'Selected Room Detail', modal: true,collapsible: false, maximizable: false, width: 350, height: 250, autoScroll:false});
    },
    
    svg_ctrls_onPdf: function(){
    	if(bl_id === '' || fl_id === ''){
    		return;
    	}
    	
    	
    	//gets dataSources specified by active_plantypes.plan_type
    	/*var restriction = new Ab.view.Restriction();
		restriction.addClause('active_plantypes.plan_type',  plan_type, '=');
    	var record = this.planTypes_ds.getRecord(restriction);
    	var view_file = record.getValue('active_plantypes.view_file');
    	var highligtDS = record.getValue('active_plantypes.hs_ds');
    	var labelDS = record.getValue('active_plantypes.label_ds');
    	var label_ht = record.getValue('active_plantypes.label_ht');
    	*/
    	
    	var pdfParameters = {};
    	//optional: set documentTemplate or set up in ab-ex-dwg-rpt-pdf.axvw
    	pdfParameters.documentTemplate = "report-cadplan-imperial-landscape-17x22.docx";
		//required: pass drawingName 
		pdfParameters.drawingName = dwgname;
		
		//required if dataSources are not passed 
    	pdfParameters.plan_type = plan_type;

    	//optional: if svg is zoomed, get zoomed image and pass it to server
		//isZoomed() and getImageBytes() are defined in ab-svg-drawing-control.js, so they're also available in mobile framework
    	if(this.svgControl.isZoomed()){
    		pdfParameters.drawingZoomInfo = {};
    		var scope = this;
    		this.svgControl.getImageBytes( function(image){
    				pdfParameters.drawingZoomInfo.image = image;
    				scope._doReport(pdfParameters);
    			}
    		);
    	}else{
    		this._doReport(pdfParameters);
    	}
    	
    	
    },
    _doReport: function(pdfParameters){
    	/*
    	//dataSources defined in a separate axvw which is shared with drawing control axvw
    	pdfParameters.dataSources = {viewName:view_file, required:highligtDS + ';' + labelDS + ';' + legendDS};	
    	pdfParameters.highlightDataSource = 'rm:'+highligtDS;
    	pdfParameters.labelsDataSource = 'rm:'+labelDS;
    	pdfParameters.labelHeight = "rm:" + label_ht;
    	*/
    	
    	
    	//if showLegend=true, legend panel must be defined in ab-ex-dwg-rpt-pdf.axvw or active_plantypes.view_file
    	//its dataSource id must be defined as highlight dataSource id (active_plantypes.hs_ds)  + "_legend"
    	//its panel id must be defined as "panel_" + its dataSource id
    	pdfParameters.showLegend = true;
    	
    	//defined in ab-ex-dwg-rpt-pdf.axvw 
    	/*var legendDS = highligtDS+ '_legend';
    	//required legend panel, also defined in ab-ex-dwg-rpt-pdf.axvw 
    	pdfParameters.legends = {};
    	pdfParameters.legends.required = 'panel_'+legendDS;
    	*/
    	
    	
    	//provide symbol print java handler so that the core would invoke its draw() method during highlighting published emf
    	pdfParameters.symbolsHandler = "com.archibus.app.solution.common.report.docx.SymbolsHandlerExample";
    	
    	
    	//open paginated report ab-ex-dwg-rpt-pdf.axvw
    	//startJob() could be added into mobile's Workflow.js
    	//mobile issues: 1) offline? 2) progress bar? 3)how to open PDF file by its URL?
    	 var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-buildDocxFromView', 'ab-ex-dwg-rpt-pdf.axvw', null, pdfParameters, null);
    	 View.openJobProgressBar("Please wait...", jobId, null, function(status) {
     	   		var url  = status.jobFile.url;
     	   		window.open(url);
     	  });
    }
    
});



/**
 * click event for tree items
 */
function onClickTreeNode(){
	var controller = View.controllers.get('example');
	var curTreeNode = View.panels.get("floor_tree").lastNodeClicked;
	
	// get selected data from tree
	bl_id = curTreeNode.data["rm.bl_id"];
	fl_id = curTreeNode.data["rm.fl_id"];
	dwgname = curTreeNode.data["rm.dwgname"];

	// load relevant svg
	controller.loadSvg(bl_id, fl_id);
}






