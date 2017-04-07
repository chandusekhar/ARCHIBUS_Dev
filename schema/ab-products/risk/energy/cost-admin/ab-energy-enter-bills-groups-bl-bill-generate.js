
var gridController = View.createController('gridController', {
	
	// Ab.grid.Row reference for selected row
	selectedRow: null,
	billId: null,
	
	afterViewLoad: function(){
		var res = this.view.restriction;
		var newRes = new Ab.view.Restriction();
		newRes.addClause("bill_proration_group.vn_id",res.findClause('bill_proration_group.vn_id').value);
		newRes.addClause("bill_proration_group.vn_ac_id",res.findClause('bill_proration_group.vn_ac_id').value);
		this.billId = res.findClause('bill_proration_group.bill_id').value;
//		if(valueExistsNotEmpty(newRes)){
//			this.billManual_grid.refresh(newRes);
//		}
	},

    afterInitialDataFetch: function() {
        this.inherit();
    },

    /**
     * Show hidden form panel in dialog window to let the user edit the room area.
     * @param {Object} row
     */    
    billManual_grid_onClickItem: function(row) {
		this.selectedRow = row;
		
		// we need cell coordinates to show the dialog at the same location
		var cell = row.cells.get(3).getEl();

		var record = row.getRecord();
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill_proration_group.bl_id', record.getValue('bill_proration_group.bl_id'));
		this.billManual_form.refresh(restriction);
        this.billManual_form.showInWindow({
			width: 400,
            closeButton: false,
            title: 'Edit Bill'
        });
    },
	
    /**
     * User confirms the Edit Room Area dialog.
     */
    billManual_form_onOK: function() {
		var amountIncome = this.billManual_form.getFieldValue('bill_proration_group.amount_income');
		var amountExpense = this.billManual_form.getFieldValue('bill_proration_group.amount_expense');
		var qtyEnergy = this.billManual_form.getFieldValue('bill_proration_group.qty_energy');
		var qtyPower = this.billManual_form.getFieldValue('bill_proration_group.qty_power');
		var qtyVolume = this.billManual_form.getFieldValue('bill_proration_group.qty_volume');
		
		this.setRowValue(this.selectedRow, 'bill_proration_group.amount_income', amountIncome, 1);
		this.setRowValue(this.selectedRow, 'bill_proration_group.amount_expense', amountExpense, 2);
		this.setRowValue(this.selectedRow, 'bill_proration_group.qty_energy', qtyEnergy, 3);
		this.setRowValue(this.selectedRow, 'bill_proration_group.qty_power', qtyPower, 4);
		this.setRowValue(this.selectedRow, 'bill_proration_group.qty_volume', qtyVolume, 5);

		this.billManual_form.closeWindow();
	},

    /**
     * User cancels the Edit Room Area dialog.
     */
	billManual_form_onCancel: function() {
        this.billManual_form.closeWindow();
    },

    /**
     * This function is invoked when the user clicks on the Save All button.
     */
    billManual_grid_onSaveAll: function() {
    	var changedRecords = [];
    	var newRecords =[];
    	var dataSource = this.bill_ds;
    	this.billManual_grid.gridRows.each(function(row) {
        	if (row.updatedRecord != null) {
        		var record = row.updatedRecord;
        		changedRecords.push(record);
        		var rec = new Ab.data.Record();
    			rec.isNew = true;
    			rec.setValue("bill.bl_id",record.getValue("bill_proration_group.bl_id"));
    			rec.setValue("bill.bill_id",this.billId);
    			rec.setValue("bill.amount_expense",record.getValue("bill_proration_group.amount_expense"));
    			rec.setValue("bill.amount_income",record.getValue("bill_proration_group.amount_income"));
    			rec.setValue("bill.qty_energy",record.getValue("bill_proration_group.qty_energy"));
    			rec.setValue("bill.qty_power",record.getValue("bill_proration_group.qty_power"));
    			rec.setValue("bill.qty_volume",record.getValue("bill_proration_group.qty_volume"));
    			rec = dataSource.processOutboundRecord(rec);
    			newRecords.push(rec);
        	}
    	});
    	if (changedRecords.length > 0) {
    		try {
    			 var dataSet = new Ab.data.DataSetList();
    	            dataSet.addRecords(newRecords);
    			var result = Workflow.callMethod('AbRiskEnergyManagement-ProrateAggregateBillsService-prorateBillsToBildingsManual', this.billId, dataSet);
    			if (result.value == false){
    				View.showMessage(getMessage("checkTotals"));
    			}else{
    			View.getOpenerView().showMessage(getMessage("prorationComplete"));
    	    	this.billManual_grid.gridRows.each(function(row) {
    	        	if (row.updatedRecord != null) {
    	                // clear cell background
    	                row.cells.get(3).dom.style.backgroundColor = '';
    	                row.cells.get(4).dom.style.backgroundColor = '';
    	        	}
    	    	});
    	    	View.getOpenerView().controllers.get('ctrlAbEnergyBillsGroups').bill_AbEnergyDefBills.show(false);
    	    	View.closeThisDialog();
    			}
    	        
    		} catch (e) {
    			Workflow.handleError(e);
    			View.getOpenerView().controllers.get('ctrlAbEnergyBillsGroups').bill_AbEnergyDefBills.show(false);
    	    	View.closeThisDialog();
    		}
    	}
    },
	
	setRowValue: function(row, fieldName, fieldValue, updateCellIndex) {
        // get the current record and update its value
		var record = row.updatedRecord;
		if (!valueExists(record)) {
			record = row.getRecord();
		}
        record.setValue(fieldName, fieldValue);
        
        // store the updated record in the Ab.grid.Row object for pending Save
        row.updatedRecord = record;
        
        // update visible text
        row.cells.get(updateCellIndex).dom.firstChild.innerHTML = fieldValue;
        
        // change cell background to indicate changed values
        row.cells.get(updateCellIndex).dom.style.backgroundColor = '#E0E0FF';
	}
});

