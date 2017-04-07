var controller = View.createController('scenarioCtrl',{    
	afterViewLoad:function(){
		
	},
	bill_form_onNew: function(){
		var restriction = this.bill_form.restriction;
		var billType = $('bill_form_bill.bill_type_id').value;
		$('bill_line_form_bill_line.bill_type_id').value = billType;
		$('bill_line_form_bill_line.bill_type_id').disabled = true;
	},
	
	bill_form_afterRefresh: function(){
		this.bill_line_report.restriction = this.bill_form.restriction;
		this.bill_line_report.refresh();
	}
});

function rejectBill(context){
	$('bill.status').value = 'Rejected';
}


function checkServiceGap(){
	var controller = this;
	var billId = $('bill_form_bill.bill_id').value;
	var vnId = $('bill_form_bill.vn_id').value;
	var vnAcId = $('bill_form_bill.vn_ac_id').value;
	var date_service_start = $('bill_form_bill.date_service_start').value;
	if(date_service_start.length == 9 ){
		date_service_start = 0 + date_service_start;
	}
	var start_time_period = $('bill_form_bill.time_period').value;

	var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-checkServiceGap', billId, vnId, vnAcId, date_service_start, start_time_period);
	if (result.code == 'executed') {
		if(result.value == false){
			var msg = getMessage('msg_service_gap');
			View.confirm(msg, function(button) {
				if (button == 'yes') {
					controller.operDataType = 'BILL';
					return true;
					//controller.commonSave('bill_AbEnergyDefBills_ds','bill_AbEnergyDefBills');
				}
			});
		}else{
			return true;
		}
	}
}

function rollUp(){
	var billId = $('bill_line_form_bill_line.bill_id').value;
	var vnId = $('bill_line_form_bill_line.vn_id').value;
	var billLineId = $('bill_line_form_bill_line.bill_line_id').value;
	var result = Workflow.callMethod('AbRiskEnergyManagement-ProcessBills-addNewBillLineItem', billId, vnId, billLineId);
	if (result.code == 'executed' && result.value == true) {
		return true;
	}

	else{
		View.showMessage(getMessage("msg_roll_up").replace('{0}', billId));
	}
}

/**
 * Print Bill
 * Print Paginated Report of Bill and its lines
 */
 
function printBill(){
		//a paginated view name 
		var reportViewName = "ab-energy-bill-print.axvw";
		var panel = View.getControl('', 'bill_form');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('bill.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		restriction.addClause('bill.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		var anotherRestriction = new Ab.view.Restriction();
		anotherRestriction.addClause('bill_line.bill_id', panel.getFieldValue('bill.bill_id'), '=');
		anotherRestriction.addClause('bill_line.vn_id', panel.getFieldValue('bill.vn_id'), '=');
		
		//paired dataSourceId with Restriction objects
		var passedRestrictions = {'ds_bill': restriction, 'ds_bill_line': anotherRestriction};
		
		//parameters
		var parameters = null;
		
		//passing restrictions
		View.openPaginatedReportDialog(reportViewName, passedRestrictions, parameters);	
	}
	

/**
 * KB 3046102 use frames for "update" tab to enable layout usage.
 * Call function from opener window 
*/
function clearRestriction(){
	View.getOpenerWindow().clearRestriction();
}

function setRestriction(){
	View.getOpenerWindow().setRestriction();
}

function billLine_onSelectVnRateId() {
	var controller = View.controllers.get('scenarioCtrl');
	var restriction = "";
	var date_service_start = controller.bill_form.getFieldValue('bill.date_service_start');
	var date_service_end = controller.bill_form.getFieldValue('bill.date_service_end');
	var vn_id = controller.bill_form.getFieldValue('bill.vn_id');
	var vn_ac_id = controller.bill_form.getFieldValue('bill.vn_ac_id');
	if (vn_id != "")  restriction = "vn_svcs_contract.vn_id='"+ vn_id + "' AND vn_svcs_contract.vn_ac_id='"
		+ vn_ac_id + "' AND vn_svcs_contract.date_start <= ${sql.date('"+ date_service_start 
		+ "')} AND (vn_svcs_contract.date_end IS NULL OR vn_svcs_contract.date_end >= ${sql.date('"
		+ date_service_end + "')})";
	View.selectValue({
		formId: 'bill_line_form',
		title: getMessage('msg_vnRateId'),
		fieldNames: ['bill_line.vn_rate_id', 'bill_line.bill_unit_id'],
		selectTableName: 'vn_rate',
		selectFieldNames: ['vn_rate.vn_rate_id', 'vn_rate.bill_unit_id'],
		visibleFieldNames: ['vn_rate.vn_rate_id', 'vn_rate.vn_rate_desc', 'vn_rate.vn_rate_type', 'vn_rate.bill_unit_id', 'vn_svcs_contract.vn_id', 'vn_svcs_contract.vn_ac_id', 'vn_svcs_contract.date_start', 'vn_svcs_contract.date_end', 'vn_rate.months', 'vn_rate.hours', 'vn_rate.block', 'vn_rate.lower_threshold', 'vn_rate.upper_threshold', 'vn_rate.block_ref', 'vn_rate.bill_type', 'vn_rate.rollup_type'],
		actionListener: 'afterSelectVnRateId',
		restriction: restriction,
		width: 1000,
		height: 500
		}
	);
}

function afterSelectVnRateId(fieldName, selectedValue, previousValue) {
	var form = View.panels.get('bill_line_form');
	if (fieldName == "bill_line.vn_rate_id") form.setFieldValue('bill_line.vn_rate_id', selectedValue);
	else if (fieldName == "bill_line.bill_unit_id") form.setFieldValue('bill_line.bill_unit_id', selectedValue);
	return true;
}

function billLine_onSelectVnMeterId() {
	var controller = View.controllers.get('scenarioCtrl');
	var restriction = "";
	var vn_id = controller.bill_form.getFieldValue('bill.vn_id');
	var vn_ac_id = controller.bill_form.getFieldValue('bill.vn_ac_id');
	if (vn_ac_id != "")  restriction = "bill_line.vn_meter_id IS NOT NULL AND bill.vn_id = '" + vn_id + "' AND bill.vn_ac_id = '" + vn_ac_id + "'";
	View.selectValue({
		formId: 'bill_line_form',
		title: getMessage('msg_vnMeterId'),
		fieldNames: ['bill_line.vn_meter_id', 'bill_line.vn_id', 'bill_line.bill_type_id'],
		selectTableName: 'bill_line',
		selectFieldNames: ['bill_line.vn_meter_id', 'bill_line.vn_id', 'bill_line.bill_type_id'],
		visibleFieldNames: ['bill_line.vn_id', 'bill.vn_ac_id', 'bill.bl_id', 'bill_line.vn_meter_id', 'bill_line.bill_unit_id', 'bill_line.bill_type_id'],
		restriction: restriction,
		distinct: true,
		showIndex: true,
		width: 1000,
		height: 500
		}
	);
}