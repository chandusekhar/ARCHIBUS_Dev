/**
 * @author Lei
 */
var msdsDefController = View.createController("msdsDefController", {
	
	//current systems,classes
	systems : '',
	classes : '',
	//Save systems,classes
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
	
		var titleSys = getMessage("titleSys");
		var titleClass = getMessage("titleClass");
		var titleCategory = getMessage("titleCategory");
		menuItems.push({
			text: titleSys,
			handler: this.onAddNewButtonPush.createDelegate(this, ['Systems'])
		});
		menuItems.push({
			text: titleClass,
			handler: this.onAddNewButtonPush.createDelegate(this, ['Classes'])
		});
		menuItems.push({
			text: titleCategory,
			handler: this.onAddNewButtonPush.createDelegate(this, ['Categories'])
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
			case "Systems":
			this.msdsHazardSystemForm.clear();
			this.msdsHazardSystemForm.newRecord = true;
			this.msdsHazardClassForm.show(false);
			this.categoryForm.show(false);
			this.msdsHazardSystemForm.show(true);
			this.msdsHazardSystemForm.refresh();
			break;
			case "Classes":
			if(this.systems==''){
				View.showMessage(getMessage("errorAddSys"))
			}else{
				this.msdsHazardClassForm.clear();
				this.msdsHazardClassForm.newRecord = true;
				this.msdsHazardSystemForm.show(false);
				this.categoryForm.show(false);
				this.msdsHazardClassForm.show(true);
				this.msdsHazardClassForm.refresh();
				this.msdsHazardClassForm.setFieldValue("msds_hazard_class.hazard_system_id", this.systems);
			}
			break;
			
			case "Categories":
				if(this.classes==''){
					View.showMessage(getMessage("errorAddClass"))
				}else{
					this.categoryForm.clear();
					this.categoryForm.newRecord = true;
					this.msdsHazardSystemForm.show(false);
					this.msdsHazardClassForm.show(false);
					this.categoryForm.show(true);
					this.categoryForm.refresh();
					this.categoryForm.setFieldValue("msds_hazard_category.hazard_system_id", this.systems);
					this.categoryForm.setFieldValue("msds_hazard_category.hazard_class_id", this.classes);
				}
				break;
		}
	},
    /**
     * This event handler is called by 'Save' button in System Levels Edit form. 
     */
	msdsHazardSystemForm_onSave: function(){
    		if (this.msdsHazardSystemForm.canSave()) {
    			var fieldValue = this.msdsHazardSystemForm.getFieldValue('msds_hazard_system.hazard_system_id');
    			this.systems = fieldValue;
    			this.msdsHazardSystemForm.save();
    			this.refreshTree();
    		}
    },
   
    /**
     * This event handler is called by 'Save' button in Class Levels Edit form. 
     */
    msdsHazardClassForm_onSave: function(){
    	if (this.msdsHazardClassForm.canSave()) {
    		var fieldValue = this.msdsHazardClassForm.getFieldValue('msds_hazard_class.hazard_system_id');
    		this.systems = fieldValue;
    		var classes = this.msdsHazardClassForm.getFieldValue('msds_hazard_class.hazard_class_id');
    		this.classes = classes;
    		this.msdsHazardClassForm.save();
    		this.refreshTree();
    	}
    },
   
    /**
     * This event handler is called by 'Save' button in Category Levels Edit form. 
     */
    categoryForm_onSave: function(){
    	if (this.msdsHazardClassForm.canSave()) {
    		var fieldValue = this.categoryForm.getFieldValue('msds_hazard_category.hazard_system_id');
    		this.systems = fieldValue;
    		var classes = this.categoryForm.getFieldValue('msds_hazard_category.hazard_class_id');
    		this.classes = classes;
    		this.categoryForm.save();
    		this.refreshTree();
    	}
    },
   
    
	/**
	* Refresh Tree after save and delete  record.
	*/
	refreshTree:function(){
		this.msdsHazardSystemTree.refresh();
		this.expandTreeNodeByCurEditData(this.msdsHazardSystemTree);
	},
	
    /**
     * private method: find current tree node according to form data
     */
	expandTreeNodeByCurEditData: function(tree){
    	var root=tree.treeView.getRoot();
        	for (var i = 0; i < root.children.length; i++) {
                var node = root.children[i];
                if(node.data['msds_hazard_system.hazard_system_id'] == this.systems){
                	tree.refreshNode(node);
                	node.expand();
                	for (var j = 0; j < node.children.length; j++) {
                		var classNode = node.children[j];
                		if(classNode.data['msds_hazard_class.hazard_class_id'] == this.classes){
                			tree.refreshNode(classNode);
                			classNode.expand();
	                    	break;
                		}
                	}
                	
                }
        	}
    }
});

/**
 * This event handler is called by 'Delete' button 
 */
function refreshTree(){
	msdsDefController.refreshTree();
}

/**
 * This event handler is called by 'Delete' button  
 */
function refreshTree2(){
	msdsDefController.systems = '';
	msdsDefController.msdsHazardSystemTree.refresh();
}
/**
* event click System node.
*/
function onSelectNodeSys() {
	msdsDefController.msdsHazardClassForm.show(false);
	msdsDefController.categoryForm.show(false);
	var curTreeNode = View.panels.get("msdsHazardSystemTree").lastNodeClicked;
	curTreeNode.expand();
	var systems = curTreeNode.data['msds_hazard_system.hazard_system_id'];
	msdsDefController.systems=systems;
	msdsDefController.classes='';
	var sysForm=msdsDefController.msdsHazardSystemForm;
	sysForm.clear();
	sysForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel
	restriction.addClause('msds_hazard_system.hazard_system_id', systems);
	sysForm.refresh(restriction);

}

/**
* event click Class node.
*/
function onSelectNodeClass() {
	msdsDefController.msdsHazardSystemForm.show(false);
	msdsDefController.categoryForm.show(false);
	var curTreeNode = View.panels.get("msdsHazardSystemTree").lastNodeClicked;
	var proForm=msdsDefController.msdsHazardClassForm;
	var systems = curTreeNode.data['msds_hazard_class.hazard_system_id'];
	var classes = curTreeNode.data['msds_hazard_class.hazard_class_id'];
	
	msdsDefController.systems=systems;
	msdsDefController.classes=classes;
	proForm.clear();
	proForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel
	restriction.addClause('msds_hazard_class.hazard_system_id', systems);
	restriction.addClause('msds_hazard_class.hazard_class_id', classes);
	proForm.refresh(restriction);
}


/**
* event click Category node.
*/
function onSelectNodeCategory() {
	
	msdsDefController.msdsHazardSystemForm.show(false);
	msdsDefController.msdsHazardClassForm.show(false);
	var curTreeNode = View.panels.get("msdsHazardSystemTree").lastNodeClicked;
	var proForm=msdsDefController.categoryForm;
	var systems = curTreeNode.data['msds_hazard_category.hazard_system_id'];
	var classes = curTreeNode.data['msds_hazard_category.hazard_class_id'];
	var category = curTreeNode.data['msds_hazard_category.hazard_category_id'];
	msdsDefController.systems=systems;
	msdsDefController.classes=classes;
	proForm.clear();
	proForm.newRecord = false;
	var restriction = new Ab.view.Restriction();
	//restriction record which has been clicked apply to details panel
	restriction.addClause('msds_hazard_category.hazard_system_id', systems);
	restriction.addClause('msds_hazard_category.hazard_class_id', classes);
	restriction.addClause('msds_hazard_category.hazard_category_id', category);
	proForm.refresh(restriction);
}