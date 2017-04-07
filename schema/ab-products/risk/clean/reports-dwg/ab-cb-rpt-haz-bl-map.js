var abCbRptHazBlMapController = View.createController('abCbRptHazBlMapCtrl',{
	blId: null,
	filterController: null,
	map: null,
	bldgsRestriction: null,
	
    afterViewLoad: function(){

    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "proj";
		
		// hide DOC button on the console
		if (this.abCbRptCommonFilter_console.getEl('abCbRptCommonFilter_paginatedReport')) {
			this.abCbRptCommonFilter_console.showElement('abCbRptCommonFilter_paginatedReport', false);
		}
		this.initializeMap();
    },
    
    afterInitialDataFetch: function(){
    	var reportTargetPanel = document.getElementById("abCbRptHlHaz_htmlMap");            
    	reportTargetPanel.className = 'claro';
    },
    
    initializeMap:function(){
    	//create map object it there is a valid ESRI license
    	if(hasValidArcGisMapLicense()){
    		var configObject = new Ab.view.ConfigObject();
    		this.map = new Ab.arcgis.ArcGISMap('abCbRptHlHaz_htmlMap', 'abCbRptHlHaz_objMap', configObject);	

    		// create the marker property to specify building markers for the map
    		var colorBuckets = [1, 2];
    		var sizeBuckets = [];
    		sizeBuckets.push({limit:5,symbolSize:10});
    		sizeBuckets.push({limit:10,symbolSize:20});
    		sizeBuckets.push({limit:50,symbolSize:30});
    		sizeBuckets.push({limit:100,symbolSize:40});		
    		
    		var markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
    			'abCbRptHazBlMap_dsBldgs', 
    			['bl.lat', 'bl.lon'], 
    			['bl.bl_id'],
    			['bl.site_id','bl.bl_id','bl.name','bl.address'],
    			'bl.contains_hazard', // color field
    			colorBuckets,	// color buckets				
    			'bl.count_hazard_rooms', // size field
    			sizeBuckets			// size buckets
    		);

    		markerProperty.colors = [[0, 255, 0, 1], [255, 247, 0, 1], [255, 0, 0, 1]];
    		markerProperty.setThematic('bl.contains_hazard', colorBuckets); 
    		this.map.updateDataSourceMarkerPropertyPair('abCbRptHazBlMap_dsBldgs', markerProperty);
    		
    		// add the mouse click event handler 
			this.map.addMarkerAction(getMessage("labelShowDetails"), this.showBuildingDetails);
			
			// basemap layer menu
     	    var basemapLayerMenu = this.abCbRptHlHaz_htmlMap.actions.get('basemapLayerMenu');
    		basemapLayerMenu.clear();
    		var basemapLayers = this.map.getBasemapLayerList();
    		for (var i=0; i<basemapLayers.length; i++){
    			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
    		}
		}	
		
    },
    
    switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	abCbRptHazBlMapController.map.switchBasemapLayer(item.text);
    },  
    
	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
        this.abCbRptHazBlMap_gridBldgs.addParameter('consoleRestriction', restriction);
        this.abCbRptHazBlMap_gridBldgs.refresh();
        
        this.abCbRptHlHaz_htmlMap.show(false);
        this.abCbRptHazBlMap_gridRep.show(false);
	},
	
	abCbRptHazBlMap_gridBldgs_onShowBuildings: function(){
		this.bldgsRestriction = new Ab.view.Restriction();
		var blIds = this.abCbRptHazBlMap_gridBldgs.getFieldValuesForSelectedRows('bl.bl_id');
		if (blIds.length == 0) {
			View.showMessage(getMessage("selectOneBldg"));
			return;
		}

		this.bldgsRestriction.addClause('activity_log.bl_id', blIds, "IN", "AND");

		// refresh map
		if (this.map) {
			this.abCbRptHlHaz_htmlMap.show(true);
			this.map.refresh(this.bldgsRestriction);
		} else {
			this.abCbRptHlHaz_htmlMap.show(false);
		}
		
		// refresh assessments grid
		this.abCbRptHazBlMap_gridRep.show(true);
		this.abCbRptHazBlMap_gridRep.addParameter("consoleRestriction", this.filterController.restriction ? this.filterController.restriction : "1=1");
		this.abCbRptHazBlMap_gridRep.refresh(this.bldgsRestriction);
	},
	
	showBuildingDetails: function(title, attributes) {
		View.controllers.get('abCbRptHazBlMapCtrl').blId = title;
	    View.openDialog('ab-cb-rpt-haz-bl-map-drilldown.axvw');
	}
	
});

function onPaginatedDocReport(commandObject, pagRepName){
	//printable restriction from filter parameters
	var printableRestriction = View.controllers.get('abCbRptHazBlMapCtrl').filterController.printableRestriction;
	
	printableRestriction = addBuildingsRestriction(printableRestriction);
	
	var parameters = [];
	
	var restriction = "1=1";
	
	if(View.controllers.get('abCbRptHazBlMapCtrl').filterController.restriction){
		restriction  =  "" + View.controllers.get('abCbRptHazBlMapCtrl').filterController.restriction;
	}
	
	var buildingsPanel = View.panels.get('abCbRptHazBlMap_gridBldgs');
    
    if(buildingsPanel){
        var selectedBlIds = getKeysForSelectedRows(buildingsPanel, 'bl.bl_id');
        
		if(selectedBlIds.length > 0){
			restriction += " AND activity_log.bl_id IN ('" + selectedBlIds.join("','") +"')";
		}
    }
	
	var parameters = {
		'consoleRestriction':restriction,
		'printRestriction': true, 
        'printableRestriction': printableRestriction
    };
	
	View.openPaginatedReportDialog(pagRepName, null, parameters);
}

function addBuildingsRestriction(printableRestriction){
    var buildingsPanel = View.panels.get('abCbRptHazBlMap_gridBldgs');
        
    if(buildingsPanel){
            var selectedBlIds = getKeysForSelectedRows(buildingsPanel, 'bl.bl_id');
            if(selectedBlIds.length == 0)
                return;
            
            //put selected buildings in printable restriction and replace all ones if necesary
            var blValue = getMapValue(printableRestriction, getMessage("buildings"));
            if(blValue){
            	printableRestriction = setMapValue(printableRestriction, getMessage("buildings"), selectedBlIds.join(", "));
            }else{
            	printableRestriction.push({'title': getMessage("buildings"), 'value': selectedBlIds.join(", ")});
            }
    } 
    return printableRestriction;
}

/**
 * Obtain a map({title,value}) value by title.
 * @param map
 * @param title
 * @returns map value for the specified title.
 */
function getMapValue(map, title){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			return map[i].value;
		}
	}
}

/**
 * Replace a map({title,value}) value.
 * @param map
 * @param title
 * @param newVal
 * @returns map after replacement
 */
function setMapValue(map, title, newVal){
	for ( var i = 0; i < map.length; i++) {
		if (map[i].title == title){
			map[i].value = newVal;
			return map;
		}
	}
	return map;
}
