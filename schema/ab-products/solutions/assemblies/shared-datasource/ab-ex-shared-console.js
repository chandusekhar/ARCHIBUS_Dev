
View.createController('exSharedConsole', {
	
	/**
	 * Before the initial data fetch begins, clear panel restrictions. Data-bound panels, except charts,
	 * get their initial restrictions from the View when constructed, and will perform initial data fetch
	 * based on the view restriction. 
	 * 
	 * In this example, we apply the URL parameter as a data source parameter in the afterInitialDataFetch() method,
	 * so we should clear the panel restrictions before panels can use them.
	 */
	afterViewLoad: function() {
		View.clearPanelRestrictions();
	},
	
	/**
	 * Checks if the building ID is passed via the view URL, and applies it as a restriction to all panels.
	 */
	afterInitialDataFetch: function() {
		var bl_id = window.location.parameters['bl_id'];
		if (valueExists(bl_id)) {
            this.refreshPanels(bl_id);
            this.exSharedConsole.setFieldValue('gp.bl_id', bl_id);
		}
	},
	
	/**
	 * Applies console parameter to all panels.
	 */
	exSharedConsole_onShow: function() {
		var bl_id = this.exSharedConsole.getFieldValue('gp.bl_id');
		if (!valueExistsNotEmpty(bl_id)) {
			bl_id = '%%';
		}
		this.refreshPanels(bl_id);
	},
	
	/**
	 * Clears the console and refreshes all panels with default parameter value.
	 */
	exSharedConsole_onClear: function() {
		this.exSharedConsole.setFieldValue('gp.bl_id', '');
		this.refreshPanels('%%');
	},
	
	/**
	 * Refreshes all panels, passing specified bl_id parameter.
	 * 
	 * This code does not depend on which panels are included into the dashboard. 
	 * Thus, the console view can be reused for different dashboards, as long as it applies
	 * parameters and/or restrictions that are understood by dashboard panels.
	 */
	refreshPanels: function(bl_id) {
		View.addRefreshParameter('bl_id', bl_id);
		View.refreshPanels(null, this.exSharedConsole);
	}
});
