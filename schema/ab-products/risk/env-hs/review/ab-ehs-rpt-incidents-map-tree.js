/**
 * 
 */
var abEhsRptIncidentsMapTreeCtrl = View.createController('abEhsRptIncidentsMapTreeCtrl', {
	
	treeLevelsNo: 7,
	
	/**
	 * set the tree control multiple selected.
	 */
	afterViewLoad : function() {
		for ( var i = 0; i < this.treeLevelsNo; i++) {
			this.abEhsRptIncidentsMapTree_worldTree.setMultipleSelectionEnabled(i);
		}
	},

	/**
	 * on click event for Unselect All action in tree control.
	 */
	abEhsRptIncidentsMapTree_worldTree_onUnselectAll : function() {
		this.treeUnselectAll(this.abEhsRptIncidentsMapTree_worldTree.treeView);
	},
	
	/**
	 * unselect all nodes from tree
	 * 
	 * @param {Object}
	 *            treeView
	 */
	treeUnselectAll: function(treeView) {
		for ( var i = 0; i < treeView._nodes.length; i++) {
			var node = treeView._nodes[i];
			if (node && node.setSelected && node.isSelected()) {
				node.setSelected(false);
			}
		}

	},
	
	/**
	 * on click event for show selected action in tree control
	 */
	abEhsRptIncidentsMapTree_worldTree_onShowSelected : function() {
		
		// we just call refresh function from tabs controller
		var tabsView = View.getOpenerView().panels.get('panel_row1col2').getContentFrame().View;
		var tabsController = tabsView.controllers.get('abEhsRptIncidentsMapLocTabsCtrl');
		tabsController.refreshTabs();
	},
	
	/**
	 * Check if there are selected nodes or not 
	 */
	isNodeSelected: function() {
		for ( var i = 0; i < this.treeLevelsNo; i++) {
			if(this.abEhsRptIncidentsMapTree_worldTree.getSelectedNodes(i).length != 0){
				return true;
			}
		}
		return false;
	},
	
	/**
	 * Get tree selected nodes.
	 * Will return an array with selected building codes.
	 */
	getSelectedBuildings: function(){
		if (!this.isNodeSelected()) {
			return new Array();
		}
		var objTree = this.abEhsRptIncidentsMapTree_worldTree;
		var objBuildingDs = this.abEhsRptIncidentsMapTree_dsTreeBldg;
		var restriction =  new Ab.view.Restriction();
		this.addRestrictionFromLevel(1, 'ctry', 'ctry_id', restriction);
		this.addRestrictionFromLevel(2, 'regn', 'regn_id', restriction);
		this.addRestrictionFromLevel(3, 'state', 'state_id', restriction);
		this.addRestrictionFromLevel(4, 'city', 'city_id', restriction);
		this.addRestrictionFromLevel(5, 'site', 'site_id', restriction);
		this.addRestrictionFromLevel(6, 'bl', 'bl_id', restriction);
		
		var items = new Array();
		var bldgRecords = objBuildingDs.getRecords(restriction);
		for (var i = 0; i < bldgRecords.length; i++){
			var record = bldgRecords[i];
			var key = record.getValue('bl.bl_id');
			items.push(key);
		}
		return items;
	},
	
	addRestrictionFromLevel: function(level, table, field, restriction){
		var objTree = this.abEhsRptIncidentsMapTree_worldTree;
		var nodes = objTree.getSelectedNodes(level);
		var result  = "";
		if (nodes.length > 0) {
			var values = new Array();
			for ( var i = 0; i < nodes.length; i++) {
				var value = nodes[i].data[table + '.' + field];
				if (valueExists(value)){
					values.push(value);
				}
			}
			if (values.length > 0 ) {
				restriction.addClause("bl." + field, values, 'IN', 'OR', false);
			}
		}
	}
});

function afterGeneratingTreeNode(treeNode) {

	if (treeNode.level.levelIndex == 0) {
		treeNode.setUpLabel('<b>' + getMessage('world') + '</b>');
	}
}