Drawing.namespace("view");

/**
 * InfoWindow is used to display multiple line message on top of drawing SVG.
 * Unlike InforBar, which displays single line of messages and push the drawing down.
 * It includes a close button with custom event support.
 * It allows for dock at top or bottom of the drawing SVG container
 */
Drawing.view.InfoWindow = Base.extend({
	
	config: {},
	
	/** 
	 * information window <div> object
	 */
	infoDiv: null,
	
	/**
	 * custom event when user closes the InfoWindow
	 */
	customEvent: null,
	
	/**
	 * reference to drawing controller
	 */
	drawingController: null,
	
	/**
	 * Create the info bar.  Info bar is used in findAssets
     * @param infoWindowId String
     * @param svg selection
     * @param div selection
     * @param initialMsg String (already localized in appropriate framework)
     */
	constructor: function(config) {
		this.config = config;
		
        this.infoDiv = document.createElement('div');
        this.infoDiv.id = config.divId + "_infoWindow";
        this.infoDiv.className = 'info-window';
        this.infoDiv.style.width = (config.width ? config.width : "300px");
        
        //only set height if predefined in config.
        if(config.height){
           this.infoDiv.style.height = config.height;
        }
        
        if(config.position == 'bottom'){
        	this.infoDiv.style.bottom = 0;
        }
        
        if(config.customEvent){
        	this.customEvent = config.customEvent;
        }
        
        var closeButton = document.createElement('div');
        closeButton.className = 'close-button';
        this.infoDiv.appendChild(closeButton);

        var eventName = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
        var control = this;
        closeButton.addEventListener(eventName,  function(){
        	control.infoDiv.style.display = 'none';
        	
        	if(control.customEvent){
        		control.customEvent(control.drawingController);
    		}
        }, false);

        var textNode = document.createElement("div");
        textNode.innerHTML = (config.initialMsg ? config.initialMsg : "");
        textNode.id = this.infoDiv.id + '_infoText';
        this.infoDiv.appendChild(textNode);

        var containerDiv = d3.select("#" + config.divId).node();
        var svg = d3.select("#" + config.divId + "-svg");
        if (!svg.empty()) {
            containerDiv.insertBefore(this.infoDiv, svg.node());
        } else {
            containerDiv.insertBefore(this.infoDiv, containerDiv.firstChild);
        }

        // hide infoDiv initially, if no initial message.
        if(!config.initialMsg){
        	this.infoDiv.style.display = 'none';
        }
    },
    
    /**
     * set reference to drawingController
     */
    setDrawingController: function(drawingController){
    	this.drawingController = drawingController;
    },
    
    /**
     * Specify a given text for the infoWindow
     * @param text String
     */
    setText: function(text) {
        var node = document.getElementById(this.infoDiv.id + "_infoText");
        node.innerHTML = text;
        
        this.infoDiv.style.display = '';
    },
    
    /**
     * Apppend a given text for the infoWindow
     * @param text String
     */
    appendText: function(text) {
        var node = document.getElementById(this.infoDiv.id + "_infoText");
        node.innerHTML = node.innerHTML + text;

        this.infoDiv.style.display = '';
    },

    /**
     * Whether or not to show the infoWindow
     * @param bShow Boolean
     */
    show: function(bShow) {
        this.infoDiv.style.display = (bShow === true) ? '' : 'none';
    }
}, {});