var ctrlAbDefGeoLoc = View.createController('ctrlAbDefGeoLoc',{
	// tree selected node
	crtTreeNode: null,
	
	// tree panel
	objTree: null,
	
    // operation type: INSERT/UPDATE/DELETE
    operType: "",
    
    //Operaton Data Type //'CTRY','REGN','STATE','CITY','SITE'
    operDataType: "",
	
	nullValueCode: 'WW99',
	//ctry code was changed
	ctryCodeChanged: false,
	
	//old parent of crt edit node
	oldParentNode: null,
	
	//crt parent node 
	crtParentNode: null,
	
	afterViewLoad: function(){
		//this.tree_ctry_AbDefGeoLoc.addParameter('lastNode', this.nullValueCode);
	},
	
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.objTree = View.panels.get('tree_geo_AbDefGeoLoc');
    },
    /*
     *  create menu for add new button
     * @param {Object} e
     * @param {Object} item
     */
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newGeo = getMessage("msg_add_geo");
        var menutitle_newCtry = getMessage("msg_add_ctry");
        var menutitle_newRegn = getMessage("msg_add_regn");
        var menutitle_newState = getMessage("msg_add_state");
        var menutitle_newCity = getMessage("msg_add_city");
		var menutitle_newSite = getMessage("msg_add_site");
        
		menuItems.push({
            text: menutitle_newGeo,
            handler: this.onAddNewButtonPush.createDelegate(this, ['GEO'])
        });
		menuItems.push({
            text: menutitle_newCtry,
            handler: this.onAddNewButtonPush.createDelegate(this, ['CTRY'])
        });
        menuItems.push({
            text: menutitle_newRegn,
            handler: this.onAddNewButtonPush.createDelegate(this, ['REGN'])
        });
        menuItems.push({
            text: menutitle_newState,
            handler: this.onAddNewButtonPush.createDelegate(this, ['STATE'])
        });
        menuItems.push({
            text: menutitle_newCity,
            handler: this.onAddNewButtonPush.createDelegate(this, ['CITY'])
        });
        menuItems.push({
            text: menutitle_newSite,
            handler: this.onAddNewButtonPush.createDelegate(this, ['SITE'])
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
    onAddNewButtonPush: function(menuItemId){
		this.operDataType = menuItemId;
		var restriction = new Ab.view.Restriction();
		if(this.crtTreeNode != null){
			restriction = getFullRestriction(this.crtTreeNode, restriction);
		}
		restriction = removeNullClauses(restriction, this.nullValueCode);
		switch(menuItemId){
			case "GEO":
				this.tabs_AbDefGeoLoc.selectTab("tab_geo_AbDefGeoLoc", null, true, false, false);
				break;
			case "CTRY":
				this.tabs_AbDefGeoLoc.selectTab("tab_ctry_AbDefGeoLoc", restriction, true, false, false);
				break;
			case "REGN":
				this.tabs_AbDefGeoLoc.selectTab("tab_regn_AbDefGeoLoc", restriction, true, false, false);
				break;
			case "STATE":
				this.tabs_AbDefGeoLoc.selectTab("tab_state_AbDefGeoLoc", restriction, true, false, false);
				break;
			case "CITY":
				this.tabs_AbDefGeoLoc.selectTab("tab_city_AbDefGeoLoc", restriction, true, false, false);
				break;
			case "SITE":
				this.tabs_AbDefGeoLoc.selectTab("tab_site_AbDefGeoLoc", restriction, true, false, false);
				break;
		}
	},
	geo_AbDefGeoLoc_onDelete: function(){
		this.operDataType = 'GEO';
		this.commonDelete('geo_AbDefGeoLoc_ds','geo_AbDefGeoLoc','geo_region.geo_region_id');
		
	},
	ctry_AbDefGeoLoc_onDelete: function(){
		this.operDataType = 'CTRY';
		this.commonDelete('ctry_AbDefGeoLoc_ds','ctry_AbDefGeoLoc','ctry.ctry_id');
		
	},
	regn_AbDefGeoLoc_onDelete: function(){
		this.operDataType = 'REGN';
		this.commonDelete('regn_AbDefGeoLoc_ds','regn_AbDefGeoLoc','regn.regn_id');
		
	},
	state_AbDefGeoLoc_onDelete: function(){
		this.operDataType = 'STATE';
		this.commonDelete('state_AbDefGeoLoc_ds','state_AbDefGeoLoc','state.state_id');
		
	},
	city_AbDefGeoLoc_onDelete: function(){
		this.operDataType = 'CITY';
		this.commonDelete('city_AbDefGeoLoc_ds','city_AbDefGeoLoc','city.city_id');
		
	},
	site_AbDefGeoLoc_onDelete: function(){
		this.operDataType = 'SITE';
		this.commonDelete('site_AbDefGeoLoc_ds','site_AbDefGeoLoc','site.site_id');
		
	},
    /**
     * common delete function for detail tabs
     * parameters associated to selected details panel
     * @param {Object} dataSourceId
     * @param {Object} formPanelId
     * @param {Object} primaryFieldFullName
     */
    commonDelete: function(dataSourceId, formPanelId, primaryFieldFullName){
        this.operType = "DELETE";
        var dataSource = View.dataSources.get(dataSourceId);
        var formPanel = View.panels.get(formPanelId);
        var record = formPanel.getRecord();
        var primaryFieldValue = record.getValue(primaryFieldFullName);
        if (!primaryFieldValue) {
            return;
        }
        var controller = this;
        var confirmMessage = getMessage("messageConfirmDelete").replace('{0}', primaryFieldValue);
        View.confirm(confirmMessage, function(button){
            if (button == 'yes') {
                try {
                    dataSource.deleteRecord(record);
                } 
                catch (e) {
                    var errMessage = getMessage("errorDelete").replace('{0}', primaryFieldValue);
                    View.showMessage('error', errMessage, e.message, e.data);
                    return;
                }
                controller.refreshTreePanelAfterUpdate(formPanel);
                formPanel.show(false);
                
            }
        })
    },
    geo_AbDefGeoLoc_onSave: function(){
		this.operDataType = 'GEO';
		this.commonSave('geo_AbDefGeoLoc_ds','geo_AbDefGeoLoc');
		
	},
	ctry_AbDefGeoLoc_onSave: function(){
		this.operDataType = 'CTRY';
		this.commonSave('ctry_AbDefGeoLoc_ds','ctry_AbDefGeoLoc');
		
	},
	regn_AbDefGeoLoc_onSave: function(){
		this.operDataType = 'REGN';
		this.commonSave('regn_AbDefGeoLoc_ds','regn_AbDefGeoLoc');
		
	},
	state_AbDefGeoLoc_onSave: function(){
		this.operDataType = 'STATE';
		this.commonSave('state_AbDefGeoLoc_ds','state_AbDefGeoLoc');
		
	},
	city_AbDefGeoLoc_onSave: function(){
		this.operDataType = 'CITY';
		this.commonSave('city_AbDefGeoLoc_ds','city_AbDefGeoLoc');
		
	},
	site_AbDefGeoLoc_onSave: function(){
		this.operDataType = 'SITE';
		this.commonSave('site_AbDefGeoLoc_ds','site_AbDefGeoLoc');
		
	},
	commonSave: function(dataSource, panel){
		var formPanel = View.panels.get(panel);
        if (!formPanel.newRecord) {
            this.operType = "UPDATE";
        }
        else {
            this.operType = "INSERT";
        }

        if (formPanel.save()) {
            //refresh tree panel and edit panel
            this.onRefreshPanelsAfterSave(formPanel);
            //get message from view file			 
            var message = getMessage('formSaved');
            //show text message in the form				
            formPanel.displayTemporaryMessage(message);
        }
	},

	/**
     * refresh tree panel and edit panel after save
     * @param {Object} curEditPanel
     */
    onRefreshPanelsAfterSave: function(curEditPanel){
        //refresh the tree panel
        this.refreshTreePanelAfterUpdate(curEditPanel);
		if(this.crtTreeNode == null){
			this.refreshTree();
		} 
        //refresh the edit form panel
        var restriction = curEditPanel.getRecord().toRestriction();
        if (curEditPanel.newRecord) {
            restriction.removeClause("isNew");
            curEditPanel.newRecord = false;
            curEditPanel.record.values["isNew"] = false;
            curEditPanel.record.oldValues["isNew"] = false;
        }
        curEditPanel.refresh(restriction);
    },
    /**
     * refresh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
		var	parentNode = this.getParentNode(curEditPanel);
		
        if (parentNode.isRoot()) {
            this.refreshTree();
        }
        else {
            this.objTree.refreshNode(parentNode);
			var crtParent = parentNode;
			for(;!crtParent.parent.isRoot();){
				crtParent.parent.expand();
				crtParent = crtParent.parent;
			}
            parentNode.expand();
        }
        //reset the global variable :curTreeNode
        this.setCurTreeNodeAfterUpdate(curEditPanel, parentNode);
    },
    /**
     * prepare the parentNode parameter for calling refreshNode function
     * parent node for crt edit form
     */
    getParentNode: function(curEditFormPanel){
        var rootNode = this.objTree.treeView.getRoot();
        var levelIndex = -1;
        if (this.crtTreeNode) {
            levelIndex = this.crtTreeNode.level.levelIndex;
        }
		var parentLevelIndex = -2;
		switch(this.operDataType){
			case 'GEO':
				parentLevelIndex = -1;
				break;
			case 'CTRY':
				parentLevelIndex = 0;
				break;
			case 'REGN':
				parentLevelIndex = 1;
				break;
			case 'STATE':
				parentLevelIndex = 2;
				break;
			case 'CITY':
				parentLevelIndex = 3;
				break;
			case 'SITE':
				parentLevelIndex = 4;
				break;
			default:
				parentLevelIndex = -1;
				break;
		}
		if(parentLevelIndex == -1){
			return rootNode;
		}else{
			var crtNode = this.crtTreeNode;
			var crtLevelIndex = crtNode.level.levelIndex;
			for(;crtLevelIndex > parentLevelIndex;){
				crtNode = crtNode.parent;
				crtLevelIndex = crtNode.level.levelIndex;
			}
			return crtNode;
		}
    },
    /**
     * reset the curTreeNode variable after operation
     * @param {Object} curEditPanel : current edit form
     * @param {Object} parentNode
     */
    setCurTreeNodeAfterUpdate: function(curEditPanel, parentNode){
        if (this.operType == "DELETE") {
            this.crtTreeNode = null;
        }
        else {
            switch (this.operDataType) {
	            case "GEO":
	                var pkFieldName = "geo_region.geo_region_id";
	                break;
                case "CTRY":
                    var pkFieldName = "ctry.ctry_id";
                    break;
                case "REGN":
                    var pkFieldName = "regn.regn_id";
                    break;
                case "STATE":
                    var pkFieldName = "state.state_id";
                    break;
                case "CITY":
                    var pkFieldName = "city.city_id";
                    break;
                case "SITE":
                    var pkFieldName = "site.site_id";
                    break;
            }
            this.crtTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },	
    /**
     * get the treeNode according to the current edit from
     * @param {Object} curEditForm
     * @param {Object} parentNode
     */
    getTreeNodeByCurEditData: function(curEditForm, pkFieldName, parentNode){
        var pkFieldValue = curEditForm.getFieldValue(pkFieldName);
        for (var i = 0; i < parentNode.children.length; i++) {
            var node = parentNode.children[i];
            if (node.data[pkFieldName] == pkFieldValue) {
                return node;
            }
        }
        return null;
    },
	/*
	 * refresh view based on console restriction
	 */
	console_AbDefGeoLoc_onShow: function(){
		this.refreshTree();
		this.geo_AbDefGeoLoc.show(false);
		this.ctry_AbDefGeoLoc.show(false);
		this.regn_AbDefGeoLoc.show(false);
		this.state_AbDefGeoLoc.show(false);
		this.city_AbDefGeoLoc.show(false);
		this.site_AbDefGeoLoc.show(false);
	},
	/*
	 * refresh tree control applying 
	 * user restriction
	 */
	refreshTree: function(){
		var console = this.console_AbDefGeoLoc;
		var geo_region_id = console.getFieldValue('ctry.geo_region_id');
		if(geo_region_id){
			this.objTree.addParameter("geographic_region_id", "geo_region.geo_region_id = '" + convert2SafeSqlString(geo_region_id) + "'" );
		}else{
			this.objTree.addParameter("geographic_region_id", " 1 = 1 " );
		}
		
		var ctry_id = console.getFieldValue('site.ctry_id');
		if(ctry_id){
			this.objTree.addParameter("country_id", "ctry.ctry_id = '" + convert2SafeSqlString(ctry_id) + "'" );
			this.objTree.addParameter("country_id_null", " 1 = 2 " );
		}else{
			this.objTree.addParameter("country_id", " 1 = 1 " );
			this.objTree.addParameter("country_id_null", " 1 = 1 " );
		}
		
		var regn_id = console.getFieldValue('site.regn_id');
		if(regn_id){
			this.objTree.addParameter("region_id", "regn.regn_id = '" + convert2SafeSqlString(regn_id) + "'" );
			this.objTree.addParameter("region_id_null", " 1 = 2 " );
		}else{
			this.objTree.addParameter("region_id", " 1 = 1 " );
			this.objTree.addParameter("region_id_null", " 1 = 1 " );
		}
		
		var state_id = console.getFieldValue('site.state_id');
		if(state_id){
			this.objTree.addParameter("state_id", "state.state_id = '" + convert2SafeSqlString(state_id) + "'" );
			this.objTree.addParameter("state_id_null", " 1 = 2 " );
		}else{
			this.objTree.addParameter("state_id", " 1 = 1 " );
			this.objTree.addParameter("state_id_null", " 1 = 1 " );
		}
		
		var city_id = console.getFieldValue('site.city_id');
		if(city_id){
			this.objTree.addParameter("city_id", "city.city_id = '" + convert2SafeSqlString(city_id) + "'" );
			this.objTree.addParameter("city_id_null", " 1 = 2 " );
		}else{
			this.objTree.addParameter("city_id", " 1 = 1 " );
			this.objTree.addParameter("city_id_null", " 1 = 1 " );
		}

		var site_id = console.getFieldValue('site.site_id');
		if(site_id){
			this.objTree.addParameter("site_id", "site.site_id = '" + convert2SafeSqlString(site_id) + "'" );
			this.objTree.addParameter("site_id_null", " 1 = 2 " );
		}else{
			this.objTree.addParameter("site_id", " 1 = 1 " );
			this.objTree.addParameter("site_id_null", " 1 = 1 " );
		}
		this.objTree.refresh();
		this.crtTreeNode = null;
	}
})

function onClickTreeNode(){
	var objTree = View.panels.get('tree_geo_AbDefGeoLoc');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var objTabs = View.panels.get('tabs_AbDefGeoLoc');
	var controller = View.controllers.get('ctrlAbDefGeoLoc');
	if(levelIndex == 0){
		editTab(objTabs, "tab_geo_AbDefGeoLoc", "geo_region.geo_region_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 1){
		editTab(objTabs, "tab_ctry_AbDefGeoLoc", "ctry.ctry_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 2){
		editTab(objTabs, "tab_regn_AbDefGeoLoc", "regn.regn_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 3){
		editTab(objTabs, "tab_state_AbDefGeoLoc", "state.state_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 4){
		editTab(objTabs, "tab_city_AbDefGeoLoc", "city.city_id", crtNode, controller.nullValueCode);
	}
	if(levelIndex == 5){
		editTab(objTabs, "tab_site_AbDefGeoLoc", "site.site_id", crtNode, controller.nullValueCode);
	}
	controller.crtTreeNode = crtNode;
}

function editTab(tabs, tab, field, crtNode, nullValue){
	var restriction = new Ab.view.Restriction();
	var newRecord = false;
	restriction.addClauses(crtNode.restriction);
	var clause = restriction.findClause(field);
	if(clause.value == nullValue){
		newRecord = true;
	}
	restriction = removeNullClauses(restriction, nullValue);
	tabs.selectTab(tab, restriction, newRecord, false, false);
}

/*
 * remove null clauses from restriction object
 * nullValue = controller.nullValueCode
 */
function removeNullClauses(restriction, nullValue){
	var result = new Ab.view.Restriction();
	for( var i = 0; i< restriction.clauses.length; i++){
		var clause = restriction.clauses[i];
		if(clause.value != nullValue){
			result.addClause(clause.name, clause.value, clause.op, clause.relOp, false);
		}
	}
	return result;
}
/*
 * get full restriction for selected node
 * untill root 
 */
function getFullRestriction(node, restriction){
	var index = node.index;
	for(;index > 0;){
		restriction.addClauses(node.restriction, true);
		node = node.parent;
		index = node.index;
	}
	return restriction;
}

function afterGeneratingTreeNode(node){
	var label = node.label;
	var controller = View.controllers.get('ctrlAbDefGeoLoc');
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if(levelIndex == 0){
		msg_id = 'msg_no_geo_id';
	}else if(levelIndex == 1){
		msg_id = 'msg_no_ctry_id';
	}else if(levelIndex == 2){
		msg_id = 'msg_no_regn_id';
	}else if(levelIndex == 3){
		msg_id = 'msg_no_state_id';
	}else if(levelIndex == 4){
		msg_id = 'msg_no_city_id';
	}
	if(label.indexOf(controller.nullValueCode)!= -1){
		var labelText = label.replace(controller.nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}

