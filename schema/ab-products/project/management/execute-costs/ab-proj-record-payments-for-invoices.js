var projRecordPaymentsForInvoicesController = View.createController('projRecordPaymentsForInvoices', {
	projRecordPaymentsForInvoicesForm_onSave : function() {
		this.projRecordPaymentsForInvoicesForm.save();
		this.applyPaymentToVendorInvoice();
	},
	
	projRecordPaymentsForInvoicesForm_onDelete : function() {
		var controller = this;
		View.confirm(getMessage('confirmDelete'), function(button) {
		    if (button == 'yes') {
		    	controller.projRecordPaymentsForInvoicesForm.deleteRecord();
				controller.applyPaymentToVendorInvoice();
		    }
		});
	},
	
	applyPaymentToVendorInvoice : function() {
		var invoice_id = this.projRecordPaymentsForInvoicesForm.getFieldValue('invoice_payment.invoice_id');
		var parameters = {'invoice.invoice_id':invoice_id};
		var result = Workflow.callMethodWithParameters('AbProjectManagement-ProjectManagementService-applyPaymentToVendorInvoice', parameters);
		if (result.code == 'executed') {
			this.projRecordPaymentsForInvoicesGridPayments.refresh();
			this.projRecordPaymentsForInvoicesGridInvoices.refresh();
			this.projRecordPaymentsForInvoicesColumnReportInvoice.refresh();
			opener.View.closeDialog();	
	  	} 
	  	else 
	  	{
	    	View.showMessage(result.code + " :: " + result.message);
	  	}
	}
});