
View.createController('mapSettingController', {
	afterInitialDataFetch : function() {
		if (this.abCompDrilldownMapSetting.actions.get('abCompDrilldownMapSetting_showAsDialog')) {
			this.abCompDrilldownMapSetting.actions.get('abCompDrilldownMapSetting_showAsDialog').show(false);
		}
	},
	
	/**
	 * onclick event handler for map show button
	 */
	abCompDrilldownMapSetting_onShow: function() {
		//Refresh the map from the tree
		var treeControllers = View.panels.get('panel_row1col1').contentView.controllers.get('bldgTree');
		treeControllers.worldTree_onShowSelected();
	},
	
});

