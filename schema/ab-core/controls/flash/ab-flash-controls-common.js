/*
Copyright (c) 2009, ARCHIBUS Inc. All rights reserved.
Author: Jing Guo
Date: December, 2009
*/

Ab.namespace('flash');

// To be called by ActionScript
function getData_JS(panelId, start, end) {
	var flashControl = Ab.view.View.getControl('', panelId);
	try {
		flashControl.refreshDataFromDataSource(start, end);
		return toJSON(flashControl.data);
	} catch (e) {
		flashControl.handleError(e);
	}
};

// Ab.flash.FlashControl
// A derived class must define function refreshDataFromDataSource(start, end)
//
Ab.flash.FlashControl = Ab.flash.FlashComponent.extend({
	// ------------------- public properties ----------------------------------
    configObject: null,
 
 	// swfDir + swfPath + swfParam is the fully-specified filename of the SWF file
 	// here swfPath is the filename (defined in Ab.flash.FlashComponent)
 	swfDir: null,
	swfParam: null,
 	
	width: "100%",
	height: "100%",	 
   
    // Flash required version parameters
	requiredMajorVersion: '9',
	requiredMinorVersion: '0',	
	requiredRevision: '115',
    
    // data
    data: null,
    
    // constructor
    constructor: function(controlId, dataSourceId, swf, swfParam) {
		// construct configObject
 	    var configObject = new Ab.view.ConfigObject();
 	    configObject.setConfigParameter("dataSourceId", dataSourceId);
        this.swfDir = View.contextPath + '/schema/ab-core/controls/flash/';
        this.swfParam = swfParam;

		// the following line is omitted because it will be set in the constructor of Ab.flash.FlashComponent
        //this.swfPath = swf;
	    configObject.setConfigParameter("swf", swf);

        // call the base FlashComponent constructor to set the base properties
        // and register the control in the view, so that other view parts can find it
 		this.inherit(controlId, 'html', configObject);
        this.id = controlId; 
        this.configObject = configObject;
                        
        // get width and height
        this.width = configObject.getConfigParameter('width', '100%');
        this.height = configObject.getConfigParameter('height', '100%');
        
        // This is already called in Ab.view.Component.
        // dataSourceId = getConfigParameter('dataSourceId', 'dataSource');
     },
        
	// get the SWF control object
	 getSWFControl:function(){
		var obj = $(this.id+"_OE");	
		return obj;
	 },
	 
	// load the SWF control into the panel
    loadElixirSWFIntoFlash: function(){
		// Version check for the Flash Player that has the ability to start Player Product Install (6.0r65)
		var hasProductInstall = this.DetectFlashVer(6, 0, 65);
	
		// Version check based upon the values defined in globals
		var hasRequestedVersion = this.DetectFlashVer(this.requiredMajorVersion, this.requiredMinorVersion, this.requiredRevision);

		// create the correct embedObjectString
		var embedObjectString = "";
		if ( hasProductInstall && !hasRequestedVersion ) {
			var MMPlayerType = (this.isIE == true) ? "ActiveX" : "PlugIn";
			var MMredirectURL = window.location;
		    document.title = document.title.slice(0, 47) + " - Flash Player Installation";
		    var MMdoctitle = document.title;

			var embedObjectString = this.returnContent(
				"src", View.contextPath + "/schema/ab-core/libraries/flex/playerProductInstall",
				"FlashVars", "MMredirectURL="+MMredirectURL+'&MMplayerType='+MMPlayerType+'&MMdoctitle='+MMdoctitle+"",
				"width", this.width,
				"height", this.height,
				"id", this.id,
				"quality", "high",
				"bgcolor", '#FFFFFF',
				"name", this.id,
				"allowScriptAccess","sameDomain",
				"type", "application/x-shockwave-flash",
				"pluginspage", "http://www.adobe.com/go/getflashplayer",
				"codebase","http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"
			);
		} else if ( hasRequestedVersion ) {
			var embedObjectString = this.returnContent(
				"id", this.id + "_OE",
				"src", this.swfDir + this.swfPath + this.swfParam,
				"width", this.width,
				"height", this.height,
				"quality", "high",
				"bgcolor",'#FFFFFF',
				"name", this.id + "OE",
				"allowScriptAccess","sameDomain",
				"type", "application/x-shockwave-flash",
				"pluginspage", "http://www.adobe.com/go/getflashplayer",
				"codebase","http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab"
			);
	  	} else {  // flash is too old or we can't detect the plugin
		    var embedObjectString = 'To display the chart, you need the Adobe Flash Player version 9.0.115 or higher.'
		   						 + '<a href=http://www.adobe.com/go/getflash/>Get Flash</a>';
		}
		
		// inject to the parent Html element
		this.injectFlashTag(embedObjectString, this.id);	
    },
    
    initialDataFetch: function() {
	   	this.loadElixirSWFIntoFlash();
 	},
 	/**
     * Sets Flash control property specified by name.
     */		
    setControlProperty: function(propertyName, propertyValue) {
	 	var control = this.getSWFControl();		
        if (control) {
        	control.setControlProperty(propertyName, propertyValue);
        }
    },
    /**
     * Sets Flash style property specified by name.
     */		
    setStyleProperty: function(propertyName, propertyValue) {
	 	var control = this.getSWFControl();		
        if (control) {
        	control.setStyleProperty(propertyName, propertyValue);
        }
    }   
 });
 