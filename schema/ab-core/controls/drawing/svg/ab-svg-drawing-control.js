/**
 * SVG Drawing control implementation.  Does not depend on full 2.0 web core framework.
 * Contains common private functions for the SVG drawing control.
 * 
 * ED 04/2014 - Initial
 * YQ 05/2015 - Modify to allow adding events to non-highlighted assets and labels. 
 */
var DrawingSvg = Base.extend({
	
	/**
	 * reference to addon controller
	 */
	addOnsController: null,	

	/**
     * Constructor.
     *
     * @param divId String Id of <div/> that holds the svg
     * @param config configObject
     */
    constructor: function(divId, config) {
        this.inherit(divId, 'html', config);
        this.divId = divId;
        this.config = config;       
    },
    
    /**
     * Initialize the add-on.
     */
	initAddOn: function(){
		// set in adapter file
        // this.addOnsController = new AddOnsController(this.config, this);	
        
        //register add-on passed through config
        if(this.config.addOnsConfig){
            this.addOnsController.setAddOns(this.config.addOnsConfig);
        }
	},
	
    /**
     * Retrieve the add-on by id.
     */
    getAddOn: function(addOnId){
    	return (this.addOnsController) ? this.addOnsController.getAddOn(addOnId) : null;
    },

    /**
     * Returns the <div/> selection based on id
     * @param divId
     * @return object HTMLDivElement
     */
    getDiv: function (divId) {
        return d3.select("#" + divId);
    },

    /**
     * Returns the SVG selection based on <div/> id
     * @param divId
     * @return object SVGSVGElement
     */
    getSvg: function (divId) {
        return d3.select("#" + divId + "-svg");
    },
    
    /**
     * Returns the viewBox based on <div/> id
     * @param divId
     * @return viewBox Array
     */
    getViewBox: function (divId) {
        var viewBox = d3.select("#" + divId + "-svg").attr("viewBox").split(" ");
        if (viewBox.length === 1) {
            viewBox = d3.select("#" + divId + "-svg").attr("viewBox").split(",");
        }

        for (var i = 0; i < viewBox.length; i++) {
            viewBox[i] = Number(viewBox[i]);
        }
        return viewBox;
    },

    /**
     * Return a d3 compatible object
     * @param assetId
     * @return elem selection
     */
    getAssetById: function (assetId) {
        //var elem = document.getElementById(assetId);
        // search within div in the case of multiple divs
        var elem = this.getSvg(this.divId).node().getElementById(assetId);
        return d3.select(elem);
    },

    /**
     * Adds JS events to highlighted assets and labels.
     * @param self Control
     * @param eventHandlers Function
     */
    addEventHandlers: function (self, eventHandlers) {
        for (var i = 0; i < eventHandlers.length; i++) {
            var eventHandler = eventHandlers[i];
            
            var highlightOnly = true;
            if(eventHandler && eventHandler.highlightOnly == false) 
            	highlightOnly = eventHandler.highlightOnly;
            
            this.addEvent2Assets(self, eventHandler, highlightOnly);
            this.addEvent2Labels(self, eventHandler, highlightOnly);
        }
    },

    /**
     * Adds JS event to highlighted Assets.
     * @param self Control
     * @param eventHandler Function
     * @param highlightOnly true if only add the event for highlighted assets, false to add it to both highlighted and non-highlighted assets
     */
    addEvent2Assets: function (self, eventHandler, highlightOnly) {
        var eventName = this.getClickEventName();
        var assetGroup = eventHandler.assetType + "-assets";

    	if (self.isNativeAndroid()) {
            d3.selectAll("#" + assetGroup).selectAll('*').filter( function() { return this.parentNode.id === assetGroup; } )
            .each(function () {
                self.addEvent2AssetAndroid(this, eventHandler, eventName, highlightOnly);
                //self.addMouseEvent2AssetAndroid(this, self.setPointerCursor, "mouseover", highlightOnly);
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
        var control = this;
        var asset = d3.select(self);
        var assetId = self.id;
        var assetNode = asset.node();

        var isValid = true;
        
        //check if the asset is highlighted
        if(highlightOnly)
        	isValid = (asset.attr('highlighted') === 'true');
        
        if (isValid) {
        	assetNode.addEventListener(eventName, function (event) {
                event.stopPropagation();
                if (eventHandler.handler) {
                	control.addFeedback(assetId, asset, eventHandler);
                }
        	});
        }
    },

    /**
     * Adds JS event to highlighted individual Asset.
     * @param self Control
     * @param eventHandler Handler
     * @param eventName Function
     */
    addEvent2HighlightedAsset: function (self, eventHandler, eventName) {
        var control = this;
        var asset = d3.select(self);
        var assetId = self.id;
        var assetNode = asset.node();

        //check if the asset is highlighted
        if (asset.attr('highlighted') === 'true') {
        	assetNode.addEventListener(eventName, function (event) {
                event.stopPropagation();
                if (eventHandler.handler) {
                	control.addFeedback(assetId, asset, eventHandler);
                }
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
    	
        var control = this;
        var asset = d3.select(self);
        var assetId = self.id;
        var assetNode = asset.node();
        var objectMoved = null;

        var isValid = true;
        if(highlightOnly)
        	isValid = (asset.attr('highlighted') === 'true');
        
        //check if the asset is highlighted
        if (isValid) {

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
                	control.addFeedback(assetId, asset, eventHandler);
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
    	var control = this;
    	var clone = d3.select(asset.node().cloneNode(true));
    	var centroid = control.getCentroid(asset);
    	clone
    		//.style("transform-origin", "50% 50%")
    		//.style("fill", "#fff")
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
 	            eventHandler.handler(control.retrieveValidAssetId(assetId), control);
    		});
    	asset.node().parentNode.appendChild(clone.node());
    },

    /**
     * Retrieves valid asset id since all white spaces of its id value have been replaced by underscore characters during publishing svg.
     * @param assetEleId String
     */
    retrieveValidAssetId: function (assetEleId) {
        return assetEleId.replace(/___/g, "'").replace(/__/g, " ");
    },

    /**
     * Retrieves valid SVG asset id.  Opposite of retrieveValidAssetId().
     * @param assetEleId String
     */
    retrieveValidSvgAssetId: function (assetEleId) {
        return assetEleId.replace(/'/g, "___").replace(/ /g, "__");
    },

    /**
     * Adds JS event to labels.
     * @param self Control
     * @param eventHandler handler
     * @param highlightOnly true if only add event to highlighted labels, false for all assets.
    */
    addEvent2Labels: function (self, eventHandler, highlightOnly) {
        var eventName = this.getClickEventName();
        var prefix = 'l-' + eventHandler.assetType + '-';
        var labels = d3.select("#" + eventHandler.assetType + "-labels")

        if (self.isNativeAndroid()) {
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
        var control = this;
        var assetLabelId = self.id;
        var assetLabel = d3.select(self);
        var assetLabelNode = assetLabel.node();

        var isValid = true;
        if(highlightOnly)
        	isValid = (assetLabel.attr('highlighted') === 'true');
        
        //check if the asset is highlighted
        if (isValid) {

        	assetLabelNode.addEventListener(eventName, function (event) {
            	event.stopPropagation();

            	if (eventHandler.handler) {
                	var assetId = assetLabelId.substring(assetLabelId.indexOf(prefix) + prefix.length);
                	var asset = control.getAssetById(assetId);
                	if (asset) {
                		control.addFeedback(assetId, asset, eventHandler);
                	} else {
                		eventHandler.handler(control.retrieveValidAssetId(assetId));
                	}
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
        var control = this;
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
                    var asset = control.getAssetById(assetId);
                    if (asset) {
                        control.addFeedback(assetId, asset, eventHandler);
                    } else {
                        eventHandler.handler(control.retrieveValidAssetId(assetId));
                    }
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
     * Set the default view parameter if none exists
     * @param control
     */
    setDefaultViewIfNotExists: function (control) {
        var svg = control.getSvg(),
            defaultView = d3.select('#' + control.divId + '-svg view[id=defaultView]');

        if (defaultView[0][0] === null) {
            svg.append("view").attr("id", "defaultView").attr("viewBox", svg.attr("viewBox"));
        }
    },

    /**
     * Return the click event
     * @return 'click' String
     */
    getClickEventName: function () {
    	return 'click';
    },

    /**
     * Stop propagation and prevent default
     */
    stopPropagation: function(){
        d3.event.stopPropagation();
        d3.event.preventDefault();
    },
    
    disableLabelSelection: function (svg) {
        svg.select("#asset-labels").classed({'no-selection': true});
        svg.select("#text").classed({'no-selection': true});
    },

    /**
     * Zoom to the extent of the drawing
     * @param divId String
     */
    zoomExtents: function (divId) {
        var svg = this.getSvg(divId),
            defaultView = d3.select('#' + divId + '-svg view[id=defaultView]');

        if (defaultView[0][0] !== null) {
            // console.log('Execute defaultView');
            svg.attr("viewBox", defaultView.attr("viewBox"));
         
            var clusterControl = this.getAddOn('Cluster');
            if (clusterControl) {           
    	        svg.call(clusterControl.zoom);
            }   
        }
    },
    
    /**
	 * Checks if svg is zoomed
	 */
	isZoomed: function(){
		var  defaultView = d3.select('#' + this.divId + ' svg view[id=defaultView]');
		var defaultViewBox = '';
		 if (defaultView[0][0] !== null) {
			 defaultViewBox = defaultView.attr("viewBox");
		 }
		 
	 
		var currentViewBox = this.getViewBox(this.divId).join(' ');
		
		return (currentViewBox !== defaultViewBox);
	},
	
	 /**
	 * Gets chart's Image Bytes
	 * 
	 */
	getImageBytes: function(callback){
		var result = '';
		var imageCapture = new ImageCapture();
		var drawingDiv = this.divId;
		imageCapture.captureImage(drawingDiv, false, function(image){
			result = image.substring(22);
			if(callback){
				callback(result);
				return;
			}
			
 	   	});
		return result;
	},

    /**
     * Return average of two numbers
     * @param num1 Number
     * @param num2 Number
     * @return (Number(num1) + Number(num2)) / 2
     */
    avg: function (num1, num2) {
        return (Number(num1) + Number(num2)) / 2;
    },

    /**
     * Return difference of two numbers
     * @param num1 Number
     * @param num2 Number
     * @return (Number(num1) - Number(num2))
     */
    difference: function (num1, num2) {
        return (Number(num1) - Number(num2));
    },

    /**
     * Return center point of a selection as [x,y]
     * @param selection
     */
    getCentroid: function (selection) {
        var bBox = this.getBBox(selection);
        return (selection.attr("x") && selection.attr("y")) ? [selection.attr("x"), selection.attr("y")] :
            [bBox.x + bBox.width / 2, bBox.y + bBox.height / 2];
    },

    /**
     * Return the bBox of selection
     * @param selection
     * @return elem.getBBox()
     */
    getBBox: function (selection) {
        var elem = selection.node();
        return elem.getBBox();
    },

    /**
     * Create the info bar.  Info bar is used in findAssets
     * @param infoBarId String
     * @param svg selection
     * @param div selection
     * @param initialMsg String (already localized in appropriate framework)
     */
    createInfoBar: function(infoBarId, svg, div, initialMsg) {
        var infoBar = document.createElement('div');
        infoBar.id = infoBarId;
        infoBar.className = 'info-bar';

        var closeButton = document.createElement('div');
        closeButton.id = 'close-button';
        closeButton.className = 'close-button';
        infoBar.appendChild(closeButton);

        var eventName = ('ontouchstart' in document.documentElement) ? 'touchstart' : 'click';
        closeButton.addEventListener(eventName,  function(){
            infoBar.style.display = 'none';
        }, false);

        var textNode = document.createElement("div");
        textNode.innerHTML = initialMsg;
        textNode.id = infoBar.id + '_infoText';
        infoBar.appendChild(textNode);

        var containerDiv = div.node();
        if (!svg.empty()) {
            containerDiv.insertBefore(infoBar, svg.node());
        } else {
            containerDiv.insertBefore(infoBar, containerDiv.firstChild);
        }

        // hide infoBar initially
        infoBar.style.display = 'none';

        return infoBar;
    },

    /**
     * Locate one or more assets
     * @param ids  Array of id to search in SVG (i.e. ['0001', '0018', '0109', '0056', '0007', '0066'])
     * @param opts Object of additional properties.  Available properties are:
     *          - cssClass - allows you to specify a custom CSS class to control how assets are highlighted.
     *                      The default value is "zoomed-asset-default".  However, you can choose to specify only a
     *                      border (and allow highlights to show through), a custom color, or both a border and custom
     *                      color, control transitions, add animations, etc.  Any valid CSS style should work.
     *          - removeStyle - often used in conjunction with the cssClass property to temporarily remove the
     *                      original highlight color/fill.  This allows you to specify a custom color for the located
     *                      asset.  The original highlight will reappear if you locate a different asset, preserving
     *                      the highlighted information.
     *          - zoomFactorForLocate  - allows you to control the depth in which to zoom in to a found asset
     * @param locator   locator object
     */
    findAssets: function (ids, opts, locator) {
        var self = this,
            svg = self.getSvg(locator.divId);

        if (svg.empty()) {
            return {bFound: false, message: '', ids: ids};
        }

            //defaultView = d3.select('#' + locator.divId + '-svg view[id=defaultView]'),
         var cssClass = (opts && opts.cssClass) ? opts.cssClass : "zoomed-asset-default",
            mirror = svg.selectAll("#mirror").node().transform.baseVal.getItem(0).matrix.d,
            zoomFactor = (opts && opts.hasOwnProperty('zoomFactor')) ? Number(opts.zoomFactor) : 5,
            msg = '',
            bFound = true,
            asset,
            xs = [],
            ys = [], assetId, x = null, y = null;

        var viewBox = this.getViewBox(locator.divId);

        Ext.each(ids, function(id) {
            // convert id's if necessary
            assetId = self.retrieveValidSvgAssetId(id);
            asset = self.getAssetById(assetId);

            if ((asset === '') || asset.empty()) {
                bFound = false;
                msg += ' ' + id;
            } else {
            	// turn off cluster
                if (!asset.select(".splotch").empty()) {
                	asset.style("display", "");
                }
                
            	var centroid = self.getCentroid(asset);

                if (!asset.select(".marker").empty()) {
                    var t = d3.transform(asset.attr("transform"));
                	centroid = t.translate;
                }
               
                x = Number(centroid[0]);
                y = Number(centroid[1]);

                if (x && y) {
                    xs.push(x);
                    ys.push(y);

                    locator.lastFoundElements.push(asset);
                    locator.lastFoundClasses.push(asset.attr("class"));
                    locator.lastFoundStyles.push(asset.attr("style"));

                    //asset.classed({cssClass: true });
                    asset.attr("class", asset.attr("class") + ' ' + cssClass);
                    if (opts && opts.removeStyle === true) {
                        asset.attr("style", "");
                    }
                    asset.node().parentNode.appendChild(asset.node());
                }
            }
        });

        var zoomVector, zoomFactor;
        var clusterControl = self.getAddOn('Cluster');
        if (ids.length === 0) {
            bFound = false;
            this.zoomExtents(locator.divId);
        } else if (ids.length === 1) {
            if (!asset.empty()) {             
                if (zoomFactor == 0) {
                	this.zoomExtents(locator.divId);               	
                } else {
                    // handle splotch
                	var bBox = (!asset.select(".splotch").empty()) ? asset.select(".splotch").node().getBBox() : self.getBBox(asset);
                	                    
                    zoomVector = [zoomFactor * bBox.width, zoomFactor * bBox.height];

                    viewBox[0] = Math.round(x - (zoomVector[0] / 2));
                    viewBox[1] = Math.round(mirror * y - ( zoomVector[1] / 2));
                    viewBox[2] = Math.round(zoomVector[0]);
                    viewBox[3] = Math.round(zoomVector[1]);

                    svg.transition().duration(600).attr("viewBox", viewBox)
                    .each("end", function(){
                        if (clusterControl) {  
                        	svg.call(clusterControl.zoom);
                        }
                    });
                }
            }
        } else if (locator.lastFoundElements.length > 0) {
            // don't apply zoomFactor when searching multiple
            // zoomFactor = 1;       
            if (zoomFactor == 0) {
            	this.zoomExtents(locator.divId);        	
            } else {
                var left = Math.min.apply(Math, xs);
                var right = Math.max.apply(Math, xs);
                var top = Math.max.apply(Math, ys);
                var bottom = Math.min.apply(Math, ys);

                var hBBox = self.getBBox(locator.lastFoundElements[xs.indexOf(left)]).width + self.getBBox(locator.lastFoundElements[xs.indexOf(right)]).width;
                var vBBox = self.getBBox(locator.lastFoundElements[ys.indexOf(top)]).height + self.getBBox(locator.lastFoundElements[ys.indexOf(bottom)]).height;
                var hDistance = Math.abs(Math.round(self.difference(left, right)));
                var vDistance = Math.abs(Math.round(self.difference(top, bottom)));
                zoomVector = [(hDistance + zoomFactor * (hBBox)), vDistance + (zoomFactor * vBBox)];

                viewBox[0] = Math.round(Math.round(self.avg(left, right)) - (zoomVector[0] / 2));
                viewBox[1] = Math.round(mirror * Math.round(self.avg(top, bottom)) - ( zoomVector[1] / 2));
                viewBox[2] = Math.round(zoomVector[0]);
                viewBox[3] = Math.round(zoomVector[1]);

                svg.transition().duration(600).attr("viewBox", viewBox)
                .each("end", function(){
                    if (clusterControl) {  
                    	svg.call(clusterControl.zoom);
                    }
                });
            }
        }

        return {bFound: bFound, message: msg, ids: ids};
    },

    /**
     * "Clear" highlights for previously found assets
     * @param locator Object
     */
    clearFoundAssets: function (locator) {
        // insert the previous class and style
        for (var i = locator.lastFoundElements.length - 1; i >= 0; i--) {
            var lastShownElement = locator.lastFoundElements.pop();
            lastShownElement.attr("class", locator.lastFoundClasses.pop());
            lastShownElement.attr("style", locator.lastFoundStyles.pop());
        }
    },

    /**
     * Creates and return an svg.
     * @param div       (selection) Div to hold the svg
     * @param width     (number)  Width of the image
     * @param height    (number)  Height of the image
     * @returns {*}     (selection) svg
     */
    createSvg: function(div, width, height) {
    	
    	// remove the existing svg with the same id.
    	if (!div.select('#' + this.divId + "-svg").empty()) {
            div.select('#' + this.divId + "-svg").remove();
        }
    	
        var svg = div.append("svg")
            .attr("version", "1.1")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("xmlns:xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("width", width)
            .attr("height", height)
            .attr("id", this.divId + "-svg")
            .attr("viewBox", "0 0 " + width + " " + height);

        svg.append("style");
        svg.append("defs");

        var viewer = svg.append("g")
            .attr("id", "viewer");

        var mirror = viewer.append("g")
            .attr("id", "mirror")
            .attr("stroke-width", "0.9%")
            .attr("transform", "scale(1, 1)");

        mirror.append("g")
            .attr("id", "background")
            .attr("fill", "none");

        mirror.append("g")
            .attr("id", "assets")
            .attr("fill", "none");

        return svg;
    },

    /**
     * Load an image into div.
     * @param div       (selection) Div to hold the image.
     * @param href      (string)    URL for the image.
     */
    loadImage: function(div, href) {
        var control = this;

        if (!div.select('#' + div.attr("id") + "-svg").empty()) {
            div.select('#' + div.attr("id") + "-svg").remove();
        }

        var img = new Image();
        img.onload = function () {
            var svg = control.createSvg(div, this.width, this.height);
        	var g = svg.select("#background").append("g");

            // create image
            g.append("image")
                .attr("id", div.node().id + "_image")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", '100%')
                .attr("height", '100%')
                .attr("xlink:xlink:href", href)
                .html(".");
        };
    	img.src = href;
    },   
  
    /**
     * Detect if IE
     * @returns {Number}
     */
    isIE: function() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') !== -1) ? parseInt(myNav.split('msie')[1]) : false;
    },

    /**
     * Detect is modern browser
     * @returns {boolean}
     */
    isModernBrowser: function() {
        return (this.isIE () > 9 || !this.isIE());
    },

    isNativeAndroid: function() {
    	var nua = navigator.userAgent;
    	var isAndroid = ((nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1) && !(nua.indexOf('Chrome') > -1));
    	return isAndroid;
    }
});


(function() {

	var vendor = (function(p) {
	  var i = -1, n = p.length, s = document.documentElement.style;
	  while (++i < n) if (p[i] + "Transform" in s) return p[i].toLowerCase();
	})(["webkit", "ms", "Moz", "O"]);

	var prefix = vendor ? "-" + vendor.toLowerCase() + "-" : "",
	    use3d = vendor && vendor + "Perspective" in document.documentElement.style;
	
	var modernBrowser = isModernBrowser();

	this.viewBoxZoom = viewBoxZoom;

	function viewBoxZoom() {
	  var event = d3.dispatch("zoomstart", "zoom", "zoomend");

	  function viewBoxZoom(svg) {
	    svg
	        //.style(prefix + "transform-origin", "0 0")
	        //.style(prefix + "backface-visibility", "hidden")
	        .each(zoomable);
	    
        if (modernBrowser) {
            svg.style(prefix + "transform-origin", "0 0")
                .style(prefix + "backface-visibility", "hidden");
        }
	  }

	  return d3.rebind(viewBoxZoom, event, "on");

	  function zoomable() {
	    var that = this,
	        svg = d3.select(that),
	        w = d3.select(window),
	        drag = false,
	        dx0 = 0,
	        dy0 = 0,
	        scale0 = this.getScreenCTM().a,
	        zoom = d3.behavior.zoom()
	          .on("zoomstart", function() { event.zoomstart.call(that); })
	          .on("zoom", function() {
	            if (drag) {
	              if (modernBrowser) {	
		              svg.style(prefix + "transform", "translate3d(" +
		                  Math.floor(d3.event.translate[0] - dx0 * d3.event.scale) + "px," +
		                  Math.floor(d3.event.translate[1] - dy0 * d3.event.scale) + "px,0)" +
		                  "scale3d(" + d3.event.scale + "," + d3.event.scale + ",1)");
	              }
	              event.zoom.call(that, d3.event.scale * scale0);
	            } else {
	              svg.call(viewBox);
	              event.zoom.call(that, scale0);
	            }
	          })
	          .on("zoomend", function() { event.zoomend.call(that, scale0); });

	    svg.call(viewBox);

	    d3.select(this.parentNode)
	        .on("touchstart.viewboxzoom", touchstart)
	        .on("mousedown.viewboxzoom", mousedown)
	        .call(zoom)
	        .call(zoom.event);

	    function touchstart() {
	      // Work around a strange issue in Android 4.1.x, where subsequent touch
	      // events are fired with a null "touches" property, probably due to native
	      // scrolling being triggered.
	      //d3.event.preventDefault();
	      drag = true;
	      w
	          .on("touchend.viewboxzoom", function() {
	            var touchById = {},
	                touches = d3.event.touches,
	                changed = d3.event.changedTouches;
	            for (var i = 0, n = changed.length; i < n; ++i) touchById[changed[i].identifier] = i;
	            for (var i = 0, n = touches.length; i < n; ++i) if (!touchById[touches[i].identifier]) return;
	            w.on("touchend.viewboxzoom", null);
	            svg.call(viewBox);
	          });
	    }

	    function mousedown() {
	      drag = true;
	      w
	          .on("mouseup.viewboxzoom", function() {
	            drag = false;
	            w.on("mouseup.viewboxzoom", null);
	            svg.call(viewBox);
	          });
	    }

	    function viewBox(svg) {
	      var t = zoom.translate(),
	          s = zoom.scale(),
	          box = svg.attr("viewBox").split(/[\s,]/g).map(Number),
	          // See https://bugzilla.mozilla.org/show_bug.cgi?id=874811
	          w = svg.node().clientWidth || +svg.style("width").replace(/px$/, ""),
	          h = svg.node().clientHeight || +svg.style("height").replace(/px$/, ""),
	          p = box[2] / w,
	          q = box[3] / h,
	          r = Math.max(p, q);

	      box[0] = box[0] - (t[0] - dx0) * r / s;
	      box[1] = box[1] - (t[1] - dy0) * r / s;
	      box[2] /= s;
	      box[3] /= s;

	      svg
	          .attr("viewBox", box);
	      
          if (modernBrowser) {
              svg.style(prefix + "transform", "translate3d(0, 0, 0)");
          }

	      // If preserveAspectRatio == "xMidYMid".
	      dx0 = q > p && .5 * (w - s * box[2] / q);
	      dy0 = p > q && .5 * (h - s * box[3] / p);

	      zoom.translate([dx0, dy0]).scale(1);
	      scale0 *= s;
	    }
	  }
	}

    function isIE() {
        var myNav = navigator.userAgent.toLowerCase();
        return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }

    function isModernBrowser() {
        return (isIE () > 9 || !isIE());
    }
    
	})();

