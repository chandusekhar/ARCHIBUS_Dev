var vehicleGridController = View.createController('vehicleGrid', {
	afterViewLoad: function(){
       //this.ucManageParts_bottomPanel.sortEnabled = false;
	   //turn off print icon and mail icon.
		View.setToolbarButtonVisible('printButton', false);
		View.setToolbarButtonVisible('emailButton', false);
		View.setToolbarButtonVisible('alterButton', false);
		View.setToolbarButtonVisible('favoritesButton', false);
    },
	
	/* TO DO --- HIGHLIGHT BY SCHEDULE */
	vehicle_drilldown_afterRefresh: function() {
		//check each row of WR to see if there are fulfilled parts
		this.vehicle_drilldown.gridRows.each(function(row) {
			var record = row.getRecord();
			var vehicleId = row.getRecord().getValue('vehicle.vehicle_id');
			

			var changedate = false;
			var current_meter = record.getValue('vehicle.meter');
			var next_meter = record.getValue('uc_fleetmaintsched.meter_next_maint');
			
			var cell1 = row.cells.get('vehicle.vehicle_id');
			var cell2 = row.cells.get('uc_fleetmaintsched.date_next_maint');
			var cell3 = row.cells.get('uc_fleetmaintsched.meter_next_maint');
			var cell4 = row.cells.get('vehicle.meter');
			
			// HIGHLIGHT IF OVER MILEAGE
			if (next_meter != "") {
				if (current_meter-next_meter > 0) {
					//Ext.get(cell3.dom).setStyle('background-color', '#cf7d7d');		
					Ext.get(cell3.dom).setStyle('background-color', '#FFA3A3');	
					Ext.get(cell3.dom).setStyle('font-weight', 'bold');		
				}
				else if (((current_meter - next_meter) <= 0) && ((current_meter - next_meter) > -501)) {
					//Ext.get(cell3.dom).setStyle('background-color', '#cfcc7d');
					Ext.get(cell3.dom).setStyle('background-color', '#FFFFAA');
					Ext.get(cell3.dom).setStyle('font-weight', 'bold');	
				}
			} else {


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
						
					
				}
				else if (date_difference < 0 && date_difference > -15) {

					Ext.get(cell2.dom).setStyle('background-color', '#FFFFAA');
					Ext.get(cell2.dom).setStyle('font-weight', 'bold');	
				}
			} else {
				//do nothing
			};
			
			
			//Ext.get(cell1.dom).setStyle('text-decoration', 'underline');
			Ext.get(cell1.dom).setStyle('font-weight', 'bold');
			Ext.get(cell4.dom).setStyle('text-decoration', 'underline');
			//Ext.get(cell4.dom).setStyle('border-style', 'solid');
			//Ext.get(cell4.dom).setStyle('border-width', '1px');
		});  //end gridRows.each
	},
	
	odometerDetailsPanel_onOdometer_save: function() {
		//saves odometer value in the vehicle record as well as the odo.
		
		var vehicleID=this.odometerDetailsPanel.getFieldValue("uc_fleet_odo.vehicle_id");
		
		var odoRestriction = new Ab.view.Restriction();
		odoRestriction.addClause("vehicle.vehicle_id", vehicleID, "=");
		
		var dsOdo = new Ab.data.createDataSourceForFields({
		   id: 'dsOdoSave',
		   tableNames: ['vehicle'],
		   fieldNames: ['vehicle.vehicle_id', 'vehicle.meter','vehicle.date_meter_last_read']
		});
		var record = dsOdo.getRecord(odoRestriction);
		record.setValue("vehicle.meter", this.odometerDetailsPanel.getFieldValue("uc_fleet_odo.odometer"));
		record.setValue("vehicle.date_meter_last_read", this.odometerDetailsPanel.getFieldValue("uc_fleet_odo.date_odo"));
		
		
		dsOdo.saveRecord(record);
		
		this.vehicle_drilldown.refresh();
		this.vehicle_details.refresh();
		//View.closeDialog();

		
	},
	

	
	
	
});  // END GRID CONTROLLER