

/**
 * Declare the "drawing" namespace.
 */
Ab.namespace('drawing');


//
// Required global variable, providing a hook into the javascript
// handlers for access from the flex application.
//
var jsAccessFromFlex = null;

// Required global variable to support mousewheel action in various browsers
var dwgControlId = '';

/**
 * Custom control class. Extends the base Component class.
 */
Ab.drawing.DrawingControl = Ab.flash.FlashComponent.extend({

	// @begin_translatable
    z_MESSAGE_BORDER_HIGHLIGHTS: 'Border Highlights',
    z_MESSAGE_ROOM_HIGHLIGHTS: 'Room Highlights',
	z_MESSAGE_HIGHLIGHTS: 'Highlights',
	z_MESSAGE_LABELS: 'Labels',
	z_MESSAGE_TB_SELECT: 'Select',
    z_MESSAGE_TB_PAN: 'Pan',
    z_MESSAGE_TB_ZOOMWINDOW: 'Zoom Window',           
    z_MESSAGE_TB_ZOOMIN: 'Zoom In',
    z_MESSAGE_TB_ZOOMOUT: 'Zoom out',
    z_MESSAGE_TB_ZOOMEXTENTS: 'Zoom Extents',
    z_MESSAGE_TB_AUTOCENTER: 'Center',
    z_MESSAGE_TB_ISO: 'Isometric',
    z_MESSAGE_TB_RESETASSETS: 'Reset Assets',
    z_MESSAGE_TB_CLEARASSETS: 'Clear Assets',
    z_MESSAGE_TB_ZOOMWINDOW:  'Zoom Window',
    z_MESSAGE_TB_MULTISELECT:  'Multiple Rooms Selection',
    z_MESSAGE_TB_DRAWLINE:  'Draw Line',
    z_MESSAGE_TB_DRAWRECT:  'Draw Rectangle',
    z_MESSAGE_TB_DRAWARROW:  'Draw Arrow',
    z_MESSAGE_TB_DRAWPOSITIONMARKER:  'Draw Position Marker',
    z_MESSAGE_TB_DRAWTEXT:  'Draw Text',
    z_MESSAGE_TB_UNDOREDLINE:  'Undo Last Redline',
    z_MESSAGE_TB_CLEARREDMARKS:  'Clear Redmarks',
    
    z_MESSAGE_PROMPT_ERROR: 'Error',
    z_MESSAGE_PROMPT_NODOC: 'No document specified to load',
    z_MESSAGE_PROMPT_UNABLETOLOAD: 'Unable to load',
    z_MESSAGE_PROMPT_SELECTEDROOM: 'Selected room',
    z_MESSAGE_PROMPT_ALREADYASSIGNEDTO:  'already assigned to', 
    z_MESSAGE_PROMPT_NONE: 'None', 
    z_DRAWING_PRINTING: 'It will take a moment to export the drawing, do you want to continue?',
	z_MESSAGE_PROMPT_LEAVEREDMARKSINVISIBLE: 'Some of the redlines you created are currently not visible on the drawing view and will not be printed. Do you still want to continue?',

	z_MESSAGE_FILTER: 'Filter:',
	z_MESSAGE_BORDERS: 'Borders:',
	z_MESSAGE_TOOLTIP_LEGEND: 'Legend',
	z_MESSAGE_TOOLTIP_MINIMIZE: 'Minimize',
	Z_MESSAGE_TOOLTIP_MAXIMIZE: 'Maximize',
	z_MESSAGE_TOOLTIP_FILTER_COLUMN: 'Filters the first column.',
	z_MESSAGE_TOOLTIP_FILTER: 'Filter',
	z_MESSAGE_PLEASE_WAIT: 'Please wait...',
	// @end_translatable
		
	ver: '18.10.00.06',
	
	// member variables controlling the initial layout
	swf: "abDrawing",
	
	application: "abDrawing",
	
	bgColor: "#dddddd",
	
	onLoadDcl: null,
	
	onLoadOpts: null,
	
	roomToHighlight: null,
	
    // Data source for initial highlighting
    highlightDataSource: '',
    
    // Data source labels
    labelsDataSource: '',
    highlightDataSourcePanel: '',
    
    labelsDataSourcePanel: '',
    
    // Highlight type
    highlightType: '',
    
    thematicHighlightStyle: '',
    
    projectionType: 'tiled',
    
    columnsGroupedBy: '',
    
    borderHighlightLegendPanel: '',
    
	legendPanel: '',			// The id of the legend panel, if any
	legendPanelDs: '',
	legendPanelSelectable: false,
	
	initialData: '',			// The primary key info used to add a drawing on startup
	
	multiple: '',				// Controls whether or not more than 1 drawing can be loaded at a time
    
    //highlightValueField: '',	// not currently supported
    
    assetTypes: '',
    
    selectionMode: '2',			// Graphics are selectable, possible values: 
    							//	0: None
    							//  1: Only Assigned (per highlightDataSource results)
    							//  2: All
    
   	assignMode: '0',			// Deterimes how the Drawing Control should function per this mode
   								// If > 0, this overrides the multipleSelectionEnabled setting
   								//	0: Disabled
   								//	1: One to One
   								//	2: One to Many
   								//  3: Many to One
    							
    multipleSelectionEnabled: true,	// Allow multiple assets to be selected
    
    nofillField: '',			// Field name associated with nofillValues
    
    nofillValues: null,			// Array of values to have no fill associated with them
    
    toolbarSettings: '',		// A string that specifies toolbar settings
    							// Format of toolbarSettings
								//		action1=commaDelimitedListOfButtonNames;action2=...
								//
								//	Examples:
								//		show=resetAssets,clearAssets;
								//		hide=iso;
								//		enalbe=iso,autoCenter;
								//		disable=zoomIn;
								//		hide=all;
								//		hide=zoomOut;disable=autoScale,iso,etc;
								//
								//	List of valid actions:
								//		show
								//		hide
								//		enable
								//		disable
								//
								//	List of currently supported button names
								//		all
								//		state    (group of state buttons are only supported as group:  
								//					select, pan, and zoomWindow)
								//		resetAssets
								//		clearAssets
								//		zoomIn
								//		zoomOut
								//		autoScale
								//		autoCenter
								//		iso
								//

    // private specified member variables
    
    dwgConfig: null,
    
    labelSelector: true,		
    
   	highlightSelector: true,	

    /**
     * If true, add panel header buttons that display the legend panel as an overlay
     */
    showLegendOverlay: false,

    /**
   	 * borders highlight datasources selector.
   	 */
	bordersHighlightSelector: false,	
	
	/**
   	 * filter highlight datasources selector.
   	 */
	highlightFilterSelector: false,	
   	
    currentHighlightDS: '',
    
    /**
     * borders highlight dataSource.
     */
    currentBordersHighlightDS: null,
    
    /**
     * filter highlight dataSource.
     */
    currentHighlightFilterDS: null,
    
    /**
     * highlight restriction.
     */
    currentHighlightRestriction: null,
    
    currentLabelsDS: '',
    
    initialized: false,
    
    legendCtrlInit: false,		// If the legend is enabled, has it been initialized
    
    dwgLoaded: false,			// Is only set to true if a drawing has been successfully loaded
    
    noneTxt: 'None',			// The None value displayed in highlight and label selectors
	
	ruleSets: null,				// An array of rule sets used for highlights, if any
	
	instructs: null,			// An object that keeps track of specified instructions, if any
	
	_delim: ';',
	
	
	_draggableAssets: [],        //asset in room to be dragged.
	
	/**
	 * It's new selection highlight pattern. 
	 * If it's true, the selected room will display diagonal border, and the room's highlight color will be intact.
	 * Application should set it to be true, when border highlight is enable or keep selected room's highlight color intact.
	 */
	_displayDiagonalSelectionPattern: false, 
											
	
	optionalPKFields: null,		// An array of optional array of full field names, to instruct the 
								// onclick handler to return that extra information.
	redmarksEnabled : false,
	
	zoomToRoom: false,
	
    liteDisplay: true,          // enables display of the current room ID in the panel title
	
	constructor:function(id, config){	
	    // Global variable used for javascript access from the flex app
		jsAccessFromFlex = this;
	
	    this.inherit(id, 'drawing', config);

	    this.swf 					= config.getConfigParameter('swf', 'abDrawing');
	    this.application 			= config.getConfigParameter('application', 'abDrawing');
	    this.bgColor 				= config.getConfigParameter('bgColor', '#dddddd');
	
		this.highlightDataSource 	= config.getConfigParameter('highlightDataSource', '');
		this.labelsDataSource 		= config.getConfigParameter('labelsDataSource', '');
		this.highlightType			= config.getConfigParameter('highlightType', '');
		this.thematicHighlightStyle = config.getConfigParameter('thematicHighlightStyle', '');
		this.projectionType			= config.getConfigParameter('projectionType', 'tiled');
		this.columnsGroupedBy		= config.getConfigParameter('columnsGroupedBy', '');
		//this.highlightValueField	= config.getConfigParameter('highlightValueField', ''); not currently supported
		this.assetTypes				= config.getConfigParameter('assetTypes', '');
		this.legendPanel			= config.getConfigParameter('legendPanel', '');
		this.borderHighlightLegendPanel = config.getConfigParameter('borderHighlightLegendPanel', '');
		
		this.initialData			= config.getConfigParameter('initialData', '');
		this.multiple				= config.getConfigParameter('multiple', '');
		this.selectionMode			= config.getConfigParameter('selectionMode', '2');
		this.multipleSelectionEnabled = config.getConfigParameter('multipleSelectionEnabled', 'true');
		this.assignMode				= config.getConfigParameter('assignMode', '0');
		this.toolbarSettings		= config.getConfigParameter('toolbarSettings', '');
		
		this.bordersHighlightSelector = config.getConfigParameter('bordersHighlightSelector', 'false');
		this.highlightFilterSelector = config.getConfigParameter('highlightFilterSelector', 'false');
        this.showLegendOverlay = config.getConfigParameter('showLegendOverlay', false);
    	this.highlightSelector = config.getConfigParameter('highlightSelector', 'true');
		this.labelSelector = config.getConfigParameter('labelSelector', 'true');
        

		if (!valueExistsNotEmpty(this.selectionMode))
			this.selectionMode = '2';
					  
        // Initialize the configuration object
		this.initConfig();
		this.localize();
		this.currentHighlightDS = this.highlightDataSource;
		this.currentLabelsDS = this.labelsDataSource;

		// add listener for afterResize()
		this.addEventListenerFromConfig('afterResize', config);
	},
				
	initConfig:function(){
    	AdminService.getDrawingControlConfig({
        	callback: function(ob){
        		var a = jsAccessFromFlex;
        		a.dwgConfig = ob;
        		gAcadColorMgr.setAssignedInitConfig(ob.highlights);
        		gAcadColorMgr.setUnassignedInitConfig(ob.highlights);
        		gAcadColorMgr.setSelectedInitConfig(ob.highlights);
        		gAcadColorMgr.setNoFillInitConfig(ob.highlights);

        		// add the default assigned color as the first auto assigned color
        		// then add the rest of auto colors.
        		var autoColors = new Array();
        		autoColors[0] = '0x' + gAcadColorMgr.getRGB(ob.highlights.assigned.fill.color, true, true);
        		var index = 1;
        		for (var i=0;i<ob.autoAssignColors.length;i++){
        			//do not add the auto color if it is the same as the default assigned color
        			if(ob.autoAssignColors[i].toLowerCase() != autoColors[0].toLowerCase()){
        				autoColors[index] = ob.autoAssignColors[i];
        				index++;
        			}
        		}
        		gAcadColorMgr.setAutoAssignColors(autoColors);
        		
        		gAcadColorMgr.setIdealLabelTextSize(ob.idealLabelTextSize);
        		gAcadColorMgr.setMinimumLabelTextSize(ob.minimumLabelTextSize);
        		gAcadColorMgr.setShrinkLabelTextToFit(ob.shrinkLabelTextToFit);
        	},
        	
        	errorHandler: function(m, e){
            	Ab.view.View.showException(e);
       	 }
		});
	},

    /**
     * Called before the dialog containing this view is closed.
     */
    beforeUnload: function() {
        this.clear();
    },

    getDrawingControl:function(){
		if(FABridge.abDrawing && FABridge.abDrawing.root())
			return FABridge.abDrawing.root();
		else
			this.getDrawingControl.defer(100);
	},
	
	localize:function() {
	   this.noneTxt = this.getLocalizedString(this.z_MESSAGE_PROMPT_NONE);
	},
	
	localizeFlash:function(){
	   // load localized strings that are used by the Flash Control itself
        var ob = new Object();
        
        ob['TB_SELECT'] = this.getLocalizedString(this.z_MESSAGE_TB_SELECT);
        ob['TB_PAN'] = this.getLocalizedString(this.z_MESSAGE_TB_PAN);
        ob['TB_ZOOMWINDOW'] = this.getLocalizedString(this.z_MESSAGE_TB_ZOOMWINDOW);
        ob['TB_ZOOMIN'] = this.getLocalizedString(this.z_MESSAGE_TB_ZOOMIN);
        ob['TB_ZOOMOUT'] = this.getLocalizedString(this.z_MESSAGE_TB_ZOOMOUT);
        ob['TB_ZOOMEXTENTS'] = this.getLocalizedString(this.z_MESSAGE_TB_ZOOMEXTENTS);
        ob['TB_AUTOCENTER'] = this.getLocalizedString(this.z_MESSAGE_TB_AUTOCENTER);
        ob['TB_ISO'] = this.getLocalizedString(this.z_MESSAGE_TB_ISO);
        ob['TB_RESETASSETS'] = this.getLocalizedString(this.z_MESSAGE_TB_RESETASSETS);
        ob['TB_CLEARASSETS'] = this.getLocalizedString(this.z_MESSAGE_TB_CLEARASSETS);

        ob['TB_ZOOMWINDOW'] = this.getLocalizedString(this.z_MESSAGE_TB_ZOOMWINDOW);
        ob['TB_MULTISELECT'] = this.getLocalizedString(this.z_MESSAGE_TB_MULTISELECT);
        ob['TB_DRAWLINE'] = this.getLocalizedString(this.z_MESSAGE_TB_DRAWLINE);
        ob['TB_DRAWRECT'] = this.getLocalizedString(this.z_MESSAGE_TB_DRAWRECT);
        ob['TB_DRAWARROW'] = this.getLocalizedString(this.z_MESSAGE_TB_DRAWARROW);
        ob['TB_DRAWPOSITIONMARKER'] = this.getLocalizedString(this.z_MESSAGE_TB_DRAWPOSITIONMARKER);
        ob['TB_DRAWTEXT'] = this.getLocalizedString(this.z_MESSAGE_TB_DRAWTEXT);
        ob['TB_UNDOREDLINE'] = this.getLocalizedString(this.z_MESSAGE_TB_UNDOREDLINE);
        ob['TB_CLEARREDMARKS'] = this.getLocalizedString(this.z_MESSAGE_TB_CLEARREDMARKS);

        ob['PROMPT_ERROR'] = this.getLocalizedString(this.z_MESSAGE_PROMPT_ERROR);
        ob['PROMPT_NODOC'] = this.getLocalizedString(this.z_MESSAGE_PROMPT_NODOC);
        ob['PROMPT_UNABLETOLOAD'] = this.getLocalizedString(this.z_MESSAGE_PROMPT_UNABLETOLOAD);    
             
        ob['PROMPT_SELECTEDROOM']  = this.getLocalizedString(this.z_MESSAGE_PROMPT_SELECTEDROOM);
        ob['PROMPT_ALREADYASSIGNEDTO'] = this.getLocalizedString(this.z_MESSAGE_PROMPT_ALREADYASSIGNEDTO);
        
        ob['TOOLTIP_MINIMIZE'] = this.getLocalizedString(this.z_MESSAGE_TOOLTIP_MINIMIZE);
        ob['TOOLTIP_MAXIMIZE'] = this.getLocalizedString(this.Z_MESSAGE_TOOLTIP_MAXIMIZE);
        
        ob['TOOLTIP_FILTER_COLUMN'] = this.getLocalizedString(this.z_MESSAGE_TOOLTIP_FILTER_COLUMN);
        ob['TOOLTIP_FILTER'] = this.getLocalizedString(this.Z_MESSAGE_TOOLTIP_FILTER);
        
        ob['MESSAGE_PLEASE_WAIT'] = this.getLocalizedString(this.z_MESSAGE_PLEASE_WAIT);
        
        return ob;
	},

    getContainerElementId: function() {
        return this.parentElementId + '_container';
    },
	
	initialDataFetch: function() {
		this.appendDatasourceSelectors();

		FABridge.addInitializationCallback(this.application, this.initAfterLoad);

        if(window.addEventListener) {
            var eventType = (navigator.userAgent.indexOf('Firefox') !=-1) ? "DOMMouseScroll" : "mousewheel";            
            window.addEventListener(eventType, handleWheel, false);
            dwgControlId = this.application;
        }

		var containerHtml = '<div id="' + this.getContainerElementId() + '"></div>';
        if (this.parentEl.first()) {
            Ext.DomHelper.insertHtml('afterEnd', this.parentEl.first().dom, containerHtml);
        } else {
            Ext.DomHelper.insertHtml('afterBegin', this.parentEl.dom, containerHtml);
        }

		var fullPath = View.contextPath + "/schema/ab-core/controls/drawing/" + this.swf;
		this.runContent(
				"src", fullPath,
				"width", "100%",
				"height", "100%",
				"align", "middle",
				"id", this.application,
				"quality", "high",
				"bgcolor", this.bgColor,
				"name", this.application,
				"flashvars", "bridgeName="+this.application,
				"allowScriptAccess","sameDomain",
				"type", "application/x-shockwave-flash",
				"wmode", "transparent", // "opaque" cause the mouse wheel not working in IE and Chrome,
				                        // "window" causes Flash to display on top of any dialog opened from JS
				"pluginspage", "http://www.adobe.com/go/getflashplayer"
		);		

        this.visible = true;
        // show|hide the panel instructions
        if (this.getInstructionsEl()) {
            this.showElement(this.getInstructionsEl(), true);
        }
	},

    afterResize: function() {
        this.syncHeight();
    },

    /**
     * Called from afterInitialDataFetch() in ab-flash-component.js to set the drawing container size.
     */
    syncHeight: function() {
        if (Ext.get(this.getContainerElementId())) {
            var availableHeight = this.determineHeight() - this.getActionbarHeight() - this.getInstructionsHeight() - 2;
            Ext.get(this.getContainerElementId()).setHeight(availableHeight);
        }
    },

    /**
     * @param {restriction} Ab.view.Restriction.
     */
    refresh: function(restriction) {
    	if (valueExists(restriction)) {
    		var dcl = new Ab.drawing.DwgCtrlLoc(restriction);
	    	if (dcl.containsFloor()) {
	    		this.clear();
				this.addDrawing(dcl);
			}
        }
        this.applyDS('labels');
        this.applyDS('highlight');
    },
    
    // ----------------------- export report selection --------------------------------------------------
    /**
     * Called by Ab.command.exportPanel in ab-command.js to have a report. 
     * 
     * @param {reportProperties} Map {outputType: this.outputType, printRestriction: this.printRestriction, orientation: this.orientation}
     */
    callReportJob: function(reportProperties){
    	var outputType = reportProperties.outputType, printRestriction = reportProperties.printRestriction, orientation = reportProperties.orientation, pageSize = reportProperties.pageSize;
    	if(outputType === 'docx' || outputType === 'pdf'){
    		var doIt = confirm(View.getLocalizedString(this.z_DRAWING_PRINTING));
    		if(!doIt) return;
    		
    		var parameters = {};
    		if(valueExists(printRestriction) && valueExists(this.restriction)){
				parameters.printRestriction = printRestriction;
				parameters.restriction = toJSON(this.restriction);
			}
			if(valueExistsNotEmpty(orientation)){
				parameters.orientation = orientation;
			}
			if(valueExistsNotEmpty(pageSize)){
				parameters.pageSize = pageSize;
			}
			
			parameters.outputType = outputType;
			
    		var reportTitle = this.title;
    		if(reportTitle==''){
    			reportTitle = Ab.view.View.title;
    		}
    		return this.callDOCXReportJob(reportTitle, null, parameters);
    	}else if(outputType === 'xls'){
    		//no translatable since it's only for viwew designers.
    		View.showMessage('error', 'XLS action is NOT supported for a Drawing panel.');
    	}
    	return null;
    },
    /**
	 * Call Docx report job and return job id. It's could be called by applications.
	 * 
	 * title: report title.
	 * restriction: parsed restriction - just compatible with grid control.
	 * parameters: Map parameters.
	 */
	callDOCXReportJob: function(title, restriction, parameters){
		var viewName = this.config.viewDef + '.axvw'; 
		if(valueExists(parameters) && valueExists(parameters.printRestriction)){
			//TODO: check
			parameters.dataSourceId = this.highlightDataSource;
		}
		
		//drawing image will occupy whole page
		parameters.fullPage = true;
		
		return Workflow.startJob("AbSystemAdministration-generatePaginatedReport-buildDocxFromChart", viewName, this.getImageBytes(), title, parameters);
	},
	
    //TODO: refactoring js and UploadMgr.as to make createImage() and getImageBytes()
    //simpler and more efficiency
    getImageBytes:function(){	
    	var quality = 100;
    	var result = [];
    	var arTmp = null;
    	//XXX: createImage() hold browser's JS engine???
    	//var arInfo = FABridge.abDrawing.root().createImage("JPG", quality, true);
    	var arInfo = FABridge.abDrawing.root().createImage("PNG", quality, true);	
    	var size = arInfo[0];
    	var max = arInfo[1];

    	for (var iPos = 0; iPos < size; iPos += max){
    		var arTmp = FABridge.abDrawing.root().getImageBytes(iPos);
    		if (arTmp != null) {
    			for (var k = 0, l = 0; k < arTmp.length && l < size; k++, l++){
    				result[iPos + k] = arTmp[k];
    			}
    		 } else{
    			iPos = size;
    		 }
    	}
    	return result;
	 },
	 
	 //------------------------------------ end of report section ----------------------------------------------------------
	 
	clear : function() {
		try{
			FABridge.abDrawing.root().removeAllDrawings('');
		}catch(e){
			//do nothing
		}
	},
	
	getSelectedAssetIds:function() {
		return FABridge.abDrawing.root().getSelectedAssetIds();
	},
	
	initAfterLoad: function()
	{
		var a = jsAccessFromFlex;
		a.onLoadHandler();
		a.initialized = true;
		// Initialize the isometric setting in the viewer
		a.isometric((a.projectionType == 'isometric'), false);
		if (a.onLoadDcl != null) {
			var opts = new DwgOpts(a.onLoadOpts);
			if(a.zoomToRoom){
						FABridge.abDrawing.root().findAsset(a.onLoadDcl,opts);
			} else {				
				a.addDrawing(a.onLoadDcl, opts);
			}			
		} else if (a.initialData.length) {
			var dcl = new Ab.drawing.DwgCtrlLoc();
			dcl.setFromArray(eval(a.initialData));
			a.initialData = '';
			a.addDrawing(dcl);
		} else if (a.roomToHighlight){
			a.highlightAssets(a.roomToHighlight);
		}
		if(a.redmarksEnabled){
			a.enableRedmarks();
		} else {
			a.disableRedmarks();
		}
	},
	
	/**
	 * add drawing to the dwgcontainer
	 * @param loc		A Ab.drawing.DwgCtrlLoc object or a Ab.gridRow object. Required
	 * @param optsIn	Optional, provides greater control of initial display:
	 *					optsIn is a DwgOpts object
	 */
	addDrawing:function(dcl, optsIn){
		if (!valueExists(dcl))
			return;
			
		if (!this.initialized) {
		    dcl = new Ab.drawing.DwgCtrlLoc(dcl);
			this.onLoadDcl = dcl;
			this.onLoadOpts = optsIn;
			return;
		}

		var load = true;
		
		if (valueExists(dcl.row))
	 		load = dcl.row.isSelected();
		
		if (!valueExists(dcl.pks))
			dcl = new Ab.drawing.DwgCtrlLoc(dcl);

		try{
			if(load){		
				var pkId = dcl.getPkValueString();
				var opts = new DwgOpts(optsIn);	// set default options
				if (valueExistsNotEmpty(pkId))
					opts.highlightId = pkId;
				if (!this.assetTypes == '')
					opts.assetTypes = this.assetTypes;
				if (this.multiple == 'false')
					opts.multiple = false;
				FABridge.abDrawing.root().addDrawing(dcl, opts);
			} else {
				this.removeDrawing(dcl);
			}
		}catch(e){
			return false;
		}
		
		return true;
	},

	
	/**
	 * remove drawing from dwgcontainer
	 * @param value drawing name
	 */
	removeDrawing:function(value){
		FABridge.abDrawing.root().removeDrawing(value);	
	},	

	/**
	 * clear highlight in drawing and checkboxes
	 * calls flex
	 */
	clearHighlights:function(){
		FABridge.abDrawing.root().clearRooms();
	},
	
	/**
	 * isometric projection
	 * calls flex
	 */
	isometric:function(isometric, apply){
		FABridge.abDrawing.root().setIsometric(isometric, apply);		
	},
	
	/**
	 * sets the current selection color to be applied
	 * calls flex
	 */
	setSelectColor:function(color) {
		FABridge.abDrawing.root().setSelectColor(color);
	},
	
	/**
	 * sets the current assignment values
	 * calls flex
	 */
	setToAssign:function(field, val, color) {
		FABridge.abDrawing.root().setToAssign(field, val, color);
	},
	
	/**
	 * unassigns the specified value
	 * calls flex
	 */
	unassign:function(field, val) {
		FABridge.abDrawing.root().unassign(field, val);
	},
	
	
	/**
	 * findAsset
	 * zooms into a asset in an loaded drawing
	 * @param ob 		A Ab.drawing.DwgCtrlLoc object or an Ab.grid.Row object.  Required
	 * @param opts		A DwgOpts object for overriding fill defaults.  Optional, defaults to null
	 * @param zoomToId	Boolean to zoom in or not to the asset id.  Optional, defaults to false
	 * @param loadDwg 	Force the drawing to load if not already loaded. Optional, defaults to true
	 * @param bSelected Forces the selection to be true/false. Optional
	 */	
	findAsset:function(ob, opts, zoomToId, loadDwg, bSelected) {
		var opts = new DwgOpts(opts);
		var dcl = new Ab.drawing.DwgCtrlLoc(ob);
		
		if (valueExists(ob.row)) {	
			opts.mode = 'selected';
			if (valueExists(bSelected) && !bSelected) {
					opts.mode = 'unselected';
			}
		} 
		
		if(this.assetTypes){
			opts.assetTypes = this.assetTypes;
		}
		
		var pkId = dcl.getPkValueString();
		if (valueExists(pkId)) {
			opts.appendRec(pkId);
			opts.highlightId = pkId;
		}
		
		opts.dwgName = dcl.toArray(true);
		if (valueExists(zoomToId))
			opts.zoomToId = zoomToId;
		if (valueExists(loadDwg))
			opts.forceload = loadDwg;
		opts.exclusive = true;
		
		if (!this.initialized) {
			this.zoomToRoom = true;
			this.onLoadDcl = dcl;
			this.onLoadOpts = opts;
		} else {
			FABridge.abDrawing.root().findAsset(dcl, opts);
		} 
		
		return true;
	},	
	
	/**
	 * Highlight Asset(s)
	 *
	 * @param optsIn:	A DwgOpts object
	 * @param rows:		wither a Ab.grid.Row object or an array of Ab.grid.Row objects. Optional
	 * 
	 * YQ 05/2012 - support multiple rows's highlight to all Drawing Control's highlightAssets() function only once.
	 */	
	highlightAssets:function(optsIn, rows) {
		// if it is a single row, make it an array to support backward compatibility.
		if (valueExists(rows) && Object.prototype.toString.call(rows) != '[object Array]'){
	 		rows = [rows];
	 	}
	 	
		
	 	if(valueExists(rows) && rows.length > 0) {
		 	//retrieve all the drawing names from the rows as an array
		 	var drawingNamesAndNumbers = this.getDrawingNamesFromRows(rows);
		 	
		 	//looping through each drawing, highlight them.
			for(var index = 0; index < drawingNamesAndNumbers.length; index++){
				var drawingNameCount = drawingNamesAndNumbers[index];
	
				//defer each highlightAsset calling based on the number of records (each record is give 30 milliseconds).
				this.highlightAssetsForDrawing.defer(30*drawingNameCount.count, this.highlightAssetsForDrawing, [optsIn, rows, drawingNameCount.name, this.assetTypes, this.multiple]);
			}
	 	} else {
	 		//fix for kb#3038096 - highlight when no rows are passed (the records are passed from optsIn.recs value)
	 		var opts = new DwgOpts(optsIn);
			opts.zoomToId = false;	// is not supported in highlight mode, ensure is off
		    
			FABridge.abDrawing.root().highlightAssets(opts);
			return true;
	 	}
	 	
	 },

	/**
	 * Highlight Asset(s) for the specified drawing.
	 *
	 * @param optsIn:	A DwgOpts object
	 * @param rows:		An array of Ab.grid.Row objects. Optional
	 * @param drawingName: the name of the specified drawing.
	 * 
	 * YQ 05/2012 - support multiple rows's highlight to all Drawing Control's highlightAssets() function only once.
	 */	
	highlightAssetsForDrawing:function(optsIn, rows, drawingName, assetTypes, multiple){
		 	var opts = new DwgOpts(optsIn);
			
			//set assetTypes for non-room assets
			if (assetTypes)
				opts.assetTypes = assetTypes;
	
			//set if the multiple assets can be displayed on the drawing.
			if (multiple == 'false')
				opts.multiple = false;
	
			// zooming to id is not supported in highlight mode, ensure is off
			opts.zoomToId = false;	
	
			//record the first row of the specified drawing
			var firstIndex = 0;
			
			//append the each row's record into drawing option object
			var numberOfRows = 0;
			for(var i = 0; i < rows.length; i++){	
		 		var dcl = new Ab.drawing.DwgCtrlLoc();
		 		dcl.setFromCtrlOb(rows[i], true);
		 		var id = dcl.getPkValueString();
		 		if (id && id.length>0 && valueExists(dcl.dwgname) && drawingName==dcl.dwgname.toLowerCase()) {
	 		 		var fl_id = '';
	 		 		var bl_id = '';
	 		 		for (var name in rows[i].row.record) {
	 					if (name.indexOf('.bl_id') >= 0)
	 						bl_id = rows[i].row.record[name];
	 					else if (name.indexOf('.fl_id') >= 0)
	 						fl_id = rows[i].row.record[name];
	 				}
	 		 		
	 		 		if(numberOfRows==0)
	 		 			firstIndex = i;
	 		 		
	 		 		opts.appendRecNonRm(bl_id, fl_id, id);
	 		 		numberOfRows++;
	 			}
			}
		 	
			if (!valueExists(opts.mode))
				opts.mode = 'selected';
			
			if (valueExists(drawingName))
			    opts.rawDwgName = drawingName;
	
			//call highlightAssets function once.
			// YQ - Do not use the getDrawingControl() function.
			FABridge.abDrawing.root().highlightAssets(opts);
				
			return numberOfRows;

	},
	
	
	/**
	 * Gets an array of drawing names and its corresponding number of records from the grid's rows.
	 * 
	 * @param rows:		an array of Ab.grid.Row objects. Optional
	 * @returns an array of drawing names.
	 */
	getDrawingNamesFromRows:function(rows){
	 	var drawingNames = new Array();
	 	var numberOfRows = new Array();
	 	
	 	//loop through the rows to store new drawing names and its counts
		for(var i = 0; i < rows.length; i++){	
	 		var dcl = new Ab.drawing.DwgCtrlLoc();
	 		dcl.setFromCtrlOb(rows[i], true);
	 		
	 		// add the drawing name if not yet.
	 		if (valueExists(dcl.dwgname)){
	 			if(drawingNames.indexOf(dcl.dwgname) == -1){
	 				drawingNames.push(dcl.dwgname.toLowerCase());
	 				numberOfRows.push(0);
	 			}
	 			
	 			//increment the number of records for the specified drawing name
	 			var index = drawingNames.indexOf(dcl.dwgname);
	 			numberOfRows[index] = numberOfRows[index]+1;
	 		}
		}
		
		//add the drawing name and count object into the array
		var drawingNamesAndNumbers = new Array();
		for(i = 0; i < drawingNames.length; i++){
			var dwgNameCount = new Object();
			dwgNameCount.name = drawingNames[i];
			dwgNameCount.count = numberOfRows[i];
			drawingNamesAndNumbers.push(dwgNameCount); 
		}
		
		return  drawingNamesAndNumbers;
	},
	
	/**
	 * highlightAssets
	 * 
	 * @param optsIn: 	A DwgOpts object
	 * @param dcl:		A DwgCtrlLoc object
	 */
	highlightAssetsFromDcl:function(optsIn, dcl) {
	 	var opts = new DwgOpts(optsIn);
 		
 		var s = dcl.getPkValueString();
 		if (!s.length)
 			return false;
 		
		opts.appendRec(s);
		if (valueExists(dcl.dwgname))
			opts.rawDwgName = dcl.dwgname;
		
		opts.zoomToId = false;	// is not supported in highlight mode, ensure is off
		if (!this.initialized) {
			this.roomToHighlight = opts;
		} else {
			FABridge.abDrawing.root().highlightAssets(opts);
		}		
		return true;
	},
	
	clearPersistFills:function() {
		FABridge.abDrawing.root().clearPersistFills();
	},
	
	/**
	 * setSelectability
	 *
	 * @param optsIn:		A DwgOpts object
	 * @param selectable:	Boolean
	 */	
	setSelectability:function(opts, selectable)
	{
		FABridge.abDrawing.root().makeAssetsSelectable(opts, selectable);
	},
	
	labelData: null,
	
	/**
	 * setLabels
	 *
	 * @param optsIn:	A DwgOpts object
	 */	
	setLabels:function(loc, opts, mode) {
		this.labelData = new Array();
		this.labelData[0] = loc;
		this.labelData[1] = opts;
		this.labelData[2] = mode;
		FABridge.abDrawing.root().applyLabels();
	},
	
	getLabelData:function() {
		return this.labelData;
	},
	
	appendNofillValue: function(val, fill) {
		if (!valueExists(this.nofillValues))
			this.nofillValues = new Array();
		var ob = new Object();
		ob.value = val;
		ob.fill = fill;
		this.nofillValues[this.nofillValues.length] = ob;
	},
	
	appendInstruction: function(ctrlId, eventName, msg, onlyIfDwgLoaded) {
		var instr = new DwgInstruction(ctrlId, eventName, msg, onlyIfDwgLoaded);
		if (!valueExists(this.instructs))
			this.instructs = new Object();
		this.instructs[ctrlId+eventName] = instr;
	},
	
 	/**
 	*
 	*		Clears the assign cache.  
 	*		Typically called after assignments have been saved or cleared
 	*
 	*/
	clearAssignCache: function(resetColors) {
		try{
			if (resetColors)
				gAcadColorMgr.reset();
			FABridge.abDrawing.root().clearAssignCache();
		}catch(e){}
	},
	
 	/**
 	*
 	*		Executes the specified toolbar button's associated functionality 
 	*
 	*/
 	toolbarCmd: function(buttonName) {
 		FABridge.abDrawing.root().toolbarCmd(buttonName);
 	},
	
 	/**
 	*
 	*     Functions designed to be called by the Flash component actionscript
 	*		These are essentiallly helper functions for providing easy access
 	*		for actionscript to the datasource
 	*
 	*/
 	getDataSource: function(type, dataSourceName){
 		if(valueExistsNotEmpty(dataSourceName) && dataSourceName != 'None'){
 			return View.dataSources.get(dataSourceName);	
 		}
 		
 		if (type == 1 && valueExistsNotEmpty(this.labelsDataSourcePanel)){
 			var contentFrame = View.panels.get(this.labelsDataSourcePanel).getContentFrame();
 			var contentView = contentFrame.View;
 			var labelDS = contentView.dataSources.get(this.getDSName(type));
 			return new Ab.data.DataSource(this.getDSName(type), labelDS.config);
 			
 			//return contentView.dataSources.get(this.labelsDataSource); 			
 		} else if (type == 2 && valueExistsNotEmpty(this.highlightDataSourcePanel)){
 			var contentFrame = View.panels.get(this.highlightDataSourcePanel).getContentFrame();
 			var contentView = contentFrame.View;
 			var hlDS = contentView.dataSources.get(this.getDSName(type));
 			return new Ab.data.DataSource(this.getDSName(type), hlDS.config);
 			
 			//return contentView.dataSources.get(this.highlightDataSource);
 		} 	 	
 		
		return View.dataSources.get(this.getDSName(type));	
 	},
 	
  	currentRecSet: null,
 
 	/**
 	* wrapper method called from actionscript code to retrieve data
 	* @param pks	Parent Keys used as a restriction, see notes inside function
 	*/
 	getDataSourceRecords: function(type, pks, datasourceName, runTimeRestriction){
 		var dsName = this.getDSName(type);
 		if(valueExistsNotEmpty(datasourceName)){
 			dsName = datasourceName;
 		}
 		var ds = View.dataSources.get(dsName);
 		
 		var restriction = null;
 		
 		
 		var loc = this.getPkFieldNames(ds);
 	
 		//
 		// Note: Current implementation of pks Array
 		//			pks[n] == fieldname
 		//			pks[n + 1] == value
 		//
 		if (valueExistsNotEmpty(pks)){
 			restriction = new Ab.view.Restriction();
 			// <clause relop="AND" op="=" value="HQ" name="bl_id" table="rm"/>
 			// addClause: function(name, value, op, replace) {
 			
 			// Note: the field value used is the one from the datasource
 			//		 Ignoring values passed in from the flash component
 			var j = 1;
 			for (var i = 0; j < pks.length; i++) {
 				restriction.addClause(loc.pks[i], pks[j], "=", true);
 				j += 2;
 			}
 		}

 		try {
 			if(valueExistsNotEmpty(this.currentHighlightRestriction)){
 				if(valueExistsNotEmpty(restriction)){
 					//allow overwritting
 					restriction.addClauses(this.currentHighlightRestriction, true, false);
 				}else{
 					restriction = this.currentHighlightRestriction;
 				}
 			}
			// Always retrieve all records
	 		if(ds != null){
	 			if(valueExistsNotEmpty(this.currentHighlightFilterDS) && this.currentHighlightFilterDS != 'None'){
	 				
	 				var datasource = View.dataSources.get(this.currentHighlightFilterDS);
	 				if(datasource !== null){
	 					var records = datasource.getRecords(restriction, { recordLimit: 0 });
	 					var filterRestriction = this.getFilterRestriction(datasource, records);
	 					if(filterRestriction.length > 0){
	 						if(valueExistsNotEmpty(restriction)){
	 		 					for(var i=0; i<filterRestriction.length; i++){
	 		 						filterRestriction[i].addClauses(restriction, false, false);
	 		 					}
	 		 				}
	 						restriction = filterRestriction;
	 					}
	 				}
	 			}
	 			
	 			if(restriction!=null && valueExistsNotEmpty(runTimeRestriction)){
	 				restriction.addClauses(runTimeRestriction, true, false);
	 			}else if(restriction == null && valueExistsNotEmpty(runTimeRestriction)){
	 				restriction = runTimeRestriction;
	 			}
	 			var formattedRecords = [];
	 			var records = ds.getRecords(restriction, { recordLimit: 0 });
	 			for(var i=0;i<records.length; i++){
	 				var record = records[i];
	 				record.values = ds.formatValues(record.values, true);
	 				formattedRecords.push(record);
	 			}
	 			
	 			this.currentRecSet = formattedRecords;
	 		}
	 		return this.currentRecSet;
		} catch (e) {
			this.handleError(e);
		}
 	},
 	
	query: function(type, pks, datasourceName, restriction){
 		this.getDataSourceRecords(type, pks, datasourceName, restriction);
 		return (this.currentRecSet != null) ? this.currentRecSet.length : 0;
 	},
 	
 	getRecValues: function(pos)
 	{
 		if (this.currentRecSet == null || pos >= this.currentRecSet.length)
 			return null;
 			
 		return this.currentRecSet[pos].values;
 	},
 
 	getDSName:function(type)
 	{
 		// Note: A type of 0 == NONE
  		var dsName = "";
 		if (type == 1)	// Labels
 			dsName = this.currentLabelsDS;
 		else if (type == 2)	// Hilite
 			dsName = this.currentHighlightDS;
 		return dsName;
 	},
 	
 	getColumnsGroupedBy:function()
 	{
 		return this.columnsGroupedBy;
 	},
 	
 	getDwgConfig: function() {
 		return toJSON(this.dwgConfig);
 	},
 	
 	getAcadColor: function(colorNum)
 	{
 		return gAcadColorMgr.getRGB(colorNum);
 	},
 	
 	getColorFromValue: function(fullfield, val, asHex, ruleVal) {
 		var color = "";
 		if (this.ruleSets != null && valueExists(ruleVal)) {
 			var ruleSet = this.ruleSets[this.currentHighlightDS];
 			if (valueExists(ruleSet)) {
 				color = ruleSet.getColorFromValue(fullfield, ruleVal);
 				if (valueExists(color))	// is a hex string at this point
 					color = "" + parseInt("0x" + color, 16);
 			}
 		}
 		if (!valueExistsNotEmpty(color))
 			color = gAcadColorMgr.getColorFromValue(fullfield, val, asHex);
 		return color;
 	},
 	
 	decodePattern: function(patternString) {
 		var parameters = {
            "patternString": patternString
        };
        
        try {
            var result = Workflow.call('AbCommonResources-HighlightPatternService-decodePattern', parameters);
        } 
        catch (e) {
            Workflow.handleError(e);
        }
        
        var res = eval("(" + result.jsonExpression + ")");
        res.color = parseInt(res.rgbColor, 16);
        
        return res;
        //return { color: parseInt("ff0000", 16) };
 	},
 	
 	getColorFromPattern: function(pattern, asHex) {
 		return gAcadColorMgr.getRGBFromPattern(pattern, asHex);
 	},
 	
 	getUnassignedColor: function(asHex) {
 		return gAcadColorMgr.getUnassignedColor(asHex);
 	},
 	
 	getNofillField: function() { 
 		return this.nofillField;
 	},
 	
 	getNofillValues: function() {
 		return this.nofillValues;
 	},
 	
 	getHighlightRuleValueField: function() {
 		var s = "";
 		if (this.ruleSets != null) {
 			var ruleSet = this.ruleSets[this.currentHighlightDS];
 			if (valueExists(ruleSet))
 				s = ruleSet.getField();
 		}
 		return s;
 	},
 	
 	getDelim: function() {
 		return this._delim;
 	},
 	
 	/**
 	 * Called by Actionscript.
 	 */
 	getDraggableAssets:function(){
 		return this._draggableAssets;
 	},
 	/**
 	 * Called by Application JS.
 	 */
 	setDraggableAssets: function(draggableAssets){
 		this._draggableAssets = draggableAssets;
 	},
 	
 	/**
 	 * Sets displayDiagonalSelectionPattern to be true or false.
 	 * 
 	 */
 	setDiagonalSelectionPattern:function(isDiplayed){
 		this._displayDiagonalSelectionPattern = isDiplayed;
 	},
 	
 	/**
 	 * Gets displayDiagonalSelectionPattern.
 	 */
 	getDiagonalSelectionPattern:function(){
 		return this._displayDiagonalSelectionPattern;
 	},
 	
 	getHighlightSettings: function() {
 		var ob = new Object();
 		ob.highlightType = this.highlightType;
 		ob.thematicHighlightStyle = this.thematicHighlightStyle;
    	return ob;
 	},
 	
 	getToolbarSettings: function() {
 		return this.toolbarSettings;
 	},
 	
 	getOptionalPkFields: function() {
 		return this.optionalPKFields;
 	},
 	
 	onClickHandler: function(pks, selected, color, assetType)
 	{
 		this.processInstruction(this.id, "onclick");
	    var listener = this.getEventListener('onclick');
	    if (listener != null){
	        listener(pks, selected, color, assetType);
	     }
 	},

 	/**
 	 * Checks if the 'onMultipleSelectionChange' event handler has been defined. If so, drawing control will invoke it.
 	 */
 	onMultipleSelectHandler: function()
 	{
 		//only allow multiple select if 'multipleSelectionEnabled' is true
 		if(!this.multipleSelectionEnabled)
 			return;
 		
 		this.processInstruction(this.id, "onMultipleSelectionChange");
	    
 		var listener = this.getEventListener('onMultipleSelectionChange');
	    if (listener != null){
	        listener();
	     } 
 	},
 	
 	/**
 	 * Returns true if the multiple selection is enabled (multipleSelectionEnabled=true)  and 'onMultipleSelectionChange' event handler has been defined, returns false otherwise. 
 	 */
 	isMultipleSelectHandlerDefined: function(){
 		var handlerDefined = false;
 		
 		if(this.multipleSelectionEnabled && this.getEventListener('onMultipleSelectionChange') != null){
 			handlerDefined = true;
 		}

 		return handlerDefined;
 	
 	},
 	
 	/**
 	 * Retrieves an arrray of the selected assets. 
 	 * Each element of the selected asset array has this data structure:
 	 * 		.pks: an array of primary keys of the select asset
 	 * 		.selected: boolean. true of the asset is selected, false if unselected.
	 * 		.color:  hex color. 
 	 */
 	getMultipleSelectedAssets:function()
 	{
 		return FABridge.abDrawing.root().getMultipleSelectedAssets();
 	},
 	
 	/**
 	 * Retrieves the value of the assigned object as a String.
 	 */
 	getAssignedValue:function()
 	{
 		return FABridge.abDrawing.root().getAssignedValue();
 	},
 	
 	/**
 	 * Retrieves an arrray of the one-to-many assigned assets. 
 	 * Each element of the one-to-many assigned asset array has this data structure:
 	 * 		.pks: an array of primary keys of the select asset
 	 * 		.selected: boolean. true of the asset is selected, false if unselected.
	 * 		.color:  hex color. 
 	 */
 	getAssignOneToManyAssets:function()
 	{
 		return FABridge.abDrawing.root().getAssignOneToManyAssets();
 	},
 	
 	onResetAssetsHandler: function()
 	{
 		var listener = this.getEventListener('onresetassets');
	    if (listener != null)
	        listener(); 
 	},
 	
 	onLoadHandler: function()
 	{
 		var listener = this.getEventListener('onload');
	    if (listener != null)
	        listener(); 
	        
	    this.processInstruction("default", "");
 	},
 	
 	onDatasourceChanged: function(type)
 	{
 		this.onDsChange('ondatasourcechanged', type);
 	},
 	
 	onSelectedDatasourceChanged: function(type)
 	{
	    this.onDsChange('onselecteddatasourcechanged', type);	
 	},
 	
 	onDsChange: function(funcname, type)
 	{
 		this.listenerHandler(funcname, type, this.getDSName(((type == 'highlight') ? 2 : 1)));
 	},
 	
 	listenerHandler: function(name, arg1, arg2)
 	{
 		var listener = this.getEventListener(name);
	    if (listener != null)
	        listener(arg1, arg2); 
 	},
 	
 	onHighlightsChanged: function()
 	{
  		var listener = this.getEventListener('onhighlightschanged');
	    if (listener != null)
	        listener(this.getDSName(2)); 
 	},
 	
    enableLiteDisplay: function(enabled) {
        this.liteDisplay = enabled;
 	},
 	
 	setLiteDisplay: function(pks)
 	{
 		// Only set if instructions are not being displayed
 		if (this.instructs != null || !this.liteDisplay)
			return;
			
		var val = '';
		for (var i = 0; i < pks.length; i++)
			val += ' : ' + pks[i];
			
		this.setTitleMsg('[' + val.substr(3) + ']');
 	},
 	
 	setTitleMsg: function(msg) {
		var tn = document.getElementById(this.id + '_title');
		if (tn == null)
			return;
			
		this.setTitle(msg);	
 	},

 	
 	/**
	 * sets the title (default on load is the building/floor id)
	 * @param loc		A Ab.drawing.DwgCtrlLoc object or a Ab.gridRow object. Required
	 * @param txt		The text to display. Required
	 * @ param af		A DwgLabel object.  Optional
	 */
 	setDrawingTitle: function(loc, txt, af) {
 		FABridge.abDrawing.root().setTitleText(loc, txt, af);
 	},
 	
 	flashAppLoaded: function()
 	{

 	},
 	
 	flashDocLoaded: function()
 	{

 	},
 	
  	/**
 	*
 	*	If a document fails to load, the flash application will pass
 	*	back an object that contains information about the failure
 	*	Currently, the 'ob' will only contain the 'pks' value.
 	*
 	*/
 	flashDocLoadFailed: function(ob)
 	{

 	},
 	
 	flashAssetsLoaded: function()
 	{
 		this.dwgLoaded = true;
 		this.processInstruction("ondwgload", "");
 		this.refreshLegendPanel();	// attempt to update the legend at this point after we are sure doc is fully loaded	
 	    var listener = this.getEventListener('ondwgload');
	    if (listener != null)
	        listener();
 	},
 	
 	appendRuleSet: function(dsName, ruleSet) {
 		//if (this.ruleSets == null)
 			this.ruleSets = [];
 		ruleSet.ds = dsName;
 		this.ruleSets[dsName] = ruleSet;
 	},
 	
 	removeRuleSet: function(dsName){
 		//no ruleset to remove
 		if (this.ruleSets == null)
 			return;
 		
 		if(dsName != undefined){
 			delete this.ruleSets[dsName];
 		}
 	},
 	
 	clearRuleSets: function(){
 		 this.ruleSets = new Array();
 	},
 	
 	/**
 	 * Display combox for datasource select list.
 	 */
 	appendDatasourceSelectors: function() {
 		if (this.toolbar) {
 	         this.toolbar.addSeparator();
 	    }

 		if (this.highlightSelector) {
 			this.appendSelector('hilite', 'DrawingControlHighlight', this.getLocalizedString(this.z_MESSAGE_HIGHLIGHTS)+":", this.highlightDataSource);
            if (this.showLegendOverlay) {
                this.appendLegendButton(this.legendPanel, false);
            }
        }
 		
 		if(this.bordersHighlightSelector){
 			//borders highlight datasource select list
 			this.appendSelector('IBorders', 'DrawingControlHighlight', this.getLocalizedString(this.z_MESSAGE_BORDERS), '');
            if (this.showLegendOverlay) {
                this.appendLegendButton(this.borderHighlightLegendPanel, true);
            }
        }

         if (this.labelSelector) {
 			this.appendSelector('labels', 'DrawingControlLabels', this.getLocalizedString(this.z_MESSAGE_LABELS) + ":", this.labelsDataSource);
        }
 		
 		if(this.highlightFilterSelector){
 			//filter datasource select list
 			this.appendSelector('IFilter', 'DrawingControlHighlight', this.getLocalizedString(this.z_MESSAGE_FILTER), '');
 		}
 		
     },

    /**
     * Creates an icon button that displays specified legend panel as an overlay.
     * @param legendPanelId The legend panel ID.
     */
    appendLegendButton: function(legendPanelId, isBorderHighlight) {
        var titleNode = document.getElementById(this.id + '_title');
        if (titleNode === null){
            return;
        }

        var drawingPanel = this;

        this.addAction({
            id: 'legendButton_' + legendPanelId,
            icon: '/schema/ab-core/graphics/icons/legend.png',
            tooltip: drawingPanel.getLocalizedString(drawingPanel.z_MESSAGE_TOOLTIP_LEGEND),
            listener: function() {
                var legendPanel = View.panels.get(legendPanelId);
                if (legendPanel) {
                    legendPanel.showInWindow({
                        anchor: this.el.dom,
                        width: 300,
                        title: isBorderHighlight ?
                            drawingPanel.getLocalizedString(drawingPanel.z_MESSAGE_BORDER_HIGHLIGHTS) :
                            drawingPanel.getLocalizedString(drawingPanel.z_MESSAGE_ROOM_HIGHLIGHTS)
                    });
                    if(isBorderHighlight){
                    	 drawingPanel.refreshBorderHighlightLegendPanel();
                    }else{
                    	drawingPanel.refreshLegendPanel();
                    }
                }
            },
            separator: false
        });
    },

     /**
      * Called by appendDatasourceSelectors().
      */
 	appendSelector: function(comboId, dsFilter, prompt, defaultVal) {
		var titleNode = document.getElementById(this.id + '_title');
		if (titleNode === null){
			return;
		}

		var datasources = this.getSelectorDatasources(dsFilter);
		
		if(comboId.lastIndexOf('IBorders') >= 0){
			var ds = this.getSelectorDatasources(dsFilter, 'IBorder');
			if(ds.names.length > 0){
				datasources = ds;
			}
		}else if(comboId.lastIndexOf('IFilter') >= 0){
			var ds = this.getSelectorDatasources(dsFilter, 'IFilter');
			if(ds.names.length > 0){
				datasources = ds;
			}
		}


		var names = datasources.names;
		var nameIdMap = datasources.IDs;

		// If there are 0 or 1 records, there is no need to display the combo
		if (names.length < 2){
			return;
		}

		var pn = titleNode.parentNode.parentNode;
		var cell = Ext.DomHelper.append(pn, {tag: 'td'});
		var tn = Ext.DomHelper.append(cell, '<p>' + prompt + '</p>', true);
		Ext.DomHelper.applyStyles(tn, "x-btn-text");
		cell = Ext.DomHelper.append(pn, {tag: 'td'});
		var combo = Ext.DomHelper.append(cell, {tag: 'select', id: 'selector_' + comboId}, true);
		
		//names.sort();	// sort the entries
		names[names.length] = this.noneTxt;	// always include at the end of the list
		nameIdMap[this.noneTxt] = this.noneTxt;
    
		for (var i = 0; i < names.length; i++) {
			combo.dom.options[i] = new Option(names[i], nameIdMap[names[i]]);
		}
     
		combo.on('change', this.changeDS, this, {
			delay: 100,
			single: false
		}); 	
		
		if (defaultVal === ''){
			defaultVal = this.noneTxt;
		}
			
    	
		combo.dom.value = defaultVal;
 	},
 	
 	/**
 	 * getSelectorDatasources.
 	 */
 	getSelectorDatasources: function(dsFilter, nameFilter){
 		var results = {};
 		results.names = [];
 		results.IDs = {};
 		var dataSources = View.dataSources;
 		for (var i = 0; i < dataSources.length; i++) {
			var ds = dataSources.items[i];
			if (ds.type != dsFilter){
				continue;
			}
			var name = (ds.title == undefined) ? ds.id : ds.title;
			
			if(valueExistsNotEmpty(nameFilter)){
				if((nameFilter==='IFilter' &&  ds.id.indexOf('iFilter') >= 0 )
						||( nameFilter==='IBorder' &&  ds.id.indexOf('iBorder') >= 0)){
					results.names[results.names.length] = name;
					results.IDs[name] = ds.id;
				}
			}else{
				if(ds.id.indexOf('iFilter') >= 0 || ds.id.indexOf('iBorder') >= 0){
					continue;
				}
				results.names[results.names.length] = name;
				results.IDs[name] = ds.id;
			}
		
 		}
 		return results;
 	},
 	
 	/**
 	 * TODO: rename changeDS.
 	 */
 	changeDS: function(e, combo) {
 		var tmp = combo.value;
 		var type = '';
		if (combo.id.lastIndexOf('hilite') >= 0) {
			if (tmp === this.currentHighlightDS){
				return;
			}
				
	    	this.currentHighlightDS = tmp;
	    	type = 'highlight';
	    }else if(combo.id.lastIndexOf('IBorders') >= 0){
	    	if (tmp === this.currentBordersHighlightDS){
				return;
			}
			//set currentBordersHighlightDS
	    	this.currentBordersHighlightDS = tmp;
	    	type = 'bordersHighlight';
	    }else if (combo.id.lastIndexOf('labels') >= 0) {
	    	if (tmp === this.currentLabelsDS){
	    		return;
	    	}
	    		
	    	this.currentLabelsDS = tmp;
	    	type = 'labels'
	    }else if(combo.id.lastIndexOf('IFilter') >= 0){
	    	if(tmp === this.currentHighlightFilterDS){
	    		return;
	    	}
	    	
	    	this.currentHighlightFilterDS = tmp;
	    	this.doFilterRestriction();	
	    }else{
	    	return;
	    }
	    	
	    	
	    this.onSelectedDatasourceChanged(type);
	    
	    this.applyDS(type);
	    
	    //XXX: allow apps to do actions over refreshed drawing
	    var listener = this.getEventListener('afterSelectedDataSourceChange');
	    if (listener) {
	    	listener(this, type);
	    }
 	},
 	
 	 /**
     * Sets the highlight or labels data source and updates the data source selector.
     * @param type
     * @param dataSourceId
     */
    setDataSource: function(type, dataSourceId) {
        if (type === 'highlight') {
            this.currentHighlightDS = dataSourceId;
            this.applyDS('highlight');
            document.getElementById('selector_hilite').value = dataSourceId;

        } else if (type === 'labels') {
            this.currentLabelsDS = dataSourceId;
            this.applyDS('labels');
            document.getElementById('selector_labels').value = dataSourceId;
        }
    },
    
    /**
     * Changes dataSource selector value without triggering any operation.
     */
    changeDataSourceSelector: function(type, dataSourceId){
    	  if (type === 'highlight') {
              document.getElementById('selector_hilite').value = dataSourceId;
          } else if (type === 'labels') {
              document.getElementById('selector_labels').value = dataSourceId;
          }
    },
 	
 	//When user selects highlight dataSource from comblist, apply the change into drawing
 	applyDS: function(type, roomHighlightDS, bodersHighlightDS) {
 		try{
 		if (valueExists(roomHighlightDS))
 			this.currentHighlightDS = roomHighlightDS;
 		
 		if (valueExists(bodersHighlightDS))
 			this.bodersHighlightDS = bodersHighlightDS;
 		
		if (type === 'highlight'){
			this.clearLegendPanel();
			this.doHighlight(this.currentHighlightDS, this.currentBordersHighlightDS);
			this.refreshLegendPanel();
		}else if(type ===  'bordersHighlight'){
			this.clearBorderHighlightLegendPanel();
			this.doHighlight(this.currentHighlightDS, this.currentBordersHighlightDS);
			this.refreshBorderHighlightLegendPanel();
		}else{
			FABridge.abDrawing.root().applyDS(type);	
		}
 		}catch(e){
 			//XXX: ignore Flash timing error
 		}
			
 		this.onDatasourceChanged(type);
	},
	
	/**
	 * Does rooms and/or borders highlight according to specified datasources.
	 * if roomHighlightDS=null, just do borders highlight;
	 * if bodersHighlightDS=null, just do rooms highlight;
	 */
	doHighlight: function(roomHighlightDS, bodersHighlightDS){
		FABridge.abDrawing.root().applyDS('highlight', roomHighlightDS, bodersHighlightDS);	
	},
	
	/**
	 * doFilterRestriction
	 */
	doFilterRestriction: function(){
		this.clearLegendPanel();
		this.clearBorderHighlightLegendPanel();
		this.doHighlight(this.currentHighlightDS, this.currentBordersHighlightDS);
		this.refreshLegendPanel();
		this.refreshBorderHighlightLegendPanel();
	},
	
	/**
	 * getFilterRestriction
	 */
	getFilterRestriction: function (datasource, records){
		var result = [];
		if(datasource !== null){
			if(records.length > 0){
				var fieldDefs = [];
				datasource.fieldDefs.each(function (fieldDef) {
					 if (fieldDef.primaryKey) {
						 fieldDefs.push(fieldDef);
					 }
	        	});
				var restriction = new Ab.view.Restriction();
				for (var i = 0; i < records.length; i++) {
					for (var j = 0, pkField; pkField = fieldDefs[j]; j++) {
						   var pkValue = records[i].getValue(pkField.fullName);
						   if(j === 0){
							   restriction.addClause(pkField.fullName, pkValue, '=', ')OR(');
						   }else {
							   restriction.addClause(pkField.fullName, pkValue, '=', 'AND');
						   }
					}
				}
				result.push(restriction);
			}
		}
		return result;
	},
	
	/**
	 * setHighlightRestriction
	 */
	setHighlightRestriction: function(highlightRestriction){
		this.currentHighlightRestriction = highlightRestriction;
	},
	
	/**
	 * applyHighlightRestriction.
	 */
	applyHighlightRestriction: function(highlightRestriction){
		this.setHighlightRestriction( highlightRestriction);
		this.doHighlight(this.currentHighlightDS, this.currentBordersHighlightDS);
	},
	
	/**
	 * Enables Flash Asset Panel.
	 * @param {assetType}: required, a string like 'em'.
	 * @param {title}: required,a string.
	 * @param {datasourceName}: required, a string.
	 * @param {configOptions}: optional, Object: 
	 * 		  {actions:[{title:'...', icon: '...', handler:...}, ...], 
	 * 			filter:true|false, closable:true|false, collapsible: true|false,
	 * 		    size:{width:600, height:300},
	 * 		    font:{fontFamily:'Arial', fontSize:'11'}, selectionColor:'#FFEAC6'}
	 */
	enableAssetPanel: function(assetType, title, datasourceName, configOptions){
		var actions = []
		if(valueExists(configOptions)){
			if(valueExists(configOptions.actions)){
				for(var i=0; i<configOptions.actions.length; i++){
					var action = configOptions.actions[i];
					var actionID = (assetType + action.title).replace(/\s/g, "");
					this.addEventListener(actionID, action.handler);
					var newAction = {title:action.title, actionID:actionID};
					if(action.icon){
						newAction.icon = action.icon;
					}
					actions.push(newAction);
				}
				configOptions.actions = actions;
			}
		}
	
		FABridge.abDrawing.root().enableAssetPanel(assetType, title, datasourceName, configOptions);
	},

	/**
	 * Called by Actionscript when asset panel title bar action is clicked.
	 */
	onAssetPaneltitleBarAction: function(actionID, dataSourceName){
		 this.processInstruction(this.id, actionID);
		 var listener = this.getEventListener(actionID);
	     if (listener != null){
	        listener(dataSourceName);
	     }
	},
	
	/**
	 * addAssetPanelRowAction to flash asset panel.
	 *  @param {actionConfig}: required, Object.
	 *  its type, title, and callBack are required.
	 */
	addAssetPanelRowAction:function(actionConfig){
		 var actionID = (actionConfig.type + actionConfig.title).replace(/\s/g, "");
		 this.addEventListener(actionID, actionConfig.handler);
		 actionConfig.actionID = actionID;
		FABridge.abDrawing.root().addAssetPanelRowAction(actionConfig);
	},
	/**
	 *  addAssetPanelRowActions to flash asset panel.
	 *  @param {actionConfigs}: required, Array.
	 */
	addAssetPanelRowActions:function(actionConfigs){
		for(var i=0; i<actionConfigs.length; i++){
			this.addAssetPanelRowAction(actionConfigs[i]);
		}
	},
	/**
	 * Called by Actionscript when asset panel record row action is clicked.
	 */
	onAssetPanelRowAction: function(actionID, record, dataSourceName){
		 this.processInstruction(this.id, actionID);
		 var listener = this.getEventListener(actionID);
	     if (listener != null){
	        listener(record, dataSourceName);
	     }
	},
	
	/**
	 * Refreshs Asset Panel.
	 * 
	 * @param {assetType}: required, a string.
	 * @param {restriction}: optional, Ab.view.Restriction.
	 */
	refreshAssetPanel: function(assetType, restriction){
		FABridge.abDrawing.root().refreshAssetPanel(assetType, restriction);
	},
	
	/**
	 * closeAssetPanel.
	 */
	closeAssetPanel: function(assetType){
		FABridge.abDrawing.root().closeAssetPanel(assetType);
	},
	
	/**
	 * showAssetPanel.
	 */
	showAssetPanel: function(assetType){
		FABridge.abDrawing.root().showAssetPanel(assetType);
	},
	
	/**
	 * onAssetLocationChangeHanlder for drag-n-drop event.
	 */
	onAssetLocationChangeHanlder: function(record, type, dwgname){
		this.processInstruction(this.id, "onAssetLocationChange");
	    var listener = this.getEventListener('onAssetLocationChange');
	    if (listener != null){
	        return listener(record, type, dwgname);
	    }
	},
	
	/**
	 * Un-selects specified selected assets.
	 * The highlight patterns of those specified assets will be restored to their previous status.
	  * @param ids:	Array of array like [['HQ','18','105'], ['HQ','18','106']].
	 */
	unselectAssets: function(ids){
		FABridge.abDrawing.root().unselectAssets(ids);
	},
	/**
	 *  Selects specified selectable assets.
	 *  The highlight patterns of those specified assets will be restored to their previous status.
	  * @param ids:	Array of array like [['HQ','18','105'], ['HQ','18','106']].
	 */
	selectAssets: function(ids){
		FABridge.abDrawing.root().selectAssets(ids);
	},
	
	/**
	  * addContextMenuAction.
	  * 
	  * @param title
	  * @param callBackFunctionName
	  */
	 
	 addContextMenuAction: function(title, callBackFunction){
		 var actionID = title.replace(/\s/g, "");
		 this.addEventListener(actionID, callBackFunction);
		 FABridge.abDrawing.root().addContextMenuAction(title, actionID);
	 },
	 /**
	  * Called by Actionscript when per-room-based context menu is clicked.
	 */
	 onContextMenuAction: function(actionID, record){
		 this.processInstruction(this.id, actionID);
		 var listener = this.getEventListener(actionID);
	     if (listener != null){
	        listener(record);
	     }
	 },
	
	/*
	setDataSources: function(datasources){
		if(valueExistsNotEmpty(datasources)){
			if(valueExistsNotEmpty(datasources.highlight)){
				this.currentHighlightDS = datasources.highlight;
			}
			if(valueExistsNotEmpty(datasources.border)){
				this.currentBordersHighlightDS = datasources.border;
			}
			if(valueExistsNotEmpty(datasources.filter)){
				this.currentHighlightFilterDS = datasources.filter;
			}
			if(valueExistsNotEmpty(datasources.label)){
				this.currentLabelsDS = datasources.label;
			}
		}
	},*/
 	
	/**
	 * Refresh specified legend gird panel.
	 */
	_refreshLegendPanel: function(legendPanel, dataSourceName) {
        if (this.showLegendOverlay && !legendPanel.isShownInWindow()) {
            return;
        }

		legendPanel.show(true);
		legendPanel.clear();

		var i = 0;
 		var items = null;
 		var map = new Object();
 		var ruleSet = null;
 			
 		// If there is a ruleset, use it to define the legend
  		if (this.ruleSets != null) {
 			ruleSet = this.ruleSets[dataSourceName];
 			if (!valueExists(ruleSet)) {
 				ruleSet = null;
 			}
 		} 
 		
 		if (ruleSet == null) {
 			items = FABridge.abDrawing.root().getAppliedValueColorList(dataSourceName);

 			if (!valueExists(items)){
 				return;
 			}
 		}
 			
 		if (this.legendCtrlInit == false) {
 			legendPanel.sortEnabled = false;
  			// the color cell size is set in ab-grid.js
			// grid.columns[0].width="7";	// Reasonable size for the color column
 			this.legendCtrlInit = true;
 		}
 
 	
		for (i = 0; i < legendPanel.gridRows.length; i++){
			legendPanel.removeGridRow(0);
		}
			
		legendPanel.update();
		
		// create list to sort on
		var val = null;
		var rec = null;
		var item = null;
		var ar = new Array();
		
		//legendPanel.setColorOpacity(this.getFillOpacity() * 0.8);
				
		if (ruleSet == null) {
 			for (i = 0; i < items.length; i++) {
 				val = items[i].value;
				ar[ar.length] = val;
				map[val] = i;
			}
		
			ar.sort();
 			for (i = 0; i < ar.length; i++) {
 				val = ar[i];
 				item = items[map[val]];
				this.appendGridRow(legendPanel, item.color, val);	
 			}
 		} else {	// from rules
 			if (ruleSet.isRange) {
 				for (i = 0; i < ruleSet.rules.length; i++) {
 					item = ruleSet.rules[i];
					this.appendGridRow(legendPanel, "0x" + item.color, item.getLabelOper() + " " + item.getLabel());
				}	
 			} else {
 				items = ruleSet.getNonRangeItems();
 				for (i = 0; i < items.length; i++) {
 					item = items[i];
					this.appendGridRow(legendPanel, "0x" + item.color, item.val);
 				}
 			}
 			
 			// Append the 'default'
 			item = ruleSet.defaultRule;
 			if (valueExists(item)) {
 				val = (ruleSet.isRange) ? (item.getLabelOper() + " ") : "";
 				this.appendGridRow(legendPanel, "0x" + item.color, val + item.getLabel());
			}
 		}
 		
		legendPanel.update();
	},
	
	/**
	 * refreshBorderHighlightLegendPanel.
	 */
	refreshBorderHighlightLegendPanel: function(){
		if (!valueExistsNotEmpty(this.borderHighlightLegendPanel)){
 			return;
 		}
			
 		var grid = View.getControl("", this.borderHighlightLegendPanel);
 		if (!valueExists(grid)){
 			return;
 		}
 		if(!valueExistsNotEmpty(this.currentBordersHighlightDS)){
 			this.currentBordersHighlightDS = "None";
 		}
 		this._refreshLegendPanel(grid, this.currentBordersHighlightDS);
 		
	},
	
	/**
	 * clearBorderHighlightLegendPanel.
	 */
	clearBorderHighlightLegendPanel: function() {
		if (!valueExistsNotEmpty(this.borderHighlightLegendPanel)){
 			return;
 		}
			
 		var grid = View.getControl("", this.borderHighlightLegendPanel);
 		if (!valueExists(grid)){
 			return;
 		}
 			
 			
 		grid.clear();	
	},
	
	/**
	 * clearLegendPanel.
	 */
	clearLegendPanel: function() {
		if (!valueExistsNotEmpty(this.legendPanel)){
 			return;
 		}
			
 		var grid = View.getControl("", this.legendPanel);
 		if (!valueExists(grid)){
 			return;
 		}
 			
 		grid.clear();	
	},
	
	/**
	 * refreshLegendPanel.
	 */
 	refreshLegendPanel: function() {
 		if (!valueExistsNotEmpty(this.legendPanel)){
 			return;
 		}
			
 		var grid = View.getControl("", this.legendPanel);
 		if (!valueExists(grid)){
 			return;
 		}

 		this._refreshLegendPanel(grid, this.currentHighlightDS);

        if (this.showLegendOverlay && grid.isShownInWindow()) {
            grid.updateWindowHeight();
        }
 	},
 	
 	/**
 	 * 
 	 * Adds specified labels without going through label dataSource.
 	 * 
 	 * (Notice: setLabels() can also be used to show labels, but it requires drawing name, and cannot pass record which is necessary to drag the labels).
 	 * @param labels - Array. It looks like  [{field:'em.em_id', 
 	 * 											record:{'em.em_id':'DAMON, BEN','bl_id':'HQ', 'fl_id':'18', 'rm_id':'114'}
 	 * 										   }]
 	 * its field and record are required, and record must contain label field value and room location ino.
 	 */
 	addLabels: function(labels){
 		FABridge.abDrawing.root().addLabels(labels);
 	},
 	
 	/**
 	 * Removes specified labels if they do exist in drawing control.
 	 * 
 	 * @param labels - Array. It looks like [{field:'em.em_id', 
 	 * 											record:{'em.em_id':'DAMON, BEN','bl_id':'HQ', 'fl_id':'18', 'rm_id':'114'}
 	 * 										   }]
 	 * its field and record are required, and record must contain label field value and room location ino.
 	 */
 	removeLabels: function(labels){
 		FABridge.abDrawing.root().removeLabels(labels);
 	},
 	
 	
 	setToolbar: function(oper, option, names) {
 		if (!valueExistsNotEmpty(oper) || !valueExists(option))
 			return;
 		if (!valueExistsNotEmpty(names))
 			names = 'all';
 		FABridge.abDrawing.root().toolbar(oper, option, names);
 	},
 	
 	appendGridRow: function(grid, color, val) {
		var rec = new Ab.data.Record({
					'legend.color': '0x' + gAcadColorMgr.formatColor(color, true),
					'legend.value':  val
		}); 
		grid.addGridRow(rec);	
 	},
 	
 	// utility methods
 	getPkFieldNames: function (ds) {
 		var loc = new Ab.drawing.DwgCtrlLoc();
		if (!valueExists(ds))
	 		return loc;
	 		
	 	// only primary keys that have field name containing bl_id, fl_id, or rm_id will be returned
	 	for (var i = 0; i < ds.fieldDefs.length; i++) {
	 		var id = ds.fieldDefs.items[i].id;
	 		if (id.indexOf('.bl_id') > 0)
	 			loc.pks[0] = id;
	 		else if (id.indexOf('.fl_id') > 0)
	 			loc.pks[1] = id;
	 		else if (id.indexOf('.rm_id') > 0)
	 			loc.pks[2] = id;
	 	}
	 	return loc;
	 },
	 
	 processInstruction: function(ctrlId, eventName, msg2) {
	 	if (!valueExists(this.instructs))
	 		return;
	 	
	 	var instruct = this.instructs[ctrlId+eventName];
	 	if (!valueExists(instruct))
	 	{		
	 		// check for the default message to display
	 		instruct = this.instructs["default"];
	 		if (!valueExists(instruct))
	 			return;
	 	} else if (instruct.dwgLoaded && !this.dwgLoaded) {
	 		return;
	 }

	 	var msg = instruct.msg;
	 		
	 	if (valueExistsNotEmpty(msg)) {
	 		if (valueExistsNotEmpty(msg2))
	 			msg = msg.replace(/%s/, msg2);
			this.setTitleMsg(msg);
		}
			
		//if (instruct.disable)
			//View.getControl('', instruct.ctrlId).disable();
	 },
	 
	 getFillOpacity : function() {
		 if(this.dwgConfig){
				return this.dwgConfig.highlights.assigned.fill.opacity * 0.8;
		 }else{
			 //XXX: ???
			return 0.5;
		 }
	 },
	 
	 
	 setMinimumLabelTextSize : function(textSize) {
	 	FABridge.abDrawing.root().setMinimumLabelTextSize(textSize);
	 },
	 
	 setIdealLabelTextSize : function(textSize) {
	 	FABridge.abDrawing.root().setIdealLabelTextSize(textSize);
	 },
	 
	 setShrinkLabelTextToFit : function(val) {
	 	FABridge.abDrawing.root().setShrinkLabelTextToFit(val);
	 },

	 setRightClickMenu: function(contents) {
	     FABridge.abDrawing.root().setRightClickMenu(contents);
	 },
	 
	 /**
	 	 * Retreives the hatch patterns from WEB-INF\config\context\controls\drawing\hpattern.properties file.
	 	 * kb# 3036164
	 	 */
	 	getHatchPatterns: function() {
	 		try {
	            var result = Workflow.call('AbCommonResources-HighlightPatternService-getHatchPatterns');
	            if(result && result.jsonExpression)
	            	return result.jsonExpression;
	            else
	            	return "";
	        } 
	        catch (e) {
	            Workflow.handleError(e);
	        }
	 	},
	 	
	 /**
	  * Gets drawing's position from zooming in.
	  */
	 	getDrawingZoomInfo: function(){
		 return FABridge.abDrawing.root().getDrawingZoomInfo();
	 },

	 /**
	  * Enables redlining in the drawing control
	  */
	 enableRedmarks: function() {
	 	if (this.initialized) {
	 		FABridge.abDrawing.root().enableRedmarks();
	 		this.redmarksEnabled=true;
	 	} 
	 },
	 
	 /**
	  * Disables redlining in the drawing control
	  */
	 disableRedmarks: function() {
	 	if (this.initialized) {
	 		FABridge.abDrawing.root().disableRedmarks();
	 		this.redmarksEnabled=false;
	 	} 
	 },
	 
	 /**
	  * Gets JSONObject with redlines information from the drawing control
	  */
	 getRedMarks : function(){
	 	return FABridge.abDrawing.root().getRedmarks();
	 },
	 
	 /**
	  * Saves redmarks as drawing attached to a service request.
	  * 
	  * @param activityLogId service request id
	  */
	 saveRedmarksForServiceRequest: function(activityLogId){
		 var visible = FABridge.abDrawing.root().checkAllRedmarksVisible();
		 if(visible || (!visible && confirm(View.getLocalizedString(this.z_MESSAGE_PROMPT_LEAVEREDMARKSINVISIBLE)))){
			var redMarks = FABridge.abDrawing.root().getRedmarks();
		 	if(valueExistsNotEmpty(this.currentHighlightDS)){
		 		redMarks.highlightds = this.currentHighlightDS;
		 		var highlightDS = View.dataSources.get(this.currentHighlightDS);
		 		if(valueExistsNotEmpty(highlightDS)){
		 			var hlDSview = highlightDS.viewName+".axvw";
			 		redMarks.highlightds_view_name = hlDSview;
		 		}		 		
		 	}
		 	if(valueExistsNotEmpty(this.currentLabelsDS)){
		 		redMarks.labelds = this.currentLabelsDS;
		 		var labelDS = View.dataSources.get(this.currentLabelsDS);
		 		if(valueExistsNotEmpty(labelDS)){
		 			var labelDSView = labelDS.viewName+".axvw";
			 		redMarks.labelds_view_name = labelDSView;
		 		}
		 	}
		 	try {
	            var result = Workflow.callMethod('AbCommonResources-DrawingService-saveRedMarksForServiceRequest', redMarks,parseInt(activityLogId),this.getImageBytes(),"");
	            return true;
	        } 
	        catch (e) {
	            Workflow.handleError(e);
	        }
		 }
		 return false;
	 },
	 
	 /**
	  * Prepares redmarks record + image to be attached to service request.
	  * @param viewName view in which redmarks were created
	  */
	 saveRedmarksAsServiceRequest: function(viewName){
		 var visible = FABridge.abDrawing.root().checkAllRedmarksVisible();
		 if(visible || (!visible && confirm(View.getLocalizedString(this.z_MESSAGE_PROMPT_LEAVEREDMARKSINVISIBLE)))){
			var redMarks = FABridge.abDrawing.root().getRedmarks();
		 	if(valueExistsNotEmpty(this.currentHighlightDS)){
		 		redMarks.highlightds = this.currentHighlightDS;
		 		var highlightDS = View.dataSources.get(this.currentHighlightDS);
		 		if(valueExistsNotEmpty(highlightDS)){
		 			var hlDSview = highlightDS.viewName+".axvw";
		 			redMarks.highlightds_view_name = hlDSview;
		 		}
		 	}
		 	if(valueExistsNotEmpty(this.currentLabelsDS)){
		 		redMarks.labelds = this.currentLabelsDS;
		 		var labelDS = View.dataSources.get(this.currentLabelsDS);
		 		if(valueExistsNotEmpty(labelDS)){
		 			var labelDSView = labelDS.viewName+".axvw";
		 			redMarks.labelds_view_name = labelDSView;
		 		}
		 	}
		 	try {
	            var result = Workflow.callMethod('AbCommonResources-DrawingService-prepareRedmarksForServiceRequest', redMarks,this.getImageBytes(),viewName);
	            if(result.code == 'executed'){
	            	return result.data;
	            } else {
	            	Workflow.handleError(result);
	            }
	        } 
	        catch (e) {
	            Workflow.handleError(e);
	        }
		 }
		 return 0;
	 },
	 
	 /**
	  * saves redmarks drawn in the drawing control
	  */
	 saveRedmarks: function(){
		var visible = FABridge.abDrawing.root().checkAllRedmarksVisible();
		if(visible || (!visible && confirm(View.getLocalizedString(this.z_MESSAGE_PROMPT_LEAVEREDMARKSINVISIBLE)))){
			var redMarks = FABridge.abDrawing.root().getRedmarks();
		 	if(valueExistsNotEmpty(this.currentHighlightDS)){
		 		redMarks.highlightds = this.currentHighlightDS;
		 		var highlightDS = View.dataSources.get(this.currentHighlightDS);
		 		var hlDSview = highlightDS.viewName+".axvw";
		 		redMarks.highlightds_view_name = hlDSview;
		 	}
		 	if(valueExistsNotEmpty(this.currentLabelsDS)){
		 		redMarks.labelds = this.currentLabelsDS;
		 		var labelDS = View.dataSources.get(this.currentLabelsDS);
		 		var labelDSView = labelDS.viewName+".axvw";
		 		redMarks.labelds_view_name = labelDSView;
		 	}
		 	try {
	            var result = Workflow.callMethod('AbCommonResources-DrawingService-saveRedMarks', redMarks);
	        } 
	        catch (e) {
	            Workflow.handleError(e);
	        }
		}
	 	
	 },
	 /**
	  * Draws redmarks in drawing control
	  */
	 drawRedmarks: function(opts){
	 	FABridge.abDrawing.root().drawRedmarks(opts);
	 	this.processInstruction("onredlinesload", "");
	 },
	 /**
	  * Removes all redmarks in the drawing control
	  */
	 clearRedmarks: function(){
	 	FABridge.abDrawing.root().clearRedmarks();
	 }
});


DwgFill = Base.extend ({
    key: null,	// value that this fill is associated with.  e.g.  vacant, workstation, etc.
	fc: undefined,		// the fill color.  if not specified, app defaults will be applied
	fo: undefined,	// the fill opacity.  number in range 0.0 to 1.0
	bc: undefined,		// the boundary color.  if not specifid, app defaults will be applied
	bo: undefined,	// the boundary opacity.  number in range 0.0 to 1.0
	bt: undefined,
	
	constructor: function(key, fc, fo, bc, bo, bt) {
		if (key != undefined)
			this.key = key;
			
		if (fc != undefined)
			this.fc = fc;
	},
	
	set: function(ob) {
		// tbd
	}
	
});
							
							
DwgLabel = Base.extend ({
	font: "Arial",
	color: 0x000000,
	textHeight: 12,
	justification: "center",
	bold: false,
	italic: false,
	underline: false,
	field: '',
	value: '',
	
	constructor: function(field, val, ht, color, just, font, bold, italic, underline) {
		if (!valueExistsNotEmpty(field) || !valueExistsNotEmpty(val))
			return;
			
		this.field = field;
		this.value = val;
		if (valueExists(ht))
			this.textHeight = ht;
		if (valueExists(color))
			this.color = color;
		if (valueExistsNotEmpty(just))
			this.justification = just;
		if (valueExists(bold))
			this.bold = bold;
		if (valueExists(italic))
			this.italic = italic;
		if (valueExists(underline))
			this.underline = underline;
	}
	
});


DwgRec = Base.extend({
	id: null,	// required: id of the asset
	f: null,	// optional: unique fill to apply to this asset
	l: null,	// optional: array of DwgLabel objects to apply to this asset
	v: null,	// optional: value to link this asset with a related external fill
	
	constructor: function(id, fill, labels) {
		if (id == undefined)
			return;
			
		this.id = id;
		if (valueExists(fill))
			this.f = fill;
			
		if (valueExists(labels))
			this.l = labels;
	}

});


//Fix for no MouseWheel in a Flex app when wmode="opaque" (it actually works in IE, just not Firefox or Chrome, probably not Safari or Opera either). 
//This also fixes the different MouseWheel scroller rates between Firefox and everything else.
function handleWheel(event) {
    var app = document.getElementById(dwgControlId);
    

	// only invoke mouse wheel when the mouse is over the drawing control
    if(event.rangeParent && event.target.id == dwgControlId){
	    var edelta = (navigator.userAgent.indexOf('Firefox') !=-1) ? -event.detail : event.wheelDelta/40;                                   
	    var o = {x: event.screenX, y: event.screenY, 
	        delta: edelta,
	        ctrlKey: event.ctrlKey, altKey: event.altKey, 
	        shiftKey: event.shiftKey}
	
	    app.handleWheel(o);
    }
}

DwgOpts = Base.extend({
	ver: 1.0,				// version of this DwgOpts object
	folder: '',				// folder to load drawings from
	dwgName: null,			// name of drawing file containing included records, array of field/ids
	rawDwgName: '',         // actual name of a drawing file to load, not the pkeys that define it
	assetTypes: '',			// optional: list of asset file types to load, comma delimited strings
	zoomToId: false,		// zoom in to the specified highlightId, default is false
	multiple: true,			// controls whether or not more than 1 drawing can be loaded at a time
	exclusive: false,		// only the specified highlightId will be highlighted, any others will be unhighlighted
	highlightId: undefined,	// an asset id to be highlighted
	forceload: true,		// force the load of a drawing if needed
	fill: undefined,		// fill settings that override the mode setting
	mode: undefined,		// assigned, unassigned, selected, unselected, none, or empty string
	selectionMode: '2',				// allows onclick events to modify the graphics
	assignMode:	'0',				// determines how the Flash control should respond to onclick events
	multipleSelectionEnabled: true,	// allow more than one asset to be selected
	recs: undefined,		// array of DrawingRec objects
	persistRecFills: true,	// if highlightAssets called with this set true, these will override datasource changes
	backgroundSuffix: '',   // optional suffix to be applied to the drawing name for loading different backgrounds
	assetSuffix: '',        // optional suffix to be applied to the asset file name to load
	primaryKeyFieldsHighlights: null, // optional, array of field names to supercede DataSource primary keys
	primaryKeyFieldsLabels: null, // optional, array of field names to supercede DataSource primary keys
	
	constructor: function (opts) {
		var ja = jsAccessFromFlex;
		this.selectionMode = ja.selectionMode;
		this.assignMode = ja.assignMode;
		this.multipleSelectionEnabled = ja.multipleSelectionEnabled;
		if (opts != null && opts != undefined)
			this.copy(opts);	
		this.folder = View.project.enterpriseGraphicsFolder;
	},
	
	copy: function(opts) {
		if (opts == null || opts == undefined)
			return;
		if (valueExists(opts.folder))
			this.folder = opts.folder;
		if (valueExists(opts.dwgName))
			this.dwgName = opts.dwgName;
		if (valueExists(opts.rawDwgName))
		    this.rawDwgName = opts.rawDwgName;
		if (valueExists(opts.highlightId))
			this.highlightId = opts.highlightId;
		if (valueExists(opts.assetTypes))
			this.assetTypes = opts.assetTypes;
		if (valueExists(opts.zoomToId))
			this.zoomToId = opts.zoomToId;
		if (valueExists(opts.forceload))
			this.forceload = opts.forceload;
		if (valueExists(opts.exclusive))
			this.exclusive = opts.exclusive;
		if (valueExists(opts.multiple))
			this.multiple = opts.multiple;
		if (valueExists(opts.fill))
			this.fill = opts.fill;	
		if (valueExists(opts.mode))
			this.mode = opts.mode;
		if (valueExists(opts.selectionMode), true)
			this.selectionMode = opts.selectionMode;
		if (valueExists(opts.assignMode), true)
			this.assignMode = opts.assignMode;
		if (valueExists(opts.multipleSelectionEnabled))
			this.multipleSelectionEnabled = opts.multipleSelectionEnabled;
		if (valueExists(opts.recs))
			this.recs = opts.recs;
		if (valueExists(opts.persistRecFills))
			this.persistRecFills = opts.persistRecFills;
		if (valueExists(opts.backgroundSuffix))
			this.backgroundSuffix = opts.backgroundSuffix;
		if (valueExists(opts.assetSuffix))
			this.assetSuffix = opts.assetSuffix;
		if (valueExists(opts.primaryKeyFieldsHighlights))
			this.primaryKeyFieldsHighlights = opts.primaryKeyFieldsHighlights;
		if (valueExists(opts.primaryKeyFieldsLabels))
			this.primaryKeyFieldsLabels = opts.primaryKeyFieldsLabels;
	},
	
	/**
	 * This function defines records for the rm assets etc.
	 * 
	 * id - String. The rm asset's primary key values separated by default delim. i.e. "HQ;11;101"
	 * labels - String. The asset's label values.
	 * asHighlight - boolean. True to pass the asset id into highlightId parameter.
	 * 
	 */
	appendRec: function(id, fill, labels, asHighlight) {

		var ar = id.split(jsAccessFromFlex.getDelim());
		
		if(!valueExistsNotEmpty(this.assetTypes)) {
			var bl_id = (ar != null && ar.length > 0 ? ar[0] : null);
			var fl_id = (ar != null && ar.length > 1 ? ar[1] : null);
		}
		
		this.appendRecNonRm(bl_id, fl_id, id, fill, labels, asHighlight);
	},
	
	/**
	 * Appends the drawing control's record from the row object.
	 * 
	 * row - An Ab.grid.Row object, usually from the grid
	 * id - String. The asset's primary key value.
	 */
	appendRecFromRow: function(row, id){
		var fl_id = '';
 		var bl_id = '';
 		for (var name in row.row.record) {
			if (name.indexOf('.bl_id') >= 0)
				bl_id = row.row.record[name];
			else if (name.indexOf('.fl_id') >= 0)
				fl_id = row.row.record[name];
		}
 		this.appendRecNonRm(bl_id, fl_id, id);
	},
	
	/**
	 * This function defines records for non-room assets, such as eq, jk.
	 * 
	 * bl_id - String. The Building Code which the asset is located. This value is used to compose the drawing name.
	 * fl_id - String. The Floor Code which the asset is located. This value is used to compose the drawing name.
	 * id - String. The asset's primary key value.
	 * labels - String. The asset's label values.
	 * asHighlight - boolean. True to pass the asset id into highlightId parameter.
	 */
	appendRecNonRm: function(bl_id, fl_id, id, fill, labels, asHighlight) {
		if (id == undefined)
			return;
			
		if (this.recs == undefined)
			this.recs = new Array();
			
		if (asHighlight == true)
			this.highlightId = id;
			
		this.recs[this.recs.length] = new DwgRec(id, fill, labels);
		
		// Ensure that the drawing name is included in this package
		// in a form that the flex 'addDrawing' method takes
		if (this.dwgName == null) {
			this.dwgName = new Array();
			if (bl_id != null && fl_id != null) {
				this.dwgName[0] = 'fl.bl_id';
				this.dwgName[1] = bl_id;
				this.dwgName[2] = 'fl.fl_id';
				this.dwgName[3] = fl_id;
			}
		}
	},
	
	setFillColor: function(color) {
		if (this.fill == undefined)
			this.fill = new DwgFill();
		this.fill.fc = color;
	}
	
});


/**
 * Object that defines an command instruction.  Managed by the DrawingControl object
 */
DwgInstruction = Base.extend({
	//name: '',				// the name of this instruction
	ctrlId: '',				// the control id that this is to be executed on
	eventName: 'onclick',	// the event to execute on
	msg: '',				// the message to be displayed for this instruction
	//nextName: true,		// the name of the next instruction that follows this
	dwgLoaded: false,		// disable the specified control when displaying message
	
	constructor: function (ctrlId, eventName, msg, dwgLoaded) {
		this.ctrlId = ctrlId;
		this.eventName = eventName;
		this.msg = msg;
		this.dwgLoaded = dwgLoaded;
	}
});

/**
 * Object that defines a Highlight Rule.  Managed by the DwgHighlightRules object
 */
DwgHighlightRule = Base.extend({
	ver: 1.0,				// version of this DwgHighlightRule object
	fullfield: "",			// the tablename.fieldname
	val: "",				// the value for this rule
	color: "",				// the colot to be associated with this value
	oper: "==",				// the operator to test with
	label: "",				// the display value, will override the val for the legend if specified
	selectable: true,		// wehther or not highlighted objects are selectable or not
	
	constructor: function () {

	},
	
	getLabel: function() {
		return this.label.length ? this.label : this.val;
	},
	
	
	getLabelOper: function() {
		return this.label.length ? "" : this.oper;
	}
});


/**
 * Object for managing highlight specific rules
 */
DwgHighlightRuleSet = Base.extend({
	ver: 1.0,					// version of this DwgHighlightRuleSet object
	ds: "",						// the datasource these rules are associated with
	isRange: false,				// whether or not this rule set is a range of values
	fullfield: "",				// the table.fieldname used for this ruleset
	valColorMap: [],	// simple map of values to colors when not a range
	nonRangeVals: [],	// list of values asssociated with the valColorMap, used for lookup
	rules: [],			// the list of rules that define this rule set
	defaultRule: null,			// specifies the default rule to apply for this set of rules
	
	constructor: function (ds) {
		this.ds = ds;
		this.isRange = false;				
		this.fullfield = "";				
		this.valColorMap =[];	
		this.nonRangeVals = [];	
		this.rules = [];
	},
	
	/**
	 * add a new rule to this rule set
	 * @param fullfield		the tablename.fieldname for this rule
	 * @param val			the value for this rule
	 * @param color			the color to apply for this value
	 * @param oper			Optional, operator to test this value with, valid options are:
	 *							=, <, <=, >, >=, != (the default is '='
	 * @param label			Optional, display value for the legend
	 * @param selectable	Optional, whether or not the asset associated with this is selectable
	 * @param isDefault		Optional, specifies if this is the default rule to apply
	 */
	appendRule: function (fullfield, val, color, oper, label, selectable, isDefault) {
		var dr = new DwgHighlightRule();
		dr.fullfield = fullfield;
		if (oper == "==" || isDefault == true)
			dr.val = val;
		else
			dr.val = parseInt(val, 10);
		dr.color = color;
		if (valueExists(oper))
			dr.oper = oper;
		if (valueExists(label))
			dr.label = label;
		
		this.fullfield = fullfield;
		
		if (isDefault == true) {
			this.defaultRule = dr;
		} else if (oper != "==") {
			this.isRange = true;	

			if (valueExists(selectable))
				dr.selectable = selectable;
		
			if (isDefault == true)
				this.defaultRule = dr;
			else
				this.rules[this.rules.length] = dr;	
		} else {
			var ff = fullfield + "." + val;
			this.valColorMap[ff] = color;
			this.nonRangeVals[this.nonRangeVals.length] = ff;
		}
	},
	
	getColorFromValue: function(fullfield, val) {
		var color = "";
		var b = false;
		var dr = null;
		
		if (this.isRange) {
			val = parseInt(val, 10);
			for (var i = 0; i < this.rules.length && !b; i++) {
				dr = this.rules[i];
				if (dr.oper == "==") {
					b = (val == dr.val);
				} else if (dr.oper == "<") {
					b = (val < dr.val);
				} else if (dr.oper == "<=") { 
					b = (val <= dr.val);
				} else if (dr.oper == ">") {
					b = (val > dr.val);
				} else if (dr.oper == ">=") {
					b = (val = dr.val);
				}
			
				if (b)
					color = dr.color;
			}
		} else {
			color = this.valColorMap[fullfield + "." + val];
			if (valueExists(color))
				b = true;
		}
		
		if (!b && valueExists(this.defaultRule))
			color = this.defaultRule.color;
		
		return color;
	},
	
	getNonRangeItems: function() {
		var items = new Array();
		for (var i = 0; i < this.nonRangeVals.length; i++) {
			var fullval = this.nonRangeVals[i];
			var ar = fullval.split(".");
			var val = ar[ar.length - 1];
			items[i] = { "val": val, "color": this.valColorMap[fullval] };
		}
		return items;
	},
	
	getField: function() {
		return this.fullfield;
	}
});


Ab.drawing.DwgCtrlLoc = Base.extend({
    pks: ['rm.bl_id', 'rm.fl_id', 'rm.rm_id'],
    map: new Object(),
    dwgname: '',
	
	constructor: function (bl_id, fl_id, rm_id, dwgname) {
		this.set(bl_id, fl_id, rm_id, dwgname);
	},
	
	set: function(ob, fl_id, rm_id, dwgname) {
		this.map = new Object();
		if (!valueExists(ob))
			return;
			
		// ob is an Ab.drawing.DwgCtrlLoc object
		if (valueExists(ob.pks)) {							
			this.pks = ob.pks;
			this.map = ob.map;
			this.dwgname = ob.dwgname;
		} else if (valueExists(ob.row)) {		
			// ob is an Ab.grid.Row object
			this.setFromCtrlOb(ob);
		} else if (ob.constructor == Ab.view.Restriction) {	
			// ob is an Ab.view.Restriction object
			this.setFromRestriction(ob);
		} else {											
			// working with raw values
			this.map[this.pks[0]] = ob;
			if (valueExists(fl_id))
				this.map[this.pks[1]] = fl_id;
			if (valueExists(rm_id))
				this.map[this.pks[2]] = rm_id;
			if (valueExists(dwgname))
			    this.dwgname = dwgname;
		}
	},
	
	setFromArray: function(ar) {
		if (!valueExistsNotEmpty(ar))
			return;
		
		//modify to work with non-room assets where pks can be an array of any length
		for (var i = 0; i < this.pks.length; i++) {
			if (valueExistsNotEmpty(ar[i*2])) {
				this.pks[i] = ar[i*2];
				this.map[this.pks[i]] = ar[i*2+1];
			}
		}
	},
	
	/**
 	* Populate this object from Grid Rows
 	*/
 	setFromCtrlOb: function (ob, bMsg) {
		if (!valueExists(ob) || !valueExists(ob.grid) || !valueExists(ob.row))
	 		return null;
	 		
	 	//reset the primary fields
	 	this.pks = new Array();
	 	var pkIndex = 0;
	 	
	 	// only primary keys that have field name containing bl_id, fl_id, or rm_id will be handled
	 	for (var i = 0; i < ob.grid.fieldDefs.length; i++) {
	 		var id = ob.grid.fieldDefs[i].id;
	 		if (ob.grid.fieldDefs[i].primaryKey){
	 			//make sure bl_id, fl_id, rm_id is stored into primary key array in the right order.
	 			if(id.indexOf('.bl_id')>=0)
	 				this.pks[0] = id;
	 			else if(id.indexOf('.fl_id')>=0)
	 				this.pks[1] = id;
	 			else if(id.indexOf('.rm_id')>=0)
	 				this.pks[2] = id;
	 			else
	 				this.pks[pkIndex] = id;
	 			pkIndex++;
	 		}
	 		else if (id.indexOf('.dwgname') > 0)
	 		    this.dwgname = ob[id];
	 		}
	 	
	 	//if the main table is not room, but the asset need to connect with the room, such as employee in a room, use the rm table's pks
	 	if(this.pks.length < 1){
	 		this.pks = ['rm.bl_id', 'rm.fl_id', 'rm.rm_id'];
	 	}
	 	
	 	// Verify that there is an asset (i.e. room) associated with this row
	 	// If not, inform the user that there is no info to display
		for (i = 0; i < this.pks.length; i++){
			var pk = this.pks[i];
			this.map[pk] = ob[pk];
			if (bMsg == true && !valueExistsNotEmpty(this.map[pk])) {
				View.alert(View.getLocalizedString(this.z_MESSAGE_NO_PKEY_FOR_RECORD));
				return;
			}
		}
	 },
	 
	 setFromRestriction: function (res) {
	 	var tmp = res.clauses;

		for (var i = 0; i < tmp.length; i++) {
			var tmp2 = tmp[i];
			this.pks[i] = tmp2.name;
			this.map[tmp2.name] = tmp2.value;
		}
	},
	
	/*
     *  includes the dwgname field value from a tree node, if exists
     *
     * */
	setFromTreeClick: function (ob, panelId) {
        this.setFromRestriction(ob.restriction);
        var panel = View.panels.get(panelId);
        if (valueExists(panel) && valueExists(panel._levels)) {
            var i = panel._levels.length;
            var ds = View.dataSources.get(panel._levels[panel._levels.length - 1].dataSourceId);
            if (valueExists(ds)) {
                // check to see if there is a 'dwgname' field
                var fn = null;
                var keys = ds.fieldDefs.keys;
                for (i = 0; i < keys.length; i++) {
                    var id = keys[i];
                    if (id.indexOf('.dwgname') > 0)
                        fn = id;
                }
        
                if (fn != null) {
                    var node = panel.lastNodeClicked;
                    var dwgname = node.data[fn];
                    if (valueExists(dwgname))
                        this.dwgname = dwgname;
                }
            }
        }
	},
	
	getBuilding: function() {
		var id = this.pks[0];
		if (id!=null && id.indexOf('.bl_id') >= 0) {
			return this.map[id];
		}
		
		return null;
	},
	
	getFloor: function() {
		var id = this.pks[1];
		if (id!=null && id.indexOf('.fl_id') >= 0) {
			return this.map[id];
		}
		
		return null;
	},
	
	getRoom: function() {
		var id = this.pks[2];
		if (id!=null && id.indexOf('.rm_id') >= 0) {
			return this.map[this.pks[i]];
		}
		
		return null;
	},
	
	getPkValueString: function() {
		var s = '';
		var d = jsAccessFromFlex.getDelim();
		
		for(var i=0; i <this.pks.length; i++){
			if(s.length > 0)
				s += d;
			
			if (valueExistsNotEmpty(this.map[this.pks[i]]))
				s += this.map[this.pks[i]];
		}
		return s;
	},
	
	getDwgname:function() {
		return this.dwgname;
	},
	
	containsFloor: function() {
		return (valueExistsNotEmpty(this.getBuilding()) && valueExistsNotEmpty(this.getFloor()));
	},
	
	toArray: function(asDwgName) {
		var ar = [];
		if (!valueExists(this.pks))
			return ar;
		
		var tot = this.pks.length;
		if (asDwgName == true)
			tot = tot-1;
		for (var i = 0; i < tot; i++) {
			ar[i*2] = this.pks[i];
			ar[i*2+1] = this.map[this.pks[i]];
		}
		
		return ar;
	},
	
	// @begin_translatable
	z_MESSAGE_NO_PKEY_FOR_RECORD: 'No asset associated with the selected record can be found.'
	// @end_translatable	


});










 