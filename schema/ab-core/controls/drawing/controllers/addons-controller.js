/*
 * Main controller for add-on components in Desktop and Mobile.
 * 
 * Supported add-on components are:
 * 		LayersPopup
 * 		InfoBar
 * 		DatasourceSelector
 * 		NavigationToolbar
 * 		AssetLocator
 * 		AssetTooltip
 * 		Cluster
 * 		Marker
 */
AddOnsController = Base.extend({

	/**
	 * add-on config, varies based on the add-on type.
	 */
	config: {},
	
	/**
	 * map of registered add-ons.
	 */
	registeredAddOns: {},
	
	/**
	 * reference to drawingController(Desktop or Mobile)
	 */
	drawingController: null,
	
	/**
	 * event handlers passed in load() API
	 */
	eventHandlers: null,
	
	/**
	 * construct and initialize the drawing controller.
	 */
	constructor:  function(config, drawingController, eventHandlers){
		this.config = config;
		this.drawingController = drawingController;
		
		if(typeof eventHandlers != 'undefined' && eventHandlers!=null){
			this.config.eventHandlers = eventHandlers;
		}
		
		this.registeredAddOns = {};
	},
	
	setAddOns: function(addOnsConfig){
		for (var key in addOnsConfig) {
			  if (addOnsConfig.hasOwnProperty(key)) {
				  this.config.addOnsConfig[key] = addOnsConfig[key];
				  this.registerAddOn(key);
			  }
		}
	},
	
	registerAddOn: function(addOnId){
		var addOn = this.getAddOnConstructorById(addOnId);
		var addOnConfig =  (this.config.addOnsConfig ? this.config.addOnsConfig[addOnId] : null);
		
		if (typeof (addOn) !== 'undefined' && addOn != null) {
			var registeredAddOn = new addOn(this.propagateConfig(addOnId, addOnConfig));
			
			//set drawing controller if setDrawingController() is defined in add on class.
			if(typeof registeredAddOn.setDrawingController === 'function') {
				registeredAddOn.setDrawingController(this.drawingController);
            }
			
			this.registeredAddOns[addOnId] = registeredAddOn;
		}
	},
	

	getAddOnConstructorById: function(addOnId){
    	var addOnConstructor = null;
    	
    	switch(addOnId){
    		case 'LayersPopup':
    			addOnConstructor = Drawing.view.LayersPopup;
    			break;

    		case 'InfoBar':
    			addOnConstructor = Drawing.view.InfoBar;
    			break;

    		case 'InfoWindow':
    			addOnConstructor = Drawing.view.InfoWindow;
    			break;

    		case 'DatasourceSelector':
    			addOnConstructor = Drawing.view.DatasourceSelector;
    			break;
 	
    		case 'AssetLocator':
    			addOnConstructor = Drawing.view.AssetLocator;
    			break;

    		case 'AssetTooltip':
    			addOnConstructor = Drawing.view.AssetTooltip;
    			break;
    			
    		case 'NavigationToolbar':
    			addOnConstructor = Drawing.view.NavigationToolbar;
    			break;
	
    		case 'SelectWindow':
    			addOnConstructor = Drawing.view.SelectWindow;
    			break;

    		case 'Cluster':
    			addOnConstructor = ClusterControl;
    			break;
    		
    		case 'Marker':
    			addOnConstructor = Drawing.controllers.MarkerController;
    			break;
    	}
    	
    	return addOnConstructor;
    },
    
    
	/**
	 * adds drawing control's root config to the addOnConfig
	 */
	propagateConfig: function(addOnId, addOnConfig){
		if(addOnId === 'DatasourceSelector'){
			return this.config;
		} else {
			return this.cloneConfig(addOnId, addOnConfig);
		}
	},
	

	/**
	 * copy config's base parameter to the addOnConfig for the add-on component.
	 */
	cloneConfig: function(addOnId, addOnConfig){
		
		if(typeof addOnConfig === 'undefined' || !addOnConfig){
			addOnConfig = {};
		}
		
		for (var key in this.config) {
			if (this.config.hasOwnProperty(key) && (typeof key !== 'function') && (key !== 'addOnsConfig') && !(typeof (addOnConfig[key]) !== 'undefined' && addOnConfig[key] != null)) {
				addOnConfig[key] = this.config[key];
			}
		}
		return addOnConfig;
	},
	
	getAddOn: function(addOnId){
		return this.registeredAddOns[addOnId];
	},
	
	removeAddOn: function(addOnId) {
        delete this.registeredAddOns[addOnId];  
    }
}, {});