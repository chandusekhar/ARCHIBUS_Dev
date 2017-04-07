var abGbDefFpHeatController = View.createController('abGbDefFpHeatCtrl', {
	
	afterInitialDataFetch: function(){
	    var titleObj = Ext.get('addNew');
	    titleObj.on('click', this.showMenu, this, null);
	    
	    var units_type = this.abGbDefFpHeat_dsHeatCont.fieldDefs.get("gb_fp_heat_data.units_type").defaultValue;
	    customizeUnitField(this.abGbDefFpHeat_formHeatCont, "gb_fp_heat_data.units", units_type);
		/*
		 * KB 3030540 Set field min /max limits
		 */
		this.abGbDefFpHeat_formHeatCont.setMaxValue('gb_fp_heat_data.conv_factor', 1.0);
		this.abGbDefFpHeat_formHeatCont.setMinValue('gb_fp_heat_data.conv_factor', 0.1);
	},
	
	/**
	 * Create menu for Add New button
	 * @param {Object} e
	 * @param {Object} item
	 */
	showMenu: function(e, item){
	    var menuItems = [];
	    var menutitle_newHeatContVersion = getMessage("heatContVersion");
	    var menutitle_newHeatContData = getMessage("heatContData");
	    
	    menuItems.push({
	        text: menutitle_newHeatContVersion,
	        handler: this.onAddNewButton.createDelegate(this, ['heatContVersion'])
	    });
	    menuItems.push({
	        text: menutitle_newHeatContData,
	        handler: this.onAddNewButton.createDelegate(this, ['heatContData'])
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
        var crtTreeNode = this.abGbDefFpHeat_treeVersions.lastNodeClicked;

        if (crtTreeNode) {
            nodeLevelIndex = crtTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_versions.version_name.key"];
                    break;
                case 1:
                    versionType = crtTreeNode.data["gb_fp_heat_data.version_type.key"];
                    versionName = crtTreeNode.data["gb_fp_heat_data.version_name.key"];
                	fuelBaseCode = crtTreeNode.data["gb_fp_heat_data.fuel_base_code.key"];
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
            case "heatContVersion":
                this.abGbDefFpHeat_formHeatCont.show(false);
                this.abGbDefFpHeat_formVersions.refresh(null, true);
                break;
            case "heatContData":
                if (nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectVersion"));
                    return;
                }
            	restriction.addClause("gb_fp_heat_data.version_type", versionType, "=");
            	restriction.addClause("gb_fp_heat_data.version_name", versionName, "=");
            	restriction.addClause("gb_fp_heat_data.fuel_base_code", fuelBaseCode, "=");
                this.abGbDefFpHeat_formVersions.show(false);
                this.abGbDefFpHeat_formHeatCont.refresh(restriction, true);
                break;
        }
    },

    /**
     * Refreshes the tree at the parent level of the changed form
     * Sets controller's selected tree node
     * @param editForm The edit form panel object
     */
    refreshTree: function(editForm){
    	this.abGbDefFpHeat_treeVersions.lastNodeClicked = null;
    	switch (editForm.id) {
			case "abGbDefFpHeat_formHeatCont":
				var versionName = editForm.getFieldValue("gb_fp_heat_data.version_name");
				var fuelBaseCode = editForm.getFieldValue("gb_fp_heat_data.fuel_base_code");
				var fuelName = editForm.getFieldValue("gb_fp_heat_data.fuel_name");
				var rootNode = this.abGbDefFpHeat_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to refresh it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpHeat_treeVersions.refreshNode(node);
		            	this.abGbDefFpHeat_treeVersions.lastNodeClicked = node;

						/* Search the node for the fuel base code of the form (tree's level 1), to expand it */
				        for (var j = 0; j < node.children.length; j++) {
				            var fuelTypeNode = node.children[j];
				            if (fuelTypeNode.data["gb_fp_heat_data.fuel_base_code.key"] == fuelBaseCode) {
				            	this.abGbDefFpHeat_treeVersions.expandNode(fuelTypeNode);
				            	this.abGbDefFpHeat_treeVersions.lastNodeClicked = fuelTypeNode;

								/* Search the node for the fuel name of the form (tree's level 2), to select it in the controller */
						        for (var k = 0; k < fuelTypeNode.children.length; k++) {
						            var fuelDataNode = fuelTypeNode.children[k];
						            if (fuelDataNode.data["gb_fp_heat_data.fuel_name.key"] == fuelName) {
						            	this.abGbDefFpHeat_treeVersions.lastNodeClicked = fuelDataNode;
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
				
			case "abGbDefFpHeat_formVersions":
				this.abGbDefFpHeat_treeVersions.refresh();

				var versionName = editForm.getFieldValue("gb_fp_versions.version_name");
				var rootNode = this.abGbDefFpHeat_treeVersions.treeView.getRoot();
				
				/* Search the node for the version name of the form (tree's level 0), to select it */
		        for (var i = 0; i < rootNode.children.length; i++) {
		            var node = rootNode.children[i];
		            if (node.data["gb_fp_versions.version_name.key"] == versionName) {
		            	this.abGbDefFpHeat_treeVersions.refreshNode(node);
		            	this.abGbDefFpHeat_treeVersions.lastNodeClicked = node;
		            	break;
		            }
		        }
				break;

			default:
				this.abGbDefFpHeat_treeVersions.refresh();
				break;
		}
    },
    
    abGbDefFpHeat_formHeatCont_onSave: function(){
		this.abGbDefFpHeat_formHeatCont.fields.get("gb_fp_heat_data.content").clear();
		this.abGbDefFpHeat_formHeatCont.setFieldValue("gb_fp_heat_data.conv_gcv", "0");

		if(this.abGbDefFpHeat_formHeatCont.canSave()){
			// convert the user entered heat content
			if(!convertUserEntry(this.abGbDefFpHeat_formHeatCont,
	    			"gb_fp_heat_data.content_entry", "gb_fp_heat_data.content",
	    			"gb_fp_heat_data.units", "gb_fp_heat_data.units_type"))
				return;
			// calculate conv_gcv field
			var ds = this.abGbDefFpHeat_formHeatCont.getDataSource();
			var content = this.abGbDefFpHeat_formHeatCont.getFieldValue("gb_fp_heat_data.content");
			var conv_factor = this.abGbDefFpHeat_formHeatCont.getFieldValue("gb_fp_heat_data.conv_factor");
			var convGcvId = "gb_fp_heat_data.conv_gcv";
			if(valueExistsNotEmpty(content) && valueExistsNotEmpty(conv_factor)
					&& !isNaN(content) && !isNaN(conv_factor)){
				var conv_gcv = new Number(content / conv_factor).toFixed(ds.fieldDefs.get(convGcvId).decimals);
				var formatedConv_gcv = ds.formatValue(convGcvId, conv_gcv.toString(), true);
				this.abGbDefFpHeat_formHeatCont.setFieldValue(convGcvId, formatedConv_gcv);
			}
			
			 
			this.abGbDefFpHeat_formHeatCont.save();
			this.refreshTree(this.abGbDefFpHeat_formHeatCont);
		}
	},

	abGbDefFpHeat_formHeatCont_onDelete: function(){
	    var controller = this;
		var dataSource = this.abGbDefFpHeat_dsHeatCont;
		var record = this.abGbDefFpHeat_formHeatCont.getRecord();
	    var fuelName = record.getValue("gb_fp_heat_data.fuel_name");
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
	            controller.abGbDefFpHeat_formHeatCont.show(false);
	            controller.refreshTree(controller.abGbDefFpHeat_formHeatCont);
	        }
	    })
    }
})

/**
 * Shows details for selected node
 */
function onClickTreeNode(){
    var controller = View.controllers.get("abGbDefFpHeatCtrl");
    var crtTreeNode = controller.abGbDefFpHeat_treeVersions.lastNodeClicked;
    var levelIndex = crtTreeNode.level.levelIndex;
    var restriction = new Ab.view.Restriction();

    // Heat versions
    if (levelIndex == 0) {
    	var versionType = crtTreeNode.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.data["gb_fp_versions.version_name.key"]
    	restriction.addClause("gb_fp_heat_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_heat_data.version_name", versionName, "=");
    	controller.abGbDefFpHeat_formHeatCont.show(false);
    	controller.abGbDefFpHeat_formVersions.refresh(restriction, false);
    }

    // Data
    if (levelIndex == 2) {
    	var versionType = crtTreeNode.parent.parent.data["gb_fp_versions.version_type.key"];
    	var versionName = crtTreeNode.parent.parent.data["gb_fp_versions.version_name.key"]
    	var fuelBaseCode = crtTreeNode.data["gb_fp_fuels.fuel_base_code.key"];
    	var fuelMode = crtTreeNode.data["gb_fp_fuels.fuel_mode.key"]
    	var fuelName = crtTreeNode.data["gb_fp_fuels.fuel_name.key"];
    	restriction.addClause("gb_fp_heat_data.version_type", versionType, "=");
    	restriction.addClause("gb_fp_heat_data.version_name", versionName, "=");
    	restriction.addClause("gb_fp_heat_data.fuel_base_code", fuelBaseCode, "=");
    	restriction.addClause("gb_fp_heat_data.fuel_mode", fuelMode, "=");
    	restriction.addClause("gb_fp_heat_data.fuel_name", fuelName, "=");
    	controller.abGbDefFpHeat_formVersions.show(false);
    	controller.abGbDefFpHeat_formHeatCont.refresh(restriction, false);
    }
}

function calculateAndSetConvGcv(){
	var form = View.controllers.get("abGbDefFpHeatCtrl").abGbDefFpHeat_formHeatCont;
	var ds = form.getDataSource();
	var content_entry = form.getFieldValue("gb_fp_heat_data.content_entry");
	var conv_factor = form.getFieldValue("gb_fp_heat_data.conv_factor");
	var convGcvId = "gb_fp_heat_data.vf_conv_gcv";
	
	if(valueExistsNotEmpty(content_entry) && valueExistsNotEmpty(conv_factor)
			&& !isNaN(content_entry) && !isNaN(conv_factor)){

		var conv_gcv = new Number(content_entry / conv_factor).toFixed(form.fields.get("gb_fp_heat_data.vf_conv_gcv").fieldDef.decimals);
		var formatedConv_gcv = ds.formatValue("gb_fp_heat_data.conv_gcv", conv_gcv.toString(), true);
		form.setFieldValue(convGcvId, formatedConv_gcv);
	}
}

