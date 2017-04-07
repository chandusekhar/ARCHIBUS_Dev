var occupancyAreaController = View.createController('occupancyAreaController', {
	billId: null,
	action: null,
	qtyEnergyReal: [],
	afterViewLoad: function(){
		var res = this.view.restriction;
		var newRes = new Ab.view.Restriction();
		newRes.addClause("bill_proration_group.vn_id",res.findClause('bill_proration_group.vn_id').value);
		newRes.addClause("bill_proration_group.vn_ac_id",res.findClause('bill_proration_group.vn_ac_id').value);
		this.billId = res.findClause('bill_proration_group.bill_id').value;
		this.action = res.findClause('bill_proration_group.action').value;
		this.bill_grid.restriction = newRes;
//		if(valueExistsNotEmpty(newRes)){
//			this.bill_grid.refresh(newRes);
//		}
		if(this.action ==2){
			View.panels.get("bill_grid").removeColumn(2);
		}else{
			View.panels.get("bill_grid").removeColumn(1);
		}
	},
	
	afterInitialDataFetch: function(){
		var totalOccupancy = 0;
		var occupancy = 0;
		var area = 0;
		var totalArea = 0;
		var amountIncome, amountExpense, qtyEnergy, qtyPower, qtyVolume,vfQtyEnergy;
		this.bill_grid.gridRows.each(function(row) {
			var record = row.getRecord();
			totalOccupancy = totalOccupancy + parseInt(record.getValue("bl.count_occup"));
			totalArea = totalArea + parseInt(record.getValue("bl.area_usable"));
		});
		var res = new Ab.view.Restriction();
		res.addClause("bill.bill_id",this.billId);
		var billRecord = this.bill_ds.getRecord(res);
		amountIncome = parseFloat(billRecord.getValue('bill.amount_income'));
		amountExpense = parseFloat(billRecord.getValue('bill.amount_expense'));
		qtyEnergy = parseFloat(billRecord.getValue('bill.qty_energy'));
		vfQtyEnergy = parseFloat(billRecord.getValue('bill.vf_qty_energy'));
		qtyPower = parseFloat(billRecord.getValue('bill.qty_power'));
		qtyVolume = parseFloat(billRecord.getValue('bill.qty_volume'));
		this.qtyEnergyReal = [];
		if(this.action ==2){
			this.bill_grid.gridRows.each(function(row) {
				var record = row.getRecord();	
				occupancy = parseInt(record.getValue("bl.count_occup"));
				View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.amount_income', amountIncome/totalOccupancy*occupancy, 2);
				View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.amount_expense', amountExpense/totalOccupancy*occupancy, 3);
				View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.vf_qty_energy', vfQtyEnergy/totalOccupancy*occupancy, 4);
				View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.qty_power', qtyPower/totalOccupancy*occupancy, 5);
				View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.qty_volume', qtyVolume/totalOccupancy*occupancy, 6);
				View.controllers.get('occupancyAreaController').qtyEnergyReal.push(qtyEnergy/totalOccupancy*occupancy);
			});
		}else if(this.action ==3){
			this.bill_grid.gridRows.each(function(row) {
			var record = row.getRecord();	
			area = parseInt(record.getValue("bl.area_usable"));
			View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.amount_income', amountIncome/totalArea*area, 2);
			View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.amount_expense', amountExpense/totalArea*area, 3);
			View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.vf_qty_energy', vfQtyEnergy/totalArea*area, 4);
			View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.qty_power', qtyPower/totalArea*area, 5);
			View.controllers.get('occupancyAreaController').setRowValue(row, 'bill_proration_group.qty_volume', qtyVolume/totalArea*area, 6);
			View.controllers.get('occupancyAreaController').qtyEnergyReal.push(qtyEnergy/totalArea*area);
			});
		}
	},
	
	 /**
     * This function is invoked when the user clicks on the Save All button.
     */
	bill_grid_onSaveAll: function() {
    	var newRecords =[];
    	var dataSource = this.bill_ds;
    	this.bill_grid.gridRows.each(function(row) {
        		var record = row.updatedRecord;
        		var rec = new Ab.data.Record();
    			rec.isNew = true;
    			rec.setValue("bill.bl_id",record.getValue("bill_proration_group.bl_id"));
    			rec.setValue("bill.bill_id",this.billId);
    			rec.setValue("bill.amount_expense",record.getValue("bill_proration_group.amount_expense"));
    			rec.setValue("bill.amount_income",record.getValue("bill_proration_group.amount_income"));
    			rec.setValue("bill.qty_energy",View.controllers.get('occupancyAreaController').qtyEnergyReal[row.getIndex()]);
    			rec.setValue("bill.qty_power",record.getValue("bill_proration_group.qty_power"));
    			rec.setValue("bill.qty_volume",record.getValue("bill_proration_group.qty_volume"));
    			rec = dataSource.processOutboundRecord(rec);
    			newRecords.push(rec);
    	});
    		try {
    			 var dataSet = new Ab.data.DataSetList();
    	         dataSet.addRecords(newRecords);
    			 Workflow.callMethod('AbRiskEnergyManagement-ProrateAggregateBillsService-prorateBillsToBildingsByOccupancyOrArea', this.billId, dataSet);    
    			} catch (e) {
    			Workflow.handleError(e);
    			}
    			View.getOpenerView().showMessage(getMessage("prorationComplete"));
    			View.getOpenerView().controllers.get('ctrlAbEnergyBillsGroups').bill_AbEnergyDefBills.show(false);
    			View.closeThisDialog();	
    },
	
	setRowValue: function(row, fieldName, fieldValue, updateCellIndex) {
		var record = row.updatedRecord;
		if (!valueExists(record)) {
			record = row.getRecord();
		}
        record.setValue(fieldName, fieldValue);
        row.updatedRecord = record;
        row.cells.get(updateCellIndex).dom.innerHTML = fieldValue.toFixed(2);
	}
	
});