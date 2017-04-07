/**
 * Controller for the employees tab.
 * @Author Jikai Xu
 * Events:
 * app:teamspace:editteam:changedate
 */
var employeeOnTeamController = View.createController('employeeOnTeamController', {
	
	teamId:"",
	
	asOfDate: "",
	
	//store the from date to check when adding employees
	fromDateInFilter:"",
	
	//store the to date to check when adding employees
	toDateInFilter:"",
	
	//to identify the phase for filter(from date input is empty when initializing)
	isInitial: false,
	
	/**
	 * initializing
	 */
	afterInitialDataFetch : function(){
		
		isInitial = true;
		
		this.asOfDate = this.getCurrentAsOfDate();
		
		if(valueExistsNotEmpty(View.getOpenerView().controllers.get('propertiesController'))){
			//for edit team's function
			this.teamId =View.getOpenerView().controllers.get('propertiesController').teamId;
			var statisticsForm = View.getOpenerView().panels.get('statisticsForm');
			
		}
		else{
			//for def team's function
			this.teamId = View.parentTab.parentPanel.teamId;
		}
		
		//render the tab if in edit mode, or not render until a new team added
		if(valueExistsNotEmpty(this.teamId)){
			this.renderPage();
		}
		isInitial = false;
		
		//set asOfDate to check when assign employees 
		this.fromDateInFilter = this.asOfDate;
		
		//disable 'add selected' button
		this.emAvailablePanel.actions.get("addSelected").enable(false);
		
	},

	
	/**
	 * load the panel and add custom components
	 */
	renderPage:function(){
		
		this.employeeFilterOptions.setFieldValue("team.date_start", this.asOfDate);
		//set end date empty
		this.employeeFilterOptions.setFieldValue("team.date_end", "");
		
		//display employees on team and available employees
		this.refreshEmployeesTab(true, true);
		
		this.appendUnassignedChbToTitleBar();
	},
	
	/**
	 * after 'from date' change 
	 */
	onFromDateChanged: function(selectedDate){
		
		var dateRange = this.getDateRangeOfFilter();
		var startDate = dateRange.startDate;
		var endDate = dateRange.endDate;
		
		if(valueExistsNotEmpty(endDate)){
			//if fromDate>toDate, set toDate the same as fromDate
			if(!compareISODates(startDate, endDate)){
				View.panels.get("employeeFilterOptions").setFieldValue("team.date_end",startDate);
			}
		}
		
	},
	
	/**
	 * after 'to date' change 
	 */
	onToDateChanged: function(selectedDate){
		
    	var dateRange = this.getDateRangeOfFilter();
		var startDate = dateRange.startDate;
		var endDate = dateRange.endDate;
		
		if(valueExistsNotEmpty(startDate)){
			//if toDate<fromDate, set fromDate the same as toDate
			if(compareISODates(endDate, startDate)){
				View.panels.get("employeeFilterOptions").setFieldValue("team.date_start",endDate);
			}
		}
		
	},
	
	/**
	 * notify teamEditController to calculate the statistics
	 */
	calculateStatistics: function(selectedDate){

		var teamEditController = View.getOpenerView().controllers.get('teamEditController');
		
		//not for define teams
		if(teamEditController){
			
			teamEditController.calculateStatistics(selectedDate);
		}
		
		
	},
	
	/**
	 * render the field of teams to show team list on employees on team panel
	 */
	emPanel_afterRefresh: function(){
		var employeeOnTeamController = this;
		for (var x=0, column; column = this.emPanel.columns[x]; x++) {
			if ( column.id==='team.teams' )	{
				if (!column.hidden){
					this.emPanel.gridRows.each( function(row) {
				   		var emId = row.getFieldValue('team.em_id');
						emId = employeeOnTeamController.getTeams(emId, false);
						row.setFieldValue("team.teams", emId );
				   	});
				}
			}
		}
	   	
	},
	
	/**
	 * render the field of teams to show team list on available employees
	 */
	emAvailablePanel_afterRefresh: function(){
		var employeeOnTeamController = this;
		for (var x=0, column; column = this.emAvailablePanel.columns[x]; x++) {
			if ( column.id==='em.teams' )	{
				if (!column.hidden){
					this.emAvailablePanel.gridRows.each( function(row) {
				   		var emId = row.getFieldValue('em.em_id');
						emId = employeeOnTeamController.getTeams(emId, true);
						row.setFieldValue("em.teams", emId );
				   	});
				}
			}
		}
		
	},
	
	/**
	 * remove one item on the grid
	 * @param row
	 */
	emPanel_onRemove: function(row) {
		var autonumbered_id = row.record['team.autonumbered_id'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('team.autonumbered_id', autonumbered_id, '=');
		var record =  this.team_ds.getRecord(restriction);
		if(record)
		{
			this.team_ds.deleteRecord(record);
			this.refreshEmployeesTab(false, false);
			this.calculateStatistics("refreshOnCurrentAsOfDate");
		}
	},
	
	/**
	 * save the selected employees 
	 */
	onSaveSelectedEmployees : function()
	{
		try{
			
			var pct_time = this.editMembershipDatePanel.getFieldElement("team.pct_time").value;
			var startDate = this.editMembershipDatePanel.getFieldElement("edit_form.team.date_start").value;
			var endDate = this.editMembershipDatePanel.getFieldElement("edit_form.team.date_end").value;
			
			if(startDate!==attachAngleBracket(getMessage('varies'))){
				startDate = this.editMembershipDatePanel.getFieldValue("edit_form.team.date_start");
			}
			
			if(endDate!==attachAngleBracket(getMessage('varies'))){
				endDate = this.editMembershipDatePanel.getFieldValue("edit_form.team.date_end");
			}
			
			//validate pct_time field
			if(!this.validatePctTime(pct_time)){
				return;
			}
			
			//validate date range
			if(!this.validateDateRange(startDate, endDate)){
				return;
			}

			//save date range and pct_time to team  
			this.saveDateRangeAndPctTime(startDate, endDate, this.editMembershipDatePanel.getFieldValue("team.pct_time"));

		}catch(e){
			View.closeProgressBar();
			View.showMessage('error', '', e.message, e.data);
		}
		
	},
	
	/**
	 * validate pct_time field
	 * @param pct_time
	 * @return true or false
	 */
	validatePctTime: function(pct_time){
		if(pct_time!=attachAngleBracket(getMessage('varies'))){
			pct_time = parseFloat(this.editMembershipDatePanel.getFieldValue("team.pct_time"));
		}
		
		if(pct_time!=attachAngleBracket(getMessage('varies')) && isNaN(pct_time))
		{
			View.alert(getMessage('wrong_type_of_pct_time'));
			this.editMembershipDatePanel.getFieldElement("team.pct_time").value = attachAngleBracket(getMessage('varies'));
			return false;
		}
		return true;
	},
	
	/**
	 * validate date range 
	 * @param startDate
	 * @param endDate
	 * @return true or false
	 */
	validateDateRange: function(startDate, endDate){
		var rows = this.emPanel.getSelectedGridRows();
		var len = rows.length;
		
		 //validate the date range 
		if (valueExistsNotEmpty(startDate) && valueExistsNotEmpty(endDate) && startDate!==attachAngleBracket(getMessage('varies')) && endDate!==attachAngleBracket(getMessage('varies'))) {
			// the compareISODates() function expects formatted (displayed) date values
			if (compareISODates(endDate,startDate)){
				// display the error message defined in AXVW as message element
				View.alert(getMessage('error_date_range'));
				return false;
			}
		}else if(valueExistsNotEmpty(startDate) && valueExistsNotEmpty(endDate) && startDate==attachAngleBracket(getMessage('varies'))&& endDate!=attachAngleBracket(getMessage('varies'))){
			for ( var i = 0; i < len; i++) {
				if (compareISODates(endDate,rows[i].record["team.date_start"]==''?constantClass.getConstants('earlyDate'):rows[i].record["team.date_start.raw"].substring(0,10))){
					// display the error message defined in AXVW as message element
					View.alert(getMessage('error_date_range'));
					return false;
				}
			}
		}else if(valueExistsNotEmpty(startDate) && valueExistsNotEmpty(endDate) && startDate!=attachAngleBracket(getMessage('varies'))&& endDate==attachAngleBracket(getMessage('varies'))){
			for ( var i = 0; i < len; i++) {
				if (compareISODates(rows[i].record["team.date_end"]==''?constantClass.getConstants('lateDate'):rows[i].record["team.date_end.raw"].substring(0,10),startDate)){
					// display the error message defined in AXVW as message element
					View.alert(getMessage('error_date_range'));
					return false;
				} 
			}
		}
		
		if(!valueExistsNotEmpty(startDate))
		{
			View.alert(getMessage('no_start_date_selected'));
			return false;
		}
		
		return true;
	},
	
	/**
	 * save date range and pct_time to team
	 * @param startDate
	 * @param endDate
	 * @param pct_time
	 */
	saveDateRangeAndPctTime: function(startDate, endDate, pct_time){
		var rows=this.emPanel.getSelectedGridRows();  
		var employeesWithDateConflicts = "";
		len = rows.length;
		var isItemSaved = false;
		for (var i=0;i<len;i++){
			
			//validate the date range to check whether the employee has been added to this team at this date range
			var emId = rows[i].record["team.em_id"];
			var teamId = rows[i].record["team.team_id"];
			var autonumbered_id = rows[i].record["team.autonumbered_id"];
			//Check date range when varies
			var isDateValidate = this.validateDateRangeBeforeSave(autonumbered_id, 
					emId, teamId, startDate, endDate, rows[i].record["team.date_start"]==''?constantClass.getConstants('earlyDate'):rows[i].record["team.date_start.raw"].substring(0,10), 
							rows[i].record["team.date_end"]==''?constantClass.getConstants('lateDate'): rows[i].record["team.date_end.raw"].substring(0,10));
			if(!isDateValidate){
				employeesWithDateConflicts += emId+"|";
				continue;
			}
			
            var rec = new Ab.data.Record();
            rec.isNew = false;
            rec.setValue("team.autonumbered_id", autonumbered_id);
            
            if (pct_time != attachAngleBracket(getMessage('varies'))&&valueExistsNotEmpty(pct_time)) {
            	rec.setValue("team.pct_time", pct_time);
			}
			if (startDate != attachAngleBracket(getMessage('varies'))&&valueExistsNotEmpty(startDate)) {
				rec.setValue("team.date_start", startDate);
			}
			//allow empty end date 
			if (endDate != attachAngleBracket(getMessage('varies'))) {
				rec.setValue("team.date_end", endDate);
			}
            
            rec.oldValues = new Object();
            rec.oldValues["team.autonumbered_id"] = rows[i].record["team.autonumbered_id"];
            
            if(rows[i].record["team.pct_time"]){
            	rec.oldValues["team.pct_time"] = rows[i].record["team.pct_time"];
            }
            
            if(rows[i].record["team.date_start.raw"]){
            	rec.oldValues["team.date_start"] = rows[i].record["team.date_start.raw"];
            }
            if(rows[i].record["team.date_end.raw"]){
            	rec.oldValues["team.date_end"] = rows[i].record["team.date_end.raw"];
            }
            
            this.team_ds.saveRecord(rec);
			isItemSaved = true;
		}
		
		if(valueExistsNotEmpty(employeesWithDateConflicts)){
			employeesWithDateConflicts = employeesWithDateConflicts.substring(0,employeesWithDateConflicts.length-1);
			View.alert(getMessage('date_range_overlap').replace("{0}", employeesWithDateConflicts));
		}
		//refresh grid if one of selected items successfully saved
		if(isItemSaved){
			this.editMembershipDatePanel.show(false);
			this.refreshEmployeesTab(false, false);
			this.calculateStatistics("refreshOnCurrentAsOfDate");
		}
	},
	
	/**
	 * validate the date range for an employee
	 * @param autonumbered_id
	 * @param emId
	 * @param teamId
	 * @param startDate iso format
	 * @param endDate iso format
	 * @param selectedStartDate 
	 * @param selectedEndDate
	 * @return true if no overlap, false if overlap
	 */
	validateDateRangeBeforeSave: function(autonumbered_id, emId, teamId, startDate, endDate, selectedStartDate, selectedEndDate){
		var isValid = true;
		var isEmOnTeam = " team.em_id ='"+emId+"' and team.team_id='"+teamId+"'";

		if(startDate!=attachAngleBracket(getMessage('varies'))&&endDate!=attachAngleBracket(getMessage('varies'))){
			if(valueExistsNotEmpty(endDate)){
				isEmOnTeam += " and (${sql.yearMonthDayOf('team.date_start')} <='"+endDate+"' and ( team.date_end is null or ${sql.yearMonthDayOf('team.date_end')}>='"+startDate+"'))";
    	
			}else{
				isEmOnTeam += " and (team.date_end is null or ${sql.yearMonthDayOf('team.date_end')}>='"+startDate+"') ";
    	
			}
		}else if(startDate!=attachAngleBracket(getMessage('varies'))&&endDate==attachAngleBracket(getMessage('varies'))){
			isEmOnTeam += " and (${sql.yearMonthDayOf('team.date_start')} <='"+selectedEndDate+"' and ( team.date_end is null or ${sql.yearMonthDayOf('team.date_end')}>='"+startDate+"'))";
    	
		}else if(startDate==attachAngleBracket(getMessage('varies'))&&endDate!=attachAngleBracket(getMessage('varies'))){
			if(valueExistsNotEmpty(endDate)){
				isEmOnTeam += " and (${sql.yearMonthDayOf('team.date_start')} <='"+endDate+"' and ( team.date_end is null or ${sql.yearMonthDayOf('team.date_end')}>='"+selectedStartDate+"'))";
    	
			}else{
				isEmOnTeam += " and (team.date_end is null or ${sql.yearMonthDayOf('team.date_end')}>='"+selectedStartDate+"') ";
    	
			}
		}
		else{
			//if both start date and end date are <VARIES>, return true
			return isValid;
		}
		

    	this.checkEmOnTeam_ds.addParameter('isEmOnTeam', isEmOnTeam);
    	var records = this.checkEmOnTeam_ds.getRecords();
		//iterate the records to check whether having different items in the previous query. if not, could save.
    	for (var i=0;i<records.length;i++){
			
    		if(records[i].getValue("team.autonumbered_id")!=autonumbered_id){
    			isValid = false;
    		}
		}
    	
    	return isValid;
	},
	
	/**
	 * remove the selected employees
	 * @param row
	 */
	onRemoveSelectedEmployees : function()
	{
		try{
			var rows = this.emPanel.getSelectedGridRows();
			var len = rows.length;
			var selectedTeamIds = "";
			for ( var i = 0; i < len; i++) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('team.autonumbered_id', rows[i].record["team.autonumbered_id"], '=');
				var record =  this.team_ds.getRecord(restriction);
				if(record)
				{
					this.team_ds.deleteRecord(record);
				}
			}
			this.editMembershipDatePanel.show(false);
			this.refreshEmployeesTab(false, false);
			this.calculateStatistics("refreshOnCurrentAsOfDate");
		}catch(e){
			View.closeProgressBar();
			View.showMessage('error', '', e.message, e.data);
		}
	},	
	
	/**
	 * edit selected item(s)
	 */
	emPanel_onMultipleSelectionChange: function(row) {
		
		this.editMembershipDatePanel.show(true);
	    
	    var rows = this.emPanel.getSelectedGridRows();
	    
	    if(rows.length>0)
    	{
	    	var fields = ['em.em_id','team.organization','team.pct_time','team.date_start','team.date_end'];
	    	var elements = ['em.em_id','team.organization','team.pct_time','edit_form.team.date_start','edit_form.team.date_end'];
		    var fldHtmlId = ['ShoweditMembershipDatePanel_em.em_id','ShoweditMembershipDatePanel_team.organization','editMembershipDatePanel_team.pct_time','editMembershipDatePanel_edit_form.team.date_start','editMembershipDatePanel_edit_form.team.date_end'];
		    
	    	for ( var i = 0; i < fields.length; i++) {
				this.setFieldValue(fields[i], elements[i], rows, fldHtmlId[i]);
			}
	    	this.editMembershipDatePanel.show(true);
    	}
	    else
    	{
	    	this.editMembershipDatePanel.clear();
	    	this.editMembershipDatePanel.show(false);
    	}
	    
	},	   

	/**
	 * set field value in the form for multiple records
	 */
	setFieldValue : function(fieldName, elementName, rows, fldHtmlId) {
		var fieldValue = rows[0].record[fieldName];
		for ( var i = 0; i < rows.length; i++) {
			if (rows[i].record[fieldName] != fieldValue) {
				fieldValue = attachAngleBracket(getMessage('varies'));
				break;
			}
		}
		if(fieldValue == attachAngleBracket(getMessage('varies')))
		{
			if(fldHtmlId.indexOf('date')>0||fldHtmlId.indexOf('pct_time')>0)
			{
				$(fldHtmlId).value = fieldValue;
				//kb# 3052896: set property onblur of date input to null to 
				//avoid resetting the ‘<VARIES>’ string to a current date when losing focus on the date input.
				$(fldHtmlId).onblur = null;
			}
			else
			{
				$(fldHtmlId).innerText = fieldValue;
			}
			
		}
		else
		{

			this.editMembershipDatePanel.setFieldValue(elementName, fieldValue, fieldValue, false);
		}
	},
	
	/**
	 * get the teams that an employee has been added to 
	 * @param emId
	 * @param isAvailablePanel
	 * @return teamId
	 */
	getTeams : function(emId, isAvailablePanel){
		
    	var dateRange = this.getDateRangeOfFilter();
		var startDate = dateRange.startDate;
		var endDate = dateRange.endDate;
		
		var teamList = "";
		
		var emTeamsDs = View.dataSources.get('employeeTeamsDS');
		emTeamsDs.addParameter('emId', emId);
		if(isAvailablePanel){
			emTeamsDs.addParameter('teamIdRes', "1=1");
		}else{
			emTeamsDs.addParameter('teamIdRes', "team_id!='"+this.teamId+"'");
		}
		
		emTeamsDs.addParameter('fromDate', startDate);
		emTeamsDs.addParameter('toDate', endDate);
		
		var teams = emTeamsDs.getRecords();
		
		for (var i=0; i<teams.length; i++ ){
			teamList += teams[i].getValue('team.team_id')+",";
		}
		teamList = teamList.substring(0, teamList.length-1);
		
		return teamList;

	},
	
	/**
	 * display teams which an employee was assigned to
	 */
	getTeamList: function(panelId){
		var emPanel = View.panels.get(panelId);
		var index = emPanel.selectedRowIndex;
		var row = emPanel.gridRows.get(index);
		
		var teamRes=new Ab.view.Restriction();
		
		var emId = row.getFieldValue("em.em_id");
		var isAvailablePanel = false;
		if(panelId=="emPanel"){
			emId = row.getFieldValue("team.em_id");
			isAvailablePanel = false;
		}
		else if(panelId=="emAvailablePanel"){
			emId = row.getFieldValue("em.em_id");
			isAvailablePanel = true;
		}
		
		teamRes.addClause('team.em_id',emId,'=');
		teamRes.addClause('team.team_id', '', 'IS NOT NULL');
		
		View.openDialog("ab-sp-console-team-edit-em-teams.axvw", teamRes, false, {
			width: 1000,
			height: 800,
			title: getMessage("team_list"),
			closeButton: false
		});
	},	
	
    /**
     * unselect the checkbox when cancel the form
     */
	onHideForm: function() {
		var rows = this.emPanel.getSelectedGridRows();
		for ( var i = 0; i < rows.length; i++) {
			rows[i].unselect();
		}
	},
	
    /**
     * add custom checkbox for unassigned to any team
     */
    appendUnassignedChbToTitleBar: function(){
    	var panelTitleNode = this.emAvailablePanel.getTitleEl().dom.parentNode.parentNode.parentNode;
    	var tr = Ext.DomHelper.append(panelTitleNode, {
    		tag : 'tr',
    		id : 'unassignedChbTr'
    	});
    	var cell = Ext.DomHelper.append(tr, {
    		tag : 'td',
    		id : 'unassignedChbTd'
    	});
    	var div = "<div class='x-toolbar x-small-editor panelToolbar' id='unassignedChbTitlebar'/>";
        var divCell = Ext.DomHelper.append(cell, div , true);
        var str = "<div class='checkbox-container'>"+"<input type='checkbox' id='emUnassigned'/>"+"<span translatable='true'>"+View.getLocalizedString(getMessage("unassigned_checkbox"))+"</span></div>";
        var unassignedChb = Ext.DomHelper.append(divCell, str , true);
        
        document.getElementById('emUnassigned').onclick=function(){
        	var isChecked = $('emUnassigned').checked;
        	var employeeOnTeamController = View.controllers.get("employeeOnTeamController");
        	employeeOnTeamController.getUnassignedEmployees();
        	
        };
    },
    
    /**
     * get unassigned employees
     */
    getUnassignedEmployees: function(){
    	
    	var isChecked = $('emUnassigned').checked;
    	var emAvailablePanel = View.panels.get("emAvailablePanel");
    	
        if(isChecked){
        	var dateRange = this.getDateRangeOfFilter();
    		var startDate = dateRange.startDate;
    		var endDate = dateRange.endDate;
        	var con = " NOT EXISTS (select 1 from team where em.em_id=team.em_id and ${sql.yearMonthDayOf('team.date_start')}<= '"+endDate+"' and " +
        			"(team.date_end IS NULL OR ${sql.yearMonthDayOf('team.date_end')} >= '"+startDate+"'))" ;
			emAvailablePanel.addParameter('unassigned', con);
        }
        else{
        	emAvailablePanel.addParameter('unassigned', "1=1");
        }
        
        emAvailablePanel.refresh();
		emAvailablePanel.show();
    	
    },
    
    /**
     * change the add selected button's state according to selected employees
     */
    emAvailablePanel_onMultipleSelectionChange: function(row) {
		
	    var rows = this.emAvailablePanel.getSelectedGridRows();
	    
	    if(rows.length>0){
	    	this.emAvailablePanel.actions.get("addSelected").enable(true);
	    }else{
	    	this.emAvailablePanel.actions.get("addSelected").enable(false);
	    }
	},
	
    /**
     * assign multiple selected employees to a team
     */
    emAvailablePanel_onAddSelected: function(){
    	
    	var rows = this.emAvailablePanel.getSelectedGridRows();
		var len = rows.length;
		
		if(len>0&&this.isDateNotModified()){
			var selectedEmIds = [];
			
			for ( var i = 0; i < len; i++) {
				//check the employee whether could be assigned to the team
				this.validateEmployeesAndAssign(rows[i].record["em.em_id"]);
				
			}
			//display employees on team and available employees
			this.refreshEmployeesTab(false, true);

			//disable 'add selected' button
			this.emAvailablePanel.actions.get("addSelected").enable(false);
		}
    	
    },
    
    
    /**
     * assign single employee to a team
     */
    emAvailablePanel_onAdd: function(row) {
    	
    	var selectedEmId = row.record['em.em_id'];
    	
    	if(this.isDateNotModified()){
        	//check the employee whether could be assigned to the team
        	this.validateEmployeesAndAssign(selectedEmId);
    		//display employees on team and available employees
    		this.refreshEmployeesTab(false, true);
    	}

    },
    
    /**
     * check the date whether modified by accident after execute filter 
     */
    isDateNotModified: function(){
    	var filterValues = this.getFieldsValueOfFilter();
    	if(this.fromDateInFilter == filterValues.fromDate && 
    			this.toDateInFilter == filterValues.toDate){
    		return true;
    	}else{
    		View.alert(getMessage('addEmErrorMessage'));
    	}
    	
    	return false;
    },
    
    /**
     * execute assign operation
     */
    validateEmployeesAndAssign: function(selectedEmId){

    	//get actual date rather than using this.getDateRangeOfFilter();
    	var startDate = View.panels.get("employeeFilterOptions").getFieldValue("team.date_start");
    	var endDate = View.panels.get("employeeFilterOptions").getFieldValue("team.date_end");

		
    	var teamId = this.teamId;
    	var emId = selectedEmId;
    	
		//could add to team
		if(!valueExistsNotEmpty(endDate)){
			endDate = null;
		}
		var record = new Ab.data.Record({
            'team.team_id': teamId,
            'team.em_id': emId,
            'team.date_start': startDate,
            'team.date_end': endDate,
            'team.source_table': "em"
        }, true);
        try {
            //This action will insert a new record into the team table.				
            var result = this.team_ds.saveRecord(record);
            //get primary key of newly added data
            var autonumberedId = result.getValue("team.autonumbered_id");
            //update this record by set specified columns from em table
            this.updateFromEmployees(autonumberedId, emId);
        } 
        catch (e) {
            var message = getMessage('errorSave');
            View.showMessage('error', message, e.message, e.data);
            return;
        }
    },
    
    /**
     * update specified columns of team table from em table
     * @autonumberedId newly added employee's primary key
     * @emId employee's id
     */
    updateFromEmployees: function(autonumberedId, emId){
    	try {
	    	var em_ds = View.dataSources.get("em_ds");
	    	em_ds.addParameter("emId", emId);
	    	
	    	//get value from em table
	    	var emRecord = em_ds.getRecord();
	    	var address_archive = emRecord.getValue("em.bl_id")+'-'+emRecord.getValue("em.fl_id")+'-'+emRecord.getValue("em.rm_id");
	    	var cell_num_archive = emRecord.getValue("em.cellular_number");
	    	var contact_type_archive = emRecord.getValue("em.em_std");
	    	var email_archive = emRecord.getValue("em.email");
	    	var fax_archive = emRecord.getValue("em.fax");
	    	var name_archive = "";
	    	if(valueExistsNotEmpty(emRecord.getValue("em.name_last"))&&valueExistsNotEmpty(emRecord.getValue("em.name_first"))){
	    		name_archive = trim(emRecord.getValue("em.name_last"))+', '+trim(emRecord.getValue("em.name_first"));
	    	}
	    	var phone_archive = emRecord.getValue("em.phone");
	    	
	    	//insert the value to team table 
	    	var record = new Ab.data.Record();
	    	record.setValue('team.autonumbered_id', autonumberedId);
	    	record.setValue('team.address_archive', address_archive);
	    	record.setValue('team.cell_num_archive', cell_num_archive);
	    	record.setValue('team.contact_type_archive', contact_type_archive);
	    	record.setValue('team.email_archive', email_archive);
	    	record.setValue('team.fax_archive', fax_archive);
	    	record.setValue('team.name_archive', name_archive);
	    	record.setValue('team.phone_archive', phone_archive);
	    	record.isNew = false;
	    	record.setOldValue('team.autonumbered_id', autonumberedId);
            //This action will insert a new record into the team table.				
            this.team_ds.saveRecord(record);
        } catch (e) {
            var message = getMessage('errorSave');
            View.showMessage('error', message, e.message, e.data);
            return;
        }
    },
    
    /**
     * Filters the employees.
     */
	employeeFilterOptions_onFilterEmployees: function() {
		
		var startDate = this.employeeFilterOptions.getFieldValue("team.date_start");
		//set from date to asOfDate if from date is not empty
		if(valueExistsNotEmpty(startDate)){
			this.asOfDate = startDate;
		}
		
		this.refreshEmployeesTab(false, true);
		
    },
    
    /**
     * combine filter field value into an object
     */
    getFieldsValueOfFilter: function() {
    	var filterValues = {};
    	
    	filterValues.blId = this.employeeFilterOptions.getFieldValue("rm.bl_id");
    	filterValues.flId = this.employeeFilterOptions.getFieldValue("rm.fl_id");
    	filterValues.rmId = this.employeeFilterOptions.getFieldValue("rm.rm_id");
    	filterValues.emId = this.employeeFilterOptions.getFieldValue("em.em_id");
    	filterValues.dvId = this.employeeFilterOptions.getFieldValue("em.dv_id");
    	filterValues.dpId = this.employeeFilterOptions.getFieldValue("em.dp_id");
    	filterValues.teamId = this.employeeFilterOptions.getFieldValue("team.team_id");
    	var dateRange = this.getDateRangeOfFilter();
    	filterValues.fromDate = dateRange.startDate;
    	filterValues.toDate = dateRange.endDate;
		
    	return filterValues;
    },
    
    /**
     * refresh employees tab
     * @param isInitial
     * @param isRecalculate
     */
	refreshEmployeesTab: function(isInitial, isRecalculate) {
		
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE),config = {
	    	    interval: 500
    	});
		
		this.refreshEmployeesTabAfterOpenProgressBar.defer(500, this, [isInitial, isRecalculate]);
		
	},
	
    /**
     * refresh employees tab
     * @param isInitial
     * @param isRecalculate
     */
	refreshEmployeesTabAfterOpenProgressBar: function(isInitial, isRecalculate){
		try {
			
			var filterValues = this.getFieldsValueOfFilter();
			
			var parameters = this.composeParameters(filterValues, isInitial);
			
			this.setParameters(parameters);
			
			this.displayEmployeesOnTeam();
			
			this.displayAvailableEmployees();
			
			//recalculate statistics after click the show button
			var fromDateField = this.employeeFilterOptions.getFieldValue("team.date_start");
			if(isRecalculate && !isInitial && valueExistsNotEmpty(filterValues.fromDate)&& valueExistsNotEmpty(fromDateField)){
				this.calculateStatistics(filterValues.fromDate);
			}
	
			//store from date to check consistency when adding
			this.fromDateInFilter = filterValues.fromDate;
			
			//store to date to check consistency when adding
			this.toDateInFilter = filterValues.toDate;
				
			//hide edit employee form
			this.editMembershipDatePanel.show(false);
			
			View.closeProgressBar();
		} catch (e) {
			View.closeProgressBar();
			View.showMessage('error', '', e.message, e.data);
		}
	},
	
	 /**
     * set parameters to panel's data source
     * @param parameters
     */
	setParameters: function(parameters) {
		
		this.emPanel.addParameter('asOfDate', this.asOfDate);
    	this.emPanel.addParameter('emLocation', parameters.emLocation);
    	this.emPanel.addParameter('emId', parameters.emId);
    	this.emPanel.addParameter('emOrg', parameters.emOrg);
    	this.emPanel.addParameter('additionalTeam', parameters.additionalTeam4EmployeesOnTeam);
    	this.emPanel.addParameter('fromDate', parameters.fromDate);
    	this.emPanel.addParameter('toDate', parameters.toDate);
    	this.emPanel.addParameter('isInitial', parameters.isInitial);
    	this.emPanel.addParameter('editTeamId', parameters.editTeamId);
    	
		this.emAvailablePanel.addParameter('asOfDate', this.asOfDate);
    	this.emAvailablePanel.addParameter('emLocation', parameters.emLocation);
    	this.emAvailablePanel.addParameter('emId', parameters.emId);
    	this.emAvailablePanel.addParameter('emOrg', parameters.emOrg);
    	this.emAvailablePanel.addParameter('additionalTeam', parameters.additionalTeam4AvailableEmployees);
    	this.emAvailablePanel.addParameter('fromDate', parameters.fromDate);
    	this.emAvailablePanel.addParameter('toDate', parameters.toDate);
    	this.emAvailablePanel.addParameter('isInitial', parameters.isInitial);
    	this.emAvailablePanel.addParameter('editTeamId', parameters.editTeamId);
    	
	},
	
	/**
     * show employees on team according to as of date
     */
    displayEmployeesOnTeam: function(){
		
		this.emPanel.refresh();
		this.emPanel.show();
    },
    
	/**
	 * show available employees
	 */
	displayAvailableEmployees: function(){

		this.emAvailablePanel.refresh();
		this.emAvailablePanel.show();
	},
	
	/**
     * get the sql statement according to the filter fields
     * @param filterValues
     * @param isInitial
     * @return parameters
     */
	composeParameters: function(filterValues, isInitial) {

		var parameters = {};
		var emLocation = "1=1", emId = "1=1", emOrg="1=1", additionalTeam4EmployeesOnTeam="1=1", 
		additionalTeam4AvailableEmployees="1=1", fromDate="1=1", toDate="1=1";
		
		//parameter for emLocation
		if (valueExistsNotEmpty(filterValues.blId)){
			var blRes = getFieldRestrictionById('em.bl_id', filterValues.blId); 
			emLocation += " and " + blRes
    	}
    	if (valueExistsNotEmpty(filterValues.flId)){
    		var flRes = getFieldRestrictionById('em.fl_id', filterValues.flId); 
    		emLocation += " and " + flRes; 
    	}
    	if (valueExistsNotEmpty(filterValues.rmId)){
			var rmRes = getFieldRestrictionById('em.rm_id', filterValues.rmId); 
			emLocation += " and " + rmRes;
    	}
    	parameters.emLocation = emLocation;
    	
    	//parameter for emId
    	if (valueExistsNotEmpty(filterValues.emId))
    	{
    		emId = getFieldRestrictionById('em.em_id', filterValues.emId); 
    	}
    	parameters.emId = emId;
    	
    	//parameter for emOrg
    	if (valueExistsNotEmpty(filterValues.dpId))
    	{
			var dpRes = getFieldRestrictionById('em.dp_id', filterValues.dpId); 
			emOrg += " and " + dpRes;
    	}
    	if (valueExistsNotEmpty(filterValues.dvId))
    	{	
			var dvRes = getFieldRestrictionById('em.dv_id', filterValues.dvId); 
			emOrg += " and " + dvRes;
    	}
    	parameters.emOrg = emOrg;
    	
    	//parameter for additionalTeam
    	if (valueExistsNotEmpty(filterValues.teamId)) 
		{ 
    		var dateRange = this.getDateRangeOfFilter();
    		var startDate = dateRange.startDate;
    		var endDate = dateRange.endDate;
    		
    		//kb# 3053473: add date range restriction for ‘Additional Teams’ column in employees tab’s filter.
    		var dateRes = " and (${sql.yearMonthDayOf('t.date_start')} <='"+endDate+"' and ( t.date_end is null or ${sql.yearMonthDayOf('t.date_end')}>='"+startDate+"'))";
    		
    		additionalTeam4EmployeesOnTeam ="EXISTS (select 1 from team t where "+getFieldRestrictionById('t.team_id', filterValues.teamId)+" and t.em_id = team.em_id"+ dateRes +")"; 
    		additionalTeam4AvailableEmployees = "EXISTS (select 1 from team t where "+getFieldRestrictionById('t.team_id', filterValues.teamId)+" and t.em_id = em.em_id"+ dateRes +")";
		}
    	parameters.additionalTeam4EmployeesOnTeam = additionalTeam4EmployeesOnTeam;
    	parameters.additionalTeam4AvailableEmployees = additionalTeam4AvailableEmployees;
    	
    	//parameter for fromDate
    	parameters.fromDate = filterValues.fromDate;
    	
    	//parameter for toDate
    	parameters.toDate = filterValues.toDate;
    	
    	parameters.isInitial = isInitial;
    	parameters.editTeamId = this.teamId;
		
		return parameters;
	},
	
	/**
	 * get employees records for preparing sql statement
	 */
	getEmployeesRecords: function(con){
		this.employee_on_team_ds.addParameter('conForTeamsTab', con);
		var records = this.employee_on_team_ds.getRecords();
		var emId = "";
		for(var i = 0; i < records.length; i++) {
			var record = records[i];
			emId += "'"+record.getValue('em.em_id')+"',";
		}
		return emId.substring(0,emId.length-1);
	},
		
    /**
     * Clears the employees filter.
     */
	employeeFilterOptions_onClearFields: function() {
        this.clearFields();
    },	
	
    /**
     * Clears the employees filter.
     * @isOnDefineTeams clear all fields except from date fields if refreshed on define teams
     */
	clearFields: function(isOnDefineTeams){
		this.clearNormalFields();
    	
    	if(isOnDefineTeams){
    		this.employeeFilterOptions.setFieldValue("team.date_start",getCurrentDateInISOFormat());
    		this.employeeFilterOptions.setFieldValue("team.date_end","");
    		
    	}else{
    		//query again after clear the fields
    		this.refreshEmployeesTab(false, true);
    	}
	},
	
	/**
     * Clears the fields except date range.
     */
	clearNormalFields: function(){
    	this.employeeFilterOptions.setFieldValue("rm.bl_id","");
    	this.employeeFilterOptions.setFieldValue("rm.fl_id","");
    	this.employeeFilterOptions.setFieldValue("rm.rm_id","");
    	this.employeeFilterOptions.setFieldValue("em.em_id","");
    	this.employeeFilterOptions.setFieldValue("em.dv_id","");
    	this.employeeFilterOptions.setFieldValue("em.dp_id","");
    	this.employeeFilterOptions.setFieldValue("team.team_id","");
	},
	
    /**
     * get as of date from team space console's filter .
     */
	getCurrentAsOfDate: function(){
		var currentAsOfDate = "";
		var teamEditController = View.getOpenerView().controllers.get('teamEditController');
		if(valueExistsNotEmpty(teamEditController)){
			currentAsOfDate = teamEditController.asOfDate;
		}
		else{
			currentAsOfDate = getCurrentDateInISOFormat();
		}
		return currentAsOfDate;
	},
	
	/**
	 * invoked by define teams after select a new team and select this tab
	 * @param isInitial
	 * @param teamId
	 */
	refreshPanels: function(isInitial,teamId){
		this.teamId = teamId;
		this.refreshEmployeesTab(isInitial, true);
	},
	
	/**
	 * refresh panel for define teams
	 * @param isInitial
	 * @param teamId
	 */
	refreshPanelsForDefineTeams: function(isInitial, teamId){
		this.refreshPanels(isInitial, teamId);
		
		//clear filter fields after refresh
		this.clearFields(true);
		
	},
	
	/**
	 * refresh panel for edit teams
	 * @param asOfDate get from statistics panel
	 */
	refreshPanelsForEditTeams: function(asOfDate){
		this.asOfDate = asOfDate;
		this.clearNormalFields();
		this.employeeFilterOptions.setFieldValue("team.date_start",this.asOfDate);
		this.employeeFilterOptions.setFieldValue("team.date_end","");
		
		this.refreshEmployeesTab(false, true);
		
	},
	
	/**
	 * get from date and to date of filter
	 * @return dateRange object
	 */
	getDateRangeOfFilter : function(){
		var dateRange = {};
		dateRange.startDate = this.employeeFilterOptions.getFieldValue("team.date_start")==""?constantClass.getConstants('earlyDate'):this.employeeFilterOptions.getFieldValue("team.date_start");
		dateRange.endDate = this.employeeFilterOptions.getFieldValue("team.date_end")==""?constantClass.getConstants('lateDate'):this.employeeFilterOptions.getFieldValue("team.date_end");
    	return dateRange;
	}

});
