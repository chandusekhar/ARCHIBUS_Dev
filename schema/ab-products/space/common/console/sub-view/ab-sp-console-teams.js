
var teamsController = View.createController('teamsController', {

    /**
	 * The current mode the application handles.
	 */
	mode:'',
	/**
	 * The flag manifest filter with exists rm condition restriction when click filter button.
	 */
	applyExistsRmRestriction: false,
	
    /**
     * Location and occupancy restrictions applied from the filter panel.
     * This is custom filter use only for current Team tab.
     */
    rmFilter: null,
    
	/**
     * permanent sql parameter for dataSource.
     */
    teamCapacitySqlParameter: 0,
	
	/**
     * Map of team and its associated buildings.
     */
    teamBuildingMap: null,
	
	team_ratio_pct_metric_low_crit: 0,
	team_ratio_pct_metric_low_warn:0,
	team_ratio_pct_metric_high_warn:0,
	team_ratio_pct_metric_high_crit:0,

	/**
     * Maps DOM events to controller methods.
     */
    events: {
        'click #teamRestrictToLocation': function() {
            this.onCheckEvent();
        },
        'click #teamUnassigned': function() {
            this.onCheckEvent();
        },
        'click #emUnassigned': function() {
            this.onCheckEvent();
        }
    },
	
	/**
     * Constructor.
     */
    afterCreate: function() {
        this.on('app:space:express:console:teamFilter', this.commandRefresh);
    },   
    
    /**
     * after Initial Data Fetch.
     */
    afterInitialDataFetch: function() {
							
    },
        
    /**
     * Insert filter checkbox in afterviewload callback.
     */
    afterViewLoad: function() {
    	var template = _.template('<td class="checkbox-container"><input type="checkbox" id="teamRestrictToLocation" checked="false"/><span id="teamResMessageSpan">&nbsp;{{restrictToLocation}}</span>&nbsp;&nbsp;<input type="checkbox" id="teamUnassigned"/><span>&nbsp;{{unassignedRm}}</span>&nbsp;&nbsp;<input type="checkbox" id="emUnassigned"/><span>&nbsp;{{unassignedEm}}</span></td>');
        Ext.DomHelper.insertHtml('afterBegin', this.teamGrid.toolbar.tr, template(View.messages));
        Ext.fly('teamRestrictToLocation').setDisplayed(false);
        Ext.fly('teamResMessageSpan').setDisplayed(false);
        this.teamGrid.setColorOpacity(this.drawingPanel.getFillOpacity());
		
		// kb#3052408: retrieve metric value ranges for Team Ratio Percentage.
		this.initialTeamMetrics();

        /**
         * Redefine the class function afterCreateCellContent().
         * In this case, customize the style of a room area cell depending on its value
         *
         */
		var thisController = this;
		
		// Initial the map of team and its associated buildings before the team grid refresh.
        this.teamGrid.beforeRefresh = function() {
			thisController.teamBuildingMap = {};
			thisController.teamBuildingDS.addParameters(thisController.rmFilter.parameters);
			var records = thisController.teamBuildingDS.getRecords();

			for (var i=0; i<records.length; i++){
				thisController.addToTeamBuildingsMap(records[i], thisController);
			}
		};

        this.teamGrid.afterCreateCellContent = function(row, column, cellElement) {
            if ( thisController.teamBuildingMap && column.id == 'team_properties.vf_bl_id' )	{
				var teamId = row['team_properties.team_id'];
				var buildingList = thisController.teamBuildingMap[teamId];
				cellElement.textContent = buildingList ? buildingList : "";
            }
        }
    },

	initialTeamMetrics:function() {
		var records = this.abSpConsoleTeamMetricDefDs.getRecords();
		if (records.length > 0) {
			var record = records[0];
			this.team_ratio_pct_metric_low_crit = 100*record.getValue('afm_metric_definitions.report_limit_low_crit');
			this.team_ratio_pct_metric_low_warn = 100*record.getValue('afm_metric_definitions.report_limit_low_warn');
			this.team_ratio_pct_metric_high_warn = 100*record.getValue('afm_metric_definitions.report_limit_high_warn');
			this.team_ratio_pct_metric_high_crit = 100*record.getValue('afm_metric_definitions.report_limit_high_crit');
		}
	},

    /**
     * Return a buildings list by given team id.
     */
    addToTeamBuildingsMap: function(record, thisController){
		var teamId = record.getValue('rm_team.team_id');
		var buildingId = record.getValue('rm_team.bl_id');

		if ( buildingId ){
			var existBuildingList = thisController.teamBuildingMap[teamId];
			if ( existBuildingList && existBuildingList.length>0 ){
				 thisController.teamBuildingMap[teamId] = existBuildingList+','+ buildingId;	
			} else {
				 thisController.teamBuildingMap[teamId] = buildingId;	
			}
		}
	},	
    
    /**
     * add extra behavior before call refresh.
     */
    commandRefresh: function(filter){
    	this.applyExistsRmRestriction = true;
    	this.refresh(filter);
    },
    
    /**
     * Applies the filter restriction to team grid.
     */
    refresh: function(filter) {
		
        if (filter) {
    		//use custom filter rmFilter replace common filter.
            this.rmFilter =  jQuery.extend(true, {}, filter);
    		//set custom parameter with different table name.
    		var rmExists = " AND rm.bl_id ${sql.concat} rm.fl_id ${sql.concat} rm.rm_id is not null ";
    		if (filter.parameters["typeUnassigned"].indexOf("IS NULL")!=-1 || filter.parameters["organizationUnassigned"].indexOf("IS NULL")!=-1) {
    			this.rmFilter.parameters["typeUnassigned"] = filter.parameters["typeUnassigned"]+rmExists;
    		}
    		if (filter.parameters["totalArea"].indexOf("total_area")!=-1||filter.parameters["totalArea"].indexOf("total_count")!=-1) {
    			this.rmFilter.parameters["totalArea"] = getTotalAreaAndCountQueryParameter();
    		}

			// Added for 23.1 Team Space Functionality
			addTeamRoomRestrictionParameter(this.rmFilter, true);
			//directly apply team code restriction to team's grid
			var teamClause = this.rmFilter.parameters["teamClause"];
			if (  teamClause && teamClause.indexOf("team_id")!=-1 ) {
				this.rmFilter.parameters["teamRestriction"] = teamClause; 
			} else {
				this.rmFilter.parameters["teamRestriction"] = " 6=6 "; 
			}

			var emClause = getQueryParameter(this.rmFilter,View.panels.get("locationFilter"),'em.em_id',true);
			if ( emClause && emClause.indexOf("em_id")!=-1) {
				this.rmFilter.parameters["teamEmRestriction"] = emClause + "AND" + getAsOfDateRestriction(this.rmFilter.parameters["asOfDate"]); 
				this.rmFilter.parameters["restrictToEm"] = " 1=0 "; 
			} else {
				this.rmFilter.parameters["teamEmRestriction"] = " 6=6 "; 
				this.rmFilter.parameters["restrictToEm"] = " 1=1 "; 
			}
        }

     	abSpConsole_toggleFromFilter('teamRestrictToLocation', ['teamRestrictToLocation', 'teamResMessageSpan', 'teamUnassigned', 'emUnassigned'], 'teamResMessageSpan', 
     			this.rmFilter.searchValuesString + this.rmFilter.otherSearchValuesString);
		
		this.setRestrictToLocationParameter();

		abSpConsole_refreshDataFromFilter(this.teamGrid, this.rmFilter,null);
    },
		
    /**
     * According to value of check box 'Restriction to' to set SQL parameter 'restrictToLoc'.
     */
    setRestrictToLocationParameter: function() {
        var teamRestrict = $('teamRestrictToLocation').checked;
        if ( teamRestrict ) {
        	this.rmFilter.parameters['restrictToLoc'] = " 1=0 ";
        } else {
        	this.rmFilter.parameters['restrictToLoc'] = " 1=1 ";
			this.rmFilter.parameters["teamRestriction"] = " 6=6 "; 
		}
	},

    /**
     * Handles the checkbox check and uncheck events.
     */
    onCheckEvent: function() {
		this.setRestrictToLocationParameter();
		var asOfDateRestriction = getAsOfDateRestriction(this.rmFilter.parameters['asOfDate']);

		var rmUnassigned = $('teamUnassigned').checked;
        if ( rmUnassigned ) {
        	this.rmFilter.parameters['noRmAssigned'] =  " NOT EXISTS ( select 1 from rm_team where rm_team.team_id=team_properties.team_id AND "+ asOfDateRestriction.replace(/team\./g, "rm_team.") +")  "; 
        } else {
        	this.rmFilter.parameters['noRmAssigned'] =  " 1=1 "; 
		}

        var emUnassigned = $('emUnassigned').checked;
         if ( emUnassigned ) {
        	this.rmFilter.parameters['noEmAssigned'] =  " NOT EXISTS ( select 1 from team where team.team_id=team_properties.team_id AND "+ asOfDateRestriction +")"; 
        } else {
        	this.rmFilter.parameters['noEmAssigned'] =  " 1=1 "; 
		}

		if ( $('teamRestrictToLocation').checked ){
			abSpConsole_toggleFromCheckEvent('teamRestrictToLocation', ['teamRestrictToLocation','teamResMessageSpan', 'teamUnassigned', 'emUnassigned'], 'teamResMessageSpan',
					this.rmFilter.searchValuesString + this.rmFilter.otherSearchValuesString);
			// kb#3053439: enable em-team assignment restriction
			if ( this.rmFilter.parameters["teamEmRestriction"] != " 6=6 " ) {
				this.rmFilter.parameters["restrictToEm"] = " 1=0 "; 
			}
			abSpConsole_refreshDataFromCheckEvent('teamRestrictToLocation', this.teamGrid, this.rmFilter, null);
		} else {
			// kb#3053439: disable em-team assignment restriction
			this.rmFilter.parameters["restrictToEm"] = " 1=1 "; 
			this.teamGrid.addParameters(this.rmFilter.parameters);
			this.teamGrid.refresh();
		}

    	// TODO: recheck the row after refresh
    	//var checkedRecords = this.employeeGrid.getSelectedRows();
        //check original record which checked before to keep the status.
        //this.checkOriginalRecords(checkedRecords);

    	//this.emFilter.unassignedRes = null;
    },
    
    /**
     * Assign rooms to a team.
     */
    teamGrid_onAssignTeam: function() {
    	var row = this.teamGrid.rows[this.teamGrid.selectedRowIndex];
    	this.trigger('app:space:express:console:beginAssignment',{
    		type:'team',
    		team_id:row['team_properties.team_id'],
    		team_name:row['team_properties.team_name']
    	});
    },

	/**
	 * add permannent sql parmeter.
	 */
    teamGrid_beforeRefresh: function() {
    	this.teamCapacitySqlParameter = jQuery("#teamCapacityId").html();
    	//use this custom sql calcute team capacity as a sql parameter. and dynimicly add to dataSouce after view load.
		this.teamGrid.addParameter("teamCapacitySqlParameter", this.teamCapacitySqlParameter);
    },
	
    /**
     * Logics executed after team grid refresh.
     */
    teamGrid_afterRefresh: function() {
		this.highlightDeltaColumn();
    },
    
    /**
     * Highlight the text in the Delta column.
     */
    highlightDeltaColumn: function() {
    	var headerHrId = jQuery("#grid_teamGrid_header").find("th[id*='sortHeader']  div:contains("+getMessage('delta')+")").parent().attr("id");
		var thisCtrl = this;
    	if (headerHrId) {
    		var indexColumn = headerHrId.replace("sortHeader_","");
    		jQuery("#grid_teamGrid_body tr").each(function() {
    			var delta = jQuery(this).find("td:eq("+indexColumn+")");
    			var deltaValue = parseInt(jQuery(delta).text());
    			jQuery(delta).html(jQuery(delta).text().replace("%",""));

    			if(deltaValue>=thisCtrl.team_ratio_pct_metric_high_crit || deltaValue<=thisCtrl.team_ratio_pct_metric_low_crit) {
    				jQuery(delta).css("color", "red");

    			} else if( (deltaValue>=thisCtrl.team_ratio_pct_metric_high_warn && deltaValue<thisCtrl.team_ratio_pct_metric_high_crit) 
							|| (deltaValue>thisCtrl.team_ratio_pct_metric_low_crit && deltaValue<thisCtrl.team_ratio_pct_metric_low_warn) ) {
    				
					jQuery(delta).css("color", "#FFCC00");

    			} else if( deltaValue<thisCtrl.team_ratio_pct_metric_high_warn && deltaValue>thisCtrl.team_ratio_pct_metric_low_warn ) {
    				jQuery(delta).css("color", "green");
    			}
    			jQuery(delta).html(jQuery(delta).text()+"%");
    		});
    	}
    },
    
    /**
     * Commit team pending assignments.
     */
    teamPendingAssignmentPanel_onCommitTeamPendingAssignments: function() {
    	this.trigger('app:space:express:console:commitAssignment');
    },
    
    /**
     * Cancel team pending assignments.
     */
    teamPendingAssignmentPanel_onCancelTeamPendingAssignments: function() {
    	this.trigger('app:space:express:console:cancelAssignment');
    },
    
    /**
     * Remove a team assignment.
     */
    onRemoveTeamPendingAssignment: function() {
		var rowIndex = this.teamPendingAssignmentPanel.selectedRowIndex;
		var row = this.teamPendingAssignmentPanel.gridRows.get(rowIndex);
    	this.trigger('app:space:express:console:removeAssignment', {
    		bl_id: row.record['rm_team.bl_id'],
    		fl_id: row.record['rm_team.fl_id'],
    		rm_id: row.record['rm_team.rm_id'],
    		team_id: row.record['rm_team.team_id']
    	});
    },
    
	/**
	 * pop-up new View when click row edit button.
	 */
    teamGrid_onEdit: function(){
        var teamGrid = View.panels.get('teamGrid');
        var row = teamGrid.rows[teamGrid.selectedRowIndex];
		var team_id = row["team_properties.team_id"];
		var currentAsOfDate = teamsController.rmFilter.parameters['asOfDate'];
		Ab.view.View.openDialog('ab-sp-console-team-edit.axvw', null, false, 
			{title : getMessage("editTeam")+": "+row["team_properties.team_name"], teamId:team_id, asOfDate:currentAsOfDate, maximize:true, callBack: teamsController.afterOpenEditTeamView
		});  
    },
	
    /**
     * pop-up new View when click row edit button.
     */
    teamGrid_onAddNewTeam: function(){
		var currentAsOfDate = teamsController.rmFilter.parameters['asOfDate'];
		Ab.view.View.openDialog('ab-sp-console-team-edit.axvw', null, false, 
			{title : getMessage("addTeam"), width:1100, height:900, teamId:null, asOfDate:currentAsOfDate, maximize:true, 
			callBack: teamsController.afterOpenEditTeamView
		});  
    },

    afterOpenEditTeamView: function(asOfDate){
		//kb#3051870: update as of date with selected date_start back.
		var currentAsOfDate = teamsController.rmFilter.parameters['asOfDate'];
		if ( asOfDate && asOfDate != currentAsOfDate ) {
			//also need to set new as of date back to filter in location view and do filter.
 			teamsController.trigger('app:space:express:console:asOfDateUpdate', asOfDate);
		} else {
			View.panels.get('teamGrid').refresh();	
		}
	},

    afterOpenEditTeamView: function(asOfDate){
		View.openProgressBar(getMessage('updateTeamsTab'),config = {
				interval: 500
		});
		teamsController.updateByAsOfDate.defer(500, teamsController, [asOfDate]);
	},

	updateByAsOfDate: function(asOfDate){
		//kb#3051870: update as of date with selected date_start back.
		var currentAsOfDate = teamsController.rmFilter.parameters['asOfDate'];
		if ( asOfDate && asOfDate != currentAsOfDate ) {
			//also need to set new as of date back to filter in location view and do filter.
 			teamsController.trigger('app:space:express:console:asOfDateUpdate', asOfDate);
		} else {
			View.panels.get('teamGrid').refresh();	
		}

		View.closeProgressBar();
	}
});

/**
 * Added for 23.1 Team Space:
 *		- in "selection mode"  highlight the rooms on the loaded floor drawings where the selected team¡¯s rooms are located;
 *		- highlight scheme persists until the user changes the highlight selection, or the user un-selects the team.
 *		- the highlight drop-down is set to ¡°None¡±
 */
function locateTeam() {
	
	var thisController = View.controllers.get('teamsController');
    var teamGrid = View.panels.get('teamGrid');
    var rowIndex = teamGrid.rows[teamGrid.selectedRowIndex];
    var teamId = rowIndex["team_properties.team_id"];

	this.teamBuildingMap = {};

	thisController.teamFloorDS.addParameters(thisController.rmFilter.parameters);
	thisController.teamFloorDS.addParameter('teamId', teamId);
	var records = thisController.teamFloorDS.getRecords();
	
	var floors=[];
	for (var i=0; i<records.length; i++)	{
		var record = records[i];
		var newRow = new Object();
    	newRow.bl_id = record.getValue('rm_team.bl_id');
    	newRow['rm.bl_id'] = record.getValue('rm_team.bl_id');
    	newRow.fl_id = record.getValue('rm_team.fl_id');
    	newRow['rm.fl_id'] = record.getValue('rm_team.fl_id');
    	newRow['rm.dwgname'] = record.getValue('rm_team.dwgname');
    	newRow['rm.team_id'] = record.getValue('rm_team.team_id');
    	floors.push(newRow);
	}
    	
    thisController.trigger('app:space:express:console:locateTeamRooms', teamId, floors);
}

/**
 * Export in XLS format.
 */
function exportTeamoXLS() {
	doTeamCustomExport('xls');
}

/**
 * Export in docx format.
 */
function exportTeamToDOCX() {
	doTeamCustomExport('docx');
}

/**
 * Get customed report.
 * 
 * @param workflowRuleName
 * @param outputType
 */
function doTeamCustomExport(outputType) {
	var wfrId = '';
	if ( 'docx'=== outputType ){
		wfrId = Ab.grid.ReportGrid.WORKFLOW_RULE_DOCX_REPORT;
	} else if ( 'xls'=== outputType )	{
		wfrId = Ab.grid.ReportGrid.WORKFLOW_RULE_XLS_REPORT;
	}

	var ds = 'teamsDS';
	var categoryFieldsArray = [
	                           abSpConsole_getFieldDef(ds, 'team_properties.team_id'),
	                           abSpConsole_getFieldDef(ds, 'team_properties.team_name'), 
	                           abSpConsole_getFieldDef(ds, 'team_properties.vf_bl_id'), 
	                           abSpConsole_getFieldDef(ds, 'team_properties.vf_area')];
	
	var teamRestrictToLocationChecked = Ext.getDom('teamRestrictToLocation').checked;
	var teamRmUnassignedChecked = Ext.getDom('teamUnassigned').checked;
	var teamEmployeeUnassignedChecked = Ext.getDom('emUnassigned').checked;
	
	var teamGrid = View.panels.get("teamGrid");
	var parameters = teamGrid.getParametersForRefresh();
	
	var hasRes = teamRestrictToLocationChecked ? true: false;
	
	if ( !teamRestrictToLocationChecked && teamRmUnassignedChecked && teamEmployeeUnassignedChecked) {
		parameters = {};
	} 

	var asOfDateRestriction = getAsOfDateRestriction(teamsController.rmFilter.parameters['asOfDate']);
	if ( teamRmUnassignedChecked ) {
		parameters['noRmAssigned'] = " NOT EXISTS ( select 1 from rm_team where rm_team.team_id=team_properties.team_id AND "+ asOfDateRestriction.replace(/team\./g, "rm_team.") +")  "; 
	}

	if ( teamEmployeeUnassignedChecked ) {
		parameters['noEmAssigned'] =  " NOT EXISTS ( select 1 from team where team.team_id=team_properties.team_id and AND "+ asOfDateRestriction +")"; 
	}

	var restriction = teamsController.rmFilter.restriction;
	var printableRestrictions = getPrintableRestrictions(restriction, hasRes);
	parameters.printRestriction = hasRes;
	
	if (teamRmUnassignedChecked) {
		printableRestrictions.push({'title': getMessage("unassignedRm"), 'value': '[Yes]'});
		parameters.printRestriction = true;
	}

	if (teamEmployeeUnassignedChecked) {
		printableRestrictions.push({'title': getMessage("unassignedEm"), 'value': '[Yes]'});
		parameters.printRestriction = true;
	}

	if (hasRes) {
		var team_id_value = View.panels.get("locationFilter").getFieldValue('team_properties.team_id');
		if ( valueExistsNotEmpty(team_id_value) ) {
			printableRestrictions.push({'title': getMessage("teamCode"), 'value': team_id_value});
		}
	}

	var asOfDate = View.panels.get("locationFilter").getFieldValue('rm.date_last_surveyed');
	if ( valueExistsNotEmpty(asOfDate) ) {
		printableRestrictions.push({'title': getMessage("asOfDate"), 'value': asOfDate});
	}
	
	parameters.printableRestriction = printableRestrictions;
	parameters.categoryFields = categoryFieldsArray;
	
	var jobId = '';
	if (outputType == 'xls') {
		jobId = teamGrid.callXLSReportJob(getMessage("teamReport"),'',parameters);
	} else {
		jobId = teamGrid.callDOCXReportJob(getMessage("teamReport"),'',parameters);
	}
	doExportPanel(jobId, outputType);
}