/**
 * called by ab-ex-svg-example-placement.axvw
 */

var exampleController = View.createController('example', {
	
	placementControl: null,

	redlineControl: null,
	
	bl_id: null,
	
	fl_id: null,
	
	dwgname: null,
	
	plan_type: "1 - ALLOCATION",
 
    afterInitialDataFetch: function() {

    	/*
    	this.loadSvg("HQ", "17");
    	this.bl_id = "HQ";
    	this.fl_id = "17";
		*/
   	
    	this.exTabsFree_tabs.addEventListener('afterTabChange', this.exTabsFree_tabs_afterTabChange.createDelegate(this));
    	Ext.get("reload").dom.addEventListener('click', this.reloadDrawing.createDelegate(this));
    	Ext.get("copy").dom.addEventListener('click', this.copyAssets.createDelegate(this));
    	Ext.get("paste").dom.addEventListener('click', this.pasteAssets.createDelegate(this));
    },

    exTabsFree_tabs_afterTabChange: function(tabPanel, newTabName) {
    	if (newTabName === 'exTabsFree_page2' && this.placementControl) {
    		
    		// load the legend
    		// use a hand-generated SVG for the legend (generate SVG by publishing an AutoCAD drawing)
    		var control = this;
    		this.placementControl.loadLegend({
    			//file: View.project.enterpriseGraphicsFolder + "/" + "legend.svg",		// legend file
    			file: "legend.svg",														// legend file,
    			useService: true,														// use DrawingSvgService to fetch the legend from the Enterprise graphics folder
    			afterLoad: function () {												// callback for after loading the legend
    				control.placementControl.setup();
    			}
    		})
    	}
    },
    
    loadSvg: function(bl_id, fl_id) {
	    	
    	// define parameters to be used by server-side job
    	var parameters = new Ab.view.ConfigObject();
    	parameters['plan_type'] = this.plan_type;
    	parameters['pkeyValues'] = {'bl_id':bl_id, 'fl_id':fl_id};
    	
    	// load SVG from server and display in SVG panel's  <div id="svgDiv">    	
    	this.placementControl = new Ab.svg.PlacementControl("drawingDiv", "drawingPanel", "legend", 'eq-assets', 'eq-asset', parameters); 
    	
    	// load the floorplan
    	this.placementControl.load("drawingDiv", parameters);   	
       	  
    	// redline control
    	this.redlineControl = new Ab.svg.RedlineControl("drawingDiv", "drawingPanel", "redline", "", parameters); 
    	this.redlineControl.loadLegend({});
   	
    	// resize specified DOM element whenever the panel size changes
    	this.drawingPanel.setContentPanel(Ext.get('drawingPanel'));
    	this.drawingPanel.setContentPanel(Ext.get('drawingDiv'));

    	// show layers menu
    	this.placementControl.showLayers();
    	
    	// get a copy of the drawing
    	this.svgText = Ext.get("drawingDiv").dom.innerHTML;
    },
    
    reloadDrawing: function() {
    	Ext.get('legend_group').dom.checked = false;
    	this.placementControl.load("drawingDiv", this.placementControl.config);
    	this.placementControl.showLayers();
    	this.placementControl.attachGroupListener();
    },
    
    copyAssets: function() {
    	var copiedAssets = this.placementControl.copyAssets();   
    	var copiedRedlines = this.redlineControl.copyAssets(); 
    	this.placementControl.showInfoBar(true);
    	this.placementControl.setInfoBarText(copiedAssets.length + ' ' + getMessage('assetsCopiedMsg') + '  ' + copiedRedlines.length + ' ' + getMessage('redlinesCopiedMsg'));
    },
    
    pasteAssets: function() {
    	this.placementControl.pasteAssets(this.placementControl.copiedAssets); 
    	this.redlineControl.pasteAssets(this.redlineControl.copiedAssets); 
    	this.placementControl.showInfoBar(true);
    	this.placementControl.setInfoBarText(this.placementControl.copiedAssets.length + ' ' + getMessage('assetsPastedMsg') + '  ' + this.redlineControl.copiedAssets.length + ' ' + getMessage('redlinesPastedMsg'));
    },
    
    drawingPanel_onPpt: function() {
    	var slides = [];
   
    	var title = $('drawingPanel_title').innerHTML;
    	if(this.placementControl && this.placementControl.getImageBytes){
    		var image = this.placementControl.getImageBytes();
   			slides.push({'title': title,'images':[image]});  

       	 	var jobId = Workflow.startJob('AbSystemAdministration-generatePaginatedReport-generatePpt', slides, {});
       	 	View.openJobProgressBar("Please wait...", jobId, null, function(status) {
    	   		var url  = status.jobFile.url;
       			window.location = url;
    	   	 }); 
    	}
    },
    
    drawingPanel_onPdf: function() {
    	var pdfParameters = {};
    	//optional: set documentTemplate or set up in ab-ex-dwg-rpt-pdf.axvw
    	pdfParameters.documentTemplate = "report-cadplan-imperial-landscape-17x22.docx";
		//required: pass drawingName 
		pdfParameters.drawingName = this.dwgname;
		
		//required if dataSources are not passed 
    	pdfParameters.plan_type = this.plan_type;

    	//always grasp svg's image for pdf report
		pdfParameters.drawingZoomInfo = {};
		//pdfParameters.drawingZoomInfo.image = this.placementControl.getImageBytes();
		var scope = this;
		this.placementControl.getImageBytes( function(image){
				pdfParameters.drawingZoomInfo.image = image;
				scope._doReport(pdfParameters);
			}
		);
    
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
	var bl_id = curTreeNode.data["rm.bl_id"];
	var fl_id = curTreeNode.data["rm.fl_id"];
	var rm_id = curTreeNode.data["rm.rm_id"];
	var dwgname = curTreeNode.data["rm.dwgname"];
	
	// if previously selected bl and fl are the same as current selection, no need to load the drawing again
	if ((bl_id != controller.bl_id || fl_id != controller.fl_id) || !rm_id ) {

		// load relevant svg
		controller.loadSvg(bl_id, fl_id);		
	}
	
	if (rm_id) {
		
		// you can choose how to highlight the asset  	  
    	var opts = { cssClass: 'zoomed-asset-red-bordered',		// use the cssClass property to specify a css class
    				 removeStyle: true							// use the removeStyle property to specify whether or not the fill should be removed (for example  cssClass: 'zoomed-asset-bordered'  and removeStyle: false
			   	   };
		controller.placementControl.findAssets([bl_id+';'+fl_id+';'+rm_id], opts);
	} 
	
	controller.bl_id = bl_id;
	controller.fl_id = fl_id;
	controller.dwgname = dwgname;
}








