/**
 * @author Song
 */
var defWasteGeneratorController=View.createController("defWasteGeneratorController", {
	// ----------------------- properties -----------------------------
	/**
	 * Object: curTreeNode is a site node object that selected by user in the Left tree
	*/
	curTreeNode: null,
	/**
	  * This event handler is called by the view after the view loading and initial data 
	  * fetch for all panels is complete. 
	  */
    afterInitialDataFetch: function(){
        this.abWasteDefGeneratorsSiteTree.actions.get("addNew").enable(false);
        this.abWasteDefGeneratorsSiteTree.refresh();
    },
    /**
     * private method: find current tree node according to form data
     */
    getTreeNodeByCurEditData: function( fieldValue, parentNode){
        	for (var i = 0; i < parentNode.children.length; i++) {
                var node = parentNode.children[i];
                if (node.data['site.site_id'] == fieldValue) {
                    return node;
                }
            }
        return null;
    },
    /**
     * This event handler is called by 'Save' button in Certification Levels Edit form. 
     */
    abWasteDefGeneratorsForm_onSave: function(){
    		var rootNode = this.abWasteDefGeneratorsSiteTree.treeView.getRoot();
    	    var oldFieldValue = this.abWasteDefGeneratorsForm.getOldFieldValues()[("waste_generators.site_id")];
    		if (this.abWasteDefGeneratorsForm.save()) {
    			var oldNodeBlId = this.getTreeNodeByCurEditData(oldFieldValue,rootNode);
    			this.refreshTreeNode(oldNodeBlId);
    			var fieldValue = this.abWasteDefGeneratorsForm.getFieldValue('waste_generators.site_id');
    			var nodeBlId = this.getTreeNodeByCurEditData(fieldValue,rootNode);
    			this.refreshTreeNode(nodeBlId);
            }
    },
   
    /**
     * This event handler is called by 'Cancel' button in Certification Levels Edit form. 
     */
    abWasteDefGeneratorsForm_onCancel: function(){
    	if (needRefresh()) {
    		//this.abWasteDefGeneratorsForm.refresh(null,true);
    		this.abWasteDefGeneratorsForm.show(false);
    	}
    },
    /**
     * private method
     */
    refreshTreeNode: function(nodeBlId){
    	if(nodeBlId){
    		this.abWasteDefGeneratorsSiteTree.refreshNode(nodeBlId);
    		nodeBlId.expand();
    	}
    },
    /**
     * This event handler is called by 'Add New' button in tree panel. 
     */
    abWasteDefGeneratorsSiteTree_onAddNew: function(){
    	if (needRefresh()) {
    		this.abWasteDefGeneratorsForm.refresh(null,true);
    		this.abWasteDefGeneratorsForm.setFieldValue('waste_generators.site_id',this.curTreeNode.data['site.site_id']);
    	}
    }
});

/**
 * This event handler is called by 'Delete' button in Certification Levels Edit form. 
 */
function refreshTree(){
	var c=defWasteGeneratorController;
	var oldFieldValues = c.abWasteDefGeneratorsForm.getOldFieldValues();
	var oldSiteId = oldFieldValues[("waste_generators.site_id")];
	var rootNode = c.abWasteDefGeneratorsSiteTree.treeView.getRoot();
	var nodeBlId = c.getTreeNodeByCurEditData(oldSiteId,rootNode);
	defWasteGeneratorController.refreshTreeNode(nodeBlId);
}

/**
 * auto add related fields associated to the selected bl_id in the bl table
 * @param fieldName
 * @param selectedValue
 * @param previousValue
 */
function onSelectProperty(fieldName,selectedValue,previousValue) {
	var editPanel =  View.panels.get("abWasteDefGeneratorsForm");
	if (selectedValue != previousValue&&valueExists(selectedValue)) {
		editPanel.setFieldValue(fieldName,selectedValue);
	}
}
/**
 * This event handler is called when Tree level 1 node is clicked in tree panel. 
 * @param obj
 */
function onSelectGeneratorSite(obj){
	var controller = View.controllers.get("defWasteGeneratorController");
	var treePanel =  View.panels.get("abWasteDefGeneratorsSiteTree");
	// get clicked site code and store it to controller’s variable curTreeNode
	controller.curTreeNode=treePanel.lastNodeClicked;
	controller.curTreeNode.expand();
	//Set addNew button enabled
	treePanel.actions.get("addNew").enable(true);
}
/**
 * when click tree node,check if anything change in current edit form and comfirm discard unsaved change or not
 * @param obj
 */
function onSelectWasteGenerator(obj){
	if (needRefresh()) {
		var editPanel =  View.panels.get("abWasteDefGeneratorsForm");
		editPanel.refresh(obj.restriction,false);
		var treePanel =  View.panels.get("abWasteDefGeneratorsSiteTree");
		//fix KB3031330 - enable add new button when select generator to keep consistent with the other define view(Guo 2011/5/19)
		treePanel.actions.get("addNew").enable(true);
		var controller = View.controllers.get("defWasteGeneratorController");
		controller.curTreeNode=treePanel.lastNodeClicked.parent;
	}
}
/**
 * check if form changed to confirm if panel need refresh
 * @returns {Boolean}
 */
function needRefresh(){
	if(true)return true;//fix kb 3031329
    // if the user has changed any form field values, ask to confirm
    if (afm_form_values_changed) {
        var message = getMessage('confirm');
       var result = confirm(message);
        if (result) {
            afm_form_values_changed = false;
            return true;
        }else {
			return false;
		}
    }else {
    	return true;
	}
    return false;
}
