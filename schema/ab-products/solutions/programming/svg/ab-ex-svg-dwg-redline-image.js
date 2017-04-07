/**
 * called by ab-ex-svg-example-placement.axvw
 */

var exampleController = View.createController('example', {
	
	redlineControl: null,
	 
    afterViewLoad: function() {   	
		this.loadImage();
    },
    
    loadImage: function() {
	    	
    	var parameters = new Ab.view.ConfigObject();
    	    	    	
    	// redline control
    	this.redlineControl = new Ab.svg.RedlineControl("drawingDiv", "drawingPanel", "redline",  "", parameters); 
    	
    	// load an image into the floorplan area
    	this.redlineControl.loadImage(View.project.projectGraphicsFolder + "/esenergy1.jpg"); 
    	
    	// load the redline legend
    	this.redlineControl.loadLegend({});  	
    	    	
    	// resize specified DOM element whenever the panel size changes
    	this.drawingPanel.setContentPanel(Ext.get('drawingPanel'));
    	this.drawingPanel.setContentPanel(Ext.get('drawingDiv'));
    },
    
    captureImageCallback: function(dataURI) {
    	// callback function with dataURI
    }
});









