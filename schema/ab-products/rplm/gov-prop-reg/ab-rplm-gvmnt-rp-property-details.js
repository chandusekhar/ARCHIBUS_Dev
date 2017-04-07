var propertyDetailsCtr = View.createController('propertyDetails',{
	uniqueId:null,
	afterInitialDataFetch: function(){
		this.uniqueId = this.view.parameters['selectedItem'];
    	this.panelTransactionInformation.addParameter('uniqueId',this.uniqueId);
		this.panelTransactionInformation.refresh({'grp.unique_identifier':this.uniqueId}, false);
		this.checkUniqueIdFromGrp.addParameter('uniqueId',this.uniqueId);
		if(this.checkUniqueIdFromGrp.getRecords().length > 0 ){
			this.panelTransactionInformation.setFieldValue('posted',getMessage('msg_yes'));
			this.panelPropertyInformationPosted.addParameter('uniqueId',this.uniqueId);
			this.panelPropertyInformationPosted.refresh();
		}else{
			this.panelTransactionInformation.setFieldValue('grp.date_last_update','');
			this.panelTransactionInformation.setFieldValue('grp.time_last_update','');
			this.panelTransactionInformation.setFieldValue('grp.last_updated_by','');
			this.panelTransactionInformation.setFieldValue('posted',getMessage('msg_no'));
			this.panelPropertyInformationUnposted.addParameter('uniqueId',this.uniqueId);
			this.panelPropertyInformationUnposted.refresh();
		}
		
    }
})