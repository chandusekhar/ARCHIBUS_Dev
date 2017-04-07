var ucVehiclePartsPulledCtrl = View.createController('ucVehiclePartsPulledCtrl', {
	onFulfilledClicked: function (row) {
		var ds = View.dataSources.get(this.grid.dataSourceId);
		var record = row.row.getRecord();

		record.setValue("wrpt.fulfilled", 1);

		ds.saveRecord(record);
		this.grid.refresh();
	}
});
