/**
 *This js file contains manage space console operation related common functions. 
 */
/**
 * Get total area and room count sql condition as a sql parameter.
 */
function getTotalAreaAndCountQueryParameter() {
	
    var areaAndCount = ' 1=1 '; 
    
    var vpaRes = arguments.length == 1 && arguments[0] == "em"? "${sql.getVpaRestrictionForTable('rm')}": "${sql.vpaRestriction}";
    
    var parameters =  " AND ( (${parameters['dp_id']} AND ${parameters['dv_id']} ) AND (${parameters['organizationUnassigned']})" +
		") AND ${parameters['bl_id']} AND ${parameters['fl_id']} AND ${parameters['rm_id']} AND ((${parameters['rm_cat']} " +
		"AND ${parameters['rm_type']} ) AND (${parameters['typeUnassigned']})) AND ${parameters['occupancy']} AND "+vpaRes;

    var calcsRes = " WHERE rm.dwgname IS NOT NULL AND (rm.rm_cat IS NULL OR EXISTS (SELECT 1 FROM rmcat WHERE" +
		" rm.rm_cat= rmcat.rm_cat AND rmcat.used_in_calcs !='no_totals')) ";
    
    var tempString = "EXISTS(SELECT 1 FROM (  SELECT rm.bl_id, rm.fl_id FROM rm" +calcsRes+parameters+" GROUP BY rm.bl_id, rm.fl_id, rm.dwgname HAVING ";
    
    var endString = "  ${sql.as}  wraped_rm WHERE wraped_rm.bl_id = rm.bl_id AND wraped_rm.fl_id = rm.fl_id) ";
   
    var checkTotalArea = Ext.get('occupancyWithTotalArea').dom.checked && Ext.get('totalArea').dom.value!="";
    var checkTotalRooms = Ext.get('occupancyWithTotalRooms').dom.checked && Ext.get('totalRooms').dom.value!="";
   
    var areaRestriction =tempString + " sum(rm.area) " + Ext.get("totalAreaOp").dom.value + " " + Ext.get("totalArea").dom.value +")"+ endString;
    var roomsRestriction = tempString +" count(DISTINCT rm.bl_id ${sql.concat} rm.fl_id ${sql.concat} rm.rm_id) " 
    			+ Ext.get('totalRoomsOp').dom.value + " " + Ext.get('totalRooms').dom.value+")"+ endString;
    
    if (checkTotalArea&&checkTotalRooms) {
        areaAndCount =  areaRestriction + ' AND ' +roomsRestriction;
    } else if (checkTotalArea&&!checkTotalRooms) {
        areaAndCount = areaRestriction;
    } else if (!checkTotalArea&&checkTotalRooms) {
    	areaAndCount = roomsRestriction;;
    }

    return areaAndCount;
}

/**
 * Create occupancy restriction when the user filter by occopancy.
 */
function createOccupancyRestriction() {
    var occupancy = ' 1=1 ';
    
    if (Ext.get('occupancyVacant').dom.checked ||
        Ext.get('occupancyAvailable').dom.checked ||
        Ext.get('occupancyAtCapacity').dom.checked ||
        Ext.get('occupancyExceedsCapacity').dom.checked) {
    	
    	var checkedLength= jQuery("#div_checkbox_control input:checked").length;
    	var and_Or = checkedLength>1&&occupancy.indexOf("EXISTS")!=-1? " OR ":" AND ";

        var capClause = " EXISTS (select 1 from rmcat where rmcat.rm_cat = rm.rm_cat and rmcat.occupiable = 1) AND rm.cap_em > 0 ";
        if (Ext.get("occupancyVacant").dom.checked) {
        	and_Or = checkedLength>1&&occupancy.indexOf("EXISTS")!=-1? " OR ":" AND ";
            occupancy +=and_Or +"("+ capClause+" AND NOT EXISTS (SELECT bl_id, fl_id, rm_id FROM em  WHERE em.bl_id = rm.bl_id " +
            		"AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id))";
        }
        if (Ext.get("occupancyAvailable").dom.checked) {
        	and_Or = checkedLength>1&&occupancy.indexOf("EXISTS")!=-1? " OR ":" AND ";
            occupancy += and_Or+"(" +capClause+" AND rm.cap_em > (SELECT COUNT(1) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id  GROUP BY em.bl_id, em.fl_id, em.rm_id))";
        }
        if (Ext.get("occupancyAtCapacity").dom.checked) {
        	and_Or = checkedLength>1&&occupancy.indexOf("EXISTS")!=-1? " OR ":" AND ";
            occupancy += and_Or +"(" +capClause+"  AND rm.cap_em = (SELECT COUNT(1) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id  GROUP BY em.bl_id, em.fl_id, em.rm_id))";
        }
        if (Ext.get("occupancyExceedsCapacity").dom.checked) {
        	and_Or = checkedLength>1&&occupancy.indexOf("EXISTS")!=-1? " OR ":" AND ";
            occupancy += and_Or +"(" +capClause+"  AND rm.cap_em < (SELECT COUNT(1) FROM em WHERE em.bl_id = rm.bl_id AND em.fl_id = rm.fl_id AND em.rm_id = rm.rm_id  GROUP BY em.bl_id, em.fl_id, em.rm_id))";
        }
    }

    return "("+occupancy+")";
}

/**
 * Search an element in an array, return true when found or return false when not found.
 * @param dataArray the array contains all the element.
 * @param element the element wants to be searched.
 */
function containElement(dataArray, element) {
	var found = false;
	for (var i = 0; i < dataArray.length; i++) {
		if (element == dataArray[i]) {
			found = true;
			break;
		}
	}
	return found;
}

/**
 * Get input restrictions and set it to an Array use for export doc or xls.
 * @param restriction: the input filter restriction Object.
 * @param hasRes: for the 'Restrict to 'checkbox, if not checked return [].
 */
function getPrintableRestrictions(restriction, hasRes) {
	var printableRestrictions = [];
	if (hasRes) {
		//standard fields.
		var bl_id_clause = restriction.findClause('rm.bl_id');
		if (bl_id_clause != null) {
			var bl_id = bl_id_clause.value;
			printableRestrictions.push({'title': 'Building Code', 'value': bl_id});
		}
		
		var fl_id_clause = restriction.findClause('rm.fl_id');
		if (fl_id_clause != null) {
			var fl_id = fl_id_clause.value;
			printableRestrictions.push({'title': 'Floor Code', 'value': fl_id});
		}
		
		var rm_id_clause = restriction.findClause('rm.rm_id');
		if (rm_id_clause != null) {
			var rm_id = rm_id_clause.value;
			printableRestrictions.push({'title': 'Room Code', 'value': rm_id});
		}
		
		var dv_id_clause = restriction.findClause('rm.dv_id');
		if (dv_id_clause != null) {
			var dv_id = dv_id_clause.value;
			printableRestrictions.push({'title': 'Division Code', 'value': dv_id});
		}
		
		var dp_id_clause = restriction.findClause('rm.dp_id');
		if (dp_id_clause != null) {
			var dp_id = dp_id_clause.value;
			printableRestrictions.push({'title': 'Department Code', 'value': dp_id});
		}
		
		var rmcat_clause = restriction.findClause('rm.rm_cat');
		if (rmcat_clause != null) {
			var rmCat = rmcat_clause.value;
			printableRestrictions.push({'title': 'Room Category', 'value': rmCat});
		}
		
		var rmtype_clause = restriction.findClause('rm.rm_type');
		if (rmtype_clause != null) {
			var rmType = rmtype_clause.value;
			printableRestrictions.push({'title': 'Room Type', 'value': rmType});
		}
		//  other fields:
		//	Unassigned Organization[Yes]
		//	Unassigned Categories[Yes]
		//	Occupancy options: ['Vacant', 'Available']
		//	With total area>5555
		//	With total room count>5
		
		if ($('organizationUnassigned').checked) {
			printableRestrictions.push({'title': getMessage('exportedUnassignedOrg'), 'value': '[' + getMessage('exportedYes') + ']'});
		}
		if ($('typeUnassigned').checked) {
			printableRestrictions.push({'title': getMessage('exportedUnassignedRmType'), 'value': '[' + getMessage('exportedYes') + ']'});
		}
		var occupancy = "";
		if ($('occupancyVacantOnly').checked) {
			occupancy+=" " + getMessage("exportedVacantOnly") + ", ";
		}
		if ($('occupancyVacant').checked) {
			occupancy+=" " + getMessage("exportedVacant") + ", ";
		}
		if ($('occupancyAvailable').checked) {
			occupancy+=" " + getMessage("exportedAvailable") + ", ";
		}
		if ($('occupancyAtCapacity').checked) {
			occupancy+=" " + getMessage("exportedAtCapacity") + ", ";
		}
		if ($('occupancyExceedsCapacity').checked) {
			occupancy+=" " + getMessage('exportedExceedsCapacity') + ", ";
		}
		if ($('excludedHotalableRm').checked) {
			occupancy += " " + getMessage("exportedExcludeHotelableRooms") + ", ";
		}
		
		if (jQuery("#div_checkbox_control input:checked").length>0) {
			printableRestrictions.push({'title': getMessage("exportedOccupancyOptions") + ":", 'value': "["+occupancy.substring(0,occupancy.length-2)+"]"});
		}
		if ($('occupancyWithTotalArea').checked) {
			printableRestrictions.push({'title': getMessage("exportedWithTotalArea") + Ext.get('totalAreaOp').dom.value, 'value': Ext.get('totalArea').dom.value});
		}
		if ($('occupancyWithTotalRooms').checked) {
			printableRestrictions.push({'title': getMessage("exportedWithTotalRoomCount") + Ext.get('totalRoomsOp').dom.value, 'value': Ext.get('totalRooms').dom.value});
		}
	}
	return printableRestrictions;
}

/**
 * Get output fields colunm for export doc or xls.
 * @param grid: the grid panel.
 * @param ds: dataSouce name.
 */
function getCategoryFieldsArray(grid, ds) {
	var categoryFieldsArray = [];
	var columns = grid.getColumns();
	for (var i=0; i < columns.length; i++) {
		var column = columns[i];
		if (!column.hidden && column.id.indexOf("edit")==-1 && column.id.indexOf("assign")==-1) {
			if (column.id == "rm.rm_std") {
				var key_fieldDef = abSpConsole_getFieldDef(ds, name);
				key_fieldDef.defaultValue = getMessage("titleUnassigned"); 
				key_fieldDef.showDefaultValue = true;
				categoryFieldsArray.push(key_fieldDef);
			} else {
				categoryFieldsArray.push(abSpConsole_getFieldDef(ds, column.id));
			}
		}
	}
	return categoryFieldsArray;
}

/**
 * For Tree panel, Get output fields colunm for export doc or xls.
 * @param grid: the grid panel.
 * @param ds: dataSouce name.
 */
function getCategoryFieldsArrayForTreePanel(tree, ds, level) {
	var categoryFieldsArray = [];
	var sidecar = tree.getSidecar();
	var sidecarLevels = sidecar.get("levels");
	if (sidecarLevels.length == 0) {
		var items = View.dataSources.get(ds).fieldDefs.items;
		for (var i=0; i<items.length; i++) {
			var item = items[i];
			// export column if only field name exists in the tree grid. 
			//default column 'pec_of_total_area' was hidden.
			if (item.hidden == "false" && item.id != "rm.pec_of_total_area") {
				var name = item.id;
				if (level==1 && (name=="rm.rm_cat" || name == "rm.dv_id")) continue;
				setCategoryFieldsArray(ds, level,name,categoryFieldsArray);
			}
		}
	} else {
		var visibleFields = sidecarLevels[level].visibleFields;
		for (var i=0; i<visibleFields.length; i++) {
			var visibleField = visibleFields[i];
			var name = visibleField.name;
			setCategoryFieldsArray(ds, level,name,categoryFieldsArray);
		}
	}
	return categoryFieldsArray;
}

/**
 * push object to 'categoryFieldsArray.
 * @param grid: the grid panel.
 * @param ds: dataSouce name.
 */
function setCategoryFieldsArray(ds, level,name,categoryFieldsArray) {
	if (name.indexOf("edit")==-1 && name.indexOf("assign")==-1) {
		if (name == "rm.dv_id" || name == "rm.rm_cat"|| name == "rm.description" || name == "rm.dp_id" || name == "rm.rm_type" || name == "rm.dv_name" || name == "rm.dp_name") {
			var key_fieldDef = abSpConsole_getFieldDef(ds, name);
			if (name == "rm.dv_name" || name == "rm.dp_name" || name == "rm.description") {
				key_fieldDef.defaultValue = ' ';   
			} else {
				key_fieldDef.defaultValue = getMessage("titleUnassigned");  
				key_fieldDef.showDefaultValue = true;
			}
			categoryFieldsArray.push(abSpConsole_getFieldDef(ds, name)); 
			if (level == 0 && name == "rm.dv_id" || name == "rm.rm_cat") {
				//add empty column for export report.
				categoryFieldsArray.push({});
			}
		} else {
			categoryFieldsArray.push(abSpConsole_getFieldDef(ds, name));
		}
	}
}

/**
 * Give an warning message to the user when there are employees in the waiting room.
 */
function isWaitingListExisting() {
	var waitingList = spaceExpressConsoleDrawing.employeesWaiting;
	if(waitingList.length > 0) {
		return true;
	} else {
		return false;
	}
}

/**
 * define a common filter parameters for all dataSource to use.
 */
function getCommonParameters() {
	return " ( (${parameters['dp_id']} AND ${parameters['dv_id']} ) AND (${parameters['organizationUnassigned']})" +
	") AND ${parameters['bl_id']} AND ${parameters['fl_id']} AND ${parameters['rm_id']} AND ((${parameters['rm_cat']} " +
	"AND ${parameters['rm_type']} ) AND (${parameters['typeUnassigned']})) AND ${parameters['occupancy']} AND ${sql.vpaRestriction}";
}
/**
 * define a common filter parameters for all dataSource with total area and total count.
 */
function getAllCommonParameters() {
	return getCommonParameters()+" AND ${parameters['totalArea']}";
}

/**
 * if no filter, clear the restrit to....
 */
function clearUIRestricTo(filter) {
    if (filter.searchValuesString + filter.otherSearchValuesString == '') { 
        jQuery("#dpRestriction").hide();
        jQuery("#catRestriction").hide();
        jQuery("#roomsRestriction").hide();
        jQuery("#employeeRestrictToLocation").hide();
        jQuery("#employeesResMessageSpan").hide();
        jQuery("#roomStandardRestriction").hide();
		if ( jQuery("#teamRestrictToLocation")) {
			jQuery("#teamRestrictToLocation").hide();
		}
		if ( jQuery("#teamResMessageSpan")) {
	        jQuery("#teamResMessageSpan").hide();
		}
        jQuery('#totalArea').val('');
        jQuery('#totalRooms').val('');
	}
}

/**
 * get and open reported URL.
 */
function doExportPanel(jobId, outputType) {
	if (jobId != null) {
		var command = new Ab.command.exportPanel({});
		command.displayReport(jobId, outputType);
	}
}

/**
 * Get restriction from selected team(s).
 */
function addTeamRoomRestrictionParameter(filter, isTeamTab) {
	var teamClause = filter.parameters["teamClause"];
	var asOfDate = filter.parameters["asOfDate"];
	if (  isTeamTab || (teamClause && teamClause.indexOf("team_id")!=-1 ) ) {
		var teamRestriction = " exists (select 1 from rm_team where rm.bl_id = rm_team.bl_id AND rm.fl_id = rm_team.fl_id AND rm.rm_id = rm_team.rm_id "; 
		if ( teamClause ) {
			teamRestriction += ( "AND "+ teamClause.replace("team_properties", "rm_team") );
		}

		if (isOracleDataBase() == 1) {
			teamRestriction+= " AND ( rm_team.date_end IS NULL or rm_team.date_end>= to_date('" + asOfDate + "', 'YYYY-MM-DD') )";
			teamRestriction+= " AND ( rm_team.date_start IS NULL or rm_team.date_start<= to_date('" + asOfDate + "', 'YYYY-MM-DD') )";
		} else {
			teamRestriction+= " AND ( rm_team.date_end IS NULL or rm_team.date_end>= '" +  asOfDate  + "')";
			teamRestriction+= " AND ( rm_team.date_start IS NULL or rm_team.date_start<= '" +  asOfDate  + "')";
		}
		
		teamRestriction +=")";
		filter.parameters["teamRmRestriction"] = teamRestriction; 
	}
}

/**
 * Get restriction from selected team(s) under given as of date.
 */
function addTeamEmRestrictionParameter(filter) {
	var teamClause = filter.parameters["teamClause"];
	var asOfDate = filter.parameters["asOfDate"];

	if ( teamClause && teamClause.indexOf("team_id")!=-1 ) {
		var teamRestriction = " exists (select 1 from team where team.em_id = em.em_id  AND "; 
		teamRestriction += teamClause.replace("team_properties", "team");

		if (isOracleDataBase() == 1) {
			teamRestriction+= " AND ( team.date_end IS NULL or team.date_end>= to_date('" + asOfDate + "', 'YYYY-MM-DD') )";
			teamRestriction+= " AND ( team.date_start IS NULL or team.date_start<= to_date('" + asOfDate + "', 'YYYY-MM-DD') )";
		} else {
			teamRestriction+= " AND ( team.date_end IS NULL or team.date_end>= '" +  asOfDate  + "')";
			teamRestriction+= " AND ( team.date_start IS NULL or team.date_start<= '" +  asOfDate  + "')";
		}
		teamRestriction +=")";
		filter.parameters["teamEmRestriction"] = teamRestriction; 
	}
}

/**
 * Detect if the database the project used is oracle database.
 */
function isOracleDataBase() {
	var checkOracleDataSource = View.dataSources.get('checkOracleDataSource');

	if(valueExistsNotEmpty(checkOracleDataSource.getRecord().records)){
		return checkOracleDataSource.getRecord().records[0].values['afm_tbls.table_name']
	} else {
		//older database.
		return checkOracleDataSource.getRecord().getValue("afm_tbls.table_name");
	}
}

/**
 * Detect if the database the project used is oracle database.
 */
function getAsOfDateRestriction(asOfDate) {
	var dateRestriction;
	if (isOracleDataBase() == 1) {
		dateRestriction = " ( team.date_end IS NULL or team.date_end>= to_date('" + asOfDate + "', 'YYYY-MM-DD') )";
		dateRestriction+= " AND ( team.date_start IS NULL or team.date_start<= to_date('" + asOfDate + "', 'YYYY-MM-DD') )";
	} else {
		dateRestriction= " ( team.date_end IS NULL or team.date_end>= '" +  asOfDate  + "')";
		dateRestriction+= " AND ( team.date_start IS NULL or team.date_start<= '" +  asOfDate  + "')";
	}
	return dateRestriction;
}

/**
 * Get query parameter from the filter location panel.
 */
function getQueryParameter(filter, panel, fieldName, hasLiteral) {
	var queryParameter = "";
	
	if (panel.hasFieldMultipleValues(fieldName)) {
		var originalValues = panel.getFieldMultipleValues(fieldName);
		var values = [];
		if (arguments.length == 4 && hasLiteral) {
			for (var i=0; i<originalValues.length; i++) {
				values.push( makeLiteral(originalValues[i]) );
			}
		} else {
			values = originalValues;
		}
		filter.searchValuesString = filter.searchValuesString + ( filter.searchValuesString ? ',' : '' )  + values;
		queryParameter = " IN ('" + values.join("','") + "')";
	} else {
		var value = panel.getFieldValue(fieldName);
		if (value) {
			filter.searchValuesString = filter.searchValuesString + ( filter.searchValuesString ? ',' : '' )  + value;
			if (arguments.length == 4 && hasLiteral) {
				queryParameter = " = '" + makeLiteral(value) + "'";
			} else {
				queryParameter = " = '" + value + "'";
			}
		}
	}
	if (queryParameter) {
		return fieldName + queryParameter;
	} else {
		return "1=1";
	}
}
