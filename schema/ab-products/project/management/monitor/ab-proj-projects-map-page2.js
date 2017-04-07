var projProjectsMapPage2Controller = View.createController('projProjectsMapPage2', {
	projectId: null,
	blId: null,
	
	afterViewLoad: function() {
		this.projProjectsMapPage2_itemsDetails.addEventListener('onMultipleSelectionChange', function(row) {
			if (!View.panels.get('projProjectsMapPage2_cadPanel').highlightAssets(null, row) && row.row.isSelected())
				row.row.unselect();
		});
	},
	
	afterInitialDataFetch: function() {
		this.projectId = View.getOpenerView().controllers.get('projProjectsMapPage1').projectId;
		this.blId = View.getOpenerView().controllers.get('projProjectsMapPage1').blId;
		var restriction = new Ab.view.Restriction();
		if (this.projectId) restriction.addClause('activity_log.project_id', this.projectId);
		if (this.blId) restriction.addClause('activity_log.bl_id', this.blId);
		this.projProjectsMapPage2_floorsGrid.refresh(restriction);
		this.projProjectsMapPage2_itemsDetails.refresh(restriction);
	},
	
	projProjectsMapPage2_floorsGrid_onShowFloors: function(row, action) {
		var record = row.getRecord();
		var bl_id = record.getValue('activity_log.bl_id');
		var fl_id = record.getValue('activity_log.fl_id');
		var dwgname = record.getValue('rm.dwgname');
		var drawing = new Ab.drawing.DwgCtrlLoc(bl_id, fl_id, null, dwgname);
		this.projProjectsMapPage2_cadPanel.addDrawing(drawing, null);
		
		var dwgnames = [];
		var currentRestriction = this.projProjectsMapPage2_itemsDetails.restriction;
		if (currentRestriction) {
			var currentValues = null;
			for (var i = 0; i < currentRestriction.clauses.length; i++) {
				if (currentRestriction.clauses[i].name == 'activity_log.rm_activity_dwgname') currentValues = currentRestriction.clauses[i].value;
			}
			if (currentValues) dwgnames = currentValues;
		}
    	dwgnames.push(dwgname); 
		var restriction = new Ab.view.Restriction();
		restriction.addClause('activity_log.rm_activity_dwgname', dwgnames, "IN", "AND");
		if (this.projectId) restriction.addClause('activity_log.project_id', this.projectId);
		this.projProjectsMapPage2_itemsDetails.refresh(restriction);
	},
	
	projProjectsMapPage2_floorsGrid_onClearDrawings: function() {		
		var restriction = new Ab.view.Restriction();
		if (this.projectId) restriction.addClause('activity_log.project_id', this.projectId);
		if (this.blId) restriction.addClause('activity_log.bl_id', this.blId);
		this.projProjectsMapPage2_floorsGrid.refresh(restriction);
		this.projProjectsMapPage2_itemsDetails.refresh(restriction);	
		this.projProjectsMapPage2_itemsDetails.setAllRowsSelected(false);
		
		this.projProjectsMapPage2_cadPanel.clear();
		this.projProjectsMapPage2_legendGrid.clear();
	}
});