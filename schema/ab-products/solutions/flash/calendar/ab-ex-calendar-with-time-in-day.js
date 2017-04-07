// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	alert("The clicked work request has wr_id=" + primaryKey);	
}

// At startup, no event is loaded.
View.createController('showCalendarActivity', {
	afterViewLoad: function(){
        var calendarControl = new Ab.flash.Calendar(
        	'calendar',							// parent panel ID
         	"ds-1",								// dataSourceId 
        	"wr.wr_id", 						// primary key field
        	"wr.description",					// summary field
        	"wr.date_assigned;wr.time_assigned",		// startTime field
        	"wr.date_requested;wr.time_requested",		// endTime field
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
				
  		var requestor = console.getFieldValue('wr.requestor');
 		if (requestor!="") restriction += " AND (wr.requestor LIKE '" + requestor + "')";

 		return restriction;	
	}
 });
