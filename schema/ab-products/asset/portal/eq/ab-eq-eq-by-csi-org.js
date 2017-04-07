/**
 * The callback method after a tree node is generated
 *
 * @param {Object} treeNode
 */
function afterGeneratingTreeNode(treeNode){

    // set the root of the tree 	
    if (treeNode.level.levelIndex == 0) {
        treeNode.setUpLabel('<b>' + getMessage('world') + '</b>');
    }
   
    switch (treeNode.level.levelIndex) {
        case 1:
            treeNode.restriction.addClause('dv.bu_id', treeNode.data['dv.bu_id']);
            break;
        case 3:
            View.panels.get('org_world_tree').addParameter('dvAndDp', "eq.dv_id ='" + treeNode.data['eq.dv_id'] + "' AND eq.dp_id ='" + treeNode.data['eq.dp_id'] + "'");
            break;
        case 4:
            treeNode.restriction.addClause('bl.use1', treeNode.data['bl.use1']);
            break;
            
        case 5:
            var label = treeNode.data['bl.bl_id'] + " " + treeNode.data['bl.name'];
            if (!treeNode.data['bl.lon'] || !treeNode.data['bl.lat']) {
                label += "<img alt='" + getMessage('not_geocoded') + "' border='0' src='/archibus/schema/ab-system/graphics/no_geocode.png'/>"
            }
            treeNode.setUpLabel(label);
    };
	
    
    
}

var abEqEqByCsiOrgCtrl = View.createController('abEqEqByCsiOrgCtrl', {
	
	restriction: ' 1=1 ',
	treeRestriction: ' 1=1 ',
	
	printableRestriction: [],
	printableTreeRestriction: [],

	afterViewLoad: function(){
		//Inject the instance of the controller to the 'abEqEqByOrgCtrl'.
		View.getOpenerView().controllers.get('abEqEqByCsiCtrl').abEqEqByCsiOrgCtrl = this;

		//Set 'afterTabChange' listener
        this.abEqEqByCsiOrg_tabs.addEventListener('afterTabChange', afterTabChange);
	},
	
	/**
     * Refresh only the selected tab using a custom function to do the refresh.
     * 
     * @param {boolean} useTreeRestr - use tree restriction when refreshing selected tab 
     */
    refreshSelectedTab: function(useTreeRestr){
    
        this.buildRestriction(!useTreeRestr);
		
		tabRefreshFunction[this.abEqEqByCsiOrg_tabs.selectedTabName]();
        
    },
    
    /**
	 * Set 'this.restriction' as a concatenation of 'treeRestriction' and 'consoleRestriction'
	 * 
	 *  @param {boolean} onlyConsoleRestr - use only console restriction 
	 */
	 buildRestriction:function (onlyConsoleRestr){
		this.printableRestriction = View.getOpenerView().controllers.get('abEqEqByCsiCtrl').printableConsoleRestriction;
	 	
		if(onlyConsoleRestr){
			this.restriction = View.getOpenerView().controllers.get('abEqEqByCsiCtrl').consoleRestriction;
		} else {
			this.restriction = this.treeRestriction + ' AND ' + View.getOpenerView().controllers.get('abEqEqByCsiCtrl').consoleRestriction;
			this.printableRestriction = this.printableRestriction.concat(this.printableTreeRestriction);
		}
	},
	
    /**
     *Set the 'treeRestriction' object based on lastNodeClicked from  "org_world_tree" tree.
     */
    setTreeRestriction: function(){
    
        var restriction = null;
        var lastNodeClicked = this.org_world_tree.lastNodeClicked;
        var printableRestriction = [];

        
        //set the restriction accordingly to the tree selection 
        switch (lastNodeClicked.level.levelIndex) {
            case 0:
                restriction = "1=1";
                break;
            case 1:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,dv WHERE dv.dv_id = a.dv_id AND dv.dv_id IN (SELECT dv_id FROM dv WHERE dv.bu_id = '" + lastNodeClicked.data["dv.bu_id"] + "'))";
                printableRestriction.push({'title': getMessage("titleBusinessUnitCode"), 'value': lastNodeClicked.data["dv.bu_id"]});
                break;
            case 2:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a WHERE a.dv_id = '" + lastNodeClicked.data["dv.dv_id"] + "')";
                printableRestriction.push({'title': getMessage("titleDivisionCode"), 'value': lastNodeClicked.data["dv.dv_id"]});
                break;
            case 3:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a WHERE a.dv_id = '" + lastNodeClicked.data["eq.dv_id"] + "' AND a.dp_id ='" + lastNodeClicked.data["eq.dp_id"] + "')";
                printableRestriction.push({'title': getMessage("titleDivisionCode"), 'value': lastNodeClicked.data["eq.dv_id"]});
                printableRestriction.push({'title': getMessage("titleDeptCode"), 'value': lastNodeClicked.data["eq.dp_id"]});
                break;
            case 4:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,bl WHERE bl.bl_id = a.bl_id AND bl.bl_id IN (SELECT bl_id FROM bl WHERE bl.use1 = '" + lastNodeClicked.data["bl.use1"] + "')";
                restriction += " AND a.dv_id = '" + lastNodeClicked.parent.data["eq.dv_id"] + "' AND a.dp_id ='" + lastNodeClicked.parent.data["eq.dp_id"] + "')";
                printableRestriction.push({'title': getMessage("titleDivisionCode"), 'value': lastNodeClicked.parent.data["eq.dv_id"]});
                printableRestriction.push({'title': getMessage("titleDeptCode"), 'value': lastNodeClicked.parent.data["eq.dp_id"]});
                printableRestriction.push({'title': getMessage("titleBldgUse"), 'value': lastNodeClicked.data["bl.use1"]});
                break;
            case 5:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a WHERE a.bl_id  = '" + lastNodeClicked.data["bl.bl_id"] + "'";
                restriction += " and a.dv_id = '" + lastNodeClicked.parent.parent.data["eq.dv_id"] + "' AND a.dp_id ='" + lastNodeClicked.parent.parent.data["eq.dp_id"] + "')";
                printableRestriction.push({'title': getMessage("titleDivisionCode"), 'value': lastNodeClicked.parent.parent.data["eq.dv_id"]});
                printableRestriction.push({'title': getMessage("titleDeptCode"), 'value': lastNodeClicked.parent.parent.data["eq.dp_id"]});
                printableRestriction.push({'title': getMessage("titleBldgCode"), 'value': lastNodeClicked.data["bl.bl_id"]});
                break;
                
        }
        this.treeRestriction = restriction;
        this.printableTreeRestriction = printableRestriction;
    },

    /**
     * Refresh 'Statistics' tab function
     */
    refreshStatisticsTab: function(){
    	abEqEqByCsiOrgCtrl.abEqEqByCsiStatTab_form.addParameter('treeSelection', abEqEqByCsiOrgCtrl.restriction);
    	abEqEqByCsiOrgCtrl.abEqEqByCsiStatTab_form.refresh();
        
    },
    
    /**
     * Refresh 'Equipment' tab function
     */
    refreshEquipmentTab: function(){
    	abEqEqByCsiOrgCtrl.abEqEqByCsiEqTab_grid.refresh(abEqEqByCsiOrgCtrl.restriction);
    }
});

/**
 *Define a JSON object which map the tab name with the function that refresh that tab.
 */
var tabRefreshFunction = {
    'statisticsTab': abEqEqByCsiOrgCtrl.refreshStatisticsTab,
    'equipmentTab': abEqEqByCsiOrgCtrl.refreshEquipmentTab
}

/**
 * 'afterTabChange' event listener.
 *
 * @param {Object} tabPanel
 * @param {Object} newTabName
 */
function afterTabChange(tabPanel, newTabName){

    if (newTabName == 'statisticsTab') {
    	abEqEqByCsiOrgCtrl.refreshStatisticsTab();
    }
    else if (newTabName == 'equipmentTab') {
    	abEqEqByCsiOrgCtrl.refreshEquipmentTab();
    }
}

/**
 * onClick event listener for nodes of the tree "org_world_tree"
 */
function onClickTreeNode(){
	abEqEqByCsiOrgCtrl.setTreeRestriction();
	abEqEqByCsiOrgCtrl.refreshSelectedTab(true);
}
