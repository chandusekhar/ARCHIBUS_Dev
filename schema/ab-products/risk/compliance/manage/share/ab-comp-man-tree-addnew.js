/**
 * @author song
 */
var defineLocationFL = View.createController('defineLocationFL', {

    //Current Selected Node 
    curTreeNode: null,
    
    //The tree panel 
    treeview: null,
    /*
     * template variable of form panel field for search tree node.
     */
    secondRes:null,
    thirdRes:null,
    
    //Operation Type // "INSERT", "UPDATE", "DELETE"
    operType: "",
    
    //Operaton Data Type //'SITE','BUILDING','FLOOR'
    operDataType: "",
    
    //siteCode was changed
    siteCodeChanged: false,
	
	// geographical id's
	ctryId: "",
	stateId: "",
	regnId: "",
	cityId: "",
	
	/*
	 * below is variable pass from application page.
	 */
	buttonName: "",// 'addNew' button
	/*
	 * tree panel id.
	 */
	firstLevelTree: "",// like 'site_tree'
	secondLevelTree: "",// like 'bl_tree'
	thirdLevelTree: "",// like 'fl_tree'
	/*
	 * menu title message
	 */
	menuTitle_firstLevelTree: "",
	menuTitle_secondLevelTree: "",
	menuTitle_thirdLevelTree: "",
	/*
	 * tree node name or cascade tree node name
	 */
	firstNodeName: "",
	
	secondResNodeName: "",
	secondResNodeName0: "",
	
	thirdResNodeName: "",
	thirdResNodeName0: "",
	thirdResNodeName1: "",
	
	tabsName: "",
	firstTabName: "",
	secondTabName: "",
	thirdTabName: "",
	
	abCompDefineRegulation: "",
	abCompDefineProgram: "",
	abCompDefineRequirement: "",
	
	messageFormSaved:"",
	
	abCompRptLocConsoleController:null,
	isReport:null,
	/**
	 * initialize all the object pass form application.
	 */
	configure: function(obj){
//		this.oraginalController = oraginalController;
		this.buttonName = obj.buttonName;
		this.firstLevelTree = obj.firstLevelTree;
		this.secondLevelTree = obj.secondLevelTree;
		this.thirdLevelTree = obj.thirdLevelTree;
		
		this.menuTitle_firstLevelTree = obj.menuTitle_firstLevelTree;
		this.menuTitle_secondLevelTree = obj.menuTitle_secondLevelTree;
		this.menuTitle_thirdLevelTree = obj.menuTitle_thirdLevelTree;
		

    	this.firstNodeName = obj.firstNodeName;//first tree node show field
    	
    	this.secondResNodeName = obj.secondResNodeName;//current tree node key.
    	this.secondResNodeName0 = obj.secondResNodeName0;//second tree node cas-name
    	
    	this.thirdResNodeName = obj.thirdResNodeName;//current tree node key.
    	this.thirdResNodeName0 = obj.thirdResNodeName0;//third tree node show cas-name
    	this.thirdResNodeName1 = obj.thirdResNodeName1;//third tree node show cas-name
    	
    	this.tabsName = obj.tabsName; // application tabs name.
    	

    	this.firstTabName = obj.firstTabName;
    	this.secondTabName = obj.secondTabName;
    	this.thirdTabName = obj.thirdTabName;
    	/*
    	 * three edit form panel.
    	 */
    	this.abCompDefineRegulation = obj.abCompDefineRegulation;
    	this.abCompDefineProgram = obj.abCompDefineProgram;
    	this.abCompDefineRequirement = obj.abCompDefineRequirement;
    	
    	this.abCompRptLocConsoleController = obj.abCompRptLocConsoleController;
    	this.isReport = obj.isReport;
    	/*
    	 * message
    	 */
    	this.messageFormSaved = obj.messageFormSaved;
		//call 'afterInitialDataFetch'
		this._afterInitialDataFetch();
		
	},
    //----------------event handle--------------------
    _afterViewLoad: function(){
    },
    /**
     * a common method.
     */
    _afterInitialDataFetch: function(){
        var titleObj = Ext.get(this.buttonName);
        if(titleObj){
        	titleObj.on('click', this.showMenu, this, null);
        }
        
        this.treeview = this.firstLevelTree;
    },
    /**
     * show menu after click add new button.
     */
    showMenu: function(e, item){
        var menuItems = [];
        var menutitle_newSite = this.menuTitle_firstLevelTree;
        var menutitle_newBuilding = this.menuTitle_secondLevelTree;
        var menutitle_newFloor = this.menuTitle_thirdLevelTree;
        
        menuItems.push({
            text: menutitle_newSite,
            handler: this.onAddNewButtonPush.createDelegate(this, ['FIRST'])
        });
        menuItems.push({
            text: menutitle_newBuilding,
            handler: this.onAddNewButtonPush.createDelegate(this, ['SECOND'])
        });
        menuItems.push({
            text: menutitle_newFloor,
            handler: this.onAddNewButtonPush.createDelegate(this, ['THIRD'])
        });
        
        var menu = new Ext.menu.Menu({
            items: menuItems
        });
        menu.showAt(e.getXY());
        
    },
    /**
     * handle when menu click.
     */
    onAddNewButtonPush: function(menuItemId){
        var siteId = "";
        var buildingId = "";
        var nodeLevelIndex = -1;
        if (this.curTreeNode) {
            nodeLevelIndex = this.curTreeNode.level.levelIndex;
            switch (nodeLevelIndex) {
                case 0:
                    siteId = this.curTreeNode.data[this.firstNodeName];
                    break;
                case 1:
                    siteId = this.curTreeNode.data[this.secondResNodeName0];
                    buildingId = this.curTreeNode.data[this.secondResNodeName];
                    break;
                case 2:
                    siteId = this.curTreeNode.data[this.thirdResNodeName0];
                    buildingId = this.curTreeNode.data[this.thirdResNodeName1];
                    break;
            }
        }
        
        this.operDataType = menuItemId;
        var restriction = new Ab.view.Restriction();
        switch (menuItemId) {
            case "FIRST":
                this.tabsName.selectTab(this.firstTabName, null, true, false, false);
                break;
            case "SECOND":
				if(valueExistsNotEmpty(siteId)){
					restriction.addClause(this.secondResNodeName0, siteId, '=');
				}        
                this.tabsName.selectTab(this.secondTabName, restriction, true, false, false);
                break;
            case "THIRD":
//                if (nodeLevelIndex == 0 || nodeLevelIndex == -1) {
//                    View.showMessage(getMessage("errorSelectBuilding"));
//                    return;
//                }
            	restriction.addClause(this.thirdResNodeName0, siteId, '=');
                restriction.addClause(this.thirdResNodeName1, buildingId, '=');
                this.tabsName.selectTab(this.thirdTabName, restriction, true, false, false);
                break;
        }
    },
    
    /**
     * call by application.
     */
    commonSave: function(formPanelID, flag){
        var formPanel = View.panels.get(formPanelID);
    	if (!formPanel.newRecord) {
    		this.operType = "UPDATE";
    	}else {
    		this.operType = "INSERT";
    	}
    	if (formPanel.save()) {
    		//refresh tree panel and edit panel
    		if(this.treeview){
    			this.refreshTreePanelAfterUpdate(flag);
    		}
    		//get message from view file			 
    		var message = this.messageFormSaved;
    		//show text message in the form				
//    		formPanel.displayTemporaryMessage(message);
    	}
    },
    /**
     * call by application.
     * refreshTree
     */
    refreshTree: function(flag){
		//refresh tree panel and edit panel
		if(this.treeview){
			this.refreshTreePanelAfterUpdate(flag);
		}
		//get message from view file			 
		var message = this.messageFormSaved;
		//show text message in the form				
//		formPanel.displayTemporaryMessage(message);
    },
    
    /**
     * refersh tree panel after save or delete
     * @param {Object} curEditPanel
     */
    refreshTreePanelAfterUpdate: function(flag){
    	if(!this.treeview){
    		return;
    	}
    	var curEditPanel = null;
        switch (flag) {
            case "first":
            	curEditPanel = this.abCompDefineRegulation;
                break;
            case "second":
            	curEditPanel = this.abCompDefineProgram;
            	this.secondRes = curEditPanel.getFieldValue(this.secondResNodeName0);
                break;
            case "third":
            	curEditPanel = this.abCompDefineRequirement;
            	this.secondRes = curEditPanel.getFieldValue(this.thirdResNodeName0);
            	this.thirdRes = curEditPanel.getFieldValue(this.thirdResNodeName1);
                break;
        }
        this.refreshTreeview();
        this.expandTreeNodeByCurEditData();
    	
//        this.curTreeNode = this.getTreeNodeByCurEditData(curEditPanel, pkFieldName, parentNode);
    },
    /**
     * private method: find current tree node according to form data
     */
	expandTreeNodeByCurEditData: function(){
    	var root=this.treeview.treeView.getRoot();
        	for (var i = 0; i < this.treeview.treeView.getRoot().children.length; i++) {
                var node = this.treeview.treeView.getRoot().children[i];
                if(node.data[this.firstNodeName] == this.secondRes){
                	this.treeview.refreshNode(node);
                	node.expand();
                	for (var j = 0; j < node.children.length; j++) {
                    	var node2=node.children[j];
	                    if (node2.data[this.secondResNodeName] == this.thirdRes ) {
	                    	this.treeview.refreshNode(node2);
	                    	node2.expand();
	                    	break;
	                    }
                   }
                   break;	
                }
        	}
    },
    /**
     * refresh the whole tree.
     */
    refreshTreeview: function(){
    	var rootTree = this.firstLevelTree;
    	rootTree.refresh();
        this.curTreeNode = null;
    }
});


/**
 * set the global variable 'curTreeNode' in controller 'defineLocationFL'
 * @parame nodeName : String like 'regulation.regulation'
 * @parame tabName : String tab name.
 */
function onClickTreeNode(nodeName, tabName, restriction){
	
    var curTreeNode = defineLocationFL.firstLevelTree.lastNodeClicked;
    var curId = curTreeNode.data[nodeName];
    View.controllers.get('defineLocationFL').curTreeNode = curTreeNode;
    View.controllers.get('defineLocationFL').firstTabTable = nodeName;
    if (!curId) {
        defineLocationFL.abCompDefineRegulation.show(false);
        defineLocationFL.abCompDefineProgram.show(false);
        defineLocationFL.abCompDefineRequirement.show(false);
    }else {
		if (typeof restriction == 'undefined') 
			restriction = new Ab.view.Restriction();
        restriction.addClause(nodeName, curId, '=');
        defineLocationFL.tabsName.selectTab(tabName, restriction, false, false, false);
        // for report view.
        if(defineLocationFL.abCompRptLocConsoleController.isReport){
        	
        	defineLocationFL.abCompRptLocConsoleController.clickedNodeName = tabName;
        	//kb 3036372 add parameter ' curTreeNode.data' for customlize restriction.
        	defineLocationFL.abCompRptLocConsoleController.filterOtherTabs(nodeName, curTreeNode.data);
        }
    }   
    //If Regulation = Egress or HAZMAT, disable Regulation field and Delete button.
    if(nodeName=="regulation.regulation"&&!abCompRptLocConsoleController.isReport){
    	if(curId=='Egress'||curId=='HAZMAT'){
    		if(abCompRptLocConsoleController){
    			abCompRptLocConsoleController.isEgressOrHAZMAT = true;
            	abCompRptLocConsoleController.setPanelsAttributes.defer(2000, this, [tabName,false]);
    		}
    	}else{
    		if(abCompRptLocConsoleController){
    			abCompRptLocConsoleController.setPanelsAttributes.defer(2000, this, [tabName,true]);
    		}
    	}
    }
}
/**
 * handle when tree node click.
 */
function onClickFirstNode(){
	onClickTreeNode(defineLocationFL.firstNodeName, defineLocationFL.firstTabName);
}

function onClickSecondNode(){
	var curTreeNode = defineLocationFL.firstLevelTree.lastNodeClicked;
	var siteId = curTreeNode.data[defineLocationFL.secondResNodeName0];
	var restriction = new Ab.view.Restriction();
	restriction.addClause(defineLocationFL.secondResNodeName0, siteId, '=');

	onClickTreeNode(defineLocationFL.secondResNodeName, defineLocationFL.secondTabName, restriction);
}

function onClickThirdNode(){
	var curTreeNode = defineLocationFL.firstLevelTree.lastNodeClicked;
	var siteId = curTreeNode.data[defineLocationFL.thirdResNodeName0];
	var buildingId = curTreeNode.data[defineLocationFL.thirdResNodeName1];
	var restriction = new Ab.view.Restriction();
	restriction.addClause(defineLocationFL.thirdResNodeName0, siteId, '=');
	restriction.addClause(defineLocationFL.thirdResNodeName1, buildingId, '=');

	onClickTreeNode(defineLocationFL.thirdResNodeName, defineLocationFL.thirdTabName, restriction);
}
