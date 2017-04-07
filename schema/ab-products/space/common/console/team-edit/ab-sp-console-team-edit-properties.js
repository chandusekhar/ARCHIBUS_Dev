/**
 * Controller for the properties form.
 *	 @Author Jikai Xu
 */
var propertiesController = View.createController('propertiesController', {
	
	teamId:"",

	afterInitialDataFetch : function(){
		
		//get teamId from previous page, it is null if add new button clicked
		if(valueExistsNotEmpty(View.parameters)&&valueExistsNotEmpty(View.parameters['teamId'])){
			//for edit team's function
			this.teamId=View.parameters['teamId'];
		}
		else if(valueExistsNotEmpty(View.parentTab)){
			//for define team's function
			this.teamId = View.parentTab.parentPanel.teamId;
			this.propertiesForm.actions.get("close").show(false);
			this.propertiesForm.actions.get("delete").show(false);
		}

		//get current date
		var curDate = getCurrentDateInISOFormat();
		
		//initial the page to add new team
		if(!valueExistsNotEmpty(this.teamId)){
			this.refreshPanels(true, this.teamId);
		}
		else{
			this.refreshPanels(false, this.teamId);
			
			//show tabs if edit
			this.showTeamsTab(false);
		}
	},
	
	/**
	 * show employees/rooms/associations tab
	 */
	showTeamsTab: function(isAfterSave){
		
		//for edit team's edit function
		if(valueExistsNotEmpty(View.parameters)&&valueExistsNotEmpty(View.parameters['teamId'])){
			//get the new team_id from the form and set it to variable teamId
			this.teamId = this.propertiesForm.getFieldValue("team_properties.team_id");
			View.parameters['teamId'] = this.teamId;
			
			var teamEditController = View.controllers.get('teamEditController');
			var employeesTab = teamEditController.teamsTabs.findTab("employees");
			if(employeesTab.isContentLoaded){
				var employeeOnTeamController = employeesTab.getContentFrame().View.controllers.get("employeeOnTeamController");
				employeeOnTeamController.refreshPanels(false, this.teamId);
			}else{
				teamEditController.teamsTabs.findTab("employees").loadView();
				teamEditController.teamsTabs.show(true);
				teamEditController.teamsTabs.selectTab("employees");
			}
			
			
			
			//recalculate team statistics
			var statisticsController = View.controllers.get('statisticsController');
			statisticsController.calculateTeamStatistics();
		}
		else{
			//for def team's function: return to the select team list and refresh
			if(valueExistsNotEmpty(View.parentTab)&&isAfterSave){

				//show employees tab and association tab after save a team's properties
				var teamsDefTabs = View.parentTab.parentPanel;
				teamsDefTabs.findTab("employees").show(true);
				teamsDefTabs.findTab("association").show(true);
				
				var teamId = this.propertiesForm.getFieldValue("team_properties.team_id");
				View.parentTab.parentPanel.teamId = teamId;
				
				View.getOpenerView().setTitle("Define Teams: "+ teamId);
			}
			else if(valueExistsNotEmpty(View.controllers.get('teamEditController'))){
				//for edit team's Add New function
				
				var teamEditController = View.controllers.get('teamEditController');
				var employeesTab = teamEditController.teamsTabs.findTab("employees");
				if(employeesTab.isContentLoaded){
					var employeeOnTeamController = employeesTab.getContentFrame().View.controllers.get("employeeOnTeamController");
					employeeOnTeamController.refreshPanels(false, this.teamId);
				}else{
					teamEditController.teamsTabs.findTab("employees").loadView();
					teamEditController.teamsTabs.show(true);
					teamEditController.teamsTabs.selectTab("employees");
				}
				
				//add teamId to let employees tab fetch
				this.teamId = this.propertiesForm.getFieldValue("team_properties.team_id");
				
				
				//set teamId to statistics' teamId
				var statisticsController = View.controllers.get('statisticsController');
				statisticsController.teamId = this.teamId;
				statisticsController.calculateTeamStatistics();
			}
		}
	},
	
	/**
	 * load the form data
	 * @param isEmpty
	 * @param teamId
	 */
	refreshPanels: function(isEmpty, teamId){
		//team properties
		var propertiesRes=new Ab.view.Restriction();
		if(isEmpty){
			//empty form to add new data, set isNew to true
			this.propertiesForm.refresh(null, true);
		}
		else{
			propertiesRes.addClause('team_properties.team_id',teamId,'=');
			
			//set isNew to false manually when select a team
			this.propertiesForm.refresh(propertiesRes, false);
		}
	},
	
	/**
	 * refresh panel for define teams
	 * @param isEmpty
	 * @param teamId
	 */
	refreshPanelsForDefineTeams: function(isEmpty, teamId){
		this.refreshPanels(isEmpty, teamId);
	}
});

