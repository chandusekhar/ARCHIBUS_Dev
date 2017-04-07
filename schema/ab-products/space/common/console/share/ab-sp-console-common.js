/**
 *This js file contains common functions shared by space console apps. 
 */

/**
 * Common funtion shared by attribute tabs refresh data container.
 */
function abSpConsole_refreshDataContainer(dataContainer, filter, searchString, restriction) {
	dataContainer.clearParameters();
	var filterResult = searchString;
	var refreshRestriction = restriction;
	//set custom parameter with different table name.
	if (filterResult != '') {
		dataContainer.addParameters(filter.parameters);
	} else {
		if (filter.unassignedRes) {
			//refresh employeeGrid with only restriction 'unassigned'.
			refreshRestriction = filter.unassignedRes;
		} else{
			refreshRestriction = new Ab.view.Restriction();
		}
	}
	dataContainer.addParameter('commonParameters', getAllCommonParameters());
	dataContainer.addParameter('asOfDate', filter.parameters['asOfDate']);
	dataContainer.refresh(refreshRestriction);
}

/**
 * Handle the 'restrict to' checkbox event and hide or show itself.
 * @param filter
 * @param showElement
 * @param messageDom
 * @Param searchString
 */
function abSpConsole_toggleRestrictionText(showElement, messageDom, searchString) {
	var filterResult = searchString;
	if (filterResult != '' ) {
		if (filterResult.length>10) {
			filterResult= filterResult.substring(0, 10)+"...";
		}
		var message =  getMessage('textRestrictTo')+" ";
		filterResult = message + filterResult;
		Ext.getDom(messageDom).innerHTML = filterResult;
		for (var i = 0; i < showElement.length; i++) {
			Ext.fly(showElement[i]).setDisplayed(true);
		}

        var tooltipText = message +searchString;
		// remove previous tooltip
		Ext.QuickTips.unregister(messageDom);
		// add new tooltip, if not empty
		if (tooltipText != '') {
	        Ext.QuickTips.register({
	            target: messageDom,
	            text: tooltipText
	        });            
		}
	} 
}

/**
 * Toggle the restrict to checkbox when click the filter.
 * @param checkBoxName
 * @param showElements
 * @param messageDom
 * @param searchString
 */
function abSpConsole_toggleFromFilter(checkBoxName, showElements, messageDom, searchString) {
	if (searchString == '') {
		Ext.getDom(checkBoxName).checked = false;
	} else {
		Ext.getDom(checkBoxName).checked = true;
	}
	abSpConsole_toggleRestrictionText(showElements, messageDom, searchString);
}

/**
 * Toggle the restrict to checkbox when trigger the check or uncheck event.
 * @param checkBoxName
 * @param showElements
 * @param messageDom
 * @param searchString
 */
function abSpConsole_toggleFromCheckEvent(checkBoxName, showElements, messageDom, searchString) {
	var checked = Ext.getDom(checkBoxName).checked;
	var searchStr = searchString;
	if (!checked) {
		searchStr = '';
	}
	abSpConsole_toggleRestrictionText(showElements, messageDom, searchStr);
}

/**
 * Refresh data when click filter button.
 * @param dataContainer
 * @param filter
 * @param searchString
 * @param restriction
 */
function abSpConsole_refreshDataFromFilter(dataContainer, filter, restriction) {
	abSpConsole_refreshDataContainer(dataContainer, filter, filter.searchValuesString + filter.otherSearchValuesString, restriction);
}

/**
 * Refresh data when trigger the check or uncheck event.
 * @param checkBoxName
 * @param dataContainer
 * @param filter
 * @param searchString
 * @param restriction
 */
function abSpConsole_refreshDataFromCheckEvent(checkBoxName, dataContainer, filter, restriction) {
	var checked = Ext.getDom(checkBoxName).checked;
	var searchStr = filter.searchValuesString + filter.otherSearchValuesString;
	if (!checked) {
		searchStr = '';
	}
	abSpConsole_refreshDataContainer(dataContainer, filter, searchStr, restriction);
}

/**
 * Shared edit function for row edit icon in all tabs.
 * @param target
 * @param showForm
 * @param button
 * @param panel
 * @param node
 */
function abSpConsole_onCommonEditForTabsRow(target, showForm, button, panel, dataElem) {
	var restrictionForTarget = new Ab.view.Restriction();
	
	if (target == 'editDv') {
		restrictionForTarget.addClause('dv.dv_id', dataElem.data['rm.dv_id']);
	} else if (target == 'editDp') {
		restrictionForTarget.addClause('dp.dp_id', dataElem.data['rm.dp_id']);
	} else if (target == 'editCategory') {
		restrictionForTarget.addClause('rmcat.rm_cat', dataElem.data['rm.rm_cat']);
	} else if (target == 'editType') {
		restrictionForTarget.addClause('rmtype.rm_cat', dataElem.data['rm.rm_cat']);
		restrictionForTarget.addClause('rmtype.rm_type', dataElem.data['rm.rm_type']);
	}
	showForm.showInWindow({
		newRecord : false,
		anchor : button,
		restriction:restrictionForTarget,
		title : getMessage(target)
	});
	showForm.actions.get('delete').enableButton(true);
}

/**
 * Shared common function when click a room and assign to a department, type and etc.
 * @param assignTarget
 * @param pendingAssignments
 * @param room
 * @param selected
 */
function abSpConsole_onAssignSelectedRoom(assignmentTarget, assignments, pendingAssignments, room, selected) {
	var assignmentTargetType = assignmentTarget.type;
	switch(assignmentTargetType) {
	case 'division':
	case 'department':
		assignments.push(abSpConsole_genAssignmentForDvDp(assignmentTarget, room));
		break;
	case 'category':
	case 'type':
		assignments.push(abSpConsole_genAssignmentForRoomCat(assignmentTarget, room));
		break;
	case 'employee':
		break;
	}
	abSpConsole_assignTarget(pendingAssignments, assignments, selected);
}

/**
 * Assign special targets to pendingAssignments. 
 * @param pendingAssignments
 * @param assignments
 * @param selected
 */
function abSpConsole_assignTarget(pendingAssignments, assignments, selected) {
	if (selected) {
		for (var i = 0; i < assignments.length; i++) {
			pendingAssignments.addAssignment(assignments[i]);
		}
	} else {
		for (var j = 0; j < assignments.length; j++) {
			pendingAssignments.removeAssignment(assignments[j]);
		}
	}
}

/**
 * Get assignment for division or department.
 */
function abSpConsole_genAssignmentForDvDp(assignmentTarget, room) {
	return {
        bl_id: room.bl_id,
        fl_id: room.fl_id,
        rm_id: room.rm_id,
        to_dv_id: assignmentTarget.dv_id,
        to_dv_name: assignmentTarget.dv_name,
        to_dp_id: assignmentTarget.dp_id,
        to_dp_name: assignmentTarget.dp_name
    };
}

/**
 * Get assignment for room category.
 */
function abSpConsole_genAssignmentForRoomCat(assignmentTarget, room) {
	return {
		bl_id: room.bl_id,
		fl_id: room.fl_id,
		rm_id: room.rm_id,
        to_rm_cat: assignmentTarget.rm_cat,
        to_rm_type: assignmentTarget.rm_type
	};
}

/**
 * Handle the event of select room.
 * @param selectedRooms
 * @param room
 * @param selected
 */
function abSpConsole_onSelectedRoom(selectedRooms, room, selected) {
	if (selected) {
		if (!selectedRooms.findRoom(room)) {
    		selectedRooms.addRoom(room);
    	}
	} else {
		selectedRooms.removeRoom(room);
	}
}

/**
 * Open the hpattern dialog.
 * @param panelId
 * @param field
 */
function abSpConsole_openHpatternDialog(panelId, field) {
	 View.hpatternPanel = View.panels.get(panelId);
	 View.hpatternField = field;
	 View.patternString = View.hpatternPanel.getFieldValue(field);
	 View.openDialog('ab-hpattern-dialog.axvw', null, true, {
	        width: 700,
	        height: 530,
	        collapsible: false,
	        closeButton: false
	 });
}

/**
 * Gets field def from specified dataSource and field id.
 */
function abSpConsole_getFieldDef(dataSourceId, fieldId) {
	var fieldDefs = abSpConsole_getFieldDefs(dataSourceId);
	for (var i = 0, field; field = fieldDefs[i]; i++) {
		if (field.id === fieldId) {
			return field;
		}	
	}
	return {};
}

/**
 * Get field def of a datasource.
 * @param dataSourceId
 * @returns {Array}
 */
function abSpConsole_getFieldDefs(dataSourceId) {
	var fieldDefs = [];
	var dataSource = View.dataSources.get(dataSourceId);
	dataSource.fieldDefs.each(function (fieldDef) {
		fieldDefs.push(fieldDef);
	});
	return fieldDefs;
}
/**
 * filter special charactor.
 * @param value
 * @returns
 */
function makeLiteral(value){
	return value.replace(/\'/g, "''");
}

/**
 * Obtain the over assigned rooms from the pending assignments.
 * @param currentPendingAssignments
 */
function abSpConsole_getOverAssignmentRooms(currentPendingAssignments) {
	var roomsCountArray = [];
	var checkedRooms = [];
	var fromRooms = [];
	for(var i = 0; i < currentPendingAssignments.models.length; i++) {
		var assignment = currentPendingAssignments.models[i];
		var to_bl_id = assignment.attributes.to_bl_id==undefined ? "" : assignment.attributes.to_bl_id;
		var to_fl_id = assignment.attributes.to_fl_id==undefined ? "" : assignment.attributes.to_fl_id;
		var to_rm_id = assignment.attributes.to_rm_id==undefined ? "" : assignment.attributes.to_rm_id;
		
		var comparedRoom = {bl_id:to_bl_id, fl_id:to_fl_id, rm_id:to_rm_id};
		var targetRoom = to_bl_id + to_fl_id + to_rm_id;
		
		abSpConsole_updateRoomsAssignedCount(roomsCountArray, targetRoom);
		abSpConsole_saveNeedComparedAssignedRooms(checkedRooms, comparedRoom);
	}
	abSpConsole_getFromLocationRooms(currentPendingAssignments, fromRooms);
	return abSpConsle_getOverCapacityRooms(roomsCountArray, checkedRooms, fromRooms);
}

/**
 * Make an array of from locations.
 * @param currentPendingAssignments
 * @param fromRooms
 */
function abSpConsole_getFromLocationRooms(currentPendingAssignments, fromRooms) {
	for(var m = 0; m < currentPendingAssignments.models.length; m++) {
		var assignment = currentPendingAssignments.models[m];
		var emId = assignment.attributes.em_id;
		var fromRoom = abSpConsole_getEmployeeFromLocation(emId);
		fromRooms.push(fromRoom);
	}
}

/**
 * Update the assigned rooms count.
 * @param roomsCountArray
 * @param targetRoom
 */
function abSpConsole_updateRoomsAssignedCount(roomsCountArray, targetRoom) {
	var room_to_count = {room : targetRoom, count : 1};
	for (var j = 0; j < roomsCountArray.length; j++) {
		if (roomsCountArray[j].room == targetRoom) {
			roomsCountArray[j].count = roomsCountArray[j].count + 1;
			room_to_count = null;
		}
	}
	if (room_to_count) {
		roomsCountArray.push(room_to_count);
	}
}

/**
 * Save the rooms to check if they are over capacity.
 * @param savedRooms
 * @param needSavedRoom
 */
function abSpConsole_saveNeedComparedAssignedRooms(checkedRooms, comparedRoom) {
	var notFound = true;
	for(var i = 0; i < checkedRooms.length; i++) {
		var room = checkedRooms[i];
		var roomStr = room.bl_id + room.fl_id + room.rm_id;
		var needSavedRoomStr = comparedRoom.bl_id + comparedRoom.fl_id + comparedRoom.rm_id;
		if (roomStr == needSavedRoomStr) {
			notFound = false;
		}
	}
	if (notFound) {
		checkedRooms.push(comparedRoom);
	}
}

/**
 * Get all the rooms that are over capacity and return them.
 */
function abSpConsle_getOverCapacityRooms (roomsCountArray, checkedRooms, fromRooms) {
	var overCapacityRooms = [];
	for(var i = 0; i < checkedRooms.length; i++) {
		var room = checkedRooms[i];
		var buildingId = room.bl_id;
		var floorId = room.fl_id;
		var roomId = room.rm_id;
		var roomStr = buildingId+floorId+roomId;
		
		var capacity = abSpConsole_getFieldValueFromOccupancyDs(buildingId, floorId, roomId, 'rm.cap_em');
		var assignedCount = abSpConsole_getFieldValueFromOccupancyDs(buildingId, floorId, roomId, 'rm.caculated_count_em');
		
		var diff = capacity - assignedCount;
		
		for(var z = 0; z < fromRooms.length; z++) {
			var fromRoom = fromRooms[z];
			var fromRoomStr = fromRoom.bl_id + fromRoom.fl_id + fromRoom.rm_id;
			if (roomStr == fromRoomStr) {
				diff = diff + 1;
			}
		}
		
		for(var j = 0; j < roomsCountArray.length; j++) {
			var room_to_count = roomsCountArray[j];
			if (room_to_count.room == roomStr && diff < room_to_count.count) {
				overCapacityRooms.push(room);
			}
		}
	}
	
	return overCapacityRooms;
}

/**
 * Get special field value from occupancy datasource.
 */
function abSpConsole_getFieldValueFromOccupancyDs(buildingId, floorId, roomId, fieldName) {
	var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", buildingId, "=", true);
    restriction.addClause("rm.fl_id", floorId, "=", true);
    restriction.addClause("rm.rm_id", roomId, "=", true);
    var roomOccupancyDs = View.dataSources.get("roomOccupancyDS");
    var records = roomOccupancyDs.getRecords(restriction);
    var value = '';
    if (records != null && records.length > 0) 
        value = records[0].getValue(fieldName);
    return parseInt(value, 10);
}

/**
 * Get field value from occupiable datasource.
 * @param buildingId
 * @param floorId
 * @param roomId
 * @param fieldName
 * @returns {String}
 */
function abSpConsole_getFieldValueFromOccupiableDs(buildingId, floorId, roomId, fieldName) {
	var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", buildingId, "=", true);
    restriction.addClause("rm.fl_id", floorId, "=", true);
    restriction.addClause("rm.rm_id", roomId, "=", true);
    var roomOccupiableDs = View.dataSources.get("roomOccupiableDs");
    var records = roomOccupiableDs.getRecords(restriction);
    var value = '';
    if (records != null && records.length > 0) 
        value = records[0].getValue(fieldName);
    return parseInt(value);
}

/**
 * Get field value from occupiable datasource.
 * @param buildingId
 * @param floorId
 * @param roomId
 * @param fieldName
 * @returns {String}
 */
function abSpConsole_getRoomFromTeamOccupiableDs(buildingId, floorId, roomId, selectDateStart, selectDateEnd) {
	var restriction = new Ab.view.Restriction();
    restriction.addClause("rm.bl_id", buildingId, "=", true);
    restriction.addClause("rm.fl_id", floorId, "=", true);
    restriction.addClause("rm.rm_id", roomId, "=", true);
    var roomOccupiableDs = View.dataSources.get("teamOccupiableDs");
	roomOccupiableDs.addParameter('selectDateStart', selectDateStart);
	roomOccupiableDs.addParameter('selectDateEnd', selectDateEnd);
    var records = roomOccupiableDs.getRecords(restriction);
	return (records != null && records.length > 0) ? records[0] : null;
}

/**
 * Get the employee's location.
 * @param emId
 * @returns 
 */
function abSpConsole_getEmployeeFromLocation(emId) {
	var restriction = new Ab.view.Restriction();
	restriction.addClause("em.em_id", emId, "=", true);
	var emDs = View.dataSources.get("editEmployeeDS");
	var records = emDs.getRecords(restriction);
	var blId = '';
	var flId = '';
	var rmId = '';
	if(records != null && records.length > 0) {
		blId = records[0].getValue("em.bl_id") == null ? '' : records[0].getValue("em.bl_id");
		flId = records[0].getValue("em.fl_id") == null ? '' : records[0].getValue("em.fl_id");
		rmId = records[0].getValue("em.rm_id") == null ? '' : records[0].getValue("em.rm_id");
	}
	return {bl_id:blId, fl_id:flId, rm_id:rmId};
}

/**
 * Generate warning message when there are rooms over capacity.
 */
function abSpConsole_getOverCapacityWarningMessage (overCapacityRooms) {
	var warningMessage = '';
	var messageStart = '';
	if (overCapacityRooms.length == 1) {
		messageStart = getMessage('roomOverCapacityStart');
	} else {
		messageStart = getMessage('roomsOverCapacityStart');
	}
	warningMessage = warningMessage + messageStart;
	warningMessage = warningMessage + "<";
	for(var i = 0; i < overCapacityRooms.length; i++) {
		var room = overCapacityRooms[i];
		warningMessage = warningMessage + room.rm_id;
		if (i < overCapacityRooms.length-1) {
			warningMessage = warningMessage + ",";
		}
	}
	warningMessage = warningMessage + ">";
	
	var messageEnd = getMessage('roomOverCapacityEnd');
	warningMessage = warningMessage + " " + messageEnd;
	return warningMessage;
}

/**
 * Generate warning message from rooms not occupiable.
 */
function abSpConsole_getNonOccupiableWarningMessage (nonOccupiableRooms) {
	var warningMessage = '';
	var messageStart = '';
	if (nonOccupiableRooms.length == 1) {
		messageStart = getMessage('roomOverCapacityStart');
	} else {
		messageStart = getMessage('roomsOverCapacityStart');
	}
	warningMessage = warningMessage + messageStart;
	warningMessage = warningMessage + "<";
	for(var i = 0; i < nonOccupiableRooms.length; i++) {
		var room = nonOccupiableRooms[i];
		warningMessage = warningMessage + room.rm_id;
		if (i < nonOccupiableRooms.length-1) {
			warningMessage = warningMessage + ",";
		}
	}
	warningMessage = warningMessage + ">";
	
	var messageEnd = "";
	if (nonOccupiableRooms.length == 1) {
		messageEnd = getMessage('roomNonoccupiableMessageEnd');
	} else {
		messageEnd = getMessage('roomsNonoccupiableMessageEnd');
	}

	warningMessage = warningMessage + " " + messageEnd;
	return warningMessage;
}

/**
 * Get an array of rooms that are nonoccupiable.
 * @param currentPendingAssignments
 */
function abSpConsole_getNonoccupiableRooms(currentPendingAssignments) {
	var unoccupiableRooms = [];
	for(var i = 0; i < currentPendingAssignments.models.length; i++) {
		var assignment = currentPendingAssignments.models[i];
		var blId = assignment.attributes.to_bl_id==undefined ? "" : assignment.attributes.to_bl_id;
		var flId = assignment.attributes.to_fl_id==undefined ? "" : assignment.attributes.to_fl_id;
		var rmId = assignment.attributes.to_rm_id==undefined ? "" : assignment.attributes.to_rm_id;
		
		if(blId != "" && flId != "" && rmId != "") {
			var occupiable = abSpConsole_getFieldValueFromOccupiableDs(blId, flId, rmId, 'rmcat.occupiable');
			if(!occupiable || occupiable == 0) {
				var room = { bl_id:blId, fl_id:flId, rm_id:rmId };
				unoccupiableRooms.push(room);
			}
		}
	}
	return unoccupiableRooms;
}