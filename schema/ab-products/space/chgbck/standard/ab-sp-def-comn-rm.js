/**
 * @author zhang.yi
 */
var defineLocRMController = View.createController('defineCommonRm', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    afterInitialDataFetch: function(){
    
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        
        this.treeview = View.panels.get('cat_tree');
        this.cat_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
	
	rm_detail_afterRefresh: function(){
		var blId = this.rm_detail.getFieldValue('rm.bl_id');
		var isEnable = true;
		if(blId){
			isEnable  = false;
		}
		
		this.rm_detail.enableField("rm.bl_id", isEnable);
		this.rm_detail.enableField("rm.fl_id", isEnable);
		this.rm_detail.enableField("rm.rm_id", isEnable);
    },
	
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newRoom = getMessage("rooms");
        menuItems.push({
            text: menutitle_newRoom,
            handler: this.onAddNewButtonPush.createDelegate(this, ['ROOM'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
    },
    
    consolePanel_onShow: function(){
        this.refreshTreeview();
        this.rm_detail.show(false);
    },
    
    onAddNewButtonPush: function(menuItemId){
        var catId = "";
        var typeId = "";
        var nodeLevelIndex = -1;
        this.curTreeNode = this.treeview.lastNodeClicked;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    catId = this.curTreeNode.data["rmcat.rm_cat"];
                    break;
                case 1:
                    catId = this.curTreeNode.parent.data["rmcat.rm_cat"];
                    typeId = this.curTreeNode.data["rmtype.rm_type"];
                    break;
                case 2:
                    catId = this.curTreeNode.data["rm.rm_cat"];
                    typeId = this.curTreeNode.data["rm.rm_type"];
                    break;
            }
        }
        
        if (nodeLevelIndex < 1) {
            View.showMessage(getMessage("errorSelectType"));
            return;
        }
        
        var restriction = new Ab.view.Restriction();
        if (typeId) {
            restriction.addClause("rm.rm_type", typeId, '=');
        }
        restriction.addClause("rm.rm_cat", catId, '=');
        this.rm_detail.refresh(restriction, true, false, false);
    },
    
    rm_detail_onSave: function(){
        this.commonSave("ds_ab-sp-def-comn-rm_form_rm", "rm_detail");
    },
    
    commonSave: function(dataSourceID, formPanelID){
        var formPanel = View.panels.get(formPanelID);
        if (formPanel.save()) {
			//refresh the tree panel
        	this.refreshTreePanelAfterUpdate();
			//get message from view file			 
			var message = getMessage('formSaved');
			//show text message in the form				
			formPanel.displayTemporaryMessage(message);
		}
    },
    
    rm_detail_onDelete: function(){
        this.commonDelete("ds_ab-sp-def-comn-rm_form_rm", "rm_detail", "rm.rm_id");
    },
    
    commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
        var dataSource = View.dataSources.get(dataSourceID);
        var formPanel = View.panels.get(formPanelID);
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
                controller.refreshTreePanelAfterUpdate();
                formPanel.show(false);
                
            }
        })
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(){
        var parentNode = this.getParentNode();
        this.treeview.refreshNode(parentNode);
        if (parentNode.parent) {
            parentNode.parent.expand();
        }
        parentNode.expand();
        
    },
    
    /**
     * prepare the parentNode parameter for calling refreshNode function
     */
    getParentNode: function(){
        var levelIndex = -1;
        this.curTreeNode = this.treeview.lastNodeClicked;
        if (this.curTreeNode) {
            levelIndex = this.curTreeNode.level.levelIndex;
        }
        switch (levelIndex) {
            case 1:
                return this.curTreeNode;
                break;
            case 2:
                if (this.curTreeNode.parent) {
                    this.curTreeNode.myParent = this.curTreeNode.parent;
                    return this.curTreeNode.parent;
                }
                else {
                    return this.curTreeNode.myParent;
                }
                break;
            default:
                View.showMessage(getMessage("closeRmDetailPanel"));
                break;
        }
    },
    
    refreshTreeview: function(){
        var consolePanel = this.consolePanel;
        
        var rmcat = consolePanel.getFieldValue('rm.rm_cat');
        if (rmcat) {
            this.cat_tree.addParameter('rmcat', " ='" + rmcat + "'");
        }
        else {
            this.cat_tree.addParameter('rmcat', "IS NOT NULL");
        }
        
        this.cat_tree.refresh();
        this.curTreeNode = null;
    }
})

function closeRmDetailForm(){
    //not showing rm_detail panel
    View.panels.get("rm_detail").show(false);
}

function afterGeneratingTreeNode(treeNode){
    var labelText1 = "";
    if (treeNode.level.levelIndex == 1) {
        var desc = treeNode.data['rmtype.description'];
        var rmType = treeNode.data['rmtype.rm_type'];
        if (desc.length > 40) {
            desc = desc.substr(0, 40) + " ...";
        }
        
        if (!rmType) {
            rmType = getMessage("noType");
            desc = '';
        }
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + rmType + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + desc + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var bl = treeNode.data['rm.bl_id'];
        var fl = treeNode.data['rm.fl_id'];
        var rm = treeNode.data['rm.rm_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + bl + "-" + fl + "-" + rm + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (level == 2) {
        restriction = new Ab.view.Restriction();
        restriction.addClause('rm.rm_cat', parentNode.parent.data['rmcat.rm_cat'], '=', 'AND', true);
        if (parentNode.data['rmtype.rm_type']) {
            restriction.addClause('rm.rm_type', parentNode.data['rmtype.rm_type'], '=', 'AND', true);
        }
        else {
            restriction.addClause('rm.rm_type', '', 'IS NULL', 'AND', true);
        }
    }
    return restriction;
}
