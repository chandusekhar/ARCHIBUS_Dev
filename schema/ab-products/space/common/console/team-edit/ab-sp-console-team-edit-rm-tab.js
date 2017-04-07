/**
 * Controller for the Rooms tab.
 * @Author Jikai Xu
 *
 * Events:
 * app:teamspace:editteam:changedate
 */
var rmOnTeamController = View.createController('rmOnTeamController',{
	
	teamId:"",
	
	asOfDate: "",
	
	//store the from date to check when adding employees
	fromDateInFilter:"",
	
	//store the to date to check when adding employees
	toDateInFilter:"",
	
    /**
     * Initializing
     */
	afterInitialDataFetch : function(){
		this.teamId =View.getOpenerView().parameters['teamId'];
		
		//fetch teamId from team properties when adding teams
		if(!valueExistsNotEmpty(this.teamId)){
			
			this.teamId = View.parentTab.parentPanel.tabs[0].
			getContentFrame().View.controllers.get('employeeOnTeamController').teamId;
			
		}

		var statisticsForm = View.getOpenerView().panels.get('statisticsForm');
		this.asOfDate = statisticsForm.getFieldValue('team_properties.stat_date');
		
		this.rmFilterOptions.setFieldValue("rm_team.date_start", this.asOfDate);
		this.rmFilterOptions.setFieldValue("rm_team.date_end", "");
		
		//display rooms on team and available tabs
		this.refreshRoomsTab(true, true);
		
		//set asOfDate to check when adding 
		this.fromDateInFilter = this.asOfDate;
		
		//add unit for area
		jQuery("#area").siblings("span").html(View.user.areaUnits.title);

		//disable 'add selected' button
		this.rmAvailablePanel.actions.get("addSelected").enable(false);
		
	},

	/**
	 * calculate the statistics
	 */
	calculateStatistics: function(selectedDate){
		var teamEditController = View.getOpenerView().controllers.get('teamEditController');
		
		//not for define teams
		if(teamEditController){
			teamEditController.calculateStatistics(selectedDate);
		}
		
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
				View.panels.get("rmFilterOptions").setFieldValue("rm_team.date_end",startDate);
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
				View.panels.get("rmFilterOptions").setFieldValue("rm_team.date_start",endDate);
			}
		}
		
	},
	
	/**
	 * delete the clicked item
	 */
	rmPanel_onRemove: function(row) {
		var rm_team_id = row.record['rm_team.rm_team_id.key'];
		var restriction = new Ab.view.Restriction();
		restriction.addClause('rm_team.rm_team_id', rm_team_id, '=');
		var record =  this.rm_team_ds.getRecord(restriction);
		if(record)
		{
			this.rm_team_ds.deleteRecord(record);
			this.refreshRoomsTab(false, false);
			this.calculateStatistics("refreshOnCurrentAsOfDate");
		}
	
	},
	
	/**
	 * delete selected rooms
	 */
	onRemoveSelectedRooms : function()
	{
		try{
			
			var rows = this.rmPanel.getSelectedGridRows();
			var len = rows.length;
			var selectedRmIds = "";
			for ( var i = 0; i < len; i++) {
				var restriction = new Ab.view.Restriction();
				restriction.addClause('rm_team.rm_team_id', rows[i].record["rm_team.rm_team_id.key"], '=');
				var record =  this.rm_team_ds.getRecord(restriction);
				if(record)
				{
					this.rm_team_ds.deleteRecord(record);
				}
			}

			this.editRoomDatePanel.show(false);
			this.refreshRoomsTab(false, false);
			this.calculateStatistics("refreshOnCurrentAsOfDate");
			
		}catch(e){
			View.showMessage('error', '', e.message, e.data);
		}
		
	},	
	
	/**
	 * save start date and end date for selected rooms
	 */
	onSaveSelectedRooms : function()
	{
		try{
			
			var startDate = this.editRoomDatePanel.getFieldElement("edit_form.rm_team.date_start").value;
			var endDate = this.editRoomDatePanel.getFieldElement("edit_form.rm_team.date_end").value;
			
			if(startDate!==attachAngleBracket(getMessage('varies'))){
				startDate = this.editRoomDatePanel.getFieldValue("edit_form.rm_team.date_start");
			}
			
			if(endDate!==attachAngleBracket(getMessage('varies'))){
				endDate = this.editRoomDatePanel.getFieldValue("edit_form.rm_team.date_end");
			}
			
			//validate date range
			if(!this.validateDateRange(startDate, endDate)){
				return;
			}
			
			//save date range to room  
			this.saveDateRange(startDate, endDate);
			
		}catch(e){
			View.showMessage('error', '', e.message, e.data);
		}
	},

	/**
	 * validate date range 
	 * @param startDate
	 * @param endDate
	 * @return true or false
	 */
	validateDateRange: function(startDate, endDate){
		var rows = this.rmPanel.getSelectedGridRows();
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
				if (compareISODates(endDate,rows[i].record["rm_team.date_start"]==''?constantClass.getConstants('earlyDate'):rows[i].record["rm_team.date_start.raw"].substring(0,10))){
					// display the error message defined in AXVW as message element
					View.alert(getMessage('error_date_range'));
					return false;
				}
			}
		}else if(valueExistsNotEmpty(startDate) && valueExistsNotEmpty(endDate) && startDate!=attachAngleBracket(getMessage('varies'))&& endDate==attachAngleBracket(getMessage('varies'))){
			for ( var i = 0; i < len; i++) {
				if (compareISODates(rows[i].record["rm_team.date_end"]==''?constantClass.getConstants('lateDate'):rows[i].record["rm_team.date_end.raw"].substring(0,10),startDate)){
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
	 * save date range and to room
	 * @param startDate
	 * @param endDate
	 */
	saveDateRange: function(startDate, endDate){
		//save date to room
		var rows=this.rmPanel.getSelectedGridRows()
		var roomsWithDateConflicts = "";
		var isItemSaved = false;
		for (var i=0;i<rows.length;i++){
			
			//validate the date range to check whether the room has been added to this team at this date range
			var blId = rows[i].record["rm_team.bl_id"];
			var flId = rows[i].record["rm_team.fl_id"];
			var rmId = rows[i].record["rm_team.rm_id"];
			var teamId = rows[i].record["rm_team.team_id"];
			var rm_team_id = rows[i].record["rm_team.rm_team_id"];
			//Check date range when varies
			var isDateValidate = this.validateDateRangeBeforeSave(rm_team_id, blId, flId, rmId, 
					teamId, startDate, endDate, rows[i].record["rm_team.date_start"]==''?constantClass.getConstants('earlyDate'):rows[i].record["rm_team.date_start.raw"].substring(0,10), 
							rows[i].record["rm_team.date_end"]==''?constantClass.getConstants('lateDate'):rows[i].record["rm_team.date_end.raw"].substring(0,10));
			if(!isDateValidate){
				roomsWithDateConflicts += blId+"-"+flId+"-"+rmId+"|"
				continue;
			}
			
			var rec = new Ab.data.Record();
            rec.isNew = false;
            rec.setValue("rm_team.rm_team_id", rows[i].record["rm_team.rm_team_id"]);
            
			if (startDate != attachAngleBracket(getMessage('varies'))&&valueExistsNotEmpty(startDate)) {
				//startDate = this.editRoomDatePanel.getFieldElement("edit_form.rm_team.date_start").value;
				rec.setValue("rm_team.date_start", startDate);
			}
			//allow empty end date 
			if (endDate != attachAngleBracket(getMessage('varies'))) {
				//endDate = this.editRoomDatePanel.getFieldElement("edit_form.rm_team.date_end").value;
				rec.setValue("rm_team.date_end", endDate);
			}
            
            rec.oldValues = new Object();
            rec.oldValues["rm_team.rm_team_id"] = rows[i].record["rm_team.rm_team_id"];
            if(rows[i].record["rm_team.date_start.raw"]){
            	rec.oldValues["rm_team.date_start"] = rows[i].record["rm_team.date_start.raw"];
            }
            if(rows[i].record["rm_team.date_end.raw"]){
            	rec.oldValues["rm_team.date_end"] = rows[i].record["rm_team.date_end.raw"];
            }
            
            this.rm_team_ds.saveRecord(rec);
			
			isItemSaved = true;
		}
		
		if(valueExistsNotEmpty(roomsWithDateConflicts)){
			roomsWithDateConflicts = roomsWithDateConflicts.substring(0,roomsWithDateConflicts.length-1);
			View.alert(getMessage('date_range_overlap').replace("{0}", roomsWithDateConflicts));
		}
		//refresh grid if one of selected items successfully saved
		if(isItemSaved){
			this.editRoomDatePanel.show(false);
			this.refreshRoomsTab(false, false);
			this.calculateStatistics("refreshOnCurrentAsOfDate");
		}
	},
	
	/**
	 * validate the date range for an room
	 * @param rm_team_id
	 * @param blId
	 * @param flId
	 * @param rmId
	 * @param teamId
	 * @param startDate
	 * @param endDate
	 * @param selectedStartDate 
	 * @param selectedEndDate
	 * @return true if no overlap, false if overlap
	 */
	validateDateRangeBeforeSave: function(rm_team_id, blId, flId, rmId, teamId, startDate, endDate, selectedStartDate, selectedEndDate){
		var isValid = true;
		var isRmOnTeam = " rm_team.bl_id ='"+blId+"' and rm_team.fl_id ='"+flId+"' and rm_team.rm_id ='"+rmId+"' and rm_team.team_id='"+teamId+"'";
		
    	if(startDate!=attachAngleBracket(getMessage('varies'))&&endDate!=attachAngleBracket(getMessage('varies'))){
			if(valueExistsNotEmpty(endDate)){
				isRmOnTeam += " and (${sql.yearMonthDayOf('rm_team.date_start')} <='"+endDate+"' and ( rm_team.date_end is null or ${sql.yearMonthDayOf('rm_team.date_end')}>='"+startDate+"'))";
    	
			}else{
				isRmOnTeam += " and (rm_team.date_end is null or ${sql.yearMonthDayOf('rm_team.date_end')}>='"+startDate+"') ";
    	
			}
		}else if(startDate!=attachAngleBracket(getMessage('varies'))&&endDate==attachAngleBracket(getMessage('varies'))){
			isRmOnTeam += " and (${sql.yearMonthDayOf('rm_team.date_start')} <='"+selectedEndDate+"' and ( rm_team.date_end is null or ${sql.yearMonthDayOf('rm_team.date_end')}>='"+startDate+"'))";
    	
		}else if(startDate==attachAngleBracket(getMessage('varies'))&&endDate!=attachAngleBracket(getMessage('varies'))){
			if(valueExistsNotEmpty(endDate)){
				isRmOnTeam += " and (${sql.yearMonthDayOf('rm_team.date_start')} <='"+endDate+"' and ( rm_team.date_end is null or ${sql.yearMonthDayOf('rm_team.date_end')}>='"+selectedStartDate+"'))";
    	
			}else{
				isRmOnTeam += " and (rm_team.date_end is null or ${sql.yearMonthDayOf('rm_team.date_end')}>='"+selectedStartDate+"') ";
    	
			}
		}
		else{
			//if both start date and end date are <VARIES>, return true
			return isValid;
		}    	
    	
    	this.checkRmOnTeam_ds.addParameter('isRmOnTeam', isRmOnTeam);
    	var records = this.checkRmOnTeam_ds.getRecords();
		//iterate the records to check whether having different items in the previous query. if not, could save.
    	for (var i=0;i<records.length;i++){
			
    		if(records[i].getValue("rm_team.rm_team_id")!=rm_team_id){
    			isValid = false;
    		}
		}
    	
    	return isValid;
	},
	
	/**
	 * edit selected item(s)
	 */
	rmPanel_onMultipleSelectionChange: function() {
		
		//use getSelectedRecords rather than getSelectedRows to get raw area value(without comma or other format) to calculate
		var records = this.rmPanel.getSelectedRecords();
	    
	    if(records.length>0)
    	{
	    	var fields = ['rm_team.location','rm_team.organization','rm.area','rm_team.date_start','rm_team.date_end'];
	    	var elements = ['rm_team.location','rm_team.organization','rm.area','edit_form.rm_team.date_start','edit_form.rm_team.date_end'];
		    var fldHtmlId = ['ShoweditRoomDatePanel_rm_team.location','ShoweditRoomDatePanel_rm_team.organization','editRoomDatePanel_rm.area','editRoomDatePanel_edit_form.rm_team.date_start','editRoomDatePanel_edit_form.rm_team.date_end'];
	    	for ( var i = 0; i < fields.length; i++) {
				this.setFieldValue(fields[i], elements[i], records, fldHtmlId[i]);
			}
	    	this.editRoomDatePanel.show(true);
    	}
	    else
    	{
	    	this.editRoomDatePanel.clear();
	    	this.editRoomDatePanel.show(false);
    	}
	    
	},	   
	
	/**
	 * set field value in the form for multiple records
	 */
	setFieldValue : function(fieldName, elementName, records, fldHtmlId) {
		var fieldValue = records[0].getValue(fieldName);
		var area = 0;
		for ( var i = 0; i < records.length; i++) {
			if (records[i].getValue(fieldName) instanceof Date){
				//if date object, transform to string and then compare 
				var formatDate1 = "", formatDate2 = "";
				if(valueExistsNotEmpty(fieldValue)){
					formatDate1 = getIsoFormatDate(fieldValue);
				}
				if(valueExistsNotEmpty(records[i].getValue(fieldName))){
					formatDate2 = getIsoFormatDate(records[i].getValue(fieldName));
				}
				
				if(formatDate1 != formatDate2) {
					fieldValue = attachAngleBracket(getMessage('varies'));
					break;
				}
			}else {
				//not date object
				if(records[i].getValue(fieldName) != fieldValue) {
					fieldValue = attachAngleBracket(getMessage('varies'));
					break;
				}
			}
		}
		
		if(fieldValue == attachAngleBracket(getMessage('varies')))
		{
			if(fldHtmlId.indexOf('date')>0)
			{
				//kb# 3052896: set property onblur of date input to null to 
				//avoid resetting the ‘<VARIES>’ string to a current date when losing focus on the date input.
				$(fldHtmlId).onblur = null;
				$(fldHtmlId).value = fieldValue;
			}
			else
			{
				if(fldHtmlId.indexOf('area')>0)
				{
					$(fldHtmlId).value = area;
				}
				else{
					$(fldHtmlId).innerText = fieldValue;
				}
			}
			
		}
		else
		{
			
			if(fldHtmlId.indexOf('date')>0)
			{
				//because used getSelectedRecords, the date field is a date object, have to convert date object to date string
				var formatDate = "";
				if(valueExistsNotEmpty(fieldValue)){
					formatDate = getIsoFormatDate(fieldValue);
				}
				this.editRoomDatePanel.setFieldValue(elementName, formatDate, formatDate, false);
				
			}else{
				
				this.editRoomDatePanel.setFieldValue(elementName, fieldValue, fieldValue, false);
			}
			
		}
		
		if(fieldName.indexOf('area')>0){
			for(i=0;i<records.length;i++){
				area = Number(area) + Number(records[i].getValue(fieldName));
			}
			area = area.toFixed(2);
			this.editRoomDatePanel.setFieldValue('rm.area', this.rooms_on_team_ds.formatValue("rm.area", area, true));
		}
		
	},
	
    /**
     * unselect the checkbox when cancel the form
     */
	onHideForm: function() {
		var rows = this.rmPanel.getSelectedGridRows();
		for ( var i = 0; i < rows.length; i++) {
			rows[i].unselect();
		}
	},
	
    /**
     * change the add selected button's state according to selected rooms
     */
	rmAvailablePanel_onMultipleSelectionChange: function(row) {
		
	    var rows = this.rmAvailablePanel.getSelectedGridRows();
	    
	    if(rows.length>0){
	    	this.rmAvailablePanel.actions.get("addSelected").enable(true);
	    }else{
	    	this.rmAvailablePanel.actions.get("addSelected").enable(false);
	    }
	},
	
    /**
     * assign multiple selected rooms to a team
     */
    rmAvailablePanel_onAddSelected: function(){
    	var rows = this.rmAvailablePanel.getSelectedGridRows();
		var len = rows.length;
		if(len>0&&this.isDateNotModified()){
			
			for ( var i = 0; i < len; i++) {
				//check the room whether could be assigned to the team
				this.validateRoomsAndAssign(rows[i].record["rm.bl_id"], rows[i].record["rm.fl_id"], rows[i].record["rm.rm_id"]);
			}
	                
			//refresh rooms on team 
			this.refreshRoomsTab(false, true);
			
			//disable 'add selected' button
			this.rmAvailablePanel.actions.get("addSelected").enable(false);
			
		}
    },
    
    /**
     * assign single room to a team
     */
    rmAvailablePanel_onAdd: function(row) {
    	var selectedBlId = row.record['rm.bl_id'];
    	var selectedFlId = row.record['rm.fl_id'];
    	var selectedRmId = row.record['rm.rm_id'];
    	
    	if(this.isDateNotModified()){
    		//check the room whether could be assigned to the team
        	this.validateRoomsAndAssign(selectedBlId, selectedFlId, selectedRmId);
                    
    		//refresh rooms on team 
    		this.refreshRoomsTab(false, true);
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
    validateRoomsAndAssign: function(selectedBlId, selectedFlId, selectedRmId){
    	//get actual date rather than using this.getDateRangeOfFilter();
    	var startDate = View.panels.get("rmFilterOptions").getFieldValue("rm_team.date_start");
    	var endDate = View.panels.get("rmFilterOptions").getFieldValue("rm_team.date_end");
		
    	var teamId = this.teamId;
    	var blId = selectedBlId;
    	var flId = selectedFlId;
    	var rmId = selectedRmId;
    		
		//could add to team
		if(!valueExistsNotEmpty(endDate)){
			endDate = null;
		}
		var record = new Ab.data.Record({
            'rm_team.team_id': teamId,
            'rm_team.bl_id': blId,
            'rm_team.fl_id': flId,
            'rm_team.rm_id': rmId,
            'rm_team.date_start': startDate,
            'rm_team.date_end': endDate
        }, true);
        try {
            //This action will insert a new record into the rm_team table.				
            this.rooms_on_team_ds.saveRecord(record);
        } 
        catch (e) {
        	
            var message = getMessage('errorSave');
            View.showMessage('error', message, e.message, e.data);
            return;
        }
    },
    
    /**
     * Filters the rooms.
     */
	rmFilterOptions_onFilterRooms: function() {
		
		//validate custom area field
		if(!isNumeric(Ext.get('area').dom.value)){
			
    		var message = View.getLocalizedString(Ab.form.Form.z_MESSAGE_INVALID_NUMERIC);
			message = String.format(message, this.rmFilterOptions.fields.get('area').fieldDef.title);
			View.alert(message);
			
			Ext.get('area').dom.value = "";
			
    	}else{
    		var startDate = this.rmFilterOptions.getFieldValue("rm_team.date_start");

    		//set from date to asOfDate if from date is not empty
    		if(valueExistsNotEmpty(startDate)){
    			this.asOfDate = startDate;
    		}
    		
    		this.refreshRoomsTab(false, true);
    	}
		
		
    },
    
    /**
     * combine filter field value into an object
     */
    getFieldsValueOfFilter: function() {
    	var filterValues = {};
    	
    	filterValues.blId = this.rmFilterOptions.getFieldValue("rm.bl_id");
    	filterValues.flId = this.rmFilterOptions.getFieldValue("rm.fl_id");
    	filterValues.rmId = this.rmFilterOptions.getFieldValue("rm.rm_id");
    	filterValues.area = Ext.get('area').dom.value;
    	//transform localized number to standard type if it is a valid number, or set to zero
		if(isNumeric(filterValues.area)){
			filterValues.area = replaceLocalizedDecimalSeparatorByDot(filterValues.area);
		}else{
			Ext.get('area').dom.value = "";
			filterValues.area = 0;
		}
		var dateRange = this.getDateRangeOfFilter();
		filterValues.fromDate = dateRange.startDate;;
    	filterValues.toDate = dateRange.endDate;
		
    	return filterValues;
    },
    
    /**
     * refresh rooms tab
     * @param isInitial
     * @param isRecalculate
     */
	refreshRoomsTab: function(isInitial, isRecalculate) {
		
		View.openProgressBar(View.getLocalizedString(this.z_PROGRESS_MESSAGE),config = {
    	    interval: 500
		});
	
		this.refreshRoomsTabAfterOpenProgressBar.defer(500, this, [isInitial, isRecalculate]);
		
	},
	
    /**
     * refresh rooms tab
     * @param isInitial
     * @param isRecalculate
     */
	refreshRoomsTabAfterOpenProgressBar: function(isInitial, isRecalculate){
		try {
			
			var filterValues = this.getFieldsValueOfFilter();
			
    		var parameters = this.composeParameters(filterValues, isInitial);
			
			this.setParameters(parameters);
			
			this.displayRoomsOnTeam();
			
			this.displayAvailableRooms();
			
			//recalculate statistics after click the show button
			var fromDateField = this.rmFilterOptions.getFieldValue("rm_team.date_start");
			if(isRecalculate && valueExistsNotEmpty(filterValues.fromDate) && valueExistsNotEmpty(fromDateField)){
				this.calculateStatistics(filterValues.fromDate);
			}
			
			//store from date to check consistency when adding
			this.fromDateInFilter = filterValues.fromDate;
			
			//store to date to check consistency when adding
			this.toDateInFilter = filterValues.toDate;
				
			View.closeProgressBar();
			
		} catch (e) {
			View.closeProgressBar();
		}
	},
	
	 /**
     * set parameters to panel's data source
     * @param parameters
     */
	setParameters: function(parameters) {
		
		this.rmPanel.addParameter('asOfDate', this.asOfDate);
    	this.rmPanel.addParameter('emLocation', parameters.emLocation);
    	this.rmPanel.addParameter('area', parameters.area);
    	this.rmPanel.addParameter('fromDate', parameters.fromDate);
    	this.rmPanel.addParameter('toDate', parameters.toDate);
    	this.rmPanel.addParameter('isInitial', parameters.isInitial);
    	this.rmPanel.addParameter('editTeamId', parameters.editTeamId);
    	this.rmPanel.addParameter('operator', parameters.operator);
    	this.rmPanel.addParameter('areaRestriction', parameters.areaRestriction);
    	
		this.rmAvailablePanel.addParameter('asOfDate', this.asOfDate);
    	this.rmAvailablePanel.addParameter('emLocation', parameters.emLocation);
    	this.rmAvailablePanel.addParameter('area', parameters.area);
    	this.rmAvailablePanel.addParameter('fromDate', parameters.fromDate);
    	this.rmAvailablePanel.addParameter('toDate', parameters.toDate);
    	this.rmAvailablePanel.addParameter('isInitial', parameters.isInitial);
    	this.rmAvailablePanel.addParameter('editTeamId', parameters.editTeamId);
    	this.rmAvailablePanel.addParameter('operator', parameters.operator);
    	this.rmAvailablePanel.addParameter('areaRestriction', parameters.areaRestriction);
	},	
	
	/**
     * get the sql statement according to the filter fields
     * @param filterValues
     * @param isInitial
     * @return parameters
     */
	composeParameters: function(filterValues, isInitial) {

		var parameters = {};
		var emLocation = "1=1", fromDate="1=1", toDate="1=1", areaRestriction="1=1", conversionFactor=1;
		
		//identify whether the units of database and system are the same
		if(View.user.displayUnits != View.project.units){
			conversionFactor= parseFloat(View.user.areaUnits.conversionFactor);
		}
		
		//parameter for emLocation
		if (valueExistsNotEmpty(filterValues.blId)){
			var blRes = getFieldRestrictionById('rm.bl_id', filterValues.blId); 
			emLocation += " and " + blRes
    	}
    	if (valueExistsNotEmpty(filterValues.flId)){
    		var flRes = getFieldRestrictionById('rm.fl_id', filterValues.flId); 
    		emLocation += " and " + flRes; 
    	}
    	if (valueExistsNotEmpty(filterValues.rmId)){
			var rmRes = getFieldRestrictionById('rm.rm_id', filterValues.rmId); 
			emLocation += " and " + rmRes;
    	}
    	parameters.emLocation = emLocation;
    	
    	//parameter for area
    	if (valueExistsNotEmpty(filterValues.area))
    	{
    		operator = Ext.get('totalAreaOp').dom.value;
    		areaRestriction = " rm.area " + operator + " " + parseFloat(filterValues.area)*conversionFactor;
    	}
    	parameters.areaRestriction  = areaRestriction;
    	
    	//parameter for fromDate
    	parameters.fromDate = filterValues.fromDate;
    	
    	//parameter for toDate
    	parameters.toDate = filterValues.toDate;
    	
    	parameters.isInitial = isInitial;
    	parameters.editTeamId = this.teamId;
		
		return parameters;
	},
	
    /**
     * show rooms on team according to as of date
     */
    displayRoomsOnTeam: function(){
		
		this.rmPanel.refresh();
		this.rmPanel.show();
    },
    
	/**
	 * show available rooms
	 */
	displayAvailableRooms: function(){

		this.rmAvailablePanel.refresh();
		this.rmAvailablePanel.show();
	},
	
    /**
     * Clears the rooms filter.
     */
	rmFilterOptions_onClearFields: function() {
        this.clearFields();
        
    },
	
    /**
     * Clears the rooms filter.
     */
	clearFields: function(){
    	
		this.clearNormalFields();
    	//refresh
    	this.refreshRoomsTab(false, true);
	},
	
	/**
     * Clears the fields except date range.
     */
	clearNormalFields: function(){
		this.rmFilterOptions.setFieldValue("rm.bl_id","");
    	this.rmFilterOptions.setFieldValue("rm.fl_id","");
    	this.rmFilterOptions.setFieldValue("rm.rm_id","");
    	Ext.get('area').dom.value = '';
	},
	
	/**
	 * refresh panel for edit teams
	 * @param asOfDate get from statistics panel
	 */
	refreshPanelsForEditTeams: function(asOfDate){
		this.asOfDate = asOfDate;
		this.clearNormalFields();
		this.rmFilterOptions.setFieldValue("rm_team.date_start",this.asOfDate);
		this.rmFilterOptions.setFieldValue("rm_team.date_end","");
		
		this.refreshRoomsTab(false, true);
		
	},
	
	/**
	 * get from date and to date of filter
	 * @return dateRange object
	 */
	getDateRangeOfFilter : function(){
		var dateRange = {};
		dateRange.startDate = this.rmFilterOptions.getFieldValue("rm_team.date_start")==""?constantClass.getConstants('earlyDate'):this.rmFilterOptions.getFieldValue("rm_team.date_start");
		dateRange.endDate = this.rmFilterOptions.getFieldValue("rm_team.date_end")==""?constantClass.getConstants('lateDate'):this.rmFilterOptions.getFieldValue("rm_team.date_end");
    	return dateRange;
	},
	
    
});

