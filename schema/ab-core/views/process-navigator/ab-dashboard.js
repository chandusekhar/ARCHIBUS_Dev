/**
 * Initialization.
 */
var dashboardController = View.createController('dashboard', {
    afterInitialDataFetch: function() {
        initNavigator('dashboard', 'ab-dashboard');
	}
});

