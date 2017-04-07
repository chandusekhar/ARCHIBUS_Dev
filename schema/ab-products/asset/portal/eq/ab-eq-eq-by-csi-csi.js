/**
 * remove hierarchy_ids from node label
 * @param {Object} treeNode
 */
function afterGeneratingTreeNode(treeNode){
	var hierIds = treeNode.data["csi.hierarchy_ids"];
	var labelText = treeNode.label.replace(hierIds, '');
	treeNode.label = labelText;
}

var abEqEqByCsiCsiCtrl = View.createController('abEqEqByCsiCsiCtrl', {
	
	restriction: ' 1=1 ',
	treeRestriction: ' 1=1 ',

	printableRestriction: [],
	printableTreeRestriction: [],

	afterViewLoad: function(){
		//Inject the instance of the controller to the 'abEqEqByCsiCtrl'.
		View.getOpenerView().controllers.get('abEqEqByCsiCtrl').abEqEqByCsiCsiCtrl = this;

		//Set 'afterTabChange' listener
        this.abEqEqByCsiCsi_tabs.addEventListener('afterTabChange', afterTabChange);
	},
	
	/**
     * Refresh only the selected tab using a custom function to do the refresh.
     * 
     * @param {boolean} useTreeRestr - use tree restriction when refreshing selected tab 
     */
    refreshSelectedTab: function(useTreeRestr){
    
        this.buildRestriction(!useTreeRestr);
		
		tabRefreshFunction[this.abEqEqByCsiCsi_tabs.selectedTabName]();
        
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
			return;
		} else {
			this.restriction = this.treeRestriction + ' AND ' + View.getOpenerView().controllers.get('abEqEqByCsiCtrl').consoleRestriction;
			this.printableRestriction = this.printableRestriction.concat(this.printableTreeRestriction);
		}
	},
	
    /**
     *Set the 'treeRestriction' object based on lastNodeClicked from  "classificationsTreePanel" tree.
     */
    setTreeRestriction: function(){
    
        var restriction = null;
        var lastNodeClicked = this.classificationsTreePanel.lastNodeClicked;
        var printableRestriction = [];
        
        
        //set the restriction accordingly to the tree selection 
        switch (lastNodeClicked.level.levelIndex) {
            case 0:
                restriction = " eq.csi_id IS NOT NULL ";
                break;
            default:
                restriction = " eq.eq_id IN (SELECT a.eq_id FROM eq a, csi b WHERE b.csi_id = a.csi_id AND b.hierarchy_ids LIKE '%' ${sql.concat} " + lastNodeClicked.data["csi.csi_id"] + " ${sql.concat} '%')";
            	printableRestriction.push({'title': getMessage("titleCsiCode"), 'value': lastNodeClicked.data["csi.csi_id"]});
                break;
        }
        this.treeRestriction = restriction;
        this.printableTreeRestriction = printableRestriction;
    },

    /**
     * Refresh 'Statistics' tab function
     */
    refreshStatisticsTab: function(){
    	abEqEqByCsiCsiCtrl.abEqEqByCsiStatTab_form.addParameter('treeSelection', abEqEqByCsiCsiCtrl.restriction);
    	abEqEqByCsiCsiCtrl.abEqEqByCsiStatTab_form.refresh();
        
    },
    
    /**
     * Refresh 'Buildings' tab function
     */
    refreshEquipmentTab: function(){
    	abEqEqByCsiCsiCtrl.abEqEqByCsiEqTab_grid.refresh(abEqEqByCsiCsiCtrl.restriction);
    }
});

/**
 *Define a JSON object which map the tab name with the function that refresh that tab.
 */
var tabRefreshFunction = {
    'statisticsTab': abEqEqByCsiCsiCtrl.refreshStatisticsTab,
    'equipmentTab': abEqEqByCsiCsiCtrl.refreshEquipmentTab
} 

/**
 * 'afterTabChange' event listener.
 *
 * @param {Object} tabPanel
 * @param {Object} newTabName
 */
function afterTabChange(tabPanel, newTabName){

    if (newTabName == 'statisticsTab') {
    	abEqEqByCsiCsiCtrl.refreshStatisticsTab();
    }
    else if (newTabName == 'equipmentTab') {
    	abEqEqByCsiCsiCtrl.refreshEquipmentTab();
    }
}

/**
 * onClick event listener for nodes of the tree "classificationsTreePanel"
 */
function onClickTreeNode(){
	abEqEqByCsiCsiCtrl.setTreeRestriction();
	abEqEqByCsiCsiCtrl.refreshSelectedTab(true);
}
