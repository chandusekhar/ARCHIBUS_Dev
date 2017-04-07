var bldgTreeController = View.createController('bldgTree', {

	afterInitialDataFetch : function() {
		if (this.worldTree.actions.get('worldTree_showAsDialog')) {
			this.worldTree.actions.get('worldTree_showAsDialog').show(false);
		}
	},

	/**
	 * set the tree control multiple selected.
	 */
	afterViewLoad : function() {
		this.worldTree.setMultipleSelectionEnabled(0);
		this.worldTree.setMultipleSelectionEnabled(1);
		this.worldTree.setMultipleSelectionEnabled(2);
		this.worldTree.setMultipleSelectionEnabled(3);
		this.worldTree.setMultipleSelectionEnabled(4);
		this.worldTree.setMultipleSelectionEnabled(5);
		this.worldTree.setMultipleSelectionEnabled(6);
	},

	/**
	 * on click event for Unselect All action in tree control.
	 */
	worldTree_onUnselectAll : function() {
		treeUnselectAll(this.worldTree.treeView);
	},

	/**
	 * on click event for show selected action in tree control.
	 */
	worldTree_onShowSelected : function() {
		if (this.checkSelection()) {
			// we need to pass an array with selected building id's
			var items = new Array();
			var ds = this.dsBldgBuildings;
			var restriction = this.getRestrictionFromSelectedTreeNodes();
			var records = ds.getRecords(restriction);
			for ( var j = 0; j < records.length; j++) {
				var rec = records[j];
				var key = rec.getValue('bl.bl_id');
				items.push(key);
			}
			var tabsViewCtrollers = View.getOpenerView().panels.get('panel_row1col2').contentView.controllers;

			var tabs = tabsViewCtrollers.get('abBldgMangementTab').tabsBldgManagement;
			var msdsLocationTabController = tabsViewCtrollers.get('msdsLocationTabController');

			msdsLocationTabController.items = items;
			msdsLocationTabController.initializeView();

			var mapController = tabs.findTab('gisMapTab').getContentFrame().View.controllers.get('mapControl');
			if (mapController != null) {
				tabs.selectTab(tabs.tabs[0].name);
				mapController.showSelectedBuildings(items);
			} else {
				tabs.selectTab(tabs.tabs[1].name);
			}
		}
	},

	/**
	 * add tree nodes selection
	 */
	checkSelection : function() {
		if (this.worldTree.getSelectedNodes(0).length == 0 && this.worldTree.getSelectedNodes(1).length == 0 && this.worldTree.getSelectedNodes(2).length == 0
			&& this.worldTree.getSelectedNodes(3).length == 0 && this.worldTree.getSelectedNodes(4).length == 0 && this.worldTree.getSelectedNodes(5).length == 0
			&& this.worldTree.getSelectedNodes(6).length == 0) {
			View.showMessage(getMessage('error_noselection'));
			return false;
		}

		return true;
	},

	/**
	 * add restriction from selected tree nodes
	 */
	getRestrictionFromSelectedTreeNodes : function() {
		var restriction = '';

		var countryNodes = this.worldTree.getSelectedNodes(1);
		var regionNodes = this.worldTree.getSelectedNodes(2);
		var stateNodes = this.worldTree.getSelectedNodes(3);
		var cityNodes = this.worldTree.getSelectedNodes(4);
		var siteNodes = this.worldTree.getSelectedNodes(5);
		var blNodes = this.worldTree.getSelectedNodes(6);
		if (countryNodes.length > 0) {
			restriction = this.addRestrictionFromTreeNodes(restriction, countryNodes, 'ctry', 'ctry_id');
		}

		if (regionNodes.length > 0) {
			restriction = this.addRestrictionFromTreeNodes(restriction, regionNodes, 'regn', 'regn_id');
		}

		if (stateNodes.length > 0) {
			restriction = this.addRestrictionFromTreeNodes(restriction, stateNodes, 'state', 'state_id');
		}

		if (cityNodes.length > 0) {
			restriction = this.addRestrictionFromTreeNodes(restriction, cityNodes, 'city', 'city_id');
		}

		if (siteNodes.length > 0) {
			restriction = this.addRestrictionFromTreeNodes(restriction, siteNodes, 'site', 'site_id');
		}

		if (blNodes.length > 0) {
			restriction = this.addRestrictionFromTreeNodes(restriction, blNodes, 'bl', 'bl_id');
		}

		if (restriction) {
			restriction = restriction.substring(3);
		} else {
			restriction = ' 1=1 ';
		}
		//ensure the map only displays locations that have at least one MSDS 
		restriction = " ( " + restriction + " ) AND exists (select 1 from msds_location where bl.bl_id = msds_location.bl_id)";
		
		return restriction;
	},

	/**
	 * add restriction from tree nodes
	 * 
	 * @param restriction
	 *            {Object} restriction object
	 * @param nodes
	 *            {Object} tree nodes object
	 * @param tableName
	 *            {String} table name
	 * @param fieldName
	 *            {String} field name
	 */
	addRestrictionFromTreeNodes : function(restriction, nodes, tableName, fieldName) {
		var values = '';
		for ( var i = 0; i < nodes.length; i++) {
			values += ",'" + nodes[i].data[tableName + "." + fieldName] + "'";
		}
		var tableName = "bl";
		restriction = restriction + " OR " + tableName + "." + fieldName + " IN (" + values.substring(1) + ")";
		return restriction;
	}
});

function afterGeneratingTreeNode(treeNode) {

	if (treeNode.level.levelIndex == 0) {
		treeNode.setUpLabel('<b>' + getMessage('world') + '</b>');
	}
}

/**
 * unselect all nodes from tree
 * 
 * @param {Object}
 *            treeView
 */
function treeUnselectAll(treeView) {
	for ( var i = 0; i < treeView._nodes.length; i++) {
		var node = treeView._nodes[i];
		if (node && node.setSelected && node.isSelected()) {
			node.setSelected(false);
		}
	}

}