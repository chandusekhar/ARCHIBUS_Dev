// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	var detailPanel = View.panels.get('abBldgopsReportReservedPtForm');
	detailPanel.addParameter("pkId", primaryKey)
	detailPanel.refresh();
	detailPanel.show(true);
	detailPanel.showInWindow({
		width: 600,
		height: 400
	});
}

View.createController('abBldgopsReportReservedPtController', {
	fieldsArraysForRestriction: new Array(['wr.site_id',,'wrpt.site_id'], ['wr.bl_id',,'wrpt.bl_id'], ['wr.fl_id',,'wrpt.fl_id'], ['wr.dv_id',,'wrpt.dv_id'], ['wr.dp_id',,'wrpt.dp_id'], ['wr.prob_type', 'like','wrpt.prob_type'], 
															['wr.supervisor',,'wrpt.supervisor'], ['wr.work_team_id',,'wrpt.work_team_id'], ['wr.eq_id','like','wrpt.eq_id'], ['eq.eq_std', 'like','wrpt.eq_std']
	                                                        , ['wrpt.part_id', 'like','wrpt.part_id'], ['wrpt.pt_store_loc_id',,'wrpt.pt_store_loc_id'] ),

	afterViewLoad: function(){
        var calendarControl = new Ab.flash.Calendar(
        	'calendar',							// parent panel ID
         	"abBldgopsReportReservedPtCalendarDS",								// dataSourceId 
        	"wrpt.pk_id", 	// primary key field
        	"wrpt.wr_id;wrpt.part_id;wrpt.qty_estimated",		// summary field
        	"wrpt.date_assigned",		// startTime field
        	"wrpt.date_assigned",	// endTime field
         	true								// whether to show weekend events
        );
        this.abBldgopsReportReservedPtCalendar.setContentPanel(Ext.get('calendar'));
		calendarControl.refreshData();
    },
    
    abBldgopsReportReservedPtConsole_onFilter:function(){
    	if(!this.checkFilterValidation()){
    		return;
    	}
		var restriction = this.getConsoleRestriction();
		var calendarControl = Ab.view.View.getControl('', 'calendar');
		calendarControl.refreshData(restriction);
    },
    
    checkFilterValidation: function(){
    	if (compareLocalizedDates(this.abBldgopsReportReservedPtConsole.getFieldElement('wrpt.date_assigned.to').value, this.abBldgopsReportReservedPtConsole.getFieldElement('wrpt.date_assigned.from').value)) {
            View.showMessage(getMessage('error_date_range'));
            return false;
        }
    	
    	return true;
    },
    
	getConsoleRestriction: function() {
		var console = View.panels.get('abBldgopsReportReservedPtConsole');
		var restriction = getRestrictionStrFromConsole(console, this.fieldsArraysForRestriction);		

		var selectedEL = document.getElementById("worktype");
		var workType = selectedEL.options[selectedEL.selectedIndex].value;
        if (workType == 'ondemand') {
			restriction += " AND wrpt.prob_type!='PREVENTIVE MAINT' ";
        }
        else  if (workType == 'pm') {
			restriction += " AND wrpt.prob_type='PREVENTIVE MAINT' ";
         } 

		restriction = restriction + getRestrictionStrOfDateRange( console, "wrpt.date_assigned");
		return restriction;
	}
 });
