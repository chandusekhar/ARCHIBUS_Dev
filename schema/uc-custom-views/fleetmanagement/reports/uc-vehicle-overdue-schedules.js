var vehicleScheduleController = View.createController("vehicleScheduleController", {

	//highlight
	schedulegrid_afterRefresh: function() {
		//check each row of WR to see if there are fulfilled parts
		this.schedulegrid.gridRows.each(function(row) {
		
			var record = row.getRecord();
			var vehicleId = row.getRecord().getValue('uc_fleetmaintsched.vehicle_id');
			
			var changedate = false;
			var current_meter = record.getValue('vehicle.meter');
			var next_meter = record.getValue('uc_fleetmaintsched.meter_next_maint');
			
			var cell1 = row.cells.get('uc_fleetmaintsched.vehicle_id');
			var cell2 = row.cells.get('uc_fleetmaintsched.date_next_maint');
			var cell2_diff = row.cells.get('uc_fleetmaintsched.date_diff');
			var cell3 = row.cells.get('uc_fleetmaintsched.meter_next_maint');
			var cell3_diff = row.cells.get('uc_fleetmaintsched.meter_diff');
			var cell4 = row.cells.get('vehicle.meter');
			
			// HIGHLIGHT IF OVER MILEAGE
			if (next_meter != "") {
				if (current_meter-next_meter > 0) {
					
					//var difference=current_meter-next_meter;
					//alert(current meter + "-" + next_meter);
					//Ext.get(cell3.dom).setStyle('background-color', '#cf7d7d');		
					Ext.get(cell3.dom).setStyle('background-color', '#FFA3A3');	
					Ext.get(cell3.dom).setStyle('font-weight', 'bold');		
					Ext.get(cell3_diff.dom).setStyle('background-color', '#FFA3A3');	
					Ext.get(cell3_diff.dom).setStyle('font-weight', 'bold');	
				}
				else if (((current_meter - next_meter) <= 0) && ((current_meter - next_meter) > -501)) {
					//Ext.get(cell3.dom).setStyle('background-color', '#cfcc7d');
					Ext.get(cell3.dom).setStyle('background-color', '#FFFFAA');
					Ext.get(cell3.dom).setStyle('font-weight', 'bold');	
					Ext.get(cell3_diff.dom).setStyle('background-color', '#FFFFAA');
					Ext.get(cell3_diff.dom).setStyle('font-weight', 'bold');
				}
			};
				
			// HIGHLIGHT IF OVER DATE
			var currentTime = new Date();
			var next_date = record.getValue('uc_fleetmaintsched.date_next_maint');
			//get difference in days
			var date_difference = (currentTime - next_date)/(1000*60*60*24);
		
			if (next_date != "") {
				if (date_difference > 0) {

					Ext.get(cell2.dom).setStyle('background-color', '#FFA3A3');	
					Ext.get(cell2.dom).setStyle('font-weight', 'bold');	
					Ext.get(cell2_diff.dom).setStyle('background-color', '#FFA3A3');	
					Ext.get(cell2_diff.dom).setStyle('font-weight', 'bold');	
					
				}
				else if (date_difference < 0 && date_difference > -30) {

					Ext.get(cell2.dom).setStyle('background-color', '#FFFFAA');
					Ext.get(cell2.dom).setStyle('font-weight', 'bold');	
					Ext.get(cell2_diff.dom).setStyle('background-color', '#FFFFAA');
					Ext.get(cell2_diff.dom).setStyle('font-weight', 'bold');	
				}
			} else {
				//do nothing
			};
			
			
			//Ext.get(cell1.dom).setStyle('text-decoration', 'underline');
			Ext.get(cell1.dom).setStyle('font-weight', 'bold');
			//Ext.get(cell4.dom).setStyle('border-style', 'solid');
			//Ext.get(cell4.dom).setStyle('border-width', '1px');
		});  //end gridRows.each
	},











	schedulegrid_onScheduleButton: function(row, action) {
		this.schedule_date_popup.setFieldValue('uc_fleetmaintsched.status', "Sch");
		
	},
	
	
	schedulegrid_onCreateWRButton: function(row, action) {
		var rowDS = row.getRecord();
		var description = UC.Data.getDataValue("pmp", "description", "pmp_id='" + rowDS.getValue('uc_fleetmaintsched.pmp_id') + "'");

		View.openDialog('uc-vehicle-create-pm-request.axvw', '', true, 
			{
				width: 900,
				height: 450,
				afterViewLoad: function(dialogView) {
				
					
					var createWRController = dialogView.controllers.get('createWRController');
					
					var createPanel=createWRController.wr_create_details;
					createWRController.wr_create_details.setFieldValue('activity_log.description', 'abc');
					
					createWRController.wr_create_details.setFieldValue('activity_log.eq_id', rowDS.getValue('vehicle.eq_id'));
					createWRController.wr_create_details.setFieldValue('activity_log.dv_id', rowDS.getValue('vehicle.dv_id'));
					createWRController.wr_create_details.setFieldValue('activity_log.dp_id', rowDS.getValue('vehicle.dp_id'));
					createWRController.wr_create_details.setFieldValue('activity_log.description', description);
					createWRController.wr_create_details.setFieldValue('activity_log.pmp_id', rowDS.getValue('uc_fleetmaintsched.pmp_id'));
					createWRController.wr_create_details.setFieldValue('date_assigned', formatDate(rowDS.getValue('uc_fleetmaintsched.date_scheduled')));
					
					createWRController.wr_create_details.setFieldValue('activity_log.ac_id', rowDS.getValue('vehicle.ac_id'));
					createWRController.wr_create_details.setFieldValue('activity_log.budget_owner', rowDS.getValue('vehicle.budget_owner'));
					
					createWRController.wr_create_details.setFieldValue('maint_id', rowDS.getValue('uc_fleetmaintsched.maint_id'));
					
				}
			}
		);

	},
});


function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}