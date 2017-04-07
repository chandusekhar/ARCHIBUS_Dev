
View.createController('abCbRptFilter', {

	flIdsRestr:" 1=1",
	rmIdsRestr:" 1=1",
	isProjectRequired: false,
	isShowRoomsVisible: false,
	
	afterViewLoad:function(){
		if(this.isProjectRequired){
			this.abCbRptConsolePanel.setInstructions(getMessage("selectProject"));
			//this.abCbRptConsolePanel.fields.items[2].dom.required = true;
		} else {
			this.abCbRptConsolePanel.fields.get("activity_log.project_id").fieldDef.required = false;
			removeStar(this.abCbRptConsolePanel, "activity_log.project_id");
		}
		
		// Display "Show Rooms" only for assessors and abatement workers
		if(this.view.taskInfo.processId == "Field Assessor" || this.view.taskInfo.processId == "Abatement Worker"){
			this.isShowRoomsVisible = true;
		} else {
			document.getElementById("abCbRptConsolePanel_vf_showRooms_labelCell").firstChild.data = "";
			var selectNode = document.getElementById("showRooms");
			selectNode.parentNode.removeChild(selectNode);
		}
	},
	
	abCbRptConsolePanel_onShow:function(){
		
		if(this.isProjectRequired && !this.abCbRptConsolePanel.getFieldValue('activity_log.project_id')){
			
			View.showMessage(getMessage("selectProject"));
			return;
		}
		
		
		var restrictions = this.getSqlRestriction();
		
		//this function will be implemented everywhere the filter panel view will be used.
		applyFilterRestriction(restrictions);
		
	},
	
	/**
	 * Read filter's fields and returns a sql restriction based on fields' values.
	 * 
	 */
	getSqlRestriction: function(){
		
		var genericRestriction = "1=1";
		var blRestriction = "1=1";
		var flRestriction = "1=1";
		var rmRestriction = "1=1";
		var printableRestriction = [];
		var projectsRestr = "1=1";

		var vf_showRooms = null;
		var showRooms = null;
		var showRoomsValue = null;
		var showRoomsTitle = null;

		if(this.isShowRoomsVisible){
			vf_showRooms = this.abCbRptConsolePanel.fields.get("vf_showRooms").fieldDef;
			showRooms = document.getElementById("showRooms");
			showRoomsValue = showRooms.options[showRooms.selectedIndex].value;
			showRoomsTitle = showRooms.options[showRooms.selectedIndex].text;
		}
		
		if(this.abCbRptConsolePanel.getFieldValue('bl.ctry_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('bl.ctry_id');
			genericRestriction += " and bl.ctry_id in ('" + fieldValue.join("','") +"') ";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'bl.ctry_id'), 'value': fieldValue.join(", ")});
		}

		if(this.abCbRptConsolePanel.getFieldValue('bl.site_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('bl.site_id');
			genericRestriction += " and bl.site_id in ('" + fieldValue.join("','") +"') ";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'bl.site_id'), 'value': fieldValue.join(", ")});
		}

		if(this.abCbRptConsolePanel.getFieldValue('activity_log.project_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('activity_log.project_id');
			projectsRestr = " activity_log.project_id IN ('" + fieldValue.join("','") +"')";
			blRestriction += " and bl.bl_id in (select activity_log.bl_id from activity_log  where " + projectsRestr + " )";
			
			// If Show Rooms = "All In Building", we show all floors and rooms of the building, regardless of the project
			if(showRoomsValue != "allInBuilding"){
				flRestriction += " and EXISTS (select 1 from activity_log  where fl.bl_id = activity_log.bl_id and fl.fl_id = activity_log.fl_id and " + projectsRestr + " )";
				rmRestriction += " and EXISTS(select 1 from activity_log  where  rm.bl_id = activity_log.bl_id and rm.fl_id = activity_log.fl_id and rm.rm_id = activity_log.rm_id and " + projectsRestr + " )";
			}
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'activity_log.project_id'), 'value': fieldValue.join(", ")});
		}

		if(this.abCbRptConsolePanel.getFieldValue('dateBuiltFrom')){
			var fieldValue = this.abCbRptConsolePanel.getFieldValue('dateBuiltFrom');
			genericRestriction += " and bl.date_bl >= ${sql.date('" + fieldValue +"')}";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'dateBuiltFrom'), 'value': fieldValue});
		}

		if(this.abCbRptConsolePanel.getFieldValue('bl.regn_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('bl.regn_id');
			genericRestriction += " and bl.regn_id in ('" + fieldValue.join("','") +"') ";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'bl.regn_id'), 'value': fieldValue.join(", ")});
		}

		if(this.abCbRptConsolePanel.getFieldValue('activity_log.bl_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('activity_log.bl_id');
			blRestriction += " and bl.bl_id in ('" + fieldValue.join("','") +"') ";
			flRestriction += " and fl.bl_id in ('" + fieldValue.join("','") +"') ";
			rmRestriction += " and rm.bl_id in ('" + fieldValue.join("','") +"') ";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'activity_log.bl_id'), 'value': fieldValue.join(", ")});
		}

		if(this.abCbRptConsolePanel.getFieldValue('bl.construction_type')){
			var fieldValue = this.abCbRptConsolePanel.getFieldValue('bl.construction_type');
			genericRestriction += " and bl.construction_type = '" + fieldValue + "'";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'bl.construction_type'), 'value': fieldValue});
		}

		if(this.abCbRptConsolePanel.getFieldValue('dateBuiltTo')){
			var fieldValue = this.abCbRptConsolePanel.getFieldValue('dateBuiltTo');
			genericRestriction += "  and bl.date_bl <=  ${sql.date('" + fieldValue + "')}";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'dateBuiltTo'), 'value': fieldValue});
		}

		if(this.abCbRptConsolePanel.getFieldValue('bl.state_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('bl.state_id');
			genericRestriction += " and bl.state_id in ('" + fieldValue.join("','") +"') ";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'bl.state_id'), 'value': fieldValue.join(", ")});
		}

		if(this.abCbRptConsolePanel.getFieldValue('activity_log.fl_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('activity_log.fl_id');
			blRestriction += " and bl.bl_id in ( SELECT fl.bl_id from fl where fl_id in ('" + fieldValue.join("','") +"') )";
			flRestriction += " and fl.fl_id in ('" + fieldValue.join("','") +"')";
			rmRestriction += " and rm.fl_id in ('" + fieldValue.join("','") +"')";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'activity_log.fl_id'), 'value': fieldValue.join(", ")});
		}
		
		if(this.abCbRptConsolePanel.getFieldValue('bl.use1')){
			var fieldValue = this.abCbRptConsolePanel.getFieldValue('bl.use1');
			genericRestriction += " and bl.use1 = '" + fieldValue + "'";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'bl.use1'), 'value': fieldValue});
		}

		if(this.abCbRptConsolePanel.getFieldValue('dateRehabFrom')){
			var fieldValue = this.abCbRptConsolePanel.getFieldValue('dateRehabFrom');
			genericRestriction += " and bl.date_rehab >= ${sql.date('" + fieldValue +"')}";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'dateRehabFrom'), 'value': fieldValue});
		}

		if(this.abCbRptConsolePanel.getFieldValue('bl.city_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('bl.city_id');
			genericRestriction += " and bl.city_id in ('" + fieldValue.join("','") +"') ";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'bl.city_id'), 'value': fieldValue.join(", ")});
		}

		if(this.abCbRptConsolePanel.getFieldValue('activity_log.rm_id')){
			var fieldValue = this.abCbRptConsolePanel.getFieldMultipleValues('activity_log.rm_id');
			blRestriction += " and bl.bl_id in ( SELECT rm.bl_id from rm where rm_id in ('" + fieldValue.join("','") +"') )";
			flRestriction += " and fl.fl_id in ( SELECT rm.fl_id from rm where rm_id in ('" + fieldValue.join("','") +"') )";
			rmRestriction += " and rm.rm_id in ('" + fieldValue.join("','") +"')";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'activity_log.rm_id'), 'value': fieldValue.join(", ")});
		}
		
		if(this.isShowRoomsVisible){
			var showRoomsRestr = "1=1";
			var assessAndActions = "(activity_log.activity_type = 'ASSESSMENT - HAZMAT' OR activity_log.activity_type LIKE 'HAZMAT -%')";
			var serviceRequests = "activity_log.activity_type = 'SERVICE DESK - MAINTENANCE'";
			var assignedAssessAndActions = "(activity_log.assessed_by = ${sql.literal(user.name)} OR activity_log.assigned_to IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)})"
											+ " OR activity_log.hcm_abate_by IN (SELECT person_id FROM cb_accredit_person WHERE cb_accredit_person.em_id = ${sql.literal(user.employee.id)}))";
			var assignedServiceRequests = "(activity_log.supervisor = ${sql.literal(user.employee.id)}"
											+ " OR (activity_log.supervisor IS NULL AND NOT activity_log.work_team_id IS NULL AND activity_log.work_team_id IN (SELECT work_team_id FROM cf WHERE email = ${sql.literal(user.email)})))";
			
			if(showRoomsValue == "assignedOnly"){
				/*
				 * "Assigned Only" - Show only buildings, floors, and rooms where the logged in user was assigned activity_log items
				 * (hazmat assessments, action items, service requests) in the selected projects.
				 * To determine assignment, use same logic as for "Manage My Assessment Items" and "Manage My Activity Items".
				 */
				var assignedAssessAndActionsRestr = "(" + assessAndActions + " AND " + assignedAssessAndActions + ")";
				var assignedServiceRequestRestr = "(" + serviceRequests	+ " AND " + assignedServiceRequests + ")";
				showRoomsRestr = "(" + assignedAssessAndActionsRestr + " OR " + assignedServiceRequestRestr	+ ") AND " + projectsRestr;
				blRestriction += " AND bl.bl_id IN (SELECT activity_log.bl_id FROM activity_log WHERE " + showRoomsRestr + " )";
				flRestriction += " AND EXISTS (SELECT 1 FROM activity_log WHERE fl.bl_id = activity_log.bl_id AND fl.fl_id = activity_log.fl_id AND " + showRoomsRestr + " )";
				rmRestriction += " AND EXISTS (SELECT 1 FROM activity_log WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND " + showRoomsRestr + " )";
			} else if(showRoomsValue == "projectOnly"){
				/*
				 * "Project Only" - Show only buildings, floors, and rooms where there are activity_log items
				 * (hazmat assessments, action items, service requests) for the selected projects, regardless of assignment.
				 */
				showRoomsRestr = "(" + assessAndActions + " OR " + serviceRequests	+ ") AND " + projectsRestr;
				blRestriction += " AND bl.bl_id IN (SELECT activity_log.bl_id FROM activity_log WHERE " + showRoomsRestr + " )";
				flRestriction += " AND EXISTS (SELECT 1 FROM activity_log WHERE fl.bl_id = activity_log.bl_id AND fl.fl_id = activity_log.fl_id AND " + showRoomsRestr + " )";
				rmRestriction += " AND EXISTS (SELECT 1 FROM activity_log WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND " + showRoomsRestr + " )";
			} else if(showRoomsValue == "allInBuilding"){
				/*
				 * "All in Building" - Show only buildings where there are activity_log items (hazmat assessments, action items, service requests)
				 * for the selected projects, regardless of assignment.
				 * For those buildings, show all floors and rooms in the building, do not filter by selected project or activity_log.
				 * Do apply any Floor and Room restriction specified in the Filter panel.
				 */
				showRoomsRestr = "(" + assessAndActions + " OR " + serviceRequests	+ ") AND " + projectsRestr;
				blRestriction += " AND bl.bl_id IN (SELECT activity_log.bl_id FROM activity_log WHERE " + showRoomsRestr + " )";
			}

			printableRestriction.push({'title': vf_showRooms.title, 'value': showRoomsTitle});
		}
		
		if(this.abCbRptConsolePanel.getFieldValue('dateRehabTo')){
			var fieldValue = this.abCbRptConsolePanel.getFieldValue('dateRehabTo');
			genericRestriction += " and bl.date_rehab <= ${sql.date('" + fieldValue +"')}";
			printableRestriction.push({'title': getTitleOfConsoleField(this.abCbRptConsolePanel, 'dateRehabTo'), 'value': fieldValue});
		}
		
		return {
			'blRestriction': blRestriction + " and " + genericRestriction,
			'flRestriction': flRestriction + " and fl.bl_id in (select bl.bl_id from bl where " + genericRestriction + ")",
			'rmRestriction': rmRestriction + " and rm.bl_id in (select bl.bl_id from bl where " + genericRestriction + ")",
			'printableRestriction': printableRestriction
		};
	}
    
})

/**
 * Custom 'selectValue' action used by fields: fl_id and rm_id. 
 * Add to restriction project_id if selected.
 * 
 * @param fieldNames
 * @param selectFieldNames
 * @param visibleFieldNames
 * @param fieldId
 * @param selectTableName
 */
function selectValue(fieldNames, selectFieldNames, visibleFieldNames, fieldId, selectTableName){
		
	var restriction = "1=1";
	var projectId = View.panels.get('abCbRptConsolePanel').getFieldMultipleValues('activity_log.project_id');
	if (projectId.length>0 && projectId[0] != undefined && projectId[0] != "") {
		if(fieldId == "fl_id"){
			restriction  = "(EXISTS (select 1 from activity_log where activity_log.fl_id = fl.fl_id and activity_log.bl_id = fl.bl_id and activity_log.project_id in ('" + projectId.join("','") + "')))";
		}else{
			restriction  = "(EXISTS (select 1 from activity_log where activity_log.fl_id = rm.fl_id and activity_log.bl_id = rm.bl_id and rm.rm_id = activity_log.rm_id and activity_log.project_id in ('" + projectId.join("','") + "')))";
		}
	}
	
	View.selectValue(
			'abCbRptConsolePanel',
			getMessage(fieldId),
			fieldNames,
			selectTableName,
			selectFieldNames,
			visibleFieldNames,
			restriction,
			null, null, null, null, null, null, 
			'multiple'
	);
}

function removeStar(form, fieldName){
	form.fields.get(fieldName).fieldDef.required = false;
	var starSpan = form.getFieldElement(fieldName).parentNode.previousSibling.lastChild;
	starSpan.parentNode.removeChild(starSpan);
}
