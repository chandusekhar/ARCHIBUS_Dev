var abGbDefFpOxidController = View.createController('abGbDefFpOxidCtrl', {
	afterViewLoad: function(){
		this.abGbDefFpOxid_formOxidFact.setMaxValue('gb_fp_oxid_data.factor', 100);
		this.abGbDefFpOxid_formOxidFact.setMinValue('gb_fp_oxid_data.factor', 0);
	},
	
	afterInitialDataFetch: function(){
	    var titleObj = Ext.get('addNew');
	    titleObj.on('click', this.showMenu, this, null);
	},
	
	/**
	 * Create menu for Add New button
	 * @param {Object} e
	 * @param {Object} item
	 */
	showMenu: function(e, item){
	    var menuItems = [];
	    var menutitle_newOxidFactVersion = getMessage("OxidFactVersion");
	    var menutitle_newOxidFactData = getMessage("OxidFactData");
	    
	    menuItems.push({
	        text: menutitle_newOxidFactVersion,
	        handler: this.onAddNewButton.createDelegate(this, ['OxidFactVersion'])
	    });
	    menuItems.push({
	        text: menutitle_newOxidFactData,
	        handler: this.onAddNewButton.createDelegate(this, ['OxidFactData'])
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
        var crtTreeNode = this.abGbDefFpOxid_treeVersions.lastNodeClicked;

        if (crtTreeNode) {
            nodeLevelIndex = crtTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_versions.version_name.key"];
                    break;
                case 1:
                    versionType = crtTreeNode.data["gb_fp_oxid_data.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_oxid_data.version_name.key"];
                	fuelBaseCode = crtTreeNode.data["gb_fp_oxid_data.fuel_base_code.key"];
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
            case "OxidFactVersion":
                this.abGbDefFpOxid_formOxidFact.show(false);
                this.abGbDefFpOxid_formVersions.refresh(null, true);
                break;
            case "OxidFactData":
                if (nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectVersion"));
                    return;
                }
            	restriction.addClause("gb_fp_oxid_data.version_type", versionType, "=");
            	restriction.addClause("gb_fp_oxid_data.version_name", versionName, "=");
            	restriction.addClause("gb_fp_oxid_data.fuel_base_code", fuelBaseCode, "=");
                this.abGbDefFpOxid_formVersions.show(false);
                this.abGbDefFpOxid_formOxidFact.refresh(restriction, true);
                break;
        }
    },

    /**
     * Refreshes the tree at the parent level of the changed form
     * Sets controller's selected tree node
     * @param editForm The edit form panel object
     */
    refreshTree: function(editForm){
    	this.abGbDefFpOxid_treeVersions.lastNodeClicked = null;
    	switch (editForm.id) {
			case "abGbDefFpOxid_formOxidFact":
				var versionName = editForm.getFieldValue("gb_fp_oxid_data.version_name");
				var fuelBaseCode = editForm.getFieldValue("gb_fp_oxid_data.fuel_base_code");
				var fuelName = editForm.getFieldValue("gb_fp_oxid_data.fuel_name");
				var rootNode = this.abGbDefFpOxid_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to refresh it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpOxid_treeVersions.refreshNode(node);
		            	this.abGbDefFpOxid_treeVersions.lastNodeClicked = node;

						/* Search the node for the fuel base code of the form (tree's level 1), to expand it */
				        for (var j = 0; j < node.children.length; j++) {
				            var fuelTypeNode = node.children[j];
				            if (fuelTypeNode.data["gb_fp_oxid_data.fuel_base_code.key"] == fuelBaseCode) {
				            	this.abGbDefFpOxid_treeVersions.expandNode(fuelTypeNode);
				            	this.abGbDefFpOxid_treeVersions.lastNodeClicked = fuelTypeNode;

								/* Search the node for the fuel name of the form (tree's level 2), to select it in the controller */
						        for (var k = 0; k < fuelTypeNode.children.length; k++) {
						            var fuelDataNode = fuelTypeNode.children[k];
						            if (fuelDataNode.data["gb_fp_oxid_data.fuel_name.key"] == fuelName) {
						            	this.abGbDefFpOxid_treeVersions.lastNodeClicked = fuelDataNode;
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
				
			case "abGbDefFpOxid_formVersions":
				this.abGbDefFpOxid_treeVersions.refresh();

				var versionName = editForm.getFieldValue("gb_fp_versions.version_name");
				var rootNode = this.abGbDefFpOxid_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to select it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpOxid_treeVersions.refreshNode(node);
		            	this.abGbDefFpOxid_treeVersions.lastNodeClicked = node;
		            	break;
		            }
		        }
				break;

			default:
				this.abGbDefFpOxid_treeVersions.refresh();
				break;
		}
    },

	abGbDefFpOxid_formOxidFact_onDelete: function(){
	    var controller = this;
		var dataSource = this.abGbDefFpOxid_dsOxidFact;
		var record = this.abGbDefFpOxid_formOxidFact.getRecord();
	    var fuelName = record.getValue("gb_fp_oxid_data.fuel_name");
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
	            controller.abGbDefFpOxid_formOxidFact.show(false);
	            controller.refreshTree(controller.abGbDefFpOxid_formOxidFact);
	        }
	    })
    }
})

/**
 * Shows details for selected node
 */
function onClickTreeNode(){
    var controller = View.controllers.get("abGbDefFpOxidCtrl");
    var crtTreeNode = controller.abGbDefFpOxid_treeVersions.lastNodeClicked;
    var levelIndex = crtTreeNode.level.levelIndex;
    var restriction = new Ab.view.Restriction();

    // Oxidation Factor versions
    if (levelIndex == 0) {
    	var versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.data["gb_fp_versions.version_name.key"]
    	restriction.addClause("gb_fp_oxid_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_oxid_data.version_name", versionName, "=");
    	controller.abGbDefFpOxid_formOxidFact.show(false);
    	controller.abGbDefFpOxid_formVersions.refresh(restriction, false);
    }

    // Data
    if (levelIndex == 2) {
    	var versionType = crtTreeNode.parent.parent.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.parent.parent.data["gb_fp_versions.version_name.key"]
    	var fuelBaseCode = crtTreeNode.data["gb_fp_fuels.fuel_base_code.key"];
    	var fuelMode = crtTreeNode.data["gb_fp_fuels.fuel_mode.key"]
    	var fuelName = crtTreeNode.data["gb_fp_fuels.fuel_name.key"];
    	restriction.addClause("gb_fp_oxid_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_oxid_data.version_name", versionName, "=");
    	restriction.addClause("gb_fp_oxid_data.fuel_base_code", fuelBaseCode, "=");
    	restriction.addClause("gb_fp_oxid_data.fuel_mode", fuelMode, "=");
    	restriction.addClause("gb_fp_oxid_data.fuel_name", fuelName, "=");
    	controller.abGbDefFpOxid_formVersions.show(false);
    	controller.abGbDefFpOxid_formOxidFact.refresh(restriction, false);
    }
}
