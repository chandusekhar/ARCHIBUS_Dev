//
// create a handler to toggle the toolbar on and off in the drawing control
//
var openerController = View.createController('toolbarToggler', {   

    _toolbarEnabled: true,
    
    toggleToolbar_cadPanel_onToggleToolbar: function() {
    	this._toolbarEnabled = !this._toolbarEnabled;
    	View.getControl('', 'toggleToolbar_cadPanel').setToolbar("show", this._toolbarEnabled);
    }

});
