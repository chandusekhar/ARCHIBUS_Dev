var controllerConsole = View.createController('controllerTree', {

	treeRes:'',
	
	//max level of hierarchy tree
	maxHierarchyLevel: 0,

	/**
	* @inherit
	 */
	afterViewLoad : function() {

		//Add custom event listener to the tree's afterGetData event so that can determine the max level by actual data values.
        this.abCompDocTree.addEventListener('afterGetData', this.afterGetDataOfTree, this);
	
		//set the tree control multiple selected.
		var level=this.abCompDocTree.config.maxLevel;
		for(var i=0;i<=level;i++){
			this.abCompDocTree.setMultipleSelectionEnabled(i);
		}
	},

	/**
	 * on click event for Unselect All action in tree control.
	 */
	abCompDocTree_onClear : function() {
		treeUnselectAll(this.abCompDocTree.treeView);
	},
	
	
	/**
	 * on click event for expand action in tree control.
	 */
	abCompDocTree_onShow : function() {

		//get all selected nodes by loop through each level 
		var nodes=new Array();
		for(var i=0;i<=this.maxHierarchyLevel;i++){
			nodes=nodes.concat(this.abCompDocTree.getSelectedNodes(i));
		}

		//get restriction of selected tree nodes
		this.treeRes=getTreeRes(nodes);
		//call refresh function of parent controller
		 View.controllers.get(1).onTreeRefresh(this.treeRes);
	},
	
    /**
     * Custom afterGetData listener, called by the tree after it gets the data from the server. 
	 * Calculate max number of "|" in all hierarchy field values and return it as max level of hierarchy tree
	*
     * @param {Object} panel   The tree panel.
     * @param {Object} dataSet The data set received from the server.
     */
    afterGetDataOfTree: function(panel, dataSet) {
        // loop through the returned records of tree
        for (var r = 0; r < dataSet.records.length; r++) {
			//calculate the max numbers of "|" in value of field 'hierarchy_ids'
			var hierarchyIds = dataSet.records[r]['docfolder.hierarchy_ids'];
			var idArray = hierarchyIds.split("|");
			//set the max level of current Hierarchy tree
			if(this.maxHierarchyLevel<idArray.length){
				this.maxHierarchyLevel = idArray.length;
			}
		}
	}

});

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

/**
 * Construct restriction string from selected nodes of document folder Hierarchy tree.
 *
 *@param nodes tree nodes
 *@return restriction string
 */
function getTreeRes(nodes) {

	var values = '';
	//if  select tree nodes 
	if(nodes && nodes.length>0){
		//loop through selected nodes list,  concat restriction 
		values+=" ( docfolder.hierarchy_ids LIKE '%"+nodes[0].data["docfolder.hierarchy_ids"]+"%' ";
		for ( var i = 1; i < nodes.length; i++) {
			values+=" OR docfolder.hierarchy_ids LIKE '%"+nodes[i].data["docfolder.hierarchy_ids"]+"%'  ";
		}
		values+=" )";
	}

	return values?values:" 1=1 ";
}