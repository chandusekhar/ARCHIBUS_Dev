var projMngInvEditController = View.createController('projMngInvEdit', {
	project_id: '',
	taxRate: 0,
	openedAsReadOnlyInv: true,
	
	afterViewLoad: function() {
		this.projMngInvEditTabs.showTab('projMngInvEditTab4', false);
	},
	
	afterInitialDataFetch: function() {	
		var amount_lien = replaceNullValueWithZero(this.projMngInvEdit_inv.getFieldValue('invoice.amount_lien'));
		if (amount_lien == 0) $('apply_lien_holdback_no').checked = true;
		else $('apply_lien_holdback_yes').checked = true;
		
		var clause = this.projMngInvEdit_inv.restriction.findClause('work_pkgs.work_pkg_id');
		if (clause && this.projMngInvEdit_inv.newRecord) {
			var records = this.projMngInvEditDs3.getRecords(this.projMngInvEdit_inv.restriction);
			if (records.length > 0) {
				this.projMngInvEdit_inv.setFieldValue('invoice.vn_id', records[0].getValue('work_pkg_bids.vn_id'));
			}
		}
		
		var status = this.projMngInvEdit_inv.getFieldValue('invoice.status');
		if (this.projMngInvEdit_inv.newRecord || status == 'ISSUED') this.openedAsReadOnlyInv = false;
		else {
			this.projMngInvEditTabs.showTab('projMngInvEditTab2', false);
		}
		if (status == 'REJECTED') this.projMngInvEditTabs.showTab('projMngInvEditTab3', false);
	},
	
	projMngInvEdit_inv_afterRefresh: function() {
		var status = this.projMngInvEdit_inv.getFieldValue('invoice.status');
		if (status != 'ISSUED') {
			$('apply_lien_holdback_no').disabled = true;
			$('apply_lien_holdback_yes').disabled = true;
		} else {
			$('apply_lien_holdback_no').disabled = false;
			$('apply_lien_holdback_yes').disabled = false;
		}
	},
	
	projMngInvEdit_inv2_afterRefresh: function() {
		var status = this.projMngInvEdit_inv2.getFieldValue('invoice.status');
		if (status != 'ISSUED') {
			this.enableEditButtons(false);
		}
		else {
			this.enableEditButtons(true);
		}
	},
	
	enableEditButtons: function(enable) {
		this.projMngInvEdit_inv2.actions.get('save').show(enable);
		this.projMngInvEdit_inv2.actions.get('approve').show(enable);
		this.projMngInvEdit_inv2.actions.get('reject').show(enable);
		this.projMngInvEdit_inv2.actions.get('saveDis').show(!enable);
		this.projMngInvEdit_inv2.actions.get('approveDis').show(!enable);
		this.projMngInvEdit_inv2.actions.get('rejectDis').show(!enable);
		
		this.projMngInvEdit_inv2.enableField('invoice.doc', enable);
		this.projMngInvEdit_inv2.enableField('invoice.description', enable);
	},
	
	projMngInvEdit_inv_onNext: function() {
		if (this.openedAsReadOnlyInv) this.projMngInvEditTabs.selectTab('projMngInvEditTab3', this.projMngInvEdit_inv.restriction);
		else this.projMngInvEditTabs.selectTab('projMngInvEditTab2', this.projMngInvEdit_inv.restriction);
	},
	
	projMngInvEdit_pmts_onPrevious: function() {
		if (this.openedAsReadOnlyInv) this.projMngInvEditTabs.selectTab('projMngInvEditTab1', this.projMngInvEdit_pmts.restriction);
		else this.projMngInvEditTabs.selectTab('projMngInvEditTab2', this.projMngInvEdit_pmts.restriction);
	},
	
	projMngInvEdit_inv2_onReject: function() {
		this.projMngInvEdit_inv2.clearValidationResult();
		var invoice_id = this.projMngInvEdit_inv2.getFieldValue('invoice.invoice_id');
		var controller = this;
        var message = getMessage('confirmReject');
        View.confirm(message, function(button){
        	if (button == 'yes') {
        		if (!controller.projMngInvEdit_inv2.canSave()) return;
	        	controller.projMngInvEdit_inv2.setFieldValue('invoice.status', 'REJECTED');
	        	controller.projMngInvEdit_inv2.save();
	        	controller.enableEditButtons(false);
	        	if(View.parameters.callback){
	        		View.parameters.callback();
	        	}
        	}
        });
	},
	
	projMngInvEdit_inv2_onApprove: function() {
		this.projMngInvEdit_inv2.clearValidationResult();
		var invoice_id = this.projMngInvEdit_inv2.getFieldValue('invoice.invoice_id');
		var controller = this;
        var message = getMessage('confirmApprove');
        View.confirm(message, function(button){
        	if (button == 'yes') {
				if (!controller.projMngInvEdit_inv2.canSave()) return;
				controller.projMngInvEdit_inv2.setFieldValue('invoice.status', 'SENT');
				controller.projMngInvEdit_inv2.save();
				controller.enableEditButtons(false);
				controller.projMngInvEdit_inv2.actions.get('next').show(true);
				if(View.parameters.callback){
					View.parameters.callback();
				}
        	}
        });
	},
	
	projMngInvEdit_pmts_afterRefresh: function() {
		var invoice_id = this.projMngInvEdit_pmts.restriction['invoice.invoice_id'];
		var status = this.projMngInvEditDs1.getRecord(this.projMngInvEdit_pmts.restriction).getValue('invoice.status');
		if (status == 'CLOSED') this.projMngInvEdit_pmts.actions.get('addPayment').show(false);
		else this.projMngInvEdit_pmts.actions.get('addPayment').show(true);
	},
	
	projMngInvEdit_pmt_onSave : function() {
		this.projMngInvEdit_pmt.clearValidationResult();
		var amount_expense = this.projMngInvEdit_pmt.getFieldValue('invoice_payment.amount_expense');
		if (amount_expense == 0) {
			this.projMngInvEdit_pmt.addInvalidField('invoice_payment.amount_expense', '');
			this.projMngInvEdit_pmt.displayValidationResult('');
			View.showMessage(getMessage('enterAmountExpense'));
			return;
		}
		if (!this.projMngInvEdit_pmt.save()) return;
		this.applyPaymentToVendorInvoice();
	},
	
	applyPaymentToVendorInvoice : function() {
		var invoice_id = this.projMngInvEdit_pmt.getFieldValue('invoice_payment.invoice_id');
		var parameters = {'invoice.invoice_id':invoice_id};
		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-applyPaymentToVendorInvoice', parameters);
		if (result.code == 'executed') {
			if(View.parameters.callback){
				View.parameters.callback();
			}
	  	} 
	  	else 
	  	{
	    	View.showMessage(result.code + " :: " + result.message);
	  	}
	}
});

function onChangeApplyLien() {
	var form = View.panels.get('projMngInvEdit_inv');
	if ($('apply_lien_holdback_yes').checked) {
		var amount_billed_total = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed_total'));
		form.setFieldValue('invoice.amount_lien', truncToTwoDecimals(amount_billed_total * 0.1, 'invoice.amount_lien'));
		calculateLienTax();
	}
	else {
		form.setFieldValue('invoice.amount_lien', truncToTwoDecimals(0.00, 'invoice.amount_lien'));
		calculateLienTax();
	}
	onUpdateAmountTotInvoice();
}

function calculateLienTax() {
	var controller = View.controllers.get('projMngInvEdit');
	var form = View.panels.get('projMngInvEdit_inv');
	var lien = replaceNullValueWithZero(form.getFieldValue('invoice.amount_lien'));
	form.setFieldValue('invoice.amount_lien_tax', truncToTwoDecimals(lien * controller.taxRate / 100.00, 'invoice.amount_lien_tax'));
}

function calculateDeficiencyTax() {
	var controller = View.controllers.get('projMngInvEdit');
	var form = View.panels.get('projMngInvEdit_inv');
	var deficiency = replaceNullValueWithZero(form.getFieldValue('invoice.amount_deficiency'));
	form.setFieldValue('invoice.amount_deficiency_tax', truncToTwoDecimals(deficiency * controller.taxRate / 100.00, 'invoice.amount_deficiency_tax'));
}

function calculateTaxRate() {
	var controller = View.controllers.get('projMngInvEdit');
	var form = View.panels.get('projMngInvEdit_inv');
	var amount_billed = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed'));
	var amount_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_tax'));
	var taxRate = 0.00;
	if (amount_billed == 0) taxRate = 0.00;
	else taxRate = truncToTwoDecimals(amount_tax * 100.00/ amount_billed);
	controller.taxRate = taxRate;
}

function onUpdateSubtotal() {
	var form = View.panels.get('projMngInvEdit_inv');
	var amount_billed = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed'));
	var amount_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_tax'));
	var amount_reimbursable = replaceNullValueWithZero(form.getFieldValue('invoice.amount_reimbursable'));
	var sum = parseFloat(amount_billed) + parseFloat(amount_tax) + parseFloat(amount_reimbursable);
	form.setFieldValue('invoice.amount_billed_total', truncToTwoDecimals(sum, 'invoice.amount_billed_total'));
	onUpdateAmountTotInvoice();
}

function onUpdateAmountTotInvoice() {
	var form = View.panels.get('projMngInvEdit_inv');
	var amount_lien = replaceNullValueWithZero(form.getFieldValue('invoice.amount_lien'));
	var amount_lien_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_lien_tax'));
	var amount_deficiency = replaceNullValueWithZero(form.getFieldValue('invoice.amount_deficiency'));
	var amount_deficiency_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_deficiency_tax'));
	var sum = parseFloat(amount_lien) + parseFloat(amount_lien_tax) + parseFloat(amount_deficiency) + parseFloat(amount_deficiency_tax);
	var amount_billed_total = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed_total'));
	form.setFieldValue('invoice.amount_tot_invoice', truncToTwoDecimals(amount_billed_total - sum, 'invoice.amount_tot_invoice'));
}

function replaceNullValueWithZero(value) {
	return value? value : 0;
}

function setDateDue() {
	var form = View.panels.get('projMngInvEdit_inv');
	var terms = form.getFieldValue('invoice.terms');
	var days = 30;
	switch(terms){
		case "COD":
			days = 0;
			break;
		case "15 DAYS":
			days = 15;
			break;
		case "45 DAYS":
			days = 45;
			break;
		case "60 DAYS":
			days = 60;
			break;
	}
	var date_sent = getDateObject(form.getFieldValue('invoice.date_sent'));
	date_sent.setDate(date_sent.getDate() + days);
	isoDate = FormattingDate(date_sent.getDate(), date_sent.getMonth() + 1, date_sent.getFullYear(), "YYYY-MM-DD");
	form.setFieldValue('invoice.date_expected_rec', isoDate);
}

function getDateObject(ISODate)
{
	var tempArray = ISODate.split('-');
	return new Date(tempArray[0],tempArray[1]-1,tempArray[2]);
}

function truncToTwoDecimals(number, fieldName) {
	number = parseFloat(number);
	number = number.toFixed(2);
	if (fieldName) number = View.dataSources.get('projMngInvEditDs1').formatValue(fieldName, number, true);
	var symbol = View.project.budgetCurrency.symbol;
	if (number.indexOf(symbol) >= 0) 
		number = number.substring(0, number.indexOf(symbol)) + number.substring(number.indexOf(symbol)+symbol.length);
	return number;
}

function refreshOpener() {
	if(View.parameters.callback){
		View.parameters.callback();
	}
}