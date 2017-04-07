var costIssuedController = View.createController('costIssuedCtrl', {

	row: null,
	
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
	// paginated report view name
	viewNamePgrp: null,
	
	afterInitialDataFetch: function(){
		// check if multi currency is enabled
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		if(this.isVATAndMCEnabled){
			this.viewNamePgrp = "ab-rplm-rcbl-inv-mc-pgrp.axvw";
		}else{
			this.viewNamePgrp = "ab-rplm-rcbl-inv-pgrp.axvw";
		}
		this.gridInvoiceIssuedInfo.enableSelectAll(false);
	},
	
	/*
	 * Multiple selection onclick  handler 
	 */
	gridInvoiceIssuedInfo_multipleSelectionColumn_onClick: function(row){
		var selected = row.isSelected();
		this.row = (row.isSelected()?row:null);
		this.gridInvoiceIssuedInfo.setAllRowsSelected(false);
		row.select(selected);
	},
	
	/*
	 * Print All event handler
	 */
	gridInvoiceIssuedInfo_onPrintAll:function(){
		var invoice_ids = [];
		this.gridInvoiceIssuedInfo.gridRows.each(function(row){
			invoice_ids.push(row.getFieldValue('invoice.invoice_id'));
		});
		if(invoice_ids.length == 0){
			View.showMessage(getMessage('msg_no_invoices'));
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('invoice.invoice_id', invoice_ids, 'IN');
		View.openPaginatedReportDialog(this.viewNamePgrp,{'dsInvoicePreview_parent':restriction}, {'total_costs_for_invoice':"'"+getMessage('tot_cost_inv')+"'"});
	},
	
	/*
	 * Print invoice event handler
	 */
	gridInvoiceIssuedInfo_onPrint:function(){
		var invoice_id = this.getInvoiceId();
		if(!valueExistsNotEmpty(invoice_id)){
			return;
		}
		var restriction = new Ab.view.Restriction();
		restriction.addClause('invoice.invoice_id', invoice_id,'=');
		View.openPaginatedReportDialog(this.viewNamePgrp,{'dsInvoicePreview_parent':restriction}, {'total_costs_for_invoice':"'"+getMessage('tot_cost_inv')+"'"});
	},
	
	/*
	 * Invoice details event handler
	 */
	gridInvoiceIssuedInfo_onDetail:function(){
		var invoice_id = this.getInvoiceId();
		if(!valueExistsNotEmpty(invoice_id)){
			return;
		}
		View.openDialog('ab-rplm-rcbl-inv-dtls-details.axvw', null, false, {
			width: 800,
			height: 800,
			closeButton: true,
			invoiceId: invoice_id
		});
	},
	
	/*
	 * Apply payment event handler.
	 */
	gridInvoiceIssuedInfo_onApplyPayment:function(){
		var invoice_id = this.getInvoiceId();
		if(!valueExistsNotEmpty(invoice_id)){
			return;
		}
		View.openDialog('ab-rplm-rcbl-payment.axvw', null, false,{
			width: 800,
			height: 400,
			closeButton: false,
			invoice_id: invoice_id,
			wizardController: this.view.controllers.get('invoiceWizard')
		});
	},
	
	/*
	 * Apply prepayment event handler.
	 */
	gridInvoiceIssuedInfo_onApplyPrepayment:function(){
		/*
		 * 04/20/2010 IOAN KB 3027095
		 * If there are not prepayments from selected contact 
		 * issue an error message
		 */

		var invoice_id = this.getInvoiceId();
		if(!valueExistsNotEmpty(invoice_id)){
			return;
		}
		var contact_id = this.row.getFieldValue('invoice.contact_id_send_to');
		var restriction = new Ab.view.Restriction();
		restriction.addClause('invoice_payment.contact_id', contact_id, '=');
		restriction.addClause('invoice_payment.invoice_id', '', 'IS NULL');
		if(this.isVATAndMCEnabled){
			var currencyCode = this.row.getFieldValue('invoice.currency_invoice');
			if(valueExistsNotEmpty(currencyCode)){
				restriction.addClause('invoice_payment.currency_invoice', currencyCode, '=');
			}
		}
		
		var ds = View.dataSources.get('dsInvoiceIssuedPrepayments');
		var records = ds.getRecords(restriction);

		if(typeof(records) ==  "object" && records.length && records.length > 0){
			View.openDialog('ab-rplm-rcbl-prepayment.axvw', null, false,{
				width: 850,
				height: 600,
				closeButton: false,
				invoice_id: invoice_id,
				wizardController: this.view.controllers.get('invoiceWizard')
			});
		}else{
			View.showMessage(getMessage("error_no_prepayment"));
			return;
		}
	},
	
	getInvoiceId : function() {
		if (this.row == null) {
			View.showMessage(getMessage('msg_no_invoice'));
			return;
		}
		var invoice_id = this.row.getFieldValue('invoice.invoice_id');
		return invoice_id;
	},
	
	/*
	 * Add prepayment event handler.
	 */
	gridInvoiceIssuedInfo_onAddPrepayment:function(){
		View.openDialog('ab-rplm-rcbl-create-prepayment.axvw', null, false,{
			width: 800,
			height: 400,
			closeButton: false,
			wizardController: this.view.controllers.get('invoiceWizard')
		});
	}	
})