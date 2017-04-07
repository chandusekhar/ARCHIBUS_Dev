function openDetails(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);	
	var vn_id = rowRestriction['vn.vn_id'];
	vn_id = escape(vn_id);
	vn_id = vn_id.replace(/\+/g, '%2B');
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	detailsFrame.location.href = "brg-proj-review-vendors-invoices-and-payments-details.axvw?handler=com.archibus.config.Find&vn.vn_id="+vn_id;
}

function openDetailsMC(context)
{
	var rowRestriction = this.grid.getPrimaryKeysForRow(this);	
	var invoice_id = rowRestriction['invoice.invoice_id'];
	invoice_id = escape(invoice_id);
	invoice_id = invoice_id.replace(/\+/g, '%2B');
	var detailsFrame = getFrameObject(parent,'detailsFrame');
	detailsFrame.location.href = "brg-proj-review-vendors-invoices-and-payments-details.axvw?handler=com.archibus.config.Find&invoice.invoice_id="+invoice_id;
}

function clearConsole() {
	var consolePanel = AFM.view.View.getControl('consoleFrame','consolePanel');
	if (consolePanel) consolePanel.clear();
}