
View.createController('exLocateEmployeeDrawing', {
	afterViewLoad: function() {	
		//var highlightRestriction = new Ab.view.Restriction();
		//highlightRestriction.addClause('rm.fl_id', '18', "=");
		//this.withLegendFloorSelector_cadPanel.setHighlightRestriction(highlightRestriction);
	}
});
//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//
function user_form_onload()
{   
    var floorGrid = View.getControl("", "withLegendFloorSelector_floors");

    if (floorGrid != undefined)
    {
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	floorGrid.addEventListener('onMultipleSelectionChange', function(row) {
			View.getControl('', 'withLegendFloorSelector_cadPanel').addDrawing(row, null);
	    });
    }   
}




