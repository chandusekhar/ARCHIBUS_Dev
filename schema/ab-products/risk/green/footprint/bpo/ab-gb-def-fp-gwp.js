/**
 * controller implementation
 */
var abGbDefFpGwpCtrl = View.createController('abGbDefFpGwpCtrl', {
	
	// pull down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('gwp_version', 'gwp_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	
	/*
	 * show pull-down menu.
	 */
	showMenu: function(e, item){
		var menuItems = [];
		for(var i=0;i<this.menu.length;i++){
			var menuItem = null;
			menuItem = new Ext.menu.Item({
				text: getMessage('menu_' + this.menu[i]),
				handler: this.onAddNew.createDelegate(this, [this.menu[i]])});

			menuItems.push(menuItem);
		}
		var menu = new Ext.menu.Menu({items: menuItems});
		menu.show(this.menuParent, 'tl-bl?');
	},
	
	/*
	 * click menu event handler
	 */
	onAddNew: function(type, restriction){
		var isNewRecord = false;
		if(restriction == undefined){
			isNewRecord = true;
			restriction = null;
		}
		switch (type){
			case 'gwp_version':{
				this.abGbDefFpGwp_gwp.show(false, true);
				this.abGbDefFpGwp_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'gwp_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpGwp_version.show(false, true);
				this.abGbDefFpGwp_gwp.refresh(restriction, isNewRecord);
				break;
			}
		}
	},
	
	/*
	 * check node selection when new gwp data is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpGwpTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		if(lastNodeClicked.level.levelIndex == 0){
			restriction = lastNodeClicked.restriction;
		}else{
			restriction.addClause("gb_fp_gwp_data.version_type", lastNodeClicked.data["gb_fp_gwp_data.version_type"], "=");
			restriction.addClause("gb_fp_gwp_data.version_name", lastNodeClicked.data["gb_fp_gwp_data.version_name"], "=");
		}
		return restriction;
	},
	
	/*
	 * save version  and refresh tree control 
	 */
	abGbDefFpGwp_version_onSave: function(){
		if(this.abGbDefFpGwp_version.save()){
			this.refreshTree(this.abGbDefFpGwp_version);
		}
	},
	
	/*
	 * Save gwp data and refresh tree control
	 */
	abGbDefFpGwp_gwp_onSave: function(){
		if(this.abGbDefFpGwp_gwp.save()){
			this.refreshTree(this.abGbDefFpGwp_gwp);
		}
	},
	
	/*
	 * delete gwp data and refresh tree
	 */
	abGbDefFpGwp_gwp_onDelete: function(){
		var form = this.abGbDefFpGwp_gwp;
		var controller = this;
		var message = getMessage("comfirm_delete_gwp_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				form.deleteRecord();
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpGwp_gwp);
			}
		});
	},

    /**
     * Refreshes the tree at the parent level of the changed form
     * Sets controller's selected tree node
     * @param editForm The edit form panel object
     */
    refreshTree: function(editForm){
		var formType = "";
		var fields = [];
		
		switch (editForm.id) {
			case "abGbDefFpGwp_gwp":
				formType = "data";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_gwp_data.version_name"});
				fields.push({treeField: "gb_fp_gwp_data.gas_ref_name.key", formField: "gb_fp_gwp_data.gas_ref_name"});
				break;
	
			case "abGbDefFpGwp_version":
				formType = "version";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_versions.version_name"});
				break;
	
			default:
				break;
		}
		
		commonRefreshTree(this.abGbDefFpGwpTree_version, editForm, formType, fields);
    }
});

/**
 * click tree node event handler
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpGwpCtrl");
	var objTree = View.panels.get("abGbDefFpGwpTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var type = null;
	if(lastNodeClicked.level.levelIndex == 0){
		type = "gwp_version";
	}else{
		type = "gwp_data";
	}
	restriction = lastNodeClicked.restriction;
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);
}