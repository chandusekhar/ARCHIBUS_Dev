var abEhsRptIncidentsMapLocTabsCtrl = View.createController('abEhsRptIncidentsMapLocTabsCtrl', {
	
	isValidGisLicense : true,
	
	selectedItems: null,
	
	// restriction as View.Restriction object
	consoleRestriction: null,
	
	// restriction as String
	consoleRestrictionString: "1=1",
	
	locations: null,
	
	afterInitialDataFetch : function() {
		this.isValidGisLicense = hasValidArcGisMapLicense();
		if(!this.isValidGisLicense){
			var objTabs = View.panels.get('abEhsRptIncidentsMapLocTabs_tabs');
			objTabs.selectTab('abEhsRptIncidentsMapLocTabs_tabLoc');
		}
	},
	
	refreshTabs: function() {
		if (this.getRestrictions()) {
			// we must refresh all tabs using tree and filter restrictions.
			var objTabs = View.panels.get('abEhsRptIncidentsMapLocTabs_tabs');
			
			// try to refresh map tab and select it

			var tabMap = objTabs.selectTab('abEhsRptIncidentsMapLocTabs_tabMap');
			var mapController = tabMap.getContentFrame().View.controllers.get('abEhsRptIncidentsMapLocTabsMapCtrl');
			mapController.showSelectedBuildings(this.selectedItems, this.locations.buildings);
			
			// refresh locations tabs
			var tabLocations = objTabs.findTab('abEhsRptIncidentsMapLocTabs_tabLoc');
			var locationList = View.panels.get('abEhsRptIncidentsMapLocTabsLoc_grid');
			var restriction = new Ab.view.Restriction();
			if (valueExists(this.selectedItems) && this.selectedItems.length > 0) {
				restriction.addClause('ehs_incidents.bl_id', this.selectedItems, 'IN');
			}
			if (valueExists(this.consoleRestriction) && this.consoleRestriction.clauses.length > 0) {
				restriction.addClauses(this.consoleRestriction, false, true);
			}
			locationList.refresh(restriction);
			
			// select the Locations tab if no ESRI licence
			if(!this.isValidGisLicense){
				objTabs.selectTab('abEhsRptIncidentsMapLocTabs_tabLoc');
			}
		}
	}, 
	
	getRestrictions: function(){
		// check tree selection and get selected buildings
		var openerView = View.getOpenerView();
		var treeView = openerView.panels.get('panel_row1col1').getContentFrame().View;
		var treeController = treeView.controllers.get('abEhsRptIncidentsMapTreeCtrl');
		if (!treeController.isNodeSelected()) {
			View.showMessage(getMessage('error_notreeselection'));
			return false;
		}
		// get selected buildings
		this.selectedItems = treeController.getSelectedBuildings();
		
		// get console restriction
		var consoleController = openerView.controllers.get('abEhsRptIncidentsMapConsoleCtrl');
		if (!consoleController.validateFilter()) {
			return false;
		}
		
		// get console restrictions
		var consoleRestrictions = consoleController.getConsoleRestriction();
		this.consoleRestriction = consoleRestrictions.consoleRestriction;
		this.consoleRestrictionString = consoleRestrictions.consoleRestrictionString;

		// get locations with console restriction
		this.locations = consoleController.getIncidentLocations();
		
		return true;
	},
	
	showBuildingDetails: function(blId){
		var objTabs = View.panels.get('abEhsRptIncidentsMapLocTabs_tabs');
		var locationList = View.panels.get('abEhsRptIncidentsMapLocTabsLoc_grid');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('ehs_incidents.bl_id', blId, '=');
		if (valueExists(this.consoleRestriction) && this.consoleRestriction.clauses.length > 0) {
			restriction.addClauses(this.consoleRestriction, false, true);
		}
		locationList.refresh(restriction);
		/*
		 * KB 3036268 - Disable tab navigation. 
		 * IE performance issue when select drawing. 
		 */
		//objTabs.selectTab('abEhsRptIncidentsMapLocTabs_tabLoc');
		
		// show popup with the floors
		var restrictionString = this.consoleRestrictionString + " AND ehs_incidents.bl_id = '" + blId + "'";
		View.openDialog('ab-ehs-rpt-incidents-map-loc-tabs-fl.axvw', null, false, {
			consoleRestriction: restrictionString
		});
	}
})
