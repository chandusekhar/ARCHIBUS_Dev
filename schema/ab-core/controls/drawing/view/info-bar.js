Drawing.namespace("view");

Drawing.view.InfoBar = Base.extend({
	
	config: {},
	
	/** 
	 * information bar <div> object
	 */
	infoDiv: null,
	
	/**
	 * Create the info bar.  Info bar is used in findAssets
     * @param infoBarId String
     * @param svg selection
     * @param div selection
     * @param initialMsg String (already localized in appropriate framework)
     */
	constructor: function(config) {
		this.config = config;
		
        this.infoDiv = document.createElement('div');
        this.infoDiv.id = config.divId + "_infoBar";
        this.infoDiv.className = 'info-bar';

        var closeButton = document.createElement('div');
        closeButton.className = 'close-button';
        this.infoDiv.appendChild(closeButton);

        var eventName = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
        var infoDiv = this.infoDiv;
        closeButton.addEventListener(eventName,  function(){
        	infoDiv.style.display = 'none';
        }, false);

        var textNode = document.createElement("div");
        textNode.innerHTML = config.initialMsg;
        textNode.id = this.infoDiv.id + '_infoText';
        this.infoDiv.appendChild(textNode);

        var containerDiv = d3.select("#" + config.divId).node();
        var svg = d3.select("#" + config.divId + "-svg");
        if (!svg.empty()) {
            containerDiv.insertBefore(this.infoDiv, svg.node());
        } else {
            containerDiv.insertBefore(this.infoDiv, containerDiv.firstChild);
        }

        // hide infoDiv initially
        this.infoDiv.style.display = 'none';
    },
    
    /**
     * Specify a given text for the infoBar
     * @param text String
     */
    setText: function(text) {
        var node = document.getElementById(this.infoDiv.id + "_infoText");
        node.innerHTML = text;
    },

    /**
     * Whether or not to show the infoBar
     * @param bShow Boolean
     */
    show: function(bShow) {
        this.infoDiv.style.display = (bShow === true) ? '' : 'none';
    }
}, {});