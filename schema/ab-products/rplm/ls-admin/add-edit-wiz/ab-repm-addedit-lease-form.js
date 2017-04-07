/**
 * Controller.
 */
var abRepmAddeditLeaseFormCtrl = View.createController('abRepmAddeditLeaseFormCtrl', {
	
	expandTree: true,
	
	onExpand: function(treePanel, treeNode){
		this.expandAll(this.expandTree, treePanel, treeNode);
		
		var message = this.expandTree ? getMessage("collapse_all_title") : getMessage("expand_all_title");
	    treePanel.actions.items[0].setTitle(message);
	    this.expandTree = !this.expandTree;
	},
	
	expandAll: function(expandTree, treePanel, treeNode){
		if (!treeNode.isRoot()) {
			treePanel.refreshNode(treeNode);
			if(expandTree){
				treeNode.expand();
			} else {
				treeNode.collapse();
			}
		}
	    if(treeNode.hasChildren()){
	    	var i=0;
	        for(i=0; i<treeNode.children.length; i++){
	        	var node = null;
	            node = treeNode.children[i];
	            this.expandAll(this.expandTree, treePanel, node);
	        }
	    }
	}
});	