// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	showDetailsFromCalendarClick(primaryKey, View.panels.get('abBldgopsReportWrScheduleCostWrForm'));
}

View.createController('abBldgopsReportWrScheduleCostController', {
	fieldsArraysForRestriction: new Array(['wr.site_id'], ['wr.bl_id'], ['wr.fl_id'], ['wr.dv_id'], ['wr.dp_id'], ['wr.prob_type','like'], 
															['wr.supervisor'], ['wr.work_team_id'], ['wr.eq_id','like'], ['eq.eq_std', 'like']),

	afterViewLoad: function(){
        var calendarControl = new Ab.flash.Calendar(
        	'calendar',							// parent panel ID
         	"abBldgopsReportWrScheduleCostCalendarDs",								// dataSourceId 
        	"wr.wr_id", 	// primary key field
        	"wr.cost_est_total;wr.wr_id",		// summary field
        	"wr.date_assigned",		// startTime field
        	"wr.date_assigned",	// endTime field
         	true								// whether to show weekend events
        );
        this.abBldgopsReportWrScheduleCostCalendar.setContentPanel(Ext.get('calendar'));
		this.abBldgopsReportWrScheduleCostConsole_onFilter();
    },
    
    abBldgopsReportWrScheduleCostConsole_onFilter: function(){	
		var restriction = this.getConsoleRestriction();
		var calendarControl = Ab.view.View.getControl('', 'calendar');
		calendarControl.refreshData(restriction);
    },
    
	getConsoleRestriction: function() {
		var console = View.panels.get('abBldgopsReportWrScheduleCostConsole');
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		
		var selectedEL = document.getElementById("worktype");
		var workType = selectedEL.options[selectedEL.selectedIndex].value;
        if (workType == 'ondemand') {
			restriction += " AND wr.prob_type!='PREVENTIVE MAINT' ";
        }
        else  if (workType == 'pm') {
			restriction += " AND wr.prob_type='PREVENTIVE MAINT' ";
         } 
		restriction = restriction + getRestrictionStrOfDateRange( console, "wr.date_assigned");
		return restriction;
	}
 });
