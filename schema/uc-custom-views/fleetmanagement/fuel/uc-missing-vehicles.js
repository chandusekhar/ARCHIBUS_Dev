var cntrl = View.createController("cntrl", {
	missingVehicles_onGenerate: function(){
		var saveRecord = new Ab.data.Record();
		saveRecord.isNew = true;
		saveRecord.setValue('uc_fuel.vehicle_id', 0);
        saveRecord.setValue('uc_fuel.date_fuel', '2013-01-01');
		saveRecord.setValue('uc_fuel.time_fuel', '1899-12-30 00:00:00.000');

		this.missingVehicles.getDataSource().saveRecord(saveRecord);
		var me = this
		setTimeout(function(){me.missingVehicles.refresh();},500);
		alert("Invoices have been created/updated for records with matching vehicles") 
		
	}
	
	
});