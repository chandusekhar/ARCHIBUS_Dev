var accountsReceivableController = View.createController('accountsReceivableCtrl', {
	vpaRestriction: null,
	// if VAT and MC is enabled
	isVATAndMCEnabled: false,
	
	gridInvoiceAmounts_onRefresh: function(){
        this.gridInvoiceAmounts.refresh();
    },
    
    gridInvoiceAmountsWithVatMc_onRefresh: function(){
        this.gridInvoiceAmountsWithVatMc.refresh();
    },
    
	afterViewLoad: function(){
		this.isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		
		// get vpa restriction
		this.vpaRestriction = getVpaRestriction(this.view.user.name);
	
		var vpaBuildingRestr = "1=1";
	    
	    if(valueExists(this.vpaRestriction) && valueExists(this.vpaRestriction.string) && valueExistsNotEmpty(this.vpaRestriction.string["bl.bl_id"])){
	    	var vpaBuilding = this.vpaRestriction.string["bl.bl_id"];
	    	if(valueExistsNotEmpty(vpaBuilding)){
	    		var vpaBl = "";
				if(vpaBuilding.indexOf('AND') == 0){
					vpaBl = vpaBuilding.slice(3, vpaBuilding.length);
				}
				vpaBuildingRestr = vpaBl.replace(/bl\./g, "invoice.");
	    	}
	    }
	    if(this.isVATAndMCEnabled){
	    	this.gridInvoiceAmountsWithVatMc.addParameter("vpaRestriction", vpaBuildingRestr);
	    }else{
	    	this.gridInvoiceAmounts.addParameter("vpaRestriction", vpaBuildingRestr);
	    }
	},
	afterInitialDataFetch: function(){
		if(this.isVATAndMCEnabled){
	    	this.gridInvoiceAmountsWithVatMc.refresh();
	    }else{
	    	this.gridInvoiceAmounts.refresh();
	    }
	},
	gridInvoiceAmounts_afterRefresh: function(){
		var totalRow = document.getElementById('gridInvoiceAmounts_totals');
		if(totalRow){
			totalRow.cells[0].innerHTML = getMessage("total");
		}
	}
});

function openDetails(row){
    var contact_id = row['invoice.contact_id_send_to'];
    View.openDialog('ab-rplm-rcbl-ac-rcbl-dtls.axvw', null, false, {
			width: 800,
			height: 600,
			closeButton: true,
			afterInitialDataFetch: function(dialogView){
				var dialogController = dialogView.controllers.get('accountsReceivableDetailsCtrl');
				if (contact_id != 'Total') {
					dialogController.gridInvoiceAmountsDetails.addParameter('contact_id','invoice.contact_id_send_to = \''+ contact_id+'\'');
					if(accountsReceivableController.isVATAndMCEnabled){
						 var currency_invoice = row['invoice.currency_invoice'];
						 if(valueExistsNotEmpty(currency_invoice)){
							 dialogController.gridInvoiceAmountsDetails.addParameter('currency_invoice','invoice.currency_invoice = \''+ currency_invoice+'\'');
						 }
					}
				}
				dialogController.gridInvoiceAmountsDetails.refresh();
			}
		});
}