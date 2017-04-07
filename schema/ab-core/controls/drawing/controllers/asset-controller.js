/**
 * Controller to handle basic asset functionality.
 * 
 * Used by both Desktop and Mobile
 */
AssetController = Base.extend({

	config: {},

	constructor: function(config){
		this.config = config;
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
	 * Return a d3 compatible object
	 * @param assetId
	 * @return elem selection
	 */
	getAssetById: function (divId, assetId) {
	    // search within div in the case of multiple divs
	    var elem = this.getSvg(divId).node().getElementById(assetId);
	    
	    if(!elem){
	    	elem = this.getSvg(divId).node().getElementById(this.retrieveValidSvgAssetId(assetId));
	    }
	    return d3.select(elem);
	},

	/**
	 * Return center point of a selection as [x,y]
	 * @param selection
	 */
	getCentroid: function (selection) {
	    var bBox = this.getBBox(selection);
	    var scaleX = 1, 
	    	scaleY = 1;
	    
	    var xforms = selection.node().getAttribute('transform');
	    var parts  = /scale\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xforms);

	    if(typeof parts === 'undefined' || parts == null){
	    	//For IE browser, we use tranform to retrieve the scale value.
	    	xforms = selection.node().transform.baseVal; // An SVGTransformList
	    	if(xforms && xforms.numberOfItems > 0){
	    		var firstXForm = xforms.getItem(0);       // An SVGTransform
	    	
		    	if (firstXForm && firstXForm.type == SVGTransform.SVG_TRANSFORM_SCALE){
		    		scaleX = ((firstXForm.matrix.a != 0) ? firstXForm.matrix.a : 1);
		    		scaleY = ((firstXForm.matrix.d != 0) ? firstXForm.matrix.d : scaleX);
		    	}
	    	} else {
	    		// kb#3052520 - no transform info available at all - use bbox
	    		return [(bBox.x + bBox.width / 2)*scaleX, (bBox.y + bBox.height / 2)*scaleY];
	    	}
	    } else {
	    	scaleX = ((parts[1] && parts[1] > 0) ? parts[1] : 1);
	    	scaleY = ((parts[2] && parts[2] > 0) ? parts[2] : scaleX);
	    }
	    
	    return (selection.attr("x") && selection.attr("y")) ? [selection.attr("x")*scaleX, selection.attr("y")*scaleY] :
		        [(bBox.x + bBox.width / 2)*scaleX, (bBox.y + bBox.height / 2)*scaleY];
	},

	/**
	 * retrieve the center point of the specified asset
	 */
	getCentroidById: function(divId, assetId){
		
		var index = assetId.indexOf("-rect");
		
		// is the asset type of <use>?
		if(index > -1 && index == (assetId.length-5)){
			assetId = this.getOriginalAssetId(assetId);
		}
		
		//KB# 3052520.  Trace assets line sometimes goes off the edge of the drawing.
		var asset = this.getAssetById(divId, assetId);
		var insX = asset.attr("insx");
		var insY = asset.attr("insy");
		
		// for <use> element, retrieve the insX and insY directly
		if(typeof insX !== 'undefined' && insX !== null && typeof insY !== 'undefined' && insY !== null){
			return [insX, insY];
		} else {
			return this.getCentroid(this.getAssetById(divId, assetId));
		}
	},

	/**
	 * retrieves the asset's original id.
	 *
	 * For asset with <use>, we check if the it contains '-rect' at the end, if so, strip it and return the orginal id.
	 * For other asset, return as it is.
	 * 
	 */
	getOriginalAssetId: function(assetId){
		var index = assetId.length-5;
		if(index > -1 && assetId.indexOf("-rect")==index)
			return assetId.substring(0, index);
		else
			return assetId;
	},

	/**
	 * Return the bBox of selection
	 * @param selection
	 * @return elem.getBBox()
	 */
	getBBox: function (selection, bBoxOption) {
	    var elem = selection.node();
	    var bBox = null;
	    var bBoxFound = true;
    	var bBoxWidth = (bBoxOption && bBoxOption.width ? bBoxOption.width : 20);
    	var bBoxHeight= (bBoxOption && bBoxOption.height ? bBoxOption.height : 20);
	    try{
	    	bBox = elem.getBBox();
	        // for chrome, no exception throw but x/y/width/height are all 0.
	    	if(typeof bBox === 'undefined' || bBox == null || bBox.width == 0 || bBox.height == 0){
	    		bBoxFound = false;
	    	} else {
	    		//for ie
	    		if(bBox && bBox.width > 0){
	    			bBoxWidth = bBox.width;
	    		}
	    		if(bBox && bBox.height > 0){
	    			bBoxHeight = bBox.height;
	    		}
	    		
	    		if(typeof elem.x != 'undefined' && typeof elem.y != 'undefined'){
	    			var msie = window.navigator.userAgent.indexOf('MSIE ');
	    			if (msie > 0) {
	    				bBox = {'x': elem.x.baseVal.value + bBox.x, 'y': elem.y.baseVal.value + bBox.y, 'width': bBoxWidth, 'height': bBoxHeight};
	    			} else if (Math.abs(elem.x.baseVal.value) > Math.abs(bBox.x)*2 || Math.abs(elem.y.baseVal.value) > Math.abs(bBox.y)*2){
						bBox = {'x': elem.x.baseVal.value + bBox.x, 'y': elem.y.baseVal.value + bBox.y, 'width': bBoxWidth, 'height': bBoxHeight};
					} 
	    		}
	    	 }
	    } catch(e){
			bBoxFound = false;
	    }
	    
		//some asset could not find BBox, we need to create our own box for it.
	    // some asset is not valid, thus elem.x or elem.y is null - do not include them. 
	    if(!bBoxFound &&  typeof elem.x != 'undefined' && typeof elem.y != 'undefined'){
	    	bBox = {'x': elem.x.baseVal.value-bBoxWidth/2, 'y': elem.y.baseVal.value-bBoxHeight/2, 'width': bBoxWidth, 'height': bBoxHeight};
	    }

	    return bBox;
	},


	/**
	 * add a background rectangle element for <Use> element.
	 * set the style the same as that of <use> element
	 * @return true if <rect> element is patched, false if it already exists.
	 */
	patchBackgroundForUseElement: function(asset, bBox){
		var assetNode = asset.node();
 		var rectId = assetNode.id + "-rect";
 		var rect = this.getAssetById(this.config.divId, rectId);
 		var patched = false;
 		
		if(d3.select(rect.node()).empty()){
			var parsedBox = this.getBBox(asset, bBox);
	    	d3.select(assetNode.parentNode)
    			.append("rect")
    			.attr("id", rectId)
    			.attr("class", "background")
    			.attr("x", parsedBox.x)
    			.attr("y", parsedBox.y)
    			.attr("width",  parsedBox.width)
    			.attr("height",  parsedBox.height)
    			.attr("transform", d3.select(assetNode).attr("transform"))
    			.attr("style", d3.select(assetNode).attr("style"));
	    	
	    	patched = true;
		} 

		return patched;
 	},
 	
 	
 	/**
 	 * loop through all <use> elements in current svg and patch a rectangle background for each of the <use> elements.
 	 * set the background style of <rect> element the same as the <use> element.
 	 * @highlightOnly true if only patch for highlighted element, false to patch for all <use> element.
 	 *  
 	 */
 	patchBackgroundForUseElements: function(highlightOnly){
 		
 		var svg = this.getSvg(this.config.divId);
 		var self = this;
		d3.select(svg.node()).selectAll("use")
							 .filter(function(){return (highlightOnly ? (d3.select(this).attr("highlighted") == 'true') : true)})
							 .each(function () {
								 	self.patchBackgroundForUseElement(d3.select(this));
							 	   });
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
	}
}, {});