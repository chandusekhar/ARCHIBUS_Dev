function projSelvalWithRestriction()
{
	var controller = View.controllers.get('projGanttChart');
	var restriction = new Ab.view.Restriction();
	var title = '';
	if (controller.view_type == 'baseline') {
		restriction.addClause('project.status', 'Requested');
		title = getMessage('projSelvalTitleBaseline');
	} else if (controller.view_type == 'design') {
		restriction.addClause('project.status', ['Approved', 'Approved-In Design'], 'IN');
		title = getMessage('projSelvalTitleDesign');
	} else {
		restriction.addClause('project.status', ['Approved', 'Approved-In Design', 'Issued-In Process', 'Issued-On Hold', 'Completed-Pending','Completed-Not Ver'], 'IN');
		title = getMessage('projSelvalTitleActive');
	}
	if (View.taskInfo.activityId == 'AbProjCommissioning') {
		restriction.addClause('project.project_type', 'COMMISSIONING');
	}
	View.selectValue({
    	formId: 'projGanttChartConsole',
    	selectValueType: (controller.is_eam_project?'multiple':'grid'),
    	title: title,
    	fieldNames: ['activity_log.project_id'],
    	selectTableName: 'project',
    	selectFieldNames: ['project.project_id'],
    	visibleFieldNames: ['project.project_id','project.project_name','project.project_type','project.status','project.summary'],
    	restriction: restriction,
    	actionListener: 'afterSelectProject'
    });
}

function afterSelectProject(fieldName, selectedValue, previousValue) {
	var controller = View.controllers.get('projGanttChart');
	var minDate = controller.getMinProjectActionsDate(selectedValue);
	var maxDate = controller.getMaxProjectActionsDate(selectedValue);
	var formattedMinDate = (minDate)? reformatDate(dateAddDays(minDate, -30), 'YYYY-MM-DD', strDateShortPattern): "";
	var formattedMaxDate = (maxDate)? reformatDate(dateAddDays(maxDate, 30), 'YYYY-MM-DD', strDateShortPattern): "";
	controller.projGanttChartConsole.setFieldValue("activity_log.date_planned_for", formattedMinDate);
	controller.projGanttChartConsole.setFieldValue("activity_log.date_planned_end", formattedMaxDate);
    return true;
}

function workpkgSelvalWithRestriction()
{
	var controller = View.controllers.get('projGanttChart');
	var restriction = '';
	var projecttype = '';
	var title = '';
	if (View.taskInfo.activityId == 'AbProjCommissioning') {
		projecttype = " AND project.project_type = 'COMMISSIONING'";
	}
	if (controller.view_type == 'baseline') {
		restriction = "EXISTS(SELECT * FROM project WHERE project.project_id = work_pkgs.project_id AND project.status IN ('Requested')" + projecttype + ")";
		title = getMessage('workpkgSelvalTitleBaseline');
	} else if (controller.view_type == 'design') {
		restriction = "EXISTS(SELECT * FROM project WHERE project.project_id = work_pkgs.project_id AND project.status IN ('Approved', 'Approved-In Design')" + projecttype + ")";
		title = getMessage('workpkgSelvalTitleDesign');
	} else {
		restriction = "EXISTS(SELECT * FROM project WHERE project.project_id = work_pkgs.project_id AND project.status IN ('Approved', 'Approved-In Design', 'Issued-In Process', 'Issued-On Hold', 'Completed-Pending','Completed-Not Ver')" + projecttype + ")";
		title = getMessage('workpkgSelvalTitleActive');
	}	
	if (controller.is_mc == true || controller.is_stat == true) {
		restriction = { 'project.project_id' : controller.projectId };
		title = getMessage('optionWorkpkg');
	}
	View.selectValue({
    	formId: 'projGanttChartConsole',
    	title: title,
    	fieldNames: ['activity_log.project_id', 'activity_log.work_pkg_id'],
    	selectTableName: 'work_pkgs',
    	selectFieldNames: ['work_pkgs.project_id', 'work_pkgs.work_pkg_id'],
    	visibleFieldNames: ['work_pkgs.project_id', 'work_pkgs.work_pkg_id','work_pkgs.summary'],
    	restriction: restriction,
    	actionListener: 'afterSelectWorkpkg'
    });
}

function afterSelectWorkpkg(fieldName, selectedValue, previousValue) {
	var controller = View.controllers.get('projGanttChart');
	if (fieldName == 'activity_log.project_id') controller.selected_project_id = selectedValue;
	else if (fieldName == 'activity_log.work_pkg_id') {
		var minDate = controller.getMinProjectActionsDate(controller.selected_project_id, selectedValue);
		var maxDate = controller.getMaxProjectActionsDate(controller.selected_project_id, selectedValue);
		var formattedMinDate = (minDate)? reformatDate(dateAddDays(minDate, -30), 'YYYY-MM-DD', strDateShortPattern): "";
		var formattedMaxDate = (maxDate)? reformatDate(dateAddDays(maxDate, 30), 'YYYY-MM-DD', strDateShortPattern): "";
		controller.projGanttChartConsole.setFieldValue("activity_log.date_planned_for", formattedMinDate);
		controller.projGanttChartConsole.setFieldValue("activity_log.date_planned_end", formattedMaxDate);
	}
    return true;
}

function getRestrictionFromConsole(level) {
	var controller = View.controllers.get('projGanttChart');
	var restriction = ' 1=1 ';
	var projectWorkpkgString = "EXISTS (SELECT 1 FROM project WHERE project.project_id = work_pkgs.project_id AND ";
	var projectString = "EXISTS (SELECT 1 FROM project WHERE activity_log.project_id = project.project_id AND ";
	var blString = "EXISTS (SELECT 1 FROM project, bl WHERE activity_log.project_id = project.project_id AND bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM project, site WHERE activity_log.project_id = project.project_id AND site.site_id = project.site_id AND ";
	
	if (level == 0) {
		if (controller.projGanttChartConsole.getFieldValue('activity_log.project_id'))
    		restriction += " AND project.project_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.project_id')) + "'";
		if (controller.projGanttChartConsole.getFieldValue('activity_log.bl_id'))
    		restriction += " AND project.bl_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.bl_id')) + "'";
		if (controller.projGanttChartConsole.getFieldValue('project.site_id'))
    		restriction += " AND project.site_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('project.site_id')) + "'";
		if (controller.projGanttChartConsole.getFieldValue('project.proj_mgr'))
    		restriction += " AND project.proj_mgr = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('project.proj_mgr')) + "'";
		if (controller.displayLevels == '0') { /* Apply date restriction to project fields only if projects alone are being shown */
			if (controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for'))
	    		restriction += " AND NOT(" + controller.project_from_date_field + " < #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for') + "%" +
	    				" AND " + controller.project_to_date_field + " < #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for') + "%)";
			if (controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end'))
	    		restriction += " AND NOT(" + controller.project_from_date_field + " > #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end') + "%" +
	    				" AND " + controller.project_to_date_field + " > #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end') + "%)";
		}
	} 
	
	else if (level == 1) {
		if (controller.projGanttChartConsole.getFieldValue('activity_log.project_id')) 
    		restriction += " AND work_pkgs.project_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.project_id')) + "'";
    	if (controller.projGanttChartConsole.getFieldValue('activity_log.work_pkg_id')) 
    		restriction += " AND work_pkgs.work_pkg_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.work_pkg_id')) + "'";
    	if (controller.projGanttChartConsole.getFieldValue('activity_log.bl_id'))
    		restriction += " AND " + projectWorkpkgString + "project.bl_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.bl_id')) + "')";
		if (controller.projGanttChartConsole.getFieldValue('project.site_id'))
    		restriction += " AND " + projectWorkpkgString + "project.site_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('project.site_id')) + "')";
		if (controller.projGanttChartConsole.getFieldValue('project.proj_mgr'))
    		restriction += " AND " + projectWorkpkgString + "project.proj_mgr = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('project.proj_mgr')) + "')";
		if (controller.displayLevels == "1" || controller.displayLevels == "0;1") { /* Apply date restriction to work pkg fields only if work pkgs alone or projects and work pkgs are being shown */
			if (controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for'))
	    		restriction += " AND NOT(" + controller.workpkg_from_date_field + " < #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for') + "%" +
	    				" AND " + controller.workpkg_to_date_field + " < #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for') + "%)";
			if (controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end'))
	    		restriction += " AND NOT(" + controller.workpkg_from_date_field + " > #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end') + "%" +
	    				" AND " + controller.workpkg_to_date_field + " > #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end') + "%)";
		}
	} 
	
	else if (level == 2) {
		if (controller.projGanttChartConsole.getFieldValue('activity_log.project_id')) 
    		restriction += " AND activity_log.project_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.project_id')) + "'";
    	if (controller.projGanttChartConsole.getFieldValue('activity_log.work_pkg_id'))
    		restriction += " AND activity_log.work_pkg_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.work_pkg_id')) + "'";
    	if (controller.projGanttChartConsole.getFieldValue('activity_log.activity_type')) 
    		restriction += " AND activity_log.activity_type = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.activity_type')) + "'";
    	if (controller.projGanttChartConsole.getFieldValue('activity_log.bl_id'))
    		restriction += " AND " + projectString + "project.bl_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('activity_log.bl_id')) + "')";
		if (controller.projGanttChartConsole.getFieldValue('project.site_id')) {
	   		restriction += " AND (" + projectString + "project.site_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('project.site_id')) + "') OR ";
	   		restriction += blString + "bl.site_id = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('project.site_id')) + "'))";
	   	}
		if (controller.projGanttChartConsole.getFieldValue('project.proj_mgr'))
    		restriction += " AND " + projectString + "project.proj_mgr = '" + getValidValue(controller.projGanttChartConsole.getFieldValue('project.proj_mgr')) + "')";
		if (controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for'))
    		restriction += " AND NOT(" + controller.activity_from_date_field + " < #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for') + "%" +
    				" AND " + controller.activity_to_date_field + " < #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_for') + "%)";
		if (controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end'))
    		restriction += " AND NOT(" + controller.activity_from_date_field + " > #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end') + "%" +
    				" AND " + controller.activity_to_date_field + " > #Date%" + controller.projGanttChartConsole.getFieldValue('activity_log.date_planned_end') + "%)";
	}
	return restriction;
}

function afterSelectDisplay() {
	var value = $('projGanttChartSelectDisplay').value;
	if (value == 3 || value == 2) View.panels.get('projGanttChartConsole').enableField('activity_log.activity_type', true);
	else View.panels.get('projGanttChartConsole').enableField('activity_log.activity_type', false);
}
