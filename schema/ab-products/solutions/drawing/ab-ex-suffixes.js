//
// override, set event handlers, and load drawing on startup would typically
// done from the overridden 'afterViewLoad' method
//


var controller = View.createController('floorsOnlyController', {
	afterViewLoad: function() {	
	
    	// overrides Grid.onChangeMultipleSelection to load a drawing
    	this.floorsonly_floors.addEventListener('onMultipleSelectionChange', function(row) {
    		// Example of using the DwgOpts object to specify a non-default 
    		// background and asset file to load
    		opts = new DwgOpts();
    		opts.backgroundSuffix = '-alternate';
    		opts.assetSuffix = '-fire';
			View.panels.get('floorsonly_cadPanel').addDrawing(row, opts);
	    });
	}
});





