/**
 * @author zhang.yi
 */
var defineLocRMController = View.createController('defineCommonGroup', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        
        this.treeview = View.panels.get('std_tree');
		this.std_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
	gp_detail_afterRefresh: function(){
		var blId = this.gp_detail.getFieldValue('gp.bl_id');
		var isEnable = true;
		if(blId){
			isEnable  = false;
		}
		
		this.gp_detail.enableField("gp.bl_id", isEnable);
		this.gp_detail.enableField("gp.fl_id", isEnable);
		this.gp_detail.enableField("gp.gp_num", isEnable);
    },
	
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newGroup = getMessage("groups");
        menuItems.push({
            text: menutitle_newGroup,
            handler: this.onAddNewButtonPush.createDelegate(this, ['GROUP'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
    },
    
    onAddNewButtonPush: function(menuItemId){
        var stdId = "";
        var nodeLevelIndex = -1;
        this.curTreeNode = this.treeview.lastNodeClicked;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    stdId = this.curTreeNode.data["gpstd.gp_std"];
                    break;
                case 1:
                    stdId = this.curTreeNode.data["gp.gp_std"];
                    break;
            }
        }
        
        if (nodeLevelIndex < 0) {
            alert(getMessage("errorSelectStandard"));
            return;
        }
        
        var restriction = new Ab.view.Restriction();
        restriction.addClause("gp.gp_std", stdId, '=');
        this.gp_detail.refresh(restriction, true, false, false);
    },
    
    gp_detail_onSave: function(){
        this.commonSave("ds_ab-sp-def-comn-gp_form_gp", "gp_detail");
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
    
    gp_detail_onDelete: function(){
        this.commonDelete("ds_ab-sp-def-comn-gp_form_gp", "gp_detail", "gp.gp_id");
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
            case 0:
                return this.curTreeNode;
                break;
            case 1:
                if (this.curTreeNode.parent) {
                    this.curTreeNode.myParent = this.curTreeNode.parent;
                    return this.curTreeNode.parent;
                }
                else {
                    return this.curTreeNode.myParent;
                }
                break;
        }
        
    }
})

function closeGpDetailForm(){
    //not showing gp_detail panel
    View.panels.get("gp_detail").show(false);
}

function afterGeneratingTreeNode(treeNode){
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var gpstd = treeNode.data['gpstd.gp_std'];
        if (!gpstd) {
            labelText1 = labelText1 + "<span class='" + treeNode.level.cssPkClassName + "'>" + getMessage('noStandard') + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    
    if (treeNode.level.levelIndex == 1) {
        var bl = treeNode.data['gp.bl_id'];
        var fl = treeNode.data['gp.fl_id'];
        var gp = treeNode.data['gp.gp_num'];
        
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + bl + "-" + fl + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssPkClassName + "'>" + gp + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (level == 1) {
        restriction = new Ab.view.Restriction();
		var gpstd = parentNode.data['gpstd.gp_std'];
		if(gpstd){
			restriction.addClause('gp.gp_std', gpstd, '=');
		}else{
			restriction.addClause('gp.gp_std', gpstd, 'IS NULL');
		}
    }
    return restriction;
}