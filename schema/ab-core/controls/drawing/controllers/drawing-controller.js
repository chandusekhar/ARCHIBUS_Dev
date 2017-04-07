/*
 * Main controller to direct API calls to different sub-controllers based on the current drawing state.
 * Stores the current drawing state/mode: Single Select (default), Pan, Zoom Window or Multiple Select
 *
 * Used in both Desktop and Mobile.
 */
DrawingController = Base.extend({

	/**
	 * supported drawing mode/state values as follows:
	 * 		Single Select: 0 (Default)
	 * 		Multiple Select: 1
	 * 		Pan: 2
	 * 		Zoom Window: 3
	 */
	state: 0,
	
	/**
	 * drawing controller config, usually contains div id and svg.
	 */
	config: {},

	
	registeredControllers: {},
	
	/**
	 * reference to addon controller
	 */
	addOnsController: null,
	
	
	/**
	 * construct and initialize the drawing controller.
	 */
	constructor:  function(config){
		this.config = config;
		
		//default to single select state
		this.state = (config.state ? config.state : 0);
		
		this.registeredControllers = {};
	},

	/**
	 * init and register the required controllers.
	 */
	init: function(){

		this.readConfig(this);
		
        //register pan-zoom controller
        this.registerController('PanZoomController');

        //register select controller
        this.registerController('SelectController');
        
        //register highlight controller
        this.registerController('HighlightController');
        
        //register asset controller
        this.registerController('AssetController');

        //register select controller
        this.registerController('EventController');
        
    },
	
	
	initAddOn: function(eventHandlers){
        this.addOnsController = new AddOnsController(this.config, this, eventHandlers);	
        
        //register add on passed through config
        if(this.config.addOnsConfig){
        	this.addOnsController.setAddOns(this.config.addOnsConfig);
        }
        
        if(this.config.showTooltip == 'true' && !this.getAddOn('AssetTooltip')){
        	this.addOnsController.registerAddOn('AssetTooltip');
        }
        
        if(this.config.multipleSelectionEnabled == 'true' && !this.getAddOn('SelectWindow')){
        	this.addOnsController.registerAddOn('SelectWindow');
        }
	},
	
	registerController: function(controllerId){

		var controller = this.getControllerConstructorById(controllerId);
		if(typeof controller !== 'undefined' && controller != null){
			var registeredController = new controller(this.config);
			
			//set drawing controller if setDrawingController() is defined in controller class.
			if(typeof registeredController.setDrawingController === 'function') {
				registeredController.setDrawingController(this);
            }
			this.registeredControllers[controllerId] = registeredController;
		}
	},

	getControllerConstructorById: function(controllerId){
    	var controllerConstructor = null;
    	
    	switch(controllerId){
    		case 'AssetController':
    			controllerConstructor = AssetController;
    			break;

			case 'EventController':
    			controllerConstructor = EventController;
    			break;

    		case 'SelectController':
    			controllerConstructor = SelectController;
    			break;

    		case 'HighlightController':
    			controllerConstructor = HighlightController;
    			break;

    		case 'PanZoomController':
    			controllerConstructor = PanZoomController;
    	}

    	return controllerConstructor;
    },
    
	/**
	 * get drawing control's state/mode.
	 */
	getDrawingState: function(){
		return this.state;
	},

	/**
	 * set drawing control's state/mode.
	 */
	setDrawingState: function(newState){
		this.state = newState;
	},
	
	getController: function(controllerId){
		return this.registeredControllers[controllerId];
	},
	
	removeController: function(controllerId) {
        delete this.registeredControllers[controllerId];  
    },
    
    getAddOn: function(addOnId){
    	return (this.addOnsController ? this.addOnsController.getAddOn(addOnId) : null);
    },
    
    registerAddOn: function(addOnId){
    	this.addOnsController.registerAddOn(addOnId);
    },
    
    removeAddOn: function(addOnId){
    	this.addOnsController.removeAddOn(addOnId);
    },
    
    addEventHandlers: function(customHandlers){

        // bind custom events
        if(customHandlers){
    		this.getController("EventController").addEventHandlers(customHandlers);
        }
    },
    
    /**
     * Retrieve drawing config from drawing-control.xml.
     */
    readConfig: function(drawingController){
    	AdminService.getDrawingControlConfig({
        	callback: function(ob){
        
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
        		ob.autoAssignColors = autoColors;
        		drawingController.config.defaultConfig = ob;
        	},
        	
        	errorHandler: function(m, e){
            	Ab.view.View.showException(e);
       	 }
    	});
    },
    
    /**
     * update current highlight parameter from the datasource selector, if any.
     */
	updateHighlightParameters: function(highlightParameters){
	 		
			var highlightElem = Ext.get('selector_hilite');
	 		var highlightDs = (highlightElem && highlightElem.dom.value ? highlightElem.dom.value : '')
	        if(valueExistsNotEmpty(highlightDs))
	        	highlightParameters[0].hs_ds = highlightDs;
			
			var labelsElem = Ext.get('selector_labels');
	 		var labelsDs = (labelsElem && labelsElem.dom.value ? labelsElem.dom.value : '')
	        if(valueExistsNotEmpty(labelsDs))
	        	highlightParameters[0].label_ds = labelsDs;
	        
	        return highlightParameters;
	    
	}

}, {});