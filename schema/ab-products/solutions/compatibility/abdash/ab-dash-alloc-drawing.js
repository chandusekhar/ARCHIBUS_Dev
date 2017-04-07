
var loadedFloors = new Array();	// an Array of Arrays  e.g.  (('hq', '17') ('hq', '18'))

var controller = View.createController('rmDetailController', {	
	
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.floors.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'cadPanel').addDrawing(row, null);
			
			var bldg = row.row.getFieldValue("fl.bl_id");
			var floor = row.row.getFieldValue("fl.fl_id");
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
						
					res.addClause('fl.bl_id', ar[0], '=', ((i == 0) ? true : ')OR('));
					res.addClause('fl.fl_id', ar[1], '=');
				}
				
				if (!found) {
					loadedFloors[loadedFloors.length] = new Array(bldg, floor);
					res.addClause('fl.bl_id', bldg, '=', ((i == 0) ? true : ')OR('));
					res.addClause('fl.fl_id', floor, '=');
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
						res.addClause('fl.bl_id', ar[0], '=', ((j++ == 0) ? true : ')OR('));
						res.addClause('fl.fl_id', ar[1], '=');
					}
				}			
			}
			
	    });
	    
    	// specify a handler for when an load event occurs in the Drawing component
    	// In this case is used to ensure that the related grids with a color field
    	// are using the same opacity as the Drawing Control itself
    	this.cadPanel.addEventListener('onload', onLoadHandler);
    	
    	// specify a handler for when an onclick event occurs in the Drawing component
    	this.cadPanel.addEventListener('onclick', onClickHandler);
    	
    	// specify a handler for when resetAssets button is selected in the Drawing component
    	this.cadPanel.addEventListener('onresetassets', onResetAssetsHandler);
	}
});


function onLoadHandler()
{
	// Ensure that associated grids are using the same color opacity as the Drawing Control
	var op = View.getControl('', 'cadPanel').getFillOpacity();
	View.getControl('', 'floors').setColorOpacity(op);
	View.getControl('', 'floors').update();
}

function onClickHandler(pk, selected)
{
}

function onResetAssetsHandler()
{
}



