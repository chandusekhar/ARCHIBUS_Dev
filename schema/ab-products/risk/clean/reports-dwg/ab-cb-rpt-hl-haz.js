/**
 * overwrite function to make add city, site etc. on node restriction
 * @param {Object} parentNode
 * @param {Object} level
 */
Ab.tree.TreeControl.prototype._createRestrictionForLevel = function(parentNode, level) {
    var restriction = this.createRestrictionForLevel(parentNode, level);
	
	if (!restriction) {
		restriction = new Ab.view.Restriction();
		// add the tree restriction to parameter list if not null.
		if (this.restriction && this.restriction.clauses != undefined && this.restriction.clauses.length > 0) {
			restriction.addClauses(this.restriction, true);
		}
		
		// add the tree level's restriction to parameter list if not null.
		var levelRest = this.getRestrictionForLevel(level);
		if (levelRest && levelRest.clauses != undefined && levelRest.clauses.length > 0) {
			restriction.addClauses(levelRest, true);
		}
		
		// add the parent node's restriction to parameter list. it should always contain something
		if (!parentNode.isRoot()){
			if(this.type=='hierTree' || this.type=='selectValueHierTree'){
				restriction.addClauses(parentNode.restriction, true);
		    } else {
		    	if (this._panelsData[level].useParentRestriction==true) {
					restriction.addClauses(parentNode.restriction, true);
				}
			}
		}
		// regn level, we must add ctry
		if(level == 2
				&& parentNode.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.ctry_id', parentNode.parent.data['ctry.ctry_id']);
		}
		// state level, we must add ctry and regn
		if(level == 3
				&& parentNode.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.regn_id', parentNode.parent.data['regn.regn_id']);
			restriction.addClause('bl.ctry_id', parentNode.parent.parent.data['ctry.ctry_id']);
		}
		// city level, we must add ctry, regn and state
		if(level == 4
				&& parentNode.parent.data['state.state_id'] != undefined
				&& parentNode.parent.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.state_id', parentNode.parent.data['state.state_id']);
			restriction.addClause('bl.regn_id', parentNode.parent.parent.data['regn.regn_id']);
			restriction.addClause('bl.ctry_id', parentNode.parent.parent.parent.data['ctry.ctry_id']);
		}
		// bldg level, we must add ctry, regn, state and city
		if(level == 5
				&& parentNode.parent.data['city.city_id'] != undefined
				&& parentNode.parent.parent.data['state.state_id'] != undefined
				&& parentNode.parent.parent.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('bl.city_id', parentNode.parent.data['city.city_id']);
			restriction.addClause('bl.state_id', parentNode.parent.parent.data['state.state_id']);
			restriction.addClause('bl.regn_id', parentNode.parent.parent.parent.data['regn.regn_id']);
			restriction.addClause('bl.ctry_id', parentNode.parent.parent.parent.parent.data['ctry.ctry_id']);
		}
		// floor level, we must add ctry, regn, state, city and site
		if(level == 6
				&& parentNode.parent.data['site.site_id'] != undefined
				&& parentNode.parent.parent.data['city.city_id'] != undefined
				&& parentNode.parent.parent.parent.data['state.state_id'] != undefined
				&& parentNode.parent.parent.parent.parent.data['regn.regn_id'] != undefined
				&& parentNode.parent.parent.parent.parent.parent.data['ctry.ctry_id'] != undefined){
			restriction.addClause('rm.site_id', parentNode.parent.data['site.site_id']);
			restriction.addClause('rm.city_id', parentNode.parent.parent.data['city.city_id']);
			restriction.addClause('rm.state_id', parentNode.parent.parent.parent.data['state.state_id']);
			restriction.addClause('rm.regn_id', parentNode.parent.parent.parent.parent.data['regn.regn_id']);
			restriction.addClause('rm.ctry_id', parentNode.parent.parent.parent.parent.parent.data['ctry.ctry_id']);
		}
	}
	
	return restriction;
}

var abCbRptHlHazController = View.createController('abCbRptHlHazCtrl',{
	blId: null,
	flId: null,
	dwgName: null,
	dwgCtrlLoc: null,
	map: null,
	filterController: null,
	
	// restrict data for the logged in user?
	restrictDataOnUser: false,
	
	// restriction on assessments: assigned to logged in user
	userAssignedRestriction: "(activity_log.assessed_by = '${user.name}'"
		+ " OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)} )"
		+ " OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}))",

	
	// true if floor selected, false if building selected
	showDrawing: false,
	
    afterViewLoad: function(){
		var controller = this;

		// show only the rooms/hazards/samples assigned to the logged in user, for Field Assessor or Abatement Worker users  
		this.restrictDataOnUser = (this.view.taskInfo.processId == "Field Assessor" || this.view.taskInfo.processId == "Abatement Worker");
		
    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
		this.filterController.visibleFields = "proj";
		this.filterController.isDocButtonMenu = true;
		// set userAssignedRestriction for paginated reports
		if(this.restrictDataOnUser){
			this.filterController.userAssignedRestriction = this.userAssignedRestriction;
		}

		// set userAssignedRestriction to panels
		if(this.restrictDataOnUser){
        	this.abCbRptHlHaz_ctryTree.addParameter('userAssignedRestriction', this.userAssignedRestriction);
			this.abCbRptHlHaz_gridRepRooms.addParameter('userAssignedRestriction', this.userAssignedRestriction);
			this.abCbRptHlHaz_gridRepHazards.addParameter('userAssignedRestriction', this.userAssignedRestriction);
			this.abCbRptHlHaz_gridRepSamples.addParameter('userAssignedRestriction', this.userAssignedRestriction);
        }

    	//specify a handler for when drawing is fully loaded; to be able to manually set highlights after load
        this.abCbRptHlHaz_drawingPanel.addEventListener('ondwgload', highlightAssetsOnDwgLoad);
        
        /*
         * specify a handler after resize of the drawing (drag of the layout region bar),
         * to hide/show the drawing panel
         */
        this.abCbRptHlHaz_drawingPanel.addEventListener('afterResize', function(){
        	if (!controller.showDrawing){
        		controller.abCbRptHlHaz_drawingPanel.parentElement.style.height ="0px";
    		}
        });
		
		// set message parameter for abCbRptHlHaz_ctryTree panel
		this.abCbRptHlHaz_ctryTree.addParameter('noDrawing',getMessage('noDrawing'));
		
		// highlight in the displayed drawing, the selected room / the selected room's hazards / the selected room's samples
		this.abCbRptHlHaz_gridRepRooms.addEventListener('onMultipleSelectionChange', onGridsMultipleSelectionChange);
		
		// highlight in the displayed drawing, the selected hazard's room / the selected hazard / the selected hazard's samples
		this.abCbRptHlHaz_gridRepHazards.addEventListener('onMultipleSelectionChange', onGridsMultipleSelectionChange);
		
		// highlight in the displayed drawing, the selected sample's room / the selected sample's hazard / the selected sample
		this.abCbRptHlHaz_gridRepSamples.addEventListener('onMultipleSelectionChange', onGridsMultipleSelectionChange);
		
		this.createMap();
    },
    
    createMap:function(){
    	//create map object it there is a valid ESRI license
    	if(hasValidArcGisMapLicense()){
        	var configObject = {
        			// map loaded callback function
        			"mapLoadedCallback" : mapLoadedCallback,
        			};

        	//create mapControl
        	this.map = new Ab.arcgis.ArcGISMap('abCbRptHlHaz_htmlMap', 'abCbRptHlHaz_objMap', configObject);

        	// create the marker property to specify building markers for the map
        	var markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
        		'abCbRptHlHaz_dsBuilding', 
        		['bl.lat', 'bl.lon'], 
        		['bl.bl_id'], 
        		['bl.site_id','bl.bl_id','bl.name','bl.address']);
        	this.map.updateDataSourceMarkerPropertyPair('abCbRptHlHaz_dsBuilding', markerProperty);

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
    	abCbRptHlHazController.map.switchBasemapLayer(item.text);
    },  
    
    afterInitialDataFetch: function() {
    	//apply esri css to panel
      var mapPanel = this.abCbRptHlHaz_htmlMap;            
      mapPanel.className = 'claro';
  	},

  	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
        this.abCbRptHlHaz_ctryTree.addParameter('consoleRestriction', restriction);
        this.abCbRptHlHaz_ctryTree.refresh();
        
        if (valueExistsNotEmpty(this.dwgCtrlLoc)) {
            this.abCbRptHlHaz_drawingPanel.removeDrawing(this.dwgCtrlLoc);
        }
        this.dwgCtrlLoc = null;
        this.showPanels(false, true, false, false);
	},

	/**
	 * show/ hide panels
	 * @param {boolean} showBlDet
	 * @param {boolean} showDrawing
	 * @param {boolean} showRep
	 * @param {boolean} showMap
	 */
    showPanels: function(showBlDet, showDrawing, showRep, showMap){
    	this.showDrawing = showDrawing;
    	
        this.abCbRptHlHaz_blDetailsPanel.show(showBlDet);   
		if (valueExists(FABridge.abDrawing)) {
        	this.abCbRptHlHaz_drawingPanel.show(showDrawing);
        	try {
        		if (FABridge.abDrawing.root()) {
                	showDwgToolbar(showDrawing, this.abCbRptHlHaz_drawingPanel);
        		}
        	} catch(e){
        		
        	}
       	}
        this.abCbRptHlHaz_gridRepRooms.show(showRep);
        this.abCbRptHlHaz_gridRepHazards.show(showRep);
        this.abCbRptHlHaz_gridRepSamples.show(showRep);
        this.abCbRptHlHaz_htmlMap.show(showMap);
    },
	
	/**
     * Creates an array of room ids to highlight
     * @param rooms array of grid rows to extract room ids from
     * @returns array Array of {bl_id: bldg id, fl_id: floor id; rm_id: room id; dwgname: drawing name} objects
     */
    getRoomIdsForDrawing: function(rooms){
    	var roomIds = [];
    	var tableName = "rm";
    	
    	if(rooms.length > 0 && rooms[0].panel.id != "abCbRptHlHaz_gridRepRooms"){
    		tableName = "activity_log";
    	}
    	
		for (var i = 0; i < rooms.length; i++) {
			var room = rooms[i];

			var dwgname = "";
			if(room.panel.id != "abCbRptHlHaz_gridRepSamples"){
				dwgname = room.getFieldValue(tableName + ".dwgname");
			} else {
				dwgname = room.getFieldValue("cb_samples.dwgname");
			}
			
			// send only items with dwgname filled, to avoid non-highlighting bug
			roomIds.push({bl_id: room.getFieldValue(tableName + ".bl_id"),
				fl_id: room.getFieldValue(tableName + ".fl_id"),
					rm_id: room.getFieldValue(tableName + ".rm_id"),
					dwgname: dwgname
			});
		}
		
		return roomIds;
    },
    
    /**
     * Creates an array of room ids to highlight
     * @param rooms array of grid rows to extract room ids from
     * @returns array Array of {bl_id: bldg id, fl_id: floor id; rm_id: room id; dwgname: drawing name} objects
     */
    getAllRoomIdsForDrawing: function(){
    	var roomIds = [];
    	
    	var grid = View.panels.get('abCbRptHlHaz_gridRepRooms');
    	var parameters = grid.getParametersForRefresh();
    	parameters.recordLimit = -1;
    	var rooms = grid.getData(parameters).data.records;
    	
		for (var i = 0; i < rooms.length; i++) {
			var room = rooms[i];
			var dwgname = room["rm.dwgname"];
			if (dwgname) {
				roomIds.push({
					bl_id : room["rm.bl_id"],
					fl_id : room["rm.fl_id"],
					rm_id : room["rm.rm_id"],
					dwgname : dwgname
				});
			}
		}
		
		return roomIds;
    },
    
    /**
     * Creates an array of hazard ids to highlight
     * @param hazards array of grid rows to extract hazard ids from
     * @returns Array of {bl_id: bldg id, fl_id: floor id; rm_id: room id; activity_log_id: hazard id; dwgname: drawing name} objects
     */
    getHazardIdsForDrawing: function(hazards){
    	var hazardIds = [];
    	var tableName = "rm";
    	
    	if(hazards.length > 0 && hazards[0].panel.id != "abCbRptHlHaz_gridRepRooms"){
    		tableName = "activity_log";
    	}
    	
		for (var i = 0; i < hazards.length; i++) {
			var hazard = hazards[i];
			var dwgname = hazard.getFieldValue(tableName + ".dwgname");
			
			hazardIds.push({bl_id: hazard.getFieldValue(tableName + ".bl_id"),
				fl_id: hazard.getFieldValue(tableName + ".fl_id"),
				rm_id: hazard.getFieldValue(tableName + ".rm_id"),
				activity_log_id: hazard.getFieldValue("activity_log.activity_log_id"),
				dwgname: dwgname
			});
		}
		
		return hazardIds;
    },
    
    /**
     * Creates an array of hazard ids to highlight
     * @param hazards array of grid rows to extract hazard ids from
     * @returns Array of {bl_id: bldg id, fl_id: floor id; rm_id: room id; activity_log_id: hazard id; dwgname: drawing name} objects
     */
    getAllHazardIdsForDrawing: function(){
    	var hazardIds = [];
    	
    	var grid = View.panels.get('abCbRptHlHaz_gridRepHazards');
    	var parameters = grid.getParametersForRefresh();
    	parameters.recordLimit = -1;
    	var hazards = grid.getData(parameters).data.records;
    	
		for (var i = 0; i < hazards.length; i++) {
			var hazard = hazards[i];
			var dwgname = hazard["activity_log.dwgname"];
			
			hazardIds.push({bl_id: hazard["activity_log.bl_id"],
				fl_id: hazard["activity_log.fl_id"],
				rm_id: hazard["activity_log.rm_id"],
				activity_log_id: hazard["activity_log.activity_log_id"],
				dwgname: dwgname
			});
		}
		
		return hazardIds;
    },
    
    /**
     * Creates an array of sample ids to highlight
     * @param samples array of grid rows to extract sample ids from
     * @returns Array of {bl_id: bldg id, fl_id: floor id; rm_id: room id; sample_id: sample id; dwgname: drawing name} objects
     */
    getSampleIdsForDrawing: function(samples){
    	var sampleIds = [];
    	var tableName = "rm";
    	
    	if(samples.length > 0 && samples[0].panel.id != "abCbRptHlHaz_gridRepRooms"){
    		tableName = "activity_log";
    	}
    	
		for (var i = 0; i < samples.length; i++) {
			var sample = samples[i];
			var dwgname = sample.getFieldValue("cb_samples.dwgname");
			
			sampleIds.push({bl_id: sample.getFieldValue(tableName + ".bl_id"),
				fl_id: sample.getFieldValue(tableName + ".fl_id"),
				rm_id: sample.getFieldValue(tableName + ".rm_id"),
				sample_id: sample.getFieldValue("cb_samples.sample_id"),
				dwgname: dwgname
			});
		}
		
		return sampleIds;
    },
    
    /**
     * Creates an array of sample ids to highlight
     * @param samples array of grid rows to extract sample ids from
     * @returns Array of {bl_id: bldg id, fl_id: floor id; rm_id: room id; sample_id: sample id; dwgname: drawing name} objects
     */
    getAllSampleIdsForDrawing: function(){
    	var sampleIds = [];
    	
    	var grid = View.panels.get('abCbRptHlHaz_gridRepSamples');
    	var parameters = grid.getParametersForRefresh();
    	parameters.recordLimit = -1;
    	var samples = grid.getData(parameters).data.records;
    	
		for (var i = 0; i < samples.length; i++) {
			var sample = samples[i];
			var dwgname = sample["cb_samples.dwgname"];
			
			sampleIds.push({bl_id: sample["activity_log.bl_id"],
				fl_id: sample["activity_log.fl_id"],
				rm_id: sample["activity_log.rm_id"],
				sample_id: sample["cb_samples.sample_id"],
				dwgname: dwgname
			});
		}
		
		return sampleIds;
    }
});

/**
 * show building details for selected building 
 */
function abCbRptHlHaz_showBlDetails(node){
    //get bl id 
	var currentNode = View.panels.get('abCbRptHlHaz_ctryTree').lastNodeClicked;
	var blId = node.restriction.clauses[0].value;
    var node_rest = null;

    var controller = View.controllers.get('abCbRptHlHazCtrl');
    controller.blId = blId;
    controller.dwgCtrlLoc = null;
    
	//refresh rooms panel
    node_rest = new Ab.view.Restriction();
	node_rest.addClause('rm.bl_id', blId, '=');
	controller.abCbRptHlHaz_gridRepRooms.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlHaz_gridRepRooms.refresh(node_rest);
    setAllRowsSelectable(controller.abCbRptHlHaz_gridRepRooms, false);
    
	//refresh assessments items panel
    node_rest = new Ab.view.Restriction();
	node_rest.addClause('activity_log.bl_id', blId, '=');
	controller.abCbRptHlHaz_gridRepHazards.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlHaz_gridRepHazards.refresh(node_rest);
    setAllRowsSelectable(controller.abCbRptHlHaz_gridRepHazards, false);
    
	//refresh samples items panel
	controller.abCbRptHlHaz_gridRepSamples.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlHaz_gridRepSamples.refresh(node_rest);
    setAllRowsSelectable(controller.abCbRptHlHaz_gridRepSamples, false);
	
	// load ESRI map or building details
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', controller.blId, '=');
	if (controller.map) {
		controller.showPanels(false, false, true, true);
		controller.map.refresh(restriction);
    }
    else {
        controller.showPanels(true, false, true, false);
    	controller.abCbRptHlHaz_blDetailsPanel.refresh(restriction);
    }
}

/**
 *  show details for selected floor
 * @param {Object} node
 */
function abCbRptHlHaz_showGrid(node){
    var controller = View.controllers.get('abCbRptHlHazCtrl');
    controller.showPanels(false, true, true, false);
    var node_rest = null;
    
    //set restrictions and refresh for abCbRptHlHaz_gridRepRooms panel
    node_rest = new Ab.view.Restriction();
	node_rest.addClauses(node.restriction);
	controller.abCbRptHlHaz_gridRepRooms.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlHaz_gridRepRooms.refresh(node_rest);
    setAllRowsSelectable(controller.abCbRptHlHaz_gridRepRooms, true);

    //set restrictions and refresh for abCbRptHlHaz_gridRepHazards panel
    node_rest = new Ab.view.Restriction();
    node_rest.addClause('activity_log.bl_id', node.restriction.findClause("rm.bl_id").value, '=', true);
    node_rest.addClause('activity_log.fl_id', node.restriction.findClause("rm.fl_id").value, '=', true);
    controller.abCbRptHlHaz_gridRepHazards.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlHaz_gridRepHazards.refresh(node_rest);
    setAllRowsSelectable(controller.abCbRptHlHaz_gridRepHazards, true);

    //set restrictions and refresh for abCbRptHlHaz_gridRepSamples panel
    controller.abCbRptHlHaz_gridRepSamples.addParameter("consoleRestriction", controller.filterController.restriction);
    controller.abCbRptHlHaz_gridRepSamples.refresh(node_rest);
    setAllRowsSelectable(controller.abCbRptHlHaz_gridRepSamples, true);
    
    //set restrictions and refresh for abCbRptHlHaz_drawingPanel
    var currentNode = View.panels.get('abCbRptHlHaz_ctryTree').lastNodeClicked;
    controller.blId = currentNode.data['rm.bl_id'];
    controller.flId = currentNode.data['rm.fl_id'];
    controller.dwgName = currentNode.data['rm.raw_dwgname'];
    disPlayDrawing();
}

function mapLoadedCallback(panelId, mapId){
	// create the marker property to specify building markers for the map
	var markerProperty = new Ab.flash.ArcGISMarkerProperty(
		'abCbRptHlHaz_dsBuilding', 
		['bl.lat', 'bl.lon'], 
		['bl.bl_id'], 
		['bl.address']);
	mapControl.updateDataSourceMarkerPropertyPair('abCbRptHlHaz_dsBuilding', markerProperty);
	
	// show in map the selected building
	var controller = View.controllers.get("abCbRptHlHazCtrl");
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', controller.blId, '=');
	mapControl.refresh(restriction);
}

/**
 * highlight rooms, assessments or samples on drawing
 */
function highlightAssetsOnDwgLoad(){
	var dwgPanel = View.panels.get('abCbRptHlHaz_drawingPanel');
	var assetToDisplay = getSelectedRadioButton();
	var controller = View.controllers.get("abCbRptHlHazCtrl");
	
	var recsToHighlight = [];
	var recsType = "rm";
	switch (assetToDisplay) {
	case "rooms":
		recsToHighlight = controller.getAllRoomIdsForDrawing();
		recsType = "rm";
		break;

	case "hazards":
		recsToHighlight = controller.getAllHazardIdsForDrawing();
		recsType = "haz";
		break;

	case "samples":
		recsToHighlight = controller.getAllSampleIdsForDrawing();
		recsType = "sam";
		break;

	default:
		break;
	}
	
	setDwgHighlightForAreasReport(dwgPanel, recsToHighlight, recsType, null);
}

/**
 * highlight selected items on dwg
 * @param {Object} panel - Drawing panel
 * @param {Object} items - selected items
 * @param {Object} itemsType - type of the selected items (rm/haz/sam)
 * @param {Object} color The color of the highlight
 */
function setDwgHighlightForAreasReport(dwgPanel, items, itemsType, color){
	if (!valueExistsNotEmpty(abCbRptHlHazController.dwgName)) {
		return;
	}
	
	var assetToDisplay = getSelectedRadioButton();
	
	// default color is yellow for rooms, orange for hazards and samples
	var defaultColor = 0xFFFF00;
	if (assetToDisplay == "rooms") defaultColor =  0xFFFF00;
	else if (assetToDisplay == "hazards") defaultColor =  0xFF8000;
	else if (assetToDisplay == "samples") defaultColor = 0x101010;

	// determine the table name of the selected rooms/hazards/samples
	var itemsTable = "rm";
    if(itemsType == "rm") {
    	itemsTable = "rm";
    } else if(itemsType == "haz") {
    	itemsTable = "activity_log";
    } else if(itemsType == "sam") {
       	itemsTable = "activity_log";
    }
	
	// for each selected item, get the id for the item to highlight
	var opts = new DwgOpts();
	opts.rawDwgName = abCbRptHlHazController.dwgName;
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var blId = item.bl_id;
        var flId = item.fl_id;
        var assetId = "";
        
        if(assetToDisplay == "rooms") {
        	assetId = item.rm_id;
        	var id = blId + ";" + flId + ";" + assetId;
            opts.appendRec(id);
        } else if(assetToDisplay == "hazards") {
        	assetId = item.activity_log_id;
            opts.appendRecNonRm(blId, flId, assetId);
        } else if(assetToDisplay == "samples") {
        	assetId = item.sample_id;
        	opts.appendRecNonRm(blId, flId, assetId);
        }
    }
    
    showDwgToolbar(true,dwgPanel);
	
    // set the highlight color and call the highlight
	dwgPanel.setSelectColor((color ? color : defaultColor));
    dwgPanel.highlightAssets(opts);
}

/**
 * Displays the drawing, without highlighting
 */
function disPlayDrawing(){
	var controller = View.controllers.get("abCbRptHlHazCtrl");
	if(!controller.flId){
		View.showMessage(getMessage("selectAFloor"));
		return;
	}
	
    var radioButton = getSelectedRadioButton();
    if (radioButton == 'rooms') {
		addDrawingByType('abCbRptHlHaz_dsDrawingRmHighlight', 'abCbRptHlHaz_dsDrawingRmLabel', 'rm');
    } else if (radioButton == 'hazards') {
		addDrawingByType('abCbRptHlHaz_dsDrawingHazardsHighlight', 'abCbRptHlHaz_dsDrawingHazardsLabel', 'activity_log');
    } else if (radioButton == 'samples') {
		addDrawingByType('abCbRptHlHaz_dsDrawingSamplesHighlight', 'abCbRptHlHaz_dsDrawingSamplesLabel', 'cb_samples');
    }
	
	// unselect the rows in the grids
	View.panels.get("abCbRptHlHaz_gridRepRooms").unselectAll();
	View.panels.get("abCbRptHlHaz_gridRepHazards").unselectAll();
	View.panels.get("abCbRptHlHaz_gridRepSamples").unselectAll();
}

/**
 * Get the Asset Types radio button's selected value
 * @returns String
 */
function getSelectedRadioButton(){
    var radioButtons = document.getElementsByName("radioAssetType");
    
    for (var i = 0; i < radioButtons.length; i++) {
        if (radioButtons[i].checked) {
            return radioButtons[i].value;
        }
    }
    return null;
}


/**
 * set the currentHighlightDS, currentLabelsDS, the asset and locate it to the json and swf file
 */
function addDrawingByType(currentHighlightDS, currentLabelsDS, assetType){
   var drawingPanel = View.panels.get('abCbRptHlHaz_drawingPanel');
   var controller = View.controllers.get("abCbRptHlHazCtrl");
   var opts = new DwgOpts();

   if(valueExistsNotEmpty(controller.dwgCtrlLoc)){
	   drawingPanel.removeDrawing(controller.dwgCtrlLoc);
   }
   

   if (valueExistsNotEmpty(controller.dwgName)) {
	   drawingPanel.assetTypes = assetType; // table name;
	   drawingPanel.currentHighlightDS = currentHighlightDS;
	   drawingPanel.currentLabelsDS = currentLabelsDS;
	   
	   var dcl = new Ab.drawing.DwgCtrlLoc(controller.blId, controller.flId, null, controller.dwgName);
	   controller.dwgCtrlLoc = dcl;
	   drawingPanel.addDrawing.defer(200, drawingPanel, [dcl, opts]);
   }

}

/**
 * Returns an array of rooms, hazards or samples IDs (depending on the assets to highlight)
 * for all the assets selected in the 3 grids (Rooms, Hazards, Samples)
 * @returns {Array}
 */
function getSelectedAssetIdsFromAllGrids(){
	var controller = View.controllers.get("abCbRptHlHazCtrl");
	var assetToDisplay = getSelectedRadioButton();
	var rooms = View.panels.get("abCbRptHlHaz_gridRepRooms").getSelectedGridRows();
	var hazards = View.panels.get("abCbRptHlHaz_gridRepHazards").getSelectedGridRows();
	var samples = View.panels.get("abCbRptHlHaz_gridRepSamples").getSelectedGridRows();
	
	var assets = [];
	
	switch (assetToDisplay) {
	case "rooms":
		assets = controller.getRoomIdsForDrawing(rooms);
		assets = assets.concat(controller.getRoomIdsForDrawing(hazards));
		assets = assets.concat(controller.getRoomIdsForDrawing(samples));
		break;

	case "hazards":
		// search in Hazards grid all rows for the room
		var roomHazards = getAssetRows(rooms, View.panels.get("abCbRptHlHaz_gridRepHazards"));
		assets = controller.getHazardIdsForDrawing(roomHazards);
		
		assets = assets.concat(controller.getHazardIdsForDrawing(hazards));
		
		// search in Samples grid all rows for the hazard
		var roomSamples = getAssetRows(samples, View.panels.get("abCbRptHlHaz_gridRepHazards"));
		assets = assets.concat(controller.getHazardIdsForDrawing(roomSamples));
		break;

	case "samples":
		// search in Samples grid all rows for the room
		var roomSamples = getAssetRows(rooms, View.panels.get("abCbRptHlHaz_gridRepSamples"));
		assets = controller.getSampleIdsForDrawing(roomSamples);

		// search in Samples grid all rows for the hazard
		var hazardSamples = getAssetRows(hazards, View.panels.get("abCbRptHlHaz_gridRepSamples"));
		assets = assets.concat(controller.getSampleIdsForDrawing(hazardSamples));

		assets = assets.concat(controller.getSampleIdsForDrawing(samples));
		break;

	default:
		break;
	}
	
	return assets;
}

/**
 * Gets the hazard rows from Hazards grid
 * for the given room or sample rows
 * OR
 * Gets the sample rows from Samples grid
 * for the given room or hazard rows
 */
function getAssetRows(rows, assetGrid){
	var assets = [];
	
	for (var j = 0; j < rows.length; j++) {
		var row = rows[j];
	
		for (var i = 0; i < assetGrid.rows.length; i++) {
			var assetRow = assetGrid.rows[i].row;
			
			if(row.panel.id == "abCbRptHlHaz_gridRepRooms"){
				if(assetRow.getFieldValue('activity_log.bl_id') == row.getFieldValue('rm.bl_id')
						&& assetRow.getFieldValue('activity_log.fl_id') == row.getFieldValue('rm.fl_id')
						&& assetRow.getFieldValue('activity_log.rm_id') == row.getFieldValue('rm.rm_id'))
					assets.push(assetRow);
			} else {
				if(assetRow.getFieldValue('activity_log.activity_log_id') == row.getFieldValue('activity_log.activity_log_id'))
					assets.push(assetRow);
			}
		}
	}
	
	return assets;
}

/**
 * Returns the color for highlight depending on:
 * - if the row is selected
 * - the assets type to display
 * @param row
 */
function getColorForHighlight(row){
	var radioButton = getSelectedRadioButton();
	var color = null;
	
    if (radioButton == 'rooms') {
        color = 0x0000FF;	// blue
    } else if (radioButton == 'hazards') {
        color = 0xFF0000;	// red
    } else if (radioButton == 'samples') {
        //color = 0x00FF00;	// green
    	color = 0xFF0000;	// red
    }
	 
	return color;
}

/**
 * onMultipleSelectionChange for the grids
 * 
 * If showing rooms asset, when an assessment or a sample is selected, highlight just the associated room.
 * If showing assessments asset and a room is selected, highlight all assessments for that room. If a sample is selected, highlight just the one assessment for the sample.
 * If showing samples and a room or assessment is selected, highlight all samples for that room or assessment.
 * 
 * If the row is unselected, remove user-highlight for all items, and highlight again all selected items from the 3 grids
 * 
 */
function onGridsMultipleSelectionChange(row) {
	var dwgPanel = View.panels.get('abCbRptHlHaz_drawingPanel');
	var controller = View.controllers.get("abCbRptHlHazCtrl");
	var assetToDisplay = getSelectedRadioButton();
	var gridId = row.grid.id;
	
	var items = [];
	var itemsType = "rm";
		
	switch (assetToDisplay) {
	case "rooms":
		items = controller.getRoomIdsForDrawing([row.row]);
		itemsType = "rm";
		break;

	case "hazards":
		items = controller.getHazardIdsForDrawing([row.row]);
		itemsType = "haz";
		break;

	case "samples":
		items = controller.getSampleIdsForDrawing([row.row]);
		itemsType = "sam";
		break;

	default:
		break;
	}
	
	if(row.row.isSelected()){
		if(assetToDisplay == "hazards"
			&& (gridId == "abCbRptHlHaz_gridRepRooms" || gridId == "abCbRptHlHaz_gridRepSamples")){
			
				// search in Hazards grid all rows for the room or for the sample
				var hazards = getAssetRows([row.row], View.panels.get("abCbRptHlHaz_gridRepHazards"));
				items = controller.getHazardIdsForDrawing(hazards);
				itemsType = "haz";
		} else if(assetToDisplay == "samples"
			&& (gridId == "abCbRptHlHaz_gridRepRooms" || gridId == "abCbRptHlHaz_gridRepHazards")){
			
				// search in Samples grid all rows for the room or for the hazard
				var samples = getAssetRows([row.row], View.panels.get("abCbRptHlHaz_gridRepSamples"));
				items = controller.getSampleIdsForDrawing(samples);
				itemsType = "sam";
		}
	} else {
		// remove all user-highlight
		if(assetToDisplay == "rooms"){
			items = controller.getAllRoomIdsForDrawing();
		} else if(assetToDisplay == "hazards"){
			items = controller.getAllHazardIdsForDrawing();
		} else if(assetToDisplay == "samples"){
			items = controller.getAllSampleIdsForDrawing();
		}
		setDwgHighlightForAreasReport(dwgPanel, items, itemsType, null);
		
		// highlight according to selected items in the 3 grids
		items = getSelectedAssetIdsFromAllGrids();
	}
	
	var color = getColorForHighlight(row);
	setDwgHighlightForAreasReport(dwgPanel, items, itemsType, color);
}
