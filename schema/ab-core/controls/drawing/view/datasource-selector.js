Drawing.namespace("view");

/**
 * This is temporary and should be replaced with a Drawing Option pop up with datasource selector/label selector, legend, asset layer etc. 
 */

Drawing.view.DatasourceSelector = Base.extend({
	
	// @begin_translatable
	z_MESSAGE_HIGHLIGHTS: 'Highlights',
	z_MESSAGE_LABELS: 'Labels',
	z_MESSAGE_FILTER: 'Filter:',
	z_MESSAGE_BORDERS: 'Borders:',
    z_MESSAGE_BORDER_HIGHLIGHTS: 'Border Highlights',
    z_MESSAGE_ROOM_HIGHLIGHTS: 'Room Highlights',
	z_MESSAGE_TOOLTIP_LEGEND: 'Legend',
	// @end_translatable
	
	config: null,
	
	constructor: function(config) {
		this.config = config;

		// add the required parameters for datasource selector
		this.config.highlightParameters = (this.config.highlightParameters ? this.config.highlightParameters : [{}]);
		this.config.highlightSelector = (this.config.highlightSelector ? this.config.highlightSelector : true);
		this.config.labelSelector = (this.config.labelSelector ? this.config.labelSelector : true);
        
        this.appendDatasourceSelectors();
	},
	
	/**
 	 * Display combo-box for datasource select list.
 	 */
 	appendDatasourceSelectors: function() {

 		if (this.config.highlightSelector) {
 			this.appendSelector('hilite', 'DrawingControlHighlight', View.getLocalizedString(this.z_MESSAGE_HIGHLIGHTS)+":", this.config.highlightParameters[0].hs_ds);
            if (this.config.showLegendOverlay) {
                this.appendLegendButton(this.config.legendPanel, false);
            }
        }
 		
        if (this.config.labelSelector) {
 			this.appendSelector('labels', 'DrawingControlLabels', View.getLocalizedString(this.z_MESSAGE_LABELS) + ":", this.config.highlightParameters[0].label_ds);
        }
    },
     
    /**
     * Called by appendDatasourceSelectors().
     */
  	appendSelector: function(comboId, dsFilter, comboLabel, defaultVal) {
 		var titleNode = document.getElementById(this.config.addOnsConfig['DatasourceSelector'].panelId + '_title');
 		if (titleNode === null){
 			return;
 		}

 		var dsNameIdsMap = this.getSelectorDatasources(dsFilter);

 		// If there are 0 or 1 records, there is no need to display the combo
 		if (Object.keys(dsNameIdsMap).length < 2){
 			return;
 		}

 		this.createComboList(titleNode, comboId, comboLabel, dsNameIdsMap, defaultVal);
  	},
  	
  	createComboList: function(titleNode, comboId, comboLabel, dsNameIdsMap, defaultVal){
  	
  		var parentNode = titleNode.parentNode.parentNode;
 		var selectorId = 'selector_' + comboId;
 		var combo = Ext.get(selectorId);
 		if(!combo){
	 		//add label
 			var cell = Ext.DomHelper.append(parentNode, {tag: 'td'});
	 		var labelElem = Ext.DomHelper.append(cell, '<p>' + comboLabel + '</p>', true);
	 		Ext.DomHelper.applyStyles(labelElem, "x-btn-text");
	 		
	 		//add combo
	 		cell = Ext.DomHelper.append(parentNode, {tag: 'td'});
	 		combo = Ext.DomHelper.append(cell, {tag: 'select', id: selectorId}, true);
	 		
	 		// add combo list items
	 		var i = 0;
	 		for (var name in dsNameIdsMap) {
	 			combo.dom.options[i] = new Option(name, dsNameIdsMap[name]);
	 			i++;
	 		}
 		}
 		combo.dom.value = defaultVal;
 		
		// update combo event with the current parameters, such as pkValues, hs_ds, and labels_ds
 		combo.dom.onchange = this.onSelectedDatasourceChanged.createDelegate(this, [this, combo]);
  	},
  	
 	/**
 	 * retrieve selector datasource as a name/id map from the view file for the specified type.
 	 * 
 	 */
 	getSelectorDatasources: function(type){
 		var results = {};

 		var dataSources = View.dataSources;
 		for (var i = 0; i < dataSources.length; i++) {
			var ds = dataSources.items[i];
			if (ds.type != type){
				continue;
			}
			var name = (ds.title == undefined) ? ds.id : ds.title;
			results[name] = ds.id;
 		}
 		return results;
 	},
 	
 	onSelectedDatasourceChanged: function(control, combo) {
 		var selectedValue = combo.dom.value;
 		var type = '';
		if (combo.id.lastIndexOf('hilite') >= 0) {
			control.config.highlightParameters[0].hs_ds = selectedValue;
	    	type = 'highlight';
	    }else if (combo.id.lastIndexOf('labels') >= 0) {
	    	control.config.highlightParameters[0].label_ds = selectedValue;
	    	type = 'labels'
	    }
		
 		try{
 			var panelId = control.config.panelId;
 			if(typeof panelId === 'undefined' || panelId === null){
 				panelId = control.config.addOnsConfig.DatasourceSelector.panelId;
 			}
 			var config = control.config;
 			config.callFromDatasourceSelector = 'true';
			this.svgControl = new Drawing.DrawingControl(config.divId, panelId, config);    			
			this.svgControl.load(config.divId, config, config.eventHandlers);
 		}catch(e){
 			// throw error?
 		}
 	}

}, {});