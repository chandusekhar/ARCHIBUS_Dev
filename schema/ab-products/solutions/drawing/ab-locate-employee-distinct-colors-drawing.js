//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//
function user_form_onload()
{   
    var grid = View.getControl("", "locateEmployeeDistinctColors_employees");

    if (grid != undefined)
    {
    	// overrides Grid.onChangeMultipleSelection to load a drawing with a room, not zoomed in
	    grid.addEventListener('onMultipleSelectionChange', function(row) {

	    	//
	    	// The following related lines of code allow the application developer
	    	// to control the fill parameters used for highlighting at runtime
	    	// instead of relying on the default highlighting. 
	    	//
	    	var cHex = gAcadColorMgr.getColorFromValue('em.em_id', row['em.em_id'], true);

	    	
	    	// Call the drawing control to highlight the selected room
			var opts = new DwgOpts();
			opts.forceload = true;
			opts.selectionMode = "0";
			opts.mode = row.row.isSelected() ? '' : 'unselected';
			if (row.row.isSelected())
				opts.setFillColor(gAcadColorMgr.getColorFromValue('em.em_id', row['em.em_id'], false));
			var dc = View.getControl('', 'locateEmployeeDistinctColors_cadPanel');
			dc.highlightAssets(opts, row);
			
    		// Get the grid opacity for 'assigned' assets, to be applied to the cell
    		var op = dc.getFillOpacity();

			// Additionally, display the fill color in the 'Legend' column in the employee list
    		// The fill color is set in the DIV element nested inside the table cell.
			var cell = row.row.dom.childNodes[2].firstChild;
			cell.style.backgroundColor = row.row.isSelected() ? ('#'+cHex) : '';
			cell.style.opacity = op;	// FireFox
			cell.style.filter = "alpha(opacity='" + (op * 100).toFixed() + "')";	// IE
	    });
    }
}



