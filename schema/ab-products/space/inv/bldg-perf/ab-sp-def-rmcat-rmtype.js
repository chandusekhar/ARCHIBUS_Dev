/**
 * @author keven.xi
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
		this.cate_tree.setTreeNodeConfigForLevel(1,           	
	        [{fieldName: 'rmtype.rm_type'},                   
	         {fieldName: 'rmtype.description', length: 40}]);      
	},
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        
        this.treeview = View.panels.get('cate_tree');
		//kb#3037870:  disable input but enable select-value action of field hpattern_acad 
		this.cate_detail.enableField("rmcat.hpattern_acad", false);
		this.cate_detail.enableFieldActions("rmcat.hpattern_acad", true);
		this.type_detail.enableField("rmtype.hpattern_acad", false);
		this.type_detail.enableFieldActions("rmtype.hpattern_acad", true);
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newSite = getMessage("roomCategory");
        var menutitle_newBuilding = getMessage("roomType");
        
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
                cateId = this.curTreeNode.data["rmcat.rm_cat"];
            }
            else {
                cateId = this.curTreeNode.data["rmtype.rm_cat"];
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
                restriction.addClause("rmtype.rm_cat", cateId, '=');
                this.catTypeDetailTabs.selectTab("typeTab", restriction, true, false, false);
                break;
        }
    },
    
    cate_detail_onDelete: function(){
        this.operDataType = "CATEGORY";
        this.commonDelete("ds_ab-sp-def-rmcat-rmtype_form_cate", "cate_detail", "rmcat.rm_cat");
    },
    type_detail_onDelete: function(){
        this.operDataType = "TYPE";
        this.commonDelete("ds_ab-sp-def-rmcat-rmtype_form_type", "type_detail", "rmtype.rm_type");
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
        this.commonSave("ds_ab-sp-def-rmcat-rmtype_form_cate", "cate_detail");
    },
    type_detail_onSave: function(){
        this.operDataType = "TYPE";
        this.commonSave("ds_ab-sp-def-rmcat-rmtype_form_type", "type_detail");
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
                    var pkFieldName = "rmcat.rm_cat";
                    break;
                case "TYPE":
                    var pkFieldName = "rmtype.rm_type";
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

/**
 * event handler when click the select value button for the field rmcat.hpattern_acad
 */
function selectRmCatHpattern(){
    View.hpatternPanel = View.panels.get('cate_detail');
    View.hpatternField = 'rmcat.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('rmcat.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

/**
 * event handler when click the select value button for the field rmtype.hpattern_acad
 */
function selectRmTypeHpattern(){
    View.hpatternPanel = View.panels.get('type_detail');
    View.hpatternField = 'rmtype.hpattern_acad';
    View.patternString = View.hpatternPanel.getFieldValue('rmtype.hpattern_acad');
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

