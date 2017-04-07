/**
 * @author lei
 */
var defRMTypeCatController = View.createController('defRMTypeCat', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type //'INSERT','DELETE','UPDATE'
    operType: "",
    
    //Operaton Data Type //'CATEGORY','TYPE'
    operDataType: "",
    
    afterViewLoad: function(){
    	this.treeview = View.panels.get('cate_tree');
    	this.treeview.setTreeNodeConfigForLevel(1,           	// index of the tree level
            [{fieldName: 'regtype.reg_type'},                   // field value, full length
             {fieldName: 'regtype.summary', length: 40}]);      // field value, trimmed
    },
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newSite = getMessage("regCategory");
        var menutitle_newBuilding = getMessage("regType");
        
        menuItems.push({
            text: menutitle_newSite,
            handler: this.onAddNewButtonPush.createDelegate(this, ['CATEGORY'])
        });
        menuItems.push({
            text: menutitle_newBuilding,
            handler: this.onAddNewButtonPush.createDelegate(this, ['TYPE'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    onAddNewButtonPush: function(menuItemId){
        var cateId = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            if (nodeLevelIndex == 0) {
                cateId = this.curTreeNode.data["regcat.reg_cat"];
            }
            else {
                cateId = this.curTreeNode.data["regtype.reg_cat"];
            }
        }
        else {
            if (menuItemId != "CATEGORY") {
                alert(getMessage("selectTreeNode"));
                return;
            }
        }
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "CATEGORY":
                this.catTypeDetailTabs.selectTab("cateTab", null, true, false, false);
                break;
            case "TYPE":
                restriction.addClause("regtype.reg_cat", cateId, '=');
                this.catTypeDetailTabs.selectTab("typeTab", restriction, true, false, false);
                break;
        }
    },
    
    cate_detail_onDelete: function(){
        this.operDataType = "CATEGORY";
        this.commonDelete("regCatTab1DS", "cate_detail", "regcat.reg_cat");
    },
    type_detail_onDelete: function(){
        this.operDataType = "TYPE";
        this.commonDelete("reGTypeTab2DS", "type_detail", "regtype.reg_type");
    },
    commonDelete: function(dataSourceID, formPanelID, primaryFieldFullName){
        this.operType = "DELETE";
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
                controller.refreshTreePanelAfterUpdate(formPanel);
                formPanel.show(false);
                
            }
        })
    },
    
    cate_detail_onSave: function(){
        this.operDataType = "CATEGORY";
        this.commonSave("regCatTab1DS", "cate_detail");
    },
    type_detail_onSave: function(){
        this.operDataType = "TYPE";
        this.commonSave("reGTypeTab2DS", "type_detail");
    },
    commonSave: function(dataSourceID, formPanelID){
        var formPanel = View.panels.get(formPanelID);
        if (!formPanel.newRecord) {
            this.operType = "UPDATE";
        }
        else {
            this.operType = "INSERT";
        }
        if (formPanel.save()) {
			//refresh the tree panel
        	this.refreshTreePanelAfterUpdate(formPanel);
            //get message from view file			 
            var message = getMessage('formSaved');
            //show text message in the form				
            formPanel.displayTemporaryMessage(message);
        }
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
        var parentNode = this.getParentNode();
        if (parentNode.isRoot()) {
            this.refreshTreeview();
        }
        else {
            this.treeview.refreshNode(parentNode);
            if (parentNode.parent) {
                parentNode.parent.expand();
            }
            parentNode.expand();
        }
        //reset the global variable :curTreeNode
        this.setCurTreeNodeAfterUpdate(curEditPanel, parentNode);
    },
    
    /**
     * prepare the parentNode parameter for calling refreshNode function
     */
    getParentNode: function(){
        var rootNode = this.treeview.treeView.getRoot();
        var levelIndex = -1;
        if (this.curTreeNode) {
            levelIndex = this.curTreeNode.level.levelIndex;
        }
        if ("CATEGORY" == this.operDataType) {
            return rootNode;
        }
        else //TYPE
        {
            switch (levelIndex) {
                case 0:
                    return this.curTreeNode;
                    break;
                case 1:
                    return this.curTreeNode.parent;
                    break;
            }
        }
        
    },
    refreshTreeview: function(){
        var restriction = new Ab.view.Restriction();
        this.treeview.refresh(restriction);
        this.curTreeNode = null;
    },
    
    /**
     * reset the curTreeNode variable after operation
     * @param {Object} curEditPanel : current edit form
     * @param {Object} parentNode
     */
    setCurTreeNodeAfterUpdate: function(curEditPanel, parentNode){
        if (this.operType == "DELETE") {
            this.curTreeNode = null;
        }
        else {
            switch (this.operDataType) {
                case "CATEGORY":
                    var pkFieldName = "regcat.reg_cat";
                    break;
                case "TYPE":
                    var pkFieldName = "regtype.reg_type";
                    break;
            }
            this.curTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },
    
    /**
     * get the treeNode according to the current edit from,
     *
     * so need to make the two consistent ,by current edit form
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
    }
})


/*
 * set the global variable 'curTreeNode' in controller 'defRMTypeCat'
 */
function onClickTreeNode(){
    View.controllers.get('defRMTypeCat').curTreeNode = View.panels.get("cate_tree").lastNodeClicked;
}