var invoicesController = View.createController('invoicesCtrl', {
	openerController: null,
	afterViewLoad: function(){
		this.openerController = this.view.parameters['openerController'];
	}
});

function selectInvoice(row){
	invoicesController.openerController.invoice_id = row['invoice.invoice_id'];
	invoicesController.openerController.openInvoice();
}
