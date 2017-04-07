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
            View.panels.get('org_world_tree').addParameter('dvAndDp', "rm.dv_id ='" + treeNode.data['rm.dv_id'] + "' and rm.dp_id ='" + treeNode.data['rm.dp_id'] + "'");
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

var abBldgMetricsOrgs_ctrl = View.createController('abBldgMetricsOrgs_ctrl', {

    selectedMetrics: null,
    fieldsArray: null,
	treeRestriction: "1=1",
	treeRestrForEm: "1=1",
	restriction: ' 1=1 ',
	
    //references to panels from 'Metrics Dashboard' frame.
    row1col1_report: null,
    row2col1_gauge: null,
    row1col2_chart: null,
    row2col2_chart: null,
    
	
	//reference to Flash Map control
	mapControl:null,
	//reference to Map tab view controller
	map_ctrl:null,
	
    afterViewLoad: function(){
		
		//Inject the instance of the controller to the 'masterViewTableMetricController'.
		View.getOpenerView().controllers.get('masterViewTableMetricController').abBldgMetricsOrgs_ctrl = this;
    
        //Set 'afterTabChange' listener
        this.tabsOrgsMetrics.addEventListener('afterTabChange', afterTabChange);
        
        //Initialize the 'selectedMetrics' which will be used by buildingsTab and statisticsTab
        this.selectedMetrics = new Array();
        this.selectedMetrics.push(0);
        this.selectedMetrics.push(10);
        this.selectedMetrics.push(11);
        this.selectedMetrics.push(12);
        this.selectedMetrics.push(13);
        this.selectedMetrics.push(14);
		
        //Initialize the 'fieldsArray' which will be used by buildingsTab and statisticsTab
        this.fieldsArray = new Array();
        this.fieldsArray.push('rm.area_alloc');
        this.fieldsArray.push('rm.area_chargeable');
        this.fieldsArray.push('rm.area_comn_nocup');
        this.fieldsArray.push('rm.area_comn_ocup');
        this.fieldsArray.push('rm.area');
        this.fieldsArray.push('rm.area_comn_rm');
        this.fieldsArray.push('rm.area_manual');
        this.fieldsArray.push('rm.area_comn_serv');
        this.fieldsArray.push('rm.area_comn');
        this.fieldsArray.push('rm.area_unalloc');
        this.fieldsArray.push('rm.chargeable_cost');
        this.fieldsArray.push('rm.em_headcount');
        this.fieldsArray.push('rm.cost_per_area');
        this.fieldsArray.push('rm.area_per_em');
        this.fieldsArray.push('rm.fci');
        
    },
    
    /**
     *Set the 'treeRestriction' object based on lastNodeClicked from  "org_world_tree" tree.
     */
    setTreeRestriction: function(){
    
        var restriction = null;
		var treeRestrForEm = null;
        var lastNodeClicked = this.org_world_tree.lastNodeClicked;
        
        
        //set the restriction accordingly to the tree selection 
        switch (lastNodeClicked.level.levelIndex) {
            case 0:
                restriction = "1=1";
				treeRestrForEm = "1=1";
                break;
            case 1:
                restriction = " rm.dv_id in  (select dv_id from dv where dv.bu_id = '" + lastNodeClicked.data["dv.bu_id"] + "')";
                treeRestrForEm = " em.dv_id in  (select dv_id from dv where dv.bu_id = '" + lastNodeClicked.data["dv.bu_id"] + "')";
                break;
            case 2:
                restriction = " rm.dv_id = '" + lastNodeClicked.data["dv.dv_id"] + "'";
                treeRestrForEm = " em.dv_id = '" + lastNodeClicked.data["dv.dv_id"] + "'";
                break;
            case 3:
                restriction = "rm.dv_id = '" + lastNodeClicked.data["rm.dv_id"] + "' and rm.dp_id ='" + lastNodeClicked.data["rm.dp_id"] + "'";
                treeRestrForEm = "em.dv_id = '" + lastNodeClicked.data["rm.dv_id"] + "' and em.dp_id ='" + lastNodeClicked.data["rm.dp_id"] + "'";
                break;
            case 4:
                restriction = " rm.bl_id in  (select bl_id from bl where bl.use1 = '" + lastNodeClicked.data["bl.use1"] + "')";
                restriction += "and rm.dv_id = '" + lastNodeClicked.parent.data["rm.dv_id"] + "' and rm.dp_id ='" + lastNodeClicked.parent.data["rm.dp_id"] + "'";
                treeRestrForEm = " em.dv_id = '" + lastNodeClicked.parent.data["rm.dv_id"] + "' and em.dp_id ='" + lastNodeClicked.parent.data["rm.dp_id"] + "'";
                break;
            case 5:
                restriction = "rm.bl_id  = '" + lastNodeClicked.data["bl.bl_id"] + "'";
                restriction += "and rm.dv_id = '" + lastNodeClicked.parent.parent.data["rm.dv_id"] + "' and rm.dp_id ='" + lastNodeClicked.parent.parent.data["rm.dp_id"] + "'";
                treeRestrForEm = " em.dv_id = '" + lastNodeClicked.parent.parent.data["rm.dv_id"] + "' and em.dp_id ='" + lastNodeClicked.parent.parent.data["rm.dp_id"] + "'";
                
                
        }
        this.treeRestriction = restriction;
		this.treeRestrForEm = treeRestrForEm;
    },
    
    /**
     * Refresh panels from 'Metrics Dashboard' tab
     */
    refreshDashboardTab: function(){
    
        
        abBldgMetricsOrgs_ctrl.row1col1_report.addParameter('treeSelection', abBldgMetricsOrgs_ctrl.restriction);
        abBldgMetricsOrgs_ctrl.row1col1_report.refresh();
        
        abBldgMetricsOrgs_ctrl.row2col1_gauge.restriction = abBldgMetricsOrgs_ctrl.restriction;
        abBldgMetricsOrgs_ctrl.row2col1_gauge.refreshGauge();
        
        abBldgMetricsOrgs_ctrl.row1col2_chart.addParameter('treeSelection', abBldgMetricsOrgs_ctrl.restriction);
		abBldgMetricsOrgs_ctrl.row1col2_chart.addParameter('treeRestrForEm', abBldgMetricsOrgs_ctrl.treeRestrForEm);
        abBldgMetricsOrgs_ctrl.row1col2_chart.refresh();
		abBldgMetricsOrgs_ctrl.row1col2_chart.loadChartSWFIntoFlash();
        
        abBldgMetricsOrgs_ctrl.row2col2_chart.addParameter('treeSelection', abBldgMetricsOrgs_ctrl.restriction);
        abBldgMetricsOrgs_ctrl.row2col2_chart.refresh();
		abBldgMetricsOrgs_ctrl.row2col2_chart.loadChartSWFIntoFlash();
        
    },
    
	/**
	 * Refresh 'Statistics' tab function
	 */
    refreshStatisticsTab: function(){
    	abBldgMetricsOrgs_ctrl.bldgMetricsOrgsStatistics_form.addParameter('treeSelection' , abBldgMetricsOrgs_ctrl.restriction);
		abBldgMetricsOrgs_ctrl.bldgMetricsOrgsStatistics_form.addParameter('treeRestrForEm' , abBldgMetricsOrgs_ctrl.treeRestrForEm);
		abBldgMetricsOrgs_ctrl.bldgMetricsOrgsStatistics_form.refresh();
    
    },
    
	/**
	 * Refresh 'Buildings' tab function
	 */
    refreshBuildingsTab: function(){
		abBldgMetricsOrgs_ctrl.abBldgMetricsOrgsBuildings_grid.addParameter('treeSelection' , abBldgMetricsOrgs_ctrl.restriction);
		abBldgMetricsOrgs_ctrl.abBldgMetricsOrgsBuildings_grid.refresh();
    },
	
	
	/**
	 * Refresh 'Map' tab function
	 */
	refreshMapTab: function(){
		abBldgMetricsOrgs_ctrl.map_ctrl.abBldgMetricsOrgsMap_ds.addParameter('treeSelection', abBldgMetricsOrgs_ctrl.restriction);
		abBldgMetricsOrgs_ctrl.mapControl.refresh("1=1");
	},
    
    /**
     * Refresh only the selected tab using a custom function to do the refresh.
     * 
     * @param {boolean} useTreeRestr - use tree restriction when refreshing selected tab 
     */
    refreshSelectedTab: function(useTreeRestr){
    
        this.buildRestriction(!useTreeRestr);
		
		tabRefreshFunction[this.tabsOrgsMetrics.selectedTabName]();
        
    },
	
	/**
	 * Set 'this.restriction' as a concatenation of 'treeRestriction' and 'consoleRestriction'
	 * 
	 *  @param {boolean} onlyConsoleRestr - use only console restriction 
	 */
	 buildRestriction:function (onlyConsoleRestr){
	 	
		if(onlyConsoleRestr){
			this.restriction = View.getOpenerView().controllers.get('masterViewTableMetricController').orgConsoleRestriction;
			return;
		}
		
		this.restriction = this.treeRestriction + ' and ' + View.getOpenerView().controllers.get('masterViewTableMetricController').orgConsoleRestriction;
		
	},
	
    /**
	 *Listener for 'Switch' action
	 */
	org_world_tree_onSwitch: function(){
		
		View.getOpenerView().controllers.get('masterViewTableMetricController').abBdgMetricsMasterView_filterConsole_onClear();
		View.getOpenerView().controllers.get('masterViewTableMetricController').abBldgMetricsOrgs_ctrl = null;
		View.getOpenerView().panels.get('abBdgMetricsMasterView').loadView('ab-bldgmetrics-bldgs.axvw');
		
	}
});

/**
 *Define a JSON object which map the tab name with the function that refresh that tab.
 */

var 	tabRefreshFunction = {
		'dashboardTab':abBldgMetricsOrgs_ctrl.refreshDashboardTab,
		'statisticsTab':abBldgMetricsOrgs_ctrl.refreshStatisticsTab,
		'buildingsTab':abBldgMetricsOrgs_ctrl.refreshBuildingsTab,
		'mapTab':abBldgMetricsOrgs_ctrl.refreshMapTab
	}



/**
 * onClick event listener for nodes of the tree "org_world_tree"
 */
function onClickTreeNode(){
	
	abBldgMetricsOrgs_ctrl.setTreeRestriction();
    abBldgMetricsOrgs_ctrl.refreshSelectedTab(true);
}




/**
 * 'afterTabChange' event listener.
 *
 * @param {Object} tabPanel
 * @param {Object} newTabName
 */
function afterTabChange(tabPanel, newTabName){



    if (newTabName == 'dashboardTab') {
		setTimeout('abBldgMetricsOrgs_ctrl.refreshDashboardTab()', 500) ;
    }
    else 
        if (newTabName == 'statisticsTab') {
        	abBldgMetricsOrgs_ctrl.refreshStatisticsTab();
        }
        else 
            if (newTabName == 'buildingsTab') {
            	abBldgMetricsOrgs_ctrl.refreshBuildingsTab();
            }
}




