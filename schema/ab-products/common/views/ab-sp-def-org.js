/**
 * @author keven.xi
 */
var defDvDpController = View.createController('defDvDp', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'BUSINESSUNIT', 'DIVISION','DEPARTMENT'
    operDataType: "",
    
    businessUnitChanged: false,
    
    //----------------event handle--------------------
    afterViewLoad: function(){
        this.bu_tree.addParameter('buIdSql', "");
        this.bu_tree.addParameter('dvId', "IS NOT NULL");
        this.bu_tree.addParameter('dpId', "IS NOT NULL");
        this.bu_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        
        this.treeview = View.panels.get('bu_tree');

		//kb#3039945:  disable input but enable select-value action of field hpattern_acad 
		this.dv_detail.enableField("dv.hpattern_acad", false);
		this.dv_detail.enableFieldActions("dv.hpattern_acad", true);
		this.dp_detail.enableField("dp.hpattern_acad", false);
		this.dp_detail.enableFieldActions("dp.hpattern_acad", true);
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newBu = getMessage("businessUnit");
        var menutitle_newSite = getMessage("division");
        var menutitle_newBuilding = getMessage("department");
        
        menuItems.push({
            text: menutitle_newBu,
            handler: this.onAddNewButtonPush.createDelegate(this, ['BUSINESSUNIT'])
        });
        menuItems.push({
            text: menutitle_newSite,
            handler: this.onAddNewButtonPush.createDelegate(this, ['DIVISION'])
        });
        menuItems.push({
            text: menutitle_newBuilding,
            handler: this.onAddNewButtonPush.createDelegate(this, ['DEPARTMENT'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    onAddNewButtonPush: function(menuItemId){
        var buId = "";
        var dvId = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    buId = this.curTreeNode.data["bu.bu_id"];
                    break;
                case 1:
                    buId = this.curTreeNode.data["dv.bu_id"];
                    dvId = this.curTreeNode.data["dv.dv_id"];
                    break;
                case 2:
                    buId = this.curTreeNode.data["dv.bu_id"];
                    dvId = this.curTreeNode.data["dp.dv_id"];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "BUSINESSUNIT":
                this.dvDpDetailTabs.selectTab("buTab", null, true, false, false);
                break;
            case "DIVISION":
                restriction.addClause("dv.bu_id", buId, '=');
                this.dvDpDetailTabs.selectTab("dvTab", restriction, true, false, false);
                break;
            case "DEPARTMENT":
                if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("selectTreeNode"));
                    return;
                }
                restriction.addClause("dp.dv_id", dvId, '=');
                this.dvDpDetailTabs.selectTab("dpTab", restriction, true, false, false);
                break;
        }
    },
    
    dvDpFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.bu_detail.show(false);
        this.dv_detail.show(false);
        this.dp_detail.show(false);
    },
    
    bu_detail_onDelete: function(){
        this.operDataType = "BUSINESSUNIT";
        this.commonDelete("ds_ab-sp-def-org_form_bu", "bu_detail", "bu.bu_id");
    },
    dv_detail_onDelete: function(){
        this.operDataType = "DIVISION";
        this.commonDelete("ds_ab-sp-def-org_form_dv", "dv_detail", "dv.dv_id");
    },
    dp_detail_onDelete: function(){
        this.operDataType = "DEPARTMENT";
        this.commonDelete("ds_ab-sp-def-org_form_dp", "dp_detail", "dp.dp_id");
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
    
    bu_detail_onSave: function(){
        this.operDataType = "BUSINESSUNIT";
        this.commonSave("ds_ab-sp-def-org_form_bu", "bu_detail");
    },
    dv_detail_onSave: function(){
        this.operDataType = "DIVISION";
        this.commonSave("ds_ab-sp-def-org_form_dv", "dv_detail");
    },
    dp_detail_onSave: function(){
        this.operDataType = "DEPARTMENT";
        this.commonSave("ds_ab-sp-def-org_form_dp", "dp_detail");
    },
    commonSave: function(dataSourceID, formPanelID){
        var formPanel = View.panels.get(formPanelID);
		this.businessUnitChanged = this.hasChanged(formPanel);
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
        if (this.businessUnitChanged) {
            this.refreshTreeview();
        }
        else {
            //refresh the tree panel
            this.refreshTreePanelAfterUpdate(curEditPanel);
        }
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
        var parentNode = this.getParentNode(curEditPanel);
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
        if ("BUSINESSUNIT" == this.operDataType) {
            return rootNode;
        }
        else //DIVISION
             if ("DIVISION" == this.operDataType) {
                switch (levelIndex) {
                    case 0:
                        return this.curTreeNode;
                        break;
                    case 1:
                        return this.curTreeNode.parent;
                        break;
                    case 2:
                        return this.curTreeNode.parent.parent;
                        break;
                    default:
                        return rootNode;
                        break;
                }
            }
            else {
                //DEPARTMENT
                switch (levelIndex) {
                    case 1:
                        return this.curTreeNode;
                        break;
                    case 2:
                        return this.curTreeNode.parent;
                        break;
                    default:
                        View.showMessage(getMessage("selectTreeNode"));
                        break;
                }
            }
        
    },
    refreshTreeview: function(){
        var consolePanel = this.dvDpFilterPanel;
        var businessId = consolePanel.getFieldValue('dv.bu_id');
        if (businessId) {
            this.bu_tree.addParameter('buId', " bu.bu_id ='" + convert2SafeSqlString(businessId) + "'");
            this.bu_tree.addParameter('buOfNullDv', " bu.bu_id ='" + convert2SafeSqlString(businessId) + "'");
            this.bu_tree.addParameter('buOfNullDp', " bu.bu_id ='" + convert2SafeSqlString(businessId) + "'");
        }
        else {
            this.bu_tree.addParameter('buId', " 1=1 ");
            this.bu_tree.addParameter('buOfNullDv', " 1=1 ");
            this.bu_tree.addParameter('buOfNullDp', " 1=1 ");
        }
        
        var divisionId = consolePanel.getFieldValue('dp.dv_id');
        if (divisionId) {
            this.bu_tree.addParameter('dvId', " = '" + convert2SafeSqlString(divisionId) + "'");
            this.bu_tree.addParameter('dvOfNullDp', " dv.dv_id ='" + convert2SafeSqlString(divisionId) + "'");
            this.bu_tree.addParameter('buOfNullDv', " 1=0 ");
        }
        else {
            this.bu_tree.addParameter('dvId', "IS NOT NULL");
            this.bu_tree.addParameter('dvOfNullDp', " 1=1 ");
        }
        
        var deptId = consolePanel.getFieldValue('dp.dp_id');
        if (deptId) {
            this.bu_tree.addParameter('dpId', " = '" + convert2SafeSqlString(deptId) + "'");
            this.bu_tree.addParameter('buOfNullDv', " 1=0 ");
            this.bu_tree.addParameter('dvOfNullDp', " 1=0 ");
        }
        else {
            this.bu_tree.addParameter('dpId', "IS NOT NULL");
        }
        
        this.bu_tree.refresh();
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
                case "BUSINESSUNIT":
                    var pkFieldName = "bu.bu_id";
                    break;
                case "DIVISION":
                    var pkFieldName = "dv.dv_id";
                    break;
                case "DEPARTMENT":
                    var pkFieldName = "dp.dp_id";
                    break;
            }
            this.curTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },
    
    /**
     * check the curEditFormPanel.getRecord
     *
     * @param {Object} curEditFormPanel
     * return -- true means the user has changed the business code
     */
    hasChanged: function(curEditFormPanel){
        if (curEditFormPanel.id == "dv_detail") {
            var oldBuCode = curEditFormPanel.record.oldValues["dv.bu_id"];
            if (curEditFormPanel.getFieldValue("dv.bu_id") == oldBuCode) {
                return false;
            }
            else {
                return true;
            }
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
 * set the global variable 'curTreeNode' in controller 'defDvDp'
 */
function onTreeviewClick(){
    View.controllers.get('defDvDp').curTreeNode = View.panels.get("bu_tree").lastNodeClicked;
}

function onBusinessUnitClick(){
    var curTreeNode = View.panels.get("bu_tree").lastNodeClicked;
    var buId = curTreeNode.data['bu.bu_id'];
    View.controllers.get('defDvDp').curTreeNode = curTreeNode;
    if (!buId) {
        View.panels.get("bu_detail").show(false);
        View.panels.get("dv_detail").show(false);
        View.panels.get("dp_detail").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("bu.bu_id", buId, '=');
        View.panels.get('dvDpDetailTabs').selectTab("buTab", restriction, false, false, false);
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'bu_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var buName = treeNode.data['bu.name'];
        var buCode = treeNode.data['bu.bu_id'];
        
        if (!buCode) {
            labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + getMessage("noBusinessUnit") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var dvName = treeNode.data['dv.name'];
        var dvCode = treeNode.data['dv.dv_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + dvCode + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + dvName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var deptName = treeNode.data['dp.name'];
        var deptCode = treeNode.data['dp.dp_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + deptCode + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + deptName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var buId = parentNode.data['bu.bu_id'];
        if (!buId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('dv.bu_id', '', 'IS NULL', 'AND', true);
        }
    }
    return restriction;
}

function selectHpattern(panelId, field){
	View.hpatternPanel = View.panels.get(panelId);
	View.hpatternField = field;
    View.patternString = View.hpatternPanel.getFieldValue(field);
    View.openDialog('ab-hpattern-dialog.axvw', null, true, {
        width: 700,
        height: 530,
        closeButton: false
    });
}

