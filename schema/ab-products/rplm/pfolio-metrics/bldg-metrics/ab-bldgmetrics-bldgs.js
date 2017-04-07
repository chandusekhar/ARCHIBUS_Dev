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

var abBldgMetricsBldgs_ctrl = View.createController('abBldgMetricsBldgs_ctrl', {

    selectedMetrics: null,
    fieldsArray: null,
    restriction: ' 1=1 ',
	treeRestriction: ' 1=1 ',
    
    //references to panels from 'Metrics Dashboard' frame.
    row1col1_report: null,
    row2col1_gauge: null,
    row3col1_gauge: null,
    row1col2_chart: null,
    row2col2_chart: null,
    
    
    //reference to Flash Map control
    mapControl: null,
    
    afterViewLoad: function(){
		
		//Inject the instance of the controller to the 'masterViewTableMetricController'.
		View.getOpenerView().controllers.get('masterViewTableMetricController').abBldgMetricsBldgs_ctrl = this;
    
        //Set 'afterTabChange' listener
        this.tabsBldgsMetrics.addEventListener('afterTabChange', afterTabChange);
        
        //Initialize the 'selectedMetrics' which will be used by buildingsTab and statisticsTab
        this.selectedMetrics = new Array();
        this.selectedMetrics.push(0);
        this.selectedMetrics.push(3);
        this.selectedMetrics.push(7);
        this.selectedMetrics.push(12);
        this.selectedMetrics.push(16);
        this.selectedMetrics.push(17);
        
        //Initialize the 'fieldsArray' which will be used by buildingsTab and statisticsTab
        this.fieldsArray = new Array();
        this.fieldsArray.push('bl.area_estimated');
        this.fieldsArray.push('bl.area_gross_int');
        this.fieldsArray.push('bl.area_rentable');
        this.fieldsArray.push('bl.area_ls_negotiated');
        this.fieldsArray.push('bl.area_ocup');
        this.fieldsArray.push('bl.area_rm');
        this.fieldsArray.push('bl.area_usable');
        this.fieldsArray.push('bl.active_capital_cost');
        this.fieldsArray.push('bl.chargeable_cost');
        this.fieldsArray.push('bl.operating_costs');
        this.fieldsArray.push('bl.value_book');
        this.fieldsArray.push('bl.value_market');
        this.fieldsArray.push('bl.count_occup');
        this.fieldsArray.push('bl.count_em');
        this.fieldsArray.push('bl.count_max_occup');
        this.fieldsArray.push('bl.vacancy_percent');
        this.fieldsArray.push('bl.area_avg_em');
        this.fieldsArray.push('bl.cost_sqft');
        this.fieldsArray.push('bl.ratio_ur');
        this.fieldsArray.push('bl.fci');
        this.fieldsArray.push('bl.ratio_ru');
        
    },
    
    /**
     *Set the 'restriction' object based on lastNodeClicked from  "world_tree" tree.
     */
    setTreeRestriction: function(){
    
        var restriction = null;
        var lastNodeClicked = this.world_tree.lastNodeClicked;
        
        
        //set the restriction accordingly to the tree selection 
        switch (lastNodeClicked.level.levelIndex) {
            case 0:
                restriction = " 1=1";
                break;
            case 1:
                restriction = " bl_id in (select bl_id from bl where bl.ctry_id in ( select ctry.ctry_id from ctry where ctry.geo_region_id = '" + lastNodeClicked.data["geo_region.geo_region_id"] + "'))";
                break;
            case 2:
                restriction = " bl_id in (select bl_id from bl where bl.ctry_id = '" + lastNodeClicked.data["ctry.ctry_id"] + "')";
                break;
            case 3:
                restriction = " bl_id in (select bl_id from bl where bl.regn_id = '" + lastNodeClicked.data["regn.regn_id"] + "' and bl.ctry_id ='" + lastNodeClicked.data["regn.ctry_id.key"] + "')";
                break;
            case 4:
                restriction = " bl_id in (select bl_id from bl where bl.state_id = '" + lastNodeClicked.data["state.state_id"] + "')";
                break;
            case 5:
                restriction = " bl_id in (select bl_id from bl where bl.city_id = '" + lastNodeClicked.data["city.city_id"] + "' and bl.state_id ='" + lastNodeClicked.data["city.state_id.key"] + "')";
                break;
            case 6:
                restriction = " bl_id in (select bl_id from bl where bl.site_id = '" + lastNodeClicked.data["site.site_id"] + "')";
                break;
            case 7:
                restriction = " bl_id  = '" + lastNodeClicked.data["bl.bl_id"] + "'";
                
        }
        
		this.treeRestriction = restriction;
    },
    
    /**
     * Refresh panels from 'Metrics Dashboard' tab
     */
    refreshDashboardTab: function(){
    
    
        abBldgMetricsBldgs_ctrl.row1col1_report.addParameter('treeSelection', abBldgMetricsBldgs_ctrl.restriction);
        abBldgMetricsBldgs_ctrl.row1col1_report.refresh();
        
        abBldgMetricsBldgs_ctrl.row2col1_gauge.restriction = abBldgMetricsBldgs_ctrl.restriction;
        abBldgMetricsBldgs_ctrl.row2col1_gauge.refreshGauge();
        
        abBldgMetricsBldgs_ctrl.row3col1_gauge.restriction = abBldgMetricsBldgs_ctrl.restriction;
        abBldgMetricsBldgs_ctrl.row3col1_gauge.refreshGauge();
        
        abBldgMetricsBldgs_ctrl.row1col2_chart.addParameter('treeSelection', abBldgMetricsBldgs_ctrl.restriction);
        var title = abBldgMetricsBldgs_ctrl.row1col2_chart.getTitle();
        abBldgMetricsBldgs_ctrl.row1col2_chart.refresh();
        abBldgMetricsBldgs_ctrl.row1col2_chart.setTitle(title);
        
        
        abBldgMetricsBldgs_ctrl.row2col2_chart.addParameter('treeSelection', abBldgMetricsBldgs_ctrl.restriction);
        var title = abBldgMetricsBldgs_ctrl.row2col2_chart.getTitle();
        abBldgMetricsBldgs_ctrl.row2col2_chart.refresh();
        abBldgMetricsBldgs_ctrl.row2col2_chart.setTitle(title);
    },
    
    /**
     * Refresh 'Statistics' tab function
     */
    refreshStatisticsTab: function(){
        abBldgMetricsBldgs_ctrl.bldgMetricsBldgsStatistics_form.addParameter('treeSelection', abBldgMetricsBldgs_ctrl.restriction);
        abBldgMetricsBldgs_ctrl.bldgMetricsBldgsStatistics_form.refresh();
        
    },
    
    /**
     * Refresh 'Buildings' tab function
     */
    refreshBuildingsTab: function(){
        abBldgMetricsBldgs_ctrl.bldgMetricsBldgsBuildings_grid.refresh(abBldgMetricsBldgs_ctrl.restriction);
    },
    
    /**
     * Refresh 'Map' tab function
     */
    refreshMapTab: function(){
        abBldgMetricsBldgs_ctrl.mapControl.refresh(abBldgMetricsBldgs_ctrl.restriction);
    },
    
    /**
     * Refresh only the selected tab using a custom function to do the refresh.
     * 
     * @param {boolean} useTreeRestr - use tree restriction when refreshing selected tab 
     */
    refreshSelectedTab: function(useTreeRestr){
    
        this.buildRestriction(!useTreeRestr);
		
		tabRefreshFunction[this.tabsBldgsMetrics.selectedTabName]();
        
    },
	
	/**
	 * Set 'this.restriction' as a concatenation of 'treeRestriction' and 'consoleRestriction'
	 * 
	 *  @param {boolean} onlyConsoleRestr - use only console restriction 
	 */
	 buildRestriction:function (onlyConsoleRestr){
	 	
		if(onlyConsoleRestr){
			this.restriction = View.getOpenerView().controllers.get('masterViewTableMetricController').bldgsConsoleRestriction;
			return;
		}
		
		this.restriction = this.treeRestriction + ' and ' + View.getOpenerView().controllers.get('masterViewTableMetricController').bldgsConsoleRestriction;
		
	},
	
	/**
	 *Listener for 'Switch' action
	 */
	world_tree_onSwitch: function(){
		
		View.getOpenerView().controllers.get('masterViewTableMetricController').abBdgMetricsMasterView_filterConsole_onClear();
		View.getOpenerView().controllers.get('masterViewTableMetricController').abBldgMetricsBldgs_ctrl = null;
		View.getOpenerView().panels.get('abBdgMetricsMasterView').loadView('ab-bldgmetrics-orgs.axvw');
		
	}
    
    
    
    
});


/**
 *Define a JSON object which map the tab name with the function that refresh that tab.
 */
var tabRefreshFunction = {
    'dashboardTab': abBldgMetricsBldgs_ctrl.refreshDashboardTab,
    'statisticsTab': abBldgMetricsBldgs_ctrl.refreshStatisticsTab,
    'buildingsTab': abBldgMetricsBldgs_ctrl.refreshBuildingsTab,
    'mapTab': abBldgMetricsBldgs_ctrl.refreshMapTab
} 

/**
 * onClick event listener for nodes of the tree "world_tree"
 */
function onClickTreeNode(){
	abBldgMetricsBldgs_ctrl.setTreeRestriction();
    abBldgMetricsBldgs_ctrl.refreshSelectedTab(true);
}




/**
 * 'afterTabChange' event listener.
 *
 * @param {Object} tabPanel
 * @param {Object} newTabName
 */
function afterTabChange(tabPanel, newTabName){



    if (newTabName == 'dashboardTab') {
        setTimeout('abBldgMetricsBldgs_ctrl.refreshDashboardTab()', 500);
    }
    else 
        if (newTabName == 'statisticsTab') {
            abBldgMetricsBldgs_ctrl.refreshStatisticsTab();
        }
        else 
            if (newTabName == 'buildingsTab') {
                abBldgMetricsBldgs_ctrl.refreshBuildingsTab();
            }
}




