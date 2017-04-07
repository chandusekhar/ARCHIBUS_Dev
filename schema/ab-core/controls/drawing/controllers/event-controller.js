/**
 * Controller to handle the events.
 * 
 * Used for both Desktop and Mobile.
 * 
 */

EventController = Base.extend({

	config: {},
	
	state: 0,
	
	// reference to drawing controller
	drawingController: null,
	
	constructor: function(config){
		
		this.config = config;
		
		//default to single select state
		this.state = (config.state ? config.state : 0);
	},

	/**
     * set reference to drawingController
     */
    setDrawingController: function(drawingController){
    	this.drawingController = drawingController;
    },
    
    	
	/**
     * Adds JS events to highlighted assets and/or labels.
     * @param eventHandlers Function
     */
    addEventHandlers: function (eventHandlers) {
    	var self = this;
        for (var i = 0; i < eventHandlers.length; i++) {
            var eventHandler = eventHandlers[i];
            
            var highlightOnly = false;
            if(eventHandler && eventHandler.highlightOnly == true) 
            	highlightOnly = eventHandler.highlightOnly;
            
            this.addEvent2Assets(self, eventHandler, highlightOnly);
            
            var assetOnly =  false;
            if(eventHandler && eventHandler.assetOnly == true) 
            	assetOnly = eventHandler.assetOnly;
            
            if(!assetOnly){
            	this.addEvent2Labels(self, eventHandler, highlightOnly);
            }
        }
    },

    /**
     * Adds JS event to highlighted Assets.
     * @param self Control
     * @param eventHandler Function
     * @param highlightOnly true if only add the event for highlighted assets, false to add it to both highlighted and non-highlighted assets
     */
    addEvent2Assets: function (self, eventHandler, highlightOnly) {
        var eventName = eventHandler.eventName;
        var assetGroup = eventHandler.assetType + "-assets";

    	if (this.isNativeAndroid()) {
            d3.selectAll("#" + assetGroup).selectAll('*').filter( function() { return this.parentNode.id === assetGroup; } )
            .each(function () {
                self.addEvent2AssetAndroid(this, eventHandler, eventName, highlightOnly);
            });
    	} else {
            d3.selectAll("#" + assetGroup).selectAll('*').filter( function() { return this.parentNode.id === assetGroup; } )
            .each(function () {
                self.addEvent2Asset(this, eventHandler, eventName, highlightOnly);
                self.addMouseEvents2Asset(this, highlightOnly);
            });
    	}
    },
    
    /**
     * Add mouse event to the asset.
     * @param self Control
     * @param highlightOnly true if only add the event for highlighted assets, false to add it to both highlighted and non-highlighted assets.
     */
    addMouseEvents2Asset: function (self, highlightOnly) {
    	var asset = d3.select(self);
        var assetNode = asset.node();

        var isValid = true;
        
        //check if the asset is highlighted
        if(highlightOnly)
        	isValid = (asset.attr('highlighted') === 'true');
        
        if (isValid) {
        	assetNode.addEventListener("mouseover", function (event) {
                event.stopPropagation();
                this.style.cursor="pointer";
        	});
        	assetNode.addEventListener("mouseout", function (event) {
                event.stopPropagation();
                this.style.cursor="all-scroll";
        	});
        }
    },
    
    /**
     * Adds JS event to highlighted Assets.
     * @param self Control
     * @param eventHandler Function
     */
    addEvent2HighlightedAssets: function (self, eventHandler) {
    	this.addEvent2Assets(self, eventHandler, true);
    },

    /**
     * Add event to the asset.
     * @param self Control
     * @param eventHandler Function
     * @param eventName Function
     * @param highlightOnly true if only add the event for highlighted assets, false to add it to both highlighted and non-highlighted assets.
     */
    addEvent2Asset: function (self, eventHandler, eventName, highlightOnly) {
        var eventController = this;
        var asset = d3.select(self);
        var assetController = this.drawingController.getController("AssetController"); 
        var assetId = assetController.retrieveValidAssetId(self.id);
        var assetNode = asset.node();

        var isValid = true;
        
        //check if the asset is highlighted
        if(highlightOnly)
        	isValid = (asset.attr('highlighted') === 'true');
        
        if (isValid) {
        	var addEvent = false;
        	if(assetNode.nodeName == 'use'){
        		assetId = assetId + "-rect";
        		var rect = assetController.getAssetById(this.config.divId, assetId);
        		if(d3.select(rect.node()).empty()){
        			addEvent = assetController.patchBackgroundForUseElement(asset, eventHandler['bbox']);
            		rect = assetController.getAssetById(this.config.divId, assetId);
        		} 
        		assetNode = rect.node();
        	} else {
        		addEvent = true;
        	}
        	
        	if(addEvent){
                var flag = 0;
            	// set the fill to 'transparent' to allow event to fire within the boundary for asset such as panel which is only made up with borders. 
            	var fill = d3.select(assetNode).attr("fill");
        		if(typeof fill === 'undefined' || fill == null){
            		d3.select(assetNode).attr("fill", "transparent");
            	}
                // register mouseup event to prvent both "mouseup" and "click" events fired on click.
                if(eventName === 'click'){
                	assetNode.addEventListener("mousedown", function(event){
            			event.preventDefault();
                	    flag = 0;
                	}, false);
                	assetNode.addEventListener("mousemove", function(event){
            			event.preventDefault();
                	    flag = 1;
                	}, false);
                	
                	var navToolbar = this.drawingController.getAddOn("NavigationToolbar"); 
                	assetNode.addEventListener("mouseup", function(event){
            			event.preventDefault();
            			
                		// only execute if it is a left-click
                		if(flag === 0 && event.which === 1){
        	 	            eventHandler.handler(assetId, eventController.drawingController, event, eventHandler['assetType']);
                	    } else if (navToolbar && navToolbar.mouseState.selecting){
                	    	navToolbar.mouseUpHandler(event);
                	    }
                		flag = 0;
                	}, false);
                } else {
	        		assetNode.addEventListener(eventName, function (event) {
		                event.stopPropagation();

		                if(eventName === 'contextmenu'){
		                	//stop showing browser's context menu
		                	event.preventDefault();
		                }

    	 	            eventHandler.handler(assetId, eventController.drawingController, event, eventHandler['assetType']);
		        	});
                }
        	}
	        	
        }
    },

    /**
     * Adds JS event to highlighted individual Asset.
     * @param self Control
     * @param eventHandler Handler
     * @param eventName Function
     */
    addEvent2HighlightedAsset: function (self, eventHandler, eventName) {
        var eventController = this;
        var asset = d3.select(self);
        var assetId = self.id;
        var assetNode = asset.node();

        //check if the asset is highlighted
        if (asset.attr('highlighted') === 'true') {
        	var assetController = this.drawingController.getController("AssetController");
        	assetNode.addEventListener(eventName, function (event) {
                event.stopPropagation();
 	            eventHandler.handler(assetController.retrieveValidAssetId(assetId), eventController.drawingController, event, eventHandler['assetType']);
        	});
        }
    },

    /**
     * Adds JS event to all Assets (for Android).
     * @param self Control
     * @param eventHandler Handler
     * @param eventName Function
     * @param highlightOnly true if only add event to highlighted assets, false for all assets.
     */
    addEvent2AssetAndroid: function(self, eventHandler, eventName, highlightOnly){
    	
        var eventController = this;
        var asset = d3.select(self);
        var assetId = self.id;
        var assetNode = asset.node();
        var objectMoved = null;

        var isValid = true;
        if(highlightOnly)
        	isValid = (asset.attr('highlighted') === 'true');
        
        //check if the asset is highlighted
        if (isValid) {
        	var assetController = this.drawingController.getController("AssetController");
        	if(assetNode.nodeName == 'use'){
        		var rect = assetController.getAssetById(this.config.divId, assetId + "-rect");
        		if(d3.select(rect.node()).empty()){
        			addEvent = assetController.patchBackgroundForUseElement(asset, eventHandler['bbox']);
            		rect = assetController.getAssetById(this.config.divId, assetId);
        		}
        		
        		assetNode = rect.node();
        	}
        	
            assetNode.addEventListener("touchstart", function () {
                objectMoved = null;
            });
            assetNode.addEventListener("touchmove", function (event) {
                objectMoved = event.target;
            });
    		assetNode.addEventListener("touchend", function (event) {
                event.stopPropagation();
                if (event.touches && event.touches.length > 2) {
                    return;
                }
                if (objectMoved && event.target === objectMoved) {
                    return;
                }
                if (eventHandler.handler) {
                	//eventController.addFeedback(assetId, asset, eventHandler);
     	            eventHandler.handler(assetController.retrieveValidAssetId(assetId), eventController.drawingController);
                }
    		});
        }
    
    },
    
    /**
     * Adds JS event to highlighted individual Asset (for Android).
     * @param self Control
     * @param eventHandler Handler
     * @param eventName Function
     */
    addEvent2HighlightedAssetAndroid: function (self, eventHandler, eventName) {
    	this.addEvent2AssetAndroid(self, eventHandler, eventName, true);
    },

    addFeedback: function(assetId, asset, eventHandler) {
    	var eventController = this;
    	var assetController = this.drawingController.getController("AssetController");
		var bBox = assetController.getBBox(asset);
    	var assetNode = asset.node();
    	if(assetNode.nodeName == 'use'){
    		d3.select(assetNode.parentNode)
	    			.append("rect")
	    			.attr("id", assetId + "-rect")
	    			.attr("x", bBox.x)
	    			.attr("y", bBox.y)
	    			.attr("width",  bBox.width)
	    			.attr("height",  bBox.height)
	    			.attr("transform", d3.select(assetNode).attr("transform"))
	    			.transition()
	        		.duration(100)
	        		.ease('linear')
	        		.style("fill", "#CCDEF1")
	        		.style("stroke", "#steelblue")
	        		.style("opacity", "1")
	        		.each("end", function(){
	     	            d3.select(this).remove();
	     	            eventHandler.handler(assetController.retrieveValidAssetId(assetId), eventController.drawingController);
	        		});
    	} else{
        	var clone = d3.select(asset.node().cloneNode(true));
        	clone
    		.style("transform-origin", "50% 50%")
    		.style("fill", "#fff")
    		.style("fill", "#CCDEF1")
    		.style("stroke", "steelblue")
    		.style("stroke-width", "0.5%")
    		.style("opacity", "1")
    		.transition()
    		.duration(100)
    		.ease('linear')
    		.style("fill", "#CCDEF1")
    		.style("stroke", "#005CB8")
    		.each("end", function(){
 	            d3.select(this).remove();
 	            eventHandler.handler(assetController.retrieveValidAssetId(assetId), eventController.drawingController);
    		});
        	asset.node().parentNode.appendChild(clone.node());
    	}
    },

    /**
     * Adds JS event to labels.
     * @param self Control
     * @param eventHandler handler
     * @param highlightOnly true if only add event to highlighted labels, false for all assets.
    */
    addEvent2Labels: function (self, eventHandler, highlightOnly) {
        var eventName = eventHandler.eventName;
        var prefix = 'l-' + eventHandler.assetType + '-';
        var labels = d3.select("#" + eventHandler.assetType + "-labels")

        if (this.isNativeAndroid()) {
            labels.selectAll("g")
            .each(function () {
                self.addEvent2LabelAndroid(this, prefix, eventHandler, eventName, highlightOnly);
            });
        } else {
            labels.selectAll("g")
            .each(function () {
                self.addEvent2Label(this, prefix, eventHandler, eventName, highlightOnly);
            });
        }
    },

    /**
     * Adds JS event to highlighted labels.
     * @param self Control
     * @param eventHandler handler
     */
    addEvent2HighlightedLabels: function (self, eventHandler) {
    	this.addEvent2Labels(self, eventHandler, true);
    },
    
    /**
     * Adds JS event to individual label.
     * @param self Control
     * @param prefix String  The asset type, which is typically the table name, such as 'rm'
     * @param eventHandler Function
     * @param eventName String (i.e. 'click')
     * @param highlightOnly true if only add event to highlighted label, false for both highlight or non-hihglighted labels.
     */
    addEvent2Label: function (self, prefix, eventHandler, eventName, highlightOnly) {
        var eventController = this;
        var assetLabelId = self.id;
        var assetLabel = d3.select(self);
        var assetLabelNode = assetLabel.node();

        var isValid = true;
        if(highlightOnly)
        	isValid = (assetLabel.attr('highlighted') === 'true');
        
        //check if the asset is highlighted
        if (isValid) {
        	var assetController = this.drawingController.getController("AssetController");
        	
        	assetLabelNode.addEventListener(eventName, function (event) {
            	event.stopPropagation();

            	if(eventName === 'contextmenu'){
                	//stop showing browser's context menu
                	event.preventDefault();
                }
            	
            	if (eventHandler.handler) {
                	var assetId = assetLabelId.substring(assetLabelId.indexOf(prefix) + prefix.length);
     	            eventHandler.handler(assetController.retrieveValidAssetId(assetId), eventController.drawingController, event, eventHandler['assetType']);
                }
            });
        }
    },

    /**
     * Adds JS event to highlighted individual label.
     * @param self Control
     * @param prefix String  The asset type, which is typically the table name, such as 'rm'
     * @param eventHandler Function
     * @param eventName String (i.e. 'click')
     */
    addEvent2HighlightedLabel: function (self, prefix, eventHandler, eventName) {
    	this.addEvent2Label(self, prefix, eventHandler, eventName, true);
    },

    /**
     * Adds JS event to individual label for Android.
     * @param self Control
     * @param prefix String  The asset type, which is typically the table name, such as 'rm'
     * @param eventHandler Function
     * @param eventName String (i.e. 'click')
     */
    addEvent2LabelAndroid: function (self, prefix, eventHandler, eventName, highlightOnly) {
        var eventController = this;
        var assetLabelId = self.id;
        var assetLabel = d3.select(self);
        var assetLabelNode = assetLabel.node();
        var objectMoved = null;

        var isValid = true;
      
        //check if the asset is highlighted
        if(highlightOnly)
        	isValid = (assetLabel.attr('highlighted') === 'true');
        
        if (isValid) {
            assetLabelNode.addEventListener("touchstart", function () {
                objectMoved = null;
            });
            assetLabelNode.addEventListener("touchmove", function (event) {
                objectMoved = event.target;
            });
            var assetController = this.drawingController.getController("AssetController");
            assetLabelNode.addEventListener('touchend', function (event) {
                event.stopPropagation();

                if (event.touches && event.touches.length > 2) {
                    return;
                }
                if (objectMoved && event.target === objectMoved) {
                    return;
                }

                if (eventHandler.handler) {
                    var assetId = assetLabelId.substring(assetLabelId.indexOf(prefix) + prefix.length);
                    var asset = assetController.getAssetById(assetId);
     	            eventHandler.handler(assetController.retrieveValidAssetId(assetId), eventController.drawingController);
                }
            });
        }
    },

    /**
     * Adds JS event to highlighted individual label for Android.
     * @param self Control
     * @param prefix String  The asset type, which is typically the table name, such as 'rm'
     * @param eventHandler Function
     * @param eventName String (i.e. 'click')
     */
    addEvent2HighlightedLabelAndroid: function (self, prefix, eventHandler, eventName) {
    	this.addEvent2LabelAndroid(self, prefix, eventHandler, eventName, true);
    },

    /**
     * Stop propagation and prevent default
     */
    stopPropagation: function(){
        d3.event.stopPropagation();
        d3.event.preventDefault();
    },
    
    isNativeAndroid: function () {
        var nua = navigator.userAgent;
        var isAndroid = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
        return isAndroid;
    }
}, {});