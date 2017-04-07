var teamDefController = View.createController('teamDefController', {
	
	afterInitialDataFetch : function(){
		View.openProgressBar();
		this.teamsDefTabs.addEventListener('afterTabChange', this.teamsDefTabs_afterTabChange.createDelegate(this));
	},
	
	//store tab and controller key/value pair
	tabCtrl:{},
	
	//store the selected teamId to check whether the user select a new team
	arrCurrentTeamId:{},
	
	//store the boolean tag whether it needs refresh after saving association panel
	isTabNeedRefresh:{},
	
	afterViewLoad: function(){
		
		this.initialTabCtrl();
		this.initialArrTeamId();
		View.closeProgressBar();
	},
	
	initialTabCtrl: function(){
		this.tabCtrl['selectTeam'] = 'selectTeamController';
		this.tabCtrl['teamProperties'] = 'propertiesController';
		this.tabCtrl['employees'] = 'employeeOnTeamController';
		this.tabCtrl['association'] = 'teamAssocController';
	},
	
	initialArrTeamId: function(){
		this.arrCurrentTeamId['selectTeam'] = '';
		this.arrCurrentTeamId['teamProperties'] = '';
		this.arrCurrentTeamId['employees'] = '';
		this.arrCurrentTeamId['association'] = '';
	},
	
	initialFreshTag: function(){
		this.isTabNeedRefresh['employees'] = false;
	},
	
	teamsDefTabs_afterTabChange: function(tabPanel, newTabName) {
		
		//reload the content when select the tab 
		var currentTab = tabPanel.findTab(newTabName);
		//if page has loaded and teamId has changed, refresh the panels, not load the whole view
		if(currentTab.isContentLoaded){	
			if(this.arrCurrentTeamId[newTabName]!=this.teamsDefTabs.teamId||this.isTabNeedRefresh[newTabName]){
				var selectControl = currentTab.getContentFrame().View.controllers.get(this.tabCtrl[newTabName]);
				if(selectControl.refreshPanels){
					selectControl.refreshPanelsForDefineTeams(false, this.teamsDefTabs.teamId);
					
					//set false after refresh
					this.isTabNeedRefresh[newTabName] = false;
				}
			}
		}else{
			//if newly selected tab has not been loaded yet, it will do the refresh anyway, so set tag to false
			this.isTabNeedRefresh[newTabName] = false;
		}

		//store the newly selected teamId
		this.arrCurrentTeamId[newTabName]=this.teamsDefTabs.teamId;
    }
	
});








