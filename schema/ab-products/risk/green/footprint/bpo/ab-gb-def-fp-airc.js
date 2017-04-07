/**
 * Controller implementation
 */
var abGbDefFpAircCtrl = View.createController('abGbDefFpAircCtrl', {
	
	// pull down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('airc_version', 'airc_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpAirc_data, "gb_fp_airc_data.units", "AIRCRAFT FUEL CONSUMPTION");
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
			case 'airc_version':{
				this.abGbDefFpAirc_data.show(false, true);
				this.abGbDefFpAirc_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'airc_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpAirc_version.show(false, true);
				this.abGbDefFpAirc_data.refresh(restriction, isNewRecord);
				break;
			}
		}
	},
	
	/*
	 * check node selection when new aircraft data is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpAircTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		if(lastNodeClicked.level.levelIndex == 0){
			restriction = lastNodeClicked.restriction;
		}else{
			restriction.addClause("gb_fp_airc_data.version_type", lastNodeClicked.data["gb_fp_airc_data.version_type"], "=");
			restriction.addClause("gb_fp_airc_data.version_name", lastNodeClicked.data["gb_fp_airc_data.version_name"], "=");
		}
		return restriction;
	},

	/*
	 * save version  and refresh tree control 
	 */
	abGbDefFpAirc_version_onSave: function(){
		if(this.abGbDefFpAirc_version.save()){
			this.refreshTree(this.abGbDefFpAirc_version);
		}
	},

	/*
	 * Save gwp data and refresh tree control
	 */
    abGbDefFpAirc_data_onSave: function(){
		this.abGbDefFpAirc_data.fields.get("gb_fp_airc_data.avg_fuel").clear();
        
        if (this.abGbDefFpAirc_data.canSave()) {
            if (!convertUserEntry(this.abGbDefFpAirc_data, "gb_fp_airc_data.avg_fuel_entry", "gb_fp_airc_data.avg_fuel", "gb_fp_airc_data.units", "gb_fp_airc_data.units_type")) {
                return;
            }
			this.abGbDefFpAirc_data.save();
			this.refreshTree(this.abGbDefFpAirc_data);
        }
    },
	
	/*
	 * delete gwp data and refresh tree
	 */
	abGbDefFpAirc_data_onDelete: function(){
		var form = this.abGbDefFpAirc_data;
		var controller = this;
		var message = getMessage("comfirm_delete_airc_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				form.deleteRecord();
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpAirc_data);
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
			case "abGbDefFpAirc_data":
				formType = "data";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_airc_data.version_name"});
				fields.push({treeField: "gb_fp_airc_data.aircraft_type.key", formField: "gb_fp_airc_data.aircraft_type"});
				break;
	
			case "abGbDefFpAirc_version":
				formType = "version";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_versions.version_name"});
				break;
	
			default:
				break;
		}
		
		commonRefreshTree(this.abGbDefFpAircTree_version, editForm, formType, fields);
    }
});

/**
 * click tree node event handler
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpAircCtrl");
	var objTree = View.panels.get("abGbDefFpAircTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var type = null;
	if(lastNodeClicked.level.levelIndex == 0){
		type = "airc_version";
	}else{
		type = "airc_data";
	}
	restriction = lastNodeClicked.restriction;
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);
	
}