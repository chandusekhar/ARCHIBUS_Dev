/**
 * HTML Drawing Control component for Desktop.
 * 
 */
Drawing.DrawingControl = Ab.view.Component.extend({

    version: '2.0.0',

    divId: '',

    config: {},
    
    // svg control base object (DrawingBase)
    control: null,
    
    // @begin_translatable
    Z_NO_CONTENTS_MESSAGE: 'No drawing contents found',
    Z_FAILED_TO_LOAD_MESSAGE: 'Fail to load required svg drawing:',
    // @end_translatable

    /**
     * Constructor.
	 * @param divId String Id of <div/> that holds the svg
     * @param panelId String Id of the panel
	 * @param config configObject
     */
    constructor: function(divId, panelId, config) {
        this.inherit(divId, 'html', config);
        this.divId = divId;
        this.panelId = panelId;
        this.config = config;
        
        this.config.assetTypes		= config.getConfigParameter('assetTypes', '');
		this.config.selectionMode	= config.getConfigParameter('selectionMode', '2');
		this.config.assignMode		= config.getConfigParameter('assignMode', '0');
		this.config.multipleSelectionEnabled = config.getConfigParameter('multipleSelectionEnabled', 'true');
		
		// layers to place on top so that event will fire on them first.
		this.config.topLayers = config.getConfigParameter('topLayers', 'jk;fp');
    	

		// show asset tooltips? hide by default.
		this.config.showTooltip = config.getConfigParameter('showTooltip', 'false');
		
		// add on config for the add-on components
		this.config.addOnsConfig = config.getConfigParameter('addOnsConfig', {});

		this.layoutRegion = config.getConfigParameter('layoutRegion', this.getLayoutValueFromPanel('layoutRegion'));
        this.layout = config.getConfigParameter('layout', this.getLayoutValueFromPanel('layout'));
        this.region = config.getConfigParameter('region', this.getLayoutValueFromPanel('region'));

		//initialze the control
		this.control = new DrawingBase(divId, config);
			
        // add the resize event listener, if not defined
       	this.addDrawingPanelEventHandlers();
    },
	
    
    /**
     * Gets and displays SVG
     * 
     * @param svgDivId      String the id of <div/> to display SVG
     * @param parameters    Object server-side required info such as as bl_id, fl_id, viewName, highlight
     *                      and label dataSource names to get and process corresponding SVG
     * @param eventHandlers Array of event handlers
     */
    load: function(svgDivId, parameters, eventHandlers) {
        var svgText  = this.get(parameters);
        
        this.processSvg(this, svgDivId, svgText, eventHandlers);
       
        // compatibility with IE
        if (Ext.isIE) {
            this.getDiv().node().style.overflow = 'hidden';
            
            //kb# 3053571 - trigger resize event for IE10
            var drawingPanel = View.panels.get(this.panelId);
            drawingPanel.afterResize();
        }
    },

    
    /**
     * Gets SVG XML from server-side by specified parameters.
     * @param parameters Object
     * @return result Object
     */
    get: function(parameters) {
        var pKeyValues = {};
   		if(typeof parameters.pkeyValues !== 'undefined' && parameters.pkeyValues != null){
            pKeyValues = parameters.pkeyValues;
        }

        var planType = null;
   		if(typeof parameters.plan_type !== 'undefined' && parameters.plan_type != null){
            planType = parameters.plan_type;
        }

        var highlightParameters = [];
   		if(typeof parameters.highlightParameters !== 'undefined' && parameters.highlightParameters != null){
           	highlightParameters = this.control.drawingController.updateHighlightParameters(parameters.highlightParameters);
        }

        var result = null;
        var msg = View.getLocalizedString(this.Z_FAILED_TO_LOAD_MESSAGE) + ' ';
        DrawingSvgService.highlightSvgDrawing(pKeyValues, planType, highlightParameters, {
            async: false,
            callback: function(xml) {
                result = xml;
            },
            errorHandler: function(m) {
                // console.log(msg + m);
            }
        });

        return result;
    },

    /**
     * retrieve the layout or region value from panel
     */
    getLayoutValueFromPanel: function(layoutOrRegion){
		var panel = View.panels.get(this.panelId);
		if(panel){
			return panel[layoutOrRegion];
		} else {
			return '';
		}
    },
	
    
    /**
     * Displays SVG, binds JS events to highlighted assets, and adds interactivity components
     * @param self      Object control
     * @param svgDivId  String of the <div/> id
     * @param svgText	String of the SVG contents
     * @param eventHandlers Array
     */
    processSvg: function(self, svgDivId, svgText, eventHandlers) {
        var emptyDrawingText = View.getLocalizedString(this.Z_NO_CONTENTS_MESSAGE);
        this.divId = svgDivId;

        this.getDiv().classed({'floor-plan': true});
        
        // insert svg contents and immediately assign id
        d3.select("#" + svgDivId).node().innerHTML = (svgText) ? svgText : '<div class="empty-drawing-txt">' + emptyDrawingText + '</div>';
        this.getDiv().select("svg").attr("id", svgDivId + "-svg"); 
        
        if (svgText) {
        	
        	this.orderLayers();
        	
        	this.setDefaultViewIfNotExists();
        	this.getSvg().call(viewBoxZoom());

			this.control.drawingController.init();
            
            this.control.drawingController.initAddOn(eventHandlers);
            
            this.control.drawingController.addEventHandlers(eventHandlers);

            self.setIsDrawingLoaded(true);
        } else {
            self.setIsDrawingLoaded(false);
        }
        d3.select("#" + svgDivId).node().focus();
    },
    
    /**
     * order the asset layers so that the small assets are placed on the top so that related events can fire.
     */
    orderLayers: function(){
    	var layersToSort = this.config.topLayers.split(";");
    	for(var index = 0; index < layersToSort.length; index++){
	    	var assetsLayer = d3.select("#" + this.divId + "-svg").select("#" + layersToSort[index] + "-assets");
	    	if(assetsLayer && !assetsLayer.empty()){
	    		var clone = d3.select(assetsLayer.node().cloneNode(true));
	    		var parent = assetsLayer.node().parentNode;
	    		parent.removeChild(assetsLayer.node());
	    		d3.select(parent).node().appendChild(clone.node());
	    	}
    	}
    },
	
    /**
     * Set the default view parameter if none exists
     * @param control
     */
    setDefaultViewIfNotExists: function () {
        var svg = this.getSvg(),
            defaultView = d3.select('#' + this.config.divId + '-svg view[id=defaultView]');

        if (defaultView[0][0] === null) {
            svg.append("view").attr("id", "defaultView").attr("viewBox", svg.attr("viewBox"));
        }
    },
    
    /**
     * Set drawing loaded
     * @param loaded Boolean
     */
    setIsDrawingLoaded: function(loaded) {
        this.config.isDrawingLoaded = loaded;

        if(loaded){
	        // hide navigation toolbar if any
	        var navToolbar = this.control.drawingController.getAddOn('NavigationToolbar');
	        if(navToolbar)
	        	navToolbar.show(loaded);
	        
	        
	        var dsSelector = this.control.drawingController.getAddOn('DatasourceSelector');
	        if(dsSelector)
	        	this.control.drawingController.getController("AssetController").patchBackgroundForUseElements(true);
        }
    },
	
    
    addDrawingPanelEventHandlers: function(){

			var drawingPanel = View.panels.get(this.panelId);
   		var drawingControl = this;

   		drawingPanel.afterResize = function(){
	   		var drawingPanel = View.panels.get(drawingControl.panelId);
	   		var drawingDiv = Ext.get(drawingControl.divId);

	   		var height = drawingPanel.determineHeight();

	   		// make adjustments for tabs and instructions
		   	var adjHeight = 0;
	   		if (this.singleVisibleTabPanel()){
	   			adjHeight = adjHeight + this.getTitlebarHeight(); //31
	   		}
    		adjHeight = adjHeight + this.getInstructionsHeight(); //25

			height = height - adjHeight; //56	
            drawingDiv.setHeight(height);
            drawingDiv.parent().setHeight(height);  
            
            //sync height for layers popup.
			var layersPopup = drawingControl.control.drawingController.getAddOn('LayersPopup');
	        if(layersPopup)
	        	layersPopup.afterResize();
		};

   		drawingPanel.syncHeight = function(){
   			drawingPanel.afterResize();
   		};

   		drawingPanel.afterLayout = function() {
        	var regionPanel = this.getLayoutRegionPanel();
   			if (regionPanel){
   				if(!drawingPanel.resizeListenerAttached){
   					drawingPanel.resizeListenerAttached = true;

   					regionPanel.addListener('resize', function(){
   						drawingPanel.afterResize();
   					});
   					regionPanel.addListener('expand', function() {
		                drawingPanel.afterResize();
		            });
   				}
   			}
   		};

   		drawingPanel.isScrollInLayout = function() {
   			return false;
   		};

   		drawingPanel.afterLayout();
	},

    /**
     * Return DrawingBase from ab-svg-drawing-control.js
     * @return this.control DrawingBase
     */
    getSvgControl: function() {
        return this.control;
    },

    /**
     * retrieve the controller by id
     */
    getController: function(controllerId){
    	return this.control.drawingController.getController(controllerId);
    },
   
    /**
     * retrieve the addon by id
     */
    getAddOn: function(addOnId){
    	return this.control.drawingController.getAddOn(addOnId);
    },
    
    removeAddOn: function(addOnId){
    	this.control.drawingController.removeAddOn(addOnId);
    },
    
    registerAddOn: function(addOnId){
    	return this.control.drawingController.registerAddOn(addOnId);
    },
    
    /**
     * Return <div/> selection
     * @return object HTMLDivElement
     */
    getDiv: function() {
        return this.getSvgControl().getDiv(this.divId);
    },

    getDivId: function () {
        return this.divId;
    },
    
    /**
     * Return <svg/> selection
     * @return object SVGSVGElement
     */
    getSvg: function() {
        return this.getSvgControl().getSvg(this.divId);
    },

   
    /**
     * Add eventHandlers to both highlighted assets and their labels
     * @param self	Control	
     * @param eventHandlers Array
     */
    addEventHandlers: function(self, eventHandlers) {
        this.getSvgControl().addEventHandlers(self.getSvgControl(), eventHandlers);
    },

    /**
     * Add eventHandlers to only highlighted assets
     * @param self	Control	
     * @param eventHandlers Array
     */
    addEvent2HighlightedAssets: function(self, eventHandlers) {
        this.getSvgControl().addEvent2HighlightedAssets(self.getSvgControl(), eventHandlers);
    },

    /**
     * Add eventHandlers to only labels
     * @param self	Control	
     * @param eventHandlers Array
     */
    addEvent2HighlightedLabels: function(self, eventHandlers) {
        this.getSvgControl().addEvent2HighlightedLabels(self.getSvgControl(), eventHandlers);
    },

    /**
     * Load an image into div.
     * @param href      (string)    URL for the image.
     */
    loadImage: function(href) {
        this.getSvgControl().loadImage(this.getDiv(), href);
    },
    /**
	 * Gets chart's Image Bytes
	 * 
	 */
	getImageBytes: function(){
		return  this.getSvgControl().getImageBytes();
	},
	
	/**
	 * Disable label selection.
	 */
	disableLabelSelection: function(){
    	this.getSvgControl().disableLabelSelection(this.getSvg());
	}
});

