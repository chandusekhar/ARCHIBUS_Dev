// CHANGE LOG:


// *****************************************************************************
// View controller object for the Info tab.
// *****************************************************************************
// 2012/10 - DC - added to handle vehicle request.

var infoTabController = View.createController('infoTabController', {


	// ************************************************************************
	afterViewLoad: function() {
		this.inherit();
		
		
		//
		//
		//	View.getControl('', 'rmDetail_cadPanel').addDrawing(row, null);
		//	
		//	var bldg = row.row.getFieldValue("rm.bl_id");
		//	var floor = row.row.getFieldValue("rm.fl_id");
		//	var i = 0;
		//	var found = false;
		//	var res = new Ab.view.Restriction();	
		//			
		//	// cycle through list of existing loaded floors, and append/remove as needed
		//	// also construct a restriction to included all loaded floors
		//	if (row.row.isSelected()) {
		//		for (i = 0; i < loadedFloors.length; i++) {
		//			var ar = loadedFloors[i];
		//			if (ar == null)
		//				continue;
		//			if (ar[0] == bldg && ar[1] == floor)
		//				found = true;
		//				
		//			res.addClause('rm.bl_id', ar[0], '=', ((i == 0) ? true : ')OR('));
		//			res.addClause('rm.fl_id', ar[1], '=');
		//		}
		//		
		//		if (!found) {
		//			loadedFloors[loadedFloors.length] = new Array(bldg, floor);
		//			res.addClause('rm.bl_id', bldg, '=', ((i == 0) ? true : ')OR('));
		//			res.addClause('rm.fl_id', floor, '=');
		//		}
		//	} else {	// the row is not selected
		//		// cycle through list of existing loaded floors, and remove it
		//		// also construct a restriction to included all loaded floors
		//		var j = 0;
		//		for (i = 0; i < loadedFloors.length; i++) {
		//			var ar = loadedFloors[i];
		//			if (ar == null)
		//				continue;
		//			if (ar[0] == bldg && ar[1] == floor) {
		//				loadedFloors[i] = null;
		//			} else {	
		//				res.addClause('rm.bl_id', ar[0], '=', ((j++ == 0) ? true : ')OR('));
		//				res.addClause('rm.fl_id', ar[1], '=');
		//			}
		//		}			
		//	}
		//	
		//	var grid = View.getControl('', 'rmDetail_rooms');
		//	if (res.clauses.length > 0)
		//		grid.refresh(res, null, false);
		//	else
		//		grid.clear();	// no floors are selected, therefore just clear the grid


		
		
		
		
		
		
		
		/*
		var bl_id = window.location.parameters['blId'];
		var fl_id = window.location.parameters['flId'];
		var rm_id = window.location.parameters['rmId'];
		rest = "rm.bl_id='"+bl_id+"' AND rm.fl_id='"+fl_id+"' AND rm.rm_id='"+rm_id+"'";
		this.nav_details_info.refresh(rest);
		this.lease_info.refresh(rest);
		this.equip_info.refresh("eq.bl_id='"+bl_id+"' AND eq.fl_id='"+fl_id+"' AND eq.rm_id='"+rm_id+"'");
		this.wr_info.refresh("wr.bl_id='"+bl_id+"' AND wr.fl_id='"+fl_id+"' AND wr.rm_id='"+rm_id+"'");
		*/
	},


	// ************************************************************************
	// After refresh event handler.
	nav_details_info_afterRefresh: function() {
		
		var res = new Ab.view.Restriction();	


		test=this.nav_details_info.getFieldValue('rm.rm_id');
		var loc = new Ab.drawing.DwgCtrlLoc(this.nav_details_info.getFieldValue('rm.bl_id'), this.nav_details_info.getFieldValue('rm.fl_id'), this.nav_details_info.getFieldValue('rm.rm_id'));
		
		res.addClause('bl_id', this.nav_details_info.getFieldValue('rm.bl_id'), '=');
		res.addClause('fl_id', this.nav_details_info.getFieldValue('rm.fl_id'), '=');
		res.addClause('rm_id', this.nav_details_info.getFieldValue('rm.rm_id'), '=');
		
		this.rmDetail_cadPanel.addDrawing(loc);
		
		
		var hwrres = "rm_id='" + this.nav_details_info.getFieldValue('rm.rm_id') + "' AND " + 
					 "fl_id='" + this.nav_details_info.getFieldValue('rm.fl_id') + "' AND " + 
					 "bl_id='" + this.nav_details_info.getFieldValue('rm.bl_id') + "'";
		
		//var hwrPanel = View.panels.get("hwr_info");
		this.hwr_info.addParameter("listRest", hwrres);
		
		this.hwr_info.refresh();
		this.hwr_info.show(true,true);

		
	}
});


	