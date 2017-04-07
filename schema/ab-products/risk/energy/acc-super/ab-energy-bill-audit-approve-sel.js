var energyBillAuditApproveSelController = View.createController('energyBillAuditApproveSel',{
	restriction: "",
	
	afterInitialDataFetch: function() {
		this.bill_report_onRefresh();
	},
	
	bill_report_onRefresh: function() {		
		var grid = this.bill_report;
		var controller = this;
		var restriction = this.restriction;
		if (restriction != "") restriction = toJSON(restriction);
		try { 
			var jobId = Workflow.startJob('AbRiskEnergyManagement-BillMeterReconciliationService-getBillDiscrepancyRecordsForGrid', '', '', restriction);
				
			View.openJobProgressBar(getMessage('retrievingData'), jobId, '', function(status) {
				if (valueExists(status.dataSet.records)) {
					var records = status.dataSet.records;
					if (records.length > 0) {
						grid.setRecords(records, status.dataSet.hasMoreRecords);
						grid.show(true);
						grid.removeSorting();
					} else grid.refresh("1=2");
				} 
			});
		} catch (e) {
		    Workflow.handleError(e);
		}
	},
    
	bill_report_afterRefresh: function() {
    	var controller = View.controllers.get('energyBillVsMeterCommon');    	
    	this.bill_report.gridRows.each(function (row) {
    		var record = row.getRecord(); 
    		var verifyIcon = row.actions.get('verifyIcon');
    		var max_discrepancy = record.getValue('bill.max_discrepancy');
    		
    		if (!max_discrepancy) {
    			verifyIcon.show(false);
    			return;
    		}
    		max_discrepancy = Number(record.getValue('bill.max_discrepancy'));
    		
			if (max_discrepancy >= controller.report_limit_high_crit || max_discrepancy <= controller.report_limit_low_crit) {		  
				verifyIcon.show(true);
			}
			else if (max_discrepancy >= controller.report_limit_high_warn || max_discrepancy <= controller.report_limit_low_warn) {
				verifyIcon.show(true);
			}
			else {
				verifyIcon.show(false);
			}
    	});
    },
    
    bill_report_onVerifyAction: function(row) {
    	var record = row.getRecord();
    	var vn_id = record.getValue('bill.vn_id');
    	var bill_id = record.getValue('bill.bill_id');
    	try{ 
    		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-calculateVarianceValues', bill_id, vn_id);
    		
    	} catch (e){
    		Workflow.handleError(e);
    		return false;

    	}	
    	var restriction = new Ab.view.Restriction();
    	restriction.addClause('bill.vn_id', vn_id);
    	restriction.addClause('bill.bill_id', bill_id);
    	View.openDialog('ab-energy-bill-vs-meter.axvw', restriction, false, {width: 1100, maximize: true, closeButton: true});
    },
    
    bill_report_onVerifyIcon: function(row) {
    	this.bill_report_onVerifyAction(row);
    }
    
});

function setRestriction(){
    var console = View.getControl('', "bill_upd_sel_bill_console");
    
    // get the date range values in ISO format
    var dateDueFrom = console.getFieldValue('bill.date_due.from');
    var dateDueTo = console.getFieldValue('bill.date_due.to');
    var dateIssuedFrom = console.getFieldValue('bill.date_issued.from');
    var dateIssuedTo = console.getFieldValue('bill.date_issued.to');    
    
    // validate the date range 
    if (dateDueFrom != '' && dateDueTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (!compareLocalizedDates($('bill.date_due.from').value, $('bill.date_due.to').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }
    
    // validate the date range 
    if (dateIssuedFrom != '' && dateIssuedTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (!compareLocalizedDates($('bill.date_issued.from').value, $('bill.date_issued.to').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }    
    
    var billFrom = console.getFieldValue('bill.bill_id.from');
    var billTo = console.getFieldValue('bill.bill_id.to');
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction(console.getFieldValues());
    
    if ($("bill.bill_type_id").value == "") {
        restriction.removeClause('bill.bill_type_id');
    }
    if (dateDueFrom != '') {
        restriction.removeClause('bill.date_due.from');
        restriction.addClause('bill.date_due', dateDueFrom, '&gt;=');
    }
    if (dateDueTo != '') {
        restriction.removeClause('bill.date_due.to');
        restriction.addClause('bill.date_due', dateDueTo, '&lt;=');
    }
    if (dateIssuedFrom != '') {
        restriction.removeClause('bill.date_issued.from');
        restriction.addClause('bill.date_issued', dateIssuedFrom, '&gt;=');
    }
    if (dateIssuedTo != '') {
        restriction.removeClause('bill.date_issued.to');
        restriction.addClause('bill.date_issued', dateIssuedTo, '&lt;=');
    }    
    if (billFrom != '') {
        restriction.removeClause('bill.bill_id.from');
        restriction.addClause('bill.bill_id', billFrom, '&gt;=');
    }
    if (billTo != '') {
        restriction.removeClause('bill.bill_id.to');
        restriction.addClause('bill.bill_id', billTo, '&lt;=');
    }
    View.controllers.get('energyBillAuditApproveSel').restriction = restriction;
    View.controllers.get('energyBillAuditApproveSel').bill_report_onRefresh();
}

/**
 * Clears previously created restriction.
 */
/*function clearRestriction(){
    var console = View.getControl('', "bill_upd_sel_bill_console");
    console.setFieldValue("bill.date_due.from", "");
    console.setFieldValue("bill.date_due.to", "");
    console.setFieldValue("bill.date_issued.from", "");
    console.setFieldValue("bill.date_issued.to", "");    
    console.setFieldValue("bill.bill_id.from", "");
    console.setFieldValue("bill.bill_id.to", "");
    console.setFieldValue("bill.bl_id", "");
    console.setFieldValue("bill.bill_type_id", "");
    console.setFieldValue("bill.vn_id", "");
}*/
function clearRestriction(){
    var console = View.getControl('', "bill_upd_sel_bill_console");
    console.clear();
    View.controllers.get('energyBillAuditApproveSel').restriction = "";
    View.controllers.get('energyBillAuditApproveSel').bill_report_onRefresh();
}


function audit(context){
	var restriction = context.restriction;
	var billId = restriction['bill.bill_id'];
	var vnId = restriction['bill.vn_id'];
	
	try{ 
		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-calculateVarianceValues', billId, vnId);
		
	} catch (e){
		Workflow.handleError(e);
		return false;

	}	
	
}

function approveArchive() {
	var grid = View.getControl('', "bill_report");
	var selectedRecords = grid.getSelectedRecords();
	var recordsIds =[];
	var recordsVnIds =[];
	
	if (selectedRecords == 0) {
		View.showMessage(getMessage('noRecordSelected'));
		return;
	}
	else{
		for (var i = 0; i < selectedRecords.length; i++) {
			var record = selectedRecords[i].values;
	    	var id = record['bill.bill_id'];
	    	var vnId = record['bill.vn_id'];
	    	var dateSvcStart = record['bill.date_service_start'];
			dateSvcStart = dateSvcStart.format("m/d/y");
			recordsIds.push(id);
	    	recordsVnIds.push(vnId);
		}
		try{
			var jobId = Workflow.startJob('AbRiskEnergyManagement-ProcessBills-approveArchiveBills', recordsIds, recordsVnIds);
			View.openJobProgressBar(getMessage('approveArchiveData'), jobId,'', function (status) {
				setRestriction();
			});
		}catch (e){
			Workflow.handleError(e);
			return;
		}
		
	}
}
