var esHighRmEmissionController = View.createController('esHighRmEm',{
	map: null,
	blId:null,
	rawDwgName: null,
	
    afterViewLoad: function(){
        //specify a handler for when drawing is fully loaded; to be able to manually set highlights after load
        this.esHighRmEmission_DrawingPanel.addEventListener('ondwgload', onDwgLoaded);
        
        // set message parameter for esHighRmEmissionProjectTree panel
        this.esHighRmEmissionProjectTree.addParameter('noDrawing', getMessage('noDrawing'));
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
    esHighRmEmissionFilterPanel_onShow: function(){
		var restriction = filterToSQLString(this.esHighRmEmissionFilterPanel);		
		restriction =  restriction.replace(/activity_log\./g, "a.");
		
        this.esHighRmEmissionProjectTree.addParameter('consoleRestriction', restriction);
		this.esHighRmEmissionProjectTree.addParameter('consoleRestrictionForCount', restriction.replace(/a\./g, "al."));
        this.esHighRmEmissionProjectTree.refresh();
        this.showPanels(false, false, false, false);
    },
	
	/**
	 * show/ hide panels
	 * @param {Object} showBlDet
	 * @param {Object} showDrawing
	 * @param {Object} showRep
	 * @param {Object} showMap
	 */
    showPanels: function(showBlDet, showDrawing, showRep, showMap){
        this.esHighRmEmissionBlDetails.show(showBlDet);  
		if (valueExists(FABridge.abDrawing))
        {
        	showDwgToolbar(showDrawing);
        	if (!showDrawing)
        		this.esHighRmEmission_DrawingPanel.clear();
       	}
        this.gridEsHighRmEmissionRep.show(showRep);
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
        geoCodeTool.geoCode('dsGeoBuildingHighRmEmission', restriction, 'bl', 'bl.bl_id', ['bl.lat', 'bl.lon'], ['bl.address1', 'bl.city_id', 'bl.state_id', 'bl.zip', 'bl.ctry_id'], true);
		// refresh the tree after geocoding
		var tree = this.esHighRmEmissionProjectTree;
		geoCodeTool.callbackMethod = function(){tree.refresh();};
    },
	
	/**
	 * generate paginated report for user selection
	 */
	esHighRmEmissionFilterPanel_onPaginatedReport: function(){
		if(this.esHighRmEmissionProjectTree._nodes.length == 0){
			View.showMessage(getMessage('err_no_project'));
		}else{
			createPaginatedReport('ab-es-hl-bl-rm-w-emission-pgrp.axvw', this.esHighRmEmissionFilterPanel);
		}
	}
})

/**
 * highlight rooms on drawing
 */
function onDwgLoaded(){
	var dwgPanel = View.panels.get('esHighRmEmission_DrawingPanel');
	var recsToHighlight = View.panels.get('gridEsHighRmEmissionRep').gridRows.items;
	var controller = View.controllers.get('esHighRmEm');
	setDwgHighlight(dwgPanel, recsToHighlight, controller.rawDwgName);
}

/**
 *  show details for selected floor
 * @param {Object} node
 */
function showGridEsHighRmEmissionRep(node){
	
    var controller = View.controllers.get('esHighRmEm');
    controller.showPanels(false, true, true, false);
    var currentNode = View.panels.get('esHighRmEmissionProjectTree').lastNodeClicked;
	
    //set restrictions and refresh for gridEsHighRmEmissionRep panel
    var projectId = currentNode.data['rm.city_id'];
    
    var node_rest = new Ab.view.Restriction();
	node_rest.addClauses(node.restriction);
    node_rest.removeClause('rm.city_id');
    node_rest.removeClause('rm.rm_id');
	node_rest.addClause('activity_log.project_id', projectId, '=', true); 
	node_rest.addClauses(controller.esHighRmEmissionFilterPanel.getRecord().toRestriction());
	
    controller.gridEsHighRmEmissionRep.refresh(node_rest);
    
    //set restrictions and refresh for esHighRmEmission_DrawingPanel
    var drawingPanel = View.panels.get('esHighRmEmission_DrawingPanel');
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
 * @param {Object} show
 */
function showDwgToolbar(show){
	var drawingPanel = View.panels.get('esHighRmEmission_DrawingPanel');
	drawingPanel.setToolbar('show', show);   
	if (show)
		drawingPanel.setToolbar('show', false, 'resetAssets,clearAssets');
}

/**
 * show building details for selected building 
 */
function showBlDetailsEsHighRmEmission(node){
    //get project id and bl id 
	var currentNode = View.panels.get('esHighRmEmissionProjectTree').lastNodeClicked;
    var projectId = currentNode.getAncestor().getAncestor().data['city.city_id'];
	var blId =  node.restriction.clauses[0].value;

    var controller = View.controllers.get('esHighRmEm');
    controller.blId = blId;
    
	//refresh assements items panel
    var node_rest = new Ab.view.Restriction();
	node_rest.addClause('activity_log.bl_id', blId, '=');
	node_rest.addClause('activity_log.project_id', projectId, '=');
	node_rest.addClauses(controller.esHighRmEmissionFilterPanel.getRecord().toRestriction());

    controller.gridEsHighRmEmissionRep.refresh(node_rest);
	
	// load ESRI map or building details
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
        } else {
            configMap();
        }
    } else {
        controller.showPanels(true, false, true, false);
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bl.bl_id', controller.blId, '=');
    	controller.esHighRmEmissionBlDetails.refresh(restriction);
    }
}

/**
 * configure map object and display marker
 */
function configMap(){
	var controller = View.controllers.get('esHighRmEm');
	createMarker(controller.htmlMap, controller.map, controller.blId, 'dsBuildingHighRmEmission');
}
