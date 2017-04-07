var invoiceDetailsController = View.createController('invoiceDetailsCtrl', {
    invoice_id: null,
    gridInvoices_onRefresh: function(){
        this.gridInvoices.refresh();
    }
});

function loadInvoiceDetails(row){
    var invoice_id = row['invoice.invoice_id'];
    var invoiceDtlsDetailsController = View.controllers.get('invDtlsDetailsCtrl');
	invoiceDtlsDetailsController.invoice_id = invoice_id;
	invoiceDtlsDetailsController.afterViewLoad();
	invoiceDtlsDetailsController.afterInitialDataFetch();
}
