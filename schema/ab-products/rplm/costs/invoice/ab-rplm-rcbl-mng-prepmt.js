var mngPrepaymentsController = View.createController('mngPrepaymentsCtrl',{
	payment_id: null,
	afterViewLoad: function(){
		this.formPaymentDtl.newRecord = true;
	},
	gridPayments_onRefresh: function(){
		this.gridPayments.refresh();
	},
	gridPayments_onNew: function(){
		this.payment_id = null;
		this.formPaymentDtl.refresh({}, true);
	},
	formPaymentDtl_onSave: function(){
		if (View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1 && !valueExistsNotEmpty(this.formPaymentDtl.getFieldValue('invoice_payment.currency_invoice'))) {
			View.showMessage(getMessage('errNoCurrency'));
			return false;
		}
		
		this.formPaymentDtl.save();
		this.gridPayments_onRefresh();
	},
	formPaymentDtl_refresh: function(){
		var restriction = new Ab.view.Restriction();
		if(this.payment_id !=  null){
			restriction.addClause('invoice_payment.payment_id', this.payment_id, '=');
		}
		this.formPaymentDtl.refresh(restriction, this.payment_id == null);
	},
	formPaymentDtl_onDelete: function(){
		if(this.payment_id == null){
			return;
		}
		var controller = this;
		View.confirm(getMessage('confirm_delete'), function(button){
			if(button == 'yes'){
				controller.dsPaymentDtl.deleteRecord(controller.formPaymentDtl.getRecord());
				controller.payment_id = null;
				controller.formPaymentDtl_refresh();
				controller.gridPayments.refresh();
			}
		});
	},
	formPaymentDtl_onCancel: function(){
		this.formPaymentDtl_refresh();
	}
});

function showDetails(row){
	mngPrepaymentsController.payment_id = row['invoice_payment.payment_id'];
	mngPrepaymentsController.formPaymentDtl_refresh();
}
