/**
 * Controller to handler the asset selection.
 * 
 * Used by both Desktop and Mobile.
 */
SelectController = Base.extend({

	config: {},
	
	/**
	 * reference to drawingController
	 */
	drawingController: null,
	
	/**
	 * a set of selected asset ids.
	 */
	selectedAssets: [],
	
	/**
	 * true to allows multiple asset selection, false otherwise.
     */
	multipleSelectionOn: false,
	
	constructor: function(config){
		this.config = config;
		
		/**
		 * Can asset be selected?
		 * 0: None
		 * 1: Assign Only for Select-able Asset.
		 * 2: All (Default)
		 */
		this.config.selectionMode = (config.selectionMode ? config.selectionMode : '2');

		//Can user select more than one asset at once? default to false.
		this.multipleSelectionOn = false;
		
	},

	/**
     * set reference to drawingController
     */
    setDrawingController: function(drawingController){
    	this.drawingController = drawingController;
    },
    
    /**
     * set multipleSelectionOn to the specified value
     */
    setMultipleSelection: function(enabled){
    	this.multipleSelectionOn = enabled;
    },
 
    
	/**
	 * default handler for mouse click event.
	 */
	handleMouseClick: function(assetIds){
		// select or un-select the asset.
		this.toggleAssetSelection(assetIds);
	},
	
	/*
	 * select or unselect asset
	 */
	toggleAssetSelection: function(assetId, color){
		
		if(typeof color === 'undefined' || color == null){
			color = this.formatColor(this.config.defaultConfig.highlights.selected.fill.color, true);
		}
		
		var index = this.selectedAssets.indexOf(assetId); 
		if( index >= 0){
			this.drawingController.getController("HighlightController").clearAsset(assetId, {'color': color, 'persistFill': false, 'overwriteFill' : true});
			this.selectedAssets.splice(index, 1);
		} else {
			// if only one asset can be selected at a time - clear previously selected assets.
			if(!this.multipleSelectionOn){
				for(var selectedAssetIndex = 0; selectedAssetIndex < this.selectedAssets.length; selectedAssetIndex++){
					this.drawingController.getController("HighlightController").clearAsset(this.selectedAssets[selectedAssetIndex], {'color': color, 'persistFill': false, 'overwriteFill' : true});
				}
				this.selectedAssets = [];
			}
			this.drawingController.getController("HighlightController").highlightAsset(assetId, {'color': color, 'persistFill': true, 'overwriteFill' : true});
			this.selectedAssets.push(assetId);
		}
	},
	
	
	highlightSelectedAssets: function(assetIds, color){
		if(typeof color === 'undefined' || color == null){
			color = this.formatColor(this.config.defaultConfig.highlights.selected.fill.color, true);
		}
	
		if(this.multipleSelectionOn){
			for(var i = 0; i < assetIds.length; i++){
				var assetId = assetIds[i];
				this.drawingController.getController("HighlightController").highlightAsset(assetId, {'color': color, 'persistFill': true, 'overwriteFill' : true});
				this.selectedAssets.push(assetId);
			}
		} else {
			for(var selectedAssetIndex = 0; selectedAssetIndex < this.selectedAssets.length; selectedAssetIndex++){
				this.drawingController.getController("HighlightController").clearAsset(this.selectedAssets[selectedAssetIndex], {'color': color, 'persistFill': false, 'overwriteFill' : true});
			}
			this.selectedAssets = [];
			if(assetIds && assetIds.length > 0){
				var assetId = assetIds[0];
				this.drawingController.getController("HighlightController").highlightAsset(assetId, {'color': color, 'persistFill': true, 'overwriteFill' : true});
				this.selectedAssets.push(assetId);
			}
		
		}
	},
	
	/**
	 * convert the color to HTML hex format.
	 */
	formatColor: function(c, asHex) {	
		return this.ensureValidColor(parseInt(c).toString(asHex == true ? 16 : 10).toString(), asHex);
	},
	
	/**
	 * append/trim the color number to the Hex compatible format. 
	 */
	ensureValidColor: function(c, asHex) {
		if (asHex == true && c.length < 6) {
			var i = c.length;
			c = '#' + ("000000" + c).substring(i);
		}
		
		return c;	
	}

}, {});