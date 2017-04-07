var abRiskEnergyBillArchiveEditController = View.createController('abRiskEnergyBillArchiveEditController',
{	
	abRiskEnergyBillArchiveEditSelBillArchiveRpt_onEdit : function(row){
		var message = getMessage("confirmUnArchive");
		View.confirm(message, function(button){
			if (button == 'yes') {
				try{				
					var billId = row.getFieldValue('bill_archive.bill_id');
					var vnId = row.getFieldValue('bill_archive.vn_id');
					var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-unArchiveBill', billId, vnId);
					if (result.code == 'executed' && result.value == true) {
						var editTab = View.panels.get('tabsFrame');
						var restriction = new Ab.view.Restriction();						
						restriction.addClause('bill.bill_id', row.getFieldValue('bill_archive.bill_id'),'=');
						restriction.addClause('bill.vn_id', row.getFieldValue('bill_archive.vn_id'),'=');												
						editTab.selectTab('update', restriction);
						editTab.refreshTab('select');
						return true;
					}
					else{
						View.showMessage(getMessage("msg_unArchive").replace('{0}', billId));
					}
				}catch(e){
					Workflow.handleError(e);
				}
			}
		});
	}
});


/**
 * Un-Archive Multiple Bills
 * Return bill and bill line records from archive to main edit tables to allow users to correct values.
 * @returns {Boolean}
 */
function unArchiveMultiple(){	
	var selectedRows = abRiskEnergyBillArchiveEditController.abRiskEnergyBillArchiveEditSelBillArchiveRpt.getSelectedRows();	
	if (selectedRows.length > 0) {
		var message = getMessage("confirmUnArchive");
		View.confirm(message, function(button){
			if (button == 'yes') {
				try{	
					var success = true;
					// loop through all selected msds records and assign each to selected locations
					for (var r = 0; r < selectedRows.length; r++) {
						var billId = selectedRows[r]['bill_archive.bill_id'];
						var vnId = selectedRows[r]['bill_archive.vn_id'];
						var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-unArchiveBill', billId, vnId);
						if (result.code != 'executed' || result.value == false) {
							success = false;
							View.showMessage(getMessage("msg_unArchive").replace('{0}', billId));
						}
					}
					if (success){
						var selectionGrid = View.panels.get('abRiskEnergyBillArchiveEditSelBillArchiveRpt');
						var tabs = View.panels.get('tabsFrame');
						
						selectionGrid.refresh();
						tabs.refreshTab('select');
						return true;
					}
				}catch(e){
					Workflow.handleError(e);
				}
			}
			else {				
				return false;
			}		
		});
	}
	else {
		View.showMessage(getMessage('noRecordSelected'));
	}
}


function setRestriction(){
    var console = View.getControl('', "bill_archive_upd_sel_bill_console");
    
    // get the date range values in ISO format
    var dateDueFrom = console.getFieldValue('bill_archive.date_due.from');
    var dateDueTo = console.getFieldValue('bill_archive.date_due.to');
    var dateIssuedFrom = console.getFieldValue('bill_archive.date_issued.from');
    var dateIssuedTo = console.getFieldValue('bill_archive.date_issued.to');    
    
    // validate the date range 
    if (dateDueFrom != '' && dateDueTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (!compareLocalizedDates($('bill_archive.date_due.from').value, $('bill_archive.date_due.to').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }
    
    // validate the date range 
    if (dateIssuedFrom != '' && dateIssuedTo != '') {
        // the compareLocalizedDates() function expects formatted (displayed) date values
        if (!compareLocalizedDates($('bill_archive.date_issued.from').value, $('bill_archive.date_issued.to').value)) {
            // display the error message defined in AXVW as message element
            View.showMessage(getMessage('errorDateRange'));
            return;
        }
    }    
    
    var billFrom = console.getFieldValue('bill_archive.bill_id.from');
    var billTo = console.getFieldValue('bill_archive.bill_id.to');
    
    // prepare the grid report restriction from the console values
    var restriction = new Ab.view.Restriction(console.getFieldValues());
    
    if ($("bill_archive.bill_type_id").value == "") {
        restriction.removeClause('bill_archive.bill_type_id');
    }
    if (dateDueFrom != '') {
        restriction.removeClause('bill_archive.date_due.from');
        restriction.addClause('bill_archive.date_due', dateDueFrom, '&gt;=');
    }
    if (dateDueTo != '') {
        restriction.removeClause('bill_archive.date_due.to');
        restriction.addClause('bill_archive.date_due', dateDueTo, '&lt;=');
    }
    if (dateIssuedFrom != '') {
        restriction.removeClause('bill_archive.date_issued.from');
        restriction.addClause('bill_archive.date_issued', dateIssuedFrom, '&gt;=');
    }
    if (dateIssuedTo != '') {
        restriction.removeClause('bill_archive.date_issued.to');
        restriction.addClause('bill_archive.date_issued', dateIssuedFrom, '&lt;=');
    }    
    if (billFrom != '') {
        restriction.removeClause('bill_archive.bill_id.from');
        restriction.addClause('bill_archive.bill_id', billFrom, '&gt;=');
    }
    if (billTo != '') {
        restriction.removeClause('bill_archive.bill_id.to');
        restriction.addClause('bill_archive.bill_id', billTo, '&lt;=');
    }
    var panelBillArchive = View.getControl('', 'abRiskEnergyBillArchiveEditSelBillArchiveRpt');
    panelBillArchive.refresh(restriction);
}

/**
 * Clears previously created restriction.
 */
/*function clearRestriction(){
    var console = View.getControl('', "bill_archive_upd_sel_bill_console");
    console.setFieldValue("bill_archive.date_due.from", "");
    console.setFieldValue("bill_archive.date_due.to", "");
    console.setFieldValue("bill_archive.date_issued.from", "");
    console.setFieldValue("bill_archive.date_issued.to", "");    
    console.setFieldValue("bill_archive.bill_id.from", "");
    console.setFieldValue("bill_archive.bill_id.to", "");
    console.setFieldValue("bill_archive.bl_id", "");
    console.setFieldValue("bill_archive.bill_type_id", "");
    console.setFieldValue("bill_archive.vn_id", "");
}*/
function clearRestriction(){
    var console = View.getControl('', "bill_archive_upd_sel_bill_console");
    console.clear();
}


function audit(context){
	var restriction = context.restriction;
	var billId = restriction['bill_archive.bill_id'];
	var vnId = restriction['bill_archive.vn_id'];
	
	try{ 
		var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-calculateVarianceValues', billId, vnId);
		
	} catch (e){
		Workflow.handleError(e);
		return false;

	}	
	
}
