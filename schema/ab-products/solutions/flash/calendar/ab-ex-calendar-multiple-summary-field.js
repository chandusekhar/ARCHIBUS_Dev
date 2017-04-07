// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	var restriction = {
		'activity_log.activity_log_id': primaryKey
	};
	Ab.view.View.openDialog('ab-ex-calendar-activity-dialog.axvw', restriction, false, 20, 40, 800, 600);  	
}

// At startup, no event is loaded.
// The restriction on time is: select the events whose duration intersects [date_est_start, date_est_end].
// The restrictions on the other attributes are equality.

View.createController('showCalendarActivity', {
	afterViewLoad: function(){
        var calendarControl = new Ab.flash.Calendar(
        	'calendar',							// parent panel ID
         	"ds-1",								// dataSourceId 
        	"activity_log.activity_log_id", 	// primary key field
        	"activity_log.action_title;activity_log.activity_type;project.project_id;project.project_type;project.apprv_mgr1",	// summary field
        	"activity_log.date_scheduled",		// startTime field
        	"activity_log.date_scheduled_end",	// endTime field
         	false								// whether to show weekend events
        );
        this.panelHtml.setContentPanel(Ext.get('calendar'));
    },
    
    consolePanel_onFilter: function(){	
		var restriction = this.getConsoleRestriction();
		var calendarControl = Ab.view.View.getControl('', 'calendar');
		calendarControl.refreshData(restriction);
    },
    
	getConsoleRestriction: function() {
		var console = View.panels.get('consolePanel');

		var restriction = " 1=1 ";
		
    	// activity_log table
   		var activity_type = console.getFieldValue('activity_log.activity_type');
   		if (activity_type!="") restriction += " AND (activity_log.activity_type LIKE '" + activity_type + "' OR activity_log.activity_type is null) ";		
    			
   		// project table
   		var project_id = console.getFieldValue('project.project_id');
   		if (project_id!="") restriction += " AND (project.project_id LIKE '" + project_id +"' )"; 
   		
   		var project_type = console.getFieldValue('project.project_type');	
   		if (project_type!="") restriction += " AND (project.project_type LIKE '" + project_type + "' OR project.project_type is null) ";  		
   		
   		var dv_id = console.getFieldValue('project.dv_id');	
   		if (dv_id!="") restriction += " AND (project.dv_id LIKE '" + dv_id + "' OR project.dv_id is null) ";
   		
   		var dp_id = console.getFieldValue('project.dp_id');	
   		if (dp_id!="") restriction += " AND (project.dp_id LIKE '" + dp_id + "' OR project.dp_id is null) ";
   		
   		var program_id = console.getFieldValue('project.program_id');	
   		if (program_id!="") restriction += " AND (project.program_id LIKE '" + program_id + "' OR project.program_id is null) ";
   		
   		var apprv_mgr1 = console.getFieldValue('project.apprv_mgr1');	
   		if (apprv_mgr1!="") restriction += " AND (project.apprv_mgr1 LIKE '" + apprv_mgr1 + "' OR project.apprv_mgr1 is null) ";
   			
   		
   		// bl
   		var bl_id = console.getFieldValue('bl.bl_id');
   		if (bl_id!="") restriction += "  AND bl.bl_id LIKE '" + bl_id + "' OR bl.bl_id is null ";
   		
   		var state_id = console.getFieldValue('bl.state_id');
   		if (state_id!="") restriction += "  AND bl.state_id LIKE '" + state_id + "' OR bl.state_id is null ";
   		
   		var city_id = console.getFieldValue('bl.city_id');
   		if (city_id!="") restriction += "  AND bl.city_id LIKE '" + city_id + "' OR bl.city_id is null ";
   		
   		var site_id = console.getFieldValue('bl.site_id');
   		if (site_id!="") restriction += "  AND bl.site_id LIKE '" + site_id + "' OR bl.site_id is null ";

		return restriction;
	}
 });
