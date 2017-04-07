/**
 * Layers Popup UI for SVG Drawing control.
 */
Drawing.namespace("view");

Drawing.view.LayersPopup = Base.extend({
	_svg: null, 
	_div: '',
	_containerId: '',
	_container: null,
	_opts: {}, 
	_cols: -1, 
	_rows: -1,

	/**
	 * layers to display on the pop-up
	 */
	_layers: [],
	
	/**
	 * default layers to turn on when create/load
	 */
	_defaultLayers: [],
	
	_publishedLayers: [],
	
	/**
	 * retrieve localized titles from afm_layr.title table
	 */
	_titleMap: {},
	
	// index for dividers to divide asset layers from background layers.
	_dividerIndex: -1,
	
	/**
	 * custom event when user check/uncheck layer's checkbox
	 */
	_customEvent: null,
	
	// @begin_translatable
    Z_LAYER_TITLE: "Labels",
    Z_LAYER_BACKGROUND_TITLE: "Background",
    // @end_translatable
	
	constructor: function(config) {
		this.config = config;
		
		this._svg = d3.select("#" + config.divId + "-svg");
		this._div = d3.select("#" + config.divId);
		this._containerId = config.divId + "_layerList";
		this._opts = {};
		
		if(config.customEvent){
			this._customEvent = config.customEvent;
		}
		
		this.showLayers();
	},
	
	showLayers: function(){
		d3.select("#" + this._containerId).remove();

		this.resetLayers();

		this.populateLayers();

		this._div = d3.select("#" + this.config.divId);
		this.createLayerPopup(this._svg, this._div, this._containerId, this._opts);

        return this;
	},
	
	/**
	 * reset all layers variables
	 */
	resetLayers: function(){
		this._publishedLayers = [];
		this._layers= [];
		this._defaultLayers = [];
		this._dividerIndex = -1;
	},
	
	populateLayers: function(){

		this._publishedLayers = this.getAllLayers();

		//retrieve layers map from database
		this.populateLayersMap();
		
		if(this.config.layers){
			var layersFromConfig = this.config.layers.split(';');
			if(layersFromConfig.length > 0){
				this._dividerIndex = 0;
			}
			for(var i = 0; i < layersFromConfig.length; i++){
				var layerName = layersFromConfig[i];
				layerName = layerName.toLowerCase().replace("$txt", "-labels").replace("$", "-assets"); 
	        	
				if(this._publishedLayers.indexOf(layerName) > -1){
					this._dividerIndex++;
					this._layers.push(layerName);
				} else if(layerName && layerName.toLowerCase() == 'background'){
					this._layers = this._layers.sort().concat(this.getBackgroundLayers());
				}
			}
		}
		
		if(!this._layers || this._layers.length < 1 ){
			this._layers = this._publishedLayers;
		}
		
		// populate the defaultLayers only when it is not called from datasource selector
		if(this.config.callFromDatasourceSelector != 'true' && this.config.defaultLayers){
			var defaultLayersFromConfig = this.config.defaultLayers.split(';');
			for(var j = 0; j < defaultLayersFromConfig.length; j++){
				var layerName = defaultLayersFromConfig[j];
				layerName = layerName.toLowerCase().replace("$txt", "-labels").replace("$", "-assets"); 
				if(this._publishedLayers.indexOf(layerName) > -1){
					this._defaultLayers.push(layerName);
				} else if(layerName && layerName.toLowerCase() == 'background'){
					this._defaultLayers = this._defaultLayers.concat(this.getBackgroundLayers());
				}
			}
		} else {
			// SVG from server side might already have layers on/off from datasource/label selectors.
			for(var k = 0; k < this._layers.length; k++){
				var layerName = this._layers[k];
				var node = d3.select("#" + layerName).node();
				if(node && node.style && node.style.display !== 'none' && this._defaultLayers.indexOf(layerName) == -1){
					if(typeof this.config.defaultLayers !== 'undefined' && this.config.defaultLayers){
						if(this.config.defaultLayers.indexOf(layerName) > -1){
							// turn on the layer if the layer is in user-defined default layers list
							this._defaultLayers.push(layerName);
						} else if(node.parentNode.id === 'assets' || node.parentNode.id === 'asset-labels') {
							// turn on the layers if the layers are asset or labels. (this is to prevent all background layers from turning on as the server API turn all background layers on)
							this._defaultLayers.push(layerName);
						}
					} else {
						// always turn on the layers retrieved from server if no default layers defined
						this._defaultLayers.push(layerName);
					}
                } 
			}
		}	
		
		if(!this._defaultLayers || this._defaultLayers.length < 1 ){
			this._defaultLayers = this._layers;
		}
		
	},
	
	populateLayersMap: function(){
	    	var datasource = Ab.data.createDataSourceForFields({
		        id: 'svgDrawingControl_afmLayr',
		        tableNames: ['afm_layr'],
		        fieldNames: ['afm_layr.layer_name','afm_layr.title']
		    });	
	    	
			var records = datasource.getRecords();
			if(records && records.length > 0){
				var layerName = '';
				var title = '';
				var formattedTitle = '';
				
	    		for(var i = 0; i < records.length; i++){
	    			if(!records[i])
	    				continue;
		    		
		        	layerName = records[i].getValue("afm_layr.layer_name");
		        	
		        	if(layerName.indexOf('$') < 0)
		        		continue;
		        	
		        	layerName = layerName.toLowerCase().replace("$txt", "-labels").replace("$", "-assets"); 
		        	title = records[i].getValue("afm_layr.title");
		        	if(title)
		        		formattedTitle = datasource.formatValue('afm_layr.title', title, true);
		        	else
		        		formattedTitle = title;
		        	
		        	this._titleMap[layerName] = formattedTitle;
	    		}
	    	} 
	},
	
    createLayerPopup: function(svg, div, containerId, opts) {
        this.setParameters(svg, div, containerId, -1, -1, opts);
        if(this._dividerIndex === -1){
        	this.create(svg, div, containerId, this._layers.length, 2, opts);
        } else {
        	this.create(svg, div, containerId, this._layers.length + 1, 2, opts);
        }
        this.insertTableContent(document.getElementById(this._containerId + "_table"));

        return this;
    },

    create: function(svg, div, containerId, rows, cols, opts) {
        this.setParameters(svg, div, containerId, rows, cols, opts);
        this.createPopup();
    },

    setParameters: function(svg, div, containerId, rows, cols, opts) {
        this._svg = svg;
        this._div = div.node();
        this._containerId = containerId;
        this._rows =  rows;
        this._cols = cols;
        this._opts = opts;
    },


    show: function(bShow) {
        document.getElementById(this._containerId).style.display = (bShow) ? '' : 'none';
    },

    setText: function(text) {
        var node = document.getElementById(this.container.id + "_infobartext");
        node.innerHTML = text;
    },

    createPopup: function() {
        this.container = document.createElement('div');
        this.container.id = this._containerId;
        this.container.className = "layer-list";
        
        this.afterResize();
        
        this.container.appendChild(this.createMinimizeButton());
        
        // prevent double click from propagating
        this.container.addEventListener("dblclick", function(event){
        	event.stopPropagation();
        });
        this.container.addEventListener("mousemove", function(event){
        	event.stopPropagation();
        });
        
        var table = this.createTable(this._cols, this._rows);
        this.container.appendChild(table);
        this._div.insertBefore(this.container, this._svg.node());
    },

    afterResize: function(){
    	if(typeof this.container === 'undefined' || !this.container){
    		this.container = document.getElementById(this._containerId);
    	}
    	
       	if(typeof this._div.style.height !== 'undefined'){
        	this.container.style.maxHeight = (this._div.style.height.replace("px", "") - 10) + "px";
        }
    },
    
    createMinimizeButton: function() {
        var minimizeButton = document.createElement('div');
        minimizeButton.className = 'minimize-button';
        minimizeButton.addEventListener('click', function(){
            if (this.parentNode.style.height !== '13px') {
                this.parentNode.style.height = 13 + 'px';
                this.parentNode.style.width = 16 + 'px';
                this.parentNode.style.overflow = 'hidden';
                minimizeButton.className = 'open-button';
            } else {
                this.parentNode.style.height = 'auto';
                this.parentNode.style.width = 'auto';
                this.parentNode.style.overflow = 'auto';
                minimizeButton.className = 'minimize-button';
            }
        }, false);

        return minimizeButton;
    },
    
    createTable: function(cols, rows) {
        var table = document.createElement("table");
        table.id = this._containerId + "_table";
        this.tableId = table.id;
        var tbody = document.createElement("tbody");
        table.appendChild(tbody);

        this.createRows(tbody, cols, rows);

        return table;
    },

    createRows: function(tbody, cols, rows) {
    	for (var i=0; i<rows; i++) {
        	if(i === this._dividerIndex){
        		var tr = document.createElement("tr");
            	var td = document.createElement("td");
                td.colSpan = cols;
                td.className = "divider";
                tr.appendChild(td);
                tbody.appendChild(tr);
            }
    		var tr = document.createElement("tr");
         	for (var j=0; j<cols; j++) {
                var td = document.createElement("td");
	            td.className = "column" + j;
	            tr.appendChild(td);
	        }
            tbody.appendChild(tr);
        }
        return tbody;
    },

    insertTableContent: function(table) {
        var rows = table.tBodies[0].rows;
        var control = this;

        // we will create the rows for layers without no localized titles later.
        var layersPostponed = [];

        //track actual row #
        var rowIndex = 0;
        for (var i=0; i<this._layers.length; i++) {
            if(this._layers[i] === 'divider'){
            	rowIndex++;
            	continue;
            }
            var localizedTitle = this.getLocalizedTitle(this._layers[i]);
            if(!localizedTitle || localizedTitle.length < 1){
            	layersPostponed[layersPostponed.length] = this._layers[i];
            } else {
                var row = rows[rowIndex];
                var tds = row.childNodes;

                var checkbox = this.createCheckbox(this._layers[i], this.checkboxEvent);
                if(!this._defaultLayers || this._defaultLayers.length < 1 || (this._defaultLayers && this._defaultLayers.indexOf(this._layers[i]) > -1)){
                	checkbox.checked = true;
                } else {
                	checkbox.checked = false;
                }
                //call the checkbox event handler but do not call the custom event
                this.checkboxEvent(checkbox, this, false);
                tds[0].appendChild(checkbox);
                tds[1].innerHTML = localizedTitle;
                
                rowIndex++;
            }
        }
        
        for(var j = 0; j < layersPostponed.length; j++){
            var row = rows[rowIndex];
            if(typeof row == 'undefined' || row == null || typeof row.childNodes == 'undefined' || row.childNodes == null){
            	continue;
            } else {
	            var tds = row.childNodes;
	            // only add event if it is not a divider
	            if(tds.length > 1){
		            var checkbox = this.createCheckbox(layersPostponed[j], this.checkboxEvent);
		            if(!this._defaultLayers || this._defaultLayers.length < 1 || (this._defaultLayers && this._defaultLayers.indexOf(layersPostponed[j]) > -1)){
		            	checkbox.checked = true;
		            } else {
		            	checkbox.checked = false;
		            }
		            //call the checkbox event handler but do not call the custom event
		            this.checkboxEvent(checkbox, this, false);
		            tds[0].appendChild(checkbox);
		            tds[1].innerHTML = layersPostponed[j].replace("layer-", "");
	            } else {
	            	//retain the layersPostponed index after divider
	            	j--;
	            }
            }
            rowIndex++;
        }
    },

    /**
     * find the layer title from the layers title map
     */
    getLocalizedTitle: function(layer){
    	
    	var localizedTitle = "";
    	
   		var index = layer.indexOf("-assets");
   		if(index > -1){
   			//if it is an asset layer
   			localizedTitle = this._titleMap[layer];
   		} else {
   			//if it is a label/text layer
   			index = layer.indexOf("-labels");
   			if(index > -1){
   	   			localizedTitle = this._titleMap[layer];
   	   			if(typeof localizedTitle !== 'undefined' && localizedTitle === this._titleMap[layer.replace("-labels", "-assets")]){
   	   				localizedTitle = this._titleMap[layer] + " " + View.getLocalizedString(this.Z_LAYER_TITLE);
   	   			}
   			} 
   		}
   		
   		if(typeof localizedTitle !== 'undefined' && localizedTitle != null)
   			return localizedTitle;
   		else 
   			return "";
    },
    
    createCheckbox: function(id, eventListener) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true;
        
        
        checkbox.id = "checkbox_" + id;
        var control = this;
        //call the checkbox event handler with the custom event onchange
        if (eventListener.createDelegate) {
        	checkbox.addEventListener('change', eventListener.createDelegate(checkbox, [checkbox, control, true]), false);
        } else {
        	checkbox.addEventListener('change', Ext.bind(eventListener, checkbox, [checkbox, control, true]), false);
        }

        return checkbox;
    },

    checkboxEvent: function(checkbox, control, callCustomEvent){
    	
        var display = (checkbox.checked) ? "" : "none";
        control._svg.selectAll("#" + checkbox.id.replace("checkbox_", "")).style("display", display);
        control._svg.selectAll(".cluster." + checkbox.id.replace("checkbox_", "")).style("display", display);
        
        if(callCustomEvent && control._customEvent){
        	control._customEvent(checkbox);
        }
    },
    
    getAllLayers: function() {
        var background = this._svg.selectAll("#background").node().id,
        	assets = this._svg.selectAll("#assets > g")[0],
            assetLabels = this._svg.selectAll("#asset-labels").node().childNodes,
            redline = this._svg.selectAll("#redline");

        var layers = [];
        for(var j=0; j<assetLabels.length; j++) {
            if (assetLabels[j].nodeName === 'g') {
                layers.push(assetLabels[j].id);
            }
        }
        
        for(var k=0; k<assets.length; k++) {
            layers.push(assets[k].id);
        }
        
        if (!redline.empty()) {
            layers.push(redline.node().id);
        }

        //always put the background layer at the end.
        this._dividerIndex = layers.length;
        return layers.sort().concat(this.getBackgroundLayers());
    },
    
    getBackgroundLayers: function(){
    	var backgourndLayers = this._svg.selectAll("#background").node().childNodes;
    	
    	var layers = [];
        for(var j=0; j<backgourndLayers.length; j++) {
            if (backgourndLayers[j].nodeName === 'g') {
                layers.push(backgourndLayers[j].id);
            }
        }
        return layers.sort();
    }
    
}, {});