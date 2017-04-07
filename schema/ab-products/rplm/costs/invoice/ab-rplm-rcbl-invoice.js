var invoiceController = View.createController('invoiceCtrl', {
	// selected invoice id
	invoice_id: null,
	
	// selected cost id's
	costIds: null,
	
	//owner type
	ownerType: null,
	
	// owner id
	ownerId: null,
	
	// invoice wizard controller
	wizardController: null,
	
	afterViewLoad: function(){
		$('labelIssue').innerHTML = getMessage('label_issue');
		this.costIds = this.view.parameters['costIds'];
		this.ownerType = this.view.parameters['ownerType'];
		this.ownerId = this.view.parameters['ownerId'];
		this.wizardController = this.view.parameters['wizardController'];
	},
	
	afterInitialDataFetch: function(){
		this.invoice_id = (this.formInvoice.newRecord?null:this.formInvoice.getFieldValue('invoice.invoice_id'));
		var objIssue = $('chkIssue');
		objIssue.checked = (this.invoice_id != null && this.formInvoice.getFieldValue('invoice.status') == 'ISSUED');
	},
	
	/**
	 * onSave event handler.
	 */
	formInvoice_onSave: function(){
		if (this.formInvoice.canSave()) {
			var issueInvoice = $('chkIssue').checked;
			var record = this.formInvoice.getOutboundRecord();
			// save invoice 
			try {
				var result = Workflow.callMethod('AbRPLMChargebackInvoice-InvoiceService-assignCosts', this.costIds, this.ownerType, this.ownerId, issueInvoice, record);
				if(result.code == 'executed'){
					var newRecord = result.dataSet;
					var invoice_id = newRecord.getValue("invoice.invoice_id");
					var controller = this;
					var msg = getMessage('msg_save_ok');
					msg = msg.replace('{0}', invoice_id);
					View.showMessage('message', msg, 
						null, // no detailed message
						null, // no data
						function() {
							controller.wizardController.applyRestriction();
							controller.view.closeThisDialog();
						});
				}
			} 
			catch (e) {
				Workflow.handleError(e);
			}
		}
	}
});
