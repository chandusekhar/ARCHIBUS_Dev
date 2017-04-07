/**
 * @author keven.xi - originally as ab-sp-def-loc-rm
 * reworked for Bali4 MSDS as ab-sp-def-loc-subrm by Eric_Maxfield@archibus.com
 * 
 */
var defineLocRMController = View.createController('defineLocationSubrm', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'SITE','BUILDING','FLOOR','ROOM','AISLE','CABINET','SHELF','BIN'
    operDataType: "",
    
    //siteCode changed
    siteCodeChanged: false,
    
	ctryId: "",
	stateId: "",
	regnId: "",
	cityId: "",
	
	isPopUpView: false,
    
    //----------------event handle--------------------
    afterViewLoad: function(){
        this.site_tree.addParameter('sitetIdSql', "");
        this.site_tree.addParameter('blId', "IS NOT NULL");
        this.site_tree.addParameter('flId', "IS NOT NULL");
        this.site_tree.createRestrictionForLevel = createRestrictionForLevel;
    },
    
    afterInitialDataFetch: function(){
        var titleObj = Ext.get('addNew');
        titleObj.on('click', this.showMenu, this, null);
        
        this.treeview = View.panels.get('site_tree');
        
        //show specified room when current view is opened as pup up to edit a room
        var parentView = View.getOpenerView();
        if(parentView && parentView.editRoomRestriction!=null){
        	this.isPopUpView = true;
        	this.showSpecifiedRoom(parentView.editRoomRestriction);
        }
        
    },
    
    showSpecifiedRoom: function(restriction){
        var console = this.sbfFilterPanel;
        for(var i=0; i< restriction.clauses.length;i++){
    		console.setFieldValue(restriction.clauses[i].name,restriction.clauses[i].value);
    		
    	}
        this.sbfFilterPanel_onShow();
        this.expandTreeToFirstNode();
        
        //hide the filter console and tree panel
		var layoutManager = View.getLayoutManager('mainLayout');
		if (!layoutManager.isRegionCollapsed('north')) {
			layoutManager.collapseRegion('north');
		}
		var layoutManager = View.getLayoutManager('centerLayout');
		if (!layoutManager.isRegionCollapsed('west')) {
			layoutManager.collapseRegion('west');
		}
    },
    
    expandTreeToFirstNode: function(){
    	var root=this.treeview.treeView.getRoot();
    	var siteNode = root.children[0]
    	this.treeview.refreshNode(siteNode);
    	siteNode.expand();
    	var blNode = siteNode.children[0];
    	this.treeview.refreshNode(blNode);
    	blNode.expand();
    	var flNode = blNode.children[0];
    	this.treeview.refreshNode(flNode);
    	flNode.expand();
    	var rmNode = flNode.children[0];
    	this.treeview.refreshNode(rmNode);
    	rmNode.expand();
    	var aisleNode = rmNode.children[0];
    	this.treeview.refreshNode(aisleNode);
    	aisleNode.expand();
    	var cabinetNode = aisleNode.children[0];
    	this.treeview.refreshNode(cabinetNode);
    	cabinetNode.expand();
    	var shelfNode = cabinetNode.children[0];
    	this.treeview.refreshNode(shelfNode);
    	shelfNode.expand();
    	var binNode = shelfNode.children[0];    	
    	binNode.onLabelClick(binNode);
    	$(binNode.labelElId).command.handle();
    },
    
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newAisle = getMessage("aisle");
        var menutitle_newCabinet = getMessage("cabinet");
        var menutitle_newShelf = getMessage("shelf");
        var menutitle_newBin = getMessage("bin");
        
        menuItems.push({
            text: menutitle_newAisle,
            handler: this.onAddNewButtonPush.createDelegate(this, ['AISLE'])
        });
        menuItems.push({
            text: menutitle_newCabinet,
            handler: this.onAddNewButtonPush.createDelegate(this, ['CABINET'])
        });
        menuItems.push({
            text: menutitle_newShelf,
            handler: this.onAddNewButtonPush.createDelegate(this, ['SHELF'])
        });
        
        menuItems.push({
            text: menutitle_newBin,
            handler: this.onAddNewButtonPush.createDelegate(this, ['BIN'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    
    onAddNewButtonPush: function(menuItemId){
        var siteId = "";
        var buildingId = "";
        var floorId = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 3:
                	siteId = this.curTreeNode.data["bl.site_id"];
                    buildingId = this.curTreeNode.data["rm.bl_id"];
                    floorId = this.curTreeNode.data["rm.fl_id"];                    
                    rmId = this.curTreeNode.data["rm.rm_id"];
                    break;
                case 4:
                	siteId = this.curTreeNode.data["bl.site_id"];
                    buildingId = this.curTreeNode.data["aisle.bl_id"];
                    floorId = this.curTreeNode.data["aisle.fl_id"];
                    rmId = this.curTreeNode.data["aisle.rm_id"];
                    aisleId = this.curTreeNode.data["aisle.aisle_id"];                    
                    break;
                case 5:
                	siteId = this.curTreeNode.data["bl.site_id"];
                    buildingId = this.curTreeNode.data["cabinet.bl_id"];
                    floorId = this.curTreeNode.data["cabinet.fl_id"];
                    rmId = this.curTreeNode.data["cabinet.rm_id"];
                	aisleId = this.curTreeNode.data["cabinet.aisle_id"];
                    cabinetId = this.curTreeNode.data["cabinet.cabinet_id"];                    
                    break;
                case 6:
                	siteId = this.curTreeNode.data["bl.site_id"];
                    buildingId = this.curTreeNode.data["shelf.bl_id"];
                    floorId = this.curTreeNode.data["shelf.fl_id"];
                    rmId = this.curTreeNode.data["shelf.rm_id"];
                	aisleId = this.curTreeNode.data["shelf.aisle_id"];
                    cabinetId = this.curTreeNode.data["shelf.cabinet_id"];
                    shelfId = this.curTreeNode.data["shelf.shelf_id"];
                    break;
                case 7:
                	siteId = this.curTreeNode.data["bl.site_id"];
                    buildingId = this.curTreeNode.data["bin.bl_id"];
                    floorId = this.curTreeNode.data["bin.fl_id"];
                    rmId = this.curTreeNode.data["bin.rm_id"];
                	aisleId = this.curTreeNode.data["bin.aisle_id"];
                    cabinetId = this.curTreeNode.data["bin.cabinet_id"];
                    shelfId = this.curTreeNode.data["bin.shelf_id"];
                    binId = this.curTreeNode.data["bin.bin_id"];
                    break;
            }
        }
		// 02/17/2010 IOAN DRAGHICI KB 3024508 - pass region id from site to building
		// 04/09/2010 Cristina MOLDOVAN KB 3024508/3024954 - pass ctry, state, city ids from site to building
		this.regnId = "";
		this.ctryId = "";
		this.stateId = "";
		this.cityId = "";
		if(valueExistsNotEmpty(siteId)){
			var ds = View.dataSources.get('ds_ab-sp-def-loc-rm_form_site');
			var rec = ds.getRecord(new Ab.view.Restriction({'site.site_id':siteId}));
			this.regnId = rec.getValue('site.regn_id');
			this.ctryId = rec.getValue('site.ctry_id');
			this.stateId = rec.getValue('site.state_id');
			this.cityId = rec.getValue('site.city_id');
		}
		
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "AISLE":
            	if (nodeLevelIndex < 3) {
                    View.showMessage(getMessage("errorSelectRoom"));
                    return;
                }
            	restriction.addClause("aisle.bl_id", buildingId, '=');
                restriction.addClause("aisle.fl_id", floorId, '=');
            	restriction.addClause("aisle.rm_id", rmId, '=');
                this.sbfDetailTabs.selectTab("aisleTab", restriction, true, false, false);
                break;
            case "CABINET":
            	if (nodeLevelIndex < 4) {
                    View.showMessage(getMessage("errorSelectAisle"));
                    return;
                }
            	restriction.addClause("cabinet.bl_id", buildingId, '=');
                restriction.addClause("cabinet.fl_id", floorId, '=');
                restriction.addClause("cabinet.rm_id", rmId, '=');                
                restriction.addClause("cabinet.aisle_id", aisleId, '=');
				this.sbfDetailTabs.selectTab("cabinetTab", restriction, true, false, false);
                break;
            case "SHELF":
                if (nodeLevelIndex < 5) {
                    View.showMessage(getMessage("errorSelectCabinet"));
                    return;
                }
                restriction.addClause("shelf.bl_id", buildingId, '=');
                restriction.addClause("shelf.fl_id", floorId, '=');
                restriction.addClause("shelf.rm_id", rmId, '=');
                restriction.addClause("shelf.aisle_id", aisleId, '=');               
                restriction.addClause("shelf.cabinet_id", cabinetId, '=');
                this.sbfDetailTabs.selectTab("shelfTab", restriction, true, false, false);
                
                break;
            case "BIN":
                if (nodeLevelIndex < 6) {
                    View.showMessage(getMessage("errorSelectShelf"));
                    return;
                }
                restriction.addClause("bin.bl_id", buildingId, '=');
                restriction.addClause("bin.fl_id", floorId, '=');
                restriction.addClause("bin.rm_id", rmId, '=');
                restriction.addClause("bin.aisle_id", aisleId, '=');
                restriction.addClause("bin.cabinet_id", cabinetId, '=');
                restriction.addClause("bin.shelf_id", shelfId, '=');
                this.sbfDetailTabs.selectTab("binTab", restriction, true, false, false);
                break;
        }
    },
    
    sbfFilterPanel_onShow: function(){
        this.refreshTreeview();
        this.site_detail.show(false);
        this.bl_detail.show(false);
        this.fl_detail.show(false);
        this.rm_detail.show(false);
        this.aisle_detail.show(false);
        this.cabinet_detail.show(false);
        this.shelf_detail.show(false);
        this.bin_detail.show(false);
    },
    
    aisle_detail_onDelete: function(){
        this.operDataType = "AISLE";
        this.commonDelete("ds_ab-sp-def-loc-subrm_form_aisle", "aisle_detail", "aisle.aisle_id");
    },
    cabinet_detail_onDelete: function(){
        this.operDataType = "CABINET";
        this.commonDelete("ds_ab-sp-def-loc-subrm_form_cabinet", "cabinet_detail", "cabinet.cabinet_id");
    },
    shelf_detail_onDelete: function(){
        this.operDataType = "SHELF";
        this.commonDelete("ds_ab-sp-def-loc-subrm_form_shelf", "shelf_detail", "shelf.shelf_id");
    },
    bin_detail_onDelete: function(){
        this.operDataType = "BIN";
        this.commonDelete("ds_ab-sp-def-loc-subrm_form_bin", "bin_detail", "bin.bin_id");
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
       
    
    /**
     * Save aisle record.
     */
    aisle_detail_onSave: function(){
        this.operDataType = "AISLE";
        this.commonSave("aisle_detail");
    },
    
    /**
     * Save cabinet record.
     */
    cabinet_detail_onSave: function(){
        this.operDataType = "CABINET";
        this.commonSave("cabinet_detail");
    },
    
    /**
     * Save shelf record.
     */
    shelf_detail_onSave: function(){
        this.operDataType = "SHELF";
        this.commonSave("shelf_detail");
    },
    
    /**
     * Save bin record.
     */
    bin_detail_onSave: function(){
        this.operDataType = "BIN";
        this.commonSave("bin_detail");
    },
    
    
    commonSave: function(formPanelID){
        var formPanel = View.panels.get(formPanelID);
        this.siteCodeChanged = this.hasChanged(formPanel, "site");
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
            
            return true;
        }
        
        return false;
        
    },
    
    
    /**
     * refresh tree panel after save
     * @param {Object} curEditPanel
     */
    onRefreshPanelsAfterSave: function(curEditPanel){
        if (this.siteCodeChanged) {
            this.refreshTreeview();
        }
        else {
            //refresh the tree panel
            this.refreshTreePanelAfterUpdate(curEditPanel);
        }
    },
    
    /**
     * refresh tree panel after save or delete
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
    getParentNode: function(curEditFormPanel){
        var rootNode = this.treeview.treeView.getRoot();
        var levelIndex = -1;
        if (this.curTreeNode) {
            levelIndex = this.curTreeNode.level.levelIndex;
        }
        if ("AISLE" == this.operDataType) {
                switch (levelIndex) {
                    case 3:
                        return this.curTreeNode;
                        break;
                    case 4:
                        return this.curTreeNode.parent;
                        break;
                    case 5:
                        return this.curTreeNode.parent.parent;
                        break;
                    case 6:
                        return this.curTreeNode.parent.parent.parent;
                        break;
                    case 7:
                        return this.curTreeNode.parent.parent.parent.parent;
                        break;
                    default:
                        return rootNode;
                        break;
                }
            }
            else 
                if ("CABINET" == this.operDataType) {
                    //CABINET
                    switch (levelIndex) {
                        case 4:
                            return this.curTreeNode;
                            break;
                        case 5:
                            return this.curTreeNode.parent;
                            break;
                        case 6:
                            return this.curTreeNode.parent.parent;
                            break;
                        case 7:
                            return this.curTreeNode.parent.parent.parent;
                            break;
                        default:
                            View.showMessage(getMessage("errorSelectRoom"));
                            break;
                    }
                }
                else 
                    if ("SHELF" == this.operDataType) {
                        //SHELF
                        switch (levelIndex) {
                            case 5:
                                return this.curTreeNode;
                                break;
                            case 6:
                                return this.curTreeNode.parent;
                                break;
                            case 7:
                                return this.curTreeNode.parent.parent;
                                break;
                            default:
                                View.showMessage(getMessage("errorSelectRoom"));
                                break;
                        }
                    }
                    else 
                        if ("BIN" == this.operDataType) {
                            //BIN
                            switch (levelIndex) {
                                case 6:
                                    return this.curTreeNode;
                                    break;
                                case 7:
                                    return this.curTreeNode.parent;
                                    break;
                                default:
                                    View.showMessage(getMessage("errorSelectRoom"));
                                    break;
                            }
                        }
    },
    
    refreshTreeview: function(){
        var consolePanel = this.sbfFilterPanel;
        
        var siteId = consolePanel.getFieldValue('bl.site_id');
        if (siteId) {
            this.site_tree.addParameter('siteId', " site.site_id ='" + convert2SafeSqlString(siteId) + "'");
            this.site_tree.addParameter('siteOfNullBl', " site.site_id ='" + convert2SafeSqlString(siteId) + "'");
            this.site_tree.addParameter('siteOfNullFl', " site.site_id ='" + convert2SafeSqlString(siteId) + "'");
            this.site_tree.addParameter('siteOfNullRm', " site.site_id ='" + convert2SafeSqlString(siteId) + "'");
        }
        else {
            this.site_tree.addParameter('siteId', " 1=1 ");
            this.site_tree.addParameter('siteOfNullBl', " 1=1 ");
            this.site_tree.addParameter('siteOfNullFl', " 1=1 ");
            this.site_tree.addParameter('siteOfNullRm', " 1=1 ");
        }
        
        
        var buildingId = consolePanel.getFieldValue('rm.bl_id');
        if (buildingId) {
            this.site_tree.addParameter('blId', " = '" + convert2SafeSqlString(buildingId) + "'");
            this.site_tree.addParameter('blOfNullFl', " bl.bl_id ='" + convert2SafeSqlString(buildingId) + "'");
            this.site_tree.addParameter('siteOfNullBl', " 1=0 ");
            this.site_tree.addParameter('blOfNullRm', " bl.bl_id ='" + convert2SafeSqlString(buildingId) + "'");
        }
        else {
            this.site_tree.addParameter('blId', "IS NOT NULL");
            this.site_tree.addParameter('blOfNullFl', " 1=1 ");
            this.site_tree.addParameter('blOfNullRm', " 1=1 ");
        }
        
        var floorId = consolePanel.getFieldValue('rm.fl_id');
        if (floorId) {
            this.site_tree.addParameter('flId', " = '" + convert2SafeSqlString(floorId) + "'");
            this.site_tree.addParameter('siteOfNullBl', " 1=0 ");
            this.site_tree.addParameter('blOfNullFl', " 1=0 ");
            this.site_tree.addParameter('flOfNullRm', " fl.fl_id ='" + convert2SafeSqlString(floorId) + "'");
        }
        else {
            this.site_tree.addParameter('flId', "IS NOT NULL");
			this.site_tree.addParameter('flOfNullRm', " 1=1 ");
        }

        var roomId = consolePanel.getFieldValue('rm.rm_id');
        if (roomId) {
            this.site_tree.addParameter('rmId', " = '" + convert2SafeSqlString(roomId) + "'");
            this.site_tree.addParameter('siteOfNullBl', " 1=0 ");
            this.site_tree.addParameter('blOfNullFl', " 1=0 ");
            this.site_tree.addParameter('blOfNullRm', " 1=0 ");
			this.site_tree.addParameter('flOfNullRm', " 1=0 ");
        }
        else {
            this.site_tree.addParameter('rmId', "IS NOT NULL");
        }

        this.site_tree.refresh();
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
                case "AISLE":
                    var pkFieldName = "aisle.aisle_id";
                    break;
                case "CABINET":
                    var pkFieldName = "cabinet.cabinet_id";
                    break;
                case "SHELF":
                    var pkFieldName = "shelf.shelf_id";
                    break;
                case "BIN":
                    var pkFieldName = "bin.bin_id";
                    break;
            }
            this.curTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
        }
    },
    
    /**
     * check the curEditFormPanel.getRecord
     *
     * @param {Object} curEditFormPanel
	 * @param {Object} checkWhat What fields to check? Values in "site", "ctryStateRegnCity"
     * return -- true means the user has changed the site code field
	 * 			or one of ctry/state/regn/city code fields
     */
    hasChanged: function(curEditFormPanel, checkWhat){
        if (curEditFormPanel.id == "bl_detail") {
            var oldSiteCode = curEditFormPanel.record.oldValues["bl.site_id"];
            var currentSiteCode = curEditFormPanel.getFieldValue("bl.site_id");
			if (checkWhat == "site") {
            if (curEditFormPanel.getFieldValue("bl.site_id") == oldSiteCode) {
                return false;
            }
            else {
                return true;
            }
        }
			if (checkWhat == "ctryStateRegnCity" && currentSiteCode) {
				var ds = View.dataSources.get('ds_ab-sp-def-loc-rm_form_site');
				var rec = ds.getRecord(new Ab.view.Restriction({'site.site_id':currentSiteCode}));
				this.regnId = rec.getValue('site.regn_id');
				this.ctryId = rec.getValue('site.ctry_id');
				this.stateId = rec.getValue('site.state_id');
				this.cityId = rec.getValue('site.city_id');
				
				ctryId = curEditFormPanel.getFieldValue("bl.ctry_id");
				stateId = curEditFormPanel.getFieldValue("bl.state_id");
				regnId = curEditFormPanel.getFieldValue("bl.regn_id");
				cityId = curEditFormPanel.getFieldValue("bl.city_id");
				
				if ((ctryId && ctryId != this.ctryId)
						|| (stateId && stateId != this.stateId)
						|| (regnId && regnId != this.regnId)
						|| (cityId && cityId != this.cityId)
					) {
					return true;
				}
				else {
					return false;
				}
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
 * set the global variable 'curTreeNode' in controller 'defineLocationSubrm'
 */
function onClickTreeNode(){
    View.controllers.get('defineLocationSubrm').curTreeNode = View.panels.get("site_tree").lastNodeClicked;
}

function onClickSiteNode(){
    var curTreeNode = View.panels.get("site_tree").lastNodeClicked;
    var siteId = curTreeNode.data['site.site_id'];
    View.controllers.get('defineLocationSubrm').curTreeNode = curTreeNode;
    if (!siteId) {
        View.panels.get("site_detail").show(false);
        View.panels.get("bl_detail").show(false);
        View.panels.get("fl_detail").show(false);
        View.panels.get("rm_detail").show(false);
        View.panels.get("aisle_detail").show(false);
        View.panels.get("cabinet_detail").show(false);
        View.panels.get("shelf_detail").show(false);
        View.panels.get("bin_detail").show(false);
    }
    else {
        var restriction = new Ab.view.Restriction();
        restriction.addClause("site.site_id", siteId, '=');
        View.panels.get('sbfDetailTabs').selectTab("siteTab", restriction, false, false, false);
    }
}

function afterGeneratingTreeNode(treeNode){
    if (treeNode.tree.id != 'site_tree') {
        return;
    }
    var labelText1 = "";
    if (treeNode.level.levelIndex == 0) {
        var siteCode = treeNode.data['site.site_id'];
        if (!siteCode) {
            labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + getMessage("noSite") + "</span> ";
            treeNode.setUpLabel(labelText1);
        }
    }
    if (treeNode.level.levelIndex == 1) {
        var buildingName = treeNode.data['bl.name'];
        var buildingId = treeNode.data['bl.bl_id'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + buildingId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + buildingName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 2) {
        var floorId = treeNode.data['fl.fl_id'];
        var floorName = treeNode.data['fl.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + floorId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + floorName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 3) {
        var roomId = treeNode.data['rm.rm_id'];
        var roomName = treeNode.data['rm.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + roomId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + roomName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    
    if (treeNode.level.levelIndex == 4) {
        var aisleId = treeNode.data['aisle.aisle_id'];
        var aisleName = treeNode.data['aisle.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + aisleId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + aisleName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 5) {
        var cabinetId = treeNode.data['cabinet.cabinet_id'];
        var cabinetName = treeNode.data['cabinet.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + cabinetId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + cabinetName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 6) {
        var shelfId = treeNode.data['shelf.shelf_id'];
        var shelfName = treeNode.data['shelf.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + shelfId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + shelfName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
    if (treeNode.level.levelIndex == 7) {
        var binId = treeNode.data['bin.bin_id'];
        var binName = treeNode.data['bin.name'];
        
        labelText1 = "<span class='" + treeNode.level.cssPkClassName + "'>" + binId + "</span> ";
        labelText1 = labelText1 + "<span class='" + treeNode.level.cssClassName + "'>" + binName + "</span> ";
        treeNode.setUpLabel(labelText1);
    }
}

function createRestrictionForLevel(parentNode, level){
    var restriction = null;
    if (parentNode.data) {
        var siteId = parentNode.data['site.site_id'];
        if (!siteId && level == 1) {
            restriction = new Ab.view.Restriction();
            restriction.addClause('bl.site_id', '', 'IS NULL', 'AND', true);
        }
    }
    return restriction;
}
