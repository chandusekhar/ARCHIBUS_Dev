var selectTeamController = View.createController('selectTeamController', {
	
	currentTeamId : '', 
	
	afterViewLoad: function(){
		this.selectTeamFilterOptions.fields.get("team_properties.team_id").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectTeam.createDelegate(this);
		this.selectTeamFilterOptions.fields.get("team_properties.team_id").actions.get(0).command.commands[0].autoComplete=false;
		this.selectTeamFilterOptions.fields.get("team_properties.team_name").actions.get(0).command.commands[0].beforeSelect = this.beforeSelectTeam.createDelegate(this);
		this.selectTeamFilterOptions.fields.get("team_properties.team_name").actions.get(0).command.commands[0].autoComplete=false;
	},
	
	/**
     * Called before click select value of team_properties.team_id and team_name
     */
	beforeSelectTeam: function(command){
        command.dialogRestriction = "team_properties.needs_team_space=1";
	},
	
	afterInitialDataFetch : function(){
		this.refreshPanels();
	},
	
    /**
     * add new team
     */
	addNewTeamProperties: function(){
		var teamsDefTabs = View.parentTab.parentPanel;
		
		this.disableAndLoadTab(teamsDefTabs, "employees");
		this.disableAndLoadTab(teamsDefTabs, "association");
		
		//set teamId to null
		teamsDefTabs.teamId = null;
		this.enableAndLoadTab(teamsDefTabs, "teamProperties");
		teamsDefTabs.findTab("teamProperties").loadView();
		
		//reset title when click add team button
		View.getOpenerView().setTitle(getMessage("define_teams"));
	},

    /**
     * select one team property
     */
	teamPropertiesGrid_onSelect: function(row) {
		this.currentTeamId = row.record['team_properties.team_id'];
		View.parentTab.parentPanel.teamId = this.currentTeamId;
		
		var teamsDefTabs = View.parentTab.parentPanel;
		
		this.enableAndLoadTab(teamsDefTabs, "teamProperties");

		teamsDefTabs.findTab("employees").show(true);
		teamsDefTabs.findTab("association").show(true);
		
		View.getOpenerView().setTitle(getMessage("define_teams")+": "+this.currentTeamId);
		
	},
	
	/**
	 * enable the tab and load data
	 * @param teamsDefTabs
	 * @param tabName
	 */
	enableAndLoadTab: function(teamsDefTabs, tabName){
		teamsDefTabs.selectTab(tabName);
		teamsDefTabs.findTab(tabName).show(true);
	},

	/**
	 * disable the tab and load data
	 * @param teamsDefTabs
	 * @param tabName
	 */
	disableAndLoadTab: function(teamsDefTabs, tabName){
		teamsDefTabs.findTab(tabName).show(false);
	},
	
    /**
     * remove one team property
     */
	teamPropertiesGrid_onRemove: function(row) {
		var teamId = row.record['team_properties.team_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('team_properties.team_id', teamId, '=');
		var record =  this.team_properties_ds.getRecord(restriction);
		if(record)
		{
			this.team_properties_ds.deleteRecord(record);
			this.teamPropertiesGrid.refresh();
			
			//hide other tabs if currently being edited team is deleted
			if(teamId === this.currentTeamId){
				var teamsDefTabs = View.parentTab.parentPanel;
				teamsDefTabs.findTab("employees").show(false);
				teamsDefTabs.findTab("association").show(false);
				teamsDefTabs.findTab("teamProperties").show(false);
				View.getOpenerView().setTitle(getMessage("define_teams"));
			}
			
		}
	
	},

    /**
     * Filters the employees.
     */
	selectTeamFilterOptions_onFilterTeams: function() {
		this.refreshPanels();
    },
    
    /**
     * refresh select team tab
     * 
     */
    refreshPanels: function() {
		var filterValues = this.getFieldsValueOfFilter();
		
		var parameters = this.composeParameters(filterValues);
		
		this.displaySelectTeamGrid(parameters.queryTeamProperties);
		
	},

    /**
     * combine filter field value into an object
     */
    getFieldsValueOfFilter: function() {
    	var filterValues = {};
    	
    	filterValues.teamId = this.selectTeamFilterOptions.getFieldValue("team_properties.team_id");
    	filterValues.teamName = this.selectTeamFilterOptions.getFieldValue("team_properties.team_name");
    	filterValues.teamFunction = this.selectTeamFilterOptions.getFieldValue("team_properties.team_function");
    	filterValues.teamCategory = this.selectTeamFilterOptions.getFieldValue("team_properties.team_category");
    	filterValues.emId = this.selectTeamFilterOptions.getFieldValue("team.em_id");
    	filterValues.isTeamActive = $('teamActiveOnly').checked;
    	
    	return filterValues;
    },

    /**
     * get the sql statement according to the filter fields
     * @param filterValues
     * @return parameters
     */
	composeParameters: function(filterValues) {

		var parameters = {};
		
		//KB# 3052616:list a team in the Teams tab where team_properties.needs_team_space = 1
		var queryTeamProperties = " team_properties.needs_team_space = 1 ";
		
    	if (valueExistsNotEmpty(filterValues.teamId))
    	{
    		queryTeamProperties += " and " + this.getFieldRestrictionById("team_properties.team_id",filterValues.teamId);
    	}
    	if (valueExistsNotEmpty(filterValues.teamName))
    	{
    		queryTeamProperties += " and " + this.getFieldRestrictionById("team_properties.team_name",filterValues.teamName);
    	}
    	if (valueExistsNotEmpty(filterValues.teamFunction))
    	{
    		queryTeamProperties += " and " + this.getFieldRestrictionById("team_properties.team_function",filterValues.teamFunction);;
    	}
    	if (valueExistsNotEmpty(filterValues.teamCategory))
    	{
    		queryTeamProperties += " and " + this.getFieldRestrictionById("team_properties.team_category",filterValues.teamCategory);;
    	}
    	if (valueExistsNotEmpty(filterValues.emId))
    	{
    		queryTeamProperties += " and team_properties.team_id in (select team.team_id from team where " + this.getFieldRestrictionById("team.em_id",filterValues.emId) + ")";
    	}
    	if (filterValues.isTeamActive)
    	{
    		queryTeamProperties += " and team_properties.status = 'Active'";
    	}

		parameters.queryTeamProperties = queryTeamProperties;
		
		return parameters;
	},
	
    /**
     * show team properties
     */
	displaySelectTeamGrid: function(parameters){
		
		this.teamPropertiesGrid.addParameter('conForSelectTeamTab', parameters);
		this.teamPropertiesGrid.refresh();
    },
	
    /**
     * Clears the team properties filter.
     */
    selectTeamFilterOptions_onClearFields: function() {
        this.clearFields();
        this.refreshPanels();
    },	
	
    /**
     * Clears the filter.
     */
	clearFields: function(){
    	this.selectTeamFilterOptions.setFieldValue("team_properties.team_id","");
    	this.selectTeamFilterOptions.setFieldValue("team_properties.team_name","");
    	this.selectTeamFilterOptions.setFieldValue("team_properties.team_function","");
    	this.selectTeamFilterOptions.setFieldValue("team_properties.team_category","");
    	this.selectTeamFilterOptions.setFieldValue("team.em_id","");  
	},
	
	/**
	 * refresh panel for define teams
	 */
	refreshPanelsForDefineTeams: function(){
		this.refreshPanels();
	}
});
