//
//

var floorplanwrController = View.createController('floorplanwrController', {
	afterViewLoad: function() {		
		//alert("2");
		this.areaRangesDrawing_cadPanel.addEventListener('onclick', onClickHandler);
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.areaRangesDrawing_floors.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'areaRangesDrawing_cadPanel').addDrawing(row, null);
	    });
	    

		// Use the following ruleset to mange the applied highlights
		var wrruleset = new DwgHighlightRuleSet();
		var hwrruleset = new DwgHighlightRuleSet();
		
		wrruleset.appendRule("rm.wr_count", "0", "FFFFFF", "<=", "None");
		wrruleset.appendRule("rm.wr_count", "1", "CCFF33", "<=", "1");
		wrruleset.appendRule("rm.wr_count", "10", "CC9933", "<=", "2-10");
		wrruleset.appendRule("rm.wr_count", "20", "CC6633", "<=", "10-20");
		wrruleset.appendRule("rm.wr_count", "20", "CC0033", ">", "", false, true);

		hwrruleset.appendRule("rm.wr_count", "0", "FFFFFF", "<=", "None");
		hwrruleset.appendRule("rm.wr_count", "1", "CCFF33", "<=", "1");
		hwrruleset.appendRule("rm.wr_count", "10", "CC9933", "<=", "2-10");
		hwrruleset.appendRule("rm.wr_count", "20", "CC6633", "<=", "10-20");
		hwrruleset.appendRule("rm.wr_count", "20", "CC0033", ">", "", false, true);

		
		
		this.areaRangesDrawing_cadPanel.appendRuleSet("areaRangesDrawing_highlightVacantRoomsDs1", wrruleset);
		this.areaRangesDrawing_cadPanel.appendRuleSet("areaRangesDrawing_highlightHWR", hwrruleset);
	},
	
	showFloorWR: function() {
		//alert("showFloor");
		
		var args = new Object ();
		args.width = 900;
		args.height = 600;
		args.closeButton = false;
		
		var strRestriction = "?restrict=";
		
		var r = new Ab.view.Restriction();
		var selectedRows = this.areaRangesDrawing_floors.getSelectedRows();
		for (var i = 0; i < selectedRows.length; i++) {
			var dataRow = selectedRows[i];
			strRestriction = strRestriction + dataRow['rm.bl_id'] + '-' + dataRow['rm.fl_id'] + "+";
			
		}
		//alert(strRestriction);
		View.openDialog('uc-drawing-wr-count-popup.axvw' + strRestriction, r, false, args);
	}
});



function onClickHandler(pk, selected)
{
	if (selected) {
		var args = new Object ();
		//args.target = 'opener';
		//args.type ='openDialog';
		//args.parentPanelId = this.id;
		//args.viewName = 'uc-sc-rm-inventory-popup.axvw';
		args.width = 900;
		args.height = 600;
		args.closeButton = false;
		
	    //var myDlgCmd = new Ab.command.openDialog(args);
		var r = new Ab.view.Restriction();
	    r.addClause("rm.bl_id", pk[0], "=", true);
	 	r.addClause("rm.fl_id", pk[1], "=", true);
	    r.addClause("rm.rm_id", pk[2], "=", true);
	    
		
		View.openDialog('uc-drawing-wr-count-popup.axvw?blId='+pk[0]+'&flId='+pk[1]+'&rmId='+pk[2], r, false, args);
	    
		//myDlgCmd.restriction = r;
	    //myDlgCmd.handle();
	}
}
