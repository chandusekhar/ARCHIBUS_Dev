/**
 * @author Ioan Draghici
 * 06/09/2009
 *
 * @TODO : check the case for building without a site
 */
var caDefLocController = View.createController('caDefLoc', {
    // tree selected node
    crtTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    // operation type: INSERT/UPDATE/DELETE
    operType: "",
    
    //Operaton Data Type //'SITE','BUILDING','FLOOR','ROOM'
    operDataType: "",
    
    //siteCode changed
    siteCodeChanged: false,
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        this.treeview = View.panels.get('site_tree');
    },
    
    /**
     *  create menu for add new button
     * @param {Object} e
     * @param {Object} item
     */
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newSite = getMessage("site");
        var menutitle_newBuilding = getMessage("building");
        var menutitle_newFloor = getMessage("floor");
        var menutitle_newRoom = getMessage("room");
        
        menuItems.push({
            text: menutitle_newSite,
            handler: this.onAddNewButtonPush.createDelegate(this, ['SITE'])
        });
        menuItems.push({
            text: menutitle_newBuilding,
            handler: this.onAddNewButtonPush.createDelegate(this, ['BUILDING'])
        });
        menuItems.push({
            text: menutitle_newFloor,
            handler: this.onAddNewButtonPush.createDelegate(this, ['FLOOR'])
        });
        menuItems.push({
            text: menutitle_newRoom,
            handler: this.onAddNewButtonPush.createDelegate(this, ['ROOM'])
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
        var siteId = "";
        var buildingId = "";
        var floorId = "";
        var roomId = "";
        var nodeLevelIndex = -1;
        if (this.crtTreeNode) {
            nodeLevelIndex = this.crtTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    siteId = this.crtTreeNode.data["site.site_id"];
                    break;
                case 1:
                    siteId = this.crtTreeNode.parent.data["site.site_id"];
                    buildingId = this.crtTreeNode.data["bl.bl_id"];
                    break;
                case 2:
					siteId = this.crtTreeNode.parent.parent.data["site.site_id"];
                    buildingId = this.crtTreeNode.parent.data["bl.bl_id"];
                    floorId = this.crtTreeNode.data["fl.fl_id"];
                    break;
                case 3:
					siteId = this.crtTreeNode.parent.parent.parent.data["site.site_id"];
                    buildingId = this.crtTreeNode.parent.parent.data["bl.bl_id"];
                    floorId = this.crtTreeNode.parent.data["fl.fl_id"];
                    roomId = this.crtTreeNode.data["rm.rm_id"];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "SITE":
                this.rfbsDetailTabs.selectTab("siteTab", null, true, false, false);
                break;
            case "BUILDING":
                restriction.addClause("bl.site_id", siteId, '=');
                this.rfbsDetailTabs.selectTab("blTab", restriction, true, false, false);
				onChangeSite();
                break;
            case "FLOOR":
                if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectBuilding"));
                    return;
                }
                restriction.addClause("fl.bl_id", buildingId, '=');
                this.rfbsDetailTabs.selectTab("flTab", restriction, true, false, false);
                break;
            case "ROOM":
                if (nodeLevelIndex == 0 || nodeLevelIndex == 1 || nodeLevelIndex == -1) {
                    View.showMessage(getMessage("errorSelectFloor"));
                    return;
                }
                restriction.addClause("rm.bl_id", buildingId, '=');
                restriction.addClause("rm.fl_id", floorId, '=');
                this.rfbsDetailTabs.selectTab("rmTab", restriction, true, false, false);
                break;
        }
    },
    
    site_detail_onDelete: function(){
        this.operDataType = 'SITE';
        this.commonDelete('ds_caDefLocFormSite', 'site_detail', 'site.site_id');
    },
    bl_detail_onDelete: function(){
        this.operDataType = 'BUILDING';
        this.commonDelete('ds_caDefLocFormBl', 'bl_detail', 'bl.bl_id');
    },
    fl_detail_onDelete: function(){
        this.operDataType = 'FLOOR';
        this.commonDelete('ds_caDefLocFormFl', 'fl_detail', 'fl.fl_id');
    },
    rm_detail_onDelete: function(){
        this.operDataType = 'ROOM';
        this.commonDelete('ds_caDefLocFormRm', 'rm_detail', 'rm.rm_id');
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
    
    site_detail_onSave: function(){
        this.operDataType = 'SITE';
        this.commonSave('ds_caDefLocFormSite', 'site_detail');
    },
    bl_detail_onSave: function(){
        this.operDataType = 'BUILDING';
        this.commonSave('ds_caDefLocFormBl', 'bl_detail');
    },
    fl_detail_onSave: function(){
        this.operDataType = 'FLOOR';
        this.commonSave('ds_caDefLocFormFl', 'fl_detail');
    },
    rm_detail_onSave: function(){
        this.operDataType = 'ROOM';
        this.commonSave('ds_caDefLocFormRm', 'rm_detail');
    },
    /**
     * common save function for detail tabs
     * input parameters associated to selected details form
     * @param {Object} dataSourceId
     * @param {Object} formPanelId
     */
    commonSave: function(dataSourceId, formPanelId){
        var formPanel = View.panels.get(formPanelId);
        this.siteCodeChanged = this.hasChanged(formPanel);
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
        if (this.siteCodeChanged) {
            this.refreshTree();
        }
        else {
            //refresh the tree panel
            this.refreshTreePanelAfterUpdate(curEditPanel);
        }
        
        //refresh the edit form panel
        var restriction = curEditPanel.getRecord().toRestriction();
        if (curEditPanel.newRecord) {
            restriction.removeClause("isNew");
            curEditPanel.newRecord = false;
            curEditPanel.record.values["isNew"] = false;
            curEditPanel.record.oldValues["isNew"] = false;
        }
        //remove the clause(the date object) 
        if ("bl_detail" == curEditPanel.id) {
            restriction.removeClause("bl.date_bl");
        }
        curEditPanel.refresh(restriction);
		/* IOAN 11/03/2009 KB 3024868
		 * disable field after save to be sure that select value action is disabled
		 * web core bug ..select value action is enabled after save
		 * even if the field is disabled
		 */
		if("bl_detail" == curEditPanel.id){
			afterSelectSite();
		}
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(curEditPanel){
        var parentNode = this.getParentNode(curEditPanel);
        if (parentNode.isRoot()) {
            this.refreshTree();
        }
        else {
            this.treeview.refreshNode(parentNode);
            // fl level
            if (parentNode.parent) {
                parentNode.parent.expand();
            }
            // rm level
            if (parentNode.parent.parent) {
                parentNode.parent.parent.expand();
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
        var rootNode = this.treeview.treeView.getRoot();
        var levelIndex = -1;
        if (this.crtTreeNode) {
            levelIndex = this.crtTreeNode.level.levelIndex;
        }
        if ("SITE" == this.operDataType) {
            return rootNode;
        }
        else //BUILDING
             if ("BUILDING" == this.operDataType) {
                switch (levelIndex) {
                    case 0:
                        return this.crtTreeNode;
                        break;
                    case 1:
                        return this.crtTreeNode.parent;
                        break;
                    case 2:
                        return this.crtTreeNode.parent.parent;
                        break;
                    case 3:
                        return this.crtTreeNode.parent.parent.parent;
                        break;
                    default:
                        return rootNode;
                        break;
                }
            }
            else //FLOOR
                 if ("FLOOR" == this.operDataType) {
                    switch (levelIndex) {
                        case 1:
                            return this.crtTreeNode;
                            break;
                        case 2:
                            return this.crtTreeNode.parent;
                            break;
                        case 3:
                            return this.crtTreeNode.parent.parent;
                            break;
                        default:
                            View.showMessage(getMessage("errorSelectBuilding"));
                            break;
                    }
                }
                else {
                    //ROOM
                    switch (levelIndex) {
                        case 2:
                            return this.crtTreeNode;
                            break;
                        case 3:
                            return this.crtTreeNode.parent;
                            break;
                        default:
                            View.showMessage(getMessage("errorSelectFloor"));
                            break;
                    }
                }
    },
    
    /**
     *  restrict view to user selection
     */
    rfbsFilterPanel_onShow: function(){
        this.refreshTree();
        this.site_detail.show(false);
        this.bl_detail.show(false);
        this.fl_detail.show(false);
        this.rm_detail.show(false);
    },
    /**
     * refresh tree
     */
    refreshTree: function(){
        var console = this.rfbsFilterPanel;
        
        var siteId = console.getFieldValue('bl.site_id');
        if (siteId) {
            this.site_tree.addParameter('siteId', "site.site_id = '" + siteId + "'");
        }
        else {
            this.site_tree.addParameter('siteId', '1 = 1');
        }
        
        var blId = console.getFieldValue('rm.bl_id');
        if (blId) {
            this.site_tree.addParameter('blId', "bl.bl_id = '" + blId + "'");
            this.site_tree.addParameter('blOfNull', "1 = 2");
        }
        else {
            this.site_tree.addParameter('blId', "1 = 1");
            this.site_tree.addParameter('blOfNull', "1 = 1");
        }
        
        var flId = console.getFieldValue('rm.fl_id');
        if (flId) {
            this.site_tree.addParameter('flId', "fl_id = '" + flId + "'");
            this.site_tree.addParameter('flOfNull', "1 = 2");
        }
        else {
            this.site_tree.addParameter('flId', "1 = 1");
            this.site_tree.addParameter('flOfNull', "1 = 1");
        }
        
        var rmId = console.getFieldValue('rm.rm_id');
        if (rmId) {
            this.site_tree.addParameter('rmId', "rm.rm_id = '" + rmId + "'");
            this.site_tree.addParameter('rmOfNull', "1 = 2");
        }
        else {
            this.site_tree.addParameter('rmId', "1 = 1");
            this.site_tree.addParameter('rmOfNull', "1 = 1");
        }
        
        this.site_tree.refresh();
        this.crtTreeNode = null;
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
                case "SITE":
                    var pkFieldName = "site.site_id";
                    break;
                case "BUILDING":
                    var pkFieldName = "bl.bl_id";
                    break;
                case "FLOOR":
                    var pkFieldName = "fl.fl_id";
                    break;
                case "ROOM":
                    var pkFieldName = "rm.rm_id";
                    break;
            }
            this.crtTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },
    /**
     * check the curEditFormPanel.getRecord
     *
     * @param {Object} curEditFormPanel
     * return -- true means the user has changed the site code field
     */
    hasChanged: function(curEditFormPanel){
        if (curEditFormPanel.id == "bl_detail") {
            var oleSiteCode = curEditFormPanel.record.oldValues["bl.site_id"];
            if (curEditFormPanel.getFieldValue("bl.site_id") == oleSiteCode) {
                return false;
            }
            else {
                return true;
            }
        }
    },
    
    
    /**
     * get the treeNode according to the current edit from,
     * for example :
     * if current edit form is floor(operation is insert), but the current selected treeNode is building,
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
 * show details for selected node
 * set global variable 'crtTreeNode' in controller 'caDefLoc'
 */
function onClickTreeNode(){
    var crtTreeNode = View.panels.get("site_tree").lastNodeClicked;
    var levelIndex = crtTreeNode.level.levelIndex;
    var siteId;
    var blId;
    var flId;
    var rmId;
    var restriction = new Ab.view.Restriction();
    //SITE
    if (levelIndex == 0) {
        siteId = crtTreeNode.data['site.site_id'];
        restriction.addClause("site.site_id", siteId, '=');
        View.panels.get('rfbsDetailTabs').selectTab("siteTab", restriction, false, false, false);
    }
    // BUILDING
    if (levelIndex == 1) {
        blId = crtTreeNode.data['bl.bl_id'];
        restriction.addClause("bl.bl_id", blId, '=');
        View.panels.get('rfbsDetailTabs').selectTab("blTab", restriction, false, false, false);
    }
    //FLOOR
    if (levelIndex == 2) {
        blId = crtTreeNode.data['fl.bl_id.key'];
        flId = crtTreeNode.data['fl.fl_id'];
        restriction.addClause("fl.bl_id", blId, '=');
        restriction.addClause("fl.fl_id", flId, '=');
        View.panels.get('rfbsDetailTabs').selectTab("flTab", restriction, false, false, false);
    }
    //ROOM
    if (levelIndex == 3) {
        blId = crtTreeNode.data['rm.bl_id.key'];
        flId = crtTreeNode.data['rm.fl_id.key'];
        rmId = crtTreeNode.data['rm.rm_id'];
        restriction.addClause("rm.bl_id", blId, '=');
        restriction.addClause("rm.fl_id", flId, '=');
        restriction.addClause("rm.rm_id", rmId, '=');
        View.panels.get('rfbsDetailTabs').selectTab("rmTab", restriction, false, false, false);
        
    }
    View.controllers.get('caDefLoc').crtTreeNode = crtTreeNode;
}

/**
 * action listener for select site from building tab
 * this function will make bl.city_id,bl.regn_id,bl.state_id,bl.ctry_id
 * fields read only after site code is selected
 */
function afterSelectSite(){
	var panel = View.panels.get('bl_detail');
	var site_id = panel.getFieldValue('bl.site_id');
	if(valueExistsNotEmpty(site_id)){
		panel.enableField('bl.city_id', false);
		panel.enableField('bl.regn_id', false);
		panel.enableField('bl.state_id', false);
		panel.enableField('bl.ctry_id', false);
	}else{
		panel.enableField('bl.city_id', true);
		panel.enableField('bl.regn_id', true);
		panel.enableField('bl.state_id', true);
		panel.enableField('bl.ctry_id', true);
	}
}
/**
 * on change event for site code field from building tab
 * if user change manually the site code, the application will 
 * check if new site code is valid, autocomplete regional values and
 * disable this fields or enable regional fields if site code is not valid
 */
function onChangeSite(){
	var panel = View.panels.get('bl_detail');
	var site_id = panel.getFieldValue('bl.site_id');
	if(valueExistsNotEmpty(site_id)){
		var parameters = {
			tableName: 'site',
	        fieldNames: toJSON(['site.site_id','site.city_id','site.regn_id','site.state_id','site.ctry_id']),
	        restriction: toJSON(new Ab.view.Restriction({
				'site.site_id': site_id
			}))
		};
	    try {
	        var result = Ab.workflow.Workflow.call('AbCommonResources-getDataRecords', parameters);
	        if (result.data.records.length == 0){
				View.showMessage(getMessage('err_invalid_site_id').replace('{0}', site_id));
				return false;
			}else{
				var record = result.data.records[0];
				panel.setFieldValue('bl.city_id',record['site.city_id']);
				panel.setFieldValue('bl.regn_id',record['site.regn_id']);
				panel.setFieldValue('bl.state_id',record['site.state_id']);
				panel.setFieldValue('bl.ctry_id',record['site.ctry_id']);
			}
	    } catch (e) {
	        Workflow.handleError(e);
			return false;
	    }
	}else{
		panel.setFieldValue('bl.city_id','');
		panel.setFieldValue('bl.regn_id','');
		panel.setFieldValue('bl.state_id','');
		panel.setFieldValue('bl.ctry_id','');
	}
	afterSelectSite();
}
