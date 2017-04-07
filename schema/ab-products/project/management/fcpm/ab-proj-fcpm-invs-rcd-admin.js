var projFcpmInvsRcdController = View.createController('projFcpmInvsRcd', {
	project_id: '',
	taxRate: 0,
	
	afterViewLoad: function() {
		$('apply_lien_holdback_no').checked = true;
	},
	
	projFcpmInvsRcd_inv_afterRefresh: function() {
		var status = this.projFcpmInvsRcd_inv.getFieldValue('invoice.status');
		if (status != 'ISSUED') {
			this.projFcpmInvsRcd_inv.actions.get('save').show(false);
			this.projFcpmInvsRcd_inv.actions.get('saveDis').show(true);
			$('apply_lien_holdback_no').disabled = true;
			$('apply_lien_holdback_yes').disabled = true;
		} else {
			this.projFcpmInvsRcd_inv.actions.get('save').show(true);
			this.projFcpmInvsRcd_inv.actions.get('saveDis').show(false);
			$('apply_lien_holdback_no').disabled = false;
			$('apply_lien_holdback_yes').disabled = false;
		}
	}
});

function onChangeApplyLien() {
	var form = View.panels.get('projFcpmInvsRcd_inv');
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
	var form = View.panels.get('projFcpmInvsRcd_inv');
	var lien = replaceNullValueWithZero(form.getFieldValue('invoice.amount_lien'));
	form.setFieldValue('invoice.amount_lien_tax', truncToTwoDecimals(lien * this.taxRate / 100.00, 'invoice.amount_lien_tax'));
}

function calculateDeficiencyTax() {
	var form = View.panels.get('projFcpmInvsRcd_inv');
	var deficiency = replaceNullValueWithZero(form.getFieldValue('invoice.amount_deficiency'));
	form.setFieldValue('invoice.amount_deficiency_tax', truncToTwoDecimals(deficiency * this.taxRate / 100.00, 'invoice.amount_deficiency_tax'));
}

function calculateTaxRate() {
	var form = View.panels.get('projFcpmInvsRcd_inv');
	var amount_billed = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed'));
	var amount_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_tax'));
	var taxRate = 0.00;
	if (amount_billed == 0) taxRate = 0.00;
	else taxRate = truncToTwoDecimals(amount_tax * 100.00/ amount_billed);
	form.setFieldValue('invoice.tax_rate', taxRate);
	this.taxRate = taxRate;
}

function onUpdateSubtotal() {
	var form = View.panels.get('projFcpmInvsRcd_inv');
	var amount_billed = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed'));
	var amount_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_tax'));
	var amount_reimbursable = replaceNullValueWithZero(form.getFieldValue('invoice.amount_reimbursable'));
	var sum = parseFloat(amount_billed) + parseFloat(amount_tax) + parseFloat(amount_reimbursable);
	form.setFieldValue('invoice.amount_billed_total', truncToTwoDecimals(sum, 'invoice.amount_billed_total'));
	onUpdateAmountTotInvoice();
}

function onUpdateAmountTotInvoice() {
	var form = View.panels.get('projFcpmInvsRcd_inv');
	var amount_lien = replaceNullValueWithZero(form.getFieldValue('invoice.amount_lien'));
	var amount_lien_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_lien_tax'));
	var amount_deficiency = replaceNullValueWithZero(form.getFieldValue('invoice.amount_deficiency'));
	var amount_deficiency_tax = replaceNullValueWithZero(form.getFieldValue('invoice.amount_deficiency_tax'));
	var sum = parseFloat(amount_lien) + parseFloat(amount_lien_tax) + parseFloat(amount_deficiency) + parseFloat(amount_deficiency_tax);
	var amount_billed_total = replaceNullValueWithZero(form.getFieldValue('invoice.amount_billed_total'));
	form.setFieldValue('invoice.amount_tot_invoice', truncToTwoDecimals(amount_billed_total - sum, 'invoice.amount_tot_invoice'));
}

function replaceNullValueWithZero(value) {
	return value? value : 0.00;
}

function setDateDue() {
	var form = View.panels.get('projFcpmInvsRcd_inv');
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
	if (fieldName) number = View.dataSources.get('projFcpmInvsRcdDs1').formatValue(fieldName, number, true);
	var symbol = View.project.budgetCurrency.symbol;
	if (number.indexOf(symbol) >= 0) 
		number = number.substring(0, number.indexOf(symbol)) + number.substring(number.indexOf(symbol)+symbol.length);
	return number;
}
