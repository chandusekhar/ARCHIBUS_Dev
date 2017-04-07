// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	var controller = View.controllers.get('showCalendarActivity');
	var restriction = null;
	if (controller.display == 'activity') {
		restriction = {'activity_log.activity_log_id': primaryKey};
		Ab.view.View.openDialog('ab-proj-projects-calendar-activity-dialog.axvw', restriction, false, 20, 40, 800, 600);
	}
	else if (controller.display == 'wrkpkg') {		
		restriction = {'work_pkgs.project_id': controller.projectId, 'work_pkgs.work_pkg_id': primaryKey};
		Ab.view.View.openDialog('ab-proj-projects-calendar-wrkpkg-dialog.axvw', restriction, false, 20, 40, 800, 600); 
	}
	else {
		restriction = {'project.project_id': primaryKey};
		Ab.view.View.openDialog('ab-proj-projects-calendar-project-dialog.axvw', restriction, false, 20, 40, 800, 600); 
	}
}

// At startup, no event is loaded.
// The restriction on time is: select the events whose duration intersects [date_est_start, date_est_end].
// The restrictions on the other attributes are equality.

View.createController('showCalendarActivity', {
	display : 'activity',
	projectId : '',
	
	afterViewLoad: function(){
		onCalcEndDatesForProject('');
    	var calendarControl = new Ab.flash.Calendar(
	    	 	"projProjectsCalendarDiv",			// parent panel ID
	    	 	"projProjectsCalendarDs1",			// dataSourceId 
	    	 	"activity_log.activity_log_id", 	// primary key field
	    	 	"activity_log.action_title",		// summary field
	    	 	"activity_log.date_scheduled",		// startTime field
	    	 	"activity_log.date_scheduled_end",	// endTime field
	    		true								// whether to show weekend events
	    );
        this.projProjectsCalendarPanelHtml.setContentPanel(Ext.get('projProjectsCalendarDiv'));
    },
    
    projProjectsCalendarConsolePanel_onClear: function(){
    	this.projProjectsCalendarConsolePanel.clear();
    	if ($('projProjectsCalendarSelectDisplay')) $('projProjectsCalendarSelectDisplay').value = "2";
    },
    
    projProjectsCalendarConsolePanel_onFilter: function(){
		var calendarControl = Ab.view.View.getControl('', 'projProjectsCalendarDiv');
    	var displayValue = $('projProjectsCalendarSelectDisplay').value;
    	if (displayValue == "1") {
    		this.display = 'project';
    		calendarControl = new Ab.flash.Calendar(
    			"projProjectsCalendarDiv",			// parent panel ID
    	    	"projProjectsCalendarDs1",			// dataSourceId 
    	        "activity_log.project_id",		 	// primary key field
    	        "activity_log.project_id",			// summary field
    	        "activity_log.date_scheduled",		// startTime field
    	        "activity_log.date_scheduled_end",	// endTime field
    	        true								// whether to show weekend events
    	    );
            this.projProjectsCalendarPanelHtml.setContentPanel(Ext.get('projProjectsCalendarDiv'));
    	}
    	else if(displayValue == "2")
	    {
	    	this.display = 'activity';
	    	calendarControl = new Ab.flash.Calendar(
	    	 	"projProjectsCalendarDiv",			// parent panel ID
	    	 	"projProjectsCalendarDs1",			// dataSourceId 
	    	 	"activity_log.activity_log_id", 	// primary key field
	    	 	"activity_log.action_title",		// summary field
	    	 	"activity_log.date_scheduled",		// startTime field
	    	 	"activity_log.date_scheduled_end",	// endTime field
	    		true								// whether to show weekend events
	    	);
            this.projProjectsCalendarPanelHtml.setContentPanel(Ext.get('projProjectsCalendarDiv'));
	    }
	    else if(displayValue == "3")
	    {
	    	if (this.projProjectsCalendarConsolePanel.getFieldValue('project.project_id') == '') {
	    		View.showMessage(getMessage('projectNameRequired'));
	    		return;
	    	}
	    	this.projectId = this.projProjectsCalendarConsolePanel.getFieldValue('project.project_id');
	    	this.display = 'wrkpkg';
	    	calendarControl = new Ab.flash.Calendar(
	        	"projProjectsCalendarDiv",			// parent panel ID
	        	"projProjectsCalendarDs1",			// dataSourceId 
	        	"activity_log.work_pkg_id", 		// primary key field
	        	"activity_log.work_pkg_id",			// summary field
	        	"activity_log.date_scheduled",		// startTime field
	        	"activity_log.date_scheduled_end",	// endTime field
	            true								// whether to show weekend events
	        );
            this.projProjectsCalendarPanelHtml.setContentPanel(Ext.get('projProjectsCalendarDiv'));
	    }
		var restriction =  this.getConsoleRestriction();
		
		calendarControl.refreshData(restriction);
    },
        
	getConsoleRestriction: function() {
		var consolePanel = View.panels.get('projProjectsCalendarConsolePanel');
		var siteString = "EXISTS (SELECT 1 FROM project, site WHERE activity_log.project_id = project.project_id AND site.site_id = project.site_id AND ";
		var rmString = "EXISTS (SELECT 1 FROM rm WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND ";

		var restriction = " 1=1 ";
		
    	// activity_log table
   		if (consolePanel.getFieldValue('activity_log.activity_type')) restriction += " AND activity_log.activity_type LIKE \'%" + getValidValue('activity_log.activity_type') + "%\' ";		
    			
   		// project table
   		if (consolePanel.getFieldValue('project.bl_id')) restriction += " AND project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\' ";   		
   		if (consolePanel.getFieldValue('project.project_id')) restriction += " AND project.project_id = \'" + getValidValue('project.project_id') +"\' ";    			
   		if (consolePanel.getFieldValue('project.project_type')) restriction += " AND project.project_type LIKE \'%" + getValidValue('project.project_type') + "%\' ";  		
   		if (consolePanel.getFieldValue('project.dv_id')) {
   			restriction += " AND (project.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' OR ";
   			restriction += " activity_log.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' OR ";
   			restriction += rmString + " rm.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\')) ";
   		}
   		if (consolePanel.getFieldValue('project.dp_id')) {
   			restriction += " AND (project.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' OR ";
   			restriction += " activity_log.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' OR ";
   			restriction += rmString + " rm.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\')) ";
   		}
   		if (consolePanel.getFieldValue('project.program_id')) restriction += " AND project.program_id LIKE \'%" + getValidValue('project.program_id') + "%\' ";
   		if (consolePanel.getFieldValue('project.apprv_mgr1')) restriction += " AND project.apprv_mgr1 LIKE \'%" + getValidValue('project.apprv_mgr1') + "%\' ";
   			
   		
   		// bl
   		if (consolePanel.getFieldValue('bl.state_id')) restriction += " AND (bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\' OR " + siteString + " site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) ";
   		if (consolePanel.getFieldValue('bl.city_id')) restriction += " AND (bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\' OR " + siteString + " site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) ";
   		if (consolePanel.getFieldValue('bl.site_id')) restriction += " AND (bl.site_id LIKE \'%" + getValidValue('bl.site_id') + "%\' OR project.site_id LIKE \'%" + getValidValue('bl.site_id') + "%\') ";

		return restriction;
	}
 });

function onProjectIdSelval()
{
	var restriction = "project.is_template = 0 ";
	var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";
	
	var consolePanel = View.panels.get('projProjectsCalendarConsolePanel');
	restriction = buildSelvalRestriction('project.project_type', restriction);
	restriction = buildSelvalRestriction('project.program_id', restriction);
	restriction = buildSelvalRestriction('project.proj_mgr', restriction);
	restriction = buildSelvalRestriction('project.bl_id', restriction);
	restriction = buildSelvalRestriction('project.site_id', restriction);
	restriction = buildSelvalRestriction('project.dp_id', restriction);
	restriction = buildSelvalRestriction('project.dv_id', restriction);
	restriction = buildSelvalRestriction('project.apprv_mgr1', restriction);// in Project Calendar console
	
	if (consolePanel.getFieldValue('bl.state_id')) 
	{
		if (restriction) restriction += " AND ";
		restriction += " (" + blString + "bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\') OR ";
		restriction += " " + siteString + "site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\'))";
	}
	if (consolePanel.getFieldValue('bl.city_id'))	
   	{
   		if (restriction) restriction += " AND ";
   		restriction += " (" + blString + "bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\') OR ";
   		restriction += " " + siteString + "site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\'))";
   	} 
   	
	var title = '';
	if (getMessage('customProjectIdSelvalTitle') != 'customProjectIdSelvalTitle') title = getMessage('customProjectIdSelvalTitle');
	else title = getMessage('projectIdSelvalTitle');
	View.selectValue('projProjectsCalendarConsolePanel', title,['project.project_id'],'project',['project.project_id'],['project.project_id','project.project_name','project.status','project.summary'],restriction);
}

function buildSelvalRestriction(fieldName, restriction)
{
	var consolePanel = View.panels.get('projProjectsCalendarConsolePanel');
	if (consolePanel.getFieldValue(fieldName))
	{
		if (restriction) restriction += " AND ";
		restriction += fieldName+" LIKE \'%"+getValidValue(fieldName)+"%\'";
	}	
	return restriction;
}

function getValidValue(inputFieldName)
{
	var consolePanel = View.panels.get('projProjectsCalendarConsolePanel');
	var fieldValue = consolePanel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function onCalcEndDatesForProject(project_id)
{
	var parameters = {'project_id':project_id};
	var result = Workflow.callMethodWithParameters('AbCommonResources-ActionService-calcActivityLogDateSchedEndForProject',parameters);
	if (result.code == 'executed') {
		return true;		
	} 
	else 
	{
		alert(result.code + " :: " + result.message);
		return false;
	}	
}
