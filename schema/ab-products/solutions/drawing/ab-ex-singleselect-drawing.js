//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//


var controller = View.createController('singleSelectController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.singleSelect_floors.addEventListener('onMultipleSelectionChange', function(row) {
    		var opts = null;
			View.panels.get('singleSelect_cadPanel').addDrawing(row, opts);
	    });
	}
});





