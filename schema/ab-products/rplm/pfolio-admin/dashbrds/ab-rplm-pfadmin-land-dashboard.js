/**
* Overwrite view panel function
 */
Ab.view.ViewPanel.prototype.addShowAsDialog = function(childPanel, viewName){
	var viewPanelId = this.id;
    if (childPanel != null && valueExists(childPanel.toolbar)) {
        childPanel.addAction({
            id: childPanel.id + '_showAsDialog',
            icon: '/schema/ab-core/graphics/show.gif', 
            cls: 'x-btn-icon', 
            tooltip: this.getLocalizedString(Ab.view.ViewPanel.z_MESSAGE_MAXIMIZE_VIEW),
			listener: function() {
				View.openDialog(viewName, childPanel.restriction, false, {maximize: true, viewPanelId: viewPanelId, isDialogWindow: true});
			}
        });
    }
}

// add config parameters to dasboard view
View.dashboardConfigObj = new Ext.util.MixedCollection();
View.dashboardConfigObj.addAll(
		{id: 'panel_row1col1_abRepmLandEstAreaController', groupBy: 'state'},
		{id: 'panel_row1col2_abRepmLandEstAreaController', groupBy: 'city'},
		{id: 'panel_row1col3_abRepmLandEstAreaByOwnershipController', groupBy: 'city'},
		{id: 'panel_row2col1_abRepmLandBookMarketValController', groupBy: 'city'},
		{id: 'panel_row3col1_abRepmLandMonthlyCapTransController', groupBy: 'city'}
	);

