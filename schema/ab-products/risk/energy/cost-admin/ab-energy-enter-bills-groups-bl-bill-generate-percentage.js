
var gridPercentageController = View.createController('gridPercentageController', {
	
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
        var div = this.billManual_grid.rows.length;
        this.billManual_grid.gridRows.each(function(row) {
        	View.controllers.get('gridPercentageController').setRowValue(row,"bill_proration_group.percentage",(100/div).toFixed(2),1);
        });
    },

    /**
     * Show hidden form panel in dialog window to let the user edit the room area.
     * @param {Object} row
     */    
    billManual_grid_onClickItem: function(row) {
		this.selectedRow = row;
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
		var percent = this.billManual_form.getFieldValue('bill_proration_group.percentage');
		
		this.setRowValue(this.selectedRow, 'bill_proration_group.percentage', percent, 1);

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
    			rec.setValue("bill.amount_expense",record.getValue("bill_proration_group.percentage")/100);
    			rec = dataSource.processOutboundRecord(rec);
    			newRecords.push(rec);
        	}
    	});
    	if (changedRecords.length > 0) {
    		try {
    			 var dataSet = new Ab.data.DataSetList();
    	            dataSet.addRecords(newRecords);
    			var result = Workflow.callMethod('AbRiskEnergyManagement-ProrateAggregateBillsService-prorateBillsToBildingsByPercentage', this.billId, dataSet);
    			if (result.value == false){
    				View.showMessage(getMessage("checkTotals"));
    			}else{
    				View.getOpenerView().controllers.get('ctrlAbEnergyBillsGroups').bill_AbEnergyDefBills.show(false);
    				View.getOpenerView().showMessage(getMessage("prorationComplete"));
    		    	View.closeThisDialog();
    			}
    	    	this.billManual_grid.gridRows.each(function(row) {
    	        	if (row.updatedRecord != null) {
    	                // clear cell background
    	                row.cells.get(1).dom.style.backgroundColor = '';
    	        	}
    	    	});
    	        
    		} catch (e) {
    			Workflow.handleError(e);
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
        
	}
});

