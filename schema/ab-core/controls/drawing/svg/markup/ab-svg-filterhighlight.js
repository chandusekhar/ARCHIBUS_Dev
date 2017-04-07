
var filterHighlightController = View.createController('filterHighlightCtrl', {

    // this property can be referenced from the filter rooms dialog controller
	filterHighlightControl: null,
	
	// indicate if it is new filter or edit existing filter
    editRowIndex: -1,
	
    /**
     * Called when the user closes the dialog.
     */
    dialog_onClose: function(dialogController) {
    	this.filterHighlight.showAction(this.filterHighlight.Z_FILTERROOMACTION_ID, true);
    },
    
    onLoadFilterRoomsDialog: function(filter, rowIndex) {
    	
    	this.editRowIndex = rowIndex;

    	// store the reference to itself in a local variable, to be used in closures
        var thisController = this;

        // open dialog window and load another view into it
        var dialog = View.openDialog('ab-svg-filterrooms-dialog.axvw', '', false, {
        	width : 500,
			height : 420,
			closeButton: false,
            maximize: false,
            
            // this callback function will be called after the dialog view is loaded
            afterViewLoad: function(dialogView) {
                // access the dialog controller property
                var dialogController = dialogView.controllers.get('svgRoomsFilterDialogCtrl');
                
                // set the dialog controller onClose callback                
                dialogController.onClose = thisController.dialog_onClose.createDelegate(thisController);
            },

            // this callback function will be called after the dialog view initial data fetch is complete
            afterInitialDataFetch: function(dialogView) {
                // access the dialog controller property
                var dialogController = dialogView.controllers.get('svgRoomsFilterDialogCtrl');
                if(filter && filter.title)
                	dialogController.preload(filter);
            }
        });
    },
    
    /**
     * Called when the user closes the dialog.
     */
    dialog_onClose: function(dialogController) {
    	dialogController.filterHighlight.showAction(this.filterHighlight.Z_FILTERROOMACTION_ID, true);
    }
}); 