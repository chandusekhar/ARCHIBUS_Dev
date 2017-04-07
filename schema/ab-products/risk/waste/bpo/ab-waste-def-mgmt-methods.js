/**
 * @author Song
 */
var abWasteDefMgmtMethodsController = View.createController("abWasteDefMgmtMethodsController", {
	
	//current group
	group : '',
	
	//Operaton Data Type //'group','code'
	operDataType: '',
	
	/**
	  * This event handler is called by the view after the view loading and initial data 
	  * fetch for all panels is complete. 
	  */
    afterInitialDataFetch: function(){
      //  this.abWasteDefGeneratorsSiteTree.actions.get("addNew").enable(false);
		var titleObj = Ext.get('addNew');
		titleObj.on('click', this.showMenu, this, null);
    },
	/*
	*  create menu for add new button
	* @param {Object} e
	* @param {Object} item
	*/
	showMenu: function(e, item){
		var menuItems = [];
		var titleGroup = getMessage("titleGroup");
		var titleCode = getMessage("titleCode");
		menuItems.push({
			text: titleGroup,
			handler: this.onAddNewButtonPush.createDelegate(this, ['group'])
		});
		menuItems.push({
			text: titleCode,
			handler: this.onAddNewButtonPush.createDelegate(this, ['code'])
		});

		var menu = new Ext.menu.Menu({
			items: menuItems
		});
		menu.showAt(e.getXY());
	},
	/**
	* click on menu item
	* @param {Object} menuItemId
	*/
	onAddNewButtonPush: function(menuItemId){
		this.operDataType = menuItemId;
		switch(menuItemId){
			case "group":
			this.abWasteDefMgmtMethodsGroupForm.clear();
			this.abWasteDefMgmtMethodsGroupForm.newRecord = true;
			this.abWasteDefMgmtMethodsForm.show(false);
			this.abWasteDefMgmtMethodsGroupForm.show(true);
			this.abWasteDefMgmtMethodsGroupForm.refresh();
			break;
			case "code":
			if(this.group==''){
				View.showMessage(getMessage("errorAddCode"))
			}else{
				this.abWasteDefMgmtMethodsForm.clear();
				this.abWasteDefMgmtMethodsForm.newRecord = true;
				this.abWasteDefMgmtMethodsGroupForm.show(false);
				this.abWasteDefMgmtMethodsForm.show(true);
				this.abWasteDefMgmtMethodsForm.refresh();
				this.abWasteDefMgmtMethodsForm.setFieldValue("waste_mgmt_methods.method_group", this.group);
			}
			break;
		}
	},
    /**
     * This event handler is called by 'Save' button in Certification Levels Edit form. 
     */
	abWasteDefMgmtMethodsGroupForm_onSave: function(){
    		if (this.abWasteDefMgmtMethodsGroupForm.canSave()) {
    			var fieldValue = this.abWasteDefMgmtMethodsGroupForm.getFieldValue('waste_mgmt_methods_groups.method_group');
    			this.group = fieldValue;
    			this.abWasteDefMgmtMethodsGroupForm.save();
    			this.refreshTree();
    		}
    },
   
    /**
     * This event handler is called by 'Save' button in Certification Levels Edit form. 
     */
    abWasteDefMgmtMethodsForm_onSave: function(){
    	if (this.abWasteDefMgmtMethodsForm.canSave()) {
    		var group = this.abWasteDefMgmtMethodsForm.getFieldValue('waste_mgmt_methods.method_group');
    		this.group = group;
    		this.abWasteDefMgmtMethodsForm.save();
    		this.refreshTree();
    	}
    },
   
	/**
	* Refresh Tree after save and delete  record.
	*/
	refreshTree:function(){
		this.abWasteDefMgmtMethodsTree.refresh();
		this.expandTreeNodeByCurEditData(this.abWasteDefMgmtMethodsTree);
	},
	
    /**
     * private method: find current tree node according to form data
     */
	expandTreeNodeByCurEditData: function(tree){
    	var root=tree.treeView.getRoot();
        	for (var i = 0; i < root.children.length; i++) {
                var node = root.children[i];
                if(node.data['waste_mgmt_methods_groups.method_group'] == this.group){
                	tree.refreshNode(node);
                	node.expand();
                	break;
                }
        	}
    }
});

/**
 * This event handler is called by 'Delete' button in Certification Levels Edit form. 
 */
function refreshTree(){
	abWasteDefMgmtMethodsController.refreshTree();
}

/**
 * This event handler is called by 'Delete' button in Certification Levels Edit form. 
 */
function refreshTree2(){
	abWasteDefMgmtMethodsController.group = '';
	abWasteDefMgmtMethodsController.abWasteDefMgmtMethodsTree.refresh();
}
/**
* event click Group node.
*/
function onSelectNodeGroup() {
	abWasteDefMgmtMethodsController.abWasteDefMgmtMethodsForm.show(false);
	var curTreeNode = View.panels.get("abWasteDefMgmtMethodsTree").lastNodeClicked;
	curTreeNode.expand();
	var group = curTreeNode.data['waste_mgmt_methods_groups.method_group'];
	abWasteDefMgmtMethodsController.group=group;
	var catForm=abWasteDefMgmtMethodsController.abWasteDefMgmtMethodsGroupForm;
	catForm.clear();
	catForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel
	restriction.addClause('waste_mgmt_methods_groups.method_group', group);
	catForm.refresh(restriction);

}

/**
* event click Code node.
*/
function onSelectNodeCode() {
	abWasteDefMgmtMethodsController.abWasteDefMgmtMethodsGroupForm.show(false);
	var curTreeNode = View.panels.get("abWasteDefMgmtMethodsTree").lastNodeClicked;
	var proForm=abWasteDefMgmtMethodsController.abWasteDefMgmtMethodsForm;
	var code = curTreeNode.data['waste_mgmt_methods.method_code'];
	var group = curTreeNode.data['waste_mgmt_methods.method_group'];
	abWasteDefMgmtMethodsController.group=group;
	proForm.clear();
	proForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel
	restriction.addClause('waste_mgmt_methods.method_code', code);
	proForm.refresh(restriction);
}
