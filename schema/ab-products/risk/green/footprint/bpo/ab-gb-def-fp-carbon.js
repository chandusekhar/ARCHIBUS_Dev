var abGbDefFpCarbonController = View.createController('abGbDefFpCarbonCtrl', {
	afterInitialDataFetch: function(){
	    var titleObj = Ext.get('addNew');
	    titleObj.on('click', this.showMenu, this, null);
	    
	    var units_type = this.abGbDefFpCarbon_dsCarbonCont.fieldDefs.get("gb_fp_carbon_data.units_type").defaultValue;
	    customizeUnitField(this.abGbDefFpCarbon_formCarbonCont, "gb_fp_carbon_data.units", units_type);
	},
	
	/**
	 * Create menu for Add New button
	 * @param {Object} e
	 * @param {Object} item
	 */
	showMenu: function(e, item){
	    var menuItems = [];
	    var menutitle_newCarbonContVersion = getMessage("carbonContVersion");
	    var menutitle_newCarbonContData = getMessage("carbonContData");
	    
	    menuItems.push({
	        text: menutitle_newCarbonContVersion,
	        handler: this.onAddNewButton.createDelegate(this, ['carbonContVersion'])
	    });
	    menuItems.push({
	        text: menutitle_newCarbonContData,
	        handler: this.onAddNewButton.createDelegate(this, ['carbonContData'])
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
    onAddNewButton: function(menuItemId){
        var versionType = "";
        var versionName = "";
        var fuelBaseCode = "";
        var nodeLevelIndex = -1;
        var crtTreeNode = this.abGbDefFpCarbon_treeVersions.lastNodeClicked;

        if (crtTreeNode) {
            nodeLevelIndex = crtTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_versions.version_name.key"];
                    break;
                case 1:
                    versionType = crtTreeNode.data["gb_fp_carbon_data.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_carbon_data.version_name.key"];
                	fuelBaseCode = crtTreeNode.data["gb_fp_carbon_data.fuel_base_code.key"];
                    break;
                case 2:
                    versionType = crtTreeNode.parent.parent.data["gb_fp_versions.version_type.key"];
                    versionName = crtTreeNode.parent.parent.data["gb_fp_versions.version_name.key"];
                	fuelBaseCode = crtTreeNode.data["gb_fp_fuels.fuel_base_code.key"];
                    break;
            }
        }
        
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "carbonContVersion":
                this.abGbDefFpCarbon_formCarbonCont.show(false);
                this.abGbDefFpCarbon_formVersions.refresh(null, true);
                break;
            case "carbonContData":
                if (nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectVersion"));
                    return;
                }
            	restriction.addClause("gb_fp_carbon_data.version_type", versionType, "=");
            	restriction.addClause("gb_fp_carbon_data.version_name", versionName, "=");
            	restriction.addClause("gb_fp_carbon_data.fuel_base_code", fuelBaseCode, "=");
                this.abGbDefFpCarbon_formVersions.show(false);
                this.abGbDefFpCarbon_formCarbonCont.refresh(restriction, true);
                break;
        }
    },

    /**
     * Refreshes the tree at the parent level of the changed form
     * Sets controller's selected tree node
     * @param editForm The edit form panel object
     */
    refreshTree: function(editForm){
    	this.abGbDefFpCarbon_treeVersions.lastNodeClicked = null;
    	switch (editForm.id) {
			case "abGbDefFpCarbon_formCarbonCont":
				var versionName = editForm.getFieldValue("gb_fp_carbon_data.version_name");
				var fuelBaseCode = editForm.getFieldValue("gb_fp_carbon_data.fuel_base_code");
				var fuelName = editForm.getFieldValue("gb_fp_carbon_data.fuel_name");
				var rootNode = this.abGbDefFpCarbon_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to refresh it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpCarbon_treeVersions.refreshNode(node);
		            	this.abGbDefFpCarbon_treeVersions.lastNodeClicked = node;

						/* Search the node for the fuel base code of the form (tree's level 1), to expand it */
				        for (var j = 0; j < node.children.length; j++) {
				            var fuelTypeNode = node.children[j];
				            if (fuelTypeNode.data["gb_fp_carbon_data.fuel_base_code.key"] == fuelBaseCode) {
				            	this.abGbDefFpCarbon_treeVersions.expandNode(fuelTypeNode);
				            	this.abGbDefFpCarbon_treeVersions.lastNodeClicked = fuelTypeNode;

								/* Search the node for the fuel name of the form (tree's level 2), to select it in the controller */
						        for (var k = 0; k < fuelTypeNode.children.length; k++) {
						            var fuelDataNode = fuelTypeNode.children[k];
						            if (fuelDataNode.data["gb_fp_carbon_data.fuel_name.key"] == fuelName) {
						            	this.abGbDefFpCarbon_treeVersions.lastNodeClicked = fuelDataNode;
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
				
			case "abGbDefFpCarbon_formVersions":
				this.abGbDefFpCarbon_treeVersions.refresh();

				var versionName = editForm.getFieldValue("gb_fp_versions.version_name");
				var rootNode = this.abGbDefFpCarbon_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to select it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpCarbon_treeVersions.refreshNode(node);
		            	this.abGbDefFpCarbon_treeVersions.lastNodeClicked = node;
		            	break;
		            }
		        }
				break;

			default:
				this.abGbDefFpCarbon_treeVersions.refresh();
				break;
		}
    },
    
    abGbDefFpCarbon_formCarbonCont_onSave: function(){
		this.abGbDefFpCarbon_formCarbonCont.fields.get("gb_fp_carbon_data.content").clear();

		if(this.abGbDefFpCarbon_formCarbonCont.canSave()){
			// convert the user entered carbon content
			if(!convertUserEntry(this.abGbDefFpCarbon_formCarbonCont,
	    			"gb_fp_carbon_data.content_entry", "gb_fp_carbon_data.content",
	    			"gb_fp_carbon_data.units", "gb_fp_carbon_data.units_type")){
				return;
			}
			
			this.abGbDefFpCarbon_formCarbonCont.save();
			this.refreshTree(this.abGbDefFpCarbon_formCarbonCont);
		}
	},

	abGbDefFpCarbon_formCarbonCont_onDelete: function(){
	    var controller = this;
		var dataSource = this.abGbDefFpCarbon_dsCarbonCont;
		var record = this.abGbDefFpCarbon_formCarbonCont.getRecord();
	    var fuelName = record.getValue("gb_fp_carbon_data.fuel_name");
	    if (!fuelName) {
	        return;
	    }
		var crtView = View;
	    var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', fuelName);
	    View.confirm(confirmMessage, function(button){
	        if (button == 'yes') {
	            try {
	                dataSource.deleteRecord(record);
	            } 
	            catch (e) {
	                var errMessage = getMessage("errorDelete").replace('{0}', fuelName);
	                View.showMessage('error', errMessage, e.message, e.data);
	                return;
	            }
	            controller.abGbDefFpCarbon_formCarbonCont.show(false);
	            controller.refreshTree(controller.abGbDefFpCarbon_formCarbonCont);
	        }
	    })
    }
})

/**
 * Shows details for selected node
 */
function onClickTreeNode(){
    var controller = View.controllers.get("abGbDefFpCarbonCtrl");
    var crtTreeNode = controller.abGbDefFpCarbon_treeVersions.lastNodeClicked;
    var levelIndex = crtTreeNode.level.levelIndex;
    var restriction = new Ab.view.Restriction();

    // Carbon Content versions
    if (levelIndex == 0) {
    	var versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.data["gb_fp_versions.version_name.key"]
    	restriction.addClause("gb_fp_carbon_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_carbon_data.version_name", versionName, "=");
    	controller.abGbDefFpCarbon_formCarbonCont.show(false);
    	controller.abGbDefFpCarbon_formVersions.refresh(restriction, false);
    }

    // Data
    if (levelIndex == 2) {
    	var versionType = crtTreeNode.parent.parent.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.parent.parent.data["gb_fp_versions.version_name.key"]
    	var fuelBaseCode = crtTreeNode.data["gb_fp_fuels.fuel_base_code.key"];
    	var fuelMode = crtTreeNode.data["gb_fp_fuels.fuel_mode.key"]
    	var fuelName = crtTreeNode.data["gb_fp_fuels.fuel_name.key"];
    	restriction.addClause("gb_fp_carbon_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_carbon_data.version_name", versionName, "=");
    	restriction.addClause("gb_fp_carbon_data.fuel_base_code", fuelBaseCode, "=");
    	restriction.addClause("gb_fp_carbon_data.fuel_mode", fuelMode, "=");
    	restriction.addClause("gb_fp_carbon_data.fuel_name", fuelName, "=");
    	controller.abGbDefFpCarbon_formVersions.show(false);
    	controller.abGbDefFpCarbon_formCarbonCont.refresh(restriction, false);
    }
}
