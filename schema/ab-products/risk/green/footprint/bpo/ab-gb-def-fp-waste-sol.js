/**
 * controller implementation
 */
var abGbDefFpWasteSolCtrl = View.createController('abGbDefFpWasteSolCtrl', {

	// pull down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('waste_sol_version', 'waste_sol_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
		this.abGbDefFpWasteSol_data.getFieldLabelElement("upstream_label").style.fontWeight = "bold";
		this.abGbDefFpWasteSol_data.getFieldLabelElement("downstream_label").style.fontWeight = "bold";
	},
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.units", "SOLID WASTE EMISSIONS");
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
			case 'waste_sol_version':{
				this.abGbDefFpWasteSol_data.show(false, true);
				this.abGbDefFpWasteSol_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'waste_sol_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpWasteSol_version.show(false, true);
				this.abGbDefFpWasteSol_data.refresh(restriction, isNewRecord);
				break;
			}
		}
	},

	/*
	 * check node selection when new solid waste type is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpWasteSolTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		if(lastNodeClicked.level.levelIndex == 0){
			restriction = lastNodeClicked.restriction;
		}else{
			restriction.addClause("gb_fp_waste_sol_data.version_type", lastNodeClicked.data["gb_fp_waste_sol_data.version_type"], "=");
			restriction.addClause("gb_fp_waste_sol_data.version_name", lastNodeClicked.data["gb_fp_waste_sol_data.version_name"], "=");
		}
		return restriction;
	},

	/*
	 * save version  and refresh tree control 
	 */
	abGbDefFpWasteSol_version_onSave: function(){
		if(this.abGbDefFpWasteSol_version.save()){
			this.refreshTree(this.abGbDefFpWasteSol_version);
		}
	},
	
	/*
	 * Save solid waste tzpe and refresh tree control
	 */
	abGbDefFpWasteSol_data_onSave: function(){
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.raw_acquisition").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.manufacture_recycled").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.carbon_sequestration").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.manufacture_mix").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.landfilling").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.combustion").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.recycling").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.composite_disposal").clear();
		this.abGbDefFpWasteSol_data.fields.get("gb_fp_waste_sol_data.composite_downstream").clear();
		
		if(this.abGbDefFpWasteSol_data.canSave()){
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.raw_acquisition_entry", "gb_fp_waste_sol_data.raw_acquisition", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.manufacture_recycled_entry", "gb_fp_waste_sol_data.manufacture_recycled", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.carbon_sequestration_entry", "gb_fp_waste_sol_data.carbon_sequestration", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.manufacture_mix_entry", "gb_fp_waste_sol_data.manufacture_mix", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.landfilling_entry", "gb_fp_waste_sol_data.landfilling", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.combustion_entry", "gb_fp_waste_sol_data.combustion", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.recycling_entry", "gb_fp_waste_sol_data.recycling", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.composite_disposal_entry", "gb_fp_waste_sol_data.composite_disposal", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpWasteSol_data, "gb_fp_waste_sol_data.composite_downstream_entry", "gb_fp_waste_sol_data.composite_downstream", "gb_fp_waste_sol_data.units", "gb_fp_waste_sol_data.units_type")){
				return;
			}
			this.abGbDefFpWasteSol_data.save();
			this.refreshTree(this.abGbDefFpWasteSol_data);
		}
	},
	
	/*
	 * delete gwp data and refresh tree
	 */
	abGbDefFpWasteSol_data_onDelete: function(){
		var form = this.abGbDefFpWasteSol_data;
		var controller = this;
		var message = getMessage("comfirm_delete_waste_sol_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				form.deleteRecord();
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpWasteSol_data);
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
			case "abGbDefFpWasteSol_data":
				formType = "data";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_waste_sol_data.version_name"});
				fields.push({treeField: "gb_fp_waste_sol_data.waste_name.key", formField: "gb_fp_waste_sol_data.waste_name"});
				break;
	
			case "abGbDefFpWasteSol_version":
				formType = "version";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_versions.version_name"});
				break;
	
			default:
				break;
	}
		
		commonRefreshTree(this.abGbDefFpWasteSolTree_version, editForm, formType, fields);
    }
});

/**
 * click tree node event handler
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpWasteSolCtrl");
	var objTree = View.panels.get("abGbDefFpWasteSolTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var type = null;
	if(lastNodeClicked.level.levelIndex == 0){
		type = "waste_sol_version";
	}else{
		type = "waste_sol_data";
	}
	restriction = lastNodeClicked.restriction;
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);
}