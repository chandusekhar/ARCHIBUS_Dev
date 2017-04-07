var costClosedControlled = View.createController('costClosedCtrl', {
	gridInvoiceClosedInfo_onDetails: function(row){
			var invoice_id = row.getFieldValue('invoice.invoice_id');
			View.openDialog('ab-rplm-rcbl-inv-dtls-details.axvw', null, false, {
				width: 800,
				height: 600,
				closeButton: false,
				invoiceId: invoice_id
			});
	}
})