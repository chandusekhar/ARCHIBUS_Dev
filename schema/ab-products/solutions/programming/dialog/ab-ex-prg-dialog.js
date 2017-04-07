
var dialogController = View.createController('dialog', {

    // this property can be referenced from the opener controller
    property: 'initial value',
	
	// Ab.view.Restriction object
	testRestriction: null,
    
    // this property may contain a callback function reference that will be called when this dialog is closed
    onClose: null,
    
    afterViewLoad: function() {
        this.property = 'dialog view has been loaded';
    },

    afterInitialDataFetch: function() {
        this.property = 'dialog view initial data fetch has been completed';
		
		this.testRestriction = new Ab.view.Restriction({x: 5, y: 7});
    },
    
    prgDialog_dialogPanel_onShowMessage: function() {
        // get reference to the opener controller to read its property
        var openerController = View.getOpenerView().controllers.get('opener');
        
        // display opener controller property
        View.showMessage('message', openerController.property, null, null,
            // this callback function will be called after the message dialog is closed 
            function() {
                alert('The message dialog was closed');
            });
    },
    
    prgDialog_dialogPanel_onClose: function() {
        View.log('Dialog');
		View.log(this.testRestriction);

        if (dialogController.testRestriction.constructor === window.Ab.view.Restriction) {
            View.log('Restriction is Ab.view.Restriction');
        } else {
			View.log('Restriction is not Ab.view.Restriction');
		}
		
        // call the callback if it is set
        if (this.onClose) {
            this.onClose(this);
        }
        View.closeThisDialog();
    }
}); 