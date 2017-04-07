/**
 * controller implementation
 */
var abGbDefFpRefrigCtrl = View.createController('abGbDefFpRefrigCtrl', {

	// pull down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('refrig_version', 'refrig_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
		
		this.abGbDefFpRefrig_data.setMaxValue('gb_fp_refrig_data.operation_emiss', 100);
		this.abGbDefFpRefrig_data.setMinValue('gb_fp_refrig_data.operation_emiss', 0);
	},
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpRefrig_data, "gb_fp_refrig_data.units", "REFRIGERATION EMISSIONS");
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
			case 'refrig_version':{
				this.abGbDefFpRefrig_data.show(false, true);
				this.abGbDefFpRefrig_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'refrig_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpRefrig_version.show(false, true);
				this.abGbDefFpRefrig_data.refresh(restriction, isNewRecord);
				break;
			}
		}
	},

	/*
	 * check node selection when new gwp data is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpRefrigTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		if(lastNodeClicked.level.levelIndex == 0){
			restriction = lastNodeClicked.restriction;
		}else{
			restriction.addClause("gb_fp_refrig_data.version_type", lastNodeClicked.data["gb_fp_refrig_data.version_type"], "=");
			restriction.addClause("gb_fp_refrig_data.version_name", lastNodeClicked.data["gb_fp_refrig_data.version_name"], "=");
		}
		return restriction;
	},

	/*
	 * save version  and refresh tree control 
	 */
	abGbDefFpRefrig_version_onSave: function(){
		if(this.abGbDefFpRefrig_version.save()){
			this.refreshTree(this.abGbDefFpRefrig_version);
		}
	},
	
	/*
	 * Save refrig data and refresh tree control
	 */
	abGbDefFpRefrig_data_onSave: function(){
		this.abGbDefFpRefrig_data.fields.get("gb_fp_refrig_data.charge").clear();
		
		if(this.abGbDefFpRefrig_data.canSave()){
			if(!convertUserEntry(this.abGbDefFpRefrig_data, "gb_fp_refrig_data.charge_entry", "gb_fp_refrig_data.charge", "gb_fp_refrig_data.units", "gb_fp_refrig_data.units_type")){
				return;
			}
			this.abGbDefFpRefrig_data.save();
			this.refreshTree(this.abGbDefFpRefrig_data);
		}
	},
	
	/*
	 * delete gwp data and refresh tree
	 */
	abGbDefFpRefrig_data_onDelete: function(){
		var form = this.abGbDefFpRefrig_data;
		var controller = this;
		var message = getMessage("comfirm_delete_refrig_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				form.deleteRecord();
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpRefrig_data);
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
			case "abGbDefFpRefrig_data":
				formType = "data";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_refrig_data.version_name"});
				fields.push({treeField: "gb_fp_refrig_data.refrig_ac_type.key", formField: "gb_fp_refrig_data.refrig_ac_type"});
				break;
	
			case "abGbDefFpRefrig_version":
				formType = "version";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_versions.version_name"});
				break;
	
			default:
				break;
		}
		
		commonRefreshTree(this.abGbDefFpRefrigTree_version, editForm, formType, fields);
    }
});

/**
 * click tree node event handler
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpRefrigCtrl");
	var objTree = View.panels.get("abGbDefFpRefrigTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var type = null;
	if(lastNodeClicked.level.levelIndex == 0){
		type = "refrig_version";
	}else{
		type = "refrig_data";
	}
	restriction = lastNodeClicked.restriction;
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);
}