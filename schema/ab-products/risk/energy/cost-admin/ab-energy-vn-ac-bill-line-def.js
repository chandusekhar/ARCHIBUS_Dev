var ctrlAbEnergyDefBills = View.createController('ctrlAbEnergyDefBills',{
	// tree selected node
	crtTreeNode: null,
	
	// tree panel
	objTree: null,
	
	nullValueCode: 'WW99',
	//vn code was changed
	vnCodeChanged: false,
	
	//old parent of crt edit node
	oldParentNode: null,
	
	//crt parent node 
	crtParentNode: null,
	
	defaultVendorType: "Energ",
	
	restriction: {
		console: null,
		tree: null,
		vendorType: "Energ"
	},
	
	afterViewLoad: function(){
		//this.tree_vn_AbEnergyDefBills.addParameter('lastNode', this.nullValueCode);
		this.tabs_AbEnergyDefBills.addEventListener('beforeTabChange', beforeTabChangeEvt);
	},
	
    afterInitialDataFetch: function(){
        this.objTree = View.panels.get('tree_vn_AbEnergyDefBills');
        
        this.filterConsole_onShow();
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
			case 'VENDOR':
				parentLevelIndex = -1;
				break;
			case 'VENDOR ACCOUNT':
				parentLevelIndex = 0;
				break;
			case 'BILL':
				parentLevelIndex = 1;
				break;
			case 'BILL LINE':
				parentLevelIndex = 2;
				break;
			default:
				parentLevelIndex = -1;
				break;
		}
		if(parentLevelIndex == -1){
			return rootNode;
		}else{
			var crtNode = this.crtTreeNode;
			if(crtNode != null){
				var crtLevelIndex = crtNode.level.levelIndex;
				for(;crtLevelIndex > parentLevelIndex;){
					crtNode = crtNode.parent;
					crtLevelIndex = crtNode.level.levelIndex;
				}
				return crtNode;
			}else{
				return rootNode;
			}
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
                case "VENDOR":
                    var pkFieldName = "vn.vn_id";
                    break;
                case "VENDOR ACCOUNT":
                    var pkFieldName = "vn_ac.vn_ac_id";
                    break;
                case "BILL":
                    var pkFieldName = "bill.bill_id";
                    break;
                case "BILL LINE":
                    var pkFieldName = "bill_line.bill_line_id";
                    break;
            }
            this.crtTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },	
    
    expandTreeNodeForRestriction: function(operDataType, userRestriction, parentNode){
    	var treeObj = this.objTree;
    	
    	if(parentNode == undefined || parentNode == null){
    		parentNode = treeObj.treeView.getRoot();
    	}
    	
        for (var i = 0; i < parentNode.children.length; i++) {
            var node = parentNode.children[i];
            if(this.getTreeNodeByEditPanel(operDataType, userRestriction, node) == node){
            	node.expand();
            	this.expandTreeNodeForRestriction.defer(200, this, [operDataType, userRestriction, node]);
            	break;
            }
        }
    },
    
    getTreeNodeByEditPanel: function(operDataType, userRestriction, node){
    	var returnNode = null;
    	
    	switch (node.level.levelIndex) {
		case 0:
			if (node.data["vn.vn_id.key"] == this.getFieldValueFromUserRestriction(operDataType, userRestriction, "vn_id")) {
	            returnNode = node;
	        }
			break;
		
		case 1:
			if (node.data["vn_ac.vn_id.key"] == this.getFieldValueFromUserRestriction(operDataType, userRestriction, "vn_id")
					&& node.data["vn_ac.vn_ac_id.key"] == this.getFieldValueFromUserRestriction(operDataType, userRestriction, "vn_ac_id")) {
	            returnNode = node;
	        }
			break;

		default:
			break;
		}

    	return returnNode;
    },
    
    getFieldValueFromUserRestriction: function(operDataType, userRestriction, fieldName){
    	var fieldValue = "";
    	switch (operDataType) {
	        case "VENDOR":
	        	fieldValue = userRestriction["vn." + fieldName];
	            break;
	        case "VENDOR ACCOUNT":
	        	fieldValue = userRestriction["vn_ac." + fieldName]
	            break;
	        case "BILL":
	        	fieldValue = userRestriction["bill." + fieldName];
	            break;
	        case "BILL LINE":
	        	if(fieldName == "vn_ac_id"){
	        		fieldValue = userRestriction["bill." + fieldName];
	        	} else {
	        		fieldValue = userRestriction["bill_line." + fieldName];
	        	}
	            break;
            default:
            	break;
	    }
    	
    	return fieldValue;
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
	filterConsole_onShow: function(){
		this.setConsoleRestriction();
		this.refreshTree();
		this.refreshTabs();
	},
	
	filterConsole_onClear: function(){
		this.filterConsole.clear();
		this.restriction.console = null;
		this.restriction.tree = null;
		this.restriction.vendorType = this.defaultVendorType;
		
		this.filterConsole_onShow();
	},	
	
	setConsoleRestriction: function(){
		var console = this.filterConsole;
		var restriction = new Ab.view.Restriction();
		
		var vn_id = console.getFieldValue('bill.vn_id');
		if(valueExistsNotEmpty(vn_id)){
			restriction.addClause("vn.vn_id", vn_id, "=", "AND", false);
		}
		
		var vn_ac_id = console.getFieldValue('bill.vn_ac_id');
		if(valueExistsNotEmpty(vn_ac_id)){
			restriction.addClause("vn_ac.vn_ac_id", vn_ac_id, "=", "AND", false);
		}
		
		var bill_id = console.getFieldValue('bill.bill_id');
		if(valueExistsNotEmpty(bill_id)){
			restriction.addClause("bill.bill_id", bill_id, "=", "AND", false);
		}
		
		if(!restriction.isEmpty()){
			this.restriction.console = restriction;
		} else {
			this.restriction.console = null;
		}
	},
	
	/*
	 * refresh tree control applying 
	 * user restriction
	 */
	refreshTree: function(){
		var console = this.filterConsole;
		var vn_id = console.getFieldValue('bill.vn_id');
		if(vn_id){
			this.objTree.addParameter("vendor_id", "vn.vn_id = '" + vn_id + "'" );
		}else{
			this.objTree.addParameter("vendor_id", " 1 = 1 " );
		}
		
		var vn_ac_id = console.getFieldValue('bill.vn_ac_id');
		if(vn_ac_id){
			this.objTree.addParameter("vendor_account_id", "vn_ac.vn_ac_id = '" + vn_ac_id + "'" );
			this.objTree.addParameter("vendor_account_id_null", " 1 = 2 " );
		}else{
			this.objTree.addParameter("vendor_account_id", " 1 = 1 " );
			this.objTree.addParameter("vendor_account_id_null", " 1 = 1 " );
		}
		
		var bill_id = console.getFieldValue('bill.bill_id');
		if(bill_id){
			this.objTree.addParameter("bill_id", "bill.bill_id = '" + bill_id + "'" );
			this.objTree.addParameter("bill_id_null", " 1 = 2 " );
		}else{
			this.objTree.addParameter("bill_id", " 1 = 1 " );
			this.objTree.addParameter("bill_id_null", " 1 = 1 " );
		}
		
		if(valueExistsNotEmpty(this.restriction.vendorType)){
			this.objTree.addParameter("vendorType", "vn.vendor_type = '" + this.restriction.vendorType + "'");
		} else {
			this.objTree.addParameter("vendorType", " 1 = 1 ");
		}
		
		this.objTree.refresh();
		this.crtTreeNode = null;
	},
	
	refreshTabs: function(){
		// set restriction to the tabs
		var tabsPanel = this.tabs_AbEnergyDefBills;
		for ( var i = 0; i < tabsPanel.tabs.length; i++) {
			var tab = tabsPanel.tabs[i];
			
			// set the vendor type parameter to tab's grid
			this.setVendorTypeParameter(tab);

			var restriction = this.getRestrictionForTab(tab, this.restriction.console);
			
			// set restriction to the tab
			tabsPanel.setTabRestriction(tab.name, restriction);
			
			// hide the form of the tab and refresh the current tab's grid
			hideForm(tab);
			
			// refresh the current tab
			if(tab.name == tabsPanel.selectedTabName){
				tabsPanel.selectTab(tab.name);
			}
		}
	},
	
	getRestrictionForTab: function(tab, srcRestriction){
		var restriction = new Ab.view.Restriction();
		
		if(srcRestriction){
			restriction.addClauses(srcRestriction);
			//remove clauses depending on the tab
			switch (tab.name) {
			case "tab_vn_AbEnergyDefBills":
				restriction.removeClause("vn_ac.vn_ac_id");
				restriction.removeClause("bill.bill_id");
				break;

			case "tab_vn_ac_AbEnergyDefBills":
				restriction.removeClause("bill.bill_id");
				break;


			case "tab_bill_AbEnergyDefBills":
				var vnClause = restriction.findClause("vn.vn_id");
				if(vnClause){
					vnClause.name = vnClause.name.replace("vn.", "bill.");
				} else {
					vnClause = restriction.findClause("vn_ac.vn_id");
					if(vnClause){
						vnClause.name = vnClause.name.replace("vn_ac.", "bill.");
					}
				}
				var vnAcClause = restriction.findClause("vn_ac.vn_ac_id");
				if(vnAcClause){
					vnAcClause.name = vnAcClause.name.replace("vn_ac.", "bill.");
				}
				break;

			case "tab_bill_line_AbEnergyDefBills":
				var vnAcClause = restriction.findClause("vn_ac.vn_ac_id");
				if(vnAcClause){
					vnAcClause.name = vnAcClause.name.replace("vn_ac.", "bill.");
				}
				break;

			default:
				break;
			}
		}
		
		return restriction;
	},
	/**
	 * Sets vendorType parameter to the grids in Vendor Account, Bill and Bill Line tabs
	 */
	setVendorTypeParameter: function(tab){
		var paramValue = "1 = 1";
		var tabController = null;

		if(!tab.getContentFrame().View){
			return;
		}

		tabController = tab.getContentFrame().View.controllers.get("ctrlAbEnergyDefBillsCommon");
		if(!tabController){
			return;
		}
		
		switch (tab.name) {
		case "tab_vn_ac_AbEnergyDefBills":
			if(valueExistsNotEmpty(this.restriction.vendorType)){
				//paramValue = "(SELECT vn.vendor_type FROM vn WHERE vn.vn_id = vn_ac.vn_id) = '"	+ this.restriction.vendorType + "'";
				tabController.vn_ac_AbEnergyDefBills_grid.setFilterValue("vn.vendor_type", this.restriction.vendorType);
			}
			
			break;

		case "tab_bill_AbEnergyDefBills":
			if(valueExistsNotEmpty(this.restriction.vendorType)){
				paramValue = "(SELECT vn.vendor_type FROM vn WHERE vn.vn_id = bill.vn_id) = '" + this.restriction.vendorType + "'";
			}
			tabController.bill_AbEnergyDefBills_grid.addParameter("vendorType", paramValue);
			break;

		case "tab_bill_line_AbEnergyDefBills":
			if(valueExistsNotEmpty(this.restriction.vendorType)){
				paramValue = "(SELECT vn.vendor_type FROM vn WHERE vn.vn_id = bill.vn_id) = '" + this.restriction.vendorType + "'";
			}
			tabController.bill_line_AbEnergyDefBills_grid.addParameter("vendorType", paramValue);
			break;

		case "tab_vn_AbEnergyDefBills":
			// Vendors tab's restriction on vendor type is handled by user through the grid's filter miniconsole
		default:
			break;
		}
	}
})

function hideForm(tab){
	if(tab.getContentFrame().View){
		var tabPanels = tab.getContentFrame().View.panels.items;
		for ( var j = 0; j < tabPanels.length; j++) {
			var panel = tabPanels[j];
			if(panel.type == "form"){
				panel.show(false);
			}
		}
	}
}

function onClickTreeNode(){
	var objTree = View.panels.get('tree_vn_AbEnergyDefBills');
	var crtNode = objTree.lastNodeClicked;
	var levelIndex = crtNode.level.levelIndex;
	var objTabs = View.panels.get('tabs_AbEnergyDefBills');
	var controller = View.controllers.get('ctrlAbEnergyDefBills');

	if(levelIndex == 0){
		editTab(objTabs, "tab_vn_ac_AbEnergyDefBills", "vn.vn_id", crtNode, controller.nullValueCode);
		setNodeRestrictionToTab(objTabs, objTabs.findTab("tab_vn_AbEnergyDefBills"));
		// set restriction to the next tabs too
		setNodeRestrictionToTab(objTabs, objTabs.findTab("tab_bill_AbEnergyDefBills"));
		setNodeRestrictionToTab(objTabs, objTabs.findTab("tab_bill_line_AbEnergyDefBills"));
	}
	if(levelIndex == 1){
		editTab(objTabs, "tab_bill_AbEnergyDefBills", "vn_ac.vn_ac_id", crtNode, controller.nullValueCode);
		setNodeRestrictionToTab(objTabs, objTabs.findTab("tab_vn_ac_AbEnergyDefBills"));
		// set restriction to the next tabs too
		setNodeRestrictionToTab(objTabs, objTabs.findTab("tab_bill_line_AbEnergyDefBills"));
	}
	if(levelIndex == 2){
		editTab(objTabs, "tab_bill_line_AbEnergyDefBills", "bill.bill_id", crtNode, controller.nullValueCode);
		setNodeRestrictionToTab(objTabs, objTabs.findTab("tab_bill_AbEnergyDefBills"));
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
	ctrlAbEnergyDefBills.restriction.tree = restriction;
	hideForm(tabs.findTab(tab));
	var restr = ctrlAbEnergyDefBills.getRestrictionForTab(tabs.findTab(tab), restriction);
	tabs.selectTab(tab, restr, newRecord, false, false);
}

function setNodeRestrictionToTab(tabs, tab){
	var restriction = ctrlAbEnergyDefBills.getRestrictionForTab(tab, ctrlAbEnergyDefBills.restriction.console);
	var treeRestriction = ctrlAbEnergyDefBills.getRestrictionForTab(tab, ctrlAbEnergyDefBills.restriction.tree);
	restriction.addClauses(treeRestriction, false, false);
	tabs.setTabRestriction(tab.name, restriction);
	hideForm(tab);
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
	var controller = View.controllers.get('ctrlAbEnergyDefBills');
	var levelIndex = node.level.levelIndex;
	var msg_id = '';
	if(levelIndex == 0){
		msg_id = 'msg_no_vn_id';
	}else if(levelIndex == 1){
		msg_id = 'msg_no_vn_ac_id';
	}else if(levelIndex == 2){
		msg_id = 'msg_no_bill_id';
	}else if(levelIndex == 3){
		msg_id = 'msg_no_bill_line_id';
	}
	if(label.indexOf(controller.nullValueCode)!= -1){
		var labelText = label.replace(controller.nullValueCode, getMessage(msg_id));
		node.setUpLabel(labelText);
	}
}
/**
 * Before tab change event.
 * @param tabPanel
 * @param currentTabName
 * @param newTabName
 */
function beforeTabChangeEvt(tabPanel, currentTabName, newTabName){
	var tab = null;
	if (newTabName == 'tab_bill_AbEnergyDefBills') {
		tab = tabPanel.findTab(newTabName);
		refreshForm(tab);
	}
	return true;
}

/**
 * Refresh form from tab panel.
 * @param tab tab object
 */
function refreshForm(tab){
	if(tab.getContentFrame().View){
		var tabPanels = tab.getContentFrame().View.panels.items;
		for ( var j = 0; j < tabPanels.length; j++) {
			var panel = tabPanels[j];
			if(panel.type == "form" && panel.visible){
				panel.refresh(panel.restriction);
			}
		}
	}
}

