/**
 * Controller to handle the highlight and trace assets.
 * 
 * Used in both Desktop and Mobile.
 */

HighlightController = Base.extend({

	config: {},
	
	/**
	 * highlighted asset map with asset ids as key and fill options:
	 *     defaultColor: the initial color when drawing is loaded before any highlighting/selecting. (used for reset)
	 *     color:		 the current highlight color
	 *     previousColor: the previous highlight color (used to go back to old color during unselect)
	 *     persistFill:   Can fill be changed by mouseover event? true - mouseover can not overwrite it, false otherwise.
	 *     overwriteFill: will overwrite the existing color in highlight/select? true if yes, false otherwise.                   
	 *     
	 * {id1: {defaultColor: 'color0',
	 *        color: 'color1',
	 *        previousColor: 'color2',
	 *        persistFill: true/false,
	 *        overwriteFill: true/false
	 *        },
	 *  id1: {defaultColor: 'color0',
	 *        color: 'color1',
	 *        previousColor: 'color2',
	 *        persistFill: true/false,
	 *        overwriteFill: true/false
	 *        },
	 *  ...
	 *  }       
	 *        
	 */
	highlightedAssets: {},
	
	/**
	 * record the missing assets for trace and highlight
	 */
	missingAssets: {trace: {assetFrom: [], assetTo: []}, 
		  			highlight: {assets: []}},
	
    /**
     * reference to drawing controller
     */ 
	drawingController: null,
		  			
		  		    
	constructor: function(config){
		this.config = config;
		
		this.resetMissingAssets();
	},


	/**
     * set reference to drawingController
     */
	setDrawingController: function(drawingController){
	   	this.drawingController = drawingController;
	},
	
	/**
	 * Highlight a set of assets with asset ids as key along with their fill options in JSON format.
	 * 
	 * Example: {'45197': {color: 'blue', persistFill: true, overwriteFill: true},
			   '45198': {color: 'blue', persistFill: true, overwriteFill: true},
			   '45199': {color: 'blue', persistFill: true, overwriteFill: true}}
	 * 
	 */
	highlightAssets: function(assetsData){
		var numHighlighted = 0;
		for (var key in assetsData) {
			  if (assetsData.hasOwnProperty(key)) {
				  var highlighted = this.highlightAsset(key, assetsData[key]);
				  if(highlighted)
					  numHighlighted++;
			  }
		}
		return numHighlighted;
	},
	
	/**
	 * highlight and draw a line between two assets with the specified color
	 */
	traceAssets: function(assetIdFrom, assetIdTo, color){
		
		var assetController = this.drawingController.getController("AssetController");
		var validAssetIdFrom = assetController.retrieveValidSvgAssetId(assetIdFrom);
        var assetFrom = assetController.getAssetById(this.config.divId, validAssetIdFrom);

        if (!assetFrom || d3.select(assetFrom.node()).empty()) {
       		this.missingAssets['trace']['assetFrom'].push(validAssetIdFrom);
			return;
        }  
        
        var validAssetIdTo = assetController.retrieveValidSvgAssetId(assetIdTo);
        var assetTo = assetController.getAssetById(this.config.divId, validAssetIdTo);

        if (!assetTo || d3.select(assetTo.node()).empty()) {
       		this.missingAssets['trace']['assetTo'].push(validAssetIdTo);
			return;
        }
        
        // set a default if color is not defined
		if(typeof color === 'undefined' || color == null){
			color = 'blue';
        }

        var centroidFrom = assetController.getCentroidById(this.config.divId, validAssetIdFrom);
        var centroidTo = assetController.getCentroidById(this.config.divId, validAssetIdTo);

        var traceId = "trace-"+validAssetIdFrom + "-" +validAssetIdTo;
         d3.select(assetFrom.node().parentNode)
         	 .append("line")
	         .attr("class", "trace-line")
	         .attr("style", "stroke:"+color)
	         .attr("id", traceId)
	         .attr("x1", centroidFrom[0])
	         .attr("y1", centroidFrom[1])
	         .attr("x2", centroidTo[0])
	         .attr("y2", centroidTo[1]);

   		this.highlightAsset(validAssetIdFrom, {'color': color, 'persistFill': true, 'overwriteFill' : true});
   		this.highlightAsset(validAssetIdTo, {'color': color, 'persistFill': true, 'overwriteFill' : true});
	},
	
	/**
	 * retrieve all the assets that are not found by trace or highlight.
	 * @type type of action, can be 'trace', 'highlight', or not specified (all will be retrieved).
	 * return the missing assets in JSON format of:
	 * 			 {trace: {assetFrom: [], 
	 * 					  assetTo: []}, 
	 *	  		  highlight: {assets: []}
	 *	  		  },
	 */
	getMissingAssets: function(type){
		if(type === 'trace'){
			return this.missingAssets['trace'];
		} else if(type === 'highlight'){
			return this.missingAssets['highlight'];
		} else {
			return  this.missingAssets;
		}
	},

	/**
	 * reset the JSON map for the missing assets of the specified type.
	 * @type type of action, can be 'trace', 'highlight', or not specified (all will be retrieved).
	 */
	resetMissingAssets: function(type){
		if(type == 'trace'){
			this.missingAssets['trace'] = {assetFrom: [], assetTo: []};
		} else if(type == 'highlight'){
			this.missingAssets['highlight'] = {assets: []};
		} else {
			this.missingAssets = {trace: {assetFrom: [], assetTo: []}, 
								  highlight: {assets: []}};
		}
	}, 
	
	/**
	 * highlight all assets of the specified type.
	 * 
     * @assetType the specified asset's type, such as eq..
     * @options fill options such as defaultColor, color, prevColor, persistFill, overwriteFill etc.
	 */
	highlightAssetsByType: function(assetType, options){
		 var assetGroup = assetType + "-assets";

		 var self = this;
		 var numHighlighted = 0;
         d3.selectAll("#" + assetGroup)
         		.selectAll('*')
         		.filter( function() { return this.parentNode.id === assetGroup; } )
	            .each(function () {
	    			var highlighted = self.highlightAsset(this.id, options);
	    			var index = this.id.indexOf("-rect");
	    			// do not count the <use> asset's patch element <rect>
	    			if(highlighted && (index == -1 || index !== (this.id.length-5)))
	    				numHighlighted++;
	            });
         return numHighlighted;
	},
	
    /**
     * highlight asset with the specified fill options.
     * 
     * @assetId the specified asset's id.
     * @options fill options such as defaultColor, color, prevColor, persistFill, overwriteFill, ignorePersistFill etc.
     */
	highlightAsset: function(assetId, options){
		
		var assetController = this.drawingController.getController("AssetController");
		var asset = assetController.getAssetById(this.config.divId, assetId);
		var assetNode = asset.node();
		
		//does asset exist in the drawing?
		if(!assetNode || d3.select(assetNode).empty()){
       		this.missingAssets['highlight']['assets'].push(assetId);
			return false;
		}
		
		// for asset with 'use', we highlight the background rectangle instead
		if(assetNode.nodeName == 'use'){
			assetId = assetId + "-rect";
			var rect = this.drawingController.getController("AssetController").getAssetById(this.config.divId, assetId);
			if(d3.select(rect.node()).empty()){
				this.drawingController.getController("AssetController").patchBackgroundForUseElement(asset);
				rect = this.drawingController.getController("AssetController").getAssetById(this.config.divId, assetId);
    		}
			assetNode = rect.node();
		}
		
		if(!this.highlightedAssets[assetId]){
			this.highlightedAssets[assetId] = {};
		} 

		if(this.highlightedAssets[assetId].persistFill){
			// check if the fill can be overwrite
			if(typeof options.overwriteFill === 'undefined' || options.overwriteFill == null){
				return false;
			}
		}
		
		var defaultColor = this.highlightedAssets[assetId]['defaultColor'];
		if(typeof defaultColor === 'undefined' || defaultColor == null){
			this.highlightedAssets[assetId]['defaultColor'] = d3.select(assetNode).style("fill");
		}
		this.highlightedAssets[assetId]['previousColor'] = d3.select(assetNode).style("fill");
		
		if(typeof options.color === 'undefined' || options.color === null){
			options.color = this.drawingController.getController("SelectController").formatColor(this.config.defaultConfig.highlights.selected.fill.color, true);
		}

		d3.select(assetNode)
			.style("fill", options.color)
			.style("stroke-opacity", 1)
			.style("fill-opacity", 0.7);
		this.highlightedAssets[assetId]['color'] = options.color;
		
		// set the persist fill so that the mouse event will not overwrite the asset highlight
		if(typeof options.persistFill !== 'undefined' && options.persistFill != null){
			this.highlightedAssets[assetId].persistFill = options.persistFill;
		}
		
		// ignore the persist fill so that the mouse event will not clear the specified asset highlight
		if(typeof options.ignorePersistFill !== 'undefined' && options.ignorePersistFill != null){
			this.highlightedAssets[assetId].ignorePersistFill = options.ignorePersistFill;
		}
		
		return true;
	},

	/**
	 * clear all highlighted assets' color and restore to their default color when the drawing is loaded.
	 * remove all the trace line and their linked highlighted assets.
	 */
	resetAll: function(){
		//clear all the asset highlight
		for (var assetId in this.highlightedAssets) {
			  if (this.highlightedAssets.hasOwnProperty(assetId)){
				  if(this.highlightedAssets[assetId].hasOwnProperty('color') && this.highlightedAssets[assetId]['color']) {
						this.resetAsset(assetId);
				  }
			  }
		}

	
		//remove all the trace lines
		d3.selectAll(".trace-line").remove();

	},
	
	/**
	 * reset the specified asset color to its default color, remove it from the highlighted asset map.
	 * 
	 * @assetId the specified asset's id.
	 */
	resetAsset: function(assetId){
		if(this.highlightedAssets && this.highlightedAssets[assetId]){
			var asset = this.drawingController.getController("AssetController").getAssetById(this.config.divId, assetId);
			d3.select(asset.node()).style("fill", this.highlightedAssets[assetId].defaultColor);
			delete this.highlightedAssets[assetId];
		}
	},
	
	/**
	 * clear all assets of the specified type.
	 * 
     * @assetType the specified asset's type, such as eq..
     * @options fill options such as persistFill, overwriteFill etc.
	 */
	clearAssetsByType: function(assetType, options){
		 var assetGroup = assetType + "-assets";

		 var self = this;
         d3.selectAll("#" + assetGroup)
         		.selectAll('*')
         		.filter( function() { return this.parentNode.id === assetGroup; } )
	            .each(function () {
	    			self.clearAsset(this.id, options);
	            });
	},
	
    /**
     * Clears a set of assets highlight.
     * @assetIds an array of assets
     * @options the fill option for the specified asset.
     */
	clearAssets: function(assetIds, options){
		for(var i = 0 ; i < assetIds.length; i++){
			this.clearAsset(assetIds[i], options);
		}
	},
	
	
	/**
     * clear the specified asset's fill.
     * 
     * @assetId the specified asset's id.
     * @options the fill option for the specified asset.
     */
	clearAsset: function(assetId, options){
		
		var asset = this.drawingController.getController("AssetController").getAssetById(this.config.divId, assetId);
		
		// for asset with 'use', we highlight the background rectangle instead
		if(asset && asset.node() && asset.node().nodeName == 'use'){
			assetId = assetId + "-rect";
			asset = this.drawingController.getController("AssetController").getAssetById(this.config.divId, assetId);
		}
		
		if(!this.highlightedAssets[assetId]){
			this.highlightedAssets[assetId] = {};
		} 
		
		// set the persist fill so that the mouse event will not overwrite the asset highlight
		if(typeof options !== 'undefined' && options != null && typeof options.persistFill !== 'undefined' && options.persistFill != null){
			this.highlightedAssets[assetId].persistFill = options.persistFill;
		}
				
		// do not clear if the fill is persist, or use does not wants to clear the persist fill (in trace command)
		if (!asset || d3.select(asset.node()).empty() || this.highlightedAssets[assetId].persistFill || this.highlightedAssets[assetId].ignorePersistFill) {
			return;
		}
		
		//restore to previous color, if any.
		var prevColor = null;
		if(this.highlightedAssets[assetId] && this.highlightedAssets[assetId]['previousColor']){
			prevColor = this.highlightedAssets[assetId]['previousColor'];
			this.highlightedAssets[assetId]['color'] = prevColor;
			if(this.highlightedAssets[assetId]['previousColor'] != this.highlightedAssets[assetId]['defaultColor']){
				this.highlightedAssets[assetId].persistFill = true;
			}
			
			delete this.highlightedAssets[assetId]['previousColor'];
		} 
		
       	d3.select(asset.node()).style("fill", prevColor);
	}
}, {});