var costUnissuedController = View.createController('costUnissuedCtrl', {
	gridInvoiceUnissuedInfo_onIssueInvoice:function(){
		var rows = this.gridInvoiceUnissuedInfo.getSelectedRows();
		if(rows.length == 0){
			View.showMessage(getMessage('err_no_invoice_selected'));
			return false;
		}
		var invoiceIds = getValuesFromSelectedRows(this.gridInvoiceUnissuedInfo, 'invoice.invoice_id', 'integer');
		var wizardController = this.view.controllers.get('invoiceWizard');
		View.confirm(getMessage('confirm_issue'), function(button){
			if(button == 'yes'){
				try{
					Workflow.callMethod('AbRPLMChargebackInvoice-InvoiceService-issueInvoices', invoiceIds);
					wizardController.applyRestriction();
				} catch (e) {
	            	Workflow.handleError(e);
	        	}
			}
		});
	},
	
	gridInvoiceUnissuedInfo_onPreview:function(row){
		var invoice_id = row.getFieldValue('invoice.invoice_id');
		View.openDialog('ab-rplm-rcbl-inv-preview.axvw', null, false, {
			width: 800,
			height: 700,
			closeButton: true,
			invoiceId: invoice_id
		});
	}
})