/**
 * overwrite function to make add project on node restriction
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
		// bldg level, we must add project
		if(level == 2 && parentNode.parent.data['city.city_id'] != undefined){
			restriction.addClause('bl.city_id', parentNode.parent.data['city.city_id']);
		}
		//floor level, we must add project and site
		if(level == 3 && parentNode.parent.data['site.site_id'] != undefined && parentNode.parent.parent.data['city.city_id'] != undefined){
			restriction.addClause('rm.site_id', parentNode.parent.data['site.site_id']);
			restriction.addClause('rm.city_id', parentNode.parent.parent.data['city.city_id']);
		}
	}
	
	return restriction;
}

var abCbRptHlBlRmPrjController = View.createController('abCbRptHlBlRmPrjCtrl',{
	blId: null,
	map: null,
	filterController: null,

	pagRepRestriction: null,
	printableRestriction: null,
	defaultPagRepRestriction: "(EXISTS(SELECT 1 FROM rm WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND rm.dwgname IS NOT NULL)"
			+ " OR activity_log.dwgname IS NOT NULL)"
			+ " AND activity_log.project_id IS NOT NULL"
			+ " AND EXISTS(SELECT 1 FROM project WHERE project.project_id = activity_log.project_id AND project.project_type='ASSESSMENT - HAZMAT' AND project.is_template = 0)",
	
	paginatedReportName: 'ab-cb-rpt-hl-bl-rm-pgrp.axvw',

	// true if floor selected, false if building selected
	showDrawing: false,

	// drawing name for highlighting the assets
	currentDwgName: null,
	
    afterViewLoad: function(){
    	var controller = this;

		this.pagRepRestriction = this.defaultPagRepRestriction;

    	this.filterController = View.controllers.get("abCbRptCommonFilterCtrl");
    	this.filterController.panelsCtrl = this;
    	this.filterController.visibleFields = "site";
    	this.filterController.paginatedReportName = "ab-cb-rpt-hl-bl-rm-prj-pgrp.axvw";
        
        /*
         * Specify a handler after resize of the drawing (drag of the layout region bar),
         * to hide/show the drawing panel
         */
        this.abCbRptHlBlRmPrj_drawingPanel.addEventListener('afterResize', function(){
        	if (!controller.showDrawing){
        		controller.abCbRptHlBlRmPrj_drawingPanel.parentElement.style.height ="0px";
    		}
        });
		
		// set message parameter for esHighRmHazWastProjectTree panel
		this.abCbRptHlBlRmPrj_projectTree.addParameter('noDrawing',getMessage('noDrawing'));
		
		this.abCbRptHlBlRmPrj_drawingPanel.setDiagonalSelectionPattern(true);
		// add onMultipel selection change event listener
		this.abCbRptHlBlRmPrj_gridRep.addEventListener('onMultipleSelectionChange', abCbRptHazBlMapDrilldown_itemsDetails_onMultipleSelectionChange);
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.abCbRptHlBlRmPrj_drawingPanel.addEventListener('onclick', onClickHandler);
    	this.abCbRptHlBlRmPrj_drawingPanel.addEventListener('onselecteddatasourcechanged', onChangeHighlightDS);        
		
    },
 
    afterInitialDataFetch: function(){
      	this.showPanels(false, false, true, true);
		this.initializeMap();
    	//apply esri css to panel
        this.abCbRptHlBlRmPrj_htmlMap.className = 'claro';      
    },
 
    initializeMap:function(){
    	//create map object if not yet created
    	if(this.map==null){
            var configObject = new Ab.view.ConfigObject();

        	//create mapControl
        	this.map = new Ab.arcgis.ArcGISMap('abCbRptHlBlRmPrj_htmlMap', 'abCbRptHlBlRmPrj_objMap', configObject);
        	// create the marker property to specify building markers for the map
        	var markerProperty = new Ab.arcgis.ArcGISMarkerProperty(
        		'abCbRptHlBlRmPrj_dsBuilding', 
        		['bl.lat', 'bl.lon'],
        		['bl.bl_id'],
        		['bl.site_id', 'bl.bl_id', 'bl.name', 'bl.address']);
        	
        	// show in map the selected building
        	this.map.updateDataSourceMarkerPropertyPair('abCbRptHlBlRmPrj_dsBuilding', markerProperty);

      		// basemap layer menu
     	    var basemapLayerMenu = this.abCbRptHlBlRmPrj_htmlMap.actions.get('basemapLayerMenu');
    		basemapLayerMenu.clear();
    		var basemapLayers = this.map.getBasemapLayerList();
    		for (var i=0; i<basemapLayers.length; i++){
    			basemapLayerMenu.addAction(i, basemapLayers[i], this.switchBasemapLayer);
    		}

		}
    },
    
    switchBasemapLayer: function(item) {
    	//switch the map layer based on the passed in layer name.
    	abCbRptHlBlRmPrjController.map.switchBasemapLayer(item.text);
    },   
        
    abCbRptHlBlRmPrj_gridRep_afterRefresh: function(){
		this.abCbRptHlBlRmPrj_gridRep.enableSelectAll(false);
    },

    abCbRptHlBlRmPrj_drawingPanel_onPaginatedReport: function() {

        var floorsRestriction = [];        
        floorsRestriction.push({'title': getMessage("floors"), 'value': this.currentDwgName});
        this.printableRestriction = this.filterController.printableRestriction;
    
    	var parameters = {
			'consoleRestriction': this.filterController.getConsoleRestriction(),
			'userAssignedRestriction': this.getFloorsRestriction(),
			'printRestriction': true, 
			'printableRestriction': this.printableRestriction.concat(floorsRestriction)
    	};

    	View.openPaginatedReportDialog(this.paginatedReportName, null, parameters);    	
    },

    getFloorsRestriction: function() {
        var currentNode = this.abCbRptHlBlRmPrj_projectTree.lastNodeClicked;       
        var dwgRestr = " (activity_log.bl_id = '" + currentNode.data['rm.bl_id'] + "' AND activity_log.fl_id = '" + currentNode.data['rm.fl_id'] + "')";
        return dwgRestr;
    },
    
	/**
	 * Shows the tree according to the user restrictions
	 */
	refreshOnFilter: function(restriction, instrLabels){
		restriction =  restriction.replace(/activity_log\./g, "a.");
        this.abCbRptHlBlRmPrj_projectTree.addParameter('consoleRestriction', restriction);
		this.abCbRptHlBlRmPrj_projectTree.addParameter('consoleRestrictionForCount', restriction.replace(/a\./g, "al."));
        this.abCbRptHlBlRmPrj_projectTree.refresh();
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
    	this.showDrawing = showDrawing;

    	this.abCbRptHlBlRmPrj_blDetailsPanel.show(showBlDet); 
        
		if (valueExists(FABridge.abDrawing)) {
        	showDwgToolbar(showDrawing, this.abCbRptHlBlRmPrj_drawingPanel);
            if (!showDrawing) {
        	  this.abCbRptHlBlRmPrj_drawingPanel.clear();
              this.abCbRptHazBlMapDrilldown_legendGrid.show(false);
              this.abCbRptHazBlMapDrilldown_borderLegendGrid.show(false);
            }
      	}
        this.abCbRptHlBlRmPrj_gridRep.show(showRep);
        this.abCbRptHlBlRmPrj_htmlMap.show(showMap);
    }	
});

/**
 * show building details for selected building 
 */
function abCbRptHlBlRmPrj_showBlDetails(node){
    //get project id and bl id 
	var currentNode = View.panels.get('abCbRptHlBlRmPrj_projectTree').lastNodeClicked;
    var projectId = currentNode.getAncestor().getAncestor().data['city.city_id'];
	var blId = node.restriction.clauses[0].value;

    var controller = View.controllers.get('abCbRptHlBlRmPrjCtrl');
    controller.blId = blId;

	//refresh assessments items panel
    var node_rest = new Ab.view.Restriction();
	node_rest.addClause('activity_log.bl_id', blId, '=');
	node_rest.addClause('activity_log.project_id', projectId, '=');
	
    var filterRes = controller.filterController.restriction ? controller.filterController.restriction : "1=1";
	controller.abCbRptHlBlRmPrj_gridRep.addParameter("consoleRestriction", filterRes);
    controller.abCbRptHlBlRmPrj_gridRep.refresh(node_rest);
    
	// load ESRI map or building details
	var restriction = new Ab.view.Restriction();
	restriction.addClause('bl.bl_id', controller.blId, '=');
	if (controller.map) {
		controller.showPanels(false, false, true, true);
		controller.map.refresh(restriction);
	} else {
        controller.showPanels(true, false, true, false);
    	controller.abCbRptHlBlRmPrj_blDetailsPanel.refresh(restriction);
    }
    
    //hide selection checkboxes
    if (controller.abCbRptHlBlRmPrj_gridRep.multipleSelectionEnabled) {
        controller.abCbRptHlBlRmPrj_gridRep.showColumn("multipleSelectionColumn", false);
        controller.abCbRptHlBlRmPrj_gridRep.multipleSelectionEnabled = false;    
        controller.abCbRptHlBlRmPrj_gridRep.update();
    }
}

/**
 *  show details for selected floor
 * @param {Object} node
 */
function abCbRptHlBlRmPrj_showGrid(node){
    var controller = View.controllers.get('abCbRptHlBlRmPrjCtrl');
    controller.showPanels(false, true, true, false);
    var currentNode = View.panels.get('abCbRptHlBlRmPrj_projectTree').lastNodeClicked;
    
    //set restrictions and refresh for abCbRptHlBlRmPrj_gridRep panel
    var projectId = currentNode.data['rm.city_id'];
    
    var node_rest = new Ab.view.Restriction();
	node_rest.addClauses(node.restriction);
    node_rest.removeClause('rm.city_id');
    node_rest.removeClause('rm.rm_id');
	node_rest.addClause('activity_log.project_id', projectId, '=', true); 
    
    var dwgRestr = controller.filterController.restriction ? controller.filterController.restriction : "1=1";
	controller.abCbRptHlBlRmPrj_gridRep.addParameter("consoleRestriction", dwgRestr);
    controller.abCbRptHlBlRmPrj_gridRep.refresh(node_rest);

    dwgRestr += " AND " + " (activity_log.bl_id = '" + currentNode.data['rm.bl_id'] + "' AND activity_log.fl_id = '" + currentNode.data['rm.fl_id'] + "')";
    dwgRestr += " AND " + " (activity_log.project_id = '" + projectId + "')";

	controller.pagRepRestriction = controller.defaultPagRepRestriction + " AND " + dwgRestr;
    
	controller.abCbRptHazBlMapDrilldown_highlightDs.addParameter('consoleRestriction', dwgRestr);
	controller.abCbRptHazBlMapDrilldown_highlightRankDs.addParameter('consoleRestriction', dwgRestr);
	controller.abCbRptHazBlMapDrilldown_highlightRatingDs.addParameter('consoleRestriction', dwgRestr);
    
    //show selection checkboxes
    if (!controller.abCbRptHlBlRmPrj_gridRep.multipleSelectionEnabled) {
        controller.abCbRptHlBlRmPrj_gridRep.showColumn("multipleSelectionColumn", true);
        controller.abCbRptHlBlRmPrj_gridRep.multipleSelectionEnabled = true;    
        controller.abCbRptHlBlRmPrj_gridRep.update();
    }
    
    refreshDrawingPanel();
}

function refreshDrawingPanel(){
	//set restrictions and refresh for abCbRptHlBlRmPrj_drawingPanel
    var drawingPanel = View.panels.get('abCbRptHlBlRmPrj_drawingPanel');
    var currentNode = View.panels.get('abCbRptHlBlRmPrj_projectTree').lastNodeClicked;
    var controller = View.controllers.get('abCbRptHlBlRmPrjCtrl');
    var blId = currentNode.data['rm.bl_id'];
    var flId = currentNode.data['rm.fl_id'];
    controller.currentDwgName = currentNode.data['rm.raw_dwgname'];
    if (valueExistsNotEmpty(controller.currentDwgName)) {
        var dcl = new Ab.drawing.DwgCtrlLoc(blId, flId, null, controller.currentDwgName);
        drawingPanel.addDrawing(dcl);
		drawingPanel.isLoadDrawing = true;
    }else{
    	drawingPanel.clear();
		drawingPanel.isLoadDrawing = false;
    }
}

/**
 * OnClick event handler for drawing
 * @param pkey
 * @param selected
 */
function onClickHandler(pkey, selected){
	var objDetailsGrid = View.panels.get("abCbRptHlBlRmPrj_gridRep");
	
	objDetailsGrid.gridRows.each(function(gridRow){
		if (gridRow.getFieldValue('rm.bl_id') == pkey[0] && gridRow.getFieldValue('rm.fl_id') == pkey[1] && gridRow.getFieldValue('rm.rm_id') == pkey[2]) {
			if (selected) {
				gridRow.select();
			} else {
				gridRow.unselect();
			}
			var suffix = selected ? " selected" : "";
			var cn = gridRow.dom.className;
			var j = 0;
			if ((j = cn.indexOf(" selected")) > 0)
				cn = cn.substr(0, j);
			gridRow.dom.className=cn + suffix;
		}
	});
}

/**
 * On Multiple selection change for item details grid panel.
 * @param row current row
 */
function abCbRptHazBlMapDrilldown_itemsDetails_onMultipleSelectionChange(row){
	var dwgPanel = View.panels.get('abCbRptHlBlRmPrj_drawingPanel');
	var controller = View.controllers.get("abCbRptHlBlRmPrjCtrl");
	
	// setSelectColor() generates error if the drawing is not loaded
	if(!dwgPanel.dwgLoaded && row.row.isSelected()){
		dwgPanel.addDrawing(row, null);
		dwgPanel.isLoadDrawing = true;
	}
	
	// red if the row is selected or if there is another selected item for this item's room
	if(row.row.isSelected()) {
		
		var roomArray = [];
		var room = [row.row.getFieldValue('rm.bl_id'), row.row.getFieldValue('rm.fl_id'), row.row.getFieldValue('rm.rm_id')];
		roomArray.push(room);
		//dwgPanel.setSelectColor(0xFF0000);	// red
		dwgPanel.selectAssets(roomArray);
		//dwgPanel.highlightAssets(null, row);
	} else if(!existsSelectedItemInSameRoom(controller.abCbRptHlBlRmPrj_gridRep, row.row, 'rm')){
		var roomArray = [];
		var room = [row.row.getFieldValue('rm.bl_id'), row.row.getFieldValue('rm.fl_id'), row.row.getFieldValue('rm.rm_id')];
		roomArray.push(room);
		dwgPanel.unselectAssets(roomArray);
		//dwgPanel.highlightAssets(null, row);
	}
}

function onExportDocxReport(panel, pagRepName){
	var controller = View.controllers.get("abCbRptHlBlRmPrjCtrl");
	var floorsRestriction = [];
    floorsRestriction.push({'title': getMessage("floors"), 'value': controller.currentDwgName});

	controller.printableRestriction = controller.filterController.printableRestriction;
	
	var parameters = {
	        'consoleRestriction': controller.pagRepRestriction,
	        'printRestriction': true, 
	        'printableRestriction': controller.printableRestriction.concat(floorsRestriction)
	};
	
	View.openPaginatedReportDialog('ab-cb-assess-list-pgrpt.axvw', null, parameters);
}

/**
 * onchange event handler when select the highlight datasource
 * 
 * @param {string}  type
 */
function onChangeHighlightDS(type){
	var dwgPanel = View.panels.get('abCbRptHlBlRmPrj_drawingPanel');
	if (dwgPanel.isLoadDrawing && type == 'highlight') {
		View.panels.get('abCbRptHazBlMapDrilldown_legendGrid').config.title = View.dataSources.get(dwgPanel.currentHighlightDS).title;
	}
	
	if (dwgPanel.isLoadDrawing && type == 'bordersHighlight') {
		View.panels.get('abCbRptHazBlMapDrilldown_borderLegendGrid').config.title = View.dataSources.get(dwgPanel.currentBordersHighlightDS).title;
	}
}