//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'user_form_onload' method
//


var controller = View.createController('floorsOnlyController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.floorsonly_floors.addEventListener('onMultipleSelectionChange', function(row) {
    		var opts = null;
    		// Example of using the DwgOpts object to specify a different asset file to load
    		//opts = new DwgOpts();
    		//opts.assetTypes = "-su";
			View.panels.get('floorsonly_cadPanel').addDrawing(row, opts);
	    });
    	
    	this.floorsonly_floors.multipleSelectionEnabled = false;
	}
});





