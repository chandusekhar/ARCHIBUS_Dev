
var openerController = View.createController('opener', {

    // this property can be referenced from the dialog controller
    property: 'I am the opener controller',
    
    prgOpener_openerPanel_onOpenDialog: function() {
        // store the reference to itself in a local variable, to be used in closures
        var thisController = this;
        
        // open dialog window and load another view into it
        var dialog = View.openDialog('ab-ex-prg-dialog.axvw', null, false, {
            closeButton: false,
            maximize: true,

            // this callback function will be called after the dialog view is loaded
            afterViewLoad: function(dialogView) {
                // access the dialog controller property
                var dialogController = dialogView.controllers.get('dialog');
                View.showMessage('dialog controller property = [' + dialogController.property + ']');

                // set the dialog controller onClose callback                
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            },

            // this callback function will be called after the dialog view initial data fetch is complete
            afterInitialDataFetch: function(dialogView) {
                // access the dialog controller property
                var dialogController = dialogView.controllers.get('dialog');
                View.log('dialog controller property = [' + dialogController.property + ']');
            }
        });
    },
    
    /**
     * Called when the user closes the dialog.
     */
    dialog_onClose: function(dialogController) {
        View.log('Opener');
        View.log(dialogController.testRestriction);
		
		if (dialogController.testRestriction.constructor === Ab.view.Restriction) {
            View.log('Restriction is Ab.view.Restriction');
        } else {
            View.log('Restriction is not Ab.view.Restriction');
        }
        
		View.showMessage('Dialog window has been closed');
    },
    
    /**
     * Loads another view in the content frame.
     */
    prgOpener_openerPanel_onLoadView: function() {
    	var viewName = 'ab-ex-echo.axvw';
    	
		var topViewContentPanel = top.View.panels.get('viewContent');
    	if (valueExists(topViewContentPanel)) {
    		topViewContentPanel.loadView(
				viewName,	// load this view 
				null, 		// without applying any restriction
				true);		// and highlight the task in the Process Navigator
    	}
    }
}); 