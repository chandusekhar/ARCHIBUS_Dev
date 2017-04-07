var abAllocWizStackFloorPlanController = View.createController('abAllocWizStackFloorPlanController', {
	/** The current showing building id.*/
	buildingId: '',
	
	/** The current showing floor id.*/
	floorId: '',
	
	/**
	 * Show the default floor plan.
	 */
	afterInitialDataFetch: function() {
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm.bl_id', this.buildingId, '=');
		restriction.addClause('rm.fl_id', this.floorId, '=');
		
		var records = this.floorPlanRoomDataSource.getRecords(restriction);
		if (records.length > 0) {
			var dwgname = records[0].getValue('rm.dwgname');
			var dcl = new Ab.drawing.DwgCtrlLoc(this.buildingId, this.floorId, null, dwgname);
			var opts = new DwgOpts();
			opts.rawDwgName = dwgname;
			this.stackFloorPlanDrawing.findAsset(dcl, opts, false, true, false);
		} else {
			View.alert(getMessage('noDrawing'));
		}
	}
});