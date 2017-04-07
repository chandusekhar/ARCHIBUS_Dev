/*
 * Controller implementation.
 */
var abGbDefFpEmissCtrl = View.createController('abGbDefFpEmissCtrl', {
	
	// pull-down menu parent
	menuParent: null,
	
	// pull-down menu entries
	menu: new Array('emiss_version', 'emiss_data'),
	
	// last tree node clicked
	lastNodeClicked: null,
	
	afterViewLoad:function(){
		this.menuParent = Ext.get('addNew');
		this.menuParent.on('click', this.showMenu, this, null);
	},
	
	afterInitialDataFetch: function(){
		customizeUnitField(this.abGbDefFpEmiss_data, "gb_fp_emiss_data.units", "FUEL EMISSIONS");
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
			case 'emiss_version':{
				this.abGbDefFpEmiss_data.show(false, true);
				this.abGbDefFpEmiss_version.refresh(restriction, isNewRecord);
				break;
			}
			case 'emiss_data':{
				if(isNewRecord){
					restriction = this.checkTreeSelection();
				}
				if(restriction == null){
					return;
				}
				this.abGbDefFpEmiss_version.show(false, true);
				this.abGbDefFpEmiss_data.refresh(restriction, isNewRecord);
				break;
			}
		}
	},
	
	/*
	 * check node selection when new Emission data is selected
	 * return a restriction object with default values selected
	 */
	checkTreeSelection: function(){
		var objTree = this.abGbDefFpEmissTree_version;
		if(!objTree.lastNodeClicked){
			View.showMessage(getMessage("error_no_version"));
			return null;
		}
		var lastNodeClicked = objTree.lastNodeClicked;
		var restriction = new Ab.view.Restriction();
		var versionTypeField = "gb_fp_emiss_data.version_type";
		var versionNameField = "gb_fp_emiss_data.version_name";
		if(lastNodeClicked.level.levelIndex == 0){
			versionTypeField = "gb_fp_versions.version_type";
			versionNameField = "gb_fp_versions.version_name";
		}
		if(valueExistsNotEmpty(lastNodeClicked.data[versionTypeField])){
			restriction.addClause("gb_fp_emiss_data.version_type", lastNodeClicked.data[versionTypeField], "=");
		}
		if(valueExistsNotEmpty(lastNodeClicked.data[versionNameField])){
			restriction.addClause("gb_fp_emiss_data.version_name", lastNodeClicked.data[versionNameField], "=");
		}
		if(valueExistsNotEmpty(lastNodeClicked.data["gb_fp_sectors.sector_name"])){
			restriction.addClause("gb_fp_emiss_data.sector_name", lastNodeClicked.data["gb_fp_sectors.sector_name"], "=");
		}
		if(lastNodeClicked.level.levelIndex == 3){
			lastNodeClicked = lastNodeClicked.parent;
		}
		if(valueExistsNotEmpty(lastNodeClicked.data["gb_fp_emiss_data.fuel_base_code"])){
			restriction.addClause("gb_fp_emiss_data.fuel_base_code", lastNodeClicked.data["gb_fp_emiss_data.fuel_base_code"], "=");
			if(valueExistsNotEmpty(lastNodeClicked.parent.data["gb_fp_sectors.sector_name"])){
				restriction.addClause("gb_fp_emiss_data.sector_name", lastNodeClicked.parent.data["gb_fp_sectors.sector_name"], "=");
			}
		}
		return restriction;
	},
	
	/*
	 * save version
	 */
	abGbDefFpEmiss_version_onSave: function(){
		if(this.abGbDefFpEmiss_version.save()){
			this.refreshTree(this.abGbDefFpEmiss_version);
		}
	},

	/*
	 * Save Emission factors data
	 */
	abGbDefFpEmiss_data_onSave: function(){
		this.abGbDefFpEmiss_data.fields.get("gb_fp_emiss_data.ch4").clear();
		this.abGbDefFpEmiss_data.fields.get("gb_fp_emiss_data.n2o").clear();
		
		if(this.validateSector())
		{
			if(this.abGbDefFpEmiss_data.canSave()){
				// convert user entry  for ch4_entry and n2o_entry
				if(!convertUserEntry(this.abGbDefFpEmiss_data, "gb_fp_emiss_data.ch4_entry", "gb_fp_emiss_data.ch4", "gb_fp_emiss_data.units", "gb_fp_emiss_data.units_type")){
					return;
				}
				if(!convertUserEntry(this.abGbDefFpEmiss_data, "gb_fp_emiss_data.n2o_entry", "gb_fp_emiss_data.n2o", "gb_fp_emiss_data.units", "gb_fp_emiss_data.units_type")){
					return;
				}
			
				if(this.abGbDefFpEmiss_data.save()){
					this.refreshTree(this.abGbDefFpEmiss_data);
				}
			}
		}
	},
	
	/**
	 * Validate existence of sector name value as don't have foreign key
	 */
	validateSector: function(){
		var parameters = null;
		var errorMessage = getMessage("error_sector_name");
		var sector_name = this.abGbDefFpEmiss_data.getFieldValue("gb_fp_emiss_data.sector_name");

		/* 
		 * 03/23/2011 KB 3030810
		 * Temporary solution: if the value to validate begins and ends with apostrophe, return error
		 * TODO: after the core fixes the alteration of the value to validate, remove this code
		 */
		if(!validateValueWithApostrophes(sector_name, errorMessage))
			return false;
		
		parameters = {
		    tableName: 'gb_fp_sectors',
			fieldNames: toJSON(['gb_fp_sectors.sector_name']),
			restriction: toJSON(new Ab.view.Restriction({
			        	'gb_fp_sectors.sector_name': sector_name
			        }))
		};
	    
		try {
			var result = Workflow.call('AbCommonResources-getDataRecords', parameters);
			if(result.dataSet.records.length <= 0){
				View.showMessage(errorMessage);
				return false;
			}
	    } 
	    catch (e) {
	        Workflow.handleError(e);
	        return false;
	    }
	    
	    return true;
    },
    
	/*
	 * Delete Emission Factors data
	 */
	abGbDefFpEmiss_data_onDelete: function(){
		var form = this.abGbDefFpEmiss_data;
		var controller = this;
		var message = getMessage("comfirm_delete_emiss_data");
		View.confirm(message, function(button){
			if(button == "yes"){
				form.deleteRecord();
				form.show(false, true);
				controller.refreshTree(controller.abGbDefFpEmiss_data);
			}
		});
	},


    /**
     * Refreshes the tree at the parent level of the changed form
     * Sets tree's selected tree node
     * @param editForm The edit form panel object
     */
    refreshTree: function(editForm){
		this.abGbDefFpEmissTree_version.lastNodeClicked = null;
    	var tree = this.abGbDefFpEmissTree_version;
    	
    	switch (editForm.id) {
			case "abGbDefFpEmiss_data":
				var versionName = editForm.getFieldValue("gb_fp_emiss_data.version_name");
				var sectorName = editForm.getFieldValue("gb_fp_emiss_data.sector_name");
				var fuelBaseCode = editForm.getFieldValue("gb_fp_emiss_data.fuel_base_code");
				var fuelMode = editForm.getFieldValue("gb_fp_emiss_data.fuel_mode");
				var fuelName = editForm.getFieldValue("gb_fp_emiss_data.fuel_name");
				var rootNode = tree.treeView.getRoot();
				
				// Search the node for the version name of the form (tree's level 0), to refresh it
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	tree.refreshNode(node);
		            	//tree.expandNode(node);
		            	tree.lastNodeClicked = node;

						// Search the node for the sector name of the form (tree's level 1), to refresh it
				        for (var j = 0; j < node.children.length; j++) {
				            var sectorNameNode = node.children[j];
				            if (sectorNameNode.data["gb_fp_emiss_data.sector_name.key"] == sectorName) {
				            	tree.refreshNode(sectorNameNode);
				            	//tree.expandNode(sectorNameNode);
				            	tree.lastNodeClicked = sectorNameNode;

				            	// Search the node for the fuel base code of the form (tree's level 2), to refresh and expand it
						        for (var k = 0; k < sectorNameNode.children.length; k++) {
						            var fuelTypeNode = sectorNameNode.children[k];
						            if (fuelTypeNode.data["gb_fp_emiss_data.fuel_base_code.key"] == fuelBaseCode) {
						            	tree.refreshNode(fuelTypeNode);
						            	tree.expandNode(fuelTypeNode);
						            	tree.lastNodeClicked = fuelTypeNode;

										// Search the node for the fuel mode and fuel name of the form (tree's level 3), to select it in the controller
								        for (var l = 0; l < fuelTypeNode.children.length; l++) {
								            var fuelDataNode = fuelTypeNode.children[l];
								            if (fuelDataNode.data["gb_fp_fuels.fuel_mode.key"] == fuelMode
								            		&& fuelDataNode.data["gb_fp_fuels.fuel_name.key"] == fuelName) {
								            	tree.lastNodeClicked = fuelDataNode;
								            	break;
								            }
								        }
						            	break;
						            }
						        }
				            	break;
				            }
				        }
		            	break;
		            }
		        }
				break;
				
			case "abGbDefFpEmiss_version":
				tree.refresh();

				var versionName = editForm.getFieldValue("gb_fp_versions.version_name");
				var rootNode = tree.treeView.getRoot();
				
				// Search the node for the version name of the form (tree's level 0), to select it
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	tree.refreshNode(node);
		            	//tree.expandNode(node);
		            	tree.lastNodeClicked = node;
		            	break;
		            }
		        }
				break;

			default:
				tree.refresh();
				break;
		}
    }
});

/**
 * On click tree node event handler.
 * @param node
 */
function onClickTreeNode(node){
	var controller = View.controllers.get("abGbDefFpEmissCtrl");
	var objTree = View.panels.get("abGbDefFpEmissTree_version");
	var lastNodeClicked = objTree.lastNodeClicked;
	var restriction = null;
	var type = "";
	if(lastNodeClicked.level.levelIndex == 0){
		type = "emiss_version";
		restriction = lastNodeClicked.restriction;
	}else if(lastNodeClicked.level.levelIndex == 3){
		type = "emiss_data";
		restriction = lastNodeClicked.restriction;
		restriction.addClause("gb_fp_emiss_data.sector_name", lastNodeClicked.data["gb_fp_emiss_data.sector_name"], "=");
		restriction.addClause("gb_fp_emiss_data.version_type", lastNodeClicked.data["gb_fp_emiss_data.version_type"], "=");
		restriction.addClause("gb_fp_emiss_data.version_name", lastNodeClicked.data["gb_fp_emiss_data.version_name"], "=");
	}
	controller.lastNodeClicked = lastNodeClicked;
	controller.onAddNew(type, restriction);
}