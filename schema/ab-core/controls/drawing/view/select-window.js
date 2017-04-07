Drawing.namespace("view");

/**
 * Display a semi-transparent red selection box when user click-drag-drop across the drawing
 * 
 */
Drawing.view.SelectWindow = Base.extend({
	
	selectDiv: null,
	
	start: {},

	config: null,
	
	drawingController: null,
	
	assetBBoxMap: {},
	
	constructor: function (config) {
		this.config = config;
		
		this.config.assetType = (typeof config.assetType !== 'undefine' && config.assetType ? config.assetType : "rm");
		
		this.assetBBoxMap = {};
		
		this.remove();
	},

	 /**
     * set reference to drawingController
     */
    setDrawingController: function(drawingController){
    	
    	this.drawingController = drawingController;
    
    	
    	this.popluateAssetBBoxMap();
    },
    
    popluateAssetBBoxMap: function(){
    
    	var selectWindowController = this;
    	var assetTypes = this.config.assetType.split(';');
		for(var i = 0; i < assetTypes.length; i++){
			var assetGroup = assetTypes[i] + "-assets";
            d3.selectAll("#" + assetGroup).selectAll('*').filter( function() { return this.parentNode.id === assetGroup; } )
            	.each(function () {
	            	selectWindowController.addAssetToBboxMap(this);
	            });
		}
    },
    
    addAssetToBboxMap: function(self){
    	var asset = d3.select(self);
        var assetController = this.drawingController.getController("AssetController"); 
        var assetId = assetController.retrieveValidAssetId(self.id);
        var assetNode = asset.node();
        if(assetNode.nodeName == 'use'){
    		assetId = assetId + "-rect";
    		var rect = assetController.getAssetById(this.config.divId, assetId);
    		if(d3.select(rect.node()).empty()){
    			assetController.patchBackgroundForUseElement(asset);
    			rect = assetController.getAssetById(this.config.divId, assetId);
    		} 
    		asset = rect;
    	}
        var bbox = assetController.getBBox(asset);
        if(bbox)
        	this.assetBBoxMap[assetId] = bbox;
    },
    
    onAssetsSelected: function(){
    	var selectedAssets = [];
    	
    	var selectBox = {
                x1	: parseInt(this.selectDiv.style("left").replace('px', '')),
                y1  : parseInt(this.selectDiv.style("top").replace('px', '')),
                x2  : parseInt(this.selectDiv.style("left").replace('px', '')) + parseInt(this.selectDiv.style("width").replace('px', '')),
                y2  : parseInt(this.selectDiv.style("top").replace('px', '')) + parseInt(this.selectDiv.style("height").replace('px', ''))
            };
    	
    	for (var assetId in this.assetBBoxMap) {
    		if (this.assetBBoxMap.hasOwnProperty(assetId) && this.isAssetWithinBox(assetId, selectBox)) {
    			selectedAssets.push(assetId);
    		}
    	}
    	
    	// highlight selected asset
    	if(selectedAssets && selectedAssets.length > 0){
   			this.drawingController.getController("SelectController").highlightSelectedAssets(selectedAssets);	
    	}
    	
    	if(this.config.customEvent){
    		this.config.customEvent(selectedAssets, this.drawingController);
    	}
    },
    
    /**
     * checks if the specified asset is within a selection box
     */
    isAssetWithinBox: function(assetId, selectBox) {

    	  var asset = this.drawingController.getController("AssetController").getAssetById(this.config.divId, assetId);
    	  
    	  if(!asset.node())
    		  return false;
    	  
    	  var matrix = asset.node().getScreenCTM(),
    	  		bbox = this.assetBBoxMap[assetId];

    	  var assetX = (matrix.a * (bbox.x)) + (matrix.c * (bbox.y)) + matrix.e,
	      	  assetY = (matrix.b * (bbox.x)) + (matrix.d * (bbox.y)) + matrix.f,
	      	  width  = matrix.a * bbox.width,
	      	  height = matrix.b * bbox.height;
    	  
    	  var elementBBox = {};
    	  elementBBox.p1 = {x: assetX, y: assetY};
    	  elementBBox.p2 = {x: assetX, y: assetY + height};
    	  elementBBox.p3 = {x: assetX + width, y: assetY + height};
    	  elementBBox.p4 = {x: assetX + width, y: assetY};

          return this.isInsideSelectionBox(elementBBox, selectBox);
    },
    
    isInsideSelectionBox: function(bbox, selectionBox){
        var inside = false;
        
        //check if any of the 4 corners or center is within selection box.
        if(bbox.p1.x >= selectionBox.x1 && bbox.p1.x <= selectionBox.x2 && bbox.p1.y >= selectionBox.y1 && bbox.p1.y <= selectionBox.y2){
                inside = true;
        }else if(bbox.p2.x >= selectionBox.x1 && bbox.p2.x <= selectionBox.x2 && bbox.p2.y >= selectionBox.y1 && bbox.p2.y <= selectionBox.y2){
                inside = true;
        }else if(bbox.p3.x >= selectionBox.x1 && bbox.p3.x <= selectionBox.x2 && bbox.p3.y >= selectionBox.y1 && bbox.p3.y <= selectionBox.y2){
                inside = true;
        }else if(bbox.p4.x >= selectionBox.x1 && bbox.p4.x <= selectionBox.x2 && bbox.p4.y >= selectionBox.y1 && bbox.p4.y <= selectionBox.y2){
                inside = true;
        }

        return inside;
    },

    create: function(mouseX, mouseY){

    	this.selectDiv = d3.select("body").append("div")   
    						.attr("class", "svgSelectWindow")
    						.style("left", mouseX + "px")     
							 .style("top", mouseY + "px")
							 .style("width", "0px")
							 .style("height", "0px")
							 .style("opacity", 0);
    },
    
    update: function(mouseX, mouseY){
    	
    	if(!this.selectDiv || this.selectDiv.empty()){
    		this.create(mouseX, mouseY);
    	} else {
    		var d = {
	                x       : this.selectDiv.style("left").replace('px', ''),
	                y       : this.selectDiv.style("top").replace('px', ''),
	                width   : this.selectDiv.style("width").replace('px', ''),
	                height  : this.selectDiv.style("height").replace('px', '')
	            },
	            move = {
	                x : mouseX - d.x,
	                y : mouseY - d.y
	            };

	        if( move.x < 1 || (move.x*2<d.width)) {
	            d.x = mouseX;
	            d.width -= move.x;
	        } else {
	            d.width = move.x;       
	        }

	        if( move.y < 1 || (move.y*2<d.height)) {
	            d.y = mouseY;
	            d.height -= move.y;
	        } else {
	            d.height = move.y;       
	        }
    		this.selectDiv.style("left", d.x + "px")     
					  .style("top", d.y + "px")
					  .style("width", d.width + "px")
					  .style("height", d.height + "px")
					  .style("opacity", 0.9);
    	}
    },
    
    remove: function(){
    	d3.selectAll("div.svgSelectWindow").remove();  
    	this.selectDiv = null;
    }
}, {});