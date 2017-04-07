var bldgTreeController = View.createController('bldgTree', {
	
	tabs: null,
	
	mapController: null,

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
		var tabsViewCtrollers = View.getOpenerView().panels.get('panel_row1col2').contentView.controllers;
		this.tabs = tabsViewCtrollers.get('abBldgMangementTab').tabsBldgManagement;
		this.mapController = tabsViewCtrollers.get('mapCtrl');
		
		if (this.checkSelection()) {
			var treeRestriction = this.getRestrictionFromSelectedTreeNodes();
			var tabsViewCtrollers = View.getOpenerView().panels.get('panel_row1col2').contentView.controllers;
			var isValidGisLicense = tabsViewCtrollers.get('abBldgMangementTab').isValidGisLicense;
			var ctrlMap = (isValidGisLicense ? this.mapController : null);
			this.tabs.treeRestriction = treeRestriction;
			this.tabs.markerRestriction = ' 1=1 ';
			//KB3035975 - change the location tab to pop up to avoid issue in Firefox
			//var locationTabController = tabsViewCtrollers.get('abBldgMangementTab');
			//locationTabController.refreshTabs();
			if (ctrlMap != null) {
				this.tabs.selectTab(this.tabs.tabs[0].name);
				ctrlMap.refreshMap();
			} else {
				//KB3035975 - change the location tab to pop up to avoid issue in Firefox
				//this.tabs.selectTab(this.tabs.tabs[1].name);
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
			View.getOpenerView().showMessage(getMessage('error_noselection'));
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

		restriction = this.addRestrictionFromTreeNodes(restriction, countryNodes, 'ctry', 'ctry_id');
		restriction = this.addRestrictionFromTreeNodes(restriction, regionNodes, 'regn', 'regn_id', 'ctry','ctry_id');
		restriction = this.addRestrictionFromTreeNodes(restriction, stateNodes, 'state', 'state_id');
		restriction = this.addRestrictionFromTreeNodes(restriction, cityNodes, 'city', 'city_id', 'state','state_id');
		restriction = this.addRestrictionFromTreeNodes(restriction, siteNodes, 'site', 'site_id');
		restriction = this.addRestrictionFromTreeNodes(restriction, blNodes, 'bl', 'bl_id');

		if (restriction) {
			restriction = restriction.substring(3);
		} else {
			restriction = ' 1=1 ';
		}
		restriction = " ( " + restriction + " )";
		
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
	addRestrictionFromTreeNodes : function(restriction, nodes, tableName, fieldName, secondPkTableName, secondPkFieldName) {
		if (nodes.length < 1) { 
			return restriction;
		}
		
		var values = '';
		for ( var i = 0; i < nodes.length; i++) {
			if (nodes[i].parent.selected == false) {
				//if this location is two pk,  concat the the two pk values as restriction
				if(secondPkTableName && secondPkFieldName){
					values += ",'" + nodes[i].data[tableName + "." + fieldName] + nodes[i].parent.data[secondPkTableName + "." + secondPkFieldName]+ "'";
				}else{
					values += ",'" + nodes[i].data[tableName + "." + fieldName] + "'";
				}
			}
		}
		if (values.length > 0) {
			//if this location is two pk,  concat the the two pk values as restriction
			if(secondPkTableName && secondPkFieldName){
				restriction = restriction + " OR " + (fieldName+'${sql.concat}'+secondPkFieldName) + " IN (" + values.substring(1) + ")";
			}else{
				restriction = restriction + " OR " + fieldName + " IN (" + values.substring(1) + ")";
			}
		}
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
