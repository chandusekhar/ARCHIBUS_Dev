// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	var restriction = {
		'bill_archive.bill_id': primaryKey
	};
	Ab.view.View.openDialog('ab-energy-calendar-bill-dialog.axvw', restriction, false, 20, 40, 800, 600);  	
}

// At startup, no event is loaded.
// The restriction on time is: select the events whose duration intersects [date_est_start, date_est_end].
// The restrictions on the other attributes are equality.

View.createController('showCalendarActivity', {
	afterViewLoad: function(){
        var calendarControl = new Ab.flash.Calendar(
        	'calendar',		// parent panel ID
         	"ds_calendar",			// dataSourceId 
        	"bill_archive.bill_id", 	// primary key field
        	"bill_archive.vn_id",		// summary field
        	"bill_archive.date_due",	// startTime field
        	"bill_archive.date_due",	// endTime field
         	true			// whether to show weekend events
        );
        this.panelHtml.setContentPanel(Ext.get('calendar'));
    },
    
    consolePanel_onFilter: function(){	
		var restriction = this.getConsoleRestriction();
		var calendarControl = Ab.view.View.getControl('', 'calendar');
		calendarControl.refreshData(restriction);
    },

	consolePanel_onClear: function(){
		this.consolePanel.clear();
		var restriction = this.getConsoleRestriction();
		var calendarControl = Ab.view.View.getControl('', 'calendar');
		calendarControl.refreshData(restriction);		
	},
		
	getConsoleRestriction: function() {
		var console = View.panels.get('consolePanel');

		var restriction = " 1=1 ";
		
    	// bill_archive table
   		var site_id = console.getFieldValue('bill_archive.site_id');
   		if (site_id!="") restriction += " AND (bill_archive.site_id LIKE '" + site_id + "' OR bill_archive.site_id is null) ";
   		
   		var bl_id = console.getFieldValue('bill_archive.bl_id');
   		if (bl_id!="") restriction += " AND (bl.bl_id LIKE '" + bl_id + "' OR bl.bl_id is null) ";
   		
   		var bill_type_id = console.getFieldValue('bill_archive.bill_type_id');
   		if (bill_type_id!="") restriction += " AND (bill_archive.bill_type_id LIKE '" + bill_type_id + "' OR bill_archive.bill_type_id is null) ";		
		
		var vn_id = console.getFieldValue('bill_archive.vn_id');
   		if (vn_id!="") restriction += " AND (bill_archive.vn_id LIKE '" + vn_id + "' OR bill_archive.vn_id is null) ";
		
		var vn_ac_id = console.getFieldValue('bill_archive.vn_ac_id');
   		if (vn_ac_id!="") restriction += " AND (bill_archive.vn_ac_id LIKE '" + vn_ac_id + "' OR bill_archive.vn_ac_id is null) ";		
		
		var bill_id = console.getFieldValue('bill_archive.bill_id');
   		if (bill_id!="") restriction += " AND (bill_archive.bill_id LIKE '" + bill_id + "' OR bill_archive.bill_id is null) ";		
    			
	// bl table
   		var ctry_id = console.getFieldValue('bl.ctry_id');
   		if (ctry_id!="") restriction += " AND (bl.ctry_id LIKE '" + ctry_id + "' OR bl.ctry_id is null) ";

   		var regn_id = console.getFieldValue('bl.regn_id');
   		if (regn_id!="") restriction += " AND (bl.regn_id LIKE '" + regn_id + "' OR bl.regn_id is null) ";
   				
   		var state_id = console.getFieldValue('bl.state_id');
   		if (state_id!="") restriction += " AND (bl.state_id LIKE '" + state_id + "' OR bl.state_id is null) ";
   		
   		var city_id = console.getFieldValue('bl.city_id');
   		if (city_id!="") restriction += " AND (bl.city_id LIKE '" + city_id + "' OR bl.city_id is null) ";

		return restriction;
	}
 });
