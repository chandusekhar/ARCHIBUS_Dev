var abGbDefFpFuelDensController = View.createController('abGbDefFpFuelDensCtrl', {
	afterInitialDataFetch: function(){
	    var titleObj = Ext.get('addNew');
	    titleObj.on('click', this.showMenu, this, null);
	    
	    var units_type = this.abGbDefFpFuelDens_dsFuelDens.fieldDefs.get("gb_fp_fuel_dens_data.units_type").defaultValue;
	    customizeUnitField(this.abGbDefFpFuelDens_formFuelDens, "gb_fp_fuel_dens_data.units", units_type);
	},
	
	/**
	 * Create menu for Add New button
	 * @param {Object} e
	 * @param {Object} item
	 */
	showMenu: function(e, item){
	    var menuItems = [];
	    var menutitle_newFuelDensVersion = getMessage("fuelDensVersion");
	    var menutitle_newFuelDensData = getMessage("fuelDensData");
	    
	    menuItems.push({
	        text: menutitle_newFuelDensVersion,
	        handler: this.onAddNewButton.createDelegate(this, ['fuelDensVersion'])
	    });
	    menuItems.push({
	        text: menutitle_newFuelDensData,
	        handler: this.onAddNewButton.createDelegate(this, ['fuelDensData'])
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
        var crtTreeNode = this.abGbDefFpFuelDens_treeVersions.lastNodeClicked;

        if (crtTreeNode) {
            nodeLevelIndex = crtTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_versions.version_name.key"];
                    break;
                case 1:
                    versionType = crtTreeNode.data["gb_fp_fuel_dens_data.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_fuel_dens_data.version_name.key"];
                	fuelBaseCode = crtTreeNode.data["gb_fp_fuel_dens_data.fuel_base_code.key"];
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
            case "fuelDensVersion":
                this.abGbDefFpFuelDens_formFuelDens.show(false);
                this.abGbDefFpFuelDens_formVersions.refresh(null, true);
                break;
            case "fuelDensData":
                if (nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectVersion"));
                    return;
                }
            	restriction.addClause("gb_fp_fuel_dens_data.version_type", versionType, "=");
            	restriction.addClause("gb_fp_fuel_dens_data.version_name", versionName, "=");
            	restriction.addClause("gb_fp_fuel_dens_data.fuel_base_code", fuelBaseCode, "=");
            	this.abGbDefFpFuelDens_formVersions.show(false);
            	this.abGbDefFpFuelDens_formFuelDens.refresh(restriction, true);
                break;
        }
    },

    /**
     * Refreshes the tree at the parent level of the changed form
     * Sets controller's selected tree node
     * @param editForm The edit form panel object
     */
    refreshTree: function(editForm){
    	this.abGbDefFpFuelDens_treeVersions.lastNodeClicked = null;
    	switch (editForm.id) {
			case "abGbDefFpFuelDens_formFuelDens":
				var versionName = editForm.getFieldValue("gb_fp_fuel_dens_data.version_name");
				var fuelBaseCode = editForm.getFieldValue("gb_fp_fuel_dens_data.fuel_base_code");
				var fuelName = editForm.getFieldValue("gb_fp_fuel_dens_data.fuel_name");
				var rootNode = this.abGbDefFpFuelDens_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to refresh it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpFuelDens_treeVersions.refreshNode(node);
		            	this.abGbDefFpFuelDens_treeVersions.lastNodeClicked = node;

						/* Search the node for the fuel base code of the form (tree's level 1), to expand it */
				        for (var j = 0; j < node.children.length; j++) {
				            var fuelTypeNode = node.children[j];
				            if (fuelTypeNode.data["gb_fp_fuel_dens_data.fuel_base_code.key"] == fuelBaseCode) {
				            	this.abGbDefFpFuelDens_treeVersions.expandNode(fuelTypeNode);
				            	this.abGbDefFpFuelDens_treeVersions.lastNodeClicked = fuelTypeNode;

								/* Search the node for the fuel name of the form (tree's level 2), to select it in the controller */
						        for (var k = 0; k < fuelTypeNode.children.length; k++) {
						            var fuelDataNode = fuelTypeNode.children[k];
						            if (fuelDataNode.data["gb_fp_fuel_dens_data.fuel_name.key"] == fuelName) {
						            	this.abGbDefFpFuelDens_treeVersions.lastNodeClicked = fuelDataNode;
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
				
			case "abGbDefFpFuelDens_formVersions":
				this.abGbDefFpFuelDens_treeVersions.refresh();

				var versionName = editForm.getFieldValue("gb_fp_versions.version_name");
				var rootNode = this.abGbDefFpFuelDens_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to select it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpFuelDens_treeVersions.refreshNode(node);
		            	this.abGbDefFpFuelDens_treeVersions.lastNodeClicked = node;
		            	break;
		            }
		        }
				break;

			default:
				this.abGbDefFpFuelDens_treeVersions.refresh();
				break;
		}
    },
    
    abGbDefFpFuelDens_formFuelDens_onSave: function(){
		this.abGbDefFpFuelDens_formFuelDens.fields.get("gb_fp_fuel_dens_data.fuel_density").clear();
		
		if(this.abGbDefFpFuelDens_formFuelDens.canSave()){
			// convert the user entered fuel density
			if(!convertUserEntry(this.abGbDefFpFuelDens_formFuelDens,
	    			"gb_fp_fuel_dens_data.fuel_density_entry", "gb_fp_fuel_dens_data.fuel_density",
	    			"gb_fp_fuel_dens_data.units", "gb_fp_fuel_dens_data.units_type"))
				return;
			
			this.abGbDefFpFuelDens_formFuelDens.save();
			this.refreshTree(this.abGbDefFpFuelDens_formFuelDens);
		}
	},

	abGbDefFpFuelDens_formFuelDens_onDelete: function(){
	    var controller = this;
		var dataSource = this.abGbDefFpFuelDens_dsFuelDens;
		var record = this.abGbDefFpFuelDens_formFuelDens.getRecord();
	    var fuelName = record.getValue("gb_fp_fuel_dens_data.fuel_name");
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
	            controller.abGbDefFpFuelDens_formFuelDens.show(false);
	            controller.refreshTree(controller.abGbDefFpFuelDens_formFuelDens);
	        }
	    })
    }
})

/**
 * Shows details for selected node
 */
function onClickTreeNode(){
    var controller = View.controllers.get("abGbDefFpFuelDensCtrl");
    var crtTreeNode = controller.abGbDefFpFuelDens_treeVersions.lastNodeClicked;
    var levelIndex = crtTreeNode.level.levelIndex;
    var restriction = new Ab.view.Restriction();

    // Fuel versions
    if (levelIndex == 0) {
    	var versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.data["gb_fp_versions.version_name.key"]
    	restriction.addClause("gb_fp_fuel_dens_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_fuel_dens_data.version_name", versionName, "=");
    	controller.abGbDefFpFuelDens_formFuelDens.show(false);
    	controller.abGbDefFpFuelDens_formVersions.refresh(restriction, false);
    }

    // Data
    if (levelIndex == 2) {
    	var versionType = crtTreeNode.parent.parent.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.parent.parent.data["gb_fp_versions.version_name.key"]
    	var fuelBaseCode = crtTreeNode.data["gb_fp_fuels.fuel_base_code.key"];
    	var fuelMode = crtTreeNode.data["gb_fp_fuels.fuel_mode.key"]
    	var fuelName = crtTreeNode.data["gb_fp_fuels.fuel_name.key"];
    	restriction.addClause("gb_fp_fuel_dens_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_fuel_dens_data.version_name", versionName, "=");
    	restriction.addClause("gb_fp_fuel_dens_data.fuel_base_code", fuelBaseCode, "=");
    	restriction.addClause("gb_fp_fuel_dens_data.fuel_mode", fuelMode, "=");
    	restriction.addClause("gb_fp_fuel_dens_data.fuel_name", fuelName, "=");
    	controller.abGbDefFpFuelDens_formVersions.show(false);
    	controller.abGbDefFpFuelDens_formFuelDens.refresh(restriction, false);
    }
}

