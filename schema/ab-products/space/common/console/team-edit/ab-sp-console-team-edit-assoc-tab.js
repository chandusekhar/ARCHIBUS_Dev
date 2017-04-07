/**
 * Controller for association tab.
 * @Author Jikai Xu
 */
var teamAssocController = View.createController('teamAssocController',{
	
	teamId: "",
	
	asOfDate: "",
	
	initialEndDate: "",
	
	afterCreate : function() {
		View.openProgressBar();
	},
	
	/**
	 * initializing
	 */
	afterInitialDataFetch : function(){
		
		//for edit team's function
		if(valueExistsNotEmpty(View.getOpenerView().parameters)&&valueExistsNotEmpty(View.getOpenerView().parameters['teamId'])){
			
			this.teamId =View.getOpenerView().parameters['teamId'];
		}
		else{
			//for define team's function
			this.teamId = View.parentTab.parentPanel.teamId;
		}
		
		//fetch teamId from team properties when adding teams
		if(!valueExistsNotEmpty(this.teamId)){
			
			this.teamId = View.parentTab.parentPanel.tabs[0].
			getContentFrame().View.controllers.get('employeeOnTeamController').teamId;
			
		}
		
		var statisticsController = View.getOpenerView().controllers.get('statisticsController');
		if(valueExistsNotEmpty(statisticsController)){
			//for edit team's function
			this.asOfDate = statisticsController.asOfDate;
		}
		else{
			//for def team's function
			this.teamId = View.parentTab.parentPanel.teamId;
			this.asOfDate = getCurrentDateInISOFormat();
		}

		this.refreshPanels(null, this.teamId);

		//on define teams module, do not show 'Set End Date for Rooms'
		if(View.getOpenerView().mainPanelId=="teamsDefTabs"){
			$('chbSetEndDateForRms').hidden = true;
		}
		
		View.closeProgressBar();
	},
	
	/**
	 * validation: at least one of these four fields should be filled
	 */
	assocEditPanel_beforeSave : function() {
		var assocEditPanel = this.assocEditPanel;
		// clear validation result
		assocEditPanel.clearValidationResult();
		var projectId = assocEditPanel.getFieldValue('team_assoc.project_id');
		var dvId = assocEditPanel.getFieldValue('team_assoc.dv_id');
		var dpId = assocEditPanel.getFieldValue('team_assoc.dp_id');
		var orgId = assocEditPanel.getFieldValue('team_assoc.org_id');
		
		if(!valueExistsNotEmpty(projectId)&&!valueExistsNotEmpty(dvId)&&!valueExistsNotEmpty(dpId)&&!valueExistsNotEmpty(orgId)){
			assocEditPanel.validationResult.valid = false;
			assocEditPanel.validationResult.message = assocEditPanel.getLocalizedString(getMessage("fill_Highlighted_Fields"));
			assocEditPanel.validationResult.invalidFields['team_assoc.project_id'] = "";
			assocEditPanel.validationResult.invalidFields['team_assoc.dv_id']="";
			assocEditPanel.validationResult.invalidFields['team_assoc.dp_id']="";
			assocEditPanel.validationResult.invalidFields['team_assoc.org_id']="";
			assocEditPanel.displayValidationResult();
			return false;
		}
	},
	
	/**
	 * show item on edit form
	 * @param row
	 */
	assocPanel_onClickItem: function(row) {
	    // the row parameter is the Ab.grid.Row object for the selected row
		var record = row.getRecord();
		var team_assoc_id = record.getValue('team_assoc.team_assoc_id');
		var restriction = new Ab.view.Restriction();
        restriction.addClause('team_assoc.team_assoc_id', team_assoc_id, "=");
	    this.assocEditPanel.refresh(restriction, false);
	    this.assocEditPanel.show();
	    this.enableCheckbox();
	    
	    //store initial end date 
	    var date_end = record.getValue('team_assoc.date_end');
	    if(valueExistsNotEmpty(date_end)){
	    	var year = date_end.getFullYear();
		    var month = date_end.getMonth()+1;
		    var day = date_end.getDate();
		    if(month<10){
		    	month = "0"+month;
		    }
		    if(day<10){
		    	day = "0"+day;
		    }
		    this.initialEndDate = year+"-"+month+"-"+day;
	    }
	    
	},
	
	/**
	 * set the team id for saving
	 */
	setTeamId: function(){
		this.assocEditPanel.setFieldValue("team_assoc.team_id",this.teamId);
	},
	
	/**
	 * update the end date for employees/rooms in team/rm_team table
	 */
	updateDateEnd: function(){
		var startDate = this.assocEditPanel.getFieldValue("team_assoc.date_start");
		var endDate = this.assocEditPanel.getFieldValue("team_assoc.date_end");
		
		//do not update if end date is not modified
		if(valueExistsNotEmpty(endDate)){
			if($('chbSetEndDateForEms').checked){
	    		this.setEndDate("team", startDate, endDate, "employees");
	    	}
	    	if($('chbSetEndDateForRms').checked){
	    		this.setEndDate("rm_team", startDate, endDate, "rooms");
	    	}	
		}
    	
    	
	},
	
	/**
	 * implement the update
	 * @param tableName  table's name of rm_team and team
     * @param startDate date of start
	 * @param endDate date of end
     * @param tabName affected tab
	 */
	setEndDate: function(tableName, startDate, endDate, tabName){
		View.openProgressBar();
		if(!valueExistsNotEmpty(startDate)){
			//set an early date to start date if start date is empty
			startDate = "1900-01-01";
		}
		try {
			Workflow.callMethod("AbSpaceRoomInventoryBAR-SpaceExpressService-updateEndDateOnAssoc", this.teamId, startDate, endDate, tableName);
			View.closeProgressBar();
		}catch(e){
			Workflow.handleError(e);
			View.closeProgressBar();
			return;
		}
		
		
		var teamEditController = View.getOpenerView().controllers.get('teamEditController');
		var teamDefController = View.getOpenerView().controllers.get('teamDefController');
		//set refresh tag to true
		if(valueExistsNotEmpty(teamEditController)){
			//for edit team's function
			teamEditController.isTabNeedRefresh[tabName] = true;
		}
		else if(valueExistsNotEmpty(teamDefController)){
			//for def team's function
			teamDefController.isTabNeedRefresh[tabName] = true;
		}
	},
	
	/**
	 * enable the checkboxes if hte end date is not empty otherwise disable them
	 */
	onDateEndChanged: function(){
		var endDate = this.assocEditPanel.getFieldValue('team_assoc.date_end');
		if(valueExistsNotEmpty(endDate)){
			$('chbSetEndDateForEms').disabled = false;
			$('chbSetEndDateForRms').disabled = false;
		}
		else{
			$('chbSetEndDateForEms').checked = false;
			$('chbSetEndDateForRms').checked = false;
			$('chbSetEndDateForEms').disabled = true;
			$('chbSetEndDateForRms').disabled = true;
		}
	},
	
	enableCheckbox: function(){
		this.onDateEndChanged();
	},
	
	/**
	 * invoked by define teams after select a new team and select this tab
	 * @param isInitial is first loaded
     * @param teamId team's id
	 */
	refreshPanels: function(isInitial, teamId){

		var restriction = new Ab.view.Restriction();
		restriction.addClause('team_assoc.team_id', teamId, '=');
		this.assocPanel.refresh(restriction);
	},
	
	/**
	 * refresh panel for define teams
	 * @param isInitial is first loaded
	 * @param teamId team's id
	 */
	refreshPanelsForDefineTeams: function(isInitial, teamId){
		this.refreshPanels(isInitial, teamId);
		
		//hide edit form
		this.assocEditPanel.show(false);
	},
	
	/**
	 * delete one association item 
	 */
	assocEditPanel_onDelete: function(){
		
		var teamAssocId = this.assocEditPanel.getFieldValue("team_assoc.team_assoc_id");
		var teamId = this.assocEditPanel.getFieldValue("team_assoc.team_id");
		var assocPanel = this.assocPanel;
		var assocEditPanel = this.assocEditPanel;
		var teamAssocDs = this.assoc_ds;
		var teamAssocController = View.controllers.get("teamAssocController");
		View.confirm(getMessage("message_confirm_delete"), function(button){
			if (button == 'no') {
				return;
			}
			else{
				
				var restriction = new Ab.view.Restriction();
				restriction.addClause('team_assoc.team_assoc_id', teamAssocId, '=');
				var record =  teamAssocDs.getRecord(restriction);
				teamAssocDs.deleteRecord(record);
				
				teamAssocController.refreshPanels(null, teamId);
				assocEditPanel.show(false);
				
			}
		});
	}
});