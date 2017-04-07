// this is called by the SWF control if an event is clicked
function calendarItemClick_JS(primaryKey) {
	var rest = "wr_id = "+primaryKey+"";
	//var vehicle_id = UC.Data.getDataValue('uc_fleetmaintsched', 'vehicle_id', rest);
	//var wr_id = UC.Data.getDataValue('uc_fleetmaintsched', 'wr_id', rest);
	
	var wr_id=primaryKey;

	var restriction = {
		'wr.wr_id': wr_id
	};
	
	
	var detailsAxvw = "uc-wr-vehicle-mechanic-details.axvw?wrId="+wr_id;
	View.openDialog(detailsAxvw, null, false, {
            width: 1024,
			height: 768
        }
    );
	
	/*
	
	Ab.view.View.openDialog(
		'uc-vehicle-management-details.axvw', restriction, false, {
		maximize:true,
		closeButton:true,
		afterViewLoad: function(dialogView) {
			//automatically go to the schedules tab
			var vehicleInfoController = dialogView.controllers.get('vehicleBasicController');
			vehicleInfoController.vehicleManagementTabs.selectTab('scheduleTab');
		},
	});  

		*/
}

function calendarCreateNewItem_JS(fromDate,fromTime,toDate,toTime){
	/*
	var restriction = {
			'uc_fleetmaintsched.date_scheduled' : fromDate
	}
	Ab.view.View.openDialog('ab-ex-calendar-activity-dialog.axvw', restriction, true, 20, 40, 800, 600);	
	*/
}

function calendarUpdateItem_JS(id,fromDate,fromTime,toDate,toTime){
	var dataSource = View.dataSources.get('ds12'); 
	var record = dataSource.getRecord("wr.wr_id = " + id);
	record.setValue("wr.date_assigned",fromDate);
	dataSource.saveRecord(record);
}

// At startup, no event is loaded.
// The restriction on time is: select the events whose duration intersects [date_est_start, date_est_end].
// The restrictions on the other attributes are equality.

var calendarActivityController = View.createController('showCalendarActivity', {
	afterViewLoad: function(){
        var calendarControl = new Ab.flash.Calendar(
        	'calendar',							// parent panel ID
         	"ds13",								// dataSourceId 
        	"wr.wr_id", 	// primary key field
        	"vehicle.vehicle_id;wr.status;vehicle.mfr_id;vehicle.model_id;vehicle.model_year;",		// summary field
        	"wr.date_assigned",		// startTime field
        	"wr.date_assigned",	// endTime field
         	false,								// whether to show weekend events
			null,			//no additional parameters
			true			//readOnly
			
        );
        this.panelHtml.setContentPanel(Ext.get('calendar'));
    },
    
    consolePanel_onFilter: function(){	

		var restriction = this.getConsoleRestriction();
		var calendarControl = Ab.view.View.getControl('', 'calendar');
		calendarControl.refreshData(restriction);

    },
    
	
	/*
	getConsoleRestriction: function() {
		var console = View.panels.get('consolePanel');
		var restriction = " 1=1 ";
		
   		var vehicle_id = console.getFieldValue('uc_fleetmaintsched.vehicle_id');
   		if (vehicle_id != "") restriction += " AND (uc_fleetmaintsched.vehicle_id LIKE '" + vehicle_id +"' )"; 
		var status = console.getFieldValue('uc_fleetmaintsched.status');
   		if (status!="") restriction += " AND (uc_fleetmaintsched.status LIKE '" + status +"' )"; 
   		
	

		return restriction;
		
	} */
 });
