var caHighRmMissSupController = View.createController('caHighRmMissSup',{
	map: null,
	blId:null,
	rawDwgName: null,
    afterViewLoad: function(){
        //specify a handler for when drawing is fully loaded; to be able to manually set highlights after load
        this.caHighRmMissSup_DrawingPanel.addEventListener('ondwgload', onDwgLoaded);
		
		// set message parameter for caHighRmMissSupProjectTree panel
		this.caHighRmMissSupProjectTree.addParameter('noDrawing',getMessage('noDrawing'));
    },
	
    afterInitialDataFetch: function(){
		var isValidGisMap = hasValidArcGisMapLicense();
		if (isValidGisMap) {
	        this.showPanels(false, false, true, true);
	        var configObject = new Ab.view.ConfigObject();
	        if(this.map==null){
	           this.map = new Ab.arcgis.ArcGISMap('htmlMap', 'objMap', configObject);
	        }
		}
    	
    },

    /**
     * apply console restriction and refresh the page
     */
    caHighRmMissSupFilterPanel_onShow: function(){
		var restriction = filterToSQLString(this.caHighRmMissSupFilterPanel);		
		restriction =  restriction.replace(/activity_log\./g, "a.");
        this.caHighRmMissSupProjectTree.addParameter('consoleRestriction', restriction);
		this.caHighRmMissSupProjectTree.addParameter('consoleRestrictionForCount', restriction.replace(/a\./g, "al."));
        this.caHighRmMissSupProjectTree.refresh();
        this.showPanels(false, false, false, false);
    },

	/**
	 * show/ hide panels
	 * @param {boolean} showBlDet
	 * @param {boolean} showDrawing
	 * @param {boolean} showRep
	 * @param {boolean} showMap
	 */
    showPanels: function(showBlDet, showDrawing, showRep, showMap){
        this.caHighRmMissSupBlDetails.show(showBlDet);
		if (valueExists(FABridge.abDrawing))
        {
        	showDwgToolbar(showDrawing);
        	if (!showDrawing)
        		this.caHighRmMissSup_DrawingPanel.clear();
       	}
        this.gridCaHighRmMissSupRep.show(showRep);
        this.htmlMap.show(showMap);
        var reportTargetPanel = document.getElementById("htmlMap");
      	reportTargetPanel.className = 'claro';
    },
	
	/**
	 * geocode a building
	 */
    htmlMap_onGeocode: function(){
        var geoCodeTool = new Ab.arcgis.Geocoder(this.map);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', this.blId, '=');
        geoCodeTool.geoCode('dsGeoBuildingHighRmMissSup', restriction, 'bl', 'bl.bl_id', ['bl.lat', 'bl.lon'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], true);
		// refresh the tree after geocoding
		var tree = this.caHighRmMissSupProjectTree;
		geoCodeTool.callbackMethod = function(){tree.refresh();};
    },
	
	/**
	 * generate paginated report for user selection
	 */
	caHighRmMissSupFilterPanel_onPaginatedReport: function(){
		if(this.caHighRmMissSupProjectTree._nodes.length == 0){
			View.showMessage(getMessage('err_no_project'));
		}else{
			createPaginatedReport('ab-ca-hl-bl-rm-w-miss-sup-pgrp.axvw', this.caHighRmMissSupFilterPanel);
		}
	}
})

/**
 * highlight rooms on drawing
 */
function onDwgLoaded(){
	var dwgPanel = View.panels.get('caHighRmMissSup_DrawingPanel');
	var recsToHighlight = View.panels.get('gridCaHighRmMissSupRep').gridRows.items;
	var controller = caHighRmMissSupController;
	setDwgHighlight(dwgPanel, recsToHighlight, controller.rawDwgName);
}

/**
 *  show details for selected floor
 * @param {Object} node
 */
function showGridCaHighRmMissSupRep(node){
    var controller = caHighRmMissSupController;
    controller.showPanels(false, true, true, false);
    var currentNode = View.panels.get('caHighRmMissSupProjectTree').lastNodeClicked;
    
    //set restrictions and refresh for gridCaHighRmMissSupRep panel
    var projectId = currentNode.data['rm.city_id'];

    var node_rest = new Ab.view.Restriction();
	node_rest.addClauses(node.restriction);
    node_rest.removeClause('rm.city_id');
    node_rest.removeClause('rm.rm_id');
	node_rest.addClause('activity_log.project_id', projectId, '=', true); 
	node_rest.addClauses(controller.caHighRmMissSupFilterPanel.getRecord().toRestriction());
    
    controller.gridCaHighRmMissSupRep.refresh(node_rest);
    
    //set restrictions and refresh for caHighRmMissSup_DrawingPanel
    var drawingPanel = View.panels.get('caHighRmMissSup_DrawingPanel');
    var blId = currentNode.data['rm.bl_id'];
    var flId = currentNode.data['rm.fl_id'];
    controller.rawDwgName = currentNode.data['rm.raw_dwgname'];
    if (valueExistsNotEmpty(controller.rawDwgName)) {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, controller.rawDwgName);
        drawingPanel.addDrawing(dcl);
    } else {
    	drawingPanel.clear();
    }
}

/**
 * show drawing toolbar
 * @param {boolean} show
 */
function showDwgToolbar(show){
	var drawingPanel = View.panels.get('caHighRmMissSup_DrawingPanel');
	drawingPanel.setToolbar('show', show);   
	if (show)
		drawingPanel.setToolbar('show', false, 'resetAssets,clearAssets');
}

/**
 * show building details for selected building 
 */
function showBlDetailsCaHighRmMissSup(node){
    //get project id and bl id 
	var currentNode = View.panels.get('caHighRmMissSupProjectTree').lastNodeClicked;
    var projectId = currentNode.getAncestor().getAncestor().data['city.city_id'];
	var blId =  node.restriction.clauses[0].value;

    var controller = View.controllers.get('caHighRmMissSup');
    controller.blId = blId;

	//refresh assements items panel
    var node_rest = new Ab.view.Restriction();
	node_rest.addClause('activity_log.bl_id', blId, '=');
	node_rest.addClause('activity_log.project_id', projectId, '=');
	node_rest.addClauses(controller.caHighRmMissSupFilterPanel.getRecord().toRestriction());
	
	/*
	 * KB 3029294 Ioan 11/10/2010
	 * add refresh command 
	 */
	controller.gridCaHighRmMissSupRep.refresh(node_rest);
	
	// load ESRI map or building details
	var restriction = new Ab.view.Restriction();
	var isValidGisMap = hasValidArcGisMapLicense();
    if (isValidGisMap) {
        controller.showPanels(false, false, true, true);
        var configObject = new Ab.view.ConfigObject();
        if(controller.map==null){
           controller.map = new Ab.arcgis.ArcGISMap('htmlMap', 'objMap', configObject);
        }
        if (!controller.map.mapInited) {
            setTimeout("configMap()", 500);
            return;
        }
        else {
            configMap();
        }
    }
    else {
        controller.showPanels(true, false, true, false);
		restriction.addClause('bl.bl_id', controller.blId, '=');
    	controller.caHighRmMissSupBlDetails.refresh(restriction);
    }
}

/**
 * configure map object and display marker
 */
function configMap(){
	var controller = View.controllers.get('caHighRmMissSup');;
	createMarker(controller.htmlMap, controller.map, controller.blId, 'dsBuildingHighRmMissSup');
}
