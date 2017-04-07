/**
 * controller implementation
 */
var abGbDefFpCommAircCtrl = View.createController('abGbDefFpCommAircCtrl', {
	
	// pull down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('comm_airc_version', 'comm_airc_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpCommAirc_data, "gb_fp_comm_airc_data.co2_units", "COMMERC AIR CO2 EMISSIONS");
		customizeUnitField(this.abGbDefFpCommAirc_data, "gb_fp_comm_airc_data.ch4_n2o_units", "COMMERC AIR CH4-N2O EMISSIONS");
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
			case 'comm_airc_version':{
				this.abGbDefFpCommAirc_data.show(false, true);
				this.abGbDefFpCommAirc_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'comm_airc_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpCommAirc_version.show(false, true);
				this.abGbDefFpCommAirc_data.refresh(restriction, isNewRecord);
				break;
			}
		}
	},
	
	/*
	 * check node selection when new aircraft data is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpCommAircTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		if(lastNodeClicked.level.levelIndex == 0){
			restriction = lastNodeClicked.restriction;
		}else{
			restriction.addClause("gb_fp_comm_airc_data.version_type", lastNodeClicked.data["gb_fp_comm_airc_data.version_type"], "=");
			restriction.addClause("gb_fp_comm_airc_data.version_name", lastNodeClicked.data["gb_fp_comm_airc_data.version_name"], "=");
		}
		return restriction;
	},

	/*
	 * save version  and refresh tree control 
	 */
	abGbDefFpCommAirc_version_onSave: function(){
		if(this.abGbDefFpCommAirc_version.save()){
			this.refreshTree(this.abGbDefFpCommAirc_version);
		}
	},

	/*
	 * Save gwp data and refresh tree control
	 */
	abGbDefFpCommAirc_data_onSave: function(){
		this.abGbDefFpCommAirc_data.fields.get("gb_fp_comm_airc_data.co2").clear();
		this.abGbDefFpCommAirc_data.fields.get("gb_fp_comm_airc_data.ch4").clear();
		this.abGbDefFpCommAirc_data.fields.get("gb_fp_comm_airc_data.n2o").clear();
		
		if(this.abGbDefFpCommAirc_data.canSave()){
			if(!convertUserEntry(this.abGbDefFpCommAirc_data, "gb_fp_comm_airc_data.co2_entry", "gb_fp_comm_airc_data.co2", "gb_fp_comm_airc_data.co2_units", "gb_fp_comm_airc_data.co2_units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpCommAirc_data, "gb_fp_comm_airc_data.ch4_entry", "gb_fp_comm_airc_data.ch4", "gb_fp_comm_airc_data.ch4_n2o_units", "gb_fp_comm_airc_data.ch4_n2o_units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpCommAirc_data, "gb_fp_comm_airc_data.n2o_entry", "gb_fp_comm_airc_data.n2o", "gb_fp_comm_airc_data.ch4_n2o_units", "gb_fp_comm_airc_data.ch4_n2o_units_type")){
				return;
			}
			this.abGbDefFpCommAirc_data.save();
			this.refreshTree(this.abGbDefFpCommAirc_data);
		}
	},
	
	/*
	 * delete gwp data and refresh tree
	 */
	abGbDefFpCommAirc_data_onDelete: function(){
		var form = this.abGbDefFpCommAirc_data;
		var controller = this;
		var message = getMessage("comfirm_delete_comm_airc_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				var ds = form.getDataSource();
				var record = ds.getRecord(form.getPrimaryKeyRestriction());
				ds.deleteRecord(record);
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpCommAirc_data);
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
			case "abGbDefFpCommAirc_data":
				formType = "data";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_comm_airc_data.version_name"});
				fields.push({treeField: "gb_fp_comm_airc_data.seating_type.key", formField: "gb_fp_comm_airc_data.seating_type"});
				fields.push({treeField: "gb_fp_comm_airc_data.distance_type.key", formField: "gb_fp_comm_airc_data.distance_type"});
				break;
	
			case "abGbDefFpCommAirc_version":
				formType = "version";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_versions.version_name"});
				break;
	
			default:
				break;
		}
		
		commonRefreshTree(this.abGbDefFpCommAircTree_version, editForm, formType, fields);
    }
	
});

/**
 * click tree node event handler
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpCommAircCtrl");
	var objTree = View.panels.get("abGbDefFpCommAircTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var type = null;
	if(lastNodeClicked.level.levelIndex == 0){
		type = "comm_airc_version";
	}else{
		type = "comm_airc_data";
	}
	restriction = lastNodeClicked.restriction;
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);
	
}
