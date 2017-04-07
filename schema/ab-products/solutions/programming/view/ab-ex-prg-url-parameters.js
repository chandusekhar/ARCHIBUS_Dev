
var controller = View.createController('urlParametersTest', {

    /**
     * This function restricts the view content (grid records) based on the parameters in the URL.
     */
    afterInitialDataFetch: function() {
		var restriction = new Ab.view.Restriction();

        for (var name in window.location.parameters) {
            var value = window.location.parameters[name];
            restriction.addClause(name, value);            
        }
		
		this.prgUrlParameters_testPanel.refresh(restriction);
	},

	/**
	 * This function displays all URL parameters.
	 */
    prgUrlParameters_testPanel_onDisplay: function() {
        var message = 'URL parameters:<br/>';
		var paramCount = 0;
        
        for (var name in window.location.parameters) {
            var value = window.location.parameters[name];
            
            message = message + name + ' = ' + value + '<br/>';
			paramCount++;
        }
		if (paramCount == 0) {
			message = message + '<em>none</em><br/>';
		}
        
        View.showMessage(message);
    }
});
