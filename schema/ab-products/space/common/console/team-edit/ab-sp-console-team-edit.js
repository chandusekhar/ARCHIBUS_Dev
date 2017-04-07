var teamEditController = View.createController('teamEditController', {
	asOfDate:"",
	
	//store tab and controller key/value pair
	tabCtrl:{},
	
	//store the boolean tag whether it needs refresh after saving association panel
	isTabNeedRefresh:{},
	
	/**
	 * initializing 
	 */
	afterViewLoad: function(){
		
		this.initialTabCtrl();
		this.initialReFreshTag();
	},
	
	/**
	 * afterInitialDataFetch 
	 */
	afterInitialDataFetch : function(){
		
		this.teamsTabs.addEventListener('afterTabChange', this.teamsTabs_afterTabChange.createDelegate(this));
		
		this.asOfDate = View.parameters['asOfDate'];
		
		this.teamsTabs.beforeUnload = function(){
			if ( valueExistsNotEmpty(View.parameters) && valueExistsNotEmpty(View.parameters['callBack']) ) {
				//decoupling: using parameter of controller rather than getting field value from the form 
				View.parameters.callBack(View.controllers.get('statisticsController').asOfDate);
			}
		}
	},
	
	/**
	 * initial key/value pair for tab name and its controller name 
	 */
	initialTabCtrl: function(){
		this.tabCtrl['employees'] = 'employeeOnTeamController';
		this.tabCtrl['rooms'] = 'rmOnTeamController';
	},
	
	/**
	 * initial tag for whether need refresh 
	 */
	initialReFreshTag: function(){
		this.isTabNeedRefresh['employees'] = false;
		this.isTabNeedRefresh['rooms'] = false;
	},
	
	/**
	 * after tab changed, refresh the new tab if needed
	 * @param tabPanel
	 * @param newTabName
	 */
	teamsTabs_afterTabChange: function(tabPanel, newTabName) {
		
		//reload the content when change the from date
		var currentTab = tabPanel.findTab(newTabName);
		//if page has loaded and from date has changed, refresh the panels, not load the whole view
		if(currentTab.isContentLoaded){	
			var statisticsController = View.controllers.get('statisticsController');
			var selectedController = currentTab.getContentFrame().View.controllers.get(this.tabCtrl[newTabName]);
			if((valueExistsNotEmpty(selectedController)&&statisticsController.asOfDate != selectedController.asOfDate)||this.isTabNeedRefresh[newTabName]){
				selectedController.refreshPanelsForEditTeams(statisticsController.asOfDate);
				
				//set false after refresh
				this.isTabNeedRefresh[newTabName] = false;
			}
		}else{
			//if newly selected tab has not been loaded yet, it will do the refresh anyway, so set tag to false
			this.isTabNeedRefresh[newTabName] = false;
		}

    },
    
	/**
	 * invoked by team statistics panel to refresh the current selected tab 
	 * @param asOfDate
	 */
    refreshCurrentSelectedTab: function(asOfDate){
    	var selectedTabName = View.panels.get('teamsTabs').selectedTabName;
    	var currentTab = View.panels.get('teamsTabs').findTab(selectedTabName);
    	var selectedController = currentTab.getContentFrame().View.controllers.get(this.tabCtrl[selectedTabName]);
    	if(selectedController){
    		selectedController.refreshPanelsForEditTeams(asOfDate);
    	}
    	
    },
    
	/**
	 * invoked by employees or rooms tab to recalculate the statistics panel 
	 * @param selectedDate
	 */
    calculateStatistics:function(selectedDate){
    	var statisticsController = View.controllers.get('statisticsController');
    	if(valueExistsNotEmpty(selectedDate)){
			//set filter date to as of date on team statistics panel if this method not invoked by after saving or deleting employee items on edit form or on grid
			if(selectedDate!=="refreshOnCurrentAsOfDate"){
				statisticsController.asOfDate = selectedDate;
			}
		}
		else{
			statisticsController.asOfDate = teamEditController.asOfDate;
		}
		
		statisticsController.calculateTeamStatistics();
    }
    
    
});

