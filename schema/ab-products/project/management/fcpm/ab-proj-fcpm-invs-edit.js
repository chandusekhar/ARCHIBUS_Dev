var projFcpmInvsEditController = View.createController('projFcpmInvsEdit', {
	project_id: '',
	taxRate: 0,
	
	afterInitialDataFetch: function() {		
		var amount_lien = replaceNullValueWithZero(this.projFcpmInvsEdit_inv.getFieldValue('invoice.amount_lien'));
		if (amount_lien == 0) $('apply_lien_holdback_no').checked = true;
		else $('apply_lien_holdback_yes').checked = true;
	},
	
	projFcpmInvsEdit_inv_afterRefresh: function() {
		var status = this.projFcpmInvsEdit_inv.getFieldValue('invoice.status');
		if (status != 'ISSUED') {
			this.projFcpmInvsEdit_inv.actions.get('save').show(false);
			this.projFcpmInvsEdit_inv.actions.get('next').show(true);
			$('apply_lien_holdback_no').disabled = true;
			$('apply_lien_holdback_yes').disabled = true;
		} else {
			this.projFcpmInvsEdit_inv.actions.get('save').show(true);
			this.projFcpmInvsEdit_inv.actions.get('next').show(false);
			$('apply_lien_holdback_no').disabled = false;
			$('apply_lien_holdback_yes').disabled = false;
		}
	},
	
	projFcpmInvsEdit_inv2_afterRefresh: function() {
		/*var default_value = getMessage('na');
		if (this.projFcpmInvsEdit_inv2.getFieldValue('invoice.fac_org_level_01') == '') this.projFcpmInvsEdit_inv2.setFieldValue('invoice.fac_org_level_01', default_value);
		if (this.projFcpmInvsEdit_inv2.getFieldValue('invoice.fac_org_level_02') == '') this.projFcpmInvsEdit_inv2.setFieldValue('invoice.fac_org_level_02', default_value);
		if (this.projFcpmInvsEdit_inv2.getFieldValue('invoice.fac_org_level_03') == '') this.projFcpmInvsEdit_inv2.setFieldValue('invoice.fac_org_level_03', default_value);
		if (this.projFcpmInvsEdit_inv2.getFieldValue('invoice.fac_org_level_04') == '') this.projFcpmInvsEdit_inv2.setFieldValue('invoice.fac_org_level_04', default_value);
		if (this.projFcpmInvsEdit_inv2.getFieldValue('invoice.fac_org_level_05') == '') this.projFcpmInvsEdit_inv2.setFieldValue('invoice.fac_org_level_05', default_value);
		if (this.projFcpmInvsEdit_inv2.getFieldValue('invoice.fac_org_level_06') == '') this.projFcpmInvsEdit_inv2.setFieldValue('invoice.fac_org_level_06', default_value);
		 */
		var status = this.projFcpmInvsEdit_inv2.getFieldValue('invoice.status');
		if (status != 'ISSUED') {
			this.enableEditButtons(false);
		}
		else {
			this.enableEditButtons(true);
		}
	},
	
	enableEditButtons: function(enable) {
		this.projFcpmInvsEdit_inv2.actions.get('save').show(enable);
		this.projFcpmInvsEdit_inv2.actions.get('approve').show(enable);
		this.projFcpmInvsEdit_inv2.actions.get('reject').show(enable);
		this.projFcpmInvsEdit_inv2.actions.get('saveDis').show(!enable);
		this.projFcpmInvsEdit_inv2.actions.get('approveDis').show(!enable);
		this.projFcpmInvsEdit_inv2.actions.get('rejectDis').show(!enable);
	},
	
	projFcpmInvsEdit_inv2_onReject: function() {
		this.projFcpmInvsEdit_inv2.clearValidationResult();
		var invoice_id = this.projFcpmInvsEdit_inv2.getFieldValue('invoice.invoice_id');
		var controller = this;
        var message = getMessage('confirmReject');
        View.confirm(message, function(button){
        	if (button == 'yes') {
        		if (!controller.projFcpmInvsEdit_inv2.canSave()) return;
	        	controller.projFcpmInvsEdit_inv2.setFieldValue('invoice.status', 'REJECTED');
	        	controller.projFcpmInvsEdit_inv2.save();
				controller.enableEditButtons(false);
				View.getOpenerView().panels.get('projFcpmInvs_invs').refresh();
        	}
        });
	},
	
	projFcpmInvsEdit_inv2_onApprove: function() {
		this.projFcpmInvsEdit_inv2.clearValidationResult();
		var invoice_id = this.projFcpmInvsEdit_inv2.getFieldValue('invoice.invoice_id');
		var controller = this;
        var message = getMessage('confirmApprove');
        View.confirm(message, function(button){
        	if (button == 'yes') {
				if (!controller.projFcpmInvsEdit_inv2.canSave()) return;
				controller.projFcpmInvsEdit_inv2.setFieldValue('invoice.status', 'SENT');
				controller.projFcpmInvsEdit_inv2.save();
				controller.enableEditButtons(false);
				View.getOpenerView().panels.get('projFcpmInvs_invs').refresh();
        	}
        });
	}
});

function onChangeApplyLien() {
	var form = View.panels.get('projFcpmInvsEdit_inv');
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
	var controller = View.controllers.get('projFcpmInvsEdit');
	var form = View.panels.get('projFcpmInvsEdit_inv');
	var lien = replaceNullValueWithZero(form.getFieldValue('invoice.amount_lien'));
	form.setFieldValue('invoice.amount_lien_tax', truncToTwoDecimals(lien * controller.taxRate / 100.00, 'invoice.amount_lien_tax'));
}

function calculateDeficiencyTax() {
	var controller = View.controllers.get('projFcpmInvsEdit');
	var form = View.panels.get('projFcpmInvsEdit_inv');
	var deficiency = replaceNullValueWithZero(form.getFieldValue('invoice.amount_deficiency'));
	form.setFieldValue('invoice.amount_deficiency_tax', truncToTwoDecimals(deficiency * controller.taxRate / 100.00, 'invoice.amount_deficiency_tax'));
}

function calculateTaxRate() {
	var controller = View.controllers.get('projFcpmInvsEdit');
	var form = View.panels.get('projFcpmInvsEdit_inv');
	var amount_billed = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed'));
	var amount_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_tax'));
	var taxRate = 0.00;
	if (amount_billed == 0) taxRate = 0.00;
	else taxRate = truncToTwoDecimals(amount_tax * 100.00/ amount_billed);
	controller.taxRate = taxRate;
}

function onUpdateSubtotal() {
	var form = View.panels.get('projFcpmInvsEdit_inv');
	var amount_billed = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed'));
	var amount_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_tax'));
	var amount_reimbursable = replaceNullValueWithZero(form.getFieldValue('invoice.amount_reimbursable'));
	var sum = parseFloat(amount_billed) + parseFloat(amount_tax) + parseFloat(amount_reimbursable);
	form.setFieldValue('invoice.amount_billed_total', truncToTwoDecimals(sum, 'invoice.amount_billed_total'));
	onUpdateAmountTotInvoice();
}

function onUpdateAmountTotInvoice() {
	var form = View.panels.get('projFcpmInvsEdit_inv');
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
	var form = View.panels.get('projFcpmInvsEdit_inv');
	var date_sent = getDateObject(form.getFieldValue('invoice.date_sent'));
	date_sent.setDate(date_sent.getDate() + 30);
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
	if (fieldName) number = View.dataSources.get('projFcpmInvsEditDs1').formatValue(fieldName, number, true);
	var symbol = View.project.budgetCurrency.symbol;
	if (number.indexOf(symbol) >= 0) 
		number = number.substring(0, number.indexOf(symbol)) + number.substring(number.indexOf(symbol)+symbol.length);
	return number;
}