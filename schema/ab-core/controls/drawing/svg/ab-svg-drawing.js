/**
 * Based on d3 JS library to handle Ab.svg.DrawingControl.
 */
Ab.namespace('svg');

Ab.svg.DrawingControl = Ab.view.Component.extend({

    version: '2.0.0',

    divId: '',

    config: {},

    // locate asset(s)
    locator: {
        lastFoundElements: [],
        lastFoundClasses: [],
        lastFoundStyles: []
    },

    infoBar: null,

    layersPopup: null,

    control: null,

    // @begin_translatable
    Z_ITEM_NOT_FOUND_MESSAGE: 'Item(s) not found:',
    Z_ITEM_FOUND_MESSAGE: 'Item(s) found:',
    Z_SEARCHING_MESSAGE: 'Searching...',
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

        this.control = new DrawingSvg(divId, config);
    },
    
    /**
     * retrieve the add-on by id
     */
    getAddOn: function(addOnId){
    	return this.getSvgControl().getAddOn(addOnId);
    },

    /**
     * Gets and displays SVG
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
        }
    },

    /**
     * Gets SVG XML from server-side by specified parameters.
     * @param parameters Object
     * @return result Object
     */
    get: function(parameters) {
        var pKeyValues = {};
        if(typeof(parameters.pkeyValues) !== 'undefined' && parameters.pkeyValues !== null){
            pKeyValues = parameters.pkeyValues;
        }

        var planType = null;
        if (typeof(parameters.plan_type) !== 'undefined' && parameters.plan_type !== null){
            planType = parameters.plan_type;
        }

        var highlightParameters = [];
        if(typeof(parameters.highlightParameters) !== 'undefined' && parameters.highlightParameters !== null){
            highlightParameters = parameters.highlightParameters;
        }

        var result = null;
        var msg = View.getLocalizedString(this.Z_FAILED_TO_LOAD_MESSAGE) + ' ';
        DrawingSvgService.highlightSvgDrawing(pKeyValues, planType, highlightParameters, {
            async: false,
            callback: function(xml) {
                result = xml;
            },
            errorHandler: function(m, e) {
            	View.showException(e);
                //console.log(msg + m);
            }
        });

        return result;
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

        if (this.getDiv()) {
            this.infoBar = this.getSvgControl().createInfoBar(this.divId + "_infoBar", this.getSvg(), this.getDiv(), "");
        }
        
        if (svgText) {
            self.getSvgControl().setDefaultViewIfNotExists(this);
                      
            this.getSvg().call(viewBoxZoom());
            
            this.initAddOn();
            
            if (typeof LayersPopup !== 'undefined') {
                this.layersPopup = new LayersPopup();
            }

            if (eventHandlers) {
                self.addEventHandlers(self, eventHandlers);
            }
            
            self.addHomeButton();
            self.setPanAndZoomButtonVisibility(true);
            self.setIsDrawingLoaded(true);
        } else {
            self.setPanAndZoomButtonVisibility(false);
            self.setIsDrawingLoaded(false);
        }
        d3.select("#" + svgDivId).node().focus();
    },
    
    initAddOn: function() {
    	// framework-specific  
    	if (typeof AddOnsController != 'undefined') {
        	this.getSvgControl().addOnsController = new AddOnsController(this.getSvgControl().config, this.getSvgControl());
        	
        	this.getSvgControl().initAddOn();      		
    	} 	
    },
    
    disableLabelSelection: function(){
    	this.getSvgControl().disableLabelSelection(this.getSvg());
    },

    /**
     * Set drawing loaded
     * @param loaded Boolean
     */
    setIsDrawingLoaded: function(loaded) {
        this.config.isDrawingLoaded = loaded;
    },

    /**
     * Show or hide zooming buttons
     * @param displayButtons Boolean
     * TODO: Implement zoom button for Desktop
     */
    setPanAndZoomButtonVisibility: function(displayButtons) {
        var zoomButton = Ext.get('zoomButton');
        if (zoomButton) {
            zoomButton.setHidden(!displayButtons);
        }
    },

    /**
     * Return DrawingSvg from ab-svg-drawing-control.js
     * @return this.control DrawingSvg
     */
    getSvgControl: function() {
        return this.control;
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
     * Return viewBox dimensions
     */
    getViewBox: function() {
        return this.getSvgControl().getViewBox(this.divId);
    },

    /**
     * Zoom to a distance which makes the drawing visible and centered
     */
    zoomExtents: function() {
        this.getSvgControl().zoomExtents(this.divId);
    },
    
    /**
     * Specify a given text for the infoBar
     * @param text String
     */
    setInfoBarText: function(text) {
        var node = document.getElementById(this.infoBar.id + "_infoText");
        node.innerHTML = text;
    },

    /**
     * Whether or not to show the infoBar
     * @param bShow Boolean
     */
    showInfoBar: function(bShow) {
        this.infoBar.style.display = (bShow === true) ? '' : 'none';
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
     * Locate one or more assets
     * @param ids  Array of id to search in SVG (ie. ['0001', '0018', '0109', '0056', '0007', '0066'])
     * @param opts Object of additional properties.  Available properties are:
     *          - cssClass - allows you to specify a custom CSS class to control how assets are highlighted.
     *                      The default value is â€˜zoomed-asset-defaultâ€™.  However, you can choose to specify only a
     *                      border (and allow highlights to show through), a custom color, or both a border and custom
     *                      color, control transitions, add animations, etc.  Any valid CSS style should work.
     *          - removeStyle - often used in conjunction with the cssClass property to temporarily remove the
     *                      original highlight color/fill.  This allows you to specify a custom color for the located
     *                      asset.  The original highlight will reappear if you locate a different asset, preserving
     *                      the highlighted information.
     *          - zoomFactorForLocate  - allows you to control the depth in which to zoom in to a found asset
     */
    findAssets: function(ids, opts) {
        this.setInfoBarText(View.getLocalizedString(this.Z_SEARCHING_MESSAGE));

        this.clearFoundAssets();
        this.locator.divId = this.divId;
        var results = this.getSvgControl().findAssets(ids, opts, this.locator);
        if (results.bFound === false) {
            this.setInfoBarText(View.getLocalizedString(this.Z_ITEM_NOT_FOUND_MESSAGE) + ' ' + results.message);
            this.showInfoBar(true);
        } else {
            this.setInfoBarText(View.getLocalizedString(this.Z_ITEM_FOUND_MESSAGE) + ' ' + results.ids);
            this.showInfoBar(false);
        }
    },

    /**
     * (Deprecated)  Use findAssets instead.
     */
    findAsset: function(ids, opts) {
        this.findAssets(ids, opts);
    },
    
    /**
     * "Clear" highlights for previously found assets
     */
    clearFoundAssets: function() {
        this.showInfoBar(false);
        this.getSvgControl().clearFoundAssets(this.locator);
    },

    /**
     * Create and show a pop-up that enables toggling of different layers on the drawing
     */
    showLayers: function() {
        if (this.layersPopup) {
            this.layersPopup.createLayerPopup(this.getSvg(), this.getDiv(), this.divId + "_layerList", {});
        }
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
	getImageBytes: function(callback){
		return  this.getSvgControl().getImageBytes(callback);
	},
	
	/**
	 * Checks if svg is zoomed
	 */
	isZoomed: function(){
		return  this.getSvgControl().isZoomed();
	},
	    
	/**
	 * Add Home Button
	 */
	addHomeButton: function() {

        var control = this;
        this.getDiv().append("div")
        	.attr('id', control.getDiv().attr("id") + '_home')
        	.style({
        		'position': 'absolute',
        		'right': '10px',
        		'bottom': '5px',
        		'width': '33px',
        		'height': '33px',       		
        		'background-image': 'url(' + View.contextPath + '/schema/ab-core/graphics/icons/view/home.png' + ')'
        	})
        	.on("click", function(){
        		d3.event.stopPropagation();
        		control.zoomExtents();
        	})		
        	.node()
            // prevent double click from propagating
            .addEventListener("dblclick", function(event){
            	event.stopPropagation();
            });
	}
}, {});