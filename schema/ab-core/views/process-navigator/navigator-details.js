/**
 * Initialization.
 */
var navigatorController = View.createController('navigator', {
    afterInitialDataFetch: function() {
        initNavigator('navigator', 'navigator-details');
    }
});

/**
 * Configure the navigator for the smart client dialog
 * Smart Client should not show 'Sign Out' action
 */
function configureForSmartClient() {
    var elem = document.getElementById("titleBarSignOutLink");
	if (elem != null) {
		elem.style.display = 'none';
	}
}



