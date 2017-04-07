var leaseDetailController = View.createController('itemDetailCtrl',{
	itemId:null,
	loadPanel: function(){
		this.formLease.addParameter('active', getMessage('msg_active'));
		this.formLease.addParameter('inactive', getMessage('msg_inactive'));
		this.formLease.refresh({'ls.ls_id':this.itemId}, false);
		var isVATAndMCEnabled = View.activityParameters['AbCommonResources-EnableVatAndMultiCurrency'] == 1;
		if(!isVATAndMCEnabled){
			this.formLease.showField('ls.vat_exclude', false);
		}
	}
});
