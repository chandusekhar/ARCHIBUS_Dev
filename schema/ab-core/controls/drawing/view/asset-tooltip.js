Drawing.namespace("view");

/**
 * Display tooltips.
 * 
 * This is usually invoke through the mouseover event.
 */
Drawing.view.AssetTooltip = Base.extend({

	config: {},
	
	/**
	 * reference to drawingController
	 */
	drawingController: null,
	
	/**
	 * true to display tooltip, false otherwise
	 */
	showTooltip: false,
	
	/**
	 * tooltip element
	 */
	tooltip: null,

	/**
	 * datasource/a list of fields to show the tooltip
	 */
	datasource: {},
	
	/**
	 * a map of full field name and its formatter function.
	 */
	formatterMap: {},
	
	/**
	 * custom event for tooltip
	 */
	customHandler: null,
	
	/**
	 * value returned by setTimeout to cancal timeout later
	 */
	tooltipTimeout: null,
	
	/**
	 * restriction for tooltip
	 */
	tooltipRestriction: null,

	// @begin_translatable
    Z_NONE: "(None)",
    // @end_translatable
    
	constructor: function (config) {
    	this.config = config;
    	
    	if(config.showTooltip){
			this.showTooltip = (config.showTooltip=='true' ? true : false);
		}
    		
    	this.init();

	},

	/**
     * set reference to drawingController
     */
    setDrawingController: function(drawingController){
       this.drawingController = drawingController;
       
       //register events
       this.registerEvents();
    },

    /**
     * create a tooltip node.
     */
    init: function(){
    	
    	this.tooltip = d3.select("div.svgTooltip");
    	
    	
    	if(this.showTooltip && (typeof this.tooltip === 'undefined' || !this.tooltip || this.tooltip.empty())){
    		this.tooltip = d3.select("body").append("div")   
    	    .attr("class", "svgTooltip")               
    	    .style("opacity", 0)
    	    .html('');
    	}
    },
    
    registerEvents: function(){
    	if(this.config.handlers && this.config.handlers.length > 0){
    		var eventHandlers = [];
    		for(var index = 0; index < this.config.handlers.length; index++){
    			var handler = this.config.handlers[index];
    			var eventHandler = {};
    			var assetType = (handler && handler.assetType ? handler.assetType : null);
    			if(typeof assetType !== 'undefined' && assetType != null){
    				var tooltipListener = this.tooltipHandler;
    				var datasource = (handler && handler.datasource ? handler.datasource : '');
    				var fields = (handler && handler.fields ? handler.fields.split(";") : []);
    				var keyFields = (handler && handler.keyFields ? handler.fields.split(";") : []);

    				this.datasource[assetType] = {'datasource': datasource, 'fields': fields, 'keyFields': keyFields};
    				this.customHandler = (handler && handler['handler'] ? handler['handler'] : null);
    				if(this.customHandler){
						eventHandlers[eventHandlers.length] = {'eventName': 'mouseover', 'assetType' : assetType, 'handler' : this.customHandler};
    				} else {
    					eventHandlers[eventHandlers.length] = {'eventName': 'mouseover', 'assetType' : assetType, 'handler' : this.show};
    				}
    				eventHandlers[eventHandlers.length] = {'eventName': 'mouseout', 'assetType' : assetType, 'handler' : this.hide};
    			}
    		}
    		if(eventHandlers && eventHandlers.length > 0){
    			this.drawingController.getController("EventController").addEventHandlers(eventHandlers);
    		}
    	}
    },
    
    updateDatasource: function(assetType, datasourceId, datasourceFields, keyFields, clientRestriction){
    	var keyFields = (keyFields ? keyFields.split(";") : []);
    	var fields = (datasourceFields ? datasourceFields.split(";") : []);
    	this.datasource[assetType] = {'datasource': datasourceId, 'fields': fields, 'keyFields': keyFields};
    	
    	if(typeof clientRestriction !== 'undefined' && clientRestriction !== null){
    		this.tooltipRestriction = clientRestriction;
    	}
    },
    
    setFormatter: function(fullFieldName, fn, fieldNameOnly){
    	if(typeof fieldNameOnly === 'undefined'){
    		fieldNameOnly = false;
    	}
    	this.formatterMap[fullFieldName] = {'formatter': fn, 'fieldNameOnly': fieldNameOnly};
    },
    
    show: function(assetId, drawingController, event, assetType){
    	var assetTooltip = drawingController.getAddOn("AssetTooltip");
    	if(assetTooltip && !assetTooltip.showTooltip)
    		return;
    	
    	var tooltipDiv = assetTooltip.tooltip;
    	if(tooltipDiv && typeof event !== 'undefined' && event != null 
    				&& typeof event.clientX !== 'undefined' && event.clientX != null 
    				&& typeof event.clientY !== 'undefined' && event.clientY != null){

    		var content = assetTooltip.getContent(assetId, assetType);
    		
    		if(content && content.length > 0){
    			assetTooltip.tooltipTimeout = setTimeout(function(){
    				tooltipDiv.style("left", (event.clientX+5) + "px")     
						.style("top", (event.clientY+5) + "px")
	    				.style("opacity", 0.9)
	    				.html(content);
    				}, 500);
    		} else {
    			tooltipDiv.style("left", "-50px")     
						  .style("left", "-50px")
						  .style("opacity", 0);
    		}
    	}
    },
    
    hide:function(assetId, drawingController, event, assetType){
    	var assetTooltip = drawingController.getAddOn("AssetTooltip");
    	if(assetTooltip && !assetTooltip.showTooltip)
        	return;
    	
    	if(assetTooltip.tooltipTimeout){
    		clearTimeout(assetTooltip.tooltipTimeout);
    	}
    	
    	assetTooltip.tooltip
    				.style("left", "-50px")     
					.style("left", "-50px")     
					.style("top", 0)
    				.style("opacity", 0)
    				.html('');
    },
    
    /**
     * returieve tooltip content from the datasources and fields
     */
    getContent: function(assetId, assetType){
		var content = '';
		var originalAssetId = this.drawingController.getController("AssetController").getOriginalAssetId(assetId);
    	if(this.datasource[assetType].datasource && this.datasource[assetType].fields && this.datasource[assetType].fields.length > 0){
    		var assetPk = originalAssetId.split(";");
    		
    		var ds = View.dataSources.get(this.datasource[assetType].datasource);
    		var restriction = null;
    		if(typeof this.tooltipRestriction !== 'undefined' && this.tooltipRestriction){
    			restriction = this.tooltipRestriction;
    		} else {
    			restriction = new Ab.view.Restriction();
    		}
    		
    		var fieldDef;
    		
    		/**
    		 * use tooltip key fields to match the asset id from the drawing if provided.
    		 * usually the key fields are primary fields of the datasource, however, in some situation, it could be other fields.
    		 */
 			if(this.datasource[assetType].keyFields && this.datasource[assetType].keyFields.length > 0){
	 			for (var i = 0; i < this.datasource[assetType].keyFields.length; i++) {
     				restriction.addClause(this.datasource[assetType].keyFields[i], assetPk[i], "=", true);
	            }
 			} else {
 	 			var index = 0;
	 			for (var i = 0; i < ds.fieldDefs.length; i++) {
	                fieldDef = ds.fieldDefs.items[i];
	                if (fieldDef.primaryKey && fieldDef.id.indexOf(ds.mainTableName + ".") === 0) {
	     				restriction.addClause(fieldDef.id, assetPk[index], "=", true);
	     				index++;
	                }
	            }
 			}
 			var record = ds.getRecord(restriction);
 			if(record){
	 			for(var j = 0; j < this.datasource[assetType].fields.length; j++){
	 				fieldDef = ds.fieldDefs.map[this.datasource[assetType].fields[j]];
	 				if(fieldDef && typeof record.getValue(fieldDef.fullName) !== 'undefined'){
	 					content += "<b>" + (fieldDef.title ? fieldDef.title : View.getLocalizedString(this.Z_NONE));
		 				content += ":</b> ";
		 				if(this.formatterMap[fieldDef.fullName]){
		 					var tableNames = fieldDef.fullName.split('.');
		 					if(tableNames.length > 1 && this.formatterMap[fieldDef.fullName]['fieldNameOnly']){
		 						content += this.formatterMap[fieldDef.fullName]['formatter'](tableNames[1], record.getValue(fieldDef.fullName));
		 					} else {
		 						content += this.formatterMap[fieldDef.fullName]['formatter'](fieldDef.fullName, record.getValue(fieldDef.fullName));
		 					}
		 				} else {
		 					content += record.getLocalizedValue(fieldDef.fullName);
		 				}
		 				content += "<br>";
	 				}
	 			}
 			}
        } 
    	
    	if(content){
    		return content;
    	} else {
    		return this.drawingController.getController("AssetController").getOriginalAssetId(originalAssetId);
    	}
    }
}, {});