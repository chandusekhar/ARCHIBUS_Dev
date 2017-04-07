
View.createController('abExSelectableNodes', {
	
	afterViewLoad: function(){
	    // enable multiple selection for all tree levels
		this.treeCtry.setMultipleSelectionEnabled(0);
		this.treeCtry.setMultipleSelectionEnabled(1);
		this.treeCtry.setMultipleSelectionEnabled(2);
		
		// add custom event listener for additional node processing after the user checks/unchecks any node
		this.treeCtry.addEventListener('onChangeMultipleSelection', this.onChangeNodesSelection.createDelegate(this));
	},

	/**
	 * Called after the user checks/unchecks any node.
	 */
	onChangeNodesSelection: function(node) {
		if (node.isSelected()) {
			View.showMessage('Node '+ node.getText() + ' was checked.');
		} else {
			View.showMessage('Node '+ node.getText() + ' was unchecked.');
		}
	},
	
	treeCtry_onSelectAll: function() {
		this.treeCtry.selectAll();
	},
	
	treeCtry_onUnselectAll: function() {
		this.treeCtry.unselectAll();
	},
	
	/**
	 * Called when the user clicks on the Show Selected Nodes button.
	 */
	treeCtry_onShowSelectedNodes: function(){
		for (var levelIndex = 0; levelIndex < 3; levelIndex++) {
			// get selected tree nodes for specified level
			var nodes = this.treeCtry.getSelectedNodes(levelIndex);

			// concatenate selected nodes text into a message
			var label = "";
			for(var i = 0; i< nodes.length; i++){
				label += nodes[i].getText() + "; ";
			}
			
			// display the message
			alert('Selected nodes from level ' + (levelIndex+1)+ ':\n' + label);
		}
	},
	
	/**
	 * Called when the user clicks on the Show Selected Records button.
	 */
	treeCtry_onShowSelectedRecords: function(){
		for (var levelIndex = 0; levelIndex < 3; levelIndex++) {
			// get selected records for specified level
			var records = this.treeCtry.getSelectedRecords(levelIndex);

			// display the number of selected records
			alert('Selected records from level ' + (levelIndex+1)+ ':\n' + records.length);
		}
	}
})
