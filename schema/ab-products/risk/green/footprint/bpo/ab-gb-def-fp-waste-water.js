/**
 * controller implementation
 */
var abGbDefFpWasteWaterCtrl = View.createController('abGbDefFpWasteWaterCtrl', {
	
	// pull-down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('waste_water_version', 'waste_water_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
		
		this.abGbDefFpWasteLiq_data.setMaxValue('gb_fp_waste_liq_data.percent_anaerobic', 100);
		this.abGbDefFpWasteLiq_data.setMinValue('gb_fp_waste_liq_data.percent_anaerobic', 0);
	},
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpWasteLiq_data, "gb_fp_waste_liq_data.units", "WASTE WATER EMISSIONS");
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
			case 'waste_water_version':{
				this.abGbDefFpWasteLiq_data.show(false, true);
				this.abGbDefFpWasteLiq_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'waste_water_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpWasteLiq_version.show(false, true);
				this.abGbDefFpWasteLiq_data.refresh(restriction, isNewRecord);
				break;
			}
		}
	},
	
	/*
	 * check node selection when new solid waste type is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpWasteLiqTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		if(lastNodeClicked.level.levelIndex == 0){
			restriction = lastNodeClicked.restriction;
		}else{
			restriction.addClause("gb_fp_waste_liq_data.version_type", lastNodeClicked.data["gb_fp_waste_liq_data.version_type"], "=");
			restriction.addClause("gb_fp_waste_liq_data.version_name", lastNodeClicked.data["gb_fp_waste_liq_data.version_name"], "=");
		}
		return restriction;
	},
	
	/*
	 * save version  and refresh tree control 
	 */
	abGbDefFpWasteLiq_version_onSave: function(){
		if(this.abGbDefFpWasteLiq_version.save()){
			this.refreshTree(this.abGbDefFpWasteLiq_version);
		}
	},

	/*
	 * Save solid waste tzpe and refresh tree control
	 */
	abGbDefFpWasteLiq_data_onSave: function(){
		this.abGbDefFpWasteLiq_data.fields.get("gb_fp_waste_liq_data.bod5_wastewater").clear();
		
		if(this.abGbDefFpWasteLiq_data.canSave()){
			if(!convertUserEntry(this.abGbDefFpWasteLiq_data, "gb_fp_waste_liq_data.bod5_wastewater_entry", "gb_fp_waste_liq_data.bod5_wastewater", "gb_fp_waste_liq_data.units", "gb_fp_waste_liq_data.units_type")){
				return;
			}
			this.abGbDefFpWasteLiq_data.save();
			this.refreshTree(this.abGbDefFpWasteLiq_data);
		}
	},
	
	/*
	 * delete gwp data and refresh tree
	 */
	abGbDefFpWasteLiq_data_onDelete: function(){
		var form = this.abGbDefFpWasteLiq_data;
		var controller = this;
		var message = getMessage("comfirm_delete_waste_water_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				form.deleteRecord();
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpWasteLiq_data);
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
			case "abGbDefFpWasteLiq_data":
				formType = "data";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_waste_liq_data.version_name"});
				fields.push({treeField: "gb_fp_waste_liq_data.treatment_id.key", formField: "gb_fp_waste_liq_data.treatment_id"});
				break;
	
			case "abGbDefFpWasteLiq_version":
				formType = "version";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_versions.version_name"});
				break;
	
			default:
				break;
		}
		
		commonRefreshTree(this.abGbDefFpWasteLiqTree_version, editForm, formType, fields);
    }
});

/**
 * On click tree node event handler.
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpWasteWaterCtrl");
	var objTree = View.panels.get("abGbDefFpWasteLiqTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var restriction = null;
	var type = "";
	if(lastNodeClicked.level.levelIndex == 0){
		type = "waste_water_version";
	}else {
		type = "waste_water_data";
	}
	restriction = lastNodeClicked.restriction;
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);
}