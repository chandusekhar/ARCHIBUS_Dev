
var loadedFloors = new Array();	// an Array of Arrays  e.g.  (('HQ', '17') ('HQ', '18'))

var controller = View.createController('rmDetailController', {	
	
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.rmDetail_floors.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'rmDetail_cadPanel').addDrawing(row, null);
			
			var bldg = row.row.getFieldValue("rm.bl_id");
			var floor = row.row.getFieldValue("rm.fl_id");
			var i = 0;
			var found = false;
			var res = new Ab.view.Restriction();	
					
			// cycle through list of existing loaded floors, and append/remove as needed
			// also construct a restriction to included all loaded floors
			if (row.row.isSelected()) {
				for (i = 0; i < loadedFloors.length; i++) {
					var ar = loadedFloors[i];
					if (ar == null)
						continue;
					if (ar[0] == bldg && ar[1] == floor)
						found = true;
						
					res.addClause('rm.bl_id', ar[0], '=', ((i == 0) ? true : ')OR('));
					res.addClause('rm.fl_id', ar[1], '=');
				}
				
				if (!found) {
					loadedFloors[loadedFloors.length] = new Array(bldg, floor);
					res.addClause('rm.bl_id', bldg, '=', ((i == 0) ? true : ')OR('));
					res.addClause('rm.fl_id', floor, '=');
				}
			} else {	// the row is not selected
				// cycle through list of existing loaded floors, and remove it
				// also construct a restriction to included all loaded floors
				var j = 0;
				for (i = 0; i < loadedFloors.length; i++) {
					var ar = loadedFloors[i];
					if (ar == null)
						continue;
					if (ar[0] == bldg && ar[1] == floor) {
						loadedFloors[i] = null;
					} else {	
						res.addClause('rm.bl_id', ar[0], '=', ((j++ == 0) ? true : ')OR('));
						res.addClause('rm.fl_id', ar[1], '=');
					}
				}			
			}
			
			var grid = View.getControl('', 'rmDetail_rooms');
			if (res.clauses.length > 0)
				grid.refresh(res, null, false);
			else
				grid.clear();	// no floors are selected, therefore just clear the grid
	    });
	    
    	// specify a handler for when an load event occurs in the Drawing component
    	// In this case is used to ensure that the related grids with a color field
    	// are using the same opacity as the Drawing Control itself
    	this.rmDetail_cadPanel.addEventListener('onload', onLoadHandler);
    	
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.rmDetail_cadPanel.addEventListener('onclick', onClickHandler);
    	
    	// specify a handler for when resetAssets button is selected in the Drawing component
    	this.rmDetail_cadPanel.addEventListener('onresetassets', onResetAssetsHandler);
    	
    	// highlight in the displayed drawing, a room selected from a grid
    	this.rmDetail_rooms.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'rmDetail_cadPanel').highlightAssets(null, row);
	    });
	    
		
		// example of loading a drawing on startup
		//this.rmDetail_cadPanel.addDrawing(new Ab.drawing.DwgCtrlLoc('HQ', '17'));
	}
});


function onLoadHandler()
{
	// Ensure that associated grids are using the same color opacity as the Drawing Control
	var op = View.getControl('', 'rmDetail_cadPanel').getFillOpacity();
	View.getControl('', 'rmDetail_floors').setColorOpacity(op);
	View.getControl('', 'rmDetail_rooms').setColorOpacity(op);	
	View.getControl('', 'rmDetail_floors').update();
	View.getControl('', 'rmDetail_rooms').update();
}

function onClickHandler(pk, selected)
{
	var roomGrid = View.getControl("", "rmDetail_rooms");
	var row = roomGrid.rows[0];
	var found = false;
	for (var i = 0; !found && row != null && i < roomGrid.rows.length; i++)
	{
		row = roomGrid.rows[i];
		if (row['rm.bl_id'] == pk[0] && row['rm.fl_id'] == pk[1] && row['rm.rm_id'] == pk[2])
		{
			if (selected)
				row.row.select();
			else
				row.row.unselect();

			var suffix = selected ? " selected" : "";
			var cn = row.row.dom.className;
			var j = 0;
			if ((j = cn.indexOf(" selected")) > 0)
				cn = cn.substr(0, j);
			row.row.dom.className=cn + suffix;
			found = true;
		}
	}
}

function onResetAssetsHandler()
{
	var roomGrid = View.getControl("", "rmDetail_rooms");
	var row = roomGrid.rows[0];
	for (var i = 0; row != null && i < roomGrid.rows.length; i++)
	{
		row = roomGrid.rows[i];

			if (!row.row.isSelected())
				continue;

			row.row.unselect();

			//var suffix = selected ? " selected" : "";
			var cn = row.row.dom.className;
			var j = 0;
			if ((j = cn.indexOf(" selected")) > 0)
				cn = cn.substr(0, j);
			row.row.dom.className=cn;// + suffix;
	}
}



