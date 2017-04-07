/**
 * @author Guo Jiangtao
 */
var overallDrawingRestriction = new Ab.view.Restriction();

var abRiskMsdsRptDrawingController = View.createController('abRiskMsdsRptDrawingController', {

	// selected floor plan
	selectedFloorPlans : null,	  

	afterInitialDataFetch : function() { 
		
		this.abRiskMsdsRptDrawingAssignment.addParameter('tier2_notListed', getMessage('msg_tier2_notListed'));
		this.abRiskMsdsRptDrawingAssignment.addParameter('tier2_unknown', getMessage('msg_tier2_unknown'));
		this.abRiskMsdsRptDrawingAssignment.addParameter('tier2_hazardous', getMessage('msg_tier2_hazardous'));
		this.abRiskMsdsRptDrawingAssignment.addParameter('tier2_extremelyHazardous', getMessage('msg_tier2_extremelyHazardous'));
		
		this.abRiskMsdsRptDrawingAssignment_exportToPDF.addParameter('tier2_notListed', getMessage('msg_tier2_notListed'));
		this.abRiskMsdsRptDrawingAssignment_exportToPDF.addParameter('tier2_unknown', getMessage('msg_tier2_unknown'));
		this.abRiskMsdsRptDrawingAssignment_exportToPDF.addParameter('tier2_hazardous', getMessage('msg_tier2_hazardous'));
		this.abRiskMsdsRptDrawingAssignment_exportToPDF.addParameter('tier2_extremelyHazardous', getMessage('msg_tier2_extremelyHazardous'));

		// hide location form default
		this.abRiskMsdsRptDrawingFormLocation.show(false);
		// show drawing legend panel
		$('abRiskMsdsRptDrawingDrawingPanel_legendDiv').style.display = '';

		// if this view is opened as pop up with site and building restriction
		// then directly mark the selected tree node selected
		var siteId = View.getOpenerView().siteId
		if (siteId) {
			var root = this.abRiskMsdsRptDrawingTreeSite.treeView.getRoot();
			if (root) {
				var siteNodes = root.children;
				for ( var i = 0; i < siteNodes.length; i++) {
					// get selected site node
					if (siteNodes[i].data['site.site_id'] == siteId) {
						// mark node selected then refresh and expand the site
						// node
						siteNodes[i].setSelected(true);
						this.abRiskMsdsRptDrawingTreeSite.refreshNode(siteNodes[i]);
						siteNodes[i].expand();

						// get the all building node under the selected site
						// node
						var blId = View.getOpenerView().blId;
						var blNodes = siteNodes[i].children;

						for ( var j = 0; j < blNodes.length; j++) {
							// get the selected building node
							if (blNodes[j].data['bl.bl_id'] == blId) {
								// mark node seleted then refresh and expand the
								// building node
								blNodes[j].setSelected(true);
								this.abRiskMsdsRptDrawingTreeSite.refreshNode(blNodes[j]);
								blNodes[j].expand();

								// get all floor nodes and marke as selected
								var flNodes = blNodes[j].children;
								for ( var m = 0; m < flNodes.length; m++) {
									flNodes[m].setSelected(true);
								}

								break;
							}
						}

						break;
					}
				}
			}
		}
		
	},

	afterViewLoad : function() {
		if (this.checkLicense()) {  
			// register events of the drawing panel
			this.abRiskMsdsRptDrawingDrawingPanel.addEventListener('onclick', onRoomClicked);
			this.abRiskMsdsRptDrawingDrawingPanel.addEventListener('ondwgload', onDwgLoaded);
	
			// set the all tree level as multi-selected
			this.abRiskMsdsRptDrawingTreeSite.setMultipleSelectionEnabled(0);
			this.abRiskMsdsRptDrawingTreeSite.setMultipleSelectionEnabled(1);
			this.abRiskMsdsRptDrawingTreeSite.setMultipleSelectionEnabled(2);
	
			// kb#3035019 - highlight location details grid rows with colors to match drawing legend for tier2 hazard level
	        this.abRiskMsdsRptDrawingAssignment.afterCreateCellContent = function(row, column, cellElement) {
	        	var tier2 = (row['msds_location.tier2.raw'] != undefined) ? row['msds_location.tier2.raw'] : row['msds_location.tier2'];
				if (column.id == 'msds_location.tier2')	{
					if (tier2 == 'Unknown')	{
						cellElement.style.background = '#61C0C0';
					}
					else if (tier2 == 'Not Listed') {
						cellElement.style.background = '#69FF69';
					}
					else if (tier2 == 'Hazardous') {
						cellElement.style.background = '#FFAD69';
					}
					else if (tier2 == 'Extremely Hazardous') {
						cellElement.style.background = '#FF6969';
					}
				}
	        }
		}
	},

	checkLicense: function() {
		var filterButton = this.abRiskMsdsRptDrawingTreeSite.actions.get("showSeletedFloorPlan");		
		filterButton.show(false);
		try {
			var result = Workflow.callMethod("AbRiskCleanBuilding-CleanBuildingService-isActivityLicense", "AbRiskMSDS");
		} 
		catch (e) {
			Workflow.handleError(e);
			return false;
		}

		if (result.value) {
			filterButton.show(true);
			return true;
		} else {
			View.showMessage(getMessage("msg_no_license"));
			return false;
		} 
	},
	
	abRiskMsdsRptDrawingTreeSite_onShowSeletedFloorPlan : function() {
		if (this.checkSelection()) {
			// get all selected floor plans
			this.selectedFloorPlans = [];
			var flNodes = this.abRiskMsdsRptDrawingTreeSite.getSelectedNodes(2);
			var restriction = '';
			overallDrawingRestriction = '';
			for ( var i = 0; i < flNodes.length; i++) {
				var floorPlan = {};
				floorPlan['bl_id'] = flNodes[i].parent.data['bl.bl_id'];
				floorPlan['fl_id'] = flNodes[i].data["fl.fl_id"]
				floorPlan['dwgname'] = flNodes[i].data["fl.dwgname"]
				this.selectedFloorPlans.push(floorPlan);
				restriction += "OR (msds_location.bl_id='" + flNodes[i].parent.data['bl.bl_id'] + "' and msds_location.fl_id='" + flNodes[i].data["fl.fl_id"] + "') "
				overallDrawingRestriction += "OR (msds_location.bl_id='" + flNodes[i].parent.data['bl.bl_id'] + "' and msds_location.fl_id='" + flNodes[i].data["fl.fl_id"] + "') "
			}
			// clear the drawing panel before loading
			this.abRiskMsdsRptDrawingDrawingPanel.clear();
			// load first drawing, the other floor plans in array
			// selectedFloorPlans will be loaded in ondwgload method to avoid
			// loading exception
			this.addFirstDrawing();
			// refresh the locations grid			
			this.abRiskMsdsRptDrawingGridMsds.refresh(restriction.substring(2));
			// show and refresh the location assignments grid
			overallDrawingRestriction = (overallDrawingRestriction.substring(2));
			this.abRiskMsdsRptDrawingAssignment.show(true);
			this.abRiskMsdsRptDrawingAssignment.refresh(overallDrawingRestriction);
		}
	},

	/**
	 * check the tree selection
	 */
	checkSelection : function() {
		// get all selected sites nodes
		var siteNodes = this.abRiskMsdsRptDrawingTreeSite.getSelectedNodes(0);
		for ( var i = 0; i < siteNodes.length; i++) {
			// if site node not expand, refresh it to load children
			if (siteNodes[i].children.length == 0) {
				this.abRiskMsdsRptDrawingTreeSite.refreshNode(siteNodes[i]);
			}

			// make all building nodes in this site selected
			var blNodes = siteNodes[i].children;
			for ( var j = 0; j < blNodes.length; j++) {
				if (!blNodes[j].isSelected) {
					blNodes[j].setSelected(true);
				}
			}
		}

		// get all selected building nodes
		var blNodes = this.abRiskMsdsRptDrawingTreeSite.getSelectedNodes(1);
		for ( var i = 0; i < blNodes.length; i++) {
			// if building node not expand, refresh it to load children
			if (blNodes[i].children.length == 0) {
				this.abRiskMsdsRptDrawingTreeSite.refreshNode(blNodes[i]);
			}

			// make all floor nodes in this building selected
			var flNodes = blNodes[i].children;
			for ( var m = 0; m < flNodes.length; m++) {
				if (!flNodes[m].isSelected) {
					flNodes[m].setSelected(true);
				}
			}
		}

		// get all floor nodes, if no one selected, give a warning
		if (this.abRiskMsdsRptDrawingTreeSite.getSelectedNodes(2).length == 0) {
			View.showMessage(getMessage('error_noselection'));
			return false;
		}
		return true;
	},

	/**
	 * add first drawing to the drawing panel
	 */
	addFirstDrawing : function() {
		if (this.selectedFloorPlans.length > 0) {
			// load the first drawing, the other drawings in the list will be
			// loaded in listener onDwgLoaded
			// which can avoid bug when loading multiple drawing at the same
			// time
			this.floorPlan = this.selectedFloorPlans[0];
			var dcl = new Ab.drawing.DwgCtrlLoc(this.floorPlan['bl_id'], this.floorPlan['fl_id'], '', this.floorPlan['dwgname']);
			this.abRiskMsdsRptDrawingDrawingPanel.addDrawing(dcl, null);

			// remove the first drawing name and related building and floor in
			// the array,
			// so the next one became the first one in the array
			this.selectedFloorPlans.shift();
		}
	},

	abRiskMsdsRptDrawingFormLocation_onClearSelectedRoom : function() {
		// show location grid, hide details panel and assignment panel
		this.abRiskMsdsRptDrawingGridMsds.show(true);
		this.abRiskMsdsRptDrawingFormLocation.show(false);

		this.abRiskMsdsRptDrawingAssignment.refresh(overallDrawingRestriction);

		// make the selected room unselected
		var dcl = new Ab.drawing.DwgCtrlLoc(this.abRiskMsdsRptDrawingFormLocation.getFieldValue('rm.bl_id'), this.abRiskMsdsRptDrawingFormLocation.getFieldValue('rm.fl_id'),
			this.abRiskMsdsRptDrawingFormLocation.getFieldValue('rm.rm_id'));
		//var opts = new DwgOpts();
		
		View.getControl('', 'abRiskMsdsRptDrawingDrawingPanel').clearHighlights(dcl);
		this.abRiskMsdsRptDrawingTreeSite_onShowSeletedFloorPlan();
	}

});

/**
 * listener of the drawing onload event
 */
function onDwgLoaded() {
	// add next drawing in the drawing name array until all drawings are loaded
	abRiskMsdsRptDrawingController.addFirstDrawing();
}

/**
 * on click event handler when click tree node
 */
function onTreeClick(ob) {
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingTreeSite.selectAll(false);	
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingTreeSite.lastNodeClicked.setSelected(true);
	var loc = new Ab.drawing.DwgCtrlLoc();
	loc.setFromTreeClick(ob, "abRiskMsdsRptDrawingTreeSite");
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingDrawingPanel.clear();
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingDrawingPanel.addDrawing(loc);
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingGridMsds.refresh(ob.restriction);
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingFormLocation.show(false);
	
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingAssignment.refresh(ob.restriction);
	overallDrawingRestriction = ob.restriction;
}

/**
 * on click event handler when click drawing room
 */
function onRoomClicked(pk, selected) {
	var restriction = "rm.bl_id='" + pk[0] + "' AND " + "rm.fl_id='" + pk[1] + "' AND " + "rm.rm_id='" + pk[2] + "' ";
	if (selected) {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('msds_location.bl_id', pk[0]);
		restriction.addClause('msds_location.fl_id', pk[1]);
		restriction.addClause('msds_location.rm_id', pk[2]);
		abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingGridMsds.show(false);
		abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingFormLocation.refresh(restriction);
		abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingAssignment.refresh(restriction);
	} else {
		abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingGridMsds.show(true);
		abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingFormLocation.show(false);

		abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingAssignment.refresh(overallDrawingRestriction);
	}
}

/**
 * on click event handler of row click event for grid
 * abRiskMsdsRptDrawingGridMsds
 */
function selectRoom(row) {
	// refresh the details panel and assignment panel
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingGridMsds.show(false);
	//var restriction = row.row.getRecord().toRestriction();
	var selectedRecord = row.row.getRecord();
	var restriction = new Ab.view.Restriction();	
	restriction.addClause('msds_location.bl_id', selectedRecord.getValue('msds_location.bl_id'));
	restriction.addClause('msds_location.fl_id', selectedRecord.getValue('msds_location.fl_id'));
	restriction.addClause('msds_location.rm_id', selectedRecord.getValue('msds_location.rm_id'));
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingFormLocation.refresh(restriction);
	abRiskMsdsRptDrawingController.abRiskMsdsRptDrawingAssignment.refresh(restriction);
	// make the room selected in the floor plan
	View.getControl('', 'abRiskMsdsRptDrawingDrawingPanel').highlightAssets(null, row);
}

/**
 * on click event handler of row click event for grid
 * abRiskMsdsRptDrawingAssignment
 */
function showMSDSDetails(row) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("msds_data.msds_id", row['msds_location.msds_id'], "=");
	View.msdsRestriction = restriction;
	View.openDialog('ab-msds-rpt-map-msds-tab.axvw');
}

function refreshPanel(){
	var parentPanel = View.panels.get('abRiskMsdsRptDrawingAssignment');
	var targetPanel = View.panels.get('abRiskMsdsRptDrawingAssignment_exportToPDF');
	targetPanel.restriction = parentPanel.restriction;
	return true;
}