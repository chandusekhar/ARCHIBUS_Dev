var abRplmMapGoogleMapCtrl = View.createController('abRplmMapGoogleMapCtrl', {
	map: null,
	
	afterViewLoad: function(){
		var configObject = new Ab.view.ConfigObject();
		this.map = new Ab.gmap.Map('googleMap_mapPanel', 'mapContainer', configObject);
		this.map.addMouseClickEventHandler(this.onClickMarker);
		this.showMarkers();
	},
	
	afterInitialDataFetch: function() {
		  this.map.afterLayout();
	},
	
	showMarkers: function(){
		var dsMarkers = View.dataSources.get('dsBuildingMarkers');
		var restriction =  new Ab.view.Restriction();
		restriction.addClause('bl.state_id', 'PA', '=');
		restriction.addClause('bl.lat', '', 'IS NOT NULL');
		restriction.addClause('bl.lon', '', 'IS NOT NULL');
		
		var records = dsMarkers.getRecords(restriction);
		var pKeys = ["bl.bl_id"];
		var infoFlds = ["bl.bl_id", "bl.pr_id", "bl.name", "bl.address", "bl.total_suite_manual_area", "bl.total_suite_usable_area", "bl.manual_area_used_by_others", "bl.usable_area_used_by_others",
		                "bl.leases_number", "bl.purchasing_cost", "bl.value_book", "bl.value_market"];
		var infoFldsTitle = ["Building Code", "Property Code", "Building Name", "Address", "Total Suite Manual Area", "Total Suite Usable Area", "Total Leased Out Area (Suite Manual Area)", "Total Leased Out Area (Suite Usable Area)", 
		                     "Number of leases and subleases", "Purchasing Cost", "Value - Book", "Value - Market"];
		var latField = "bl.lat";
		var lonField = "bl.lon";
		
		this.map.showMarkers(records, pKeys, infoFlds, infoFldsTitle, latField, lonField);
		
	},
	
	onClickMarker: function(title , attributes){
		var blId = title;
		try{
			var blAbstractController = View.controllers.get('abRepmMapBlAbstractCtrl');
			blAbstractController.refreshView(blId);
	
			var leaseController = View.panels.get('viewRow3Col1').contentView.controllers.get('abMapLeaseCtrl');
			leaseController.refreshView(blId);
		} catch (e){		}
	}
})
