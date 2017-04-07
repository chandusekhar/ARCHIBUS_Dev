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
    
    
    if (treeNode.level.levelIndex == 7) {
        var label = treeNode.data['bl.bl_id'] + " " + treeNode.data['bl.name'];
        if (!treeNode.data['bl.lon'] || !treeNode.data['bl.lat']) {
            label += "<img alt='" + getMessage('not_geocoded') + "' border='0' src='/archibus/schema/ab-system/graphics/no_geocode.png'/>"
        }
        treeNode.setUpLabel(label);
    }
    
}


var abEqEqByCsiGeoCtrl = View.createController('abEqEqByCsiGeoCtrl', {
	
	restriction: ' 1=1 ',
	treeRestriction: ' 1=1 ',
	
	printableRestriction: [],
	printableTreeRestriction: [],

	afterViewLoad: function(){
		//Inject the instance of the controller to the 'abEqEqByCsiCtrl'.
		View.getOpenerView().controllers.get('abEqEqByCsiCtrl').abEqEqByCsiGeoCtrl = this;

		//Set 'afterTabChange' listener
        this.abEqEqByCsiGeo_tabs.addEventListener('afterTabChange', afterTabChange);
	},
	
	/**
     * Refresh only the selected tab using a custom function to do the refresh.
     * 
     * @param {boolean} useTreeRestr - use tree restriction when refreshing selected tab 
     */
    refreshSelectedTab: function(useTreeRestr){
    
        this.buildRestriction(!useTreeRestr);
		
		tabRefreshFunction[this.abEqEqByCsiGeo_tabs.selectedTabName]();
        
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
     *Set the 'restriction' object based on lastNodeClicked from  "world_tree" tree.
     */
    setTreeRestriction: function(){
    
        var restriction = null;
        var lastNodeClicked = this.world_tree.lastNodeClicked;
        var printableRestriction = [];
        
        
        //set the restriction accordingly to the tree selection 
        switch (lastNodeClicked.level.levelIndex) {
            case 0:
                restriction = " 1=1";
                break;
            case 1:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,bl WHERE bl.bl_id = a.bl_id AND bl.ctry_id IN (SELECT ctry.ctry_id FROM ctry WHERE ctry.geo_region_id = '" + lastNodeClicked.data["geo_region.geo_region_id"] + "'))";
                printableRestriction.push({'title': getMessage("titleRegionCode"), 'value': lastNodeClicked.data["geo_region.geo_region_id"]});
                break;
            case 2:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,bl WHERE bl.bl_id = a.bl_id AND bl.ctry_id = '" + lastNodeClicked.data["ctry.ctry_id"] + "')";
                printableRestriction.push({'title': getMessage("titleCountryCode"), 'value': lastNodeClicked.data["ctry.ctry_id"]});
                break;
            case 3:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,bl WHERE bl.bl_id = a.bl_id AND bl.regn_id = '" + lastNodeClicked.data["regn.regn_id"] + "' AND bl.ctry_id ='" + lastNodeClicked.data["regn.ctry_id.key"] + "')";
                printableRestriction.push({'title': getMessage("titleRegionCode"), 'value': lastNodeClicked.data["regn.regn_id"]});
                printableRestriction.push({'title': getMessage("titleCountryCode"), 'value': lastNodeClicked.data["regn.ctry_id.key"]});
                break;
            case 4:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,bl WHERE bl.bl_id = a.bl_id AND bl.state_id = '" + lastNodeClicked.data["state.state_id"] + "')";
                printableRestriction.push({'title': getMessage("titleStateCode"), 'value': lastNodeClicked.data["state.state_id"]});
                break;
            case 5:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,bl WHERE bl.bl_id = a.bl_id AND bl.city_id = '" + lastNodeClicked.data["city.city_id"] + "' AND bl.state_id ='" + lastNodeClicked.data["city.state_id.key"] + "')";
                printableRestriction.push({'title': getMessage("titleStateCode"), 'value': lastNodeClicked.data["city.state_id.key"]});
                printableRestriction.push({'title': getMessage("titleCityCode"), 'value': lastNodeClicked.data["city.city_id"]});
                break;
            case 6:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a,bl WHERE bl.bl_id = a.bl_id AND bl.site_id = '" + lastNodeClicked.data["site.site_id"] + "')";
                printableRestriction.push({'title': getMessage("titleSiteCode"), 'value': lastNodeClicked.data["site.site_id"]});
                break;
            case 7:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a WHERE a.bl_id = '" + lastNodeClicked.data["bl.bl_id"] + "')";
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
    	abEqEqByCsiGeoCtrl.abEqEqByCsiStatTab_form.addParameter('treeSelection', abEqEqByCsiGeoCtrl.restriction);
    	abEqEqByCsiGeoCtrl.abEqEqByCsiStatTab_form.refresh();
        
    },
    
    /**
     * Refresh 'Buildings' tab function
     */
    refreshEquipmentTab: function(){
    	abEqEqByCsiGeoCtrl.abEqEqByCsiEqTab_grid.refresh(abEqEqByCsiGeoCtrl.restriction);
    }
});

/**
 *Define a JSON object which map the tab name with the function that refresh that tab.
 */
var tabRefreshFunction = {
    'statisticsTab': abEqEqByCsiGeoCtrl.refreshStatisticsTab,
    'equipmentTab': abEqEqByCsiGeoCtrl.refreshEquipmentTab
} 

/**
 * 'afterTabChange' event listener.
 *
 * @param {Object} tabPanel
 * @param {Object} newTabName
 */
function afterTabChange(tabPanel, newTabName){

    if (newTabName == 'statisticsTab') {
    	abEqEqByCsiGeoCtrl.refreshStatisticsTab();
    }
    else if (newTabName == 'equipmentTab') {
    	abEqEqByCsiGeoCtrl.refreshEquipmentTab();
    }
}

/**
 * onClick event listener for nodes of the tree "world_tree"
 */
function onClickTreeNode(){
	abEqEqByCsiGeoCtrl.setTreeRestriction();
	abEqEqByCsiGeoCtrl.refreshSelectedTab(true);
}
