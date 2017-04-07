/**
 * controller implementation
 */
var abGbDefFpMobileCtrl = View.createController('abGbDefFpMobileCtrl', {
	
	// pull down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('mobile_version', 'mobile_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpMobile_data, "gb_fp_mobile_data.co2_units", "MOBILE CO2 EMISSIONS");
		customizeUnitField(this.abGbDefFpMobile_data, "gb_fp_mobile_data.ch4_n2o_units", "MOBILE CH4-N2O EMISSIONS");
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
			case 'mobile_version':{
				this.abGbDefFpMobile_data.show(false, true);
				this.abGbDefFpMobile_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'mobile_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpMobile_version.show(false, true);
				this.abGbDefFpMobile_data.refresh(restriction, isNewRecord);
				break;
			}
		}
	},
	
	/*
	 * check node selection when new mobile data is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpMobileTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		if(lastNodeClicked.level.levelIndex == 0){
			restriction = lastNodeClicked.restriction;
		}else{
			restriction.addClause("gb_fp_mobile_data.version_type", lastNodeClicked.data["gb_fp_mobile_data.version_type"], "=");
			restriction.addClause("gb_fp_mobile_data.version_name", lastNodeClicked.data["gb_fp_mobile_data.version_name"], "=");
		}
		return restriction;
		
	},
	
	/*
	 * save version
	 */
	abGbDefFpMobile_version_onSave: function(){
		if(this.abGbDefFpMobile_version.save()){
			this.refreshTree(this.abGbDefFpMobile_version);
		}
	},

	/*
	 * save transportation type and data
	 */
	abGbDefFpMobile_data_onSave: function(){
		this.abGbDefFpMobile_data.fields.get("gb_fp_mobile_data.co2").clear();
		this.abGbDefFpMobile_data.fields.get("gb_fp_mobile_data.ch4").clear();
		this.abGbDefFpMobile_data.fields.get("gb_fp_mobile_data.n2o").clear();
		
		if(this.abGbDefFpMobile_data.canSave()){
			if(!convertUserEntry(this.abGbDefFpMobile_data, "gb_fp_mobile_data.co2_entry", "gb_fp_mobile_data.co2", "gb_fp_mobile_data.co2_units", "gb_fp_mobile_data.co2_units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpMobile_data, "gb_fp_mobile_data.ch4_entry", "gb_fp_mobile_data.ch4", "gb_fp_mobile_data.ch4_n2o_units", "gb_fp_mobile_data.ch4_n2o_units_type")){
				return;
			}
			if(!convertUserEntry(this.abGbDefFpMobile_data, "gb_fp_mobile_data.n2o_entry", "gb_fp_mobile_data.n2o", "gb_fp_mobile_data.ch4_n2o_units", "gb_fp_mobile_data.ch4_n2o_units_type")){
				return;
			}
			
			this.abGbDefFpMobile_data.save();
			this.refreshTree(this.abGbDefFpMobile_data);
		}
		
	},
	
	/*
	 * delete transportation type and data
	 */
	abGbDefFpMobile_data_onDelete: function(){
		var form = this.abGbDefFpMobile_data;
		var controller = this;
		var message = getMessage("comfirm_delete_mobile_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				var ds = form.getDataSource();
				var record = ds.getRecord(form.getPrimaryKeyRestriction());
				ds.deleteRecord(record);
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpMobile_data);
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
			case "abGbDefFpMobile_data":
				formType = "data";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_mobile_data.version_name"});
				fields.push({treeField: "gb_fp_mobile_data.vehicle_type.key", formField: "gb_fp_mobile_data.vehicle_type"});
				break;
	
			case "abGbDefFpMobile_version":
				formType = "version";
				fields.push({treeField: "gb_fp_versions.version_name.key", formField: "gb_fp_versions.version_name"});
				break;
	
			default:
				break;
		}
		
		commonRefreshTree(this.abGbDefFpMobileTree_version, editForm, formType, fields);
    }
});

/**
 * On click tree node event handler
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpMobileCtrl");
	var objTree = View.panels.get("abGbDefFpMobileTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var type = null;
	if(lastNodeClicked.level.levelIndex == 0){
		type = "mobile_version";
	}else{
		type = "mobile_data";
	}
	restriction = lastNodeClicked.restriction;
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);	
}

