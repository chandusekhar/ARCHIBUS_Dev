// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	var controller = View.controllers.get('showCalendarActivity');
	var restriction = new Ab.view.Restriction();
	var activityId = View.taskInfo.activityId;
	if (controller.display == 'activity') {
		restriction.addClause('activity_log.activity_log_id',primaryKey,'=');
		View.openDialog('ab-proj-projects-calendar-activity-dialog.axvw', restriction, false, 20, 40, 800, 600);
	}
	else if( controller.display == 'project') {
		restriction.addClause('project.project_id',primaryKey,'=');
		if (activityId == 'AbMoveManagement') {
			View.openDialog('ab-mo-calendar-project-dialog.axvw', restriction, false, 20, 40, 800, 600);
		}
		else {
			View.openDialog('ab-proj-projects-calendar-project-dialog.axvw', restriction, false, 20, 40, 800, 600);
		}
	}else if(controller.display == 'move'){
		restriction.addClause('mo.mo_id',primaryKey,'=');
		View.openDialog('ab-mo-calendar-move-dialog.axvw', restriction, false, 20, 40, 800, 600);
	}
}

// At startup, no event is loaded.
// The restriction on time is: select the events whose duration intersects [date_est_start, date_est_end].
// The restrictions on the other attributes are equality.

/*
 * 04/03/2010 IOAN - Changes for move management
 * add individual move 
 * add another drilldown project details
 */


View.createController('showCalendarActivity', {
	display : 'move',
	
	afterViewLoad: function(){
		onCalcEndDatesForProject('');
        var calendarControl = new Ab.flash.Calendar(
	    	"projProjectsMovesCalendarDiv",			// parent panel ID
	    	"projProjectsMovesCalendarDs0",			// dataSourceId 
	    	"mo.mo_id", 						// primary key field
	    	"mo.em_id",							// summary field
	    	"mo.date_start_req",				// startTime field
	    	"mo.date_to_perform",				// endTime field
	    	true								// whether to show weekend events
	    );
        this.projProjectsMovesCalendarPanelHtml.setContentPanel(Ext.get('projProjectsMovesCalendarDiv'));
    },
    
    afterInitialDataFetch: function(){
		selectDisplay();
    },
    
    projProjectsMovesCalendarConsolePanel_onClear: function(){
    	this.projProjectsMovesCalendarConsolePanel.clear();
    	if ($('projProjectsMovesCalendarSelectDisplay')) $('projProjectsMovesCalendarSelectDisplay').value = "1";
    	selectDisplay();
    },
    
    projProjectsMovesCalendarConsolePanel_onFilter: function(){
    	var calendarControl = Ab.view.View.getControl('', 'projProjectsMovesCalendarDiv');
    	var displayValue = $('projProjectsMovesCalendarSelectDisplay').value;
    	if (displayValue == "1") {
	    	this.display = 'move';
	    	calendarControl = new Ab.flash.Calendar(
	    	 	"projProjectsMovesCalendarDiv",			// parent panel ID
	    	 	"projProjectsMovesCalendarDs0",			// dataSourceId 
	    	 	"mo.mo_id", 						// primary key field
	    	 	"mo.em_id",							// summary field
	    	 	"mo.date_start_req",				// startTime field
	    	 	"mo.date_to_perform",				// endTime field
	    		true								// whether to show weekend events
	    	);
            this.projProjectsMovesCalendarPanelHtml.setContentPanel(Ext.get('projProjectsMovesCalendarDiv'));
    	}
    	else if(displayValue == "2")
	    {
    		this.display = 'project';
    		calendarControl = new Ab.flash.Calendar(
    			"projProjectsMovesCalendarDiv",		// parent panel ID
    	    	"projProjectsMovesCalendarDs1",		// dataSourceId 
    	        "project.project_id",		 	// primary key field
    	        "project.project_id",			// summary field
    	        "project.date_start",			// startTime field
    	        "project.date_end",				// endTime field
    	        true							// whether to show weekend events
    	    );
            this.projProjectsMovesCalendarPanelHtml.setContentPanel(Ext.get('projProjectsMovesCalendarDiv'));
	    }
    	else if(displayValue == "3")
	    {
	    	this.display = 'activity';
	    	calendarControl = new Ab.flash.Calendar(
	    	 	"projProjectsMovesCalendarDiv",			// parent panel ID
	    	 	"projProjectsMovesCalendarDs2",			// dataSourceId 
	    	 	"activity_log.activity_log_id", 	// primary key field
	    	 	"activity_log.activity_log_id",		// summary field
	    	 	"activity_log.date_scheduled",		// startTime field
	    	 	"activity_log.date_scheduled_end",	// endTime field
	    		true								// whether to show weekend events
	    	);
            this.projProjectsMovesCalendarPanelHtml.setContentPanel(Ext.get('projProjectsMovesCalendarDiv'));
	    }
		var restriction = ''
		if (this.display == 'move') {
			restriction = this.getConsoleRestrictionMoveOrder();
		}
		else if (this.display == 'project'){
			restriction = this.getConsoleRestrictionProject();
		}
		else {
			restriction = this.getConsoleRestriction();
		}
		calendarControl.refreshData(restriction);
    },
        
	getConsoleRestriction: function() {
		var consolePanel = View.panels.get('projProjectsMovesCalendarConsolePanel');
		var siteString = "EXISTS (SELECT 1 FROM project, site WHERE activity_log.project_id = project.project_id AND site.site_id = project.site_id AND ";
		var rmString = "EXISTS (SELECT 1 FROM rm WHERE rm.bl_id = activity_log.bl_id AND rm.fl_id = activity_log.fl_id AND rm.rm_id = activity_log.rm_id AND ";

		var restriction = " project.project_type = 'Move' ";
		
    	// activity_log table
   		if (consolePanel.getFieldValue('activity_log.activity_type')) restriction += " AND activity_log.activity_type LIKE \'%" + getValidValue('activity_log.activity_type') + "%\' ";
		if (consolePanel.getFieldValue('activity_log.status')) restriction += " AND activity_log.status = \'" +	getValidValue('activity_log.status') + "\' ";	
    			
   		// project table
   		if (consolePanel.getFieldValue('project.bl_id')) restriction += " AND project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\' ";   		
   		if (consolePanel.getFieldValue('project.project_id')) restriction += " AND project.project_id LIKE \'%" + getValidValue('project.project_id') +"%\' ";    			
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
	},
	
	getConsoleRestrictionMoveOrder: function() {
		var consolePanel = View.panels.get('projProjectsMovesCalendarConsolePanel');
		var blString = "EXISTS (SELECT 1 FROM bl WHERE (bl.bl_id = mo.from_bl_id OR bl.bl_id = mo.to_bl_id) AND ";
		var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = bl.site_id AND ";

		var restriction = " mo.mo_id IS NOT NULL ";
		   			
   		// mo table
   		if (consolePanel.getFieldValue('project.project_id')) restriction += " AND mo.project_id LIKE \'%" + getValidValue('project.project_id') +"%\' "; 
		if (consolePanel.getFieldValue('project.bl_id')) {
   			restriction += " AND (mo.from_bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\' OR ";
   			restriction += " mo.to_bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\') ";
   		}   		   			
   		if (consolePanel.getFieldValue('project.dv_id')) {
   			restriction += " AND (mo.from_dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' OR ";
   			restriction += " mo.to_dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' OR ";
   			restriction += " mo.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\') ";
   		}
   		if (consolePanel.getFieldValue('project.dp_id')) {
   			restriction += " AND (mo.from_dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' OR ";
   			restriction += " mo.to_dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' OR ";
   			restriction += " mo.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\') ";
   		}
   		if (consolePanel.getFieldValue('project.apprv_mgr1')) restriction += " AND mo.apprv_mgr1 LIKE \'%" + getValidValue('project.apprv_mgr1') + "%\' ";
		if (consolePanel.getFieldValue('project.status')) restriction += " AND mo.status = \'" + getValidValue('project.status') + "\' ";
   			
   		
   		// bl
   		if (consolePanel.getFieldValue('bl.state_id')) restriction += " AND " + blString + "(bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\' OR " + siteString + " site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\'))) ";
   		if (consolePanel.getFieldValue('bl.city_id')) restriction += " AND " + blString + "(bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\' OR " + siteString + " site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\'))) ";
   		if (consolePanel.getFieldValue('bl.site_id')) restriction += " AND " + blString + "(bl.site_id LIKE \'%" + getValidValue('bl.site_id') + "%\')) ";

		return restriction;
	},
	
	getConsoleRestrictionProject: function() {
		var consolePanel = View.panels.get('projProjectsMovesCalendarConsolePanel');
		var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";

		var restriction = " project.project_type = 'Move' ";
		    			
   		// project table
   		if (consolePanel.getFieldValue('project.bl_id')) restriction += " AND project.bl_id LIKE \'%" + getValidValue('project.bl_id') + "%\' ";   		
   		if (consolePanel.getFieldValue('project.project_id')) restriction += " AND project.project_id LIKE \'%" + getValidValue('project.project_id') +"%\' ";    			
   		if (consolePanel.getFieldValue('project.dv_id')) restriction += " AND project.dv_id LIKE \'%" + getValidValue('project.dv_id') + "%\' ";
   		if (consolePanel.getFieldValue('project.dp_id')) restriction += " AND project.dp_id LIKE \'%" + getValidValue('project.dp_id') + "%\' ";
   		if (consolePanel.getFieldValue('project.apprv_mgr1')) restriction += " AND project.apprv_mgr1 LIKE \'%" + getValidValue('project.apprv_mgr1') + "%\' ";
		if (consolePanel.getFieldValue('project.status')) restriction += " AND project.status = \'" + getValidValue('project.status') + "\' ";
   			
   		
   		// bl
   		if (consolePanel.getFieldValue('bl.state_id')) restriction += " AND (bl.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\' OR " + siteString + " site.state_id LIKE \'%" + getValidValue('bl.state_id') + "%\')) ";
   		if (consolePanel.getFieldValue('bl.city_id')) restriction += " AND (bl.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\' OR " + siteString + " site.city_id LIKE \'%" + getValidValue('bl.city_id') + "%\')) ";
   		if (consolePanel.getFieldValue('bl.site_id')) restriction += " AND (bl.site_id LIKE \'%" + getValidValue('bl.site_id') + "%\' OR project.site_id LIKE \'%" + getValidValue('bl.site_id') + "%\') ";

		return restriction;
	}
 });

function onProjectIdSelval()
{
	var restriction = "project_type = 'Move' AND project.is_template = 0 ";
	var blString = "EXISTS (SELECT 1 FROM bl WHERE bl.bl_id = project.bl_id AND ";
	var siteString = "EXISTS (SELECT 1 FROM site WHERE site.site_id = project.site_id AND ";
	
	var consolePanel = View.panels.get('projProjectsMovesCalendarConsolePanel');
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
	View.selectValue('projProjectsMovesCalendarConsolePanel', title,['project.project_id'],'project',['project.project_id'],['project.project_id','project.status','project.summary'],restriction);
}

function buildSelvalRestriction(fieldName, restriction)
{
	var consolePanel = View.panels.get('projProjectsMovesCalendarConsolePanel');
	if (consolePanel.getFieldValue(fieldName))
	{
		if (restriction) restriction += " AND ";
		restriction += fieldName+" LIKE \'%"+getValidValue(fieldName)+"%\'";
	}	
	return restriction;
}

function getValidValue(inputFieldName)
{
	var consolePanel = View.panels.get('projProjectsMovesCalendarConsolePanel');
	var fieldValue = consolePanel.getFieldValue(inputFieldName);
	fieldValue = fieldValue.replace(/\'/g, "\'\'");
	return fieldValue;
}

function onCalcEndDatesForProject(project_id)
{
	/*
	 * KB 3028109 , 3029845
	 *  for items that have scheduled date in future 
	 *  end date must be update to see item on calendar
	 *  disabled check for project id
	 */
/*	if (project_id=='') {
		return false;
	}
*/
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

function selectDisplay()
{
	var consolePanel = View.panels.get('projProjectsMovesCalendarConsolePanel');
	var displayValue = $('projProjectsMovesCalendarSelectDisplay').value;
	if (displayValue == "1") {
		consolePanel.setFieldValue('project.project_id', '');
		consolePanel.enableField('project.project_id', false);
		consolePanel.setFieldValue('activity_log.activity_type', '');
		consolePanel.enableField('activity_log.activity_type', false);
		consolePanel.setFieldValue('activity_log.status', '');
		consolePanel.enableField('activity_log.status', false);
		consolePanel.enableField('project.status', true);
	}
	else if (displayValue == "2") {
		consolePanel.enableField('project.project_id', true);
		consolePanel.setFieldValue('activity_log.activity_type', '');
		consolePanel.enableField('activity_log.activity_type', false);
		consolePanel.setFieldValue('activity_log.status', '');
		consolePanel.enableField('activity_log.status', false);
		consolePanel.enableField('project.status', true);
	}
	else {
		consolePanel.enableField('project.project_id', true);
		consolePanel.enableField('activity_log.activity_type', true);
		consolePanel.setFieldValue('project.status', '');
		consolePanel.enableField('project.status', false);
		consolePanel.enableField('activity_log.status', true);
	}
}
